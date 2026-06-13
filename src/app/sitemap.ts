import type { MetadataRoute } from 'next'
import { getApiData, torneoToSlug } from '@/lib/api'
import { SITE_URL } from '@/lib/seo'

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL

  // Páginas fijas del menú
  const estaticas: MetadataRoute.Sitemap = [
    '', '/partidos', '/jugadores', '/goleadores', '/competencias', '/rankings',
    '/dts', '/arbitros', '/estadios', '/historiales', '/buscador', '/mapa',
    '/jugadores-rivales', '/dt-rivales',
  ].map(p => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }))

  // Páginas dinámicas (una por entidad). Si el API falla, devolvemos al menos
  // las estáticas para no romper el sitemap entero.
  let dinamicas: MetadataRoute.Sitemap = []
  try {
    const data = await getApiData()
    const publicados = data.partidos.filter(p => p.publicado)

    const partidos = publicados.map(p => ({
      url: `${base}/partido/partido-${p.id}`,
      lastModified: p.fecha || undefined,
      priority: 0.6,
    }))
    const jugadores = data.jugadores.map(j => ({ url: `${base}/jugador/${j.id}`, priority: 0.6 }))
    const dts = (data.dts ?? []).map(d => ({ url: `${base}/dt/${d.id}`, priority: 0.5 }))
    const arbitros = (data.arbitros ?? []).map(a => ({ url: `${base}/arbitro/${a.id}`, priority: 0.4 }))
    const estadios = (data.estadios ?? []).map(e => ({ url: `${base}/estadio/${e.id}`, priority: 0.4 }))
    const jugRivales = (data.jugadoresRivales ?? []).map(j => ({ url: `${base}/jugador-rival/${j.id}`, priority: 0.3 }))

    const rivales = [...new Set(publicados.map(p => esGecLocal(p.local) ? p.visitante : p.local).filter(Boolean))]
      .map(r => ({ url: `${base}/rival/${encodeURIComponent(r)}`, priority: 0.5 }))

    const competencias = [...new Set(publicados.map(p => p.torneo?.trim()).filter(Boolean) as string[])]
      .map(t => ({ url: `${base}/competencias/${torneoToSlug(t)}`, priority: 0.5 }))

    dinamicas = [...partidos, ...jugadores, ...dts, ...arbitros, ...estadios, ...jugRivales, ...rivales, ...competencias]
  } catch {
    // sin datos → sólo estáticas
  }

  return [...estaticas, ...dinamicas]
}
