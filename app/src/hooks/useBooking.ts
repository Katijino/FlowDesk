import { useState, useEffect, useCallback } from 'react'
import type { Availability, BusinessProfile } from '../types/database'
import {
  getBusinessBySlug,
  getBookedSlots,
  getAvailabilityForUser,
  submitBooking,
  type BookingPayload,
} from '../services/booking'

export function useBooking(slug: string) {
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const biz = await getBusinessBySlug(slug)
        setBusiness(biz)
        const avail = await getAvailabilityForUser(biz.user_id)
        setAvailability(avail)
        const slots = await getBookedSlots(biz.user_id, new Date())
        setBookedSlots(slots)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Business not found')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [slug])

  const refreshSlots = useCallback(
    async (date: Date) => {
      if (!business) return
      try {
        const slots = await getBookedSlots(business.user_id, date)
        setBookedSlots(slots)
      } catch {
        // non-critical
      }
    },
    [business]
  )

  const handleSubmit = useCallback(
    async (payload: Omit<BookingPayload, 'user_id'>) => {
      if (!business) throw new Error('No business loaded')
      setError(null)
      const result = await submitBooking({ ...payload, user_id: business.user_id })
      setIsSuccess(true)
      return result
    },
    [business]
  )

  return {
    business,
    availability,
    bookedSlots,
    isLoading,
    isSuccess,
    error,
    refreshSlots,
    submitBooking: handleSubmit,
  }
}
