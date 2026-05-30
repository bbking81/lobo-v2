export interface Evento {
  min: number
  tipo: 'gol' | 'tarjeta-amarilla' | 'tarjeta-roja' | 'cambio' | string
  jugador: string
  jugador2?: string
  equipo: 'local' | 'visitante'
  detalle?: string
}

export interface JugadorPlanilla {
  jugador: string         // nombre completo "Apellido, Nombre"
  camiseta: string | number
  titular: boolean
  jugador_id?: number
  goles?: number
  amarillas?: number
  rojas?: number
  penales?: number
  minE?: string
  minS?: string
  minGoles?: string
  reemplazaA?: string
  equipo?: string
}

export interface Partido {
  id: number
  fecha: string
  hora: string
  local: string
  visitante: string
  gl: number
  gv: number
  gecGF: number
  gecGC: number
  torneo: string
  estadio: string
  resultado: string
  planillaGec: JugadorPlanilla[]
  planillaRival: JugadorPlanilla[]
  eventos: Evento[]
  formacion: string        // formación de GEC
  formacionRival: string
  kitGec: Record<string, string>
  kitRival: Record<string, string>
  escudoGec?: string
  escudoRival?: string
  publicado: boolean
  arbitro?: string
}

export interface Jugador {
  id: number
  apellido: string
  nombres: string
  nombre: string        // "Apellido, Nombres"
  posicion: string | null
  foto: string | null   // URL completa o ruta relativa
  fotoUrl: string | null
  pj: number            // partidos jugados
  goles: number
  asistencias: number
  ta: number            // tarjetas amarillas
  tr: number            // tarjetas rojas
  nacimiento: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  notas: string | null
}

export interface ApiConfig {
  escudoGEC?: string
  [key: string]: string | undefined
}

export interface ApiData {
  partidos: Partido[]
  jugadores: Jugador[]
  equipos: Record<string, unknown>[]
  competencias: { id: number; nombre: string; tablaPosiciones?: { nombre: string; filas: { equipo: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }[] }[] }[]
  config: ApiConfig
  proximoPartido?: Partido
}
