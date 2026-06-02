import { getApiData } from '@/lib/api'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function BuscadorPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const data = await getApiData()

  const query = q.toLowerCase().trim()

  const partidos = query.length >= 2
    ? data.partidos.filter(p => p.publicado && (
        p.local.toLowerCase().includes(query) ||
        p.visitante.toLowerCase().includes(query) ||
        p.torneo?.toLowerCase().includes(query)
      )).slice(0, 20)
    : []

  const jugadores = query.length >= 2
    ? data.jugadores.filter(j =>
        j.apellido && (
          j.apellido.toLowerCase().includes(query) ||
          j.nombres?.toLowerCase().includes(query)
        )
      ).slice(0, 10)
    : []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">

        {/* Search input */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Buscador</span>
          </div>
          <form method="GET" className="flex items-center gap-2 p-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar partido, jugador, torneo..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              autoFocus
            />
            <button type="submit"
              className="bg-[#1a2e4a] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#243d5f] transition-colors">
              Buscar
            </button>
          </form>
        </div>

        {/* Resultados jugadores */}
        {jugadores.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jugadores ({jugadores.length})</span>
            </div>
            {jugadores.map(j => (
              <Link key={j.id} href={`/jugador/${j.id}`}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a2e4a] flex items-center justify-center text-white text-xs font-bold">
                  {j.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{j.apellido}, {j.nombres}</p>
                  <p className="text-xs text-gray-400">{j.posicion ?? '—'} · {j.pj} PJ</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Resultados partidos */}
        {partidos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partidos ({partidos.length})</span>
            </div>
            {partidos.map(p => (
              <Link key={p.id} href={`/partido/partido-${p.id}`}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.local} {p.gl} - {p.gv} {p.visitante}</p>
                  <p className="text-xs text-gray-400">{p.torneo} · {p.fecha}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && jugadores.length === 0 && partidos.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-10 text-center text-gray-400 text-sm">
            No se encontraron resultados para &ldquo;{q}&rdquo;
          </div>
        )}

      </div>
    </main>
  )
}
