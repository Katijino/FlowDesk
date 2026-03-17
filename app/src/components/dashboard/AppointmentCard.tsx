import React, { useState } from 'react'
import type { Appointment, AppointmentStatus } from '../../types/database'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatTime } from '../../lib/utils'

interface AppointmentCardProps {
  appointment: Appointment
  onUpdateStatus: (id: string, status: AppointmentStatus) => Promise<void>
}

const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  pending: 'confirmed',
  confirmed: 'completed',
}

export function AppointmentCard({ appointment, onUpdateStatus }: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleAdvance() {
    const next = NEXT_STATUS[appointment.status]
    if (!next) return
    setIsUpdating(true)
    try {
      await onUpdateStatus(appointment.id, next)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleCancel() {
    setIsUpdating(true)
    try {
      await onUpdateStatus(appointment.id, 'cancelled')
    } finally {
      setIsUpdating(false)
    }
  }

  const canAdvance = !!NEXT_STATUS[appointment.status]
  const canCancel = appointment.status !== 'cancelled' && appointment.status !== 'completed'

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            minWidth: 64,
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: '#2563eb',
          }}
        >
          {formatTime(appointment.appointment_time)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
            {appointment.customer_name}
          </div>
          {appointment.description && (
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200,
              }}
            >
              {appointment.description}
            </div>
          )}
        </div>
        <Badge status={appointment.status} />
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 16px 16px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px' }}>
            <Detail label="Phone" value={appointment.phone} />
            {appointment.email && <Detail label="Email" value={appointment.email} />}
            {appointment.description && (
              <Detail label="Description" value={appointment.description} style={{ gridColumn: '1 / -1' }} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {canAdvance && (
              <Button size="sm" loading={isUpdating} onClick={handleAdvance}>
                Mark as {NEXT_STATUS[appointment.status]}
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="danger" loading={isUpdating} onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({
  label,
  value,
  style,
}: {
  label: string
  value: string
  style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: '#374151', marginTop: 2 }}>{value}</div>
    </div>
  )
}
