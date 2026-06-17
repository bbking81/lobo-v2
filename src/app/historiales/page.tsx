import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaHistoriales from '@/components/ListaHistoriales'

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

export const metadata = pageMeta({
  title: 'Historiales vs cada rival — Gimnasia y Esgrima',
  description: 'Historial completo de Gimnasia y Esgrima frente a cada rival: partidos, goles y resultados.',
  path: '/historiales',
})

export default async function HistorialesPage() {
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)

  // Escudo del rival por nombre (igual que Home/Partidos); null → iniciales
  const escudoDe = (nombre: string): string | null => {
    const rl = nombre.toLowerCase()
    const eqs = data.equipos as { nombre?: string; escudoUrl?: string }[]
    let eq = eqs.find(e => (e.nombre || '').toLowerCase() === rl)
    if (!eq) eq = eqs.find(e => rl.includes((e.nombre || '').toLowerCase()) || (e.nombre || '').toLowerCase().includes(rl))
    return eq?.escudoUrl || null
  }

  // Agrupar por rival
  const rivalMap = new Map<string, {
    rival: string; escudoUrl: string | null; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; ultimaFecha: string
  }>()

  for (const p of publicados) {
    const gecLocal = esGecLocal(p.local)
    const rival = gecLocal ? p.visitante : p.local
    if (!rivalMap.has(rival)) {
      rivalMap.set(rival, { rival, escudoUrl: escudoDe(rival), pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, ultimaFecha: p.fecha })
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
    <main className="min-h-screen bg-[#f8fafc]">
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
