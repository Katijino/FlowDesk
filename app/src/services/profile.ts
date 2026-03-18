import { supabase } from '../lib/supabase'
import type { BusinessProfile } from '../types/database'

export async function getProfile(): Promise<BusinessProfile | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function updateProfile(
  updates: Partial<Omit<BusinessProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<BusinessProfile> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('business_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function checkSlugAvailable(slug: string, currentUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('user_id')
    .eq('booking_slug', slug)
    .neq('user_id', currentUserId)

  if (error) throw error
  return (data ?? []).length === 0
}
