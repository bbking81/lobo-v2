'use client'

import { useEffect, useState } from 'react'

/**
 * Mini-marcador sticky para la ficha de partido (estilo Flashscore).
 * Cuando el cabezal grande del partido sale de pantalla al scrollear, esta
 * barra se desliza hacia abajo desde el tope (translateY) TAPANDO el Topbar
 * (z mayor que el header, que es z-[400]). Reaparece el Topbar al volver
 * arriba. Es client-only; recibe los datos ya resueltos desde la page server.
 */
export default function StickyMarcador({
  local, visitante, escudoLocal, escudoVisit, gl, gv, resLabel, resBg,
}: {
  local: string
  visitante: string
  escudoLocal: string | null
  escudoVisit: string | null
  gl: number
  gv: number
  resLabel: string
  resBg: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // El cabezal grande se marca con #ficha-sentinel justo debajo. Cuando ese
    // punto sube más allá del tope, el cabezal ya pasó → mostramos el
    // mini-marcador (igual que Flashscore). Scroll listener con rAF (barato).
    const el = document.getElementById('ficha-sentinel')
    if (!el) return
    const update = () => setVisible(el.getBoundingClientRect().top < 0)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 z-[500] bg-white"
        style={{
          height: 56,
          borderBottom: '2px solid #007ad6',
          boxShadow: visible ? '0 4px 14px rgba(0,0,0,0.12)' : 'none',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s',
          willChange: 'transform',
        }}
        aria-hidden={!visible}
      >
        <div className="h-full max-w-5xl mx-auto px-4 flex items-center justify-center gap-3 sm:gap-5">
          {/* Local */}
          <div className="flex items-center gap-2 min-w-0 justify-end flex-1">
            <span className="truncate text-right" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>{local}</span>
            <Escudo src={escudoLocal} nombre={local} />
          </div>

          {/* Marcador + estado */}
          <div className="flex flex-col items-center shrink-0">
            <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', lineHeight: 1, letterSpacing: '0.03em' }}>{gl} – {gv}</div>
            <div className="text-white" style={{ marginTop: 3, padding: '1px 9px', borderRadius: 10, background: resBg, fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.09em' }}>{resLabel}</div>
          </div>

          {/* Visitante */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Escudo src={escudoVisit} nombre={visitante} />
            <span className="truncate" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>{visitante}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function Escudo({ src, nombre }: { src: string | null; nombre: string }) {
  return (
    <span className="flex items-center justify-center overflow-hidden shrink-0" style={{ width: 34, height: 34, borderRadius: 7, background: src ? '#f1f5f9' : '#e2e8f0' }}>
      {src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
        : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>{(nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}</span>}
    </span>
  )
}
