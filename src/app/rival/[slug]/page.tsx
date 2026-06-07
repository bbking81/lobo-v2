import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import PartidoMiniLista from '@/components/PartidoMiniLista'
import FichaStats from '@/components/FichaStats'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${decodeURIComponent(slug)} | Lobo Entrerriano` }
}

export default async function RivalPage({ params }: Props) {
  const { slug } = await params
  const rival = decodeURIComponent(slug)
  const data = await getApiData()

  const partidos = data.partidos
    .filter(p => {
      if (!p.publicado) return false
      const opp = esGecLocal(p.local) ? p.visitante : p.local
      return opp === rival
    })
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  if (partidos.length === 0) notFound()

  let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0
  for (const p of partidos) {
    gf += p.gecGF; gc += p.gecGC
    if (p.gecGF > p.gecGC) pg++
    else if (p.gecGF === p.gecGC) pe++
    else pp++
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
          <p className="text-[#93c5fd] text-xs uppercase tracking-widest mb-1">Historial vs</p>
          <h1 className="font-black text-xl leading-tight">{rival}</h1>
          <p className="text-[#93c5fd] text-sm mt-1">{gf} goles a favor · {gc} en contra</p>
        </div>

        <FichaStats pj={partidos.length} pg={pg} pe={pe} pp={pp} />

        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
            <span className="text-[0.8rem] font-bold text-[#1e293b]">Enfrentamientos ({partidos.length})</span>
          </div>
          <PartidoMiniLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
