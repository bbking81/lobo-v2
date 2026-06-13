import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaGoleadores from '@/components/ListaGoleadores'

export const metadata = pageMeta({
  title: 'Goleadores históricos de Gimnasia y Esgrima',
  description: 'Ranking de máximos goleadores en la historia de Gimnasia y Esgrima de Concepción del Uruguay.',
  path: '/goleadores',
})

export default async function GoleadoresPage() {
  const data = await getApiData()

  const goleadores = data.jugadores
    .filter(j => j.apellido && j.goles > 0)
    .sort((a, b) => b.goles - a.goles || b.pj - a.pj)

  const totalGoles = goleadores.reduce((s, j) => s + j.goles, 0)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[860px]">
        <SecBanner
          title="Goleadores históricos"
          subtitle="Ranking de goleadores del club"
          icon={<><circle cx="12" cy="12" r="10"/><polygon points="12,6.5 13.5,10 17.2,10 14.3,12.5 15.4,16.2 12,14 8.6,16.2 9.7,12.5 6.8,10 10.5,10" strokeWidth="1.5"/></>}
        />
        <ListaGoleadores goleadores={goleadores} totalGoles={totalGoles} />
      </div>
    </main>
  )
}
