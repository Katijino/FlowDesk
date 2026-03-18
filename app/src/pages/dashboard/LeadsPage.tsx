import { useState } from 'react'
import { useLeads } from '../../hooks/useLeads'
import { LeadCard } from '../../components/leads/LeadCard'

type Filter = 'all' | 'new' | 'contacted'

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
]

export default function LeadsPage() {
  const { leads, isLoading, error, updateStatus, convertToAppointment, deleteLead } = useLeads()
  const [filter, setFilter] = useState<Filter>('all')

  const newCount = leads.filter((l) => l.status === 'new').length
  const contactedCount = leads.filter((l) => l.status === 'contacted').length
  const thisWeek = leads.filter((l) => {
    const created = new Date(l.created_at)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return created >= weekStart && l.status === 'scheduled'
  }).length

  const filtered = leads.filter((l) => {
    if (filter === 'all') return true
    return l.status === filter
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
          Customers to Call
        </h1>
        {newCount > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {newCount}
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard label="New Leads" value={newCount} color="#2563eb" />
        <StatCard label="Contacted" value={contactedCount} color="#d97706" />
        <StatCard label="Converted This Week" value={thisWeek} color="#16a34a" />
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: 0,
        }}
      >
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: filter === key ? 600 : 400,
              color: filter === key ? '#2563eb' : '#6b7280',
              borderBottom: filter === key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
            {key !== 'all' && (
              <span
                style={{
                  marginLeft: 6,
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 11,
                  background: filter === key ? '#eff6ff' : '#f3f4f6',
                  color: filter === key ? '#2563eb' : '#9ca3af',
                }}
              >
                {leads.filter((l) => l.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading leads...</p>
      )}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
          {error}
        </div>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 14,
            background: '#f9fafb',
            borderRadius: 12,
            border: '1px dashed #e5e7eb',
          }}
        >
          {filter === 'all'
            ? 'No leads yet. They appear here when customers submit your booking form without selecting a time.'
            : `No ${filter} leads`}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onUpdateStatus={updateStatus}
            onConvert={convertToAppointment}
            onDelete={deleteLead}
          />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
    </div>
  )
}
