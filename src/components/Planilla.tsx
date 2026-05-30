import type { JugadorPlanilla } from '@/types'

interface Props {
  jugadores: JugadorPlanilla[]
  titulo: string
  kit?: Record<string, string>
}

export default function Planilla({ jugadores, titulo, kit }: Props) {
  if (!jugadores || jugadores.length === 0) return null

  const titulares = jugadores.filter(j => j.titular !== false)
  const suplentes = jugadores.filter(j => j.titular === false)
  const colorPrincipal = kit?.color1 ?? '#1e3a5f'

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <h2 className="text-sm font-bold text-gray-700 px-4 py-3 border-b border-gray-100 uppercase tracking-wide">
        {titulo}
      </h2>
      <div className="divide-y divide-gray-50">
        {titulares.map((j, i) => (
          <JugadorFila key={i} jugador={j} colorKit={colorPrincipal} />
        ))}
      </div>
      {suplentes.length > 0 && (
        <>
          <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-t border-gray-100 bg-gray-50">
            Suplentes
          </div>
          <div className="divide-y divide-gray-50">
            {suplentes.map((j, i) => (
              <JugadorFila key={i} jugador={j} colorKit={colorPrincipal} suplente />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function JugadorFila({
  jugador: j,
  colorKit,
  suplente = false,
}: {
  jugador: JugadorPlanilla & { foto?: string | null }
  colorKit: string
  suplente?: boolean
}) {
  // "Apellido, Nombres" → mostrar solo apellido
  const apellido = j.jugador?.split(',')[0]?.trim() ?? '—'
  const fotoUrl = (j as { foto?: string | null }).foto

  return (
    <div className={`flex items-center gap-3 px-4 py-2 ${suplente ? 'opacity-60' : ''}`}>
      {/* Foto o badge número */}
      <div
        className="shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: colorKit }}
      >
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt={apellido} className="w-full h-full object-cover object-top" />
        ) : (
          <span>{j.camiseta ?? '?'}</span>
        )}
      </div>

      {/* Número */}
      <span className="text-xs text-gray-400 w-5 text-right shrink-0">{j.camiseta}</span>

      {/* Nombre */}
      <span className="text-sm text-gray-800 font-medium flex-1">{apellido}</span>

      {/* Eventos */}
      <div className="flex items-center gap-1 text-xs">
        {j.goles ? <span>{'⚽'.repeat(Math.min(j.goles, 3))}</span> : null}
        {j.amarillas ? <span>{'🟨'.repeat(Math.min(j.amarillas, 2))}</span> : null}
        {j.rojas ? <span>🟥</span> : null}
      </div>
    </div>
  )
}
