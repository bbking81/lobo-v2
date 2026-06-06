import { notFound } from 'next/navigation'
import { getApiData, slugToId } from '@/lib/api'
import Link from 'next/link'
import Timeline from '@/components/Timeline'
import Formacion from '@/components/Formacion'
import PlanillaPartido from '@/components/PlanillaPartido'
import MediaPartido from '@/components/MediaPartido'
import type { Metadata } from 'next'
import type { JugadorPlanilla, Partido, Evento } from '@/types'

interface Props { params: Promise<{ slug: string }> }

const esGecLocalFn = (local: string) => (local || '').toLowerCase().includes('gimnasia')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getApiData()
  const p = data.partidos.find(x => x.id === slugToId(slug))
  return { title: p ? `${p.local} ${p.gl} - ${p.gv} ${p.visitante} | Lobo Entrerriano` : 'Partido no encontrado' }
}

export async function generateStaticParams() {
  const data = await getApiData()
  return data.partidos.filter(p => p.publicado).map(p => ({ slug: `partido-${p.id}` }))
}

interface Goleador { nombre: string; mins: string[]; penales: number }
function goleadores(planilla: JugadorPlanilla[]): Goleador[] {
  const out: Goleador[] = []
  for (const r of planilla ?? []) {
    const mg = String(r.minGoles ?? '').trim()
    const penales = r.penales ?? 0
    const golesN = r.goles ?? 0
    if (!mg && !penales && golesN <= 0) continue
    out.push({ nombre: r.jugador, mins: mg ? mg.split(/\s+/).filter(Boolean) : [], penales })
  }
  return out
}

// Deriva los eventos del partido desde las planillas (la API no trae `eventos`)
function derivarEventos(p: Partido, gecLocal: boolean): Evento[] {
  const ev: Evento[] = []
  const ladoGec = gecLocal ? 'local' : 'visitante'
  const ladoRiv = gecLocal ? 'visitante' : 'local'
  const goles = (pl: JugadorPlanilla[], lado: 'local' | 'visitante') => {
    for (const r of pl ?? []) {
      const mins = String(r.minGoles ?? '').trim().split(/\s+/).filter(Boolean)
      for (const m of mins) ev.push({ min: parseInt(m) || 0, tipo: 'gol', jugador: r.jugador, equipo: lado })
    }
  }
  const cambios = (pl: JugadorPlanilla[], lado: 'local' | 'visitante') => {
    for (const r of pl ?? []) {
      if (r.titular === false && r.minE) ev.push({ min: parseInt(r.minE) || 0, tipo: 'cambio', jugador: r.jugador, jugador2: r.reemplazaA, equipo: lado })
    }
  }
  const rojas = (pl: JugadorPlanilla[], lado: 'local' | 'visitante') => {
    for (const r of pl ?? []) {
      if ((r.rojas ?? 0) > 0) ev.push({ min: parseInt(r.minS ?? '') || 0, tipo: 'tarjeta-roja', jugador: r.jugador, equipo: lado })
    }
  }
  goles(p.planillaGec, ladoGec); goles(p.planillaRival, ladoRiv)
  cambios(p.planillaGec, ladoGec); cambios(p.planillaRival, ladoRiv)
  rojas(p.planillaGec, ladoGec); rojas(p.planillaRival, ladoRiv)
  return ev
}

