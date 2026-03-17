import { useState, useEffect } from 'react'
import type { Appointment, Invoice, InvoiceItem } from '../../types/database'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { InvoiceLineItem, AddLineItemRow } from './InvoiceLineItem'
import { formatCurrency, formatDate, formatTime } from '../../lib/utils'
import { getInvoiceWithItems, addInvoiceItem, removeInvoiceItem } from '../../services/invoices'

interface InvoiceFormProps {
  invoiceId: string
  onStatusChange: (status: 'sent' | 'paid', paymentMethod?: 'stripe' | 'cash' | 'other') => Promise<void>
}

export function InvoiceForm({ invoiceId, onStatusChange }: InvoiceFormProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)

  async function load() {
    setIsLoading(true)
    try {
      const data = await getInvoiceWithItems(invoiceId)
      setInvoice(data)
      setItems(data.invoice_items ?? [])
      setAppointment(data.appointments ?? null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [invoiceId])

  async function handleAddItem(item: { description: string; price: number; quantity: number }) {
    await addInvoiceItem(invoiceId, item)
    await load()
  }

  async function handleDeleteItem(id: string) {
    await removeInvoiceItem(id, invoiceId)
    await load()
  }

  async function handleSendStripe() {
    setActionLoading('stripe')
    try {
      await onStatusChange('sent', 'stripe')
      setShowPaymentOptions(false)
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMarkCash() {
    setActionLoading('cash')
    try {
      await onStatusChange('paid', 'cash')
      setShowPaymentOptions(false)
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMarkOther() {
    setActionLoading('other')
    try {
      await onStatusChange('paid', 'other')
      setShowPaymentOptions(false)
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMarkPaid() {
    setActionLoading('paid')
    try {
      await onStatusChange('paid')
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading || !invoice) {
    return <div style={{ color: '#6b7280', padding: '20px' }}>Loading invoice...</div>
  }

  return (
    <Card
      title="Invoice"
      subtitle={appointment
        ? `${appointment.customer_name} — ${formatDate(appointment.appointment_time)} ${formatTime(appointment.appointment_time)}`
        : undefined}
      action={<Badge status={invoice.status} />}
    >
      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 60px 80px 36px',
          gap: '8px',
          paddingBottom: '6px',
          borderBottom: '2px solid #f3f4f6',
        }}
      >
        {['Description', 'Price', 'Qty', 'Subtotal', ''].map((h) => (
          <span
            key={h}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              textAlign: h === 'Price' || h === 'Subtotal' ? 'right' : h === 'Qty' ? 'center' : 'left',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {items.map((item) => (
        <InvoiceLineItem key={item.id} item={item} onDelete={handleDeleteItem} />
      ))}

      {invoice.status === 'draft' && <AddLineItemRow onAdd={handleAddItem} />}

      {/* Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '2px solid #111827',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '15px' }}>Total</span>
        <span style={{ fontWeight: 700, fontSize: '15px', minWidth: 80, textAlign: 'right' }}>
          {formatCurrency(invoice.total_amount)}
        </span>
      </div>

      {/* Payment info */}
      {invoice.payment_link && (
        <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f0f9ff', borderRadius: 8, fontSize: '13px' }}>
          <span style={{ color: '#6b7280' }}>Stripe payment link: </span>
          <a href={invoice.payment_link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
            {invoice.payment_link}
          </a>
        </div>
      )}
      {invoice.payment_method && invoice.payment_method !== 'stripe' && (
        <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: '13px', color: '#166534' }}>
          Paid via {invoice.payment_method}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: '20px' }}>
        {invoice.status === 'draft' && !showPaymentOptions && (
          <Button onClick={() => setShowPaymentOptions(true)}>
            Send / Mark as Paid
          </Button>
        )}

        {invoice.status === 'draft' && showPaymentOptions && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '14px',
              background: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              How is this being paid?
            </p>
            <Button
              loading={actionLoading === 'stripe'}
              onClick={handleSendStripe}
              style={{ justifyContent: 'flex-start' }}
            >
              Send Stripe Payment Link
            </Button>
            <div style={{ fontSize: '11px', color: '#9ca3af', paddingLeft: 4 }}>
              Generates a yourflowdesk.com/pay link — wire to Stripe Checkout later
            </div>
            <Button
              variant="secondary"
              loading={actionLoading === 'cash'}
              onClick={handleMarkCash}
              style={{ justifyContent: 'flex-start' }}
            >
              Mark as Cash Paid
            </Button>
            <Button
              variant="secondary"
              loading={actionLoading === 'other'}
              onClick={handleMarkOther}
              style={{ justifyContent: 'flex-start' }}
            >
              Mark as Other (Venmo, Zelle, etc.)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPaymentOptions(false)}>
              Cancel
            </Button>
          </div>
        )}

        {invoice.status === 'sent' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              loading={actionLoading === 'paid'}
              onClick={handleMarkPaid}
            >
              Mark as Paid
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
