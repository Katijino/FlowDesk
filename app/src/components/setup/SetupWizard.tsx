import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { generateSlug } from '../../lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface HoursRow {
  enabled: boolean
  start: string
  end: string
}

const DEFAULT_HOURS: HoursRow[] = DAYS.map((_, i) => ({
  enabled: i >= 1 && i <= 5, // Mon–Fri
  start: '08:00',
  end: '17:00',
}))

export function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [slug, setSlug] = useState('')
  const [hours, setHours] = useState<HoursRow[]>(DEFAULT_HOURS)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = ['Business Info', 'Hours', 'Booking Link', 'Done']

  function handleNameBlur() {
    if (!slug && businessName) {
      setSlug(generateSlug(businessName))
    }
  }

  function toggleDay(i: number) {
    setHours((h) => h.map((row, idx) => idx === i ? { ...row, enabled: !row.enabled } : row))
  }

  function updateHours(i: number, field: 'start' | 'end', value: string) {
    setHours((h) => h.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  async function handleFinish() {
    setIsSaving(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const userId = session.user.id

      // Upsert business profile
      const { error: bizError } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: userId,
          business_name: businessName,
          phone,
          service_area: serviceArea,
          slug,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (bizError) throw bizError

      // Replace availability
      await supabase.from('availability').delete().eq('user_id', userId)

      const slots = hours
        .map((row, i) => ({ ...row, day_of_week: i }))
        .filter((row) => row.enabled)
        .map(({ day_of_week, start, end }) => ({
          user_id: userId,
          day_of_week,
          start_time: start,
          end_time: end,
        }))

      if (slots.length > 0) {
        const { error: availError } = await supabase.from('availability').insert(slots)
        if (availError) throw availError
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {steps.map((label, i) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= step ? '#2563eb' : '#e5e7eb',
                transition: 'background-color 300ms',
              }}
            />
            <span style={{ fontSize: '11px', color: i === step ? '#2563eb' : '#9ca3af', fontWeight: i === step ? 600 : 400 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card title="Business Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Mike's Plumbing"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
            />
            <Input
              label="Service Area"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="Austin, TX and surrounding areas"
            />
            <Button onClick={() => setStep(1)} disabled={!businessName} style={{ alignSelf: 'flex-end' }}>
              Next →
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card title="Business Hours">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DAYS.map((day, i) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => toggleDay(i)}
                  style={{
                    width: 40,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: hours[i].enabled ? '#2563eb' : '#e5e7eb',
                    position: 'relative',
                    transition: 'background-color 200ms',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: hours[i].enabled ? 19 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      transition: 'left 200ms',
                    }}
                  />
                </button>
                <span style={{ width: 32, fontSize: '13px', fontWeight: 500, color: '#374151' }}>{day}</span>
                {hours[i].enabled && (
                  <>
                    <input
                      type="time"
                      value={hours[i].start}
                      onChange={(e) => updateHours(i, 'start', e.target.value)}
                      style={{ fontSize: '13px', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>to</span>
                    <input
                      type="time"
                      value={hours[i].end}
                      onChange={(e) => updateHours(i, 'end', e.target.value)}
                      style={{ fontSize: '13px', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px' }}
                    />
                  </>
                )}
                {!hours[i].enabled && (
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>Closed</span>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
              <Button onClick={() => setStep(2)}>Next →</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Your Booking Link">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
              Customers will book appointments at this URL:
            </p>
            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              helper={`yourflowdesk.com/booking/${slug || '...'}`}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => setStep(3)} disabled={!slug}>
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="You're all set!">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '48px' }}>✓</div>
            <p style={{ margin: 0, fontSize: '15px', color: '#374151' }}>
              Save your settings and start managing jobs.
            </p>
            {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setStep(2)} disabled={isSaving}>← Back</Button>
              <Button loading={isSaving} size="lg" onClick={handleFinish}>
                Save &amp; Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
