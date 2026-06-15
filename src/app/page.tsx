import { getApiData, torneoToSlug } from '@/lib/api'
import Link from 'next/link'
import type { Partido, Jugador } from '@/types'
import BannerLive from '@/components/BannerLive'

function calcularResultado(gecGF: number, gecGC: number): 'V' | 'E' | 'D' {
  if (gecGF > gecGC) return 'V'
  if (gecGF === gecGC) return 'E'
  return 'D'
}
function esGecLocal(local: string): boolean {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

/* Header de card — gradiente pizarra #334155 → celeste #0193de (igual que la línea del topbar) */
function CardHeader({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ background: 'linear-gradient(to right, #334155, #0193de)' }}>
      <span className="text-[#60a5fa] shrink-0">{icon}</span>
      <span className="text-[0.75rem] font-bold text-white uppercase" style={{ letterSpacing: '1px' }}>{title}</span>
      {children}
    </div>
  )
}

type ProximoType = { rival: string; fecha: string; hora: string; condicion: string; torneo: string; estadio: string; colorRival?: string; jornada?: string; fase?: string; zona?: string }

const MESES_AB = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

export default async function HomePage() {
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)
  const ordenados = [...publicados].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  const ultimoPartido = ordenados[0]
  // Próximo partido: solo si la fecha no pasó (hora argentina aprox UTC-3);
  // si quedó vencido en el admin, el banner se oculta solo.
  const proximoRaw = data.proximoPartido as ProximoType | undefined
  const hoyArg = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)
  const proximo = proximoRaw?.fecha && proximoRaw.fecha >= hoyArg ? proximoRaw : undefined

  // Un día como hoy
  const hoy = new Date()
  const diaHoy = hoy.getDate(), mesHoy = hoy.getMonth() + 1
  const diaComoHoy = publicados.filter(p => {
    const f = new Date(p.fecha + 'T12:00:00')
    return f.getDate() === diaHoy && f.getMonth() + 1 === mesHoy
  }).slice(0, 6)

  // Forma reciente: últimos 7
  const forma = ordenados.slice(0, 7)
  const escudoDe = (nombre: string): string | null => {
    const rl = nombre.toLowerCase()
    const eqs = data.equipos as { nombre?: string; escudoUrl?: string }[]
    let eq = eqs.find(e => (e.nombre || '').toLowerCase() === rl)
    if (!eq) eq = eqs.find(e => rl.includes((e.nombre || '').toLowerCase()) || (e.nombre || '').toLowerCase().includes(rl))
    return eq?.escudoUrl || null
  }

  // Podios
  const maxParticipaciones = [...data.jugadores].filter(j => (j.pj || 0) > 0).sort((a, b) => (b.pj || 0) - (a.pj || 0)).slice(0, 3)
  const maxGoleadores = [...data.jugadores].filter(j => (j.goles || 0) > 0).sort((a, b) => (b.goles || 0) - (a.goles || 0)).slice(0, 3)

  // Cumpleaños
  const mm = String(mesHoy).padStart(2, '0'), dd = String(diaHoy).padStart(2, '0')
  const cumplenHoy = data.jugadores.filter(j => {
    if (!j.nacimiento) return false
    const parts = j.nacimiento.split('-')
    return parts.length >= 3 && parts[1] === mm && parts[2] === dd
  })

  // Datos para la card de Último Partido (orden real local/visitante)
  const findId = (arr: { id: number; nombre: string }[], name?: string) =>
    name ? arr.find(x => (x.nombre || '').toLowerCase() === name.toLowerCase())?.id : undefined
  const up = ultimoPartido
  const upProps = up ? {
    partido: up,
    escudoLocal: esGecLocal(up.local) ? '/api/escudo-gec' : escudoDe(up.local),
    escudoVisit: esGecLocal(up.local) ? escudoDe(up.visitante) : '/api/escudo-gec',
    torneoHref: up.torneo?.trim() ? `/competencias/${torneoToSlug(up.torneo.trim())}` : null,
    estadioId: findId(data.estadios, up.estadio),
    dtId: findId(data.dts, up.dtGimnasia),
    arbitroId: findId(data.arbitros, up.arbitro),
  } : null

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[1100px] mx-auto space-y-5">

        {proximo && <BannerLive proximo={proximo} escudoRival={escudoDe(proximo.rival)} />}

        {/* FILA 1: Último partido + Un día como hoy */}
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1fr_340px]">
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
            <CardHeader title="Último Partido"
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>} />
            {upProps ? <UltimoPartidoCard {...upProps} /> : <p className="text-center text-[#94a3b8] text-sm py-10">Sin partidos cargados</p>}
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
            <CardHeader title="Un día como hoy..."
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>} />
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {diaComoHoy.length === 0
                ? <p className="text-center text-[#94a3b8] text-sm py-5">Sin partidos en esta fecha</p>
                : diaComoHoy.map(p => <DiaComoHoyFila key={p.id} partido={p} />)}
            </div>
          </div>
        </div>

        {/* FILA 2: Forma Reciente */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <CardHeader title="Forma Reciente"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
          <div className="flex gap-2 overflow-x-auto px-4 py-3 justify-start">
            {forma.map(p => <FormaCard key={p.id} partido={p} escudoRival={escudoDe(esGecLocal(p.local) ? p.visitante : p.local)} />)}
          </div>
        </div>

        {/* FILA 3: Máximas Participaciones + Máximos Goleadores */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <Podio titulo="Máximas Participaciones" jugadores={maxParticipaciones} campo="pj" sufijo="PJ" tema="azul"
            verHref="/jugadores" verTxt="Ver todos los jugadores →"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>} />
          <Podio titulo="Máximos Goleadores" jugadores={maxGoleadores} campo="goles" sufijo="⚽" tema="ambar"
            verHref="/goleadores" verTxt="Ver tabla de goleadores →"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>} />
        </div>

        {/* Hoy cumplen años */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <CardHeader title="Hoy cumplen años"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3M12 8v3M17 8v3"/></svg>} />
          {cumplenHoy.length === 0 ? (
            <p className="text-center text-[#94a3b8] text-sm py-6">Nadie cumple años hoy</p>
          ) : (
            <div className="px-5 py-3 max-h-[300px] overflow-y-auto divide-y divide-[#f1f5f9]">
              {cumplenHoy.map(j => {
                const edad = j.nacimiento ? hoy.getFullYear() - parseInt(j.nacimiento.split('-')[0]) : null
                return (
                  <Link key={j.id} href={`/jugador/${j.id}`} className="flex items-center gap-3 py-2.5 hover:bg-[#f8fafc] -mx-5 px-5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] border-2 border-[#bfdbfe] flex items-center justify-center text-[0.85rem] font-bold text-[#2563eb] shrink-0">{j.apellido.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.85rem] font-bold text-[#1e293b]">{j.nombre}</p>
                      <p className="text-[0.72rem] text-[#94a3b8]">{j.posicion ?? '—'}{edad ? ` · ${edad} años` : ''}</p>
                    </div>
                    <span className="text-xl">🎂</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Sobre este sitio */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
          <div className="text-[0.75rem] font-bold text-[#2563eb] uppercase mb-2" style={{ letterSpacing: '0.8px' }}>Sobre este sitio</div>
          <p className="text-[0.85rem] text-[#475569] mb-2" style={{ lineHeight: 1.7 }}>
            Este sitio es una obra de investigación independiente. Los datos informados corresponden exclusivamente a las participaciones de Gimnasia y Esgrima de Concepción del Uruguay en torneos organizados por la AFA y el Consejo Federal del fútbol argentino.
          </p>
          <p className="text-[0.85rem] text-[#475569]" style={{ lineHeight: 1.7 }}>
            Este sitio no tiene vínculo oficial con el Club Gimnasia y Esgrima de Concepción del Uruguay. Todos los escudos y nombres pertenecen a sus respectivos clubes y se utilizan únicamente con fines informativos.
          </p>
        </div>

      </div>
    </main>
  )
}

/* ── Banner próximo partido: ahora vive en src/components/BannerLive.tsx
      (componente cliente con cuenta regresiva + marcador EN VIVO vía /api/live). ── */

/* ── Card grande último partido (clon del original: orden real, escudos, 6 info cards) ── */
function Escudo({ url }: { url: string | null }) {
  return (
    <div className="mx-auto flex items-center justify-center" style={{ width: 110, height: 110 }}>
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt="" style={{ width: 96, height: 96, objectFit: 'contain' }} />
        : <span style={{ fontSize: '2.5rem' }}>⚽</span>}
    </div>
  )
}
function InfoCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string | null }) {
  const inner = (
    <>
      <div className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: '#e2e8f0', borderRadius: 8, fontSize: '0.9rem' }}>{icon}</div>
      <div className="min-w-0">
        <div className="uppercase" style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</div>
        <div className="truncate" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{value}</div>
      </div>
      {href && <svg className="ml-auto shrink-0 text-[#94a3b8]" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>}
    </>
  )
  const cls = 'flex items-center gap-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-3.5 py-3 min-w-0'
  return href
    ? <Link href={href} className={`${cls} hover:bg-[#eff6ff] hover:border-[#bfdbfe] transition-colors`}>{inner}</Link>
    : <div className={cls}>{inner}</div>
}

function UltimoPartidoCard({ partido: p, escudoLocal, escudoVisit, torneoHref, estadioId, dtId, arbitroId }: {
  partido: Partido; escudoLocal: string | null; escudoVisit: string | null
  torneoHref: string | null; estadioId?: number; dtId?: number; arbitroId?: number
}) {
  const gecLocal = esGecLocal(p.local)
  const res = calcularResultado(p.gecGF, p.gecGC)
  const resBg = res === 'V' ? '#16a34a' : res === 'D' ? '#dc2626' : '#d97706'
  const resTexto = res === 'V' ? 'Victoria' : res === 'D' ? 'Derrota' : 'Empate'
  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="px-8 py-7">
      {/* Equipos en orden real: local izq / visitante der */}
      <div className="grid items-start gap-5 mb-7" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
        <div className="text-center">
          <Escudo url={escudoLocal} />
          <div className="mt-3" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{p.local}</div>
          <div className="mt-0.5" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Local</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center" style={{ height: 110 }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#1e293b', lineHeight: 1, letterSpacing: '0.04em' }} className="tabular-nums">{p.gl} – {p.gv}</div>
          </div>
          <div className="inline-block mt-2 text-white" style={{ background: resBg, fontSize: '0.8rem', fontWeight: 700, padding: '6px 20px', borderRadius: 20 }}>{resTexto}</div>
        </div>
        <div className="text-center">
          <Escudo url={escudoVisit} />
          <div className="mt-3" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{p.visitante}</div>
          <div className="mt-0.5" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Visitante</div>
        </div>
      </div>

      {/* 6 info cards */}
      <div className="grid gap-2.5 mb-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <InfoCard icon="📅" label="Fecha" value={fecha} />
        <InfoCard icon="🏆" label="Torneo" value={p.torneo?.trim() || '—'} href={torneoHref} />
        <InfoCard icon="🏠" label="Condición" value={gecLocal ? 'Local' : 'Visitante'} />
        <InfoCard icon="👔" label="DT" value={p.dtGimnasia || '—'} href={dtId ? `/dt/${dtId}` : null} />
        <InfoCard icon="🏟️" label="Estadio" value={p.estadio || '—'} href={estadioId ? `/estadio/${estadioId}` : null} />
        <InfoCard icon="🟨" label="Árbitro" value={p.arbitro || '—'} href={arbitroId ? `/arbitro/${arbitroId}` : null} />
      </div>

      {/* Ver detalle */}
      <div className="flex justify-center pt-1 pb-1.5">
        <Link href={`/partido/partido-${p.id}`} className="inline-flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#dbeafe] text-[#475569] hover:text-[#2563eb] transition-colors" style={{ padding: '7px 18px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Ver detalle
        </Link>
      </div>
    </div>
  )
}

/* ── Fila "Un día como hoy" ── */
function DiaComoHoyFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const res = calcularResultado(p.gecGF, p.gecGC)
  const scoreColor = res === 'V' ? '#16a34a' : res === 'E' ? '#ca8a04' : '#dc2626'
  const scoreBg = res === 'V' ? '#dcfce7' : res === 'E' ? '#fef9c3' : '#fee2e2'
  return (
    <Link href={`/partido/partido-${p.id}`} className="flex items-center gap-3 py-2.5 border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc] -mx-4 px-4 transition-colors rounded">
      <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
        <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.85rem] font-semibold text-[#1e293b] truncate">vs {rival}</p>
        <p className="text-[0.72rem] text-[#94a3b8]">{p.fecha.substring(0, 4)} · {p.torneo?.trim()}</p>
      </div>
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md shrink-0" style={{ background: scoreBg, color: scoreColor }}>{p.gecGF}–{p.gecGC}</span>
    </Link>
  )
}

/* ── Card de Forma Reciente ── */
function FormaCard({ partido: p, escudoRival }: { partido: Partido; escudoRival: string | null }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const gf = p.gecGF, gc = p.gecGC
  const res = calcularResultado(gf, gc)
  const resBg = res === 'V' ? '#16a34a' : res === 'E' ? '#ca8a04' : '#dc2626'
  const parts = (p.fecha || '').split('-')
  const fechaFmt = parts.length >= 3 ? `${parts[2].substring(0, 2)} ${MESES_AB[parseInt(parts[1]) - 1]}.` : ''
  const ini = (s: string) => s.trim().split(/\s+/).filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || s.substring(0, 2).toUpperCase()
  return (
    <Link href={`/partido/partido-${p.id}`} className="flex flex-col items-center gap-1.5 pt-2.5 bg-white border border-[#e2e8f0] rounded-xl shrink-0 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ width: 110 }}>
      <div className="flex items-center justify-center gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/escudo-gec" alt="GEC" className="w-8 h-8 object-contain" />
        <span className="text-[0.6rem] text-[#cbd5e1] font-bold">vs</span>
        {escudoRival
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={escudoRival} alt={rival} className="w-8 h-8 object-contain" />
          : <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[0.7rem] font-extrabold text-white">{ini(rival)}</div>}
      </div>
      <div className="text-[1.35rem] font-black text-[#1e293b] leading-none" style={{ letterSpacing: '1px' }}>{gf}-{gc}</div>
      <div className="text-[0.68rem] text-[#475569] font-bold uppercase" style={{ letterSpacing: '0.08em' }}>{fechaFmt}</div>
      <div className="w-full mt-0.5" style={{ height: 4, background: resBg }} />
    </Link>
  )
}

/* ── Podio top-3 (participaciones / goleadores) ── */
const RANK_COL = ['#f59e0b', '#94a3b8', '#cd7c3a']
function Podio({ titulo, icon, jugadores, campo, sufijo, tema, verHref, verTxt }: {
  titulo: string; icon: React.ReactNode; jugadores: Jugador[]; campo: 'pj' | 'goles'; sufijo: string
  tema: 'azul' | 'ambar'; verHref: string; verTxt: string
}) {
  const ring = tema === 'azul' ? '#bfdbfe' : '#fde68a'
  const phBg = tema === 'azul' ? '#eff6ff' : '#fef3c7'
  const phColor = tema === 'azul' ? '#2563eb' : '#d97706'
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
      <CardHeader title={titulo} icon={icon} />
      {jugadores.length === 0 ? (
        <div className="text-center text-[#94a3b8] text-sm py-6">Sin datos</div>
      ) : (
        <>
          <div className="flex items-end justify-center gap-8 px-5 pt-7 pb-3">
            {jugadores.map((j, i) => (
              <Link key={j.id} href={`/jugador/${j.id}`} className="text-center flex-1 max-w-[150px]">
                <div className="relative inline-block mb-2.5">
                  {j.foto && j.foto.startsWith('http')
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={j.foto} alt={j.apellido} className="w-[72px] h-[72px] rounded-full object-cover" style={{ border: `3px solid ${ring}` }} />
                    : <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[1.1rem] font-extrabold" style={{ background: phBg, border: `3px solid ${ring}`, color: phColor }}>{j.apellido.charAt(0)}</div>}
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white text-[0.72rem] font-extrabold flex items-center justify-center border-2 border-white" style={{ background: RANK_COL[i] }}>{i + 1}</div>
                </div>
                <div className="text-[0.88rem] font-bold text-[#1e293b] mb-0.5 truncate">{j.apellido}</div>
                <div className="text-[0.82rem] font-extrabold" style={{ color: RANK_COL[i] }}>{(j[campo] as number)} {sufijo}</div>
              </Link>
            ))}
          </div>
          <div className="border-t border-[#e2e8f0] py-2.5 text-center">
            <Link href={verHref} className="text-[0.8rem] text-[#2563eb] font-semibold hover:underline">{verTxt}</Link>
          </div>
        </>
      )}
    </div>
  )
}
