import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'

export default async function DTRivalesPage() {
  const data = await getApiData()
  const dts = data.dtRivales
    .filter(d => d.apellido)
    .sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4">
        <SecBanner
          title="DT Rivales"
          subtitle="Directores técnicos de equipos rivales"
          icon={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>}
        />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">DT Rivales</span>
            <span className="ml-auto text-xs text-blue-300">{dts.length} entrenadores</span>
          </div>
          <div className="divide-y divide-gray-50">
            {dts.map(d => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                  {d.foto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={d.foto} alt={d.apellido} className="w-full h-full object-cover" />
                    : d.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{d.apellido}, {d.nombres}</p>
                  {d.pais && <p className="text-xs text-gray-400">{d.pais}</p>}
                </div>
                {d.pj > 0 && (
                  <div className="text-right shrink-0 text-sm">
                    <p className="font-black text-gray-700">{d.pj} PJ</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-600 font-bold">{d.pg}</span>
                      {' '}<span className="text-orange-500 font-bold">{d.pe}</span>
                      {' '}<span className="text-red-500 font-bold">{d.pp}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
