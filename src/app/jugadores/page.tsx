import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'
import type { Jugador } from '@/types'
import { PlayerAvatar } from '@/components/PlayerAvatar'

export default async function JugadoresPage() {
  const data = await getApiData()

  const jugadores = data.jugadores
    .filter(j => j.apellido)
    .sort((a, b) => a.apellido.localeCompare(b.apellido))

  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      <div className="px-4 py-4 space-y-4">

        {/* Banner */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)' }}>
          <svg className="text-blue-300 shrink-0" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <div>
            <h1 className="text-white text-2xl font-black leading-tight">Jugadores de Gimnasia y Esgrima</h1>
            <p className="text-blue-300 text-sm mt-0.5 font-medium">{jugadores.length} jugadores en la historia del club</p>
          </div>
        </div>

        {/* Referencia */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Referencia de estadísticas</p>
          <div className="flex flex-wrap gap-3">
            {[
              { k: 'PJ', label: 'Partidos Jugados',  bg: '#334155' },
                { k: 'GC', label: 'Goles Convertidos', bg: '#2563eb' },
              { k: 'TA', label: 'Tarjetas Amarillas',bg: '#ca8a04' },
              { k: 'TR', label: 'Tarjetas Rojas',    bg: '#b91c1c' },
            ].map(r => (
              <div key={r.k} className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-white px-1.5 py-0.5 rounded" style={{background: r.bg}}>{r.k}</span>
                <span className="text-xs text-gray-500">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header tabla */}
          <div className="grid items-center gap-x-2 px-4 py-2.5 text-xs font-black uppercase tracking-wide"
            style={{
              background: '#1a2e4a',
              gridTemplateColumns: '1fr 60px 70px 40px 40px'
            }}>
            <span className="text-white">Jugador</span>
            <span className="text-center text-gray-400">PJ</span>
            <span className="text-center text-blue-400">⚽ GC</span>
            <span className="text-center text-yellow-400">🟨</span>
            <span className="text-center text-red-400">🟥</span>
          </div>

          {/* Filas */}
          <div className="divide-y divide-gray-50">
            {jugadores.map(j => <FilaJugador key={j.id} jugador={j} />)}
          </div>
        </div>

      </div>
    </main>
  )
}

function FilaJugador({ jugador: j }: { jugador: Jugador }) {
  const foto = fotoUrl(j.foto)

  return (
    <Link
      href={`/jugador/${j.id}`}
      className="grid items-center gap-x-2 px-4 py-2.5 hover:bg-blue-50/40 transition-colors text-sm"
      style={{ gridTemplateColumns: '1fr 60px 70px 40px 40px' }}
    >
      {/* Nombre */}
      <div className="flex items-center gap-2 min-w-0">
        <PlayerAvatar src={foto} apellido={j.apellido} size={28} />
        <div className="min-w-0">
          <span className="font-bold text-gray-800 truncate block">
            {j.apellido}{j.nombres ? `, ${j.nombres}` : ''}
          </span>
          {j.posicion && <span className="text-[10px] text-gray-400">{j.posicion}</span>}
        </div>
      </div>

      <span className="text-center text-gray-600 font-semibold">{j.pj || 0}</span>
      <span className="text-center text-blue-600 font-bold">{j.goles || 0}</span>
      <span className="text-center text-yellow-600 font-semibold">{j.ta || 0}</span>
      <span className="text-center text-red-700 font-semibold">{j.tr || 0}</span>
    </Link>
  )
}
