import type { Evento } from '@/types'

interface Props {
  eventos: Evento[]
  local: string
  visitante: string
}

/* Iconos CSS puros igual al original (.ev-icon-amarilla / roja / cambio) */
function IconGol() {
  return <span style={{ fontSize: 16, lineHeight: 1 }}>⚽</span>
}
function IconAmarilla() {
  return (
    <span style={{ width: 22, height: 22, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ display: 'block', width: 10, height: 13, background: '#eab308', borderRadius: 2 }} />
    </span>
  )
}
function IconRoja() {
  return (
    <span style={{ width: 22, height: 22, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ display: 'block', width: 10, height: 13, background: '#ef4444', borderRadius: 2 }} />
    </span>
  )
}
function IconCambio() {
  // Swap rojo (salió ←) + verde (entró →), igual al de la cancha
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 5 H6" stroke="#dc2626" />
      <path d="M8 3 L6 5 L8 7" stroke="#dc2626" />
      <path d="M4 11 H10" stroke="#16a34a" />
      <path d="M8 9 L10 11 L8 13" stroke="#16a34a" />
    </svg>
  )
}

function evIcon(tipo: string) {
  if (tipo === 'gol') return <IconGol />
  if (tipo === 'tarjeta-amarilla') return <IconAmarilla />
  if (tipo === 'tarjeta-roja') return <IconRoja />
  if (tipo === 'cambio') return <IconCambio />
  return <span style={{ fontSize: 14 }}>•</span>
}

export default function Timeline({ eventos }: Props) {
  if (!eventos || eventos.length === 0) return null

  const sorted = [...eventos].sort((a, b) => a.min - b.min)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
      {/* Header — estilo pestaña (blanco + subrayado azul de marca) */}
      <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ background: '#fff', borderBottom: '3px solid #007ad6' }}>
        <svg width="16" height="16" fill="none" stroke="#007ad6" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0f172a' }}>Resumen</span>
      </div>

      {/* Filas — grid 1fr 48px 1fr igual al .tl-row del original */}
      <div>
        {sorted.map((ev, i) => {
          const esLocal = ev.equipo === 'local'

          return (
            <div key={i}
              className="hover:bg-[#f8fafc] transition-colors"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 48px 1fr',
                minHeight: 40,
                borderTop: i > 0 ? '1px solid #f8fafc' : 'none',
              }}
            >
              {/* Celda izquierda (local) */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px 8px 16px', justifyContent: 'flex-end' }}>
                {esLocal && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ minWidth: 0, textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline' }}>
                        {ev.jugador}
                      </span>
                      {ev.tipo === 'cambio' && ev.jugador2 && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>↑ {ev.jugador2}</span>
                      )}
                      {ev.detalle && ev.tipo !== 'cambio' && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{ev.detalle}</span>
                      )}
                    </div>
                    {evIcon(ev.tipo)}
                  </div>
                )}
              </div>

              {/* Celda central — minuto */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  {ev.min}&apos;
                </span>
              </div>

              {/* Celda derecha (visitante) */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 8px 10px' }}>
                {!esLocal && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {evIcon(ev.tipo)}
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline' }}>
                        {ev.jugador}
                      </span>
                      {ev.tipo === 'cambio' && ev.jugador2 && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>↑ {ev.jugador2}</span>
                      )}
                      {ev.detalle && ev.tipo !== 'cambio' && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{ev.detalle}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
