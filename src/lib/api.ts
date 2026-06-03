import type { ApiData, Partido } from '@/types'

const BASE_URL = 'https://loboentrerriano.com'

export async function getApiData(): Promise<ApiData> {
  const res = await fetch(`${BASE_URL}/api/db`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Error al obtener datos')
  return res.json()
}

export function fotoUrl(foto: string | null | undefined): string | null {
  if (!foto) return null
  // Solo fotos con URL absoluta (static/uploads/..._nobg.png) están disponibles.
  // Las rutas relativas legacy (images/Caritas/...) ya no existen en el servidor (404),
  // así que las tratamos como "sin foto" para caer al placeholder.
  if (foto.startsWith('http')) return foto
  return null
}

export function torneoToSlug(torneo: string): string {
  return encodeURIComponent(torneo.trim())
}

export function slugToTorneo(slug: string): string {
  return decodeURIComponent(slug)
}

export function slugToId(slug: string): number {
  return parseInt(slug.split('-').pop() ?? '0', 10)
}

export function partidoSlug(partido: Partido): string {
  const local = partido.local.toLowerCase().replace(/\s+/g, '-')
  const visitante = partido.visitante.toLowerCase().replace(/\s+/g, '-')
  return `${local}-vs-${visitante}-${partido.id}`
}
