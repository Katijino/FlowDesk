import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Lead, LeadStatus } from '../types/database'
import {
  getLeadsForUser,
  updateLeadStatus,
  convertLeadToAppointment,
  deleteLead,
} from '../services/leads'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getLeadsForUser()
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleUpdateStatus = useCallback(async (id: string, status: LeadStatus) => {
    try {
      await updateLeadStatus(id, status)
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead')
    }
  }, [])

  const handleConvertToAppointment = useCallback(async (lead: Lead) => {
    try {
      await convertLeadToAppointment(lead)
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: 'scheduled' as LeadStatus } : l)))
      navigate('/dashboard/jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead')
    }
  }, [navigate])

  const handleDeleteLead = useCallback(async (id: string) => {
    try {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead')
    }
  }, [])

  return {
    leads,
    isLoading,
    error,
    refetch,
    updateStatus: handleUpdateStatus,
    convertToAppointment: handleConvertToAppointment,
    deleteLead: handleDeleteLead,
  }
}
