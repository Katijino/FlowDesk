import { supabase } from '../lib/supabase'
import { addMinutes } from '../lib/utils'
import type { MessageQueue } from '../types/database'

export async function queueConfirmation(appointmentId: string, phone: string): Promise<MessageQueue> {
  return enqueue(appointmentId, phone, 'confirmation', new Date())
}

export async function queueReminder(
  appointmentId: string,
  phone: string,
  appointmentTime: Date
): Promise<MessageQueue> {
  // Send reminder 24h before
  const sendTime = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000)
  return enqueue(appointmentId, phone, 'reminder', sendTime)
}

export async function queueOnMyWay(appointmentId: string, phone: string): Promise<MessageQueue> {
  // Send immediately
  return enqueue(appointmentId, phone, 'on_my_way', addMinutes(new Date(), 1))
}

async function enqueue(
  appointmentId: string,
  phone: string,
  templateType: 'confirmation' | 'reminder' | 'on_my_way',
  sendTime: Date
): Promise<MessageQueue> {
  const { data, error } = await supabase
    .from('message_queue')
    .insert({
      appointment_id: appointmentId,
      phone,
      template_type: templateType,
      send_time: sendTime.toISOString(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
