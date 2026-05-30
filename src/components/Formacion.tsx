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

// Distribuye jugadores por líneas según formación
// El arco (índice 0) va solo, luego las líneas
function distribuirJugadores(jugadores: JugadorPlanilla[], formacion: number[]): JugadorPlanilla[][] {
  const titulares = jugadores.filter(j => j.titular !== false).slice(0, 11)
  const resultado: JugadorPlanilla[][] = []

  // Arquero
  resultado.push(titulares.slice(0, 1))

  let idx = 1
  for (const cantidad of formacion) {
    resultado.push(titulares.slice(idx, idx + cantidad))
    idx += cantidad
  }

  return resultado
}

// Posiciones X,Y en campo landscape 780×440
// GEC a la izquierda, rival a la derecha
function calcularPosiciones(
  lineas: JugadorPlanilla[][],
  lado: 'left' | 'right',
  w = 780,
  h = 440,
): { jugador: JugadorPlanilla; x: number; y: number }[] {
  const totalLineas = lineas.length // arco + líneas
  const result: { jugador: JugadorPlanilla; x: number; y: number }[] = []

  const margenX = 32
  const campoAncho = w / 2 - margenX * 1.5

  lineas.forEach((linea, li) => {
    // Proporción de izquierda a derecha (arco en x mínimo)
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

interface JugadorNodeProps {
  jugador: JugadorPlanilla
  x: number
  y: number
  kitColor: string
  invertido?: boolean
}

function JugadorNode({ jugador, x, y, kitColor, invertido = false }: JugadorNodeProps) {
  const apellido = jugador.jugador?.split(',')[0]?.trim() ?? '?'
  const apellidoCorto = apellido.length > 10 ? apellido.slice(0, 9) + '…' : apellido
  const fotoUrl = (jugador as { foto?: string | null }).foto ?? null

  const imgSize = 44
  const halfImg = imgSize / 2

  return (
    <g>
      {/* Foto o círculo de color */}
      {fotoUrl ? (
        <>
          <defs>
            <clipPath id={`clip-${jugador.jugador_id ?? x}-${y}`}>
              <rect
                x={x - halfImg}
                y={y - halfImg}
                width={imgSize}
                height={imgSize}
                rx={4}
              />
            </clipPath>
          </defs>
          <image
            href={fotoUrl}
            x={x - halfImg}
            y={y - halfImg}
            width={imgSize}
            height={imgSize}
            clipPath={`url(#clip-${jugador.jugador_id ?? x}-${y})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <circle cx={x} cy={y} r={18} fill={kitColor} />
      )}

      {/* Número sobre foto */}
      {!fotoUrl && (
        <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
          {jugador.camiseta ?? '?'}
        </text>
      )}

      {/* Badge nombre */}
      <rect
        x={x - 28}
        y={y + halfImg - 2}
        width={56}
        height={15}
        rx={3}
        fill="rgba(255,255,255,0.88)"
      />
      <text
        x={x}
        y={y + halfImg + 10}
        textAnchor="middle"
        fill="#1a1a1a"
        fontSize={9}
        fontWeight="600"
      >
        {jugador.camiseta ? `${jugador.camiseta} ` : ''}{apellidoCorto}
      </text>


      {/* Iconos de eventos */}
      {jugador.goles ? (
        <text x={x - halfImg + 2} y={y - halfImg + 10} fontSize={9}>⚽</text>
      ) : null}
      {jugador.amarillas ? (
        <text x={x + halfImg - 10} y={y - halfImg + 10} fontSize={9}>🟨</text>
      ) : null}
      {jugador.rojas ? (
        <text x={x + halfImg - 10} y={y - halfImg + 10} fontSize={9}>🟥</text>
      ) : null}
    </g>
  )
}

export default function Formacion({
  jugadoresGec,
  jugadoresRival,
  formacionGec,
  formacionRival,
  kitGec,
  kitRival,
  localNombre,
  visitanteNombre,
}: Props) {
  const [orientacion, setOrientacion] = useState<'landscape' | 'portrait'>('landscape')

  const W = orientacion === 'landscape' ? 780 : 370
  const H = orientacion === 'landscape' ? 440 : 750

  const lineasGec = distribuirJugadores(jugadoresGec, parsearFormacion(formacionGec))
  const lineasRival = distribuirJugadores(jugadoresRival, parsearFormacion(formacionRival))

  const posGec = calcularPosiciones(lineasGec, orientacion === 'landscape' ? 'left' : 'left', W, H)
  const posRival = calcularPosiciones(lineasRival, orientacion === 'landscape' ? 'right' : 'right', W, H)

  const colorGec = kitGec?.color1 ?? '#1e3a5f'
  const colorRival = kitRival?.color1 ?? '#cc0000'

  if (!jugadoresGec?.length && !jugadoresRival?.length) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Formación</h2>
        <div className="flex gap-1">
          {(['landscape', 'portrait'] as const).map(o => (
            <button
              key={o}
              onClick={() => setOrientacion(o)}
              className={`text-xs px-2 py-1 rounded border ${
                orientacion === o
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                  : 'text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {o === 'landscape' ? '⬛ Horizontal' : '▬ Vertical'}
            </button>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-between text-xs px-6 pt-2 font-semibold">
        <span style={{ color: colorGec }}>{localNombre} ({formacionGec})</span>
        <span style={{ color: colorRival }}>{visitanteNombre} ({formacionRival})</span>
      </div>

      {/* SVG campo */}
      <div className="overflow-x-auto px-2 pb-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
        >
          {/* Fondo */}
          <rect width={W} height={H} fill="#f5f5f5" rx={8} />

          {/* Campo interior */}
          <rect x={20} y={20} width={W - 40} height={H - 40} fill="#efefef" rx={4}
            stroke="#c8c8c8" strokeWidth={1.5} />

          {/* Línea del medio */}
          {orientacion === 'landscape' ? (
            <line x1={W / 2} y1={20} x2={W / 2} y2={H - 20} stroke="#c8c8c8" strokeWidth={1.5} />
          ) : (
            <line x1={20} y1={H / 2} x2={W - 20} y2={H / 2} stroke="#c8c8c8" strokeWidth={1.5} />
          )}

          {/* Círculo central */}
          <circle
            cx={W / 2} cy={H / 2}
            r={orientacion === 'landscape' ? 50 : 40}
            fill="none" stroke="#c8c8c8" strokeWidth={1.5}
          />

          {/* Áreas */}
          {orientacion === 'landscape' ? (
            <>
              {/* Área GEC (izquierda) */}
              <rect x={20} y={H / 2 - 70} width={80} height={140} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              <rect x={20} y={H / 2 - 35} width={35} height={70} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              {/* D-arco GEC */}
              <ellipse cx={100} cy={H / 2} rx={22} ry={32} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              {/* Área Rival (derecha) */}
              <rect x={W - 100} y={H / 2 - 70} width={80} height={140} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              <rect x={W - 55} y={H / 2 - 35} width={35} height={70} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              {/* D-arco Rival */}
              <ellipse cx={W - 100} cy={H / 2} rx={22} ry={32} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
            </>
          ) : (
            <>
              {/* Área GEC (arriba) */}
              <rect x={W / 2 - 70} y={20} width={140} height={80} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              <rect x={W / 2 - 35} y={20} width={70} height={35} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              <ellipse cx={W / 2} cy={100} rx={32} ry={22} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              {/* Área Rival (abajo) */}
              <rect x={W / 2 - 70} y={H - 100} width={140} height={80} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              <rect x={W / 2 - 35} y={H - 55} width={70} height={35} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
              <ellipse cx={W / 2} cy={H - 100} rx={32} ry={22} fill="none" stroke="#c8c8c8" strokeWidth={1.5} />
            </>
          )}

          {/* Jugadores GEC */}
          {posGec.map(({ jugador, x, y }, i) => (
            <JugadorNode key={i} jugador={jugador} x={x} y={y} kitColor={colorGec} />
          ))}

          {/* Jugadores Rival */}
          {posRival.map(({ jugador, x, y }, i) => (
            <JugadorNode key={i} jugador={jugador} x={x} y={y} kitColor={colorRival} invertido />
          ))}
        </svg>
      </div>
    </div>
  )
}
