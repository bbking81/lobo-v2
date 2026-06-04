import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import ListaHistoriales from '@/components/ListaHistoriales'

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

export default async function HistorialesPage() {
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)

  // Agrupar por rival
  const rivalMap = new Map<string, {
    rival: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; ultimaFecha: string
  }>()

  for (const p of publicados) {
    const gecLocal = esGecLocal(p.local)
    const rival = gecLocal ? p.visitante : p.local
    if (!rivalMap.has(rival)) {
      rivalMap.set(rival, { rival, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, ultimaFecha: p.fecha })
    }
    const r = rivalMap.get(rival)!
    r.pj++
    r.gf += p.gecGF
    r.gc += p.gecGC
    if (p.gecGF > p.gecGC) r.pg++
    else if (p.gecGF === p.gecGC) r.pe++
    else r.pp++
    if (p.fecha > r.ultimaFecha) r.ultimaFecha = p.fecha
  }

  const rivales = Array.from(rivalMap.values())
    .sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 space-y-3">
        <SecBanner
          title="Historiales de Gimnasia y Esgrima"
          subtitle={`${rivales.length} rivales en el historial`}
          icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
        />
        <ListaHistoriales rivales={rivales} />
      </div>
    </main>
  )
}
