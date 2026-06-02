import { getApiData, fotoUrl, torneoToSlug } from '@/lib/api'
import Link from 'next/link'

export default async function GoleadoresPage() {
  const data = await getApiData()

  // Goleadores totales desde jugadores
  const goleadores = data.jugadores
    .filter(j => j.apellido && j.goles > 0)
    .sort((a, b) => b.goles - a.goles || b.pj - a.pj)

  // Goleadores por torneo (desde planillas de partidos)
  const torneoMap = new Map<string, Map<number, { nombre: string; goles: number; jugadorId: number }>>()
  for (const p of data.partidos.filter(x => x.publicado)) {
    const torneo = p.torneo?.trim() ?? 'Sin torneo'
    if (!torneoMap.has(torneo)) torneoMap.set(torneo, new Map())
    const tm = torneoMap.get(torneo)!
    for (const pj of p.planillaGec ?? []) {
      if (!pj.jugador_id || !pj.goles) continue
      if (!tm.has(pj.jugador_id)) {
        tm.set(pj.jugador_id, { nombre: pj.jugador ?? '?', goles: 0, jugadorId: pj.jugador_id })
      }
      tm.get(pj.jugador_id)!.goles += pj.goles
    }
  }

  // Top 5 torneos más recientes con goleadores
  const torneosConGoles = Array.from(torneoMap.entries())
    .map(([nombre, mapa]) => ({
      nombre,
      slug: torneoToSlug(nombre),
      goleadores: Array.from(mapa.values()).filter(g => g.goles > 0).sort((a, b) => b.goles - a.goles).slice(0, 5),
    }))
    .filter(t => t.goleadores.length > 0)
    .slice(0, 6)

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* Banner */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)' }}>
          <svg className="text-blue-300 shrink-0" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <div>
            <h1 className="text-white text-2xl font-black leading-tight">Goleadores</h1>
            <p className="text-blue-300 text-sm mt-0.5 font-medium">Ranking histórico de goles en Gimnasia y Esgrima</p>
          </div>
        </div>

        {/* Tabla histórica */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
            Histórico — todos los tiempos
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {goleadores.slice(0, 20).map((j, i) => {
              const foto = fotoUrl(j.foto)
              return (
                <Link
                  key={j.id}
                  href={`/jugador/${j.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Posición */}
                  <span className={`text-sm font-black w-6 text-center shrink-0 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                    {i + 1}
                  </span>

                  {/* Foto */}
                  <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={foto} alt={j.apellido} className="w-full h-full object-cover object-top" />
                    ) : (
                      j.apellido.charAt(0)
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{j.apellido}</p>
                    <p className="text-xs text-gray-400 truncate">{j.nombres}</p>
                  </div>

                  {/* Goles */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xl font-black text-gray-800 tabular-nums">{j.goles}</span>
                    <span className="text-base">⚽</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Por torneo */}
        {torneosConGoles.map(t => (
          <section key={t.nombre}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.nombre}</h2>
              <Link href={`/competencias/${t.slug}`} className="text-xs text-[#1e3a5f] hover:underline">
                Ver competencia →
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {t.goleadores.map((g, i) => {
                const jugador = data.jugadores.find(j => j.id === g.jugadorId)
                const foto = fotoUrl(jugador?.foto)
                return (
                  <Link
                    key={g.jugadorId}
                    href={`/jugador/${g.jugadorId}`}
                    className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-black w-5 text-center text-gray-300 shrink-0">{i + 1}</span>
                    <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                      {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={foto} alt={g.nombre.split(',')[0]} className="w-full h-full object-cover object-top" />
                      ) : (
                        g.nombre.charAt(0)
                      )}
                    </div>
                    <p className="flex-1 text-sm font-semibold text-gray-800 truncate">{g.nombre.split(',')[0]}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-lg font-black text-gray-800 tabular-nums">{g.goles}</span>
                      <span>⚽</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

      </div>
    </main>
  )
}
