'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { fotoUrl } from '@/lib/api'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import type { Jugador } from '@/types'

type SortCol = 'nombre' | 'pj' | 'goles' | 'ta' | 'tr'
const GRID = '1fr 60px 60px 48px 48px'
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function ListaJugadores({ jugadores }: { jugadores: Jugador[] }) {
  const [q, setQ] = useState('')
  const [letra, setLetra] = useState<string>('todos')
  const [sortCol, setSortCol] = useState<SortCol>('nombre')
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) { setSortDir(d => (d === 1 ? -1 : 1)) }
    else { setSortCol(col); setSortDir(col === 'nombre' ? 1 : -1) }
  }

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = jugadores.filter(j => {
      if (letra !== 'todos' && (j.apellido?.[0] || '').toUpperCase() !== letra) return false
      if (term && !`${j.apellido} ${j.nombres ?? ''}`.toLowerCase().includes(term)) return false
      return true
    })
    arr = [...arr].sort((a, b) => {
      if (sortCol === 'nombre') return a.apellido.localeCompare(b.apellido) * sortDir
      return (((a[sortCol] as number) || 0) - ((b[sortCol] as number) || 0)) * sortDir
    })
    return arr
  }, [jugadores, q, letra, sortCol, sortDir])

  const icon = (col: SortCol) => (sortCol === col ? (sortDir === 1 ? '↑' : '↓') : '↕')

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ background: 'linear-gradient(to right, #0f1e35, #1e4a8a)' }}>
        <span className="text-[#60a5fa] shrink-0">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </span>
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          Jugadores — {visibles.length}{visibles.length !== jugadores.length ? ` de ${jugadores.length}` : ''} en la historia
        </span>
      </div>

      {/* Controles: buscador + A-Z */}
      <div className="px-4 py-3 border-b border-[#e2e8f0] bg-white flex flex-col gap-3">
        <div className="relative max-w-[280px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg py-2 pl-8 pr-3 text-sm text-[#1e293b] outline-none focus:border-[#2563eb]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <AlphaBtn label="Todos" active={letra === 'todos'} onClick={() => setLetra('todos')} />
          {LETRAS.map(l => <AlphaBtn key={l} label={l} active={letra === l} onClick={() => setLetra(l)} />)}
        </div>
      </div>

      {/* Header de tabla ordenable */}
      <div className="grid items-center text-xs font-semibold uppercase tracking-[0.8px] px-4 py-2.5 select-none"
        style={{ background: '#162032', color: '#fff', gridTemplateColumns: GRID }}>
        <Th onClick={() => toggleSort('nombre')}>Jugador <Sort>{icon('nombre')}</Sort></Th>
        <Th center onClick={() => toggleSort('pj')}>PJ <Sort>{icon('pj')}</Sort></Th>
        <Th center color="#60a5fa" onClick={() => toggleSort('goles')}>⚽ <Sort>{icon('goles')}</Sort></Th>
        <Th center color="#fde047" onClick={() => toggleSort('ta')}>🟨 <Sort>{icon('ta')}</Sort></Th>
        <Th center color="#fca5a5" onClick={() => toggleSort('tr')}>🟥 <Sort>{icon('tr')}</Sort></Th>
      </div>

      {/* Filas */}
      <div className="divide-y divide-[#f1f5f9]">
        {visibles.length === 0 ? (
          <div className="py-10 text-center text-[#94a3b8] text-sm">Sin jugadores que coincidan</div>
        ) : (
          visibles.map(j => (
            <Link key={j.id} href={`/jugador/${j.id}`}
              className="grid items-center gap-x-3 px-4 py-2.5 hover:bg-[#f8fafc] transition-colors"
              style={{ gridTemplateColumns: GRID }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <PlayerAvatar src={fotoUrl(j.foto)} apellido={j.apellido} size={28} />
                <div className="min-w-0">
                  <span className="font-bold text-[0.95rem] text-[#1e293b] truncate block">
                    {j.apellido}{j.nombres ? `, ${j.nombres}` : ''}
                  </span>
                  {j.posicion && <span className="text-[0.72rem] text-[#94a3b8]">{j.posicion}</span>}
                </div>
              </div>
              <span className="text-center text-[#475569] font-semibold text-sm">{j.pj || 0}</span>
              <span className="text-center text-[#2563eb] font-bold text-sm">{j.goles || 0}</span>
              <span className="text-center text-yellow-600 font-semibold text-sm">{j.ta || 0}</span>
              <span className="text-center text-red-700 font-semibold text-sm">{j.tr || 0}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

function AlphaBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 border rounded-md text-[0.82rem] font-semibold transition-colors"
      style={active
        ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
        : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
      {label}
    </button>
  )
}

function Th({ children, center, color, onClick }: { children: React.ReactNode; center?: boolean; color?: string; onClick: () => void }) {
  return (
    <span onClick={onClick} className={`cursor-pointer ${center ? 'text-center' : ''}`} style={color ? { color } : undefined}>
      {children}
    </span>
  )
}
function Sort({ children }: { children: React.ReactNode }) {
  return <span className="opacity-60 text-[0.7rem]">{children}</span>
}
