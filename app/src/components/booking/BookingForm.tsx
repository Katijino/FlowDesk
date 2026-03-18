import React, { useState } from 'react'
import type { Availability } from '../../types/database'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { TimeSlotPicker } from './TimeSlotPicker'
import { formatDate } from '../../lib/utils'

interface BookingFormProps {
  availability: Availability[]
  bookedSlots: string[]
  onSubmit: (payload: {
    customer_name: string
    phone: string
    email: string
    description: string
    appointment_time: string
  }) => Promise<void>
  onLeadCapture?: (payload: {
    name: string
    phone: string
    email: string | null
    description: string | null
  }) => Promise<void>
  onDateChange?: (date: Date) => void
}

interface FormErrors {
  customer_name?: string
  phone?: string
}

export function BookingForm({ availability, bookedSlots, onSubmit, onLeadCapture, onDateChange }: BookingFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!name.trim()) errs.customer_name = 'Name is required'
    if (!phone.trim()) errs.phone = 'Phone number is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      if (selectedSlot) {
        await onSubmit({
          customer_name: name,
          phone,
          email,
          description,
          appointment_time: selectedSlot,
        })
      } else if (onLeadCapture) {
        await onLeadCapture({
          name,
          phone,
          email: email || null,
          description: description || null,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = new Date(e.target.value + 'T00:00:00')
    setSelectedDate(d)
    setSelectedSlot(null)
    onDateChange?.(d)
  }

  const dateValue = selectedDate.toISOString().slice(0, 10)
  const hasLeadCapture = !!onLeadCapture

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Input
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.customer_name}
        placeholder="Jane Smith"
        required
      />
      <Input
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        placeholder="(555) 123-4567"
        type="tel"
        required
      />
      <Input
        label="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jane@example.com"
        type="email"
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
          What do you need help with?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the job..."
          rows={3}
          style={{
            padding: '9px 12px',
            fontSize: '14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            color: '#111827',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Select Date</label>
        <input
          type="date"
          value={dateValue}
          min={new Date().toISOString().slice(0, 10)}
          onChange={handleDateChange}
          style={{
            padding: '9px 12px',
            fontSize: '14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            color: '#111827',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
          Available Times — {formatDate(selectedDate)}
        </label>
        <TimeSlotPicker
          date={selectedDate}
          availability={availability}
          bookedSlots={bookedSlots}
          selected={selectedSlot}
          onSelect={setSelectedSlot}
        />
        {hasLeadCapture && !selectedSlot && (
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
            No time that works? Skip selecting a time and we'll reach out to schedule you.
          </p>
        )}
      </div>

      <Button type="submit" loading={isSubmitting} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
        {selectedSlot ? 'Request Appointment' : hasLeadCapture ? 'Request a Callback' : 'Request Appointment'}
      </Button>
    </form>
  )
}
