import { useState } from 'react'
import { useInvoices } from '../../hooks/useInvoices'
import { InvoiceForm } from '../../components/invoice/InvoiceForm'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { InvoiceStatus } from '../../types/database'

export default function InvoicePage() {
  const { invoices, isLoading, error, createInvoice, updateStatus, deleteInvoice } = useInvoices()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate() {
    setIsCreating(true)
    try {
      const inv = await createInvoice()
      setSelectedId(inv.id)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteInvoice(id)
      if (selectedId === id) setSelectedId(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '24px' }}>
      {/* List */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Invoices</h1>
          <Button size="sm" loading={isCreating} onClick={handleCreate}>+ New</Button>
        </div>

        {isLoading && <p style={{ color: '#6b7280', fontSize: '13px' }}>Loading...</p>}
        {error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {invoices.map((inv) => (
            <div
              key={inv.id}
              style={{ position: 'relative' }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget.querySelector<HTMLButtonElement>('.delete-btn')
                if (btn) btn.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget.querySelector<HTMLButtonElement>('.delete-btn')
                if (btn) btn.style.opacity = '0'
              }}
            >
              <button
                onClick={() => setSelectedId(inv.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '36px',
                  background: selectedId === inv.id ? '#eff6ff' : '#fff',
                  border: selectedId === inv.id ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    {formatCurrency(inv.total_amount)}
                  </span>
                  <Badge status={inv.status} />
                </div>
                {inv.customer_name && (
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>
                    {inv.customer_name}
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {formatDate(inv.created_at)}
                </span>
              </button>
              <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); handleDelete(inv.id) }}
                disabled={deletingId === inv.id}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '8px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '14px',
                  padding: '4px',
                  opacity: 0,
                  transition: 'opacity 150ms',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {!isLoading && invoices.length === 0 && (
            <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginTop: '24px' }}>
              No invoices yet
            </p>
          )}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1 }}>
        {selectedId ? (
          <InvoiceForm
            invoiceId={selectedId}
            onStatusChange={(status, paymentMethod) =>
              updateStatus(selectedId, status as InvoiceStatus, paymentMethod)
            }
          />
        ) : (
          <div
            style={{
              height: '100%',
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '14px',
              border: '1px dashed #e5e7eb',
              borderRadius: '12px',
            }}
          >
            Select an invoice or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
