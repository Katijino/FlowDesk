import { useState, useEffect, useCallback } from 'react'
import type { Appointment, AppointmentStatus } from '../types/database'
import {
  getAppointmentsForDate,
  updateAppointmentStatus,
} from '../services/appointments'

export function useAppointments(date?: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const target = date ?? new Date()

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAppointmentsForDate(target)
      setAppointments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }, [target.toDateString()])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleUpdateStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      try {
        await updateAppointmentStatus(id, status)
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status')
      }
    },
    []
  )

  return { appointments, isLoading, error, refetch, updateStatus: handleUpdateStatus }
}
