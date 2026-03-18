import { supabase } from '../lib/supabase'
import type { Lead, LeadStatus, Appointment } from '../types/database'
import { createAppointment } from './appointments'

export async function getLeadsForUser(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createLead(
  payload: Omit<Lead, 'id' | 'created_at' | 'status'>
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert({ ...payload, status: 'new' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

export async function convertLeadToAppointment(lead: Lead): Promise<Appointment> {
  const appointment = await createAppointment({
    user_id: lead.user_id,
    customer_name: lead.name,
    phone: lead.phone,
    email: lead.email,
    description: lead.description,
    appointment_time: new Date().toISOString(),
  })

  await updateLeadStatus(lead.id, 'scheduled')
  return appointment
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}
