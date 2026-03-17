import { useState } from 'react'
import { useAppointments } from '../../hooks/useAppointments'
import { DayTimeline } from '../../components/dashboard/DayTimeline'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'

export default function JobsPage() {
  const [date, setDate] = useState(new Date())
  const { appointments, isLoading, error, refetch, updateStatus } = useAppointments(date)

  function changeDate(offset: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    setDate(d)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Jobs
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>←</Button>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151', minWidth: 120, textAlign: 'center' }}>
            {formatDate(date)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>→</Button>
          <Button variant="secondary" size="sm" onClick={() => setDate(new Date())}>Today</Button>
        </div>
      </div>

      {isLoading && (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading appointments...</p>
      )}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {!isLoading && !error && (
        <DayTimeline date={date} appointments={appointments} onUpdateStatus={updateStatus} />
      )}

      <div style={{ marginTop: '16px' }}>
        <Button variant="ghost" size="sm" onClick={refetch}>↻ Refresh</Button>
      </div>
    </div>
  )
}
