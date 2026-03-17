import React from 'react'
import type { AppointmentStatus, InvoiceStatus } from '../../types/database'

type BadgeStatus = AppointmentStatus | InvoiceStatus | string

const colorMap: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef9c3', color: '#854d0e' },
  confirmed: { bg: '#dbeafe', color: '#1e40af' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  draft:     { bg: '#f3f4f6', color: '#374151' },
  sent:      { bg: '#ede9fe', color: '#5b21b6' },
  paid:      { bg: '#dcfce7', color: '#166534' },
  overdue:   { bg: '#fee2e2', color: '#991b1b' },
}

interface BadgeProps {
  status: BadgeStatus
  style?: React.CSSProperties
}

export function Badge({ status, style }: BadgeProps) {
  const colors = colorMap[status] ?? { bg: '#f3f4f6', color: '#374151' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'capitalize',
        backgroundColor: colors.bg,
        color: colors.color,
        ...style,
      }}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
