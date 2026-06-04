import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import ListaArbitros from '@/components/ListaArbitros'

export default async function ArbitrosPage() {
  const data = await getApiData()
  const arbitros = data.arbitros
    .filter(a => a.apellido && (a.pj > 0 || a.v > 0 || a.d > 0))
    .sort((a, b) => (b.pj || b.v + b.e + b.d) - (a.pj || a.v + a.e + a.d))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4">
        <SecBanner
          title="Árbitros"
          subtitle="Todos los árbitros que dirigieron partidos de Gimnasia y Esgrima"
          icon={<><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><line x1="9" y1="12" x2="15" y2="12"/></>}
        />
        <ListaArbitros arbitros={arbitros} />
      </div>
    </main>
  )
}
