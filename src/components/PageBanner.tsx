import React from 'react'

interface PageBannerProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
}

export default function PageBanner({ icon, title, subtitle }: PageBannerProps) {
  return (
    <div className="rounded-xl p-6 mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)' }}>
      <div className="text-blue-300 shrink-0 text-3xl">{icon}</div>
      <div>
        <h1 className="text-white text-2xl font-black leading-tight">{title}</h1>
        {subtitle && <p className="text-blue-300 text-sm mt-0.5 font-medium">{subtitle}</p>}
      </div>
    </div>
  )
}
