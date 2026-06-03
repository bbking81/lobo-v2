import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl" style={{ background: 'linear-gradient(to right, #0f1e35, #1e4a8a)' }}>
      <span className="text-[#60a5fa] shrink-0">{icon}</span>
      <span className="text-xs font-bold text-white uppercase tracking-widest">{title}</span>
    </div>
  )
}

export default async function GoleadoresPage() {
  const data = await getApiData()

  const goleadores = data.jugadores
    .filter(j => j.apellido && j.goles > 0)
    .sort((a, b) => b.goles - a.goles || b.pj - a.pj)

  const totalGoles = goleadores.reduce((s, j) => s + j.goles, 0)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[860px]">

        {/* Tabla histórica */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <CardHeader
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>}
            title="Goleadores — Histórico"
          />

          <div className="divide-y divide-[#f1f5f9]">
            {goleadores.slice(0, 30).map((j, i) => {
              const foto = fotoUrl(j.foto)
              const rankColor = i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3a' : '#94a3b8'
              const rankSize = i === 0 ? '1.2rem' : i === 1 ? '1.1rem' : i === 2 ? '1.05rem' : '1rem'
              const pct = totalGoles > 0 ? ((j.goles / totalGoles) * 100).toFixed(1) : '0'

              return (
                <Link
                  key={j.id}
                  href={`/jugador/${j.id}`}
                  className="flex items-center gap-[18px] px-5 py-4 hover:bg-[#f8fafc] transition-colors"
                >
                  {/* Rank */}
                  <span className="w-7 text-center shrink-0 font-bold tabular-nums" style={{ color: rankColor, fontSize: rankSize }}>
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#e2e8f0] border-2 border-[#e2e8f0] shrink-0 flex items-center justify-center overflow-hidden">
                    {foto
                      ? <img src={foto} alt={j.apellido} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                      : <span className="text-[1.1rem] font-bold text-[#64748b]">{j.apellido.charAt(0)}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[0.95rem] text-[#1e293b]">{j.apellido}{j.nombres ? `, ${j.nombres}` : ''}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[0.8rem] text-[#94a3b8]">
                      {j.posicion && <span>{j.posicion}</span>}
                      {j.posicion && <span>·</span>}
                      <span>{j.pj} partidos</span>
                    </div>
                  </div>

                  {/* % partidos con gol */}
                  <div className="text-right shrink-0 min-w-[60px]">
                    <p className="text-[1rem] font-bold text-[#16a34a]">{pct}%</p>
                    <p className="text-[0.72rem] text-[#94a3b8] mt-0.5">del total</p>
                  </div>

                  {/* Goles */}
                  <div className="text-right shrink-0">
                    <p className="text-[2rem] font-black leading-tight" style={{ color: '#2563eb' }}>{j.goles}</p>
                    <p className="text-[0.72rem] text-[#94a3b8] mt-0.5">goles</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}
