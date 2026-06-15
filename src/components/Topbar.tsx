'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { IndexItem } from '@/app/api/search-index/route'
import { toggleMobileNav, useMobileNav } from '@/lib/useMobileNav'

// Orden, etiqueta, tope de resultados e ícono de cada grupo
const GROUPS: { key: string; label: string; max: number; bg: string; stroke: string; path: React.ReactNode }[] = [
  { key: 'jugadores', label: 'Jugadores', max: 5, bg: '#dbeafe', stroke: '#3b82f6', path: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { key: 'dts', label: 'Directores Técnicos', max: 3, bg: '#dcfce7', stroke: '#16a34a', path: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
  { key: 'estadios', label: 'Estadios', max: 3, bg: '#fef3c7', stroke: '#d97706', path: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
  { key: 'equipos', label: 'Equipos Rivales', max: 3, bg: '#fce7f3', stroke: '#db2777', path: <><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></> },
  { key: 'jugadores-rivales', label: 'Jugadores Rivales', max: 3, bg: '#f3e8ff', stroke: '#9333ea', path: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  { key: 'arbitros', label: 'Árbitros', max: 3, bg: '#fee2e2', stroke: '#dc2626', path: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
]

/**
 * Barra superior full-width clonada de `.topbar` del original loboentrerriano.com.
 * El buscador replica `globalSearch`: dropdown en vivo con jugadores, DTs,
 * estadios, equipos rivales, jugadores rivales y árbitros.
 */
export default function Topbar() {
  const router = useRouter()
  const navOpen = useMobileNav()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState<IndexItem[] | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // Cargar el índice UNA sola vez (al primer foco/tecla)
  const loadIndex = () => {
    if (index || loadingRef.current) return
    loadingRef.current = true
    fetch('/api/search-index')
      .then(r => r.json())
      .then(j => setIndex(j.items ?? []))
      .catch(() => { loadingRef.current = false })
  }

  // Filtrado LOCAL instantáneo (a cada tecla, sin pedidos al servidor)
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 1 || !index) return []
    return GROUPS.map(g => ({
      ...g,
      items: index.filter(it => it.group === g.key && it.q.includes(term)).slice(0, g.max),
    })).filter(g => g.items.length > 0)
  }, [q, index])

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
      className="flex items-center gap-3 lg:gap-8 bg-white w-full shrink-0 sticky top-0 z-[400] relative h-[64px] lg:h-[100px] px-3 lg:px-6"
    >
      {/* Botón hamburguesa ⇄ X (tablet/celular) */}
      <button
        onClick={toggleMobileNav}
        aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
        className="lg:hidden flex items-center justify-center shrink-0 -ml-1 p-2 rounded-lg text-[#1e293b] hover:bg-gray-100"
      >
        {navOpen
          ? <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
      </button>

      {/* Marca */}
      <Link href="/" className="flex items-center gap-2.5 lg:gap-3.5 cursor-pointer shrink-0 min-w-0" title="Ir al inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://loboentrerriano.com/static/logo.png?v=gec2"
          alt="Gimnasia y Esgrima"
          className="h-11 w-11 lg:h-20 lg:w-20 object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://loboentrerriano.com/static/favicon.png' }}
        />
        <div className="min-w-0" style={{ lineHeight: 1.1 }}>
          <div className="whitespace-nowrap truncate text-[1.15rem] lg:text-[2rem]" style={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', fontFamily: 'var(--font-archivo), system-ui, sans-serif', lineHeight: 1 }}>
            Lobo Entrerriano
          </div>
          <div className="whitespace-nowrap uppercase text-[0.5rem] lg:text-[0.62rem]" style={{ fontWeight: 700, color: '#2563eb', letterSpacing: '0.22em', fontFamily: 'var(--font-archivo), system-ui, sans-serif', marginTop: 4 }}>
            · Estadísticas ·
          </div>
        </div>
      </Link>

      {/* Buscador (estilo FBref) — corrido a la derecha, botón lupa */}
      <div ref={boxRef} className="hidden lg:block relative ml-auto" style={{ width: 460 }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center flex-1 bg-white" style={{ height: 48, border: '1.5px solid #cbd5e1', borderRadius: 9, padding: '0 16px' }}>
            <input
              type="text"
              placeholder="Buscar jugador, partido, equipo..."
              value={q}
              onChange={(e) => { loadIndex(); setQ(e.target.value); setOpen(true) }}
              onFocus={() => { loadIndex(); setOpen(true) }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }}
              autoComplete="off"
              className="border-none bg-transparent text-[1.02rem] text-[#1e293b] outline-none w-full placeholder:text-[#94a3b8]"
            />
          </div>
          <button onClick={submit} aria-label="Buscar" className="text-white cursor-pointer flex items-center justify-center shrink-0" style={{ height: 48, padding: '0 18px', background: '#1e3a5f', borderRadius: 9 }}>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7.5" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Dropdown */}
        {open && q.trim().length >= 1 && (
          <div
            className="absolute right-0 bg-white border border-[#e2e8f0] overflow-y-auto z-[9999]"
            style={{ top: 'calc(100% + 8px)', width: 400, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: 480 }}
          >
            {!index ? (
              <div className="p-6 text-center text-[#94a3b8] text-[0.85rem]">Cargando…</div>
            ) : groups.length === 0 ? (
              <div className="p-6 text-center text-[#94a3b8] text-[0.85rem]">
                Sin resultados para <strong>{q.trim()}</strong>
              </div>
            ) : (
              groups.map(g => {
                return (
                  <div key={g.key}>
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 text-[0.78rem] font-bold text-[#334155] uppercase tracking-[0.06em] border-t border-[#f1f5f9] first:border-t-0">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: g.bg }}>
                        <svg width="14" height="14" fill="none" stroke={g.stroke} strokeWidth="2" viewBox="0 0 24 24">{g.path}</svg>
                      </span>
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

      {/* Franja de color de marca (estilo StatsBomb) */}
      <div className="absolute left-0 right-0 bottom-0" style={{ height: 4, background: 'linear-gradient(to right, #e8742c, #1e3a5f)' }} />
    </header>
  )
}
