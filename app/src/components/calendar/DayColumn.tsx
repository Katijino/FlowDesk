import type { Appointment } from '../../types/database'
import { formatTime } from '../../lib/utils'
import { Badge } from '../ui/Badge'

interface DayColumnProps {
  date: Date
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

export function DayColumn({ date, appointments, onSlotClick }: DayColumnProps) {
  function getApptForHour(hour: number): Appointment | null {
    return appointments.find((a) => new Date(a.appointment_time).getHours() === hour) ?? null
  }

  return (
    <div style={{ maxHeight: 560, overflowY: 'auto' }}>
      {HOURS.map((hour) => {
        const appt = getApptForHour(hour)
        const label = hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`

        return (
          <div
            key={hour}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              borderBottom: '1px solid #f3f4f6',
              minHeight: 56,
            }}
          >
            <div
              style={{
                width: 52,
                flexShrink: 0,
                fontSize: 11,
                color: '#9ca3af',
                padding: '10px 8px',
                textAlign: 'right',
                userSelect: 'none',
              }}
            >
              {label}
            </div>
            <div
              onClick={() => !appt && onSlotClick(date, hour)}
              style={{
                flex: 1,
                padding: 8,
                cursor: appt ? 'default' : 'pointer',
                background: appt ? STATUS_COLORS[appt.status] : '#fff',
                borderLeft: '1px solid #f3f4f6',
                transition: 'background 100ms',
              }}
              onMouseEnter={(e) => {
                if (!appt) (e.currentTarget as HTMLDivElement).style.background = '#f0f7ff'
              }}
              onMouseLeave={(e) => {
                if (!appt) (e.currentTarget as HTMLDivElement).style.background = '#fff'
              }}
            >
              {appt && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderLeft: `3px solid ${STATUS_BORDER[appt.status]}`,
                    paddingLeft: 10,
                    height: '100%',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
                      {appt.customer_name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      {formatTime(appt.appointment_time)}
                      {appt.description ? ` · ${appt.description}` : ''}
                    </div>
                  </div>
                  <Badge status={appt.status} />
                </div>
              )}
              {!appt && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    paddingLeft: 4,
                  }}
                >
                  + Add appointment
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
