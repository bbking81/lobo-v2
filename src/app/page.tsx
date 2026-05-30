import { getApiData, partidoSlug } from '@/lib/api'
import Link from 'next/link'
import type { Partido } from '@/types'

function calcularResultado(gecGF: number, gecGC: number) {
  if (gecGF > gecGC) return 'Victoria'
  if (gecGF === gecGC) return 'Empate'
  return 'Derrota'
}

const resultadoEstilo: Record<string, { badge: string; borde: string }> = {
  Victoria: { badge: 'bg-green-600 text-white', borde: 'border-l-4 border-green-500' },
  Empate:   { badge: 'bg-yellow-500 text-white', borde: 'border-l-4 border-yellow-400' },
  Derrota:  { badge: 'bg-red-600 text-white', borde: 'border-l-4 border-red-500' },
}

// GEC puede ser local o visitante; detectamos por nombre
function esGecLocal(local: string): boolean {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

export default async function HomePage() {
  const data = await getApiData()

  const ultimos = data.partidos
    .filter(p => p.publicado)
    .slice(0, 8)

  const proximo = data.proximoPartido as {
    rival: string
    fecha: string
    hora: string
    condicion: string
    torneo: string
    estadio: string
    colorRival?: string
  } | undefined

  const escudoGec = '/api/escudo-gec'

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* Próximo partido */}
        {proximo && <ProximoPartido proximo={proximo} escudoGec={escudoGec} />}

        {/* Últimos resultados */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
            Últimos resultados
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50 overflow-hidden">
            {ultimos.map(p => (
              <ResultadoFila key={p.id} partido={p} escudoGec={escudoGec} />
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}

function ProximoPartido({
  proximo,
  escudoGec,
}: {
  proximo: { rival: string; fecha: string; hora: string; condicion: string; torneo: string; estadio: string; colorRival?: string }
  escudoGec?: string
}) {
  const fecha = new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const esLocal = proximo.condicion === 'Local'

  const equipoIzq = esLocal ? 'Gimnasia y Esgrima' : proximo.rival
  const equipoDer = esLocal ? proximo.rival : 'Gimnasia y Esgrima'
  const escudoIzq = esLocal ? escudoGec : undefined
  const escudoDer = esLocal ? undefined : escudoGec
  const colorRival = proximo.colorRival ?? '#888'

  return (
    <section>
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
        Próximo partido
      </h2>
      <div className="bg-[#1e3a5f] text-white rounded-lg overflow-hidden">
        <div className="text-center py-2 text-xs text-blue-200 uppercase tracking-widest border-b border-blue-800">
          {proximo.torneo.trim()}
        </div>

        <div className="flex items-center justify-between px-6 py-5 gap-4">
          <TeamBlock nombre={equipoIzq} escudo={escudoIzq} colorRival={colorRival} />

          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-3xl font-black text-blue-200">VS</span>
            <span className="text-xs text-blue-300 capitalize">{fecha}</span>
            <span className="text-xs text-blue-200">{proximo.hora} hs</span>
          </div>

          <TeamBlock nombre={equipoDer} escudo={escudoDer} colorRival={colorRival} />
        </div>

        <div className="text-center pb-3 text-xs text-blue-200">
          {proximo.estadio}
        </div>
      </div>
    </section>
  )
}

function TeamBlock({ nombre, escudo, colorRival }: { nombre: string; escudo?: string; colorRival: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      {escudo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={escudo} alt={nombre} className="h-14 w-14 object-contain" />
      ) : (
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center text-white text-2xl font-black"
          style={{ backgroundColor: colorRival }}
        >
          {nombre.charAt(0)}
        </div>
      )}
      <span className="font-bold text-sm text-center leading-tight">{nombre}</span>
    </div>
  )
}

function ResultadoFila({ partido: p, escudoGec }: { partido: Partido; escudoGec?: string }) {
  const gecLocal = esGecLocal(p.local)
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const rival = gecLocal ? p.visitante : p.local
  const resultado = calcularResultado(p.gecGF, p.gecGC)
  const estilo = resultadoEstilo[resultado]

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })

  return (
    <Link
      href={`/partido/partido-${p.id}`}
      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${estilo.borde}`}
    >
      {escudoGec && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={escudoGec} alt="GEC" className="h-8 w-8 object-contain shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">vs {rival}</p>
        <p className="text-xs text-gray-400">{p.torneo} · {gecLocal ? 'Local' : 'Visitante'} · {fecha}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-black tabular-nums text-gray-800">
          {golesGec} - {golesRival}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${estilo.badge}`}>
          {resultado.charAt(0)}
        </span>
      </div>
    </Link>
  )
}
