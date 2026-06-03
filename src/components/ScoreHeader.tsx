import type { Partido } from '@/types'

interface Props {
  partido: Partido
  resultado: string
  escudoGec?: string
  escudoRival?: string
}

const RES_STYLE: Record<string, { bg: string; color: string }> = {
  Victoria: { bg: '#dcfce7', color: '#16a34a' },
  Empate:   { bg: '#fef9c3', color: '#854d0e' },
  Derrota:  { bg: '#fee2e2', color: '#dc2626' },
}

export default function ScoreHeader({ partido, resultado, escudoGec, escudoRival }: Props) {
  const { local, visitante, gl, gv, fecha, hora, torneo, estadio } = partido

  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const resBadge = RES_STYLE[resultado] ?? { bg: '#f1f5f9', color: '#475569' }

  return (
    <div className="bg-white border-b border-[#e2e8f0]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

      {/* Torneo — banda superior navy */}
      <div style={{ background: 'linear-gradient(to right, #0f1e35, #1e4a8a)' }} className="text-center py-2 px-4">
        <span className="text-[0.72rem] font-bold text-white uppercase tracking-widest opacity-80">{torneo}</span>
      </div>

      {/* Score principal */}
      <div className="flex items-center justify-between max-w-2xl mx-auto px-6 py-6 gap-4">

        {/* Local */}
        <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
          {escudoGec
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={escudoGec} alt={local} className="h-20 w-20 object-contain" />
            : <div className="h-20 w-20 rounded-xl bg-[#e2e8f0] flex items-center justify-center text-2xl font-black text-[#64748b]">{local.charAt(0)}</div>
          }
          <span className="font-bold text-[0.87rem] text-[#1e293b] text-center leading-tight">{local}</span>
        </div>

        {/* Marcador central */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black tabular-nums text-[#0f172a]" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{gl}</span>
            <span className="text-[#94a3b8] font-light" style={{ fontSize: '1.8rem' }}>—</span>
            <span className="font-black tabular-nums text-[#0f172a]" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{gv}</span>
          </div>
          {resultado && (
            <span className="text-xs font-bold px-4 py-1 rounded-full" style={{ background: resBadge.bg, color: resBadge.color }}>
              {resultado}
            </span>
          )}
          <div className="text-center mt-1">
            <p className="text-[0.72rem] text-[#475569] capitalize">{fechaFormateada}{hora ? ` · ${hora} hs` : ''}</p>
            {estadio && <p className="text-[0.68rem] text-[#94a3b8] mt-0.5">{estadio}</p>}
          </div>
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
          {escudoRival
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={escudoRival} alt={visitante} className="h-20 w-20 object-contain" />
            : <div className="h-20 w-20 rounded-xl bg-[#e2e8f0] flex items-center justify-center text-2xl font-black text-[#64748b]">{visitante.charAt(0)}</div>
          }
          <span className="font-bold text-[0.87rem] text-[#1e293b] text-center leading-tight">{visitante}</span>
        </div>
      </div>
    </div>
  )
}
