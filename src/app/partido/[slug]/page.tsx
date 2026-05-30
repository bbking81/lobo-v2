import { notFound } from 'next/navigation'
import { getApiData, slugToId } from '@/lib/api'
import ScoreHeader from '@/components/ScoreHeader'
import Timeline from '@/components/Timeline'
import Formacion from '@/components/Formacion'
import Planilla from '@/components/Planilla'
import type { Metadata } from 'next'
import type { JugadorPlanilla } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

function calcularResultado(gecGF: number, gecGC: number): string {
  if (gecGF > gecGC) return 'Victoria'
  if (gecGF === gecGC) return 'Empate'
  return 'Derrota'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = slugToId(slug)
  const data = await getApiData()
  const partido = data.partidos.find(p => p.id === id)
  if (!partido) return { title: 'Partido no encontrado' }
  return {
    title: `${partido.local} ${partido.gl} - ${partido.gv} ${partido.visitante} | Lobo Entrerriano`,
  }
}

export async function generateStaticParams() {
  const data = await getApiData()
  return data.partidos
    .filter(p => p.publicado)
    .map(p => ({ slug: `partido-${p.id}` }))
}

export default async function PartidoPage({ params }: Props) {
  const { slug } = await params
  const id = slugToId(slug)
  const data = await getApiData()
  const partido = data.partidos.find(p => p.id === id)

  if (!partido) notFound()

  const resultado = calcularResultado(partido.gecGF, partido.gecGC)

  // Mapa id → foto
  const fotoMap = new Map(data.jugadores.map(j => [j.id, j.foto]))

  const enriquecer = (planilla: JugadorPlanilla[]) =>
    planilla.map(j => ({
      ...j,
      foto: j.jugador_id ? (fotoMap.get(j.jugador_id) ?? null) : null,
    }))

  const planillaGec = enriquecer(partido.planillaGec ?? [])
  const planillaRival = enriquecer(partido.planillaRival ?? [])

  const escudoGec = '/api/escudo-gec'
  const escudoRival = partido.escudoRival

  const tieneFormacion = !!(partido.formacion || partido.formacionRival)
  const tienePlanilla = planillaGec.length > 0 || planillaRival.length > 0

  return (
    <main className="min-h-screen bg-gray-100">
      <ScoreHeader partido={partido} resultado={resultado} escudoGec={escudoGec} escudoRival={escudoRival} />

      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
        {partido.eventos?.length > 0 && (
          <Timeline
            eventos={partido.eventos}
            local={partido.local}
            visitante={partido.visitante}
          />
        )}

        {tieneFormacion && tienePlanilla && (
          <Formacion
            jugadoresGec={planillaGec}
            jugadoresRival={planillaRival}
            formacionGec={partido.formacion ?? ''}
            formacionRival={partido.formacionRival ?? ''}
            kitGec={partido.kitGec}
            kitRival={partido.kitRival}
            localNombre={partido.local}
            visitanteNombre={partido.visitante}
          />
        )}

        {tienePlanilla && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Planilla jugadores={planillaGec} titulo={partido.local} kit={partido.kitGec} />
            <Planilla jugadores={planillaRival} titulo={partido.visitante} kit={partido.kitRival} />
          </div>
        )}

        {partido.arbitro && (
          <p className="text-xs text-gray-400 text-center pb-4">
            Árbitro: {partido.arbitro}
          </p>
        )}
      </div>
    </main>
  )
}
