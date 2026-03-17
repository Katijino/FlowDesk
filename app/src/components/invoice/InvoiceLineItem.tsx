import React, { useState } from 'react'
import type { InvoiceItem } from '../../types/database'
import { formatCurrency } from '../../lib/utils'
import { Button } from '../ui/Button'

interface InvoiceLineItemProps {
  item: InvoiceItem
  onDelete: (id: string) => Promise<void>
}

export function InvoiceLineItem({ item, onDelete }: InvoiceLineItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onDelete(item.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 60px 80px 36px',
        gap: '8px',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <span style={{ fontSize: '14px', color: '#111827' }}>{item.description}</span>
      <span style={{ fontSize: '14px', color: '#374151', textAlign: 'right' }}>
        {formatCurrency(item.price)}
      </span>
      <span style={{ fontSize: '14px', color: '#374151', textAlign: 'center' }}>
        ×{item.quantity}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>
        {formatCurrency(item.price * item.quantity)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        loading={isDeleting}
        onClick={handleDelete}
        style={{ color: '#ef4444', padding: '4px 8px' }}
      >
        ✕
      </Button>
    </div>
  )
}

interface AddLineItemRowProps {
  onAdd: (item: { description: string; price: number; quantity: number }) => Promise<void>
}

export function AddLineItemRow({ onAdd }: AddLineItemRowProps) {
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [isAdding, setIsAdding] = useState(false)

  async function handleAdd() {
    if (!description || !price) return
    setIsAdding(true)
    try {
      await onAdd({
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10) || 1,
      })
      setDescription('')
      setPrice('')
      setQuantity('1')
    } finally {
      setIsAdding(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 60px 80px 36px',
        gap: '8px',
        alignItems: 'center',
        paddingTop: '10px',
      }}
    >
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="0.00"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        min="0"
        step="0.01"
        style={{ ...inputStyle, textAlign: 'right' }}
      />
      <input
        placeholder="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        type="number"
        min="1"
        style={{ ...inputStyle, textAlign: 'center' }}
      />
      <span />
      <Button size="sm" loading={isAdding} onClick={handleAdd} style={{ padding: '6px' }}>
        +
      </Button>
    </div>
  )
}
