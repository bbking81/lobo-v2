'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchInput, SortTh, sortIcon } from '@/components/listControls'
import { norm } from '@/lib/norm'

export interface RivalRow {
  rival: string; escudoUrl: string | null; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; ultimaFecha: string
}

type Col = 'rival' | 'pj' | 'pg' | 'pe' | 'pp' | 'dif'
const GRID = 'minmax(0,1fr) 38px 38px 38px 38px minmax(110px,1.4fr) 52px'

const ini = (s: string) => s.trim().split(/\s+/).filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || s.substring(0, 2).toUpperCase()

function EscudoMini({ src, nombre }: { src: string | null; nombre: string }) {
  return src
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={src} alt={nombre} className="w-7 h-7 object-contain shrink-0" />
    : <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[0.6rem] font-extrabold text-white shrink-0">{ini(nombre)}</div>
}

export default function ListaHistoriales({ rivales }: { rivales: RivalRow[] }) {
  const [q, setQ] = useState('')
  const [col, setCol] = useState<Col>('pj')
  const [dir, setDir] = useState<1 | -1>(-1)

  const sort = (c: Col) => { if (col === c) setDir(d => (d === 1 ? -1 : 1)); else { setCol(c); setDir(c === 'rival' ? 1 : -1) } }

  const visibles = useMemo(() => {
    const term = norm(q.trim())
    const arr = rivales.filter(r => !term || norm(r.rival).includes(term))
    const val = (r: RivalRow) => col === 'dif' ? (r.gf - r.gc) : (r[col] as number || 0)
    return [...arr].sort((a, b) =>
      col === 'rival' ? a.rival.localeCompare(b.rival) * dir : (val(a) - val(b)) * dir
    )
  }, [rivales, q, col, dir])

  return (
    <div className="flex flex-col gap-3">
      {/* Buscador (tarjeta propia) */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar rival..." />
        <span className="ml-auto text-xs text-[#94a3b8] shrink-0">{visibles.length}{visibles.length !== rivales.length ? ` de ${rivales.length}` : ''} rivales</span>
      </div>

      {/* Leyenda (entre el buscador y la lista) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 bg-white rounded-xl border border-[#e2e8f0] text-[11px] text-[#64748b]">
        <span className="font-bold text-[#475569]">Leyenda:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#16a34a]" />Ganados</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ca8a04]" />Empatados</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#dc2626]" />Perdidos</span>
        <span className="ml-auto flex items-center gap-3">
          <span><span className="font-bold text-[#16a34a]">+</span> Balance positivo</span>
          <span><span className="font-bold text-[#dc2626]">–</span> Balance negativo</span>
        </span>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 640 }}>
            {/* Cabecera de columnas (blanca + línea azul) */}
            <div className="grid gap-x-2 px-4 py-3 bg-white text-[12px] font-bold text-[#0f172a] uppercase tracking-wide" style={{ gridTemplateColumns: GRID, borderBottom: '2px solid #007ad6' }}>
              <SortTh onClick={() => sort('rival')}>Equipo {sortIcon(col === 'rival', dir)}</SortTh>
              <SortTh onClick={() => sort('pj')} className="text-center">PJ {sortIcon(col === 'pj', dir)}</SortTh>
              <SortTh onClick={() => sort('pg')} className="text-center text-green-600">PG {sortIcon(col === 'pg', dir)}</SortTh>
              <SortTh onClick={() => sort('pe')} className="text-center text-amber-600">PE {sortIcon(col === 'pe', dir)}</SortTh>
              <SortTh onClick={() => sort('pp')} className="text-center text-red-500">PP {sortIcon(col === 'pp', dir)}</SortTh>
              <span className="text-center self-center">Historial</span>
              <SortTh onClick={() => sort('dif')} className="text-center">DIF {sortIcon(col === 'dif', dir)}</SortTh>
            </div>

            {/* Filas */}
            <div className="divide-y divide-gray-50">
            {visibles.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Sin rivales que coincidan</div>
            ) : visibles.map(r => {
              const dif = r.gf - r.gc
              const pgPct = r.pj > 0 ? (r.pg / r.pj) * 100 : 0
              const pePct = r.pj > 0 ? (r.pe / r.pj) * 100 : 0
              const ppPct = r.pj > 0 ? (r.pp / r.pj) * 100 : 0
              const difColor = dif > 0 ? '#16a34a' : dif < 0 ? '#dc2626' : '#94a3b8'
              const difBg = dif > 0 ? '#dcfce7' : dif < 0 ? '#fee2e2' : '#f1f5f9'
              return (
                <Link key={r.rival} href={`/rival/${encodeURIComponent(r.rival)}`} className="grid gap-x-2 items-center px-4 py-2.5 hover:bg-blue-50/40 transition-colors" style={{ gridTemplateColumns: GRID }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <EscudoMini src={r.escudoUrl} nombre={r.rival} />
                    <p className="text-sm font-bold text-gray-800 truncate">{r.rival}</p>
                  </div>
                  <span className="text-center text-sm tabular-nums text-gray-600">{r.pj}</span>
                  <span className="text-center text-sm tabular-nums font-bold text-green-600">{r.pg}</span>
                  <span className="text-center text-sm tabular-nums font-bold text-amber-600">{r.pe}</span>
                  <span className="text-center text-sm tabular-nums font-bold text-red-500">{r.pp}</span>
                  <div className="flex items-center">
                    <div className="flex h-2.5 w-full rounded-full bg-[#eef2f6] overflow-hidden">
                      {pgPct > 0 && <div style={{ width: `${pgPct}%`, background: '#16a34a' }} />}
                      {pePct > 0 && <div style={{ width: `${pePct}%`, background: '#ca8a04' }} />}
                      {ppPct > 0 && <div style={{ width: `${ppPct}%`, background: '#dc2626' }} />}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-[0.72rem] font-bold tabular-nums px-2 py-0.5 rounded-md" style={{ color: difColor, background: difBg }}>
                      {dif > 0 ? `+${dif}` : dif}
                    </span>
                  </div>
                </Link>
              )
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
