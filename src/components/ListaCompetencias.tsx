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

export default function ListaCompetencias({ torneos }: { torneos: TorneoResumen[] }) {
  const [q, setQ] = useState('')
  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    return term ? torneos.filter(t => t.nombre.toLowerCase().includes(term)) : torneos
  }, [torneos, q])

  const año = (t: TorneoResumen) => t.ultimaFecha?.slice(0, 4) ?? ''

  return (
    <>
      <div className="mb-4"><SearchInput value={q} onChange={setQ} placeholder="Buscar torneo..." /></div>
      {visibles.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-10 text-center text-[#94a3b8] text-sm">Sin torneos que coincidan</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {visibles.map(t => {
            const tipo = TIPO_STYLES[t.tipo] ?? TIPO_STYLES.Otro
            const pct = t.pj > 0 ? ((t.pg / t.pj) * 100).toFixed(0) : '0'
            return (
              <Link key={t.nombre} href={`/competencias/${t.slug}`}
                className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col gap-2.5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
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
