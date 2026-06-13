import type { ApiData, Partido } from '@/types'

// En el VPS se setea GEC_API_URL=http://127.0.0.1:8000 (lee el API local,
// sin viaje por internet). Sin la env var (ej. Vercel) usa el dominio público.
const BASE_URL = process.env.GEC_API_URL || 'https://loboentrerriano.com'

export async function getApiData(): Promise<ApiData> {
  // Caché de 1 minuto (ISR): guarda el JSON y lo sirve al instante; pasados 60s
  // lo vuelve a pedir fresco. Un dato nuevo cargado en el admin tarda hasta 1 min
  // en verse. Para volver a "siempre fresco": cache:'no-store'.
  // Con reintentos: el API a veces tira 500 transitorios, y un fallo durante
  // el build de Vercel tumbaría el deploy entero.
  let lastError: unknown
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(`${BASE_URL}/api/db`, {
        next: { revalidate: 60 },
        // Tope de 15s por intento: si el API se cuelga, cortamos y reintentamos
        // en vez de dejar colgado el build/request.
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) return res.json()
      lastError = new Error(`API respondió ${res.status}`)
    } catch (e) {
      lastError = e
    }
    if (intento < 3) await new Promise(r => setTimeout(r, 2000 * intento))
  }
  throw lastError instanceof Error ? lastError : new Error('Error al obtener datos')
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
