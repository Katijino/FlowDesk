import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Invoice, InvoiceStatus } from '../types/database'
import { getInvoicesForUser, createInvoice, updateInvoiceStatus, deleteInvoice } from '../services/invoices'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getInvoicesForUser()
      setInvoices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleCreateInvoice = useCallback(
    async (options?: {
      appointmentId?: string | null
      leadId?: string | null
      customerName?: string | null
      customerPhone?: string | null
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const invoice = await createInvoice({
        user_id: session.user.id,
        appointment_id: options?.appointmentId ?? null,
        lead_id: options?.leadId ?? null,
        customer_name: options?.customerName ?? null,
        customer_phone: options?.customerPhone ?? null,
      })
      setInvoices((prev) => [invoice, ...prev])
      return invoice
    },
    []
  )

  const handleUpdateStatus = useCallback(
    async (id: string, status: InvoiceStatus, paymentMethod?: 'stripe' | 'cash' | 'other') => {
      try {
        await updateInvoiceStatus(id, status, paymentMethod)
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update invoice')
      }
    },
    []
  )

  const handleDeleteInvoice = useCallback(
    async (id: string) => {
      await deleteInvoice(id)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    },
    []
  )

  return {
    invoices,
    isLoading,
    error,
    refetch,
    createInvoice: handleCreateInvoice,
    updateStatus: handleUpdateStatus,
    deleteInvoice: handleDeleteInvoice,
  }
}
