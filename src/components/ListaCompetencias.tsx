'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchInput } from '@/components/listControls'

export interface TorneoResumen {
  nombre: string; slug: string; tipo: string
  pj: number; pg: number; pe: number; pp: number
  gf: number; gc: number; ultimaFecha: string
}

const TIPO_STYLES: Record<string, { bg: string; color: string }> = {
  Liga: { bg: '#dbeafe', color: '#1d4ed8' },
  Copa: { bg: '#fce7f3', color: '#9d174d' },
  Regional: { bg: '#d1fae5', color: '#065f46' },
  Torneo: { bg: '#fef3c7', color: '#92400e' },
  Reducido: { bg: '#ede9fe', color: '#5b21b6' },
  Playoff: { bg: '#ffedd5', color: '#c2410c' },
  Amistoso: { bg: '#f1f5f9', color: '#475569' },
  Otro: { bg: '#f1f5f9', color: '#475569' },
}

const TIPOS = ['Liga', 'Copa', 'Regional', 'Torneo', 'Reducido', 'Playoff', 'Amistoso', 'Otro']
const selCls = 'bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-[7px] text-sm text-[#1e293b] outline-none'

export default function ListaCompetencias({ torneos }: { torneos: TorneoResumen[] }) {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [decada, setDecada] = useState('')

  const decadas = useMemo(() => {
    const ds = new Set<string>()
    for (const t of torneos) { const y = parseInt(t.ultimaFecha?.slice(0, 4) ?? ''); if (y) ds.add(String(Math.floor(y / 10) * 10)) }
    return [...ds].sort((a, b) => Number(b) - Number(a))
  }, [torneos])

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    return torneos.filter(t => {
      if (tipo && t.tipo !== tipo) return false
      if (decada) { const y = parseInt(t.ultimaFecha?.slice(0, 4) ?? ''); if (String(Math.floor(y / 10) * 10) !== decada) return false }
      if (term && !t.nombre.toLowerCase().includes(term)) return false
      return true
    })
  }, [torneos, q, tipo, decada])

  const año = (t: TorneoResumen) => t.ultimaFecha?.slice(0, 4) ?? ''

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-2.5 flex-wrap items-center mb-4">
        <select value={tipo} onChange={e => setTipo(e.target.value)} className={selCls}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={decada} onChange={e => setDecada(e.target.value)} className={selCls}>
          <option value="">Todas las décadas</option>
          {decadas.map(d => <option key={d} value={d}>{d}s</option>)}
        </select>
        <div className="flex-1 min-w-[160px]"><SearchInput value={q} onChange={setQ} placeholder="Buscar torneo..." /></div>
      </div>

      {/* Píldora total */}
      <div className="inline-block bg-white border border-[#e2e8f0] text-[0.85rem] font-semibold text-[#1e293b] mb-4" style={{ borderRadius: 30, padding: '8px 18px' }}>
        {visibles.length} competencia{visibles.length !== 1 ? 's' : ''}{visibles.length !== torneos.length ? ` de ${torneos.length}` : ''}
      </div>

      {visibles.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-10 text-center text-[#94a3b8] text-sm">Sin torneos que coincidan</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {visibles.map(t => {
            const tipo = TIPO_STYLES[t.tipo] ?? TIPO_STYLES.Otro
            const pct = t.pj > 0 ? ((t.pg / t.pj) * 100).toFixed(0) : '0'
            return (
              <Link key={t.nombre} href={`/competencias/${t.slug}`}
                className="bg-white border border-[#e2e8f0] rounded-[10px] flex flex-col gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                style={{ padding: '20px 22px' }}>
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.07em] px-2 py-0.5 rounded self-start" style={{ background: tipo.bg, color: tipo.color }}>{t.tipo}</span>
                <div>
                  <p className="font-bold text-[1rem] text-[#1e293b] leading-tight">{t.nombre}</p>
                  <p className="text-[0.8rem] text-[#94a3b8] font-semibold mt-0.5">{año(t)}</p>
                </div>
                <div className="flex gap-3 pt-2.5 border-t border-[#e2e8f0]">
                  {[
                    { num: t.pj, label: 'PJ' },
                    { num: t.pg, label: 'PG', color: '#16a34a' },
                    { num: t.pe, label: 'PE', color: '#ca8a04' },
                    { num: t.pp, label: 'PP', color: '#dc2626' },
                    { num: `${pct}%`, label: 'Rend.' },
                  ].map(s => (
                    <div key={s.label} className="flex-1 text-center">
                      <p className="text-[1.1rem] font-black" style={{ color: s.color ?? '#2563eb' }}>{s.num}</p>
                      <p className="text-[0.65rem] text-[#94a3b8] uppercase tracking-[0.05em] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
