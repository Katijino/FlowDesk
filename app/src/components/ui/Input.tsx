import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({ label, error, helper, id, style, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        style={{
          padding: '9px 12px',
          fontSize: '14px',
          border: `1px solid ${error ? '#f87171' : '#d1d5db'}`,
          borderRadius: '8px',
          outline: 'none',
          color: '#111827',
          backgroundColor: '#fff',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 150ms',
          ...style,
        }}
      />
      {error && (
        <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>
      )}
      {helper && !error && (
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{helper}</span>
      )}
    </div>
  )
}
