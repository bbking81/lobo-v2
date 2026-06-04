'use client'

import { useMemo, useState } from 'react'
import { SearchInput, AlphaBar, SortTh, sortIcon } from '@/components/listControls'
import type { Arbitro } from '@/types'

type Col = 'nombre' | 'pj' | 'v' | 'e' | 'd'
const GRID = '1fr auto auto auto auto'
const pjDe = (a: Arbitro) => a.pj || (a.v + a.e + a.d)

export default function ListaArbitros({ arbitros }: { arbitros: Arbitro[] }) {
  const [q, setQ] = useState('')
  const [letra, setLetra] = useState('todos')
  const [col, setCol] = useState<Col>('pj')
  const [dir, setDir] = useState<1 | -1>(-1)

  const sort = (c: Col) => { if (col === c) setDir(d => (d === 1 ? -1 : 1)); else { setCol(c); setDir(c === 'nombre' ? 1 : -1) } }

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = arbitros.filter(a => {
      if (letra !== 'todos' && (a.apellido?.[0] || '').toUpperCase() !== letra) return false
      if (term && !`${a.apellido} ${a.nombres ?? ''}`.toLowerCase().includes(term)) return false
      return true
    })
    arr = [...arr].sort((a, b) =>
      col === 'nombre' ? a.apellido.localeCompare(b.apellido) * dir
        : ((col === 'pj' ? pjDe(a) : (a[col] || 0)) - (col === 'pj' ? pjDe(b) : (b[col] || 0))) * dir
    )
    return arr
  }, [arbitros, q, letra, col, dir])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
        <span className="text-xs font-black text-white uppercase tracking-widest">Árbitros</span>
        <span className="ml-auto text-xs text-blue-300">{visibles.length}{visibles.length !== arbitros.length ? ` de ${arbitros.length}` : ''} árbitros</span>
      </div>
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar árbitro..." />
        <AlphaBar value={letra} onChange={setLetra} />
      </div>
      <div className="grid gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wide" style={{ gridTemplateColumns: GRID }}>
        <SortTh onClick={() => sort('nombre')}>Árbitro {sortIcon(col === 'nombre', dir)}</SortTh>
        <SortTh onClick={() => sort('pj')} className="w-7 text-center">PJ {sortIcon(col === 'pj', dir)}</SortTh>
        <SortTh onClick={() => sort('v')} className="w-7 text-center text-green-600">V {sortIcon(col === 'v', dir)}</SortTh>
        <SortTh onClick={() => sort('e')} className="w-7 text-center text-orange-500">E {sortIcon(col === 'e', dir)}</SortTh>
        <SortTh onClick={() => sort('d')} className="w-7 text-center text-red-500">D {sortIcon(col === 'd', dir)}</SortTh>
      </div>
      <div className="divide-y divide-gray-50">
        {visibles.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Sin árbitros que coincidan</div>
        ) : visibles.map(a => (
          <div key={a.id} className="grid gap-x-2 items-center px-4 py-2.5" style={{ gridTemplateColumns: GRID }}>
            <p className="text-sm font-semibold text-gray-800 truncate">{a.apellido}, {a.nombres}</p>
            <span className="w-7 text-center text-sm tabular-nums text-gray-600">{pjDe(a)}</span>
            <span className="w-7 text-center text-sm tabular-nums font-bold text-green-600">{a.v ?? a.pg}</span>
            <span className="w-7 text-center text-sm tabular-nums font-bold text-orange-500">{a.e ?? a.pe}</span>
            <span className="w-7 text-center text-sm tabular-nums font-bold text-red-500">{a.d ?? a.pp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
