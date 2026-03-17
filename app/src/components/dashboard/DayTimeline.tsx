
import type { Appointment, AppointmentStatus } from '../../types/database'
import { AppointmentCard } from './AppointmentCard'
import { formatDate } from '../../lib/utils'

interface DayTimelineProps {
  date: Date
  appointments: Appointment[]
  onUpdateStatus: (id: string, status: AppointmentStatus) => Promise<void>
}

export function DayTimeline({ date, appointments, onUpdateStatus }: DayTimelineProps) {
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()
  )

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '12px',
        }}
      >
        {formatDate(date)}
      </div>
      {sorted.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            background: '#f9fafb',
            borderRadius: '10px',
            border: '1px dashed #e5e7eb',
          }}
        >
          No appointments scheduled
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}
