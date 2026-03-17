import { useMemo } from 'react'
import type { Availability } from '../../types/database'
import { formatTime, addMinutes, isSameDay } from '../../lib/utils'

interface TimeSlotPickerProps {
  date: Date
  availability: Availability[]
  bookedSlots: string[]
  selected: string | null
  onSelect: (isoTime: string) => void
}

function generateSlots(date: Date, availability: Availability[]): Date[] {
  const dayOfWeek = date.getDay()
  const windows = availability.filter((a) => a.day_of_week === dayOfWeek)
  const slots: Date[] = []

  for (const window of windows) {
    const [startH, startM] = window.start_time.split(':').map(Number)
    const [endH, endM] = window.end_time.split(':').map(Number)

    const start = new Date(date)
    start.setHours(startH, startM, 0, 0)
    const end = new Date(date)
    end.setHours(endH, endM, 0, 0)

    let current = new Date(start)
    while (current < end) {
      slots.push(new Date(current))
      current = addMinutes(current, 30)
    }
  }

  return slots
}

export function TimeSlotPicker({
  date,
  availability,
  bookedSlots,
  selected,
  onSelect,
}: TimeSlotPickerProps) {
  const slots = useMemo(() => generateSlots(date, availability), [date, availability])

  if (slots.length === 0) {
    return (
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
        No availability on this day.
      </p>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '8px',
      }}
    >
      {slots.map((slot) => {
        const iso = slot.toISOString()
        const isBooked = bookedSlots.some((b) => {
          const bookedDate = new Date(b)
          return (
            isSameDay(bookedDate, slot) &&
            bookedDate.getHours() === slot.getHours() &&
            bookedDate.getMinutes() === slot.getMinutes()
          )
        })
        const isSelected = selected === iso

        return (
          <button
            key={iso}
            disabled={isBooked}
            onClick={() => onSelect(iso)}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
              backgroundColor: isSelected
                ? '#eff6ff'
                : isBooked
                ? '#f9fafb'
                : '#fff',
              color: isBooked ? '#d1d5db' : isSelected ? '#2563eb' : '#111827',
              cursor: isBooked ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: isBooked ? 'line-through' : 'none',
              transition: 'all 100ms',
            }}
          >
            {formatTime(slot)}
          </button>
        )
      })}
    </div>
  )
}
