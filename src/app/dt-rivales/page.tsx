import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaDTRivales from '@/components/ListaDTRivales'

export const metadata = pageMeta({
  title: 'DTs rivales de Gimnasia y Esgrima',
  description: 'Directores técnicos rivales que enfrentaron a Gimnasia y Esgrima de Concepción del Uruguay.',
  path: '/dt-rivales',
})

export default async function DTRivalesPage() {
  const data = await getApiData()
  const dts = data.dtRivales
    .filter(d => d.apellido)
    .sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-3 py-4">
        <SecBanner
          title="DT Rivales"
          subtitle="Directores técnicos de equipos rivales"
          icon={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>}
        />
        <ListaDTRivales dts={dts} />
      </div>
    </main>
  )
}
