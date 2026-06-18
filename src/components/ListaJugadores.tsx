'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fotoUrl } from '@/lib/api'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import Flag from '@/components/Flag'
import { SearchInput } from '@/components/listControls'
import { norm } from '@/lib/norm'
import type { Jugador } from '@/types'

type SortCol = 'nombre' | 'pj' | 'pg' | 'pe' | 'pp' | 'goles' | 'ta' | 'tr'

const REF = [
  { badge: 'PJ', bg: '#475569', label: 'Partidos Jugados' },
  { badge: 'PG', bg: '#16a34a', label: 'Partidos Ganados' },
  { badge: 'PE', bg: '#ca8a04', label: 'Partidos Empatados' },
  { badge: 'PP', bg: '#dc2626', label: 'Partidos Perdidos' },
  { badge: 'GC', bg: '#b45309', label: 'Goles Convertidos' },
  { badge: 'TA', bg: '#854d0e', label: 'Tarjetas Amarillas' },
  { badge: 'TR', bg: '#991b1b', label: 'Tarjetas Rojas' },
]

export default function ListaJugadores({ jugadores }: { jugadores: Jugador[] }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [col, setCol] = useState<SortCol>('nombre')
  const [dir, setDir] = useState<1 | -1>(1)

  const sort = (c: SortCol) => { if (col === c) setDir(d => (d === 1 ? -1 : 1)); else { setCol(c); setDir(c === 'nombre' ? 1 : -1) } }
  const icon = (c: SortCol) => (col === c ? (dir === 1 ? '↑' : '↓') : '↕')

  const visibles = useMemo(() => {
    const term = norm(q.trim())
    const arr = jugadores.filter(j => !term || norm(`${j.apellido} ${j.nombres ?? ''} ${j.posicion ?? ''}`).includes(term))
    return [...arr].sort((a, b) =>
      col === 'nombre' ? a.apellido.localeCompare(b.apellido) * dir : (((a[col] as number) || 0) - ((b[col] as number) || 0)) * dir
    )
  }, [jugadores, q, col, dir])

  return (
    <>
      {/* Referencia de estadísticas */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px]" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <div className="font-semibold text-[0.9rem] text-[#1e293b] mb-3.5">Referencia de estadísticas</div>
        <div className="flex flex-wrap" style={{ gap: '14px 28px' }}>
          {REF.map(r => (
            <div key={r.badge} className="flex items-center gap-2 text-[0.83rem] text-[#64748b]">
              <span className="inline-flex items-center justify-center text-white font-bold text-[0.7rem]" style={{ width: 32, height: 24, borderRadius: 5, background: r.bg }}>{r.badge}</span>
              {r.label}
            </div>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-3"><SearchInput value={q} onChange={setQ} placeholder="Buscar jugador..." /></div>

      {/* Tabla */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse text-[0.875rem]">
          <thead className="bg-[#162032]">
            <tr className="text-white text-[0.78rem] font-semibold uppercase" style={{ letterSpacing: '0.8px' }}>
              <Th onClick={() => sort('nombre')}>Jugador {icon('nombre')}</Th>
              <Th onClick={() => sort('pj')} center>PJ {icon('pj')}</Th>
              <Th onClick={() => sort('pg')} center color="#4ade80">PG {icon('pg')}</Th>
              <Th onClick={() => sort('pe')} center color="#fbbf24">PE {icon('pe')}</Th>
              <Th onClick={() => sort('pp')} center color="#f87171">PP {icon('pp')}</Th>
              <Th onClick={() => sort('goles')} center>⚽ GC {icon('goles')}</Th>
              <Th onClick={() => sort('ta')} center>🟨 {icon('ta')}</Th>
              <Th onClick={() => sort('tr')} center>🟥 {icon('tr')}</Th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-[#94a3b8]">Sin jugadores que coincidan</td></tr>
            ) : visibles.map(j => (
              <tr key={j.id} onClick={() => router.push(`/jugador/${j.id}`)}
                className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] cursor-pointer transition-colors">
                <td className="px-3.5 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PlayerAvatar src={fotoUrl(j.foto)} apellido={j.apellido} size={28} />
                    <Flag pais={j.pais} size={20} />
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                      <Link href={`/jugador/${j.id}`} onClick={e => e.stopPropagation()} className="hover:text-[#2563eb]">{j.apellido}{j.nombres ? `, ${j.nombres}` : ''}</Link>
                      {j.posicion && <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 8, fontWeight: 400 }}>{j.posicion}</span>}
                    </span>
                  </div>
                </td>
                <td className="px-3.5 py-3 text-center font-semibold text-[#1e293b] tabular-nums">{j.pj || 0}</td>
                <td className="px-3.5 py-3 text-center tabular-nums font-bold text-[#16a34a]">{j.pg || 0}</td>
                <td className="px-3.5 py-3 text-center tabular-nums font-bold text-[#ca8a04]">{j.pe || 0}</td>
                <td className="px-3.5 py-3 text-center tabular-nums font-bold text-[#dc2626]">{j.pp || 0}</td>
                <td className="px-3.5 py-3 text-center tabular-nums font-bold" style={{ color: (j.goles || 0) > 0 ? '#2563eb' : '#64748b' }}>{j.goles || 0}</td>
                <td className="px-3.5 py-3 text-center tabular-nums text-[#ca8a04]">{j.ta || 0}</td>
                <td className="px-3.5 py-3 text-center tabular-nums text-[#dc2626]">{j.tr || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Th({ children, center, color, onClick }: { children: React.ReactNode; center?: boolean; color?: string; onClick: () => void }) {
  return (
    <th onClick={onClick} className={`px-3.5 py-2.5 cursor-pointer select-none whitespace-nowrap font-semibold ${center ? 'text-center' : 'text-left'}`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: color ?? '#ffffff' }}>
      {children}
    </th>
  )
}
