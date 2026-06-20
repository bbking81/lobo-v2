import React from 'react'

interface SecBannerProps {
  /** Inner <path>/<circle>/... elements of the icon (24x24 viewBox) */
  icon: React.ReactNode
  title: string
  subtitle?: string
  /** Optional right-side content (e.g. counts, actions) */
  right?: React.ReactNode
}

/**
 * Banner clonado de `.sec-banner-light` del original loboentrerriano.com.
 * Fondo sólido #1e3a5f, ícono con stroke #93c5fd, título 1.8rem.
 */
export default function SecBanner({ icon, title, subtitle, right }: SecBannerProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 bg-white"
      style={{ border: '0.5px solid #e2e8f0', borderLeft: '4px solid #007ad6', borderRadius: 12, marginBottom: 16, boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,122,214,.12)', color: '#007ad6' }}
      >
        <svg width="19" height="19" fill="none" stroke="#007ad6" strokeWidth="1.9" viewBox="0 0 24 24">
          {icon}
        </svg>
      </span>
      <span className="text-[1.05rem] sm:text-[1.2rem]" style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
        {title}
      </span>
      {subtitle && <span className="ml-auto text-right" style={{ fontSize: '0.82rem', color: '#64748b' }}>{subtitle}</span>}
      {right && <span className="shrink-0 ml-auto">{right}</span>}
    </div>
  )
}
