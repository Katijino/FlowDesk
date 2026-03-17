import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

async function mockSendSms(phone: string, message: string): Promise<void> {
  console.log(`[SMS] To: ${phone}`)
  console.log(`[SMS] Message: ${message}`)
}

Deno.serve(async (_req) => {
  try {
    // Fetch pending messages due to be sent
    const { data: queue, error: queueError } = await supabase
      .from('message_queue')
      .select(`
        id,
        phone,
        template_type,
        appointment_id,
        appointments (
          customer_name,
          appointment_time,
          business_profiles (
            business_name
          )
        )
      `)
      .eq('status', 'pending')
      .lte('send_time', new Date().toISOString())

    if (queueError) throw queueError

    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let sent = 0
    let failed = 0

    for (const item of queue) {
      try {
        // Fetch template
        const { data: template, error: templateError } = await supabase
          .from('message_templates')
          .select('message_body')
          .eq('type', item.template_type)
          .single()

        if (templateError || !template) throw new Error('Template not found')

        const appt = item.appointments as any
        const business = appt?.business_profiles as any

        const vars: Record<string, string> = {
          customer_name: appt?.customer_name ?? 'Customer',
          appointment_time: appt?.appointment_time
            ? new Date(appt.appointment_time).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'your scheduled time',
          business_name: business?.business_name ?? 'Your service provider',
        }

        const message = renderTemplate(template.message_body, vars)
        await mockSendSms(item.phone, message)

        await supabase
          .from('message_queue')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', item.id)

        sent++
      } catch (err) {
        console.error(`Failed to process queue item ${item.id}:`, err)
        await supabase
          .from('message_queue')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', item.id)
        failed++
      }
    }

    return new Response(JSON.stringify({ processed: sent + failed, sent, failed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
