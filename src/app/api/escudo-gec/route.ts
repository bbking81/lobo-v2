import { getApiData } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET() {
  const data = await getApiData()
  const escudo = data.config?.escudoGEC

  if (!escudo) {
    return new NextResponse(null, { status: 404 })
  }

  // El escudo es un data URI: "data:image/gif;base64,..."
  const match = escudo.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return new NextResponse(null, { status: 400 })
  }

  const [, mimeType, base64Data] = match
  const buffer = Buffer.from(base64Data, 'base64')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
