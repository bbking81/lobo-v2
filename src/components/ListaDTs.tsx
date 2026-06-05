'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchInput, SortTh, sortIcon } from '@/components/listControls'
import type { DT } from '@/types'

type Col = 'nombre' | 'pj' | 'pg' | 'pe' | 'pp'
const GRID = '1fr auto auto auto auto'

export default function ListaDTs({ dts }: { dts: DT[] }) {
  const [q, setQ] = useState('')
  const [col, setCol] = useState<Col>('pj')
  const [dir, setDir] = useState<1 | -1>(-1)

  const sort = (c: Col) => { if (col === c) setDir(d => (d === 1 ? -1 : 1)); else { setCol(c); setDir(c === 'nombre' ? 1 : -1) } }

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = dts.filter(d => !term || `${d.apellido} ${d.nombres ?? ''}`.toLowerCase().includes(term))
    arr = [...arr].sort((a, b) =>
      col === 'nombre' ? a.apellido.localeCompare(b.apellido) * dir : ((a[col] || 0) - (b[col] || 0)) * dir
    )
    return arr
  }, [dts, q, col, dir])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e2e8f0]">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar técnico..." />
        <span className="ml-auto text-xs text-[#94a3b8] shrink-0">{visibles.length}{visibles.length !== dts.length ? ` de ${dts.length}` : ''} DTs</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 px-4 py-2 bg-[#162032] border-b border-[#e2e8f0] text-[10px] font-bold text-white uppercase tracking-wide" style={{ gridTemplateColumns: GRID }}>
        <SortTh onClick={() => sort('nombre')}>Nombre {sortIcon(col === 'nombre', dir)}</SortTh>
        <SortTh onClick={() => sort('pj')} className="w-7 text-center">PJ {sortIcon(col === 'pj', dir)}</SortTh>
        <SortTh onClick={() => sort('pg')} className="w-7 text-center text-green-600">PG {sortIcon(col === 'pg', dir)}</SortTh>
        <SortTh onClick={() => sort('pe')} className="w-7 text-center text-orange-500">PE {sortIcon(col === 'pe', dir)}</SortTh>
        <SortTh onClick={() => sort('pp')} className="w-7 text-center text-red-500">PP {sortIcon(col === 'pp', dir)}</SortTh>
      </div>
      <div className="divide-y divide-gray-50">
        {visibles.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Sin técnicos que coincidan</div>
        ) : visibles.map(d => {
          const pct = d.pj > 0 ? Math.round((d.pg / d.pj) * 100) : 0
          return (
            <Link key={d.id} href={`/dt/${d.id}`} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 items-center px-4 py-3 hover:bg-gray-50 transition-colors" style={{ gridTemplateColumns: GRID }}>
              <div>
                <p className="text-sm font-bold text-gray-800">{d.apellido}, {d.nombres}</p>
                <p className="text-xs text-gray-400">{pct}% victorias</p>
              </div>
              <span className="w-7 text-center text-sm tabular-nums text-gray-600">{d.pj}</span>
              <span className="w-7 text-center text-sm tabular-nums font-bold text-green-600">{d.pg}</span>
              <span className="w-7 text-center text-sm tabular-nums font-bold text-orange-500">{d.pe}</span>
              <span className="w-7 text-center text-sm tabular-nums font-bold text-red-500">{d.pp}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
