import { getApiData, fotoUrl } from '@/lib/api'
import Link from 'next/link'
import SecBanner from '@/components/SecBanner'
import type { Partido } from '@/types'

interface Props { searchParams: Promise<Record<string, string | undefined>> }

const esGecLocal = (p: Partido) => (p.local || '').toLowerCase().includes('gimnasia')

const METRICAS_JUG: { v: string; label: string }[] = [
  { v: 'goles', label: '⚽ Más goles marcados' },
  { v: 'pj', label: '🏃 Más partidos jugados' },
  { v: 'dobletes', label: '2️⃣ Más dobletes (2 goles)' },
  { v: 'tripletes', label: '3️⃣ Más tripletes (3 goles)' },
  { v: 'pokers', label: '4️⃣ Más pókers (4 goles)' },
  { v: 'cincoplus', label: '🔥 Más 5+ goles en un partido' },
  { v: 'rojas', label: '🟥 Más expulsiones' },
  { v: 'amarillas', label: '🟨 Más amarillas' },
  { v: 'local', label: '🏠 Más partidos de local' },
  { v: 'visitante', label: '🚌 Más partidos de visitante' },
]
const METRICAS_DT: { v: string; label: string; asc?: boolean; min?: number }[] = [
  { v: 'pj', label: '🏟️ Más partidos dirigidos' },
  { v: 'pg', label: '✅ Más victorias' },
  { v: 'pe', label: '🤝 Más empates' },
  { v: 'pp', label: '❌ Más derrotas' },
  { v: 'pct', label: '📈 Mejor % de victorias (mín. 5 PJ)', min: 5 },
  { v: 'gf', label: '⚽ Más goles a favor' },
  { v: 'gc', label: '🛡️ Menos goles en contra', asc: true },
  { v: 'local', label: '🏠 Más partidos de local' },
  { v: 'visitante', label: '🚌 Más partidos de visitante' },
]
const METRICAS_EQ: { v: string; label: string }[] = [
  { v: 'eq_vic_torneo', label: '🏆 Más victorias en un torneo' },
  { v: 'eq_pg_pct_torneo', label: '📈 Mejor % victorias en un torneo (mín. 3 PJ)' },
  { v: 'eq_gf_torneo', label: '⚽ Más goles en un torneo' },
  { v: 'eq_gc_torneo', label: '🛡️ Menos goles recibidos en un torneo' },
  { v: 'eq_invicta_torneo', label: '🔒 Mayor invicto en un torneo' },
  { v: 'eq_racha_vic', label: '🔥 Mayor racha de victorias' },
  { v: 'eq_racha_der', label: '❄️ Mayor racha de derrotas' },
  { v: 'eq_racha_invicta', label: '⚡ Mayor racha invicta (V o E)' },
  { v: 'eq_racha_sin_ganar', label: '😐 Mayor racha sin ganar (E o D)' },
  { v: 'eq_mejor_temp', label: '📅 Mejor temporada (% victorias, mín. 5 PJ)' },
  { v: 'eq_goles_temp', label: '🎯 Más goles en una temporada' },
]
const inputCls = 'bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-3 py-2 text-sm text-[#1e293b] outline-none'

interface JugAcc { id?: number; nombre: string; goles: number; pj: number; dobletes: number; tripletes: number; pokers: number; cincoplus: number; rojas: number; amarillas: number; local: number; visitante: number }
interface DTAcc { nombre: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; local: number; visitante: number }
interface EqRow { titulo: string; sub: string; valor: string; valorLabel: string }

