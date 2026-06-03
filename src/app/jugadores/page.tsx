import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'
import type { Jugador } from '@/types'
import { PlayerAvatar } from '@/components/PlayerAvatar'

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl" style={{ background: 'linear-gradient(to right, #0f1e35, #1e4a8a)' }}>
      <span className="text-[#60a5fa] shrink-0">{icon}</span>
      <span className="text-xs font-bold text-white uppercase tracking-widest">{title}</span>
    </div>
  )
}

export default async function JugadoresPage() {
  const data = await getApiData()

  const jugadores = data.jugadores
    .filter(j => j.apellido)
    .sort((a, b) => a.apellido.localeCompare(b.apellido))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[1000px]">

        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <CardHeader
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            title={`Jugadores — ${jugadores.length} en la historia`}
          />

          {/* Tabla header — bg #162032 igual al original */}
          <div className="grid items-center text-xs font-semibold uppercase tracking-[0.8px] px-4 py-2.5"
            style={{
              background: '#162032',
              color: '#ffffff',
              gridTemplateColumns: '1fr 60px 60px 48px 48px',
            }}>
            <span>Jugador</span>
            <span className="text-center">PJ</span>
            <span className="text-center text-[#60a5fa]">⚽ Goles</span>
            <span className="text-center text-yellow-300">🟨</span>
            <span className="text-center text-red-300">🟥</span>
          </div>

          {/* Filas */}
          <div className="divide-y divide-[#f1f5f9]">
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
      className="grid items-center gap-x-3 px-4 py-2.5 hover:bg-[#f8fafc] transition-colors"
      style={{ gridTemplateColumns: '1fr 60px 60px 48px 48px' }}
    >
      {/* Nombre */}
      <div className="flex items-center gap-2.5 min-w-0">
        <PlayerAvatar src={foto} apellido={j.apellido} size={28} />
        <div className="min-w-0">
          <span className="font-bold text-[0.95rem] text-[#1e293b] truncate block">
            {j.apellido}{j.nombres ? `, ${j.nombres}` : ''}
          </span>
          {j.posicion && <span className="text-[0.72rem] text-[#94a3b8]">{j.posicion}</span>}
        </div>
      </div>

      <span className="text-center text-[#475569] font-semibold text-sm">{j.pj || 0}</span>
      <span className="text-center text-[#2563eb] font-bold text-sm">{j.goles || 0}</span>
      <span className="text-center text-yellow-600 font-semibold text-sm">{j.ta || 0}</span>
      <span className="text-center text-red-700 font-semibold text-sm">{j.tr || 0}</span>
    </Link>
  )
}
