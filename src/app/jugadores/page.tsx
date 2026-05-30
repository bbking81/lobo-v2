import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'
import type { Jugador } from '@/types'

const ORDEN_POSICION: Record<string, number> = {
  'Arquero': 1,
  'Defensor': 2,
  'Lateral': 3,
  'Mediocampista': 4,
  'Volante': 5,
  'Extremo': 6,
  'Delantero': 7,
}

function ordenPosicion(pos: string | null): number {
  if (!pos) return 99
  for (const [key, val] of Object.entries(ORDEN_POSICION)) {
    if (pos.toLowerCase().includes(key.toLowerCase())) return val
  }
  return 50
}

export default async function JugadoresPage() {
  const data = await getApiData()

  // Solo jugadores con apellido y al menos 1 partido
  const jugadores = data.jugadores
    .filter(j => j.apellido && j.pj > 0)
    .sort((a, b) => {
      const pa = ordenPosicion(a.posicion)
      const pb = ordenPosicion(b.posicion)
      if (pa !== pb) return pa - pb
      return a.apellido.localeCompare(b.apellido)
    })

  // Agrupar por posición
  const grupos = new Map<string, Jugador[]>()
  for (const j of jugadores) {
    const pos = j.posicion ?? 'Sin posición'
    if (!grupos.has(pos)) grupos.set(pos, [])
    grupos.get(pos)!.push(j)
  }

  const escudoGec = '/api/escudo-gec'

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-[#1e3a5f] text-white px-4 py-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={escudoGec} alt="GEC" className="h-10 w-10 object-contain" />
        <div>
          <Link href="/" className="font-black text-lg leading-tight hover:text-blue-200 transition-colors">
            Lobo Entrerriano
          </Link>
          <p className="text-blue-200 text-xs">Plantel</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-3 py-4 space-y-5">
        {Array.from(grupos.entries()).map(([posicion, jugadoresPosicion]) => (
          <section key={posicion}>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
              {posicion}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {jugadoresPosicion.map(j => (
                <TarjetaJugador key={j.id} jugador={j} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function TarjetaJugador({ jugador: j }: { jugador: Jugador }) {
  const foto = fotoUrl(j.foto)
  const esNueva = foto?.includes('_nobg')

  return (
    <Link
      href={`/jugador/${j.id}`}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#1e3a5f] transition-all group"
    >
      {/* Foto */}
      <div className="bg-gray-50 flex items-end justify-center h-36 overflow-hidden relative">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={j.apellido}
            className={`object-cover object-top w-full h-full ${esNueva ? 'object-contain' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/10">
            <span className="text-5xl font-black text-[#1e3a5f]/20">
              {j.apellido.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2 border-t border-gray-100">
        <p className="font-bold text-sm text-gray-800 truncate group-hover:text-[#1e3a5f]">
          {j.apellido}
        </p>
        <p className="text-xs text-gray-400 truncate">{j.nombres}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-500">{j.pj} PJ</span>
          {j.goles > 0 && (
            <span className="text-xs text-gray-500">⚽ {j.goles}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
