'use client'

import { useState } from 'react'
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
  w: number,
  h: number,
): { jugador: JugadorPlanilla; x: number; y: number }[] {
  const totalLineas = lineas.length
  const result: { jugador: JugadorPlanilla; x: number; y: number }[] = []
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
  return result
}

function JugadorNode({ jugador, x, y }: { jugador: JugadorPlanilla; x: number; y: number }) {
  const apellido = jugador.jugador?.split(',')[0]?.trim() ?? '?'
  const apellidoCorto = apellido.length > 11 ? apellido.slice(0, 10) + '…' : apellido
  const foto = (jugador as { foto?: string | null }).foto ?? null
  const num = jugador.camiseta
  const r = 23
  const cid = `c-${jugador.jugador_id ?? `${Math.round(x)}-${Math.round(y)}`}`
  const label = `${num ? `${num} ` : ''}${apellidoCorto}`
  const pillW = Math.max(42, label.length * 6 + 14)

  return (
    <g>
      {foto ? (
        <>
          <clipPath id={cid}><circle cx={x} cy={y} r={r} /></clipPath>
          <circle cx={x} cy={y} r={r} fill="#e9eef3" />
          <image href={foto} x={x - r} y={y - r} width={r * 2} height={r * 2}
            clipPath={`url(#${cid})`} preserveAspectRatio="xMidYMid slice" />
        </>
      ) : (
        <>
          {/* avatar silueta genérico (estilo Flashscore sin foto) */}
          <clipPath id={cid}><circle cx={x} cy={y} r={r} /></clipPath>
          <g clipPath={`url(#${cid})`}>
            <circle cx={x} cy={y} r={r} fill="#e6ebf1" />
            <circle cx={x} cy={y - 4} r={7.5} fill="#9aa7b6" />
            <ellipse cx={x} cy={y + 18} rx={13} ry={10.5} fill="#9aa7b6" />
          </g>
        </>
      )}

      {/* pill nombre */}
      <rect x={x - pillW / 2} y={y + r + 5} width={pillW} height={18} rx={9} fill="#fff" stroke="#e6e9ee" strokeWidth={0.75} />
      <text x={x} y={y + r + 17.5} textAnchor="middle" fill="#0f172a" fontSize={11} fontWeight="600">{label}</text>

      {/* eventos */}
      {jugador.goles ? <text x={x - r - 4} y={y - r + 6} fontSize={12}>⚽</text> : null}
      {jugador.rojas ? <rect x={x + r - 5} y={y - r - 3} width={8} height={11} rx={1.5} fill="#dc2626" />
        : jugador.amarillas ? <rect x={x + r - 5} y={y - r - 3} width={8} height={11} rx={1.5} fill="#eab308" /> : null}
    </g>
  )
}

export default function Formacion({
  jugadoresGec, jugadoresRival, formacionGec, formacionRival,
  kitGec, kitRival, localNombre, visitanteNombre,
}: Props) {
  const [orientacion, setOrientacion] = useState<'landscape' | 'portrait'>('landscape')

  const W = orientacion === 'landscape' ? 960 : 380
  const H = orientacion === 'landscape' ? 480 : 720

  const lineasGec = distribuirJugadores(jugadoresGec, parsearFormacion(formacionGec))
  const lineasRival = distribuirJugadores(jugadoresRival, parsearFormacion(formacionRival))
  const posGec = calcularPosiciones(lineasGec, 'left', W, H)
  const posRival = calcularPosiciones(lineasRival, 'right', W, H)

  const colorGec = kitGec?.color1 ?? '#007ad6'
  const colorRival = kitRival?.color1 ?? '#cc2222'

  if (!jugadoresGec?.length && !jugadoresRival?.length) return null

  const FIELD = '#eeeeee'
  const LINE = '#c2cbd6'
  const LW = 2.4

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
      {/* Header estilo pestaña */}
      <div className="flex items-center justify-between px-5 pt-4" style={{ borderBottom: '1px solid #eef2f6' }}>
        <span className="inline-flex items-center gap-2 pb-3 text-[0.8rem] font-bold text-[#0f172a] uppercase" style={{ letterSpacing: '0.06em', borderBottom: '3px solid #007ad6', marginBottom: '-1px' }}>
          Formación
        </span>
        <div className="flex gap-1.5 pb-2">
          {(['landscape', 'portrait'] as const).map(o => (
            <button key={o} onClick={() => setOrientacion(o)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                orientacion === o
                  ? 'bg-[#007ad6] text-white border-[#007ad6]'
                  : 'text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]'
              }`}>
              {o === 'landscape' ? 'Horizontal' : 'Vertical'}
            </button>
          ))}
        </div>
      </div>

      {/* Equipos */}
      <div className="flex justify-between text-[0.78rem] px-5 pt-3 font-bold">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorGec }} />{localNombre} <span className="text-[#94a3b8] font-semibold">({formacionGec})</span></span>
        <span className="flex items-center gap-1.5">{visitanteNombre} <span className="text-[#94a3b8] font-semibold">({formacionRival})</span><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorRival }} /></span>
      </div>

      <div className="overflow-x-auto px-3 py-3">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }}>
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
