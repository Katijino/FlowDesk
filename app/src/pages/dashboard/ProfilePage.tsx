import { useState, useEffect, useRef } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { generateSlug } from '../../lib/utils'

export default function ProfilePage() {
  const { profile, isLoading, error, isSaving, save, checkSlug } = useProfile()
  const [editing, setEditing] = useState(false)

  // Form state
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [email, setEmail] = useState('')
  const [bookingSlug, setBookingSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const slugCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name)
      setPhone(profile.phone ?? '')
      setServiceArea(profile.service_area ?? '')
      setEmail(profile.email ?? '')
      setBookingSlug(profile.booking_slug ?? profile.slug ?? '')
    }
  }, [profile])

  function handleSlugChange(value: string) {
    const slug = generateSlug(value)
    setBookingSlug(slug)
    setSlugStatus('checking')

    if (slugCheckRef.current) clearTimeout(slugCheckRef.current)
    slugCheckRef.current = setTimeout(async () => {
      if (!slug) { setSlugStatus('idle'); return }
      if (profile && slug === (profile.booking_slug ?? profile.slug)) {
        setSlugStatus('available')
        return
      }
      try {
        const available = await checkSlug(slug)
        setSlugStatus(available ? 'available' : 'taken')
      } catch {
        setSlugStatus('idle')
      }
    }, 400)
  }

  async function handleSave() {
    if (slugStatus === 'taken') return
    setSaveError(null)
    try {
      await save({
        business_name: businessName,
        phone: phone || null,
        service_area: serviceArea || null,
        email: email || null,
        booking_slug: bookingSlug || null,
        slug: bookingSlug || undefined,
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function handleCancel() {
    if (profile) {
      setBusinessName(profile.business_name)
      setPhone(profile.phone ?? '')
      setServiceArea(profile.service_area ?? '')
      setEmail(profile.email ?? '')
      setBookingSlug(profile.booking_slug ?? profile.slug ?? '')
    }
    setSlugStatus('idle')
    setSaveError(null)
    setEditing(false)
  }

  function handleCopyLink() {
    const slug = profile?.booking_slug ?? profile?.slug
    if (!slug) return
    navigator.clipboard.writeText(`https://yourflowdesk.com/booking/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 16px', color: '#6b7280', fontSize: 14 }}>
        Loading profile...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
          {error}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 16px', color: '#6b7280', fontSize: 14 }}>
        No profile found. Complete setup first.
      </div>
    )
  }

  const bookingLink = `https://yourflowdesk.com/booking/${profile.booking_slug ?? profile.slug}`

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Profile</h1>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        )}
      </div>

      {/* Booking Link Card */}
      <div
        style={{
          background: '#eff6ff',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Your Booking Link
          </div>
          <div style={{ fontSize: 13, color: '#1e40af', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {bookingLink}
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          style={{
            padding: '7px 14px',
            background: copied ? '#16a34a' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 200ms',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>

      <Card>
        {!editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ProfileField label="Business Name" value={profile.business_name} />
            <ProfileField label="Phone" value={profile.phone ?? '—'} />
            <ProfileField label="Service Area" value={profile.service_area ?? '—'} />
            <ProfileField label="Email" value={profile.email ?? '—'} />
            <ProfileField label="Booking Slug" value={profile.booking_slug ?? profile.slug ?? '—'} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Mike's Plumbing"
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
            />
            <Input
              label="Service Area"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="Austin, TX and surrounding areas"
            />
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mike@example.com"
              type="email"
            />
            <div>
              <Input
                label="Booking Slug"
                value={bookingSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="mikes-plumbing"
                helper={`yourflowdesk.com/booking/${bookingSlug || '...'}`}
              />
              {bookingSlug && slugStatus !== 'idle' && (
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  {slugStatus === 'checking' && <span style={{ color: '#9ca3af' }}>Checking availability...</span>}
                  {slugStatus === 'available' && <span style={{ color: '#16a34a' }}>✓ Available</span>}
                  {slugStatus === 'taken' && <span style={{ color: '#dc2626' }}>✗ Already taken</span>}
                </div>
              )}
            </div>

            {saveError && (
              <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>{saveError}</p>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
              <Button
                onClick={handleSave}
                loading={isSaving}
                disabled={slugStatus === 'taken'}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#111827' }}>{value}</div>
    </div>
  )
}
