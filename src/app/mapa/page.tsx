import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import MapaEstadios, { type EstadioMapa } from '@/components/MapaEstadios'

export default async function MapaPage() {
  const data = await getApiData()
  const estadios = data.estadios.filter(e => e.nombre && e.pj > 0).sort((a, b) => b.pj - a.pj)

  const conCoordenadas = estadios.filter(e => e.lat && e.lng)

  const estadiosMapa: EstadioMapa[] = conCoordenadas.map(e => ({
    id: e.id, nombre: e.nombre, ciudad: e.ciudad, provincia: e.provincia, pais: e.pais,
    pj: e.pj, lat: e.lat as number, lng: e.lng as number, fotoUrl: e.fotoUrl,
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">

        <SecBanner
          title="Mapa Global"
          subtitle="Todos los estadios donde jugó Gimnasia y Esgrima"
          icon={<><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#93c5fd" stroke="none"/></>}
        />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Mapa de Estadios</span>
            <span className="ml-auto text-xs text-blue-300">{conCoordenadas.length} de {estadios.length} ubicados</span>
          </div>

          {estadiosMapa.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-sm font-semibold">Sin estadios ubicados todavía</p>
              <p className="text-xs mt-1">Las coordenadas se cargan desde el admin</p>
            </div>
          ) : (
            <MapaEstadios estadios={estadiosMapa} />
          )}
        </div>

        {/* Lista igual que estadios */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lista de estadios</span>
          </div>
          <div className="divide-y divide-gray-50">
            {estadios.map(e => {
              const ubicacion = [e.ciudad, e.provincia].filter(Boolean).join(', ')
              return (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{e.nombre}</p>
                    {ubicacion && <p className="text-xs text-gray-400">{ubicacion}</p>}
                  </div>
                  <p className="text-sm font-black text-gray-600 shrink-0">{e.pj} PJ</p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}
