import { NextResponse } from 'next/server'
import { getApiData, fotoUrl } from '@/lib/api'

export interface SearchItem {
  nombre: string
  sub: string
  foto: string | null
  initials: string
  count: number | null
  href: string
}
export interface SearchGroup {
  key: string
  label: string
  items: SearchItem[]
}

const initialsOf = (nombre: string) =>
  (nombre.split(',')[0] || '').trim().slice(0, 2).toUpperCase()

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase()
  if (q.length < 2) return NextResponse.json({ groups: [] })

  const data = await getApiData()
  const groups: SearchGroup[] = []

  // ── Jugadores GEC ──
  const jugs = data.jugadores.filter(j => j.nombre?.toLowerCase().includes(q)).slice(0, 5)
  if (jugs.length) {
    groups.push({
      key: 'jugadores', label: 'Jugadores',
      items: jugs.map(j => ({
        nombre: j.nombre,
        sub: [j.posicion || 'Jugador', j.pais].filter(Boolean).join(' · '),
        foto: fotoUrl(j.foto),
        initials: initialsOf(j.nombre),
        count: data.partidos.filter(p => p.planillaGec?.some(r => r.jugador_id === j.id)).length,
        href: `/jugador/${j.id}`,
      })),
    })
  }

  // ── Directores Técnicos ──
  const dts = data.dts.filter(d => d.nombre?.toLowerCase().includes(q)).slice(0, 3)
  if (dts.length) {
    groups.push({
      key: 'dts', label: 'Directores Técnicos',
      items: dts.map(d => ({
        nombre: d.nombre,
        sub: ['Director Técnico', d.pais].filter(Boolean).join(' · '),
        foto: fotoUrl(d.foto),
        initials: initialsOf(d.nombre),
        count: null,
        href: '/dts',
      })),
    })
  }

  // ── Estadios ──
  const ests = data.estadios.filter(e =>
    e.nombre?.toLowerCase().includes(q) || e.ciudad?.toLowerCase().includes(q)
  ).slice(0, 3)
  if (ests.length) {
    groups.push({
      key: 'estadios', label: 'Estadios',
      items: ests.map(e => ({
        nombre: e.nombre,
        sub: [e.ciudad, e.provincia].filter(Boolean).join(' · '),
        foto: fotoUrl(e.fotoUrl),
        initials: initialsOf(e.nombre),
        count: data.partidos.filter(p => p.estadio === e.nombre).length,
        href: '/estadios',
      })),
    })
  }

  // ── Equipos Rivales ──
  const eqs = (data.equipos as { nombre?: string; ciudad?: string }[])
    .filter(e => e.nombre?.toLowerCase().includes(q)).slice(0, 3)
  if (eqs.length) {
    groups.push({
      key: 'equipos', label: 'Equipos Rivales',
      items: eqs.map(e => ({
        nombre: e.nombre ?? '',
        sub: e.ciudad || 'Equipo rival',
        foto: null,
        initials: (e.nombre ?? '').slice(0, 2).toUpperCase(),
        count: data.partidos.filter(p => p.local === e.nombre || p.visitante === e.nombre).length,
        href: '/historiales',
      })),
    })
  }

  // ── Jugadores Rivales ──
  const jrs = data.jugadoresRivales.filter(j => j.nombre?.toLowerCase().includes(q)).slice(0, 3)
  if (jrs.length) {
    groups.push({
      key: 'jugadores-rivales', label: 'Jugadores Rivales',
      items: jrs.map(j => ({
        nombre: j.nombre,
        sub: [j.posicion || 'Jugador rival', j.equipo].filter(Boolean).join(' · '),
        foto: fotoUrl(j.foto),
        initials: initialsOf(j.nombre),
        count: null,
        href: '/jugadores-rivales',
      })),
    })
  }

  // ── Árbitros ──
  const arbs = data.arbitros.filter(a => a.nombre?.toLowerCase().includes(q)).slice(0, 3)
  if (arbs.length) {
    groups.push({
      key: 'arbitros', label: 'Árbitros',
      items: arbs.map(a => ({
        nombre: a.nombre,
        sub: 'Árbitro',
        foto: fotoUrl(a.foto),
        initials: initialsOf(a.nombre),
        count: null,
        href: '/arbitros',
      })),
    })
  }

  return NextResponse.json({ groups })
}
