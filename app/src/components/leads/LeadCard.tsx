import type { Lead, LeadStatus } from '../../types/database'
import { Button } from '../ui/Button'
import { formatDate } from '../../lib/utils'

interface LeadCardProps {
  lead: Lead
  onUpdateStatus: (id: string, status: LeadStatus) => Promise<void>
  onConvert: (lead: Lead) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#2563eb',
  contacted: '#d97706',
  scheduled: '#16a34a',
  closed: '#9ca3af',
}

const STATUS_BG: Record<LeadStatus, string> = {
  new: '#eff6ff',
  contacted: '#fffbeb',
  scheduled: '#f0fdf4',
  closed: '#f9fafb',
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  closed: 'Closed',
}

export function LeadCard({ lead, onUpdateStatus, onConvert, onDelete }: LeadCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        borderLeft: `4px solid ${STATUS_COLORS[lead.status]}`,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{lead.name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {formatDate(lead.created_at)}
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 600,
            color: STATUS_COLORS[lead.status],
            background: STATUS_BG[lead.status],
          }}
        >
          {STATUS_LABEL[lead.status]}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
          <a href={`tel:${lead.phone}`} style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>
            {lead.phone}
          </a>
        </div>
        {lead.email && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
            <div style={{ fontSize: 13, color: '#374151' }}>{lead.email}</div>
          </div>
        )}
        {lead.preferred_time && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Time</div>
            <div style={{ fontSize: 13, color: '#374151' }}>{lead.preferred_time}</div>
          </div>
        )}
        {lead.description && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{lead.description}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <a
          href={`tel:${lead.phone}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            background: '#eff6ff',
            color: '#2563eb',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            border: '1px solid #bfdbfe',
          }}
        >
          📞 Call
        </a>
        {lead.status === 'new' && (
          <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(lead.id, 'contacted')}>
            Mark Contacted
          </Button>
        )}
        {(lead.status === 'new' || lead.status === 'contacted') && (
          <Button size="sm" onClick={() => onConvert(lead)}>
            Convert to Job
          </Button>
        )}
        {lead.status !== 'closed' && lead.status !== 'scheduled' && (
          <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(lead.id, 'closed')}>
            Close
          </Button>
        )}
        <Button size="sm" variant="danger" onClick={() => onDelete(lead.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}
