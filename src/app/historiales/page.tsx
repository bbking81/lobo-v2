import { getApiData } from '@/lib/api'
import Link from 'next/link'

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

export default async function HistorialesPage() {
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)

  // Agrupar por rival
  const rivalMap = new Map<string, {
    rival: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; ultimaFecha: string
  }>()

  for (const p of publicados) {
    const gecLocal = esGecLocal(p.local)
    const rival = gecLocal ? p.visitante : p.local
    if (!rivalMap.has(rival)) {
      rivalMap.set(rival, { rival, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, ultimaFecha: p.fecha })
    }
    const r = rivalMap.get(rival)!
    r.pj++
    r.gf += p.gecGF
    r.gc += p.gecGC
    if (p.gecGF > p.gecGC) r.pg++
    else if (p.gecGF === p.gecGC) r.pe++
    else r.pp++
    if (p.fecha > r.ultimaFecha) r.ultimaFecha = p.fecha
  }

  const rivales = Array.from(rivalMap.values())
    .sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 space-y-3">
        {/* Banner */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)' }}>
          <svg className="text-blue-300 shrink-0" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <h1 className="text-white text-2xl font-black leading-tight">Historiales</h1>
            <p className="text-blue-300 text-sm mt-0.5 font-medium">{rivales.length} rivales · historial de enfrentamientos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Historiales</span>
            <span className="ml-auto text-xs text-blue-300">{rivales.length} rivales</span>
          </div>

          {/* Cabecera */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wide">
            <span>Rival</span>
            <span className="w-7 text-center">PJ</span>
            <span className="w-7 text-center text-green-600">PG</span>
            <span className="w-7 text-center text-orange-500">PE</span>
            <span className="w-7 text-center text-red-500">PP</span>
            <span className="w-7 text-center">GF</span>
            <span className="w-7 text-center">GC</span>
          </div>

          <div className="divide-y divide-gray-50">
            {rivales.map(r => {
              const pct = r.pj > 0 ? Math.round((r.pg / r.pj) * 100) : 0
              return (
                <div key={r.rival}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-x-2 items-center px-4 py-2.5 hover:bg-blue-50/40 transition-colors">
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
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
