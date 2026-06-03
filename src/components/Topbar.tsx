'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { SearchGroup } from '@/app/api/search/route'

const GROUP_ICON: Record<string, { bg: string; stroke: string; path: React.ReactNode }> = {
  jugadores: { bg: '#dbeafe', stroke: '#3b82f6', path: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  dts: { bg: '#dcfce7', stroke: '#16a34a', path: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
  estadios: { bg: '#fef3c7', stroke: '#d97706', path: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
  equipos: { bg: '#fce7f3', stroke: '#db2777', path: <><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></> },
  'jugadores-rivales': { bg: '#f3e8ff', stroke: '#9333ea', path: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  arbitros: { bg: '#fee2e2', stroke: '#dc2626', path: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
}

/**
 * Barra superior full-width clonada de `.topbar` del original loboentrerriano.com.
 * El buscador replica `globalSearch`: dropdown en vivo con jugadores, DTs,
 * estadios, equipos rivales, jugadores rivales y árbitros.
 */
export default function Topbar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Buscar con debounce
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setGroups([]); setOpen(false); return }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        const json = await res.json()
        setGroups(json.groups ?? [])
        setOpen(true)
      } catch { /* abortado */ }
    }, 180)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const submit = () => {
    const term = q.trim()
    setOpen(false)
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
      <div ref={boxRef} className="hidden sm:block relative">
        <div
          className="flex items-center gap-2"
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
            onFocus={() => { if (groups.length) setOpen(true) }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }}
            autoComplete="off"
            className="border-none bg-transparent text-[0.85rem] text-[#1e293b] outline-none w-full placeholder:text-[#94a3b8]"
          />
        </div>

        {/* Dropdown */}
        {open && q.trim().length >= 2 && (
          <div
            className="absolute right-0 bg-white border border-[#e2e8f0] overflow-y-auto z-[9999]"
            style={{ top: 'calc(100% + 8px)', width: 400, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: 480 }}
          >
            {groups.length === 0 ? (
              <div className="p-6 text-center text-[#94a3b8] text-[0.85rem]">
                Sin resultados para <strong>{q.trim()}</strong>
              </div>
            ) : (
              groups.map(g => {
                const ic = GROUP_ICON[g.key]
                return (
                  <div key={g.key}>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 text-[0.78rem] font-bold text-[#334155] uppercase tracking-[0.06em] border-t border-[#f1f5f9] first:border-t-0">
                      {ic && (
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: ic.bg }}>
                          <svg width="14" height="14" fill="none" stroke={ic.stroke} strokeWidth="2" viewBox="0 0 24 24">{ic.path}</svg>
                        </span>
                      )}
                      {g.label}
                    </div>
                    {g.items.map((it, i) => (
                      <Link key={`${g.key}-${i}`} href={it.href} onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8fafc] transition-colors">
                        <span className="w-[38px] h-[38px] rounded-full bg-[#e2e8f0] flex items-center justify-center text-[0.75rem] font-bold text-[#64748b] shrink-0 overflow-hidden">
                          {it.foto
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={it.foto} alt="" className="w-full h-full object-cover" />
                            : it.initials}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.88rem] font-semibold text-[#1e293b] truncate">{it.nombre}</div>
                          <div className="text-[0.75rem] text-[#64748b] truncate">{it.sub}</div>
                        </div>
                        {it.count != null && (
                          <div className="text-[0.8rem] font-bold text-[#334155] text-right shrink-0 leading-tight">
                            {it.count}
                            <span className="block text-[0.65rem] text-[#94a3b8] font-normal">partidos</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </header>
  )
}
