import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, type Session } from './lib/supabase'
import BookingPage from './pages/booking/BookingPage'
import JobsPage from './pages/dashboard/JobsPage'
import InvoicePage from './pages/invoice/InvoicePage'
import SetupPage from './pages/setup/SetupPage'
import { LoginForm } from './components/auth/LoginForm'

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
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <nav
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>FlowDesk</span>
          <NavLink href="/dashboard/jobs">Jobs</NavLink>
          <NavLink href="/dashboard/invoices">Invoices</NavLink>
          <NavLink href="/setup">Setup</NavLink>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#6b7280',
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
  const active = window.location.pathname.startsWith(href)
  return (
    <a
      href={href}
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: active ? '#2563eb' : '#6b7280',
        textDecoration: 'none',
        padding: '4px 0',
        borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
      }}
    >
      {children}
    </a>
  )
}
