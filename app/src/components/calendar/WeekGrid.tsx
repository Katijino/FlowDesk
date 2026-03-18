import type { Appointment } from '../../types/database'
import { formatTime, isSameDay } from '../../lib/utils'

interface WeekGridProps {
  weekStart: Date
  appointments: Appointment[]
  onSlotClick: (date: Date, hour: number) => void
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am–8pm

const STATUS_COLORS: Record<string, string> = {
  pending: '#fef3c7',
  confirmed: '#dbeafe',
  completed: '#dcfce7',
  cancelled: '#f3f4f6',
}

const STATUS_BORDER: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#2563eb',
  completed: '#16a34a',
  cancelled: '#d1d5db',
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function WeekGrid({ weekStart, appointments, onSlotClick }: WeekGridProps) {
  const days = getWeekDays(weekStart)
  const today = new Date()

  const formatDayHeader = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  }

  function getApptForSlot(day: Date, hour: number): Appointment | null {
    return appointments.find((a) => {
      if (!isSameDay(a.appointment_time, day)) return false
      const apptHour = new Date(a.appointment_time).getHours()
      return apptHour === hour
    }) ?? null
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 600 }}>
        {/* Day headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '48px repeat(7, 1fr)',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div />
          {days.map((day, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '10px 4px',
                fontSize: 12,
                fontWeight: isSameDay(day, today) ? 700 : 500,
                color: isSameDay(day, today) ? '#2563eb' : '#374151',
                borderLeft: '1px solid #f3f4f6',
              }}
            >
              {formatDayHeader(day)}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px repeat(7, 1fr)',
                borderBottom: '1px solid #f3f4f6',
                minHeight: 56,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#9ca3af',
                  padding: '8px 4px',
                  textAlign: 'right',
                  userSelect: 'none',
                }}
              >
                {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
              </div>
              {days.map((day, di) => {
                const appt = getApptForSlot(day, hour)
                return (
                  <div
                    key={di}
                    onClick={() => !appt && onSlotClick(day, hour)}
                    style={{
                      borderLeft: '1px solid #f3f4f6',
                      padding: 4,
                      cursor: appt ? 'default' : 'pointer',
                      background: appt ? STATUS_COLORS[appt.status] : isSameDay(day, today) ? '#fafeff' : '#fff',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={(e) => {
                      if (!appt) (e.currentTarget as HTMLDivElement).style.background = '#f0f7ff'
                    }}
                    onMouseLeave={(e) => {
                      if (!appt) (e.currentTarget as HTMLDivElement).style.background = isSameDay(day, today) ? '#fafeff' : '#fff'
                    }}
                  >
                    {appt && (
                      <div
                        style={{
                          borderLeft: `3px solid ${STATUS_BORDER[appt.status]}`,
                          paddingLeft: 6,
                          height: '100%',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                          {appt.customer_name}
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>
                          {formatTime(appt.appointment_time)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
