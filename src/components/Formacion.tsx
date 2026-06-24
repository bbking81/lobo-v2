'use client'

import { useEffect, useState } from 'react'
import type { JugadorPlanilla } from '@/types'

interface Props {
  jugadoresGec: JugadorPlanilla[]
  jugadoresRival: JugadorPlanilla[]
  formacionGec: string
  formacionRival: string
  kitGec?: Record<string, string>
  kitRival?: Record<string, string>
  localNombre: string
  visitanteNombre: string
}

// Convierte "4-3-3" en [4,3,3]
function parsearFormacion(f: string): number[] {
  return (f ?? '').split('-').map(Number).filter(Boolean)
}

// Distribuye jugadores por líneas según formación (índice 0 = arquero)
function distribuirJugadores(jugadores: JugadorPlanilla[], formacion: number[]): JugadorPlanilla[][] {
  const titulares = jugadores.filter(j => j.titular !== false).slice(0, 11)
  const resultado: JugadorPlanilla[][] = []
  resultado.push(titulares.slice(0, 1)) // arquero
  let idx = 1
  for (const cantidad of formacion) {
    resultado.push(titulares.slice(idx, idx + cantidad))
    idx += cantidad
  }
  return resultado
}

function calcularPosiciones(
  lineas: JugadorPlanilla[][],
  lado: 'left' | 'right',
  orientacion: 'landscape' | 'portrait',
  w: number,
  h: number,
): { jugador: JugadorPlanilla; x: number; y: number }[] {
  const totalLineas = lineas.length
  const result: { jugador: JugadorPlanilla; x: number; y: number }[] = []

  if (orientacion === 'landscape') {
    const margenX = 42
    const campoAncho = (w / 2 - margenX) * 0.82
    lineas.forEach((linea, li) => {
      const xRatio = totalLineas > 1 ? li / (totalLineas - 1) : 0
      let xBase = margenX + xRatio * campoAncho
      if (lado === 'right') xBase = w - xBase
      linea.forEach((jugador, ji) => {
        const slots = linea.length + 1
        const y = (h / slots) * (ji + 1)
        result.push({ jugador, x: xBase, y })
      })
    })
  } else {
    // Vertical: 'left' = equipo arriba, 'right' = equipo abajo
    const margenY = 42
    const campoAlto = (h / 2 - margenY) * 0.82
    lineas.forEach((linea, li) => {
      const yRatio = totalLineas > 1 ? li / (totalLineas - 1) : 0
      let yBase = margenY + yRatio * campoAlto
      if (lado === 'right') yBase = h - yBase
      linea.forEach((jugador, ji) => {
        const slots = linea.length + 1
        const x = (w / slots) * (ji + 1)
        result.push({ jugador, x, y: yBase })
      })
    })
  }
  return result
}

