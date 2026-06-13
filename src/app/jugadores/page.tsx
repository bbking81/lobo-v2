import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaJugadores from '@/components/ListaJugadores'

export const metadata = pageMeta({
  title: 'Jugadores de Gimnasia y Esgrima',
  description: 'Todos los jugadores en la historia de Gimnasia y Esgrima de Concepción del Uruguay, con sus partidos, goles y tarjetas.',
  path: '/jugadores',
})

export default async function JugadoresPage() {
  const data = await getApiData()

  const jugadores = data.jugadores
    .filter(j => j.apellido)
    .sort((a, b) => a.apellido.localeCompare(b.apellido))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[1000px]">
        <SecBanner
          title="Jugadores de Gimnasia y Esgrima"
          subtitle={`${jugadores.length} jugadores en la historia del club`}
          icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
        />
        <ListaJugadores jugadores={jugadores} />
      </div>
    </main>
  )
}
