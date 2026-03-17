import { supabase } from '../lib/supabase'
import { startOfDay, endOfDay } from '../lib/utils'
import type { Appointment, AppointmentStatus, AppointmentWithIntake, Availability } from '../types/database'

export async function getAppointmentsForDate(date: Date): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('appointment_time', startOfDay(date).toISOString())
    .lte('appointment_time', endOfDay(date).toISOString())
    .order('appointment_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAppointmentById(id: string): Promise<AppointmentWithIntake> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, job_intake(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as AppointmentWithIntake
}

export async function createAppointment(
  payload: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function getAvailability(userId: string): Promise<Availability[]> {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function setAvailability(
  userId: string,
  slots: Omit<Availability, 'id' | 'created_at'>[]
): Promise<Availability[]> {
  // Replace all availability for this user
  const { error: delError } = await supabase
    .from('availability')
    .delete()
    .eq('user_id', userId)

  if (delError) throw delError

  if (slots.length === 0) return []

  const { data, error } = await supabase
    .from('availability')
    .insert(slots)
    .select()

  if (error) throw error
  return data ?? []
}
