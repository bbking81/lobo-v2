import type { Metadata } from 'next'

export const SITE_URL = 'https://loboentrerriano.com'

/**
 * Arma los metadatos de una página (título, descripción, Open Graph y Twitter
 * card) de forma uniforme. El título se completa con "| Lobo Entrerriano" vía
 * el `title.template` definido en layout.tsx, así que acá va sólo el núcleo.
 */
export function pageMeta(opts: {
  title: string
  description: string
  path?: string
  image?: string | null
}): Metadata {
  const image = opts.image || '/static/logo.png'
  return {
    title: opts.title,
    description: opts.description,
    alternates: opts.path ? { canonical: opts.path } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      siteName: 'Lobo Entrerriano',
      locale: 'es_AR',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  }
}