// Ranking de Equipos (récords del club): por torneo, rachas y temporada
function computeEquipos(pubs: Partido[], metrica: string, fTemp: string, fTorneo: string, topN: number): EqRow[] {
  const todos = pubs.filter(p => {
    if (!p.fecha) return false
    if (fTemp && p.fecha.slice(0, 4) !== fTemp) return false
    if (fTorneo && (p.torneo || '') !== fTorneo) return false
    return true
  }).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  const res = (p: Partido) => p.gecGF > p.gecGC ? 'g' : p.gecGF < p.gecGC ? 'p' : 'e'
  const fmt = (f: string) => f ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

  const isRacha = ['eq_racha_vic', 'eq_racha_der', 'eq_racha_invicta', 'eq_racha_sin_ganar'].includes(metrica)
  const isTemp = metrica === 'eq_mejor_temp' || metrica === 'eq_goles_temp'

  if (isRacha) {
    const rachas: { n: number; from: Partido; to: Partido; torneos: string }[] = []
    let cur = 0, start: Partido | null = null, list: Partido[] = []
    const flush = () => { if (cur >= 2 && start) rachas.push({ n: cur, from: start, to: list[list.length - 1], torneos: [...new Set(list.map(p => p.torneo).filter(Boolean))].join(', ') }); cur = 0; start = null; list = [] }
    for (const p of todos) {
      const r = res(p)
      const match = metrica === 'eq_racha_vic' ? r === 'g' : metrica === 'eq_racha_der' ? r === 'p' : metrica === 'eq_racha_invicta' ? (r === 'g' || r === 'e') : (r === 'p' || r === 'e')
      if (match) { cur++; if (!start) start = p; list.push(p) } else flush()
    }
    flush()
    const lab = ({ eq_racha_vic: 'victorias', eq_racha_der: 'derrotas', eq_racha_invicta: 'sin perder', eq_racha_sin_ganar: 'sin ganar' } as Record<string, string>)[metrica] || ''
    return rachas.sort((a, b) => b.n - a.n).slice(0, topN).map(r => ({ titulo: r.torneos || '—', sub: `${fmt(r.from.fecha)} – ${fmt(r.to.fecha)}`, valor: String(r.n), valorLabel: lab }))
  }

  if (isTemp) {
    const t: Record<string, { año: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number }> = {}
    for (const p of todos) {
      const año = (p.fecha || '').slice(0, 4); if (!año) continue
      const s = t[año] ?? (t[año] = { año, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 })
      const r = res(p); s.pj++; s.gf += p.gecGF; s.gc += p.gecGC
      if (r === 'g') s.pg++; else if (r === 'e') s.pe++; else s.pp++
    }
    return Object.values(t).filter(s => metrica === 'eq_mejor_temp' ? s.pj >= 5 : true)
      .sort((a, b) => metrica === 'eq_mejor_temp' ? (b.pg / b.pj) - (a.pg / a.pj) : b.gf - a.gf)
      .slice(0, topN).map(s => ({
        titulo: s.año, sub: `${s.pj} PJ · ${s.pg}G ${s.pe}E ${s.pp}D · ${s.gf}:${s.gc}`,
        valor: metrica === 'eq_mejor_temp' ? `${Math.round((s.pg / s.pj) * 100)}%` : String(s.gf),
        valorLabel: metrica === 'eq_mejor_temp' ? 'victorias' : 'goles',
      }))
  }

  // Por torneo (torneo+año)
  const g: Record<string, { torneo: string; año: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; inv: number }> = {}
  for (const p of todos) {
    if (!p.torneo) continue
    const año = (p.fecha || '').slice(0, 4); const key = `${p.torneo}||${año}`
    const s = g[key] ?? (g[key] = { torneo: p.torneo, año, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, inv: 0 })
    const r = res(p); s.pj++; s.gf += p.gecGF; s.gc += p.gecGC
    if (r === 'g') { s.pg++; s.inv++ } else if (r === 'e') { s.pe++; s.inv++ } else s.pp++
  }
  const asc = metrica === 'eq_gc_torneo'
  return Object.values(g).filter(s => {
    if (metrica === 'eq_pg_pct_torneo' && s.pj < 3) return false
    if (metrica === 'eq_vic_torneo' && s.pg === 0) return false
    if (metrica === 'eq_gf_torneo' && s.gf === 0) return false
    return true
  }).sort((a, b) => {
    if (asc) return a.gc - b.gc
    if (metrica === 'eq_pg_pct_torneo') return (b.pg / b.pj) - (a.pg / a.pj)
    if (metrica === 'eq_gf_torneo') return b.gf - a.gf
    if (metrica === 'eq_invicta_torneo') return b.inv - a.inv
    return b.pg - a.pg
  }).slice(0, topN).map(s => {
    const valor = metrica === 'eq_pg_pct_torneo' ? `${Math.round((s.pg / s.pj) * 100)}%` : metrica === 'eq_gf_torneo' ? String(s.gf) : metrica === 'eq_gc_torneo' ? String(s.gc) : metrica === 'eq_invicta_torneo' ? String(s.inv) : String(s.pg)
    const valorLabel = metrica === 'eq_gf_torneo' ? 'goles' : metrica === 'eq_gc_torneo' ? 'recibidos' : metrica === 'eq_invicta_torneo' ? 'sin perder' : 'victorias'
    return { titulo: s.torneo, sub: `${s.año} · ${s.pj} PJ · ${s.pg}G ${s.pe}E ${s.pp}D · ${s.gf}:${s.gc}`, valor, valorLabel }
  })
}

