'use client'

import { useMemo, useState } from 'react'
import { SearchInput, AlphaBar } from '@/components/listControls'
import type { DTRival } from '@/types'

export default function ListaDTRivales({ dts }: { dts: DTRival[] }) {
  const [q, setQ] = useState('')
  const [letra, setLetra] = useState('todos')

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase()
    return dts.filter(d => {
      if (letra !== 'todos' && (d.apellido?.[0] || '').toUpperCase() !== letra) return false
      if (term && !`${d.apellido} ${d.nombres ?? ''}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [dts, q, letra])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar DT rival..." />
          <span className="ml-auto text-xs text-[#94a3b8] shrink-0">{visibles.length}{visibles.length !== dts.length ? ` de ${dts.length}` : ''} entrenadores</span>
        </div>
        <AlphaBar value={letra} onChange={setLetra} />
      </div>
      <div className="divide-y divide-gray-50">
        {visibles.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Sin DTs que coincidan</div>
        ) : visibles.map(d => (
          <div key={d.id} className="flex items-center gap-3 px-4 py-3">
            <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 font-black">
              {d.foto
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={d.foto} alt={d.apellido} className="w-full h-full object-cover" />
                : d.apellido.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{d.apellido}, {d.nombres}</p>
              {d.pais && <p className="text-xs text-gray-400">{d.pais}</p>}
            </div>
            {d.pj > 0 && (
              <div className="text-right shrink-0 text-sm">
                <p className="font-black text-gray-700">{d.pj} PJ</p>
                <p className="text-xs text-gray-400">
                  <span className="text-green-600 font-bold">{d.pg}</span>{' '}
                  <span className="text-orange-500 font-bold">{d.pe}</span>{' '}
                  <span className="text-red-500 font-bold">{d.pp}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
