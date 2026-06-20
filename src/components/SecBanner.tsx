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
      className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-3.5 py-4 sm:px-6 sm:py-5 bg-white"
      style={{ border: '0.5px solid #e2e8f0', borderLeft: '4px solid #007ad6', borderRadius: 12, marginBottom: 16, boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}
    >
      <div className="flex items-center" style={{ gap: 14 }}>
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(0,122,214,.12)', color: '#007ad6' }}
        >
          <svg width="28" height="28" fill="none" stroke="#007ad6" strokeWidth="1.8" viewBox="0 0 24 24">
            {icon}
          </svg>
        </span>
        <div>
          <div className="text-[1.3rem] sm:text-[1.8rem]" style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2, lineHeight: 1.15 }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: '0.88rem', color: '#64748b' }}>{subtitle}</div>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
