import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'

export default async function ArbitrosPage() {
  const data = await getApiData()
  const arbitros = data.arbitros
    .filter(a => a.apellido && (a.pj > 0 || a.v > 0 || a.d > 0))
    .sort((a, b) => (b.pj || b.v + b.e + b.d) - (a.pj || a.v + a.e + a.d))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4">
        <SecBanner
          title="Árbitros"
          subtitle="Todos los árbitros que dirigieron partidos de Gimnasia y Esgrima"
          icon={<><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><line x1="9" y1="12" x2="15" y2="12"/></>}
        />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Árbitros</span>
            <span className="ml-auto text-xs text-blue-300">{arbitros.length} árbitros</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wide">
            <span>Árbitro</span>
            <span className="w-7 text-center">PJ</span>
            <span className="w-7 text-center text-green-600">V</span>
            <span className="w-7 text-center text-orange-500">E</span>
            <span className="w-7 text-center text-red-500">D</span>
          </div>
          <div className="divide-y divide-gray-50">
            {arbitros.map(a => {
              const pj = a.pj || (a.v + a.e + a.d)
              return (
                <div key={a.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 items-center px-4 py-2.5">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.apellido}, {a.nombres}</p>
                  <span className="w-7 text-center text-sm tabular-nums text-gray-600">{pj}</span>
                  <span className="w-7 text-center text-sm tabular-nums font-bold text-green-600">{a.v ?? a.pg}</span>
                  <span className="w-7 text-center text-sm tabular-nums font-bold text-orange-500">{a.e ?? a.pe}</span>
                  <span className="w-7 text-center text-sm tabular-nums font-bold text-red-500">{a.d ?? a.pp}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
