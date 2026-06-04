'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchInput, sortIcon } from '@/components/listControls'
import type { Estadio } from '@/types'

type Col = 'nombre' | 'pj' | 'pg' | 'pe' | 'pp'
const COLS: { c: Col; label: string }[] = [
  { c: 'nombre', label: 'Nombre' }, { c: 'pj', label: 'PJ' },
  { c: 'pg', label: 'PG' }, { c: 'pe', label: 'PE' }, { c: 'pp', label: 'PP' },
]

export default function ListaEstadios({ estadios }: { estadios: Estadio[] }) {
  const [q, setQ] = useState('')
  const [col, setCol] = useState<Col>('pj')
  const [dir, setDir] = useState<1 | -1>(-1)

  const sort = (c: Col) => { if (col === c) setDir(d => (d === 1 ? -1 : 1)); else { setCol(c); setDir(c === 'nombre' ? 1 : -1) } }

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = estadios.filter(e => !term || `${e.nombre} ${e.ciudad ?? ''}`.toLowerCase().includes(term))
    arr = [...arr].sort((a, b) =>
      col === 'nombre' ? a.nombre.localeCompare(b.nombre) * dir : ((a[col] || 0) - (b[col] || 0)) * dir
    )
    return arr
  }, [estadios, q, col, dir])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
        <span className="text-xs font-black text-white uppercase tracking-widest">Estadios</span>
        <span className="ml-auto text-xs text-blue-300">{visibles.length}{visibles.length !== estadios.length ? ` de ${estadios.length}` : ''} estadios</span>
      </div>
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar estadio..." />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1">Ordenar:</span>
          {COLS.map(({ c, label }) => (
            <button key={c} onClick={() => sort(c)}
              className="px-2.5 py-1 border rounded-md text-[0.78rem] font-semibold transition-colors"
              style={col === c ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' } : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
              {label} {sortIcon(col === c, dir)}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {visibles.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Sin estadios que coincidan</div>
        ) : visibles.map(e => {
          const pct = e.pj > 0 ? Math.round((e.pg / e.pj) * 100) : 0
          const ubicacion = [e.ciudad, e.provincia, e.pais].filter(Boolean).join(', ')
          return (
            <Link key={e.id} href={`/estadio/${e.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{e.nombre}</p>
                {ubicacion && <p className="text-xs text-gray-400">{ubicacion}</p>}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 rounded-full bg-gray-100 w-20 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{pct}% V</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-gray-700">{e.pj} PJ</p>
                <p className="text-xs text-gray-400">
                  <span className="text-green-600 font-bold">{e.pg}</span>{' '}
                  <span className="text-orange-500 font-bold">{e.pe}</span>{' '}
                  <span className="text-red-500 font-bold">{e.pp}</span>
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