export default async function RankingsPage({ searchParams }: Props) {
  const sp = await searchParams
  const data = await getApiData()
  const tab = sp.tab === 'dt' ? 'dt' : sp.tab === 'eq' ? 'eq' : 'jug'
  const metrica = sp.metrica ?? (tab === 'dt' ? 'pg' : tab === 'eq' ? 'eq_vic_torneo' : 'goles')
  const topN = parseInt(sp.topN ?? '20') || 20
  const fTemporada = sp.temporada ?? ''
  const fTorneo = sp.torneo ?? ''
  const fCond = sp.cond ?? ''

  // Opciones de filtros
  const sortUniq = (arr: (string | undefined)[]) => [...new Set(arr.filter((x): x is string => !!x))].sort()
  const temporadas = sortUniq(data.partidos.map(p => p.fecha?.slice(0, 4))).reverse()
  const torneos = sortUniq(data.partidos.map(p => p.torneo))

  // Partidos que pasan los filtros de match
  const partidos = data.partidos.filter(p => {
    if (!p.publicado) return false
    if (fTemporada && p.fecha?.slice(0, 4) !== fTemporada) return false
    if (fTorneo && p.torneo !== fTorneo) return false
    const gecLocal = esGecLocal(p)
    if (fCond === 'local' && !gecLocal) return false
    if (fCond === 'visitante' && gecLocal) return false
    return true
  })

  // ── Acumular ──
  const jugMap = new Map<string | number, JugAcc>()
  const dtMap = new Map<string, DTAcc>()
  for (const p of partidos) {
    const gecLocal = esGecLocal(p)
    for (const r of p.planillaGec ?? []) {
      const key = r.jugador_id ?? r.jugador
      if (key == null || key === '') continue
      let a = jugMap.get(key)
      if (!a) { a = { id: r.jugador_id, nombre: r.jugador, goles: 0, pj: 0, dobletes: 0, tripletes: 0, pokers: 0, cincoplus: 0, rojas: 0, amarillas: 0, local: 0, visitante: 0 }; jugMap.set(key, a) }
      const g = r.goles ?? 0
      a.pj++; a.goles += g; a.amarillas += r.amarillas ?? 0; a.rojas += r.rojas ?? 0
      if (g === 2) a.dobletes++; else if (g === 3) a.tripletes++; else if (g === 4) a.pokers++; else if (g >= 5) a.cincoplus++
      if (gecLocal) a.local++; else a.visitante++
    }
    const dt = p.dtGimnasia?.trim()
    if (dt) {
      let d = dtMap.get(dt)
      if (!d) { d = { nombre: dt, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, local: 0, visitante: 0 }; dtMap.set(dt, d) }
      d.pj++; d.gf += p.gecGF; d.gc += p.gecGC
      if (p.gecGF > p.gecGC) d.pg++; else if (p.gecGF === p.gecGC) d.pe++; else d.pp++
      if (gecLocal) d.local++; else d.visitante++
    }
  }

  // Ranking de equipos (récords del club) — usa todos los publicados, filtra dentro
  const eqRows = tab === 'eq'
    ? computeEquipos(data.partidos.filter(p => p.publicado), metrica, fTemporada, fTorneo, topN)
    : []

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-4 py-4 space-y-3 max-w-3xl">
        <SecBanner title="Rankings" subtitle="Jugadores y cuerpo técnico en la historia del club"
          icon={<><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>} />

        {/* Card: toggle + configuración (estructura del original) */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
          {/* Toggle Jugadores / DT */}
          <div className="flex gap-2 p-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <Link href="/rankings?tab=jug" className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${tab === 'jug' ? 'bg-[#1a2e4a] text-white border-[#1a2e4a]' : 'bg-white text-gray-500 border-gray-200'}`}>Jugadores</Link>
            <Link href="/rankings?tab=dt" className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${tab === 'dt' ? 'bg-[#1a2e4a] text-white border-[#1a2e4a]' : 'bg-white text-gray-500 border-gray-200'}`}>Directores Técnicos</Link>
            <Link href="/rankings?tab=eq" className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${tab === 'eq' ? 'bg-[#1a2e4a] text-white border-[#1a2e4a]' : 'bg-white text-gray-500 border-gray-200'}`}>Equipos</Link>
          </div>

          {/* Form de configuración */}
          <form method="GET" action="/rankings" className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="hidden" name="tab" value={tab} />
          <Field label="Ranking por">
            <select name="metrica" defaultValue={metrica} className={`${inputCls} w-full`}>
              {(tab === 'dt' ? METRICAS_DT : tab === 'eq' ? METRICAS_EQ : METRICAS_JUG).map(m => <option key={m.v} value={m.v}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Mostrar top">
            <select name="topN" defaultValue={String(topN)} className={`${inputCls} w-full`}>
              {[5, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Temporada">
            <select name="temporada" defaultValue={fTemporada} className={`${inputCls} w-full`}>
              <option value="">Todas</option>
              {temporadas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Torneo">
            <select name="torneo" defaultValue={fTorneo} className={`${inputCls} w-full`}>
              <option value="">Todos</option>
              {torneos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          {tab !== 'eq' && (
            <Field label="Condición">
              <select name="cond" defaultValue={fCond} className={`${inputCls} w-full`}>
                <option value="">Local y visitante</option>
                <option value="local">Solo local</option>
                <option value="visitante">Solo visitante</option>
              </select>
            </Field>
          )}
          <div className="flex items-end">
            <button type="submit" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors w-full sm:w-auto">Aplicar</button>
          </div>
          </form>
        </div>

        {/* Resultados */}
        {tab === 'jug' && <RankingJugadores jugMap={jugMap} metrica={metrica} topN={topN} jugadores={data.jugadores} />}
        {tab === 'dt' && <RankingDTs dtMap={dtMap} metrica={metrica} topN={topN} dts={data.dts} />}
        {tab === 'eq' && <RankingEquipos rows={eqRows} label={METRICAS_EQ.find(m => m.v === metrica)?.label ?? ''} />}
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function RankingEquipos({ rows, label }: { rows: EqRow[]; label: string }) {
  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span></div>
      {rows.length === 0 ? <div className="py-8 text-center text-gray-400 text-sm">Sin datos para esos filtros</div> : (
        <div className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-6 text-center text-sm font-black shrink-0">{medal(i)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{r.titulo}</p>
                <p className="text-xs text-gray-400 truncate">{r.sub}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-black text-[#1e3a5f] tabular-nums leading-none">{r.valor}</p>
                <p className="text-[0.62rem] text-gray-400 mt-0.5">{r.valorLabel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RankingJugadores({ jugMap, metrica, topN, jugadores }: { jugMap: Map<string | number, JugAcc>; metrica: string; topN: number; jugadores: { id: number; foto: string | null }[] }) {
  const fotoById = new Map(jugadores.map(j => [j.id, j.foto]))
  const field = metrica as keyof JugAcc
  const lista = Array.from(jugMap.values())
    .filter(a => (a[field] as number) > 0)
    .sort((x, y) => (y[field] as number) - (x[field] as number))
    .slice(0, topN)
  const label = METRICAS_JUG.find(m => m.v === metrica)?.label ?? ''
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span></div>
      {lista.length === 0 ? <div className="py-8 text-center text-gray-400 text-sm">Sin datos para esos filtros</div> : (
        <div className="divide-y divide-gray-50">
          {lista.map((a, i) => {
            const foto = a.id ? fotoUrl(fotoById.get(a.id) ?? null) : null
            const medal = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'
            const inner = (
              <>
                <span className={`text-sm font-black w-6 text-center shrink-0 ${medal}`}>{i + 1}</span>
                <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#1a2e4a] flex items-center justify-center text-white text-xs font-bold">
                  {foto ? <img src={foto} alt="" className="w-full h-full object-cover object-top" /> : (a.nombre[0] ?? '?')}{/* eslint-disable-line @next/next/no-img-element */}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{a.nombre}</p></div>
                <span className="text-xl font-black text-gray-800 tabular-nums shrink-0">{a[field] as number}</span>
              </>
            )
            return a.id
              ? <Link key={a.id} href={`/jugador/${a.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors">{inner}</Link>
              : <div key={a.nombre + i} className="flex items-center gap-3 px-4 py-2.5">{inner}</div>
          })}
        </div>
      )}
    </div>
  )
}

function RankingDTs({ dtMap, metrica, topN, dts }: { dtMap: Map<string, DTAcc>; metrica: string; topN: number; dts: { id: number; nombre: string }[] }) {
  const idByNombre = new Map(dts.map(d => [d.nombre.toLowerCase(), d.id]))
  const meta = METRICAS_DT.find(m => m.v === metrica) ?? METRICAS_DT[0]
  const valor = (d: DTAcc): number => meta.v === 'pct' ? (d.pj > 0 ? Math.round((d.pg / d.pj) * 100) : 0) : (d[meta.v as keyof DTAcc] as number)
  let lista = Array.from(dtMap.values())
  if (meta.min) lista = lista.filter(d => d.pj >= meta.min!)
  lista = lista.filter(d => meta.asc ? d.pj > 0 : valor(d) > 0)
    .sort((x, y) => meta.asc ? valor(x) - valor(y) : valor(y) - valor(x))
    .slice(0, topN)
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{meta.label}</span></div>
      {lista.length === 0 ? <div className="py-8 text-center text-gray-400 text-sm">Sin datos para esos filtros</div> : (
        <div className="divide-y divide-gray-50">
          {lista.map((d, i) => {
            const id = idByNombre.get(d.nombre.toLowerCase())
            const medal = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'
            const inner = (
              <>
                <span className={`text-sm font-black w-6 text-center shrink-0 ${medal}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{d.nombre}</p>
                  <p className="text-xs text-gray-400">{d.pj} PJ · {d.pg}G {d.pe}E {d.pp}P</p>
                </div>
                <span className="text-xl font-black text-gray-800 tabular-nums shrink-0">{valor(d)}{meta.v === 'pct' ? '%' : ''}</span>
              </>
            )
            return id
              ? <Link key={d.nombre} href={`/dt/${id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors">{inner}</Link>
              : <div key={d.nombre} className="flex items-center gap-3 px-4 py-2.5">{inner}</div>
          })}
        </div>
      )}
    </div>
  )
}
