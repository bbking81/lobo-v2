import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaJugadoresRivales from '@/components/ListaJugadoresRivales'

const ORDEN: Record<string, number> = { Arquero: 1, Defensor: 2, Lateral: 3, Mediocampista: 4, Volante: 5, Extremo: 6, Delantero: 7 }
function ordenPos(pos: string | null) {
  if (!pos) return 99
  for (const [k, v] of Object.entries(ORDEN)) if (pos.toLowerCase().includes(k.toLowerCase())) return v
  return 50
}

export const metadata = pageMeta({
  title: 'Jugadores rivales de Gimnasia y Esgrima',
  description: 'Jugadores rivales que enfrentaron a Gimnasia y Esgrima de Concepción del Uruguay.',
  path: '/jugadores-rivales',
})

export default async function JugadoresRivalesPage() {
  const data = await getApiData()
  const jugadores = data.jugadoresRivales
    .filter(j => j.apellido && j.pj > 0)
    .sort((a, b) => ordenPos(a.posicion) - ordenPos(b.posicion) || b.pj - a.pj)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-3 py-4 space-y-3">
        <SecBanner
          title="Jugadores Rivales"
          subtitle="Jugadores de equipos rivales"
          icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
        />
        <ListaJugadoresRivales jugadores={jugadores} />
      </div>
    </main>
  )
}