function JugadorNode({ jugador, x, y }: { jugador: JugadorPlanilla; x: number; y: number }) {
  const apellido = jugador.jugador?.split(',')[0]?.trim() ?? '?'
  const isTrunc = apellido.length > 11
  const apellidoCorto = isTrunc ? apellido.slice(0, 10) + '…' : apellido
  const foto = (jugador as { foto?: string | null }).foto ?? null
  // Las fotos "_nobg"/.png son recortes con fondo TRANSPARENTE (como Flashscore) → se muestran SIN círculo.
  // Las .jpg viejas tienen fondo → se muestran enmascaradas en círculo para que queden prolijas.
  const esCutout = !!foto && /(_nobg|\.png)(\?|$)/i.test(foto)
  const num = jugador.camiseta
  const R = 22                          // radio de la foto (círculo para jpg / caja de referencia para cutout)
  const cid = `c-${jugador.jugador_id ?? `${Math.round(x)}-${Math.round(y)}`}`

  const goles = jugador.goles ?? 0
  const salio = Boolean(jugador.titular && jugador.minS) // titular que fue reemplazado
  const amarillas = jugador.amarillas ?? 0
  const rojas = jugador.rojas ?? 0

  const goalW = goles > 1 ? 22 : 14    // se ensancha para alojar el número de goles

  // nombre con recuadro (píldora) abajo · si el apellido no entra, al hover se extiende y muestra el completo
  const numPref = num ? `${num} ` : ''
  const pillW = Math.max(40, (numPref + apellidoCorto).length * 6 + 12)
  const pillWFull = Math.max(40, (numPref + apellido).length * 6 + 12)

  // Marcadores al COSTADO de la foto, APENAS POR FUERA del borde del círculo (no tocan la cara) — proporción medida del Flashscore real.
  // FS: foto Ø36, ícono 15, centro del ícono ~2px fuera del borde, a altura baja-media. Con R=22 → ~x±25, y+14.
  // costado izq = cambio (abajo) + gol (arriba); costado der = tarjetas.
  const lcx = x - 25, rcx = x + 25     // centros de columna, justo afuera del borde izq/der
  const botY = y + 14                  // slot inferior (altura baja-media)
  const upY = y - 2                    // slot superior (apilando hacia arriba)

  const content = (
    <>
      {foto ? (
        esCutout ? (
          /* recorte transparente (estilo Flashscore): sin círculo, sin fondo, retrato encuadrado */
          <image href={foto} x={x - 22} y={y - 26} width={44} height={50} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <>
            <clipPath id={cid}><circle cx={x} cy={y} r={R} /></clipPath>
            <circle cx={x} cy={y} r={R} fill="#e9eef3" />
            <image href={foto} x={x - R} y={y - R} width={R * 2} height={R * 2}
              clipPath={`url(#${cid})`} preserveAspectRatio="xMidYMid slice" />
          </>
        )
      ) : (
        <>
          {/* avatar silueta genérico (sin foto) */}
          <clipPath id={cid}><circle cx={x} cy={y} r={R} /></clipPath>
          <g clipPath={`url(#${cid})`}>
            <circle cx={x} cy={y} r={R} fill="#e6ebf1" />
            <circle cx={x} cy={y - 4} r={9} fill="#9aa7b6" />
            <ellipse cx={x} cy={y + 20} rx={15} ry={13} fill="#9aa7b6" />
          </g>
        </>
      )}

      {/* tooltip nombre completo al pasar el mouse */}
      <title>{`${num ? num + ' ' : ''}${jugador.jugador ?? ''}`}</title>

      {/* nombre con RECUADRO (píldora) abajo · número gris + apellido negro · subraya azul en hover */}
      <g className="jp-short">
        <rect x={x - pillW / 2} y={y + R + 3} width={pillW} height={17} rx={8.5} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} filter="url(#pillSh)" />
        <text x={x} y={y + R + 14.5} textAnchor="middle" fontSize={11}>
          {num ? <tspan fill="#64748b" fontWeight="600">{num} </tspan> : null}
          <tspan className="jname" fill="#0f172a" fontWeight="700">{apellidoCorto}</tspan>
        </text>
      </g>
      {/* píldora extendida con el apellido COMPLETO, sólo visible al hover (estilo Flashscore) */}
      {isTrunc ? (
        <g className="jp-full">
          <rect x={x - pillWFull / 2} y={y + R + 3} width={pillWFull} height={17} rx={8.5} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} filter="url(#pillSh)" />
          <text x={x} y={y + R + 14.5} textAnchor="middle" fontSize={11}>
            {num ? <tspan fill="#64748b" fontWeight="600">{num} </tspan> : null}
            <tspan className="jname" fill="#0f172a" fontWeight="700">{apellido}</tspan>
          </text>
        </g>
      ) : null}

      {/* COSTADO INF-IZQ de la foto · GOL (arriba si también salió; con número si convirtió 2+) */}
      {goles > 0 ? (() => {
        const cy = salio ? upY : botY
        return (
          <g>
            <rect x={lcx - goalW / 2} y={cy - 7} width={goalW} height={14} rx={3} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} filter="url(#pillSh)" />
            <text x={goles > 1 ? lcx - 4 : lcx} y={cy + 4} textAnchor="middle" fontSize={9}>⚽</text>
            {goles > 1 ? <text x={lcx + 6} y={cy + 4} textAnchor="middle" fontSize={9} fontWeight="700" fill="#0f172a">{goles}</text> : null}
          </g>
        )
      })() : null}

      {/* COSTADO INF-IZQ de la foto (abajo) · CAMBIO · swap rojo (salió ←) + verde (entró →) */}
      {salio ? (() => {
        const bx = lcx - 7, by = botY - 7
        return (
          <g>
            <rect x={bx} y={by} width={14} height={14} rx={3} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} filter="url(#pillSh)" />
            <g strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d={`M ${bx + 10} ${by + 5} h-6`} stroke="#dc2626" />
              <path d={`M ${bx + 6} ${by + 3} l-2 2 l2 2`} stroke="#dc2626" />
              <path d={`M ${bx + 4} ${by + 9} h6`} stroke="#16a34a" />
              <path d={`M ${bx + 8} ${by + 7} l2 2 l-2 2`} stroke="#16a34a" />
            </g>
          </g>
        )
      })() : null}

      {/* COSTADO INF-DER de la foto · TARJETAS en recuadrito blanco (amarilla abajo, roja arriba si hay ambas) */}
      {amarillas ? (
        <g>
          <rect x={rcx - 7} y={botY - 7} width={14} height={14} rx={3} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} filter="url(#pillSh)" />
          <rect x={rcx - 3} y={botY - 4.5} width={6} height={9} rx={1.2} fill="#eab308" />
        </g>
      ) : null}
      {rojas ? (() => {
        const cy = amarillas ? upY : botY
        return (
          <g>
            <rect x={rcx - 7} y={cy - 7} width={14} height={14} rx={3} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} filter="url(#pillSh)" />
            <rect x={rcx - 3} y={cy - 4.5} width={6} height={9} rx={1.2} fill="#dc2626" />
          </g>
        )
      })() : null}
    </>
  )

  return jugador.jugador_id ? (
    <a className="jnode" href={`/jugador/${jugador.jugador_id}`}>{content}</a>
  ) : (
    <g className="jnode">{content}</g>
  )
}