export default async function PartidoPage({ params }: Props) {
  const { slug } = await params
  const data = await getApiData()
  const p = data.partidos.find(x => x.id === slugToId(slug))
  if (!p) notFound()

  const gecLocal = esGecLocalFn(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const res = p.gecGF > p.gecGC ? 'V' : p.gecGF === p.gecGC ? 'E' : 'D'
  const resLabel = res === 'V' ? 'VICTORIA' : res === 'E' ? 'EMPATE' : 'DERROTA'
  const resBg = res === 'V' ? '#16a34a' : res === 'E' ? '#ca8a04' : '#dc2626'
  const fechaFmt = p.fecha ? new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

  const eqByNombre = (n: string) => (data.equipos as { nombre?: string; escudoUrl?: string }[]).find(e => (e.nombre || '').toLowerCase() === (n || '').toLowerCase())
  const escudoDe = (nombre: string, esGec: boolean) => esGec ? '/api/escudo-gec' : (eqByNombre(nombre)?.escudoUrl || null)
  const findId = (arr: { id: number; nombre: string }[], name?: string) => name ? arr.find(x => (x.nombre || '').toLowerCase() === name.toLowerCase())?.id : undefined

  const golesLocal = goleadores(gecLocal ? p.planillaGec : p.planillaRival)
  const golesVisit = goleadores(gecLocal ? p.planillaRival : p.planillaGec)

  // Planillas enriquecidas con foto (para la formación)
  const fotoMap = new Map(data.jugadores.map(j => [j.id, j.foto]))
  const enriquecer = (pl: JugadorPlanilla[]) => pl.map(j => ({ ...j, foto: j.jugador_id ? (fotoMap.get(j.jugador_id) ?? null) : null }))
  const planillaGec = enriquecer(p.planillaGec ?? [])
  const planillaRival = enriquecer(p.planillaRival ?? [])

  const eventos = derivarEventos(p, gecLocal)
  const tieneFormacion = !!(p.formacion || p.formacionRival) && (planillaGec.length > 0 || planillaRival.length > 0)

  const estadioId = findId(data.estadios, p.estadio)
  const arbitroId = findId(data.arbitros, p.arbitro)
  const dtGecId = findId(data.dts, p.dtGimnasia)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col gap-5">

        {/* ── CABEZAL ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ padding: '28px 32px' }}>
            <div className="text-center mb-5">
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                {p.torneo?.trim()}{p.fechaNro ? ` · Fecha ${p.fechaNro}` : ''}
                {p.fase && <span className="ml-2 align-middle" style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>{p.fase}{p.subfase ? ` · ${p.subfase}` : ''}</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>{fechaFmt}{p.hora ? ` · ${p.hora}` : ''}</div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <EquipoCol nombre={p.local} cond="Local" escudo={escudoDe(p.local, gecLocal)} goles={golesLocal} />
              <div className="flex flex-col items-center gap-2.5 shrink-0 pt-2">
                <div className="tabular-nums" style={{ fontSize: '3.8rem', fontWeight: 900, color: '#1e293b', lineHeight: 1, letterSpacing: '0.04em' }}>{p.gl} – {p.gv}</div>
                <div className="text-white" style={{ padding: '5px 18px', borderRadius: 20, background: resBg, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em' }}>{resLabel}</div>
              </div>
              <EquipoCol nombre={p.visitante} cond="Visitante" escudo={escudoDe(p.visitante, !gecLocal)} goles={golesVisit} />
            </div>

            <div className="text-center mt-4">
              <Link href={`/rival/${encodeURIComponent(rival)}`} className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-[#1e293b] transition-colors" style={{ fontSize: '0.82rem' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                Ver historial completo vs {rival}
              </Link>
            </div>
          </div>
        </div>

        {/* ── PLANILLAS ── */}
        {(planillaGec.length > 0 || planillaRival.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PlanillaPartido jugadores={gecLocal ? p.planillaGec : p.planillaRival} esGec={gecLocal} nombreEquipo={gecLocal ? 'Gimnasia y Esgrima' : rival} escudoUrl={escudoDe(p.local, gecLocal)} dtNombre={gecLocal ? p.dtGimnasia : p.dtRival} dtId={gecLocal ? dtGecId : undefined} />
            <PlanillaPartido jugadores={!gecLocal ? p.planillaGec : p.planillaRival} esGec={!gecLocal} nombreEquipo={!gecLocal ? 'Gimnasia y Esgrima' : rival} escudoUrl={escudoDe(p.visitante, !gecLocal)} dtNombre={!gecLocal ? p.dtGimnasia : p.dtRival} dtId={!gecLocal ? dtGecId : undefined} />
          </div>
        )}

        {/* ── ALINEACIÓN TÁCTICA ── */}
        {tieneFormacion && (
          <Formacion jugadoresGec={planillaGec} jugadoresRival={planillaRival} formacionGec={p.formacion ?? ''} formacionRival={p.formacionRival ?? ''} kitGec={p.kitGec} kitRival={p.kitRival} localNombre={p.local} visitanteNombre={p.visitante} />
        )}

        {/* ── LÍNEA DE TIEMPO ── */}
        {eventos.length > 0 && <Timeline eventos={eventos} local={p.local} visitante={p.visitante} />}

        {/* ── MULTIMEDIA ── */}
        <MediaPartido fotos={p.mediaFotos ?? []} videos={p.mediaVideos ?? []} audios={p.mediaAudios ?? []} />

        {/* ── DATOS DEL PARTIDO (chips) ── */}
        {(p.estadio || p.arbitro || p.asistente1 || p.asistente2 || p.cuarto || p.var || p.avar) && (
          <div className="flex flex-wrap gap-2.5">
            <Chip label="Estadio" valor={p.estadio} href={estadioId ? `/estadio/${estadioId}` : undefined} />
            <Chip label="Árbitro" valor={p.arbitro} href={arbitroId ? `/arbitro/${arbitroId}` : undefined} />
            <Chip label="Asistente 1" valor={p.asistente1} />
            <Chip label="Asistente 2" valor={p.asistente2} />
            <Chip label="4° Árbitro" valor={p.cuarto} />
            <Chip label="VAR" valor={p.var} />
            <Chip label="AVAR" valor={p.avar} />
          </div>
        )}

        {/* ── INCIDENCIAS / NOTAS ── */}
        {p.incidencias && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px' }}>
            <div className="uppercase flex items-center gap-1.5" style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.07em', color: '#92400e', marginBottom: 4 }}>
              <svg width="11" height="11" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              Incidencias
            </div>
            <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{p.incidencias}</div>
          </div>
        )}
        {p.notas && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px' }}>
            <div className="uppercase flex items-center gap-1.5" style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.07em', color: '#1d4ed8', marginBottom: 4 }}>
              <svg width="11" height="11" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Notas
            </div>
            <div style={{ fontSize: '0.85rem', color: '#1e3a5f', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{p.notas}</div>
          </div>
        )}
      </div>
    </main>
  )
}

