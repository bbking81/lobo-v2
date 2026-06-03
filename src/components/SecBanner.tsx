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
      className="flex items-center justify-between gap-4"
      style={{ background: '#1e3a5f', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}
    >
      <div className="flex items-start" style={{ gap: 14 }}>
        <svg
          width="36" height="36" fill="none" stroke="#93c5fd" strokeWidth="1.8"
          viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 4 }}
        >
          {icon}
        </svg>
        <div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', marginBottom: 4, lineHeight: 1.15 }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: '0.88rem', color: '#93c5fd' }}>{subtitle}</div>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
