import { getApiData } from '@/lib/api'

export default async function DTsPage() {
  const data = await getApiData()
  const dts = data.dts.filter((d) => d.apellido && d.pj > 0).sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Directores Técnicos</span>
            <span className="ml-auto text-xs text-blue-300">{dts.length} DTs</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wide">
            <span>Nombre</span>
            <span className="w-7 text-center">PJ</span>
            <span className="w-7 text-center text-green-600">PG</span>
            <span className="w-7 text-center text-orange-500">PE</span>
            <span className="w-7 text-center text-red-500">PP</span>
          </div>
          <div className="divide-y divide-gray-50">
            {dts.map(d => {
              const pct = d.pj > 0 ? Math.round((d.pg / d.pj) * 100) : 0
              return (
                <div key={d.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 items-center px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{d.apellido}, {d.nombres}</p>
                    <p className="text-xs text-gray-400">{pct}% victorias</p>
                  </div>
                  <span className="w-7 text-center text-sm tabular-nums text-gray-600">{d.pj}</span>
                  <span className="w-7 text-center text-sm tabular-nums font-bold text-green-600">{d.pg}</span>
                  <span className="w-7 text-center text-sm tabular-nums font-bold text-orange-500">{d.pe}</span>
                  <span className="w-7 text-center text-sm tabular-nums font-bold text-red-500">{d.pp}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