function EquipoCol({ nombre, cond, escudo, goles }: { nombre: string; cond: string; escudo: string | null; goles: Goleador[] }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2.5 min-w-0">
      <div className="flex items-center justify-center overflow-hidden" style={{ width: 91, height: 91, borderRadius: 14, background: escudo ? '#f1f5f9' : '#e2e8f0' }}>
        {escudo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={escudo} alt="" style={{ width: 81, height: 81, objectFit: 'contain' }} />
          : <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>{(nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}</span>}
      </div>
      <div className="text-center">
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{nombre}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{cond}</div>
      </div>
      {goles.length > 0 && (
        <div className="flex flex-col gap-0.5 mt-1">
          {goles.map((g, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: '#334155' }}>
              ⚽ {g.nombre}
              {g.mins.length > 0 && <span style={{ color: '#475569', fontWeight: 600 }}> {g.mins.map(m => `${m}'`).join(' ')}</span>}
              {g.penales > 0 && <span className="ml-1" style={{ fontSize: '0.6rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '1px 5px', borderRadius: 4 }}>P</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ label, valor, href }: { label: string; valor?: string; href?: string }) {
  if (!valor) return null
  const inner = (
    <>
      <div className="uppercase" style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', color: '#64748b', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{valor}</div>
    </>
  )
  const cls = 'bg-white border border-[#e2e8f0] rounded-[10px]'
  const style = { padding: '12px 16px', flex: '1 1 150px', minWidth: 150 } as const
  return href
    ? <Link href={href} className={`${cls} hover:border-[#bfdbfe] transition-colors`} style={style}>{inner}</Link>
    : <div className={cls} style={style}>{inner}</div>
}
