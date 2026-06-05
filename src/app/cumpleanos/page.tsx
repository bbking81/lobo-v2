import { getApiData } from '@/lib/api'
import Link from 'next/link'
import CumpleBuscador, { type PartidoLite } from '@/components/CumpleBuscador'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cumpleaños | Lobo Entrerriano' }

export default async function CumpleanosPage() {
  const data = await getApiData()
  const hoy = new Date()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const dd = String(hoy.getDate()).padStart(2, '0')

  const cumplenHoy = data.jugadores.filter(j => {
    if (!j.nacimiento) return false
    const parts = j.nacimiento.split('-')
    return parts.length >= 3 && parts[1] === mm && parts[2] === dd
  })

  const partidos: PartidoLite[] = data.partidos
    .filter(p => p.publicado && p.fecha)
    .map(p => ({
      id: p.id, fecha: p.fecha, local: p.local, visitante: p.visitante,
      gl: p.gl, gv: p.gv, torneo: p.torneo,
      esLocal: p.gl === p.gv ? p.local.toLowerCase().includes('gimnasia') : (p.gecGF === p.gl && p.gecGC === p.gv),
      resultado: p.gecGF > p.gecGC ? 'V' : p.gecGF === p.gecGC ? 'E' : 'D',
    }))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
        <div className="rounded-xl px-7 py-6 flex items-center gap-4" style={{ background: '#1e3a5f' }}>
          <span className="text-3xl">🎂</span>
          <div>
            <p className="text-white font-bold" style={{ fontSize: '1.8rem' }}>Cumpleaños</p>
            <p style={{ fontSize: '0.88rem', color: '#93c5fd' }}>Quién cumple años y qué pasó cada día en la historia del club</p>
          </div>
        </div>

        {/* Hoy cumplen años */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
            <span className="text-[0.8rem] font-bold text-[#1e293b]">🎈 Hoy cumplen años</span>
          </div>
          {cumplenHoy.length === 0 ? (
            <div className="py-6 text-center text-[#94a3b8] text-sm">Nadie cumple años hoy</div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {cumplenHoy.map(j => {
                const edad = j.nacimiento ? hoy.getFullYear() - parseInt(j.nacimiento.split('-')[0]) : null
                return (
                  <Link key={j.id} href={`/jugador/${j.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8fafc] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] border-2 border-[#bfdbfe] flex items-center justify-center text-[0.85rem] font-bold text-[#2563eb] shrink-0">
                      {j.apellido.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1e293b]">{j.apellido}, {j.nombres}</p>
                      <p className="text-[0.72rem] text-[#94a3b8]">{j.posicion ?? '—'}{edad ? ` · ${edad} años` : ''}</p>
                    </div>
                    <span className="text-xl">🎂</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <CumpleBuscador partidos={partidos} hoyDia={String(hoy.getDate())} hoyMes={mm} />
      </div>
    </main>
  )
}
