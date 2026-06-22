'use client'

import { useState } from 'react'

/** Avatar redondo para listas/tablas. Si la foto no carga, cae a la inicial del apellido. */
export function PlayerAvatar({
  src,
  apellido,
  size = 28,
}: {
  src: string | null
  apellido: string
  size?: number
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className="rounded-full bg-[#1e3a5f]/10 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="font-black text-[#1e3a5f]/40" style={{ fontSize: Math.round(size * 0.36) }}>
          {apellido.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={apellido}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      className="rounded-full object-cover shrink-0 bg-gray-100"
      style={{ width: size, height: size }}
    />
  )
}

/** Foto grande para el hero del perfil del jugador. Cae a la inicial si no carga. */
export function PlayerHeroPhoto({
  src,
  apellido,
  esNueva,
}: {
  src: string | null
  apellido: string
  esNueva: boolean
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="w-full h-36 flex items-center justify-center">
        <span className="text-6xl font-black text-white/20">{apellido.charAt(0)}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={apellido}
      onError={() => setError(true)}
      className={`w-full ${esNueva ? 'h-48 object-contain object-bottom' : 'h-36 object-cover object-top'}`}
    />
  )
}
