import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase, type Session } from './lib/supabase'
import BookingPage from './pages/booking/BookingPage'
import JobsPage from './pages/dashboard/JobsPage'
import InvoicePage from './pages/invoice/InvoicePage'
import LeadsPage from './pages/dashboard/LeadsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import SetupPage from './pages/setup/SetupPage'
import { LoginForm } from './components/auth/LoginForm'
import { getLeadsForUser } from './services/leads'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</span>
      </div>
    )
  }

  if (!session) {
    return <LoginForm onSuccess={(s) => setSession(s)} />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public booking page */}
        <Route path="/booking/:userSlug" element={<BookingPage />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard/jobs"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <JobsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/leads"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LeadsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/invoices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InvoicePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupPage />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard/jobs" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [newLeadCount, setNewLeadCount] = useState(0)

  useEffect(() => {
    getLeadsForUser()
      .then((leads) => setNewLeadCount(leads.filter((l) => l.status === 'new').length))
      .catch(() => {})
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <nav
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              F
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827', letterSpacing: '-0.01em' }}>
              FlowDesk
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <NavLink href="/dashboard/jobs">Jobs</NavLink>
            <NavLinkWithBadge href="/dashboard/leads" badge={newLeadCount}>Leads</NavLinkWithBadge>
            <NavLink href="/dashboard/invoices">Invoices</NavLink>
            <NavLink href="/dashboard/profile">Profile</NavLink>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#6b7280',
            padding: '6px 12px',
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          Sign out
        </button>
      </nav>
      <main>{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const location = useLocation()
  const active = location.pathname.startsWith(href)
  return (
    <a
      href={href}
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: active ? '#2563eb' : '#6b7280',
        textDecoration: 'none',
        padding: '6px 10px',
        borderRadius: 8,
        background: active ? '#eff6ff' : 'transparent',
        transition: 'color 150ms, background 150ms',
      }}
    >
      {children}
    </a>
  )
}

function NavLinkWithBadge({ href, children, badge }: { href: string; children: React.ReactNode; badge: number }) {
  const location = useLocation()
  const active = location.pathname.startsWith(href)
  return (
    <a
      href={href}
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: active ? '#2563eb' : '#6b7280',
        textDecoration: 'none',
        padding: '6px 10px',
        borderRadius: 8,
        background: active ? '#eff6ff' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'color 150ms, background 150ms',
      }}
    >
      {children}
      {badge > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: '#dc2626',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '0 4px',
          }}
        >
          {badge}
        </span>
      )}
    </a>
  )
}
