'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Barra superior full-width clonada de `.topbar` del original loboentrerriano.com:
 * fondo blanco, 90px de alto, logo + marca a la izquierda, buscador a la derecha.
 */
export default function Topbar() {
  const router = useRouter()
  const [q, setQ] = useState('')

  const submit = () => {
    const term = q.trim()
    router.push(term ? `/buscador?q=${encodeURIComponent(term)}` : '/buscador')
  }

  return (
    <header
      className="flex items-center justify-between bg-white border-b border-[#e2e8f0] w-full shrink-0 sticky top-0 z-[200]"
      style={{ height: 90, padding: '0 24px' }}
    >
      {/* Marca */}
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer" title="Ir al inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://loboentrerriano.com/static/logo.png"
          alt="Lobo Entrerriano"
          className="h-[78px] w-[78px] object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://loboentrerriano.com/static/favicon.png' }}
        />
        <div style={{ lineHeight: 1.2 }}>
          <div className="whitespace-nowrap" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.1 }}>
            Lobo Entrerriano
          </div>
          <div className="whitespace-nowrap uppercase" style={{ fontSize: '0.58rem', fontWeight: 600, color: '#2e5cda', letterSpacing: '0.22em', fontFamily: "'Inter', system-ui, sans-serif", marginTop: 3 }}>
            · Estadísticas ·
          </div>
        </div>
      </Link>

      {/* Buscador */}
      <div
        className="hidden sm:flex items-center gap-2 relative"
        style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 20, padding: '7px 14px', width: 260 }}
      >
        <svg width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 cursor-pointer" onClick={submit}>
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          autoComplete="off"
          className="border-none bg-transparent text-[0.85rem] text-[#1e293b] outline-none w-full placeholder:text-[#94a3b8]"
        />
      </div>
    </header>
  )
}
