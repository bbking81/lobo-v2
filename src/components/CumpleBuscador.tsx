'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export interface PartidoLite {
  id: number; fecha: string; local: string; visitante: string
  gl: number; gv: number; torneo: string; esLocal: boolean
  resultado: 'V' | 'E' | 'D'
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function CumpleBuscador({ partidos, hoyDia, hoyMes }: { partidos: PartidoLite[]; hoyDia: string; hoyMes: string }) {
  const [dia, setDia] = useState(hoyDia)
  const [mes, setMes] = useState(hoyMes)

  const resultados = useMemo(() => {
    const d = dia.padStart(2, '0')
    return partidos
      .filter(p => { const [, mm, dd] = p.fecha.split('-'); return mm === mes && dd === d })
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  }, [partidos, dia, mes])

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
      <div className="px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
        <span className="text-[0.8rem] font-bold text-[#1e293b]">🎉 ¿Qué pasó en este día?</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <select value={dia} onChange={e => setDia(e.target.value)} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-3 py-2 text-sm outline-none">
            {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={mes} onChange={e => setMes(e.target.value)} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-3 py-2 text-sm outline-none">
            {MESES.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
          </select>
        </div>

        <p className="text-[0.8rem] text-[#64748b] mb-2.5">{resultados.length} partido{resultados.length !== 1 ? 's' : ''} un {parseInt(dia)} de {MESES[parseInt(mes) - 1]}</p>

        {resultados.length === 0 ? (
          <div className="py-6 text-center text-[#94a3b8] text-sm">Sin partidos en esa fecha</div>
        ) : (
          <div className="border border-[#e2e8f0] rounded-[10px] overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse text-[0.85rem]">
              <thead className="bg-[#162032] text-white text-[0.7rem] uppercase tracking-[0.06em]">
                <tr>
                  <th className="px-3 py-2 text-left font-bold">Año</th>
                  <th className="px-3 py-2 text-left font-bold">Local</th>
                  <th className="px-3 py-2 text-center font-bold">Res.</th>
                  <th className="px-3 py-2 text-left font-bold">Visitante</th>
                  <th className="px-3 py-2 text-left font-bold">Torneo</th>
                  <th className="px-3 py-2 text-center font-bold">Cond.</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map(p => {
                  const resColor = p.resultado === 'V' ? '#16a34a' : p.resultado === 'D' ? '#dc2626' : '#d97706'
                  return (
                    <tr key={p.id} className="border-b border-[#f1f5f9] hover:bg-[rgba(37,99,235,0.07)] transition-colors">
                      <td className="px-3 py-2 text-[#475569]"><Link href={`/partido/partido-${p.id}`} className="block">{p.fecha.split('-')[0]}</Link></td>
                      <td className="px-3 py-2 font-semibold text-[#1e293b]"><Link href={`/partido/partido-${p.id}`} className="block">{p.local}</Link></td>
                      <td className="px-3 py-2 text-center font-bold whitespace-nowrap" style={{ color: resColor }}><Link href={`/partido/partido-${p.id}`} className="block">{p.gl} – {p.gv}</Link></td>
                      <td className="px-3 py-2 text-[#1e293b]"><Link href={`/partido/partido-${p.id}`} className="block">{p.visitante}</Link></td>
                      <td className="px-3 py-2"><span className="bg-[#dbeafe] text-[#2563eb] text-[0.72rem] font-semibold px-2 py-0.5 rounded">{p.torneo || '—'}</span></td>
                      <td className="px-3 py-2 text-center text-[#475569]">{p.esLocal ? 'Local' : 'Visit.'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
