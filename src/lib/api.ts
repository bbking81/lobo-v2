import type { ApiData, Partido } from '@/types'

// En el VPS se setea GEC_API_URL=http://127.0.0.1:8000 (lee el API local,
// sin viaje por internet). Sin la env var (ej. Vercel) usa el dominio público.
const BASE_URL = process.env.GEC_API_URL || 'https://loboentrerriano.com'

// Memo en memoria del JSON YA PARSEADO. El fetch de Next cachea la RESPUESTA
// (revalidate:60), pero `res.json()` igual re-parsea el JSON en CADA request, y
// cada página llama a getApiData. Guardando el objeto parseado a nivel módulo,
// dentro de la ventana TTL servimos el mismo objeto sin re-parsear ni re-fetchear.
// El proceso SSR es de larga vida en el VPS, así que el memo persiste entre requests.
// Hay DOS variantes con caché separada: 'full' (con planillas/eventos/multimedia)
// y 'light' (?light=1: partidos sin los campos pesados, ~850 KB vs ~1,5 MB). Las
// páginas que NO necesitan el detalle de cada partido piden la liviana.
const MEMO_TTL_MS = 60_000
const _memo = new Map<string, { data: ApiData; at: number }>()
const _inflight = new Map<string, Promise<ApiData>>()

export async function getApiData(opts?: { light?: boolean }): Promise<ApiData> {
  const key = opts?.light ? 'light' : 'full'
  const ahora = Date.now()
  // Dato fresco en memoria: lo devolvemos al instante (sin fetch ni parseo).
  const hit = _memo.get(key)
  if (hit && ahora - hit.at < MEMO_TTL_MS) return hit.data
  // Si otra request ya está pidiendo esta variante, nos colgamos de la misma
  // promesa (evita estampida: 10 visitas simultáneas no disparan 10 fetch+parseo).
  const flight = _inflight.get(key)
  if (flight) return flight

  const p = (async () => {
    try {
      const data = await _fetchApiData(!!opts?.light)
      _memo.set(key, { data, at: Date.now() })
      return data
    } catch (e) {
      // Si el fetch falla pero tenemos un memo viejo, lo servimos (stale) antes
      // que tirar un error y romper la página.
      const stale = _memo.get(key)
      if (stale) return stale.data
      // Durante el BUILD (prerender ISR) un fallo del API tumbaría el deploy
      // entero. Antes se evitaba con force-dynamic (todo se renderizaba por
      // request). Ahora prerenderizamos con ISR; si el API no responde EN EL
      // BUILD, devolvemos datos vacíos para que el build no se caiga: la página
      // queda vacía pero se auto-regenera al primer revalidate (60s) con datos
      // reales. En runtime (request real) seguimos tirando el error.
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('[getApiData] API no respondió en build; usando datos vacíos (ISR los regenera):', e)
        return EMPTY_API_DATA
      }
      throw e
    } finally {
      _inflight.delete(key)
    }
  })()
  _inflight.set(key, p)
  return p
}

/** Un partido COMPLETO (con planillas/eventos/multimedia) por id, vía
 * /api/partido/{id}. La ficha de partido lo usa para NO bajar toda la base. */
export async function getPartido(id: number): Promise<Partido | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/partido/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return res.json()
    return null
  } catch {
    return null
  }
}

/** Los partidos COMPLETOS (con planillas) en los que participó el jugador GEC
 * `id`, vía /api/jugador/{id}. La ficha de jugador lo usa para NO bajar toda la
 * base con todas las planillas. Devuelve [] si falla (la ficha decide qué hacer). */
export async function getJugadorPartidos(id: number): Promise<Partido[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/jugador/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return (await res.json()).partidos ?? []
    return []
  } catch {
    return []
  }
}

/** Ídem para un jugador RIVAL, vía /api/jugador-rival/{id} (matchea por nombre
 * en planilla_rival del lado del backend). */
export async function getJugadorRivalPartidos(id: number): Promise<Partido[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/jugador-rival/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return (await res.json()).partidos ?? []
    return []
  } catch {
    return []
  }
}

