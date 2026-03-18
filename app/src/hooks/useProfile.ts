import { useState, useEffect, useCallback, useRef } from 'react'
import type { BusinessProfile } from '../types/database'
import { getProfile, updateProfile, checkSlugAvailable } from '../services/profile'
import { supabase } from '../lib/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getProfile()
      .then((p) => setProfile(p))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setIsLoading(false))
  }, [])

  const save = useCallback(
    async (updates: Partial<Omit<BusinessProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      setIsSaving(true)
      setError(null)
      try {
        const updated = await updateProfile(updates)
        setProfile(updated)
        return updated
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save'
        setError(msg)
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  const checkSlug = useCallback(
    (slug: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { resolve(false); return }
            const available = await checkSlugAvailable(slug, session.user.id)
            resolve(available)
          } catch (err) {
            reject(err)
          }
        }, 400)
      })
    },
    []
  )

  return { profile, isLoading, error, isSaving, save, checkSlug }
}
