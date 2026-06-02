import { getApiData } from '@/lib/api'
import Link from 'next/link'
import type { Partido } from '@/types'

function calcularResultado(gecGF: number, gecGC: number) {
  if (gecGF > gecGC) return 'V'
  if (gecGF === gecGC) return 'E'
  return 'D'
}

function esGecLocal(local: string): boolean {
  const l = local.toLowerCase()
  return l.includes('gimnasia') &&
    !l.includes('chivilcoy') && !l.includes('gualeguay') &&
    !l.includes('jujuy') && !l.includes('mendoza')
}

type ProximoType = {
  rival: string; fecha: string; hora: string
  condicion: string; torneo: string; estadio: string; colorRival?: string
}

export default async function HomePage() {
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)
  const ultimoPartido = publicados[0]
  const ultimos = publicados.slice(1, 9)
  const proximo = data.proximoPartido as ProximoType | undefined

  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-2xl mx-auto px-3 py-3 space-y-3">

        {/* Banner próximo partido */}
        {proximo && <BannerProximo proximo={proximo} />}

        {/* Último partido — card grande */}
        {ultimoPartido && <UltimoPartido partido={ultimoPartido} />}

        {/* Últimos resultados */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-sm">📋</span>
            <span className="text-xs font-black text-white uppercase tracking-widest">Resultados recientes</span>
            <Link href="/partidos" className="ml-auto text-xs text-blue-300 hover:text-white font-semibold">
              Ver todos →
            </Link>
          </div>

          {(() => {
            const grupos = new Map<string, Partido[]>()
            for (const p of ultimos) {
              const t = p.torneo?.trim() ?? 'Sin torneo'
              if (!grupos.has(t)) grupos.set(t, [])
              grupos.get(t)!.push(p)
            }
            return Array.from(grupos.entries()).map(([torneo, partidos]) => (
              <div key={torneo}>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{torneo}</span>
                </div>
                {partidos.map(p => <ResultadoFila key={p.id} partido={p} />)}
              </div>
            ))
          })()}
        </div>

      </div>
    </main>
  )
}

/* Banner horizontal — estilo loboentrerriano.com */
function BannerProximo({ proximo }: { proximo: ProximoType }) {
  const fecha = new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="rounded-xl overflow-hidden shadow-sm"
      style={{ background: 'linear-gradient(120deg, #1a2e4a 0%, #7b1a1a 100%)' }}>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white/10 rounded-lg p-2 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Próximo Partido</p>
            <p className="text-white font-black text-sm leading-tight truncate">
              vs {proximo.rival}
            </p>
            <p className="text-white/50 text-[10px] mt-0.5">{proximo.torneo.trim()} · {proximo.condicion}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-bold text-sm">{fecha}</p>
          <p className="text-white/70 text-xs">{proximo.hora} hs</p>
          <p className="text-white/50 text-[10px]">{proximo.estadio}</p>
        </div>
      </div>
    </div>
  )
}

/* Card grande del último partido — estilo loboentrerriano.com */
function UltimoPartido({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const rival = gecLocal ? p.visitante : p.local
  const res = calcularResultado(p.gecGF, p.gecGC)

  const resLabel = res === 'V' ? 'Victoria' : res === 'E' ? 'Empate' : 'Derrota'
  const resBg = res === 'V' ? 'bg-green-500' : res === 'E' ? 'bg-orange-400' : 'bg-red-500'

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Link href={`/partido/partido-${p.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header sección */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
        <span className="text-sm">📅</span>
        <span className="text-xs font-black text-white uppercase tracking-widest">Último partido</span>
        <span className="ml-auto text-[10px] text-blue-300 capitalize">{fecha}</span>
      </div>

      {/* Contenido */}
      <div className="px-4 py-5">
        {/* Equipos y marcador */}
        <div className="flex items-center justify-between gap-2">
          {/* GEC */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/escudo-gec" alt="GEC" className="h-16 w-16 object-contain" />
            <p className="text-xs font-bold text-gray-700 text-center leading-tight">
              {gecLocal ? p.local : p.visitante}
            </p>
            <span className="text-[10px] text-gray-400">{gecLocal ? 'Local' : 'Visitante'}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black text-gray-900 tabular-nums">{golesGec}</span>
              <span className="text-2xl text-gray-300 font-light">—</span>
              <span className="text-5xl font-black text-gray-900 tabular-nums">{golesRival}</span>
            </div>
            <span className={`text-xs font-black text-white px-4 py-1 rounded-full ${resBg}`}>
              {resLabel}
            </span>
          </div>

          {/* Rival */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl font-black text-gray-400">
              {rival.charAt(0)}
            </div>
            <p className="text-xs font-bold text-gray-700 text-center leading-tight truncate w-full text-center">{rival}</p>
            <span className="text-[10px] text-gray-400">{gecLocal ? 'Visitante' : 'Local'}</span>
          </div>
        </div>

        {/* Detalles */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: '📅', label: 'Fecha', val: new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) },
            { icon: '🏆', label: 'Torneo', val: p.torneo?.replace(/"/g, '').trim() },
            { icon: '🏠', label: 'Condición', val: gecLocal ? 'Local' : 'Visitante' },
          ].map(d => (
            <div key={d.label} className="bg-gray-50 rounded-lg px-2 py-2 flex items-center gap-2">
              <span className="text-sm">{d.icon}</span>
              <div className="min-w-0">
                <p className="text-[9px] text-gray-400 uppercase tracking-wide">{d.label}</p>
                <p className="text-[11px] font-bold text-gray-700 truncate">{d.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

const RES_STYLE = {
  V: { dot: 'bg-green-500', badge: 'bg-green-50 border-green-200 text-green-700', border: 'border-l-green-500' },
  E: { dot: 'bg-orange-400', badge: 'bg-orange-50 border-orange-200 text-orange-700', border: 'border-l-orange-400' },
  D: { dot: 'bg-red-500', badge: 'bg-red-50 border-red-200 text-red-700', border: 'border-l-red-500' },
}

function ResultadoFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcularResultado(p.gecGF, p.gecGC) as 'V' | 'E' | 'D'
  const s = RES_STYLE[res]

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })

  return (
    <Link
      href={`/partido/partido-${p.id}`}
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors border-l-[3px] border-b border-b-gray-50 last:border-b-0 ${s.border}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate leading-tight">vs {rival}</p>
        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
          {gecLocal ? 'Local' : 'Visitante'} · {fecha}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-black tabular-nums text-gray-800 tracking-tight">
          {golesGec}<span className="text-gray-300 mx-0.5">-</span>{golesRival}
        </span>
        <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-md border ${s.badge}`}>
          {res}
        </span>
      </div>
    </Link>
  )
}
