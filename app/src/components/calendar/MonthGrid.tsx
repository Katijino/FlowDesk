import type { Appointment } from '../../types/database'
import { isSameDay } from '../../lib/utils'

interface MonthGridProps {
  date: Date
  appointments: Appointment[]
  onDayClick: (day: Date) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_DOT: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#2563eb',
  completed: '#16a34a',
  cancelled: '#d1d5db',
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getCalendarStart(date: Date): Date {
  const ms = getMonthStart(date)
  const d = new Date(ms)
  d.setDate(d.getDate() - d.getDay()) // go back to Sunday
  return d
}

export function MonthGrid({ date, appointments, onDayClick }: MonthGridProps) {
  const today = new Date()
  const calStart = getCalendarStart(date)
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(calStart)
    d.setDate(d.getDate() + i)
    days.push(d)
  }

  // Check if last row is needed
  const lastRowNeeded = days.some((d) => d.getMonth() === date.getMonth() && days.indexOf(d) >= 35)
  const visibleDays = lastRowNeeded ? days : days.slice(0, 35)

  return (
    <div>
      {/* Weekday headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          marginBottom: 4,
        }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '8px 0',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
        }}
      >
        {visibleDays.map((day, i) => {
          const isCurrentMonth = day.getMonth() === date.getMonth()
          const isToday = isSameDay(day, today)
          const dayAppts = appointments.filter((a) => isSameDay(a.appointment_time, day))
          const shown = dayAppts.slice(0, 3)
          const extra = dayAppts.length - shown.length

          return (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              style={{
                minHeight: 80,
                padding: '8px',
                background: isToday ? '#eff6ff' : '#fff',
                border: isToday ? '1px solid #93c5fd' : '1px solid #f3f4f6',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: isToday ? '#2563eb' : 'transparent',
                  color: isToday ? '#fff' : isCurrentMonth ? '#111827' : '#d1d5db',
                }}
              >
                {day.getDate()}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                {shown.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: STATUS_DOT[a.status] ?? '#6b7280',
                    }}
                  />
                ))}
                {extra > 0 && (
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>+{extra} more</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
