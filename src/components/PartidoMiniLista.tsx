import Link from 'next/link'
import type { Partido } from '@/types'

/** Fila compacta de partido reutilizable en las fichas (estadio/árbitro/DT). */
export default function PartidoMiniLista({ partidos }: { partidos: Partido[] }) {
  if (partidos.length === 0) {
    return <div className="py-8 text-center text-[#94a3b8] text-sm">Sin partidos registrados</div>
  }
  return (
    <div className="divide-y divide-[#f1f5f9]">
      {partidos.map(p => {
        const resultado: 'V' | 'E' | 'D' = p.gecGF > p.gecGC ? 'V' : p.gecGF === p.gecGC ? 'E' : 'D'
        const resBg = resultado === 'V' ? '#16a34a' : resultado === 'E' ? '#ca8a04' : '#dc2626'
        const fechaFmt = p.fecha
          ? new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
          : '—'
        return (
          <Link key={p.id} href={`/partido/partido-${p.id}`}
            className="flex items-center gap-3 px-4 py-2.5 text-[0.85rem] hover:bg-[#f8fafc] transition-colors">
            <span className="text-[#475569] min-w-[64px] shrink-0">{fechaFmt}</span>
            <span className="w-[22px] h-[22px] rounded-[5px] text-[0.7rem] font-extrabold flex items-center justify-center shrink-0 text-white" style={{ background: resBg }}>{resultado}</span>
            <span className="flex-1 min-w-0 truncate text-[#1e293b]">
              <span className="font-medium">{p.local}</span>
              <span className="font-bold mx-1.5 tabular-nums">{p.gl}-{p.gv}</span>
              <span className="font-medium">{p.visitante}</span>
            </span>
            <span className="text-[#94a3b8] text-[0.72rem] text-right hidden sm:block shrink-0 max-w-[160px] truncate">{p.torneo}</span>
          </Link>
        )
      })}
    </div>
  )
}
