import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaEstadios from '@/components/ListaEstadios'

export const metadata = pageMeta({
  title: 'Estadios de Gimnasia y Esgrima',
  description: 'Estadios donde jugó Gimnasia y Esgrima de Concepción del Uruguay, con partidos y ubicación.',
  path: '/estadios',
})

export default async function EstadiosPage() {
  const data = await getApiData()
  const estadios = data.estadios
    .filter(e => e.nombre && e.pj > 0)
    .sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-3 py-4">
        <SecBanner
          title="Estadios"
          subtitle="Canchas y estadios donde jugó Gimnasia y Esgrima"
          icon={<><path d="M2 19 L2 12 Q2 5 12 5 Q22 5 22 12 L22 19"/><line x1="2" y1="19" x2="22" y2="19"/><path d="M5 19 L5 13 Q5 9 12 9 Q19 9 19 13 L19 19"/><rect x="9" y="16" width="6" height="3" rx="0.4"/></>}
        />
        <ListaEstadios estadios={estadios} />
      </div>
    </main>
  )
}
