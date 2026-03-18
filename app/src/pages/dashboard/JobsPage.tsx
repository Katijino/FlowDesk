import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAppointments } from '../../hooks/useAppointments'
import { DayTimeline } from '../../components/dashboard/DayTimeline'
import { MonthGrid } from '../../components/calendar/MonthGrid'
import { WeekGrid } from '../../components/calendar/WeekGrid'
import { DayColumn } from '../../components/calendar/DayColumn'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatDate } from '../../lib/utils'
import type { Appointment } from '../../types/database'
import { getAppointmentsForRange } from '../../services/appointments'

type CalendarView = 'month' | 'week' | 'day'

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  date.setDate(date.getDate() - date.getDay())
  date.setHours(0, 0, 0, 0)
  return date
}

function getWeekEnd(d: Date): Date {
  const start = getWeekStart(d)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function getMonthEnd(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

function getMonthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function weekLabel(d: Date): string {
  const start = getWeekStart(d)
  const end = getWeekEnd(d)
  const sOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const eOpts: Intl.DateTimeFormatOptions = start.getMonth() === end.getMonth()
    ? { day: 'numeric' }
    : { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', sOpts)} – ${end.toLocaleDateString('en-US', eOpts)}`
}

// Quick-create appointment panel
interface CreatePanelProps {
  date: Date
  hour?: number
  userId: string
  onCreated: (appt: Appointment) => void
  onClose: () => void
}

function CreatePanel({ date, hour, userId, onCreated, onClose }: CreatePanelProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [timeStr, setTimeStr] = useState(() => {
    const h = hour ?? 9
    return `${String(h).padStart(2, '0')}:00`
  })
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { createAppointment } = useAppointments(date)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone) return
    setIsSaving(true)
    try {
      const [hh, mm] = timeStr.split(':').map(Number)
      const apptDate = new Date(date)
      apptDate.setHours(hh, mm, 0, 0)

      const appt = await createAppointment({
        user_id: userId,
        customer_name: name,
        phone,
        email: null,
        description: description || null,
        appointment_time: apptDate.toISOString(),
      })
      onCreated(appt)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          width: 380,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            New Appointment — {formatDate(date)}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Customer Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" type="tel" required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Time</label>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              style={{ padding: '9px 12px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, color: '#111827' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Notes (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Job description..."
              style={{ padding: '9px 12px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, color: '#111827', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Create Appointment</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [view, setView] = useState<CalendarView>('day')
  const [date, setDate] = useState(new Date())
  const [rangeAppointments, setRangeAppointments] = useState<Appointment[]>([])
  const [rangeLoading, setRangeLoading] = useState(false)
  const [createTarget, setCreateTarget] = useState<{ date: Date; hour?: number } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const { appointments, isLoading, error, refetch, updateStatus } = useAppointments(date)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserId(data.session.user.id)
    })
  }, [])

  const loadRange = useCallback(async () => {
    if (view === 'day') return
    setRangeLoading(true)
    try {
      let start: Date, end: Date
      if (view === 'month') {
        start = getMonthStart(date)
        // Expand to include calendar grid (prev/next month overflow)
        start.setDate(start.getDate() - start.getDay())
        end = getMonthEnd(date)
        end.setDate(end.getDate() + (6 - end.getDay()))
      } else {
        start = getWeekStart(date)
        end = getWeekEnd(date)
      }
      const data = await getAppointmentsForRange(start, end)
      setRangeAppointments(data)
    } finally {
      setRangeLoading(false)
    }
  }, [view, date.toDateString()])

  useEffect(() => {
    loadRange()
  }, [loadRange])

  function navigate(direction: -1 | 1) {
    const d = new Date(date)
    if (view === 'day') d.setDate(d.getDate() + direction)
    else if (view === 'week') d.setDate(d.getDate() + 7 * direction)
    else d.setMonth(d.getMonth() + direction)
    setDate(d)
  }

  function getNavLabel(): string {
    if (view === 'month') return monthLabel(date)
    if (view === 'week') return weekLabel(date)
    return formatDate(date)
  }

  function handleSlotClick(slotDate: Date, hour?: number) {
    setDate(slotDate)
    setCreateTarget({ date: slotDate, hour })
  }

  function handleAppointmentCreated(appt: Appointment) {
    setRangeAppointments((prev) => [...prev, appt])
    refetch()
  }

  const isLoading_ = view === 'day' ? isLoading : rangeLoading
  const appts = view === 'day' ? appointments : rangeAppointments

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Jobs</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* View switcher */}
          <div
            style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: 8,
              padding: 2,
            }}
          >
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  background: view === v ? '#fff' : 'transparent',
                  color: view === v ? '#111827' : '#6b7280',
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>←</Button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 140, textAlign: 'center' }}>
            {getNavLabel()}
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)}>→</Button>
          <Button variant="secondary" size="sm" onClick={() => setDate(new Date())}>Today</Button>
        </div>

        <Button size="sm" onClick={() => setCreateTarget({ date })}>+ New Appointment</Button>
      </div>

      {/* Status */}
      {isLoading_ && <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Calendar views */}
      {!isLoading_ && !error && (
        <>
          {view === 'month' && (
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 16 }}>
              <MonthGrid
                date={date}
                appointments={appts}
                onDayClick={(day) => { setDate(day); setView('day') }}
              />
            </div>
          )}

          {view === 'week' && (
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 16 }}>
              <WeekGrid
                weekStart={getWeekStart(date)}
                appointments={appts}
                onSlotClick={(d, h) => handleSlotClick(d, h)}
              />
            </div>
          )}

          {view === 'day' && (
            <>
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 16, marginBottom: 16 }}>
                <DayColumn
                  date={date}
                  appointments={appointments}
                  onSlotClick={(d, h) => handleSlotClick(d, h)}
                />
              </div>
              <div>
                <DayTimeline date={date} appointments={appointments} onUpdateStatus={updateStatus} />
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" size="sm" onClick={view === 'day' ? refetch : loadRange}>↻ Refresh</Button>
      </div>

      {/* Quick-create modal */}
      {createTarget && userId && (
        <CreatePanel
          date={createTarget.date}
          hour={createTarget.hour}
          userId={userId}
          onCreated={handleAppointmentCreated}
          onClose={() => setCreateTarget(null)}
        />
      )}
    </div>
  )
}
