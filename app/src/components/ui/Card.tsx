import React from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
}

export function Card({ title, subtitle, action, children, style }: CardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}
