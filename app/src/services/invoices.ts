import { supabase } from '../lib/supabase'
import { generatePaymentLink } from '../lib/utils'
import type { Invoice, InvoiceItem, InvoiceStatus, InvoiceWithItems } from '../types/database'

export async function getInvoicesForUser(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getInvoiceWithItems(id: string): Promise<InvoiceWithItems> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*), appointments(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as InvoiceWithItems
}

export async function createInvoice(
  payload: Pick<Invoice, 'user_id' | 'appointment_id'>
): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...payload,
      total_amount: 0,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  paymentMethod?: 'stripe' | 'cash' | 'other'
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (paymentMethod) {
    updates.payment_method = paymentMethod
  }
  if (status === 'sent' && paymentMethod === 'stripe') {
    updates.payment_link = generatePaymentLink(id)
  }

  const { error } = await supabase.from('invoices').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw error
}

export async function addInvoiceItem(
  invoiceId: string,
  item: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>
): Promise<InvoiceItem> {
  const { data, error } = await supabase
    .from('invoice_items')
    .insert({ ...item, invoice_id: invoiceId })
    .select()
    .single()

  if (error) throw error
  await recalculateTotal(invoiceId)
  return data
}

export async function removeInvoiceItem(id: string, invoiceId: string): Promise<void> {
  const { error } = await supabase.from('invoice_items').delete().eq('id', id)
  if (error) throw error
  await recalculateTotal(invoiceId)
}

export async function recalculateTotal(invoiceId: string): Promise<number> {
  const { data: items, error } = await supabase
    .from('invoice_items')
    .select('price, quantity')
    .eq('invoice_id', invoiceId)

  if (error) throw error

  const total = (items ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ total_amount: total, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)

  if (updateError) throw updateError
  return total
}