export interface RankingJugAcc {
  id?: number; nombre: string; goles: number; pj: number
  dobletes: number; tripletes: number; pokers: number; cincoplus: number
  rojas: number; amarillas: number; local: number; visitante: number
}

/** Ranking de jugadores GEC ya AGREGADO por el backend (/api/ranking-jugadores),
 * respetando los filtros temporada/torneo/cond. Reemplaza el recorrido de TODAS
 * las planillas que hacía rankings/page.tsx; el cliente recibe solo los agregados. */
export async function getRankingJugadores(f: { temporada?: string; torneo?: string; cond?: string }): Promise<RankingJugAcc[]> {
  const qs = new URLSearchParams({
    temporada: f.temporada ?? '', torneo: f.torneo ?? '', cond: f.cond ?? '',
  }).toString()
  try {
    const res = await fetch(`${BASE_URL}/api/ranking-jugadores?${qs}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return (await res.json()).jugadores ?? []
    return []
  } catch {
    return []
  }
}

export interface PlantelTorneoRow {
  nombre: string; jugador_id?: number; pj: number; goles: number; ta: number; tr: number
}

/** Jugadores que jugaron en un torneo, ya agregados por el backend
 * (/api/plantel-torneo). Reemplaza el recorrido de planillas de competencias/[slug];
 * la ficha resuelve foto/id contra la lista de jugadores (que viene en light). */
export async function getPlantelTorneo(torneo: string): Promise<PlantelTorneoRow[]> {
  const qs = new URLSearchParams({ torneo }).toString()
  try {
    const res = await fetch(`${BASE_URL}/api/plantel-torneo?${qs}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return (await res.json()).plantel ?? []
    return []
  } catch {
    return []
  }
}

export interface BuscadorJugadores {
  gecNombres: string[]; rivalNombres: string[]
  gecIds: number[] | null; rivalIds: number[] | null
}

/** Para el buscador avanzado: nombres distintos de las planillas (dropdowns) +
 * ids de partidos que contienen al jugador/jugRival elegido (filtro). Reemplaza
 * el recorrido de planillas de buscador/page.tsx. */
export async function getBuscadorJugadores(jugador: string, jugRival: string): Promise<BuscadorJugadores> {
  const qs = new URLSearchParams({ jugador, jugRival }).toString()
  try {
    const res = await fetch(`${BASE_URL}/api/buscador-jugadores?${qs}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return await res.json()
  } catch { /* fallthrough */ }
  return { gecNombres: [], rivalNombres: [], gecIds: null, rivalIds: null }
}

/** Cantidad de partidos publicados por jugador GEC (id → nº), para el índice de
 * búsqueda. Reemplaza el conteo por planillas de api/search-index. */
export async function getJugadoresConteo(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${BASE_URL}/api/jugadores-conteo`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15000),
    })
    if (res.ok) return (await res.json()).counts ?? {}
  } catch { /* fallthrough */ }
  return {}
}

// Datos vacíos de respaldo SOLO para que el build no se caiga si el API falla
// durante el prerender (ver arriba). Nunca se cachea en el memo.
const EMPTY_API_DATA: ApiData = {
  partidos: [], jugadores: [], equipos: [], competencias: [],
  dts: [], dtRivales: [], jugadoresRivales: [], estadios: [],
  arbitros: [], config: {},
}

async function _fetchApiData(light: boolean): Promise<ApiData> {
  // Caché de 1 minuto (ISR): guarda el JSON y lo sirve al instante; pasados 60s
  // lo vuelve a pedir fresco. Un dato nuevo cargado en el admin tarda hasta 1 min
  // en verse. Para volver a "siempre fresco": cache:'no-store'.
  // Con reintentos: el API a veces tira 500 transitorios, y un fallo durante
  // el build de Vercel tumbaría el deploy entero.
  const url = `${BASE_URL}/api/db${light ? '?light=1' : ''}`
  let lastError: unknown
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(url, {
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
