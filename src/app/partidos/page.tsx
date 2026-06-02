import { getApiData } from '@/lib/api'
import Link from 'next/link'
import type { Partido } from '@/types'

interface Props {
  searchParams: Promise<{ torneo?: string; año?: string }>
}

function calcRes(gecGF: number, gecGC: number) {
  if (gecGF > gecGC) return 'V'
  if (gecGF === gecGC) return 'E'
  return 'D'
}

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

const RES = {
  V: { label: 'V', bg: 'bg-green-500',  badge: 'bg-green-50 border-green-200 text-green-700',  dot: 'bg-green-500',  border: 'border-l-green-500'  },
  E: { label: 'E', bg: 'bg-orange-400', badge: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-400', border: 'border-l-orange-400' },
  D: { label: 'D', bg: 'bg-red-500',    badge: 'bg-red-50 border-red-200 text-red-700',          dot: 'bg-red-500',    border: 'border-l-red-500'    },
}

export default async function PartidosPage({ searchParams }: Props) {
  const { torneo: torneoFiltro, año: añoFiltro } = await searchParams
  const data = await getApiData()

  // Listas para filtros
  const publicados = data.partidos.filter(p => p.publicado)
  const torneos = [...new Set(publicados.map(p => p.torneo?.trim()).filter(Boolean))] as string[]
  const años = [...new Set(publicados.map(p => p.fecha?.slice(0, 4)).filter(Boolean))].sort().reverse() as string[]

  // Filtrar
  let filtrados = publicados
  if (torneoFiltro) filtrados = filtrados.filter(p => p.torneo?.trim() === torneoFiltro)
  if (añoFiltro)    filtrados = filtrados.filter(p => p.fecha?.startsWith(añoFiltro))

  // Estadísticas del filtro actual
  const pj = filtrados.length
  const pg = filtrados.filter(p => p.gecGF > p.gecGC).length
  const pe = filtrados.filter(p => p.gecGF === p.gecGC).length
  const pp = filtrados.filter(p => p.gecGF < p.gecGC).length
  const gf = filtrados.reduce((s, p) => s + p.gecGF, 0)
  const gc = filtrados.reduce((s, p) => s + p.gecGC, 0)

  // Agrupar por año
  const grupos = new Map<string, Partido[]>()
  for (const p of filtrados) {
    const año = p.fecha?.slice(0, 4) ?? 'Sin fecha'
    if (!grupos.has(año)) grupos.set(año, [])
    grupos.get(año)!.push(p)
  }

  // URL helper para filtros
  const makeUrl = (newTorneo?: string | null, newAño?: string | null) => {
    const params = new URLSearchParams()
    const t = newTorneo === undefined ? torneoFiltro : (newTorneo ?? undefined)
    const a = newAño === undefined ? añoFiltro : (newAño ?? undefined)
    if (t) params.set('torneo', t)
    if (a) params.set('año', a)
    const q = params.toString()
    return `/partidos${q ? '?' + q : ''}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a] border-b border-gray-100">
            <span className="text-xs font-black text-white uppercase tracking-widest">Partidos</span>
            <span className="ml-auto text-xs text-blue-300">{pj} partidos</span>
          </div>

          {/* Filtro año */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Temporada</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={makeUrl(undefined, null)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${!añoFiltro ? 'bg-[#1a2e4a] text-white border-[#1a2e4a]' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                Todos
              </Link>
              {años.map(a => (
                <Link key={a} href={makeUrl(undefined, a)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${añoFiltro === a ? 'bg-[#1a2e4a] text-white border-[#1a2e4a]' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                  {a}
                </Link>
              ))}
            </div>
          </div>

          {/* Filtro torneo */}
          <div className="px-3 pt-2 pb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Torneo</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={makeUrl(null, undefined)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${!torneoFiltro ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                Todos
              </Link>
              {torneos.slice(0, 10).map(t => (
                <Link key={t} href={makeUrl(t, undefined)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${torneoFiltro === t ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats del filtro */}
        {pj > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {[
              { l: 'PJ', v: pj,   c: 'text-gray-700' },
              { l: 'G',  v: pg,   c: 'text-green-600' },
              { l: 'E',  v: pe,   c: 'text-orange-500' },
              { l: 'P',  v: pp,   c: 'text-red-600' },
              { l: 'GF-GC', v: `${gf}-${gc}`, c: 'text-gray-600' },
            ].map(s => (
              <div key={s.l} className="bg-white rounded-xl border border-gray-100 shadow-sm py-3 flex flex-col items-center gap-0.5">
                <span className={`text-xl font-black ${s.c}`}>{s.v}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.l}</span>
              </div>
            ))}
          </div>
        )}

        {/* Lista de partidos agrupados por año */}
        {pj === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-12 text-center text-gray-400 text-sm">
            No hay partidos con estos filtros
          </div>
        ) : (
          Array.from(grupos.entries()).map(([año, partidos]) => (
            <div key={año} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{año}</span>
                <span className="text-[10px] text-gray-400">{partidos.length} partidos</span>
              </div>
              <div className="divide-y divide-gray-50">
                {partidos.map(p => <PartidoFila key={p.id} partido={p} />)}
              </div>
            </div>
          ))
        )}

      </div>
    </main>
  )
}

function PartidoFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcRes(p.gecGF, p.gecGC) as 'V' | 'E' | 'D'
  const s = RES[res]

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })

  return (
    <Link
      href={`/partido/partido-${p.id}`}
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors border-l-[3px] ${s.border}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate leading-tight">vs {rival}</p>
        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
          {p.torneo?.trim()} · {gecLocal ? 'Local' : 'Visitante'} · {fecha}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-black tabular-nums text-gray-800 tracking-tight">
          {golesGec}<span className="text-gray-300 mx-0.5">-</span>{golesRival}
        </span>
        <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-md border ${s.badge}`}>
          {s.label}
        </span>
      </div>
    </Link>
  )
}
