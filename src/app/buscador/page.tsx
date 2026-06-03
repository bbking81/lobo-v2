import { getApiData } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import Link from 'next/link'
import type { Partido } from '@/types'

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

const inputCls = 'bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-3 py-[9px] text-[0.875rem] text-[#1e293b] outline-none'

const esGecLocal = (p: Partido) => (p.local || '').toLowerCase().includes('gimnasia')

function matchOp(val: number, op: string | undefined, target: number): boolean {
  if (op === 'exacto' || op === 'exacta') return val === target
  if (op === 'al-menos') return val >= target
  if (op === 'no-mas') return val <= target
  return true
}

export default async function BuscadorPage({ searchParams }: Props) {
  const sp = await searchParams
  const data = await getApiData()
  const partidos = data.partidos.filter(p => p.publicado)

  // ── Opciones para los selects (desde los propios partidos) ──
  const sortUniq = (arr: (string | undefined | null)[]) =>
    [...new Set(arr.filter((x): x is string => !!x && x.trim() !== ''))].sort((a, b) => a.localeCompare(b))

  const rivales = sortUniq(partidos.map(p => (esGecLocal(p) ? p.visitante : p.local)))
  const torneos = sortUniq(partidos.map(p => p.torneo))
  const estadios = sortUniq(partidos.map(p => p.estadio))
  const jugadores = sortUniq(partidos.flatMap(p => (p.planillaGec ?? []).map(r => r.jugador)))
  const jugadoresRivales = sortUniq(partidos.flatMap(p => (p.planillaRival ?? []).map(r => r.jugador)))
  const dtsGec = sortUniq(partidos.map(p => p.dtGimnasia))
  const dtsRival = sortUniq(partidos.map(p => p.dtRival))

  // ── Valores de los filtros ──
  const gfVal = parseInt(sp.gfVal ?? '0') || 0
  const gfOp = sp.gfOp ?? 'exacto'
  const gcVal = parseInt(sp.gcVal ?? '0') || 0
  const gcOp = sp.gcOp ?? 'exacto'
  const difVal = parseInt(sp.difVal ?? '0') || 0
  const difOp = sp.difOp ?? 'exacta'
  const difDir = sp.difDir ?? 'favor'
  const rival = sp.rival ?? ''
  const desde = sp.desde ?? ''
  const hasta = sp.hasta ?? ''
  const torneo = sp.torneo ?? ''
  const estadio = sp.estadio ?? ''
  const cond = sp.cond ?? ''
  const jugador = sp.jugador ?? ''
  const jugRival = sp.jugRival ?? ''
  const dtGec = sp.dtGec ?? ''
  const dtRival = sp.dtRival ?? ''
  const buscar = sp.buscar === '1'

  const filterGF = !(gfVal === 0 && gfOp === 'exacto')
  const filterGC = !(gcVal === 0 && gcOp === 'exacto')
  const filterDif = !(difVal === 0 && difOp === 'exacta')

  // ── Filtrado (clonado de advSearch del original) ──
  const resultados = !buscar ? [] : partidos.filter(p => {
    const gecLocal = esGecLocal(p)
    const gecGF = gecLocal ? p.gl : p.gv
    const gecGC = gecLocal ? p.gv : p.gl
    const dif = gecGF - gecGC

    if (filterGF && !matchOp(gecGF, gfOp, gfVal)) return false
    if (filterGC && !matchOp(gecGC, gcOp, gcVal)) return false
    if (filterDif) {
      const difCheck = difDir === 'favor' ? dif : difDir === 'contra' ? -dif : Math.abs(dif)
      if (!matchOp(difCheck, difOp, difVal)) return false
    }
    if (rival) { const opp = gecLocal ? p.visitante : p.local; if (opp !== rival) return false }
    if (desde && p.fecha && p.fecha < desde) return false
    if (hasta && p.fecha && p.fecha > hasta) return false
    if (torneo && p.torneo !== torneo) return false
    if (estadio && p.estadio !== estadio) return false
    if (cond === 'local' && !gecLocal) return false
    if (cond === 'visitante' && gecLocal) return false
    if (jugador && !(p.planillaGec ?? []).some(r => (r.jugador || '').toLowerCase() === jugador.toLowerCase())) return false
    if (jugRival && !(p.planillaRival ?? []).some(r => (r.jugador || '').toLowerCase() === jugRival.toLowerCase())) return false
    if (dtGec && (p.dtGimnasia || '').toLowerCase() !== dtGec.toLowerCase()) return false
    if (dtRival && (p.dtRival || '').toLowerCase() !== dtRival.toLowerCase()) return false
    return true
  }).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5">
        <SecBanner
          title="Buscador Avanzado"
          subtitle="Partidos en los que Gimnasia y Esgrima:"
          icon={<><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>}
        />

        {/* Formulario (GET → filtros en la URL) */}
        <form method="GET" action="/buscador" className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden" style={{ padding: '24px 28px' }}>
          <input type="hidden" name="buscar" value="1" />

          <Row label="Metió:">
            <input type="number" name="gfVal" defaultValue={sp.gfVal ?? '0'} min={0} className={inputCls} style={{ width: 100 }} />
            <SelectOp name="gfOp" value={gfOp} variant="goles" />
            <span className="text-[0.82rem] text-[#64748b]">goles</span>
          </Row>

          <Row label="Y recibió:">
            <input type="number" name="gcVal" defaultValue={sp.gcVal ?? '0'} min={0} className={inputCls} style={{ width: 100 }} />
            <SelectOp name="gcOp" value={gcOp} variant="goles" />
            <span className="text-[0.82rem] text-[#64748b]">goles</span>
          </Row>

          <Row label="Con una diferencia:">
            <SelectOp name="difOp" value={difOp} variant="dif" />
            <select name="difDir" defaultValue={difDir} className={inputCls}>
              <option value="favor">A favor</option>
              <option value="contra">En contra</option>
              <option value="cualquiera">Cualquiera</option>
            </select>
            <input type="number" name="difVal" defaultValue={sp.difVal ?? '0'} min={0} className={inputCls} style={{ width: 100 }} />
            <span className="text-[0.82rem] text-[#64748b]">goles</span>
          </Row>

          <Row label="Enfrentándose a:">
            <SelectList name="rival" value={rival} placeholder="Cualquier rival" options={rivales} wide />
          </Row>

          <Row label="En el período:">
            <input type="date" name="desde" defaultValue={desde} className={inputCls} style={{ width: 160 }} />
            <span className="text-[0.82rem] text-[#64748b]">a</span>
            <input type="date" name="hasta" defaultValue={hasta} className={inputCls} style={{ width: 160 }} />
          </Row>

          <Row label="Tipo de Torneo:">
            <SelectList name="torneo" value={torneo} placeholder="Todos" options={torneos} wide />
          </Row>

          <Row label="En el estadio:">
            <SelectList name="estadio" value={estadio} placeholder="Cualquiera" options={estadios} wide />
          </Row>

          <Row label="En condición:">
            <select name="cond" defaultValue={cond} className={inputCls} style={{ minWidth: 220 }}>
              <option value="">Todas</option>
              <option value="local">Local</option>
              <option value="visitante">Visitante</option>
            </select>
          </Row>

          <Row label="Con el jugador GyE:">
            <SelectList name="jugador" value={jugador} placeholder="Cualquiera" options={jugadores} wide />
          </Row>

          <Row label="Vs. jugador rival:">
            <SelectList name="jugRival" value={jugRival} placeholder="Cualquiera" options={jugadoresRivales} wide />
          </Row>

          <Row label="DT de GyE:">
            <SelectList name="dtGec" value={dtGec} placeholder="Cualquiera" options={dtsGec} wide />
          </Row>

          <Row label="DT rival:" last>
            <SelectList name="dtRival" value={dtRival} placeholder="Cualquiera" options={dtsRival} wide />
          </Row>

          <div className="mt-4">
            <button type="submit"
              className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-5 py-2.5 text-[0.875rem] font-semibold transition-colors">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              Buscar
            </button>
          </div>
        </form>

        {/* Resultados */}
        {buscar && (
          <div className="mt-6">
            <p className="text-[0.85rem] text-[#64748b] mb-2.5">
              {resultados.length} partido{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
            </p>
            <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden overflow-x-auto">
              <table className="w-full border-collapse text-[0.85rem]">
                <thead className="bg-[#162032] text-white text-[0.7rem] uppercase tracking-[0.06em]">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-bold">Fecha</th>
                    <th className="text-left px-3 py-2.5 font-bold">Local</th>
                    <th className="text-center px-3 py-2.5 font-bold">Resultado</th>
                    <th className="text-left px-3 py-2.5 font-bold">Visitante</th>
                    <th className="text-left px-3 py-2.5 font-bold">Torneo</th>
                    <th className="text-left px-3 py-2.5 font-bold">Estadio</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94a3b8]">Sin resultados para esos filtros</td></tr>
                  ) : (
                    resultados.map(p => {
                      const fechaFmt = p.fecha
                        ? new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '—'
                      return (
                        <tr key={p.id} className="border-b border-[#f1f5f9] hover:bg-[rgba(37,99,235,0.07)] transition-colors">
                          <td className="px-3 py-2.5 whitespace-nowrap text-[#475569]">
                            <Link href={`/partido/partido-${p.id}`} className="block">{fechaFmt}</Link>
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-[#1e293b]"><Link href={`/partido/partido-${p.id}`} className="block">{p.local}</Link></td>
                          <td className="px-3 py-2.5 text-center font-bold text-[#1e293b] whitespace-nowrap"><Link href={`/partido/partido-${p.id}`} className="block">{p.gl} – {p.gv}</Link></td>
                          <td className="px-3 py-2.5 text-[#1e293b]"><Link href={`/partido/partido-${p.id}`} className="block">{p.visitante}</Link></td>
                          <td className="px-3 py-2.5"><span className="bg-[#dbeafe] text-[#2563eb] text-[0.72rem] font-semibold px-2 py-0.5 rounded">{p.torneo || '—'}</span></td>
                          <td className="px-3 py-2.5 text-[#475569]">{p.estadio || '—'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center gap-4 flex-wrap py-3.5 ${last ? '' : 'border-b border-[#e2e8f0]'}`}>
      <label className="text-[0.85rem] text-[#64748b] shrink-0" style={{ minWidth: 160 }}>{label}</label>
      <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">{children}</div>
    </div>
  )
}

function SelectOp({ name, value, variant }: { name: string; value: string; variant: 'goles' | 'dif' }) {
  const opts = variant === 'goles'
    ? [['exacto', 'Exactamente'], ['al-menos', 'Al menos'], ['no-mas', 'No más de']]
    : [['exacta', 'Exacta de'], ['al-menos', 'Al menos'], ['no-mas', 'No más de']]
  return (
    <select name={name} defaultValue={value} className={inputCls}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function SelectList({ name, value, placeholder, options, wide }: { name: string; value: string; placeholder: string; options: string[]; wide?: boolean }) {
  return (
    <select name={name} defaultValue={value} className={inputCls} style={wide ? { minWidth: 220, maxWidth: '100%' } : undefined}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
