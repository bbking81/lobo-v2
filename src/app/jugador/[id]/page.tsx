import { notFound } from 'next/navigation'
import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Partido } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const jugador = data.jugadores.find(j => j.id === parseInt(id))
  if (!jugador) return { title: 'Jugador no encontrado' }
  return { title: `${jugador.nombre} | Lobo Entrerriano` }
}

export default async function JugadorPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const jugador = data.jugadores.find(j => j.id === parseInt(id))

  if (!jugador || !jugador.apellido) notFound()

  const foto = fotoUrl(jugador.foto)
  const esNueva = foto?.includes('_nobg')

  // Partidos en los que participó
  const partidosConJugador = data.partidos
    .filter(p => p.publicado && p.planillaGec?.some(pj => pj.jugador_id === jugador.id))
    .slice(0, 10)

  const edad = jugador.nacimiento
    ? Math.floor((Date.now() - new Date(jugador.nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-[#1e3a5f] text-white px-4 py-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/escudo-gec" alt="GEC" className="h-10 w-10 object-contain" />
        <div>
          <Link href="/" className="font-black text-lg leading-tight hover:text-blue-200 transition-colors">
            Lobo Entrerriano
          </Link>
          <p className="text-blue-200 text-xs">
            <Link href="/jugadores" className="hover:text-white">Plantel</Link>
            {' › '}
            {jugador.apellido}
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* Hero jugador */}
        <div className="bg-[#1e3a5f] rounded-lg overflow-hidden flex">
          {/* Foto */}
          <div className="w-36 shrink-0 flex items-end justify-center bg-[#162e4d] overflow-hidden">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={foto}
                alt={jugador.nombre}
                className={`w-full ${esNueva ? 'h-48 object-contain object-bottom' : 'h-36 object-cover object-top'}`}
              />
            ) : (
              <div className="w-full h-36 flex items-center justify-center">
                <span className="text-6xl font-black text-white/20">{jugador.apellido.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-4 text-white">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">{jugador.posicion ?? 'Sin posición'}</p>
            <h1 className="font-black text-xl leading-tight">{jugador.apellido}</h1>
            <p className="text-blue-200 text-sm">{jugador.nombres}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {edad && (
                <div>
                  <p className="text-blue-300 text-xs">Edad</p>
                  <p className="font-bold">{edad} años</p>
                </div>
              )}
              {jugador.ciudad && (
                <div>
                  <p className="text-blue-300 text-xs">Origen</p>
                  <p className="font-bold text-sm">{jugador.ciudad}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3 border-b border-gray-100">
            Estadísticas
          </h2>
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            <Stat label="Partidos" valor={jugador.pj} />
            <Stat label="Goles" valor={jugador.goles} />
            <Stat label="Amarillas" valor={jugador.ta} />
            <Stat label="Rojas" valor={jugador.tr} />
          </div>
        </div>

        {/* Últimos partidos */}
        {partidosConJugador.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3 border-b border-gray-100">
              Partidos recientes
            </h2>
            <div className="divide-y divide-gray-50">
              {partidosConJugador.map(p => (
                <PartidoFila key={p.id} partido={p} jugadorId={jugador.id} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

function Stat({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex flex-col items-center py-4 gap-1">
      <span className="text-2xl font-black text-gray-800">{valor}</span>
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function PartidoFila({ partido: p, jugadorId }: { partido: Partido; jugadorId: number }) {
  const gecLocal = !p.visitante.toLowerCase().includes('gimnasia') ||
    p.local.toLowerCase().includes('gimnasia')
  const gecEsLocal = p.local.toLowerCase().includes('gimnasia') &&
    !p.local.toLowerCase().includes('chivilcoy') &&
    !p.local.toLowerCase().includes('gualeguay')

  const rival = gecEsLocal ? p.visitante : p.local
  const golesGec = gecEsLocal ? p.gl : p.gv
  const golesRival = gecEsLocal ? p.gv : p.gl
  const gecGF = p.gecGF
  const gecGC = p.gecGC

  const resultado = gecGF > gecGC ? 'V' : gecGF === gecGC ? 'E' : 'D'
  const colorRes = resultado === 'V' ? 'bg-green-600' : resultado === 'E' ? 'bg-yellow-500' : 'bg-red-600'

  // Stats del jugador en este partido
  const stats = p.planillaGec?.find(pj => pj.jugador_id === jugadorId)

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })

  return (
    <Link href={`/partido/partido-${p.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">vs {rival}</p>
        <p className="text-xs text-gray-400">{fecha} · {gecEsLocal ? 'Local' : 'Visitante'}</p>
      </div>

      {/* Stats del jugador */}
      <div className="flex items-center gap-1 text-xs">
        {stats?.goles ? <span>{'⚽'.repeat(Math.min(stats.goles, 3))}</span> : null}
        {stats?.amarillas ? <span>🟨</span> : null}
        {stats?.rojas ? <span>🟥</span> : null}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-black tabular-nums text-gray-700">
          {golesGec}-{golesRival}
        </span>
        <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded text-white ${colorRes}`}>
          {resultado}
        </span>
      </div>
    </Link>
  )
}
