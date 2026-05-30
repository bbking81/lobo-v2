import type { Partido } from '@/types'

interface Props {
  partido: Partido
  resultado: string
  escudoGec?: string
  escudoRival?: string
}

const resultadoColor: Record<string, string> = {
  Victoria: 'bg-green-600',
  Empate: 'bg-yellow-500',
  Derrota: 'bg-red-600',
}

export default function ScoreHeader({ partido, resultado, escudoGec, escudoRival }: Props) {
  const { local, visitante, gl, gv, fecha, hora, torneo, estadio } = partido

  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="bg-[#1e3a5f] text-white">
      {/* Torneo */}
      <div className="text-center py-2 text-xs text-blue-200 uppercase tracking-widest border-b border-blue-800">
        {torneo}
      </div>

      {/* Score */}
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4 py-6 gap-4">
        {/* Local */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {escudoGec && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={escudoGec} alt={local} className="h-16 w-16 object-contain" />
          )}
          <span className="font-bold text-sm text-center leading-tight">{local}</span>
        </div>

        {/* Marcador */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black tabular-nums">{gl}</span>
            <span className="text-3xl text-blue-300 font-light">-</span>
            <span className="text-5xl font-black tabular-nums">{gv}</span>
          </div>
          {resultado && (
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${resultadoColor[resultado] ?? 'bg-gray-600'}`}>
              {resultado}
            </span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {escudoRival && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={escudoRival} alt={visitante} className="h-16 w-16 object-contain" />
          )}
          <span className="font-bold text-sm text-center leading-tight">{visitante}</span>
        </div>
      </div>

      {/* Info */}
      <div className="text-center pb-4 text-xs text-blue-200 space-y-0.5">
        <p className="capitalize">{fechaFormateada}{hora ? ` — ${hora}` : ''}</p>
        {estadio && <p>{estadio}</p>}
      </div>
    </div>
  )
}
