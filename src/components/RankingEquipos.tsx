'use client'
import { useState } from 'react'
import Link from 'next/link'

export interface EqMatch { id: number; fecha: string; rival: string; gf: number; gc: number; torneo: string }
export interface EqRow { titulo: string; sub: string; valor: string; valorLabel: string; partidos: EqMatch[] }

const fmt = (f: string) => f
  ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—'

export default function RankingEquipos({ rows, label }: { rows: EqRow[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span></div>
      {rows.length === 0 ? <div className="py-8 text-center text-gray-400 text-sm">Sin datos para esos filtros</div> : (
        <div className="divide-y divide-gray-50">
          {rows.map((r, i) => {
            const abierto = open === i
            return (
              <div key={i}>
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-6 text-center text-sm font-black shrink-0">{medal(i)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{r.titulo}</p>
                    <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-[#1e3a5f] tabular-nums leading-none">{r.valor}</p>
                    <p className="text-[0.62rem] text-gray-400 mt-0.5">{r.valorLabel}</p>
                  </div>
                  {r.partidos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOpen(abierto ? null : i)}
                      aria-label={abierto ? 'Ocultar partidos' : 'Ver partidos'}
                      aria-expanded={abierto}
                      className={`shrink-0 rounded-[7px] border px-2 py-1 text-sm transition-colors ${abierto ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >🔍</button>
                  )}
                </div>

                {abierto && r.partidos.length > 0 && (
                  <div className="bg-[#f8fafc] border-t border-gray-200">
                    {r.partidos.map(p => {
                      const res = p.gf > p.gc ? 'G' : p.gf < p.gc ? 'P' : 'E'
                      const rc = res === 'G' ? '#16a34a' : res === 'P' ? '#dc2626' : '#64748b'
                      return (
                        <Link key={p.id} href={`/partido/partido-${p.id}`}
                          className="flex items-center gap-2.5 px-4 py-1.5 border-b border-[#f1f5f9] hover:bg-[#eef2ff] transition-colors">
                          <span className="text-[0.72rem] text-gray-400 shrink-0 min-w-[78px]">{fmt(p.fecha)}</span>
                          <span className="flex-1 min-w-0 truncate text-[0.82rem] font-semibold text-gray-700">{p.rival}</span>
                          <span className="font-extrabold text-[0.82rem] shrink-0 min-w-[38px] text-center tabular-nums" style={{ color: rc }}>{p.gf}-{p.gc}</span>
                          <span className="hidden sm:block text-[0.7rem] text-gray-400 shrink-0 max-w-[150px] truncate">{p.torneo}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
