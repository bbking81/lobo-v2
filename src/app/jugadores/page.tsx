import { getApiData } from '@/lib/api'
import ListaJugadores from '@/components/ListaJugadores'

export default async function JugadoresPage() {
  const data = await getApiData()

  const jugadores = data.jugadores
    .filter(j => j.apellido)
    .sort((a, b) => a.apellido.localeCompare(b.apellido))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[1000px]">
        <ListaJugadores jugadores={jugadores} />
      </div>
    </main>
  )
}
