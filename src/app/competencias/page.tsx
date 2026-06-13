import { getApiData, torneoToSlug } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
import SecBanner from '@/components/SecBanner'
import ListaCompetencias, { type TorneoResumen } from '@/components/ListaCompetencias'

function inferirTipo(nombre: string): string {
  const n = nombre.toLowerCase()
  if (n.includes('copa')) return 'Copa'
  if (n.includes('liga')) return 'Liga'
  if (n.includes('regional')) return 'Regional'
  if (n.includes('reducido')) return 'Reducido'
  if (n.includes('playoff') || n.includes('play off')) return 'Playoff'
  if (n.includes('amistoso')) return 'Amistoso'
  if (n.includes('federal') || n.includes('argentino') || n.includes('torneo') || n.includes('primera') || n.includes('nacional')) return 'Torneo'
  return 'Otro'
}

export const metadata = pageMeta({
  title: 'Competencias y torneos de Gimnasia y Esgrima',
  description: 'Historial de Gimnasia y Esgrima por torneo y competencia, con rendimiento y tabla de posiciones.',
  path: '/competencias',
})

export default async function CompetenciasPage() {
  const data = await getApiData()
  const partidos = data.partidos.filter(p => p.publicado)

  const mapaT = new Map<string, TorneoResumen>()
  for (const p of partidos) {
    const nombre = p.torneo?.trim() ?? 'Sin torneo'
    if (!mapaT.has(nombre)) {
      mapaT.set(nombre, { nombre, slug: torneoToSlug(nombre), tipo: inferirTipo(nombre), pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, ultimaFecha: p.fecha })
    }
    const t = mapaT.get(nombre)!
    t.pj++; t.gf += p.gecGF; t.gc += p.gecGC
    if (p.gecGF > p.gecGC) t.pg++
    else if (p.gecGF === p.gecGC) t.pe++
    else t.pp++
    if (p.fecha > t.ultimaFecha) t.ultimaFecha = p.fecha
  }

  const torneos = Array.from(mapaT.values()).sort((a, b) => b.ultimaFecha.localeCompare(a.ultimaFecha))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5">
        <SecBanner
          title="Competencias"
          subtitle="Historial de torneos y competencias del club"
          icon={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>}
        />

        <ListaCompetencias torneos={torneos} />

        <RendimientoTorneo torneos={torneos} />
      </div>
    </main>
  )
}

/* Gráfico "Rendimiento por Torneo" — barras apiladas G/E/P (clon del original) */
function RendimientoTorneo({ torneos }: { torneos: TorneoResumen[] }) {
  const lista = [...torneos]
    .filter(t => t.pj > 0)
    .sort((a, b) => {
      const ya = parseInt((a.ultimaFecha || '0').slice(0, 4)) || 0
      const yb = parseInt((b.ultimaFecha || '0').slice(0, 4)) || 0
      return yb !== ya ? yb - ya : a.nombre.localeCompare(b.nombre)
    })
  if (!lista.length) return null
  const totPG = lista.reduce((s, t) => s + t.pg, 0)
  const totPE = lista.reduce((s, t) => s + t.pe, 0)
  const totPP = lista.reduce((s, t) => s + t.pp, 0)
  const totPJ = lista.reduce((s, t) => s + t.pj, 0)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl mt-7" style={{ borderTop: '3px solid #22c55e', padding: '20px 24px', maxWidth: 820 }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
          <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" /><rect x="10" y="7" width="4" height="14" /><rect x="17" y="3" width="4" height="18" /></svg>
          Rendimiento por Torneo
        </div>
        <div className="flex gap-2">
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>{totPG} G</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#fef9c3', color: '#a16207' }}>{totPE} E</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>{totPP} P</span>
        </div>
      </div>
      <div style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: 18 }}>{totPJ} partidos · {lista.length} torneos</div>

      <div className="flex gap-4 mb-4">
        {[['#16a34a', 'Ganados'], ['#ca8a04', 'Empatados'], ['#dc2626', 'Perdidos']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5" style={{ fontSize: '0.73rem', fontWeight: 600, color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
          </div>
        ))}
      </div>

      <div>
        {lista.map(t => {
          const pctG = t.pj > 0 ? (t.pg / t.pj * 100) : 0
          const pctE = t.pj > 0 ? (t.pe / t.pj * 100) : 0
          const pctP = t.pj > 0 ? (t.pp / t.pj * 100) : 0
          const seg = (w: number, bg: string) => (
            <div className="flex items-center justify-center overflow-hidden" style={{ width: `${w}%`, background: bg, fontSize: '0.67rem', fontWeight: 700, color: '#fff' }}>{w >= 12 ? `${Math.round(w)}%` : ''}</div>
          )
          return (
            <div key={t.nombre} className="flex items-center gap-2.5 mb-2.5">
              <div className="shrink-0 text-right" style={{ width: 185 }}>
                <div className="truncate" style={{ fontSize: '0.77rem', fontWeight: 600, color: '#1e293b' }}>{t.nombre}</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 500 }}>{t.ultimaFecha?.slice(0, 4)}</div>
              </div>
              <div className="flex-1 flex overflow-hidden" style={{ height: 26, background: '#1e293b', borderRadius: 6 }}>
                {seg(pctG, '#16a34a')}{seg(pctE, '#ca8a04')}{seg(pctP, '#dc2626')}
              </div>
              <div className="shrink-0 text-right" style={{ width: 36, fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>{t.pj} PJ</div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center gap-7 mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
        {[[totPG, 'Ganados', '#16a34a'], [totPE, 'Empatados', '#ca8a04'], [totPP, 'Perdidos', '#dc2626'], [totPJ, 'Total PJ', '#94a3b8']].map(([n, l, c]) => (
          <div key={l as string} className="text-center">
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: c as string }}>{n}</div>
            <div className="uppercase" style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.08em' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
