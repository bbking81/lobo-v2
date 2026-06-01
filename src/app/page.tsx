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
  const ultimos = data.partidos.filter(p => p.publicado).slice(0, 10)
  const proximo = data.proximoPartido as ProximoType | undefined

  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-2xl mx-auto px-3 py-3 space-y-3">

        {proximo && <ProximoPartido proximo={proximo} />}

        {/* Últimos resultados */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* Section header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <div className="w-1 h-4 bg-[#1e3a5f] rounded-full" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Últimos resultados</span>
            <Link href="/competencias" className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-semibold">
              Ver todos →
            </Link>
          </div>

          {/* Agrupar por torneo */}
          {(() => {
            const grupos = new Map<string, Partido[]>()
            for (const p of ultimos) {
              const t = p.torneo?.trim() ?? 'Sin torneo'
              if (!grupos.has(t)) grupos.set(t, [])
              grupos.get(t)!.push(p)
            }
            return Array.from(grupos.entries()).map(([torneo, partidos]) => (
              <div key={torneo}>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
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

function ProximoPartido({ proximo }: { proximo: ProximoType }) {
  const esLocal = proximo.condicion === 'Local'
  const colorRival = proximo.colorRival ?? '#6b7280'

  const fecha = new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-blue-900/30"
      style={{ background: 'linear-gradient(135deg, #0f2035 0%, #1e3a5f 60%, #1a4a7a 100%)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-[10px] font-black text-[#e8b84b] uppercase tracking-widest">Próximo partido</span>
        <span className="text-[10px] text-blue-300 uppercase tracking-wide">{proximo.torneo.trim()}</span>
      </div>

      {/* Teams + VS */}
      <div className="flex items-center px-4 py-5 gap-3">

        {/* Equipo izquierdo */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          {esLocal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/api/escudo-gec" alt="GEC" className="h-16 w-16 object-contain drop-shadow-lg" />
          ) : (
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-inner"
              style={{ backgroundColor: colorRival }}>
              {proximo.rival.charAt(0)}
            </div>
          )}
          <span className="text-white font-bold text-xs text-center leading-tight line-clamp-2">
            {esLocal ? 'Gimnasia y Esgrima' : proximo.rival}
          </span>
        </div>

        {/* VS central */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 px-2">
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-white/20" />
            <span className="text-2xl font-black text-white/80 tracking-widest">VS</span>
            <div className="h-px w-6 bg-white/20" />
          </div>
          <span className="text-[10px] text-blue-300 font-semibold capitalize">{fecha}</span>
          <div className="bg-[#e8b84b] text-[#0f2035] text-xs font-black px-3 py-0.5 rounded-full">
            {proximo.hora} hs
          </div>
        </div>

        {/* Equipo derecho */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          {!esLocal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/api/escudo-gec" alt="GEC" className="h-16 w-16 object-contain drop-shadow-lg" />
          ) : (
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-inner"
              style={{ backgroundColor: colorRival }}>
              {proximo.rival.charAt(0)}
            </div>
          )}
          <span className="text-white font-bold text-xs text-center leading-tight line-clamp-2">
            {!esLocal ? 'Gimnasia y Esgrima' : proximo.rival}
          </span>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-2 border-t border-white/10">
        <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-[10px] text-blue-300">{proximo.estadio}</span>
      </div>
    </div>
  )
}

const RES_STYLE = {
  V: { dot: 'bg-green-500',  text: 'text-green-600', label: 'V', border: 'border-l-green-500' },
  E: { dot: 'bg-yellow-400', text: 'text-yellow-600', label: 'E', border: 'border-l-yellow-400' },
  D: { dot: 'bg-red-500',    text: 'text-red-600',    label: 'D', border: 'border-l-red-500' },
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
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 transition-colors border-l-[3px] border-b border-b-gray-50 last:border-b-0 ${s.border}`}
    >
      {/* Resultado dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />

      {/* Info partido */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate leading-tight">vs {rival}</p>
        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
          {gecLocal ? 'Local' : 'Visitante'} · {fecha}
        </p>
      </div>

      {/* Score + badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-black tabular-nums text-gray-800 tracking-tight">
          {golesGec}<span className="text-gray-300 mx-0.5">-</span>{golesRival}
        </span>
        <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-md border ${
          res === 'V' ? 'bg-green-50 border-green-200 text-green-700' :
          res === 'E' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
        }`}>
          {s.label}
        </span>
      </div>
    </Link>
  )
}
