import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ cat?: string }>
}

const CATS = [
  { key: 'goles',     label: 'Goleadores',   field: 'goles' as const },
  { key: 'partidos',  label: 'Más partidos',  field: 'pj' as const },
  { key: 'amarillas', label: 'Amarillas',     field: 'ta' as const },
  { key: 'rojas',     label: 'Rojas',         field: 'tr' as const },
]

export default async function RankingsPage({ searchParams }: Props) {
  const { cat = 'goles' } = await searchParams
  const data = await getApiData()

  const catConfig = CATS.find(c => c.key === cat) ?? CATS[0]

  const ranking = data.jugadores
    .filter(j => j.apellido && (j[catConfig.field] ?? 0) > 0)
    .sort((a, b) => (b[catConfig.field] ?? 0) - (a[catConfig.field] ?? 0))
    .slice(0, 50)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 space-y-3">

        {/* Banner */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)' }}>
          <svg className="text-blue-300 shrink-0" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <div>
            <h1 className="text-white text-2xl font-black leading-tight">Rankings</h1>
            <p className="text-blue-300 text-sm mt-0.5 font-medium">Goleadores, partidos jugados, tarjetas</p>
          </div>
        </div>

        {/* Tabs de categoría */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Rankings</span>
          </div>
          <div className="flex gap-1.5 p-3 flex-wrap">
            {CATS.map(c => (
              <Link key={c.key} href={`/rankings?cat=${c.key}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  cat === c.key
                    ? 'bg-[#1a2e4a] text-white border-[#1a2e4a]'
                    : 'text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{catConfig.label}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {ranking.map((j, i) => {
              const foto = fotoUrl(j.foto)
              const valor = j[catConfig.field] ?? 0
              const medalColor = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'

              return (
                <Link key={j.id} href={`/jugador/${j.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors">
                  <span className={`text-sm font-black w-6 text-center shrink-0 ${medalColor}`}>{i + 1}</span>

                  <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#1a2e4a] flex items-center justify-center text-white text-xs font-bold">
                    {foto
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={foto} alt={j.apellido} className="w-full h-full object-cover object-top" />
                      : j.apellido.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{j.apellido}</p>
                    <p className="text-xs text-gray-400 truncate">{j.nombres} · {j.posicion ?? '—'}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xl font-black text-gray-800 tabular-nums">{valor}</span>
                    <span className="text-sm text-gray-400">
                      {cat === 'goles' ? '⚽' : cat === 'amarillas' ? '🟨' : cat === 'rojas' ? '🟥' : ''}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}
