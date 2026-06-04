import { NextResponse } from 'next/server'
import { getApiData, fotoUrl } from '@/lib/api'

export interface IndexItem {
  group: string
  q: string          // texto en minúsculas para matchear
  nombre: string
  sub: string
  foto: string | null
  initials: string
  count: number | null
  href: string
}

const initialsOf = (nombre: string) =>
  (nombre.split(',')[0] || '').trim().slice(0, 2).toUpperCase()

/**
 * Índice de búsqueda completo (se carga UNA vez en el cliente).
 * El filtrado se hace local en el navegador, instantáneo a cada tecla.
 */
export async function GET() {
  const data = await getApiData()
  const items: IndexItem[] = []

  for (const j of data.jugadores) {
    if (!j.nombre) continue
    items.push({
      group: 'jugadores', q: j.nombre.toLowerCase(),
      nombre: j.nombre,
      sub: [j.posicion || 'Jugador', j.pais].filter(Boolean).join(' · '),
      foto: fotoUrl(j.foto), initials: initialsOf(j.nombre),
      count: data.partidos.filter(p => p.planillaGec?.some(r => r.jugador_id === j.id)).length,
      href: `/jugador/${j.id}`,
    })
  }

  for (const d of data.dts) {
    if (!d.nombre) continue
    items.push({
      group: 'dts', q: d.nombre.toLowerCase(),
      nombre: d.nombre,
      sub: ['Director Técnico', d.pais].filter(Boolean).join(' · '),
      foto: fotoUrl(d.foto), initials: initialsOf(d.nombre), count: null, href: `/dt/${d.id}`,
    })
  }

  for (const e of data.estadios) {
    if (!e.nombre) continue
    items.push({
      group: 'estadios', q: `${e.nombre} ${e.ciudad ?? ''}`.toLowerCase(),
      nombre: e.nombre,
      sub: [e.ciudad, e.provincia].filter(Boolean).join(' · '),
      foto: fotoUrl(e.fotoUrl), initials: initialsOf(e.nombre),
      count: data.partidos.filter(p => p.estadio === e.nombre).length,
      href: `/estadio/${e.id}`,
    })
  }

  for (const e of data.equipos as { nombre?: string; ciudad?: string }[]) {
    if (!e.nombre) continue
    items.push({
      group: 'equipos', q: e.nombre.toLowerCase(),
      nombre: e.nombre, sub: e.ciudad || 'Equipo rival', foto: null,
      initials: e.nombre.slice(0, 2).toUpperCase(),
      count: data.partidos.filter(p => p.local === e.nombre || p.visitante === e.nombre).length,
      href: '/historiales',
    })
  }

  for (const j of data.jugadoresRivales) {
    if (!j.nombre) continue
    items.push({
      group: 'jugadores-rivales', q: j.nombre.toLowerCase(),
      nombre: j.nombre,
      sub: [j.posicion || 'Jugador rival', j.equipo].filter(Boolean).join(' · '),
      foto: fotoUrl(j.foto), initials: initialsOf(j.nombre), count: null, href: '/jugadores-rivales',
    })
  }

  for (const a of data.arbitros) {
    if (!a.nombre) continue
    items.push({
      group: 'arbitros', q: a.nombre.toLowerCase(),
      nombre: a.nombre, sub: 'Árbitro',
      foto: fotoUrl(a.foto), initials: initialsOf(a.nombre), count: null, href: `/arbitro/${a.id}`,
    })
  }

  return NextResponse.json({ items })
}
