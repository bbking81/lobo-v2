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
  golEnContra?: number
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
  asistente1?: string
  asistente2?: string
  cuarto?: string
  var?: string
  avar?: string
  incidencias?: string
  notas?: string
  fase?: string
  subfase?: string
  fechaNro?: string | number
  dtGimnasia?: string
  dtsGimnasia?: { id: number; nombre: string }[]
  dtRival?: string
  mediaFotos?: MediaFoto[]
  mediaVideos?: MediaFoto[]
  mediaAudios?: MediaFoto[]
}

export interface MediaFoto {
  src: string
  leyenda?: string
  nombre?: string
  mime?: string
  tipo?: string
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
  pg: number            // partidos ganados
  pe: number            // partidos empatados
  pp: number            // partidos perdidos
  goles: number
  asistencias: number
  ta: number            // tarjetas amarillas
  tr: number            // tarjetas rojas
  nacimiento: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  notas: string | null
  mediaFotos?: MediaFoto[]
}

export interface ApiConfig {
  escudoGEC?: string
  [key: string]: string | undefined
}

export interface DT {
  id: number; apellido: string; nombres: string; nombre: string
  pj: number; pg: number; pe: number; pp: number
  foto: string | null; fotoUrl: string | null
  nacimiento: string | null; ciudad: string | null; provincia: string | null; pais: string | null; notas: string | null
}

export interface Arbitro {
  id: number; nombre: string; apellido: string; nombres: string
  pj: number; pg: number; pe: number; pp: number; v: number; e: number; d: number
  foto: string | null; pais: string | null; notas: string | null
}

export interface Estadio {
  id: number; nombre: string; ciudad: string | null; provincia: string | null; pais: string | null
  capacidad: number | null; lat: number | null; lng: number | null; fotoUrl: string | null
  pj: number; pg: number; pe: number; pp: number; notas: string | null; equipo: string | null
}

export interface DTRival {
  id: number; apellido: string; nombres: string; nombre: string
  pj: number; pg: number; pe: number; pp: number
  foto: string | null; fotoUrl: string | null; pais: string | null; notas: string | null
}

export interface JugadorRival {
  id: number; apellido: string; nombres: string; nombre: string
  posicion: string | null; equipo: string | null; pais: string | null
  pj: number; pg: number; pe: number; pp: number; goles: number
  foto: string | null; notas: string | null
}

export interface ApiData {
  partidos: Partido[]
  jugadores: Jugador[]
  equipos: Record<string, unknown>[]
  competencias: { id: number; nombre: string; tablaPosiciones?: { nombre: string; filas: { equipo: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }[] }[] }[]
  dts: DT[]
  dtRivales: DTRival[]
  jugadoresRivales: JugadorRival[]
  estadios: Estadio[]
  arbitros: Arbitro[]
  config: ApiConfig
  proximoPartido?: Partido
}
