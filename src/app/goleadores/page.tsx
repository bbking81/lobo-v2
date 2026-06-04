import { getApiData } from '@/lib/api'
import ListaGoleadores from '@/components/ListaGoleadores'

export default async function GoleadoresPage() {
  const data = await getApiData()

  const goleadores = data.jugadores
    .filter(j => j.apellido && j.goles > 0)
    .sort((a, b) => b.goles - a.goles || b.pj - a.pj)

  const totalGoles = goleadores.reduce((s, j) => s + j.goles, 0)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[860px]">
        <ListaGoleadores goleadores={goleadores} totalGoles={totalGoles} />
      </div>
    </main>
  )
}
