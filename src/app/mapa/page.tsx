import Link from 'next/link'
import { pageMeta } from '@/lib/seo'
import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import Flag from '@/components/Flag'
import MapaEstadios, { type EstadioMapa } from '@/components/MapaEstadios'

export const metadata = pageMeta({
  title: 'Mapa de estadios — Gimnasia y Esgrima',
  description: 'Mapa de los estadios donde jugó Gimnasia y Esgrima de Concepción del Uruguay.',
  path: '/mapa',
})

export default async function MapaPage() {
  const data = await getApiData()
  const estadios = data.estadios.filter(e => e.nombre && e.pj > 0).sort((a, b) => b.pj - a.pj)

  const conCoordenadas = estadios.filter(e => e.lat && e.lng)

  const estadiosMapa: EstadioMapa[] = conCoordenadas.map(e => ({
    id: e.id, nombre: e.nombre, ciudad: e.ciudad, provincia: e.provincia, pais: e.pais,
    pj: e.pj, lat: e.lat as number, lng: e.lng as number, fotoUrl: e.fotoUrl,
  }))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">

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
            <MapaEstadios estadios={estadiosMapa} height={520} />
          )}
        </div>

        {/* Lista de estadios — grilla de tarjetas (estilo estadisticascasla.com) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <svg width="15" height="15" fill="none" stroke="#93c5fd" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            <span className="text-xs font-black text-white uppercase tracking-widest">Lista de Estadios</span>
            <span className="ml-auto text-xs text-blue-300">{estadios.length} estadios</span>
          </div>
          <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {estadios.map(e => {
              const ubicacion = [e.ciudad, e.provincia].filter(Boolean).join(', ')
              return (
                <Link
                  key={e.id}
                  href={`/estadio/${e.id}`}
                  className="group flex items-center gap-2.5 px-3 py-2 bg-[#f8fafc] hover:bg-[#eef2ff] border border-[#e2e8f0] rounded-lg transition-colors"
                >
                  <Flag pais={e.pais || 'Argentina'} size={18} />
                  <div className="min-w-0">
                    <p className="text-[0.82rem] font-semibold text-[#1e293b] group-hover:text-[#2563eb] transition-colors truncate leading-tight">{e.nombre}</p>
                    {ubicacion && <p className="text-[0.68rem] text-gray-400 truncate">{ubicacion}</p>}
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
