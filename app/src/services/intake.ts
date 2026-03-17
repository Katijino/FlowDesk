import { supabase } from '../lib/supabase'
import type { JobIntake } from '../types/database'

export async function getIntakeForAppointment(appointmentId: string): Promise<JobIntake | null> {
  const { data, error } = await supabase
    .from('job_intake')
    .select('*')
    .eq('appointment_id', appointmentId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function createIntake(
  payload: Omit<JobIntake, 'id' | 'created_at' | 'updated_at' | 'photo_urls'>
): Promise<JobIntake> {
  const { data, error } = await supabase
    .from('job_intake')
    .insert({ ...payload, photo_urls: [] })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadPhoto(
  intakeId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${intakeId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('intake-photos')
    .upload(path, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('intake-photos').getPublicUrl(path)
  const publicUrl = data.publicUrl

  // Append URL to intake record
  const { data: intake, error: fetchError } = await supabase
    .from('job_intake')
    .select('photo_urls')
    .eq('id', intakeId)
    .single()

  if (fetchError) throw fetchError

  const updatedUrls = [...(intake.photo_urls ?? []), publicUrl]

  const { error: updateError } = await supabase
    .from('job_intake')
    .update({ photo_urls: updatedUrls, updated_at: new Date().toISOString() })
    .eq('id', intakeId)

  if (updateError) throw updateError
  return publicUrl
}
