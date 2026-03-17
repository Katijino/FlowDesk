import { supabase } from '../lib/supabase'
import type { Appointment, Availability, BusinessProfile } from '../types/database'
import { startOfDay, endOfDay } from '../lib/utils'

export async function getBusinessBySlug(slug: string): Promise<BusinessProfile> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getBookedSlots(userId: string, date: Date): Promise<string[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('user_id', userId)
    .gte('appointment_time', startOfDay(date).toISOString())
    .lte('appointment_time', endOfDay(date).toISOString())
    .in('status', ['pending', 'confirmed'])

  if (error) throw error
  return (data ?? []).map((a) => a.appointment_time)
}

export async function getAvailabilityForUser(userId: string): Promise<Availability[]> {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data ?? []
}

export interface BookingPayload {
  user_id: string
  customer_name: string
  phone: string
  email?: string
  description?: string
  appointment_time: string
}

export async function submitBooking(payload: BookingPayload): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...payload,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
