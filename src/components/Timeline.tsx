import type { Evento } from '@/types'

interface Props {
  eventos: Evento[]
  local: string
  visitante: string
}

const iconos: Record<string, string> = {
  'gol': '⚽',
  'tarjeta-amarilla': '🟨',
  'tarjeta-roja': '🟥',
  'cambio': '🔄',
}

export default function Timeline({ eventos, local, visitante }: Props) {
  if (!eventos || eventos.length === 0) return null

  const sorted = [...eventos].sort((a, b) => a.min - b.min)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <h2 className="text-sm font-bold text-gray-700 px-4 py-3 border-b border-gray-100 uppercase tracking-wide">
        Eventos
      </h2>

      <div className="divide-y divide-gray-50">
        {sorted.map((ev, i) => {
          const esLocal = ev.equipo === 'local'
          const icono = iconos[ev.tipo] ?? '•'

          return (
            <div key={i} className="flex items-center px-4 py-2.5 gap-3 text-sm">
              {/* Minuto */}
              <span className="text-xs font-bold text-gray-400 w-8 shrink-0 text-right">
                {ev.min}&apos;
              </span>

              {/* Lado local */}
              <div className="flex-1 text-right">
                {esLocal && (
                  <span className="text-gray-800">
                    <span className="font-semibold">{ev.jugador}</span>
                    {ev.tipo === 'cambio' && ev.jugador2 && (
                      <span className="text-gray-400 text-xs"> ↑{ev.jugador2}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Icono central */}
              <span className="text-base shrink-0">{icono}</span>

              {/* Lado visitante */}
              <div className="flex-1 text-left">
                {!esLocal && (
                  <span className="text-gray-800">
                    <span className="font-semibold">{ev.jugador}</span>
                    {ev.tipo === 'cambio' && ev.jugador2 && (
                      <span className="text-gray-400 text-xs"> ↑{ev.jugador2}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