export default function Formacion({
  jugadoresGec, jugadoresRival, formacionGec, formacionRival,
  kitGec, kitRival, localNombre, visitanteNombre,
}: Props) {
  // Orientación automática: horizontal en PC, vertical en tablet/celular (<1024px)
  const [orientacion, setOrientacion] = useState<'landscape' | 'portrait'>('landscape')
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setOrientacion(mq.matches ? 'portrait' : 'landscape')
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const W = orientacion === 'landscape' ? 960 : 400
  const H = orientacion === 'landscape' ? 480 : 760

  const lineasGec = distribuirJugadores(jugadoresGec, parsearFormacion(formacionGec))
  const lineasRival = distribuirJugadores(jugadoresRival, parsearFormacion(formacionRival))
  const posGec = calcularPosiciones(lineasGec, 'left', orientacion, W, H)
  const posRival = calcularPosiciones(lineasRival, 'right', orientacion, W, H)

  const colorGec = kitGec?.color1 ?? '#007ad6'
  const colorRival = kitRival?.color1 ?? '#cc2222'

  if (!jugadoresGec?.length && !jugadoresRival?.length) return null

  const FIELD = '#eeeeee'
  const LINE = '#c2cbd6'
  const LW = 2.4

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
      {/* Header estilo pestaña */}
      <div className="flex items-center px-5 pt-4" style={{ borderBottom: '1px solid #eef2f6' }}>
        <span className="inline-flex items-center gap-2 pb-3 text-[0.8rem] font-bold text-[#0f172a] uppercase" style={{ letterSpacing: '0.06em', borderBottom: '3px solid #007ad6', marginBottom: '-1px' }}>
          Formación
        </span>
      </div>

      {/* Equipos */}
      <div className="flex justify-between text-[0.78rem] px-5 pt-3 font-bold">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorGec }} />{localNombre} <span className="text-[#94a3b8] font-semibold">({formacionGec})</span></span>
        <span className="flex items-center gap-1.5">{visitanteNombre} <span className="text-[#94a3b8] font-semibold">({formacionRival})</span><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorRival }} /></span>
      </div>

      <div className="overflow-x-auto px-3 py-3">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }}>
          <defs>
            <filter id="pillSh" x="-20%" y="-30%" width="140%" height="180%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.18" />
            </filter>
            <style>{`
              a.jnode { cursor: pointer; }
              a.jnode text.jname { transition: fill .12s; }
              a.jnode:hover text.jname { fill: #007ad6; text-decoration: underline; }
              .jnode .jp-full { display: none; }
              .jnode:hover .jp-full { display: block; }
              .jnode:hover .jp-short { display: none; }
            `}</style>
          </defs>
          <rect width={W} height={H} fill="#f7f7f7" rx={10} />
          <rect x={16} y={16} width={W - 32} height={H - 32} fill={FIELD} rx={6} stroke={LINE} strokeWidth={LW} />

          {orientacion === 'landscape' ? (
            <>
              <line x1={W / 2} y1={16} x2={W / 2} y2={H - 16} stroke={LINE} strokeWidth={LW} />
              <circle cx={W / 2} cy={H / 2} r={52} fill="none" stroke={LINE} strokeWidth={LW} />
              <circle cx={W / 2} cy={H / 2} r={2.5} fill={LINE} />
              <rect x={16} y={H / 2 - 74} width={82} height={148} fill="none" stroke={LINE} strokeWidth={LW} />
              <rect x={16} y={H / 2 - 36} width={34} height={72} fill="none" stroke={LINE} strokeWidth={LW} />
              <rect x={W - 98} y={H / 2 - 74} width={82} height={148} fill="none" stroke={LINE} strokeWidth={LW} />
              <rect x={W - 50} y={H / 2 - 36} width={34} height={72} fill="none" stroke={LINE} strokeWidth={LW} />
              {/* Puntos de penal + semicírculo del área ("D") */}
              <circle cx={70} cy={H / 2} r={2} fill={LINE} />
              <circle cx={W - 70} cy={H / 2} r={2} fill={LINE} />
              <path d={`M 98 ${H / 2 - 36.5} A 46 46 0 0 1 98 ${H / 2 + 36.5}`} fill="none" stroke={LINE} strokeWidth={LW} />
              <path d={`M ${W - 98} ${H / 2 - 36.5} A 46 46 0 0 0 ${W - 98} ${H / 2 + 36.5}`} fill="none" stroke={LINE} strokeWidth={LW} />
              {/* Arcos de córner */}
              <path d={`M 25 16 A 9 9 0 0 1 16 25`} fill="none" stroke={LINE} strokeWidth={LW} />
              <path d={`M ${W - 25} 16 A 9 9 0 0 0 ${W - 16} 25`} fill="none" stroke={LINE} strokeWidth={LW} />
              <path d={`M 16 ${H - 25} A 9 9 0 0 1 25 ${H - 16}`} fill="none" stroke={LINE} strokeWidth={LW} />
              <path d={`M ${W - 16} ${H - 25} A 9 9 0 0 0 ${W - 25} ${H - 16}`} fill="none" stroke={LINE} strokeWidth={LW} />
            </>
          ) : (
            <>
              <line x1={16} y1={H / 2} x2={W - 16} y2={H / 2} stroke={LINE} strokeWidth={LW} />
              <circle cx={W / 2} cy={H / 2} r={46} fill="none" stroke={LINE} strokeWidth={LW} />
              <circle cx={W / 2} cy={H / 2} r={2.5} fill={LINE} />
              <rect x={W / 2 - 74} y={16} width={148} height={82} fill="none" stroke={LINE} strokeWidth={LW} />
              <rect x={W / 2 - 36} y={16} width={72} height={34} fill="none" stroke={LINE} strokeWidth={LW} />
              <rect x={W / 2 - 74} y={H - 98} width={148} height={82} fill="none" stroke={LINE} strokeWidth={LW} />
              <rect x={W / 2 - 36} y={H - 50} width={72} height={34} fill="none" stroke={LINE} strokeWidth={LW} />
            </>
          )}

          {posGec.map(({ jugador, x, y }, i) => <JugadorNode key={`g${i}`} jugador={jugador} x={x} y={y} />)}
          {posRival.map(({ jugador, x, y }, i) => <JugadorNode key={`r${i}`} jugador={jugador} x={x} y={y} />)}
        </svg>
      </div>
    </div>
  )
}
