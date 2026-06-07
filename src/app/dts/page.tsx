import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import ListaDTs from '@/components/ListaDTs'

export default async function DTsPage() {
  const data = await getApiData()
  const dts = data.dts.filter((d) => d.apellido && d.pj > 0).sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-3 py-4">
        <SecBanner
          title="Directores Técnicos"
          subtitle="Cuerpo técnico en la historia del club"
          icon={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></>}
        />
        <ListaDTs dts={dts} />
      </div>
    </main>
  )
}
