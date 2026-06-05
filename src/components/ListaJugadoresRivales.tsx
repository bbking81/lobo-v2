'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchInput, AlphaBar } from '@/components/listControls'
import type { JugadorRival } from '@/types'

export default function ListaJugadoresRivales({ jugadores }: { jugadores: JugadorRival[] }) {
  const [q, setQ] = useState('')
  const [letra, setLetra] = useState('todos')

  const grupos = useMemo(() => {
    const term = q.trim().toLowerCase()
    const filtrados = jugadores.filter(j => {
      if (letra !== 'todos' && (j.apellido?.[0] || '').toUpperCase() !== letra) return false
      if (term && !`${j.apellido} ${j.nombres ?? ''} ${j.equipo ?? ''}`.toLowerCase().includes(term)) return false
      return true
    })
    const map = new Map<string, JugadorRival[]>()
    for (const j of filtrados) {
      const pos = j.posicion ?? 'Sin posición'
      if (!map.has(pos)) map.set(pos, [])
      map.get(pos)!.push(j)
    }
    return Array.from(map.entries())
  }, [jugadores, q, letra])

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar jugador rival..." />
        <AlphaBar value={letra} onChange={setLetra} />
      </div>

      {grupos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-10 text-center text-gray-400 text-sm">
          Sin jugadores que coincidan
        </div>
      ) : grupos.map(([pos, lista]) => (
        <div key={pos} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">{pos}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {lista.map(j => (
              <Link key={j.id} href={`/jugador-rival/${j.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{j.apellido}, {j.nombres}</p>
                  {j.equipo && <p className="text-xs text-gray-400 truncate">{j.equipo}</p>}
                </div>
                <div className="text-right shrink-0 text-xs text-gray-500">
                  <p className="font-bold">{j.pj} PJ</p>
                  {j.goles > 0 && <p className="text-green-600 font-bold">{j.goles} ⚽</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
