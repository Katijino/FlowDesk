import React from 'react'
import { useParams } from 'react-router-dom'
import { useBooking } from '../../hooks/useBooking'
import { BookingForm } from '../../components/booking/BookingForm'
import { Card } from '../../components/ui/Card'

export default function BookingPage() {
  const { userSlug } = useParams<{ userSlug: string }>()
  const { business, availability, bookedSlots, isLoading, isSuccess, error, submitBooking, refreshSlots } =
    useBooking(userSlug ?? '')

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div style={pageStyle}>
        <Card>
          <p style={{ color: '#dc2626', margin: 0 }}>
            {error ?? 'Business not found.'}
          </p>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div style={pageStyle}>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#111827' }}>
              Appointment Requested!
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {business.business_name} will confirm your appointment shortly.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', color: '#111827' }}>
          Book with {business.business_name}
        </h1>
        {business.service_area && (
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Serving {business.service_area}
          </p>
        )}
      </div>
      <Card>
        <BookingForm
          availability={availability}
          bookedSlots={bookedSlots}
          onSubmit={async (payload) => { await submitBooking(payload) }}
          onDateChange={refreshSlots}
        />
      </Card>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '32px 16px',
}
