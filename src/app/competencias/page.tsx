import { getApiData, torneoToSlug } from '@/lib/api'
import Link from 'next/link'

const TIPO_STYLES: Record<string, { bg: string; color: string }> = {
  Liga:     { bg: '#dbeafe', color: '#1d4ed8' },
  Copa:     { bg: '#fce7f3', color: '#9d174d' },
  Regional: { bg: '#d1fae5', color: '#065f46' },
  Torneo:   { bg: '#fef3c7', color: '#92400e' },
  Reducido: { bg: '#ede9fe', color: '#5b21b6' },
  Playoff:  { bg: '#ffedd5', color: '#c2410c' },
  Amistoso: { bg: '#f1f5f9', color: '#475569' },
  Otro:     { bg: '#f1f5f9', color: '#475569' },
}

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

interface TorneoResumen {
  nombre: string; slug: string; tipo: string
  pj: number; pg: number; pe: number; pp: number
  gf: number; gc: number; ultimaFecha: string
}

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
  const año = (t: TorneoResumen) => t.ultimaFecha?.slice(0, 4) ?? ''

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5">

        {/* Banner — sec-banner-light del original */}
        <div className="rounded-xl px-7 py-6 mb-4 flex items-center gap-4" style={{ background: '#1e3a5f' }}>
          <svg width="36" height="36" fill="none" stroke="#93c5fd" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 4 }}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
          <div>
            <p className="text-white font-bold mb-1" style={{ fontSize: '1.8rem' }}>Competencias</p>
            <p style={{ fontSize: '0.88rem', color: '#93c5fd' }}>{torneos.length} torneos en la historia del club</p>
          </div>
        </div>

        {/* Grid de cards — repeat(auto-fill, minmax(300px, 1fr)) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {torneos.map(t => {
            const tipo = TIPO_STYLES[t.tipo] ?? TIPO_STYLES.Otro
            const pct = t.pj > 0 ? ((t.pg / t.pj) * 100).toFixed(0) : '0'
            return (
              <Link key={t.nombre} href={`/competencias/${t.slug}`}
                className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col gap-2.5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                {/* Tipo badge */}
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.07em] px-2 py-0.5 rounded self-start"
                  style={{ background: tipo.bg, color: tipo.color }}>
                  {t.tipo}
                </span>

                {/* Nombre + año */}
                <div>
                  <p className="font-bold text-[1rem] text-[#1e293b] leading-tight">{t.nombre}</p>
                  <p className="text-[0.8rem] text-[#94a3b8] font-semibold mt-0.5">{año(t)}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-3 pt-2.5 border-t border-[#e2e8f0]">
                  {[
                    { num: t.pj, label: 'PJ' },
                    { num: t.pg, label: 'PG', color: '#16a34a' },
                    { num: t.pe, label: 'PE', color: '#ca8a04' },
                    { num: t.pp, label: 'PP', color: '#dc2626' },
                    { num: `${pct}%`, label: 'Rend.' },
                  ].map(s => (
                    <div key={s.label} className="flex-1 text-center">
                      <p className="text-[1.1rem] font-black" style={{ color: s.color ?? '#2563eb' }}>{s.num}</p>
                      <p className="text-[0.65rem] text-[#94a3b8] uppercase tracking-[0.05em] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </main>
  )
}
