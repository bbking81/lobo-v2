'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchInput, SortTh, sortIcon } from '@/components/listControls'

export interface RivalRow {
  rival: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; ultimaFecha: string
}

type Col = 'rival' | 'pj' | 'pg' | 'pe' | 'pp' | 'gf' | 'gc'
const GRID = '1fr auto auto auto auto auto auto'

export default function ListaHistoriales({ rivales }: { rivales: RivalRow[] }) {
  const [q, setQ] = useState('')
  const [col, setCol] = useState<Col>('pj')
  const [dir, setDir] = useState<1 | -1>(-1)

  const sort = (c: Col) => { if (col === c) setDir(d => (d === 1 ? -1 : 1)); else { setCol(c); setDir(c === 'rival' ? 1 : -1) } }

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = rivales.filter(r => !term || r.rival.toLowerCase().includes(term))
    arr = [...arr].sort((a, b) =>
      col === 'rival' ? a.rival.localeCompare(b.rival) * dir : ((a[col] || 0) - (b[col] || 0)) * dir
    )
    return arr
  }, [rivales, q, col, dir])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
        <span className="text-xs font-black text-white uppercase tracking-widest">Historiales</span>
        <span className="ml-auto text-xs text-blue-300">{visibles.length}{visibles.length !== rivales.length ? ` de ${rivales.length}` : ''} rivales</span>
      </div>
      <div className="px-4 py-3 border-b border-gray-100"><SearchInput value={q} onChange={setQ} placeholder="Buscar rival..." /></div>
      <div className="grid gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wide" style={{ gridTemplateColumns: GRID }}>
        <SortTh onClick={() => sort('rival')}>Rival {sortIcon(col === 'rival', dir)}</SortTh>
        <SortTh onClick={() => sort('pj')} className="w-7 text-center">PJ {sortIcon(col === 'pj', dir)}</SortTh>
        <SortTh onClick={() => sort('pg')} className="w-7 text-center text-green-600">PG {sortIcon(col === 'pg', dir)}</SortTh>
        <SortTh onClick={() => sort('pe')} className="w-7 text-center text-orange-500">PE {sortIcon(col === 'pe', dir)}</SortTh>
        <SortTh onClick={() => sort('pp')} className="w-7 text-center text-red-500">PP {sortIcon(col === 'pp', dir)}</SortTh>
        <SortTh onClick={() => sort('gf')} className="w-7 text-center">GF {sortIcon(col === 'gf', dir)}</SortTh>
        <SortTh onClick={() => sort('gc')} className="w-7 text-center">GC {sortIcon(col === 'gc', dir)}</SortTh>
      </div>
      <div className="divide-y divide-gray-50">
        {visibles.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Sin rivales que coincidan</div>
        ) : visibles.map(r => {
          const pct = r.pj > 0 ? Math.round((r.pg / r.pj) * 100) : 0
          return (
            <Link key={r.rival} href={`/rival/${encodeURIComponent(r.rival)}`} className="grid gap-x-2 items-center px-4 py-2.5 hover:bg-blue-50/40 transition-colors" style={{ gridTemplateColumns: GRID }}>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{r.rival}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 rounded-full bg-gray-100 w-16 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{pct}% V</span>
                </div>
              </div>
              <span className="w-7 text-center text-sm tabular-nums text-gray-600">{r.pj}</span>
              <span className="w-7 text-center text-sm tabular-nums font-bold text-green-600">{r.pg}</span>
              <span className="w-7 text-center text-sm tabular-nums font-bold text-orange-500">{r.pe}</span>
              <span className="w-7 text-center text-sm tabular-nums font-bold text-red-500">{r.pp}</span>
              <span className="w-7 text-center text-sm tabular-nums text-gray-600">{r.gf}</span>
              <span className="w-7 text-center text-sm tabular-nums text-gray-600">{r.gc}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
