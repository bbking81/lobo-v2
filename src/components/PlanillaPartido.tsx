import Link from 'next/link'
import type { JugadorPlanilla } from '@/types'

interface Props {
  jugadores: JugadorPlanilla[]
  esGec: boolean
  nombreEquipo: string
  escudoUrl: string | null
  dtNombre?: string | null
  dtId?: number
}

const nGolesDe = (r: JugadorPlanilla) =>
  r.goles != null ? r.goles : String(r.minGoles ?? '').trim().split(/\s+/).filter(Boolean).length

export default function PlanillaPartido({ jugadores, esGec, nombreEquipo, escudoUrl, dtNombre, dtId }: Props) {
  const titulares = jugadores.filter(r => r.titular !== false)
  const suplentes = jugadores.filter(r => r.titular === false)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
      {/* Header equipo — estilo pestaña (blanco + subrayado azul de marca) */}
      <div className="flex items-center gap-2.5" style={{ background: '#fff', padding: '14px 16px', borderBottom: '3px solid #007ad6' }}>
        <div className="flex items-center justify-center shrink-0 overflow-hidden" style={{ width: 36, height: 36, borderRadius: 9, background: '#f1f5f9' }}>
          {escudoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={escudoUrl} alt="" loading="lazy" decoding="async" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            : <span className="font-extrabold text-[0.6rem]" style={{ color: '#007ad6' }}>{(nombreEquipo || '?').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}</span>}
        </div>
        <span className="font-bold" style={{ fontSize: '1.035rem', color: '#0f172a' }}>{nombreEquipo}</span>
      </div>

      {jugadores.length === 0 ? (
        <div className="py-4 text-center text-[#94a3b8] text-[0.83rem]">Sin planilla cargada</div>
      ) : (
        <>
          {titulares.length > 0 && <><SectionLabel label="Titulares" titular /><div>{titulares.map((r, i) => <Fila key={i} r={r} esTitular esGec={esGec} />)}</div></>}
          {suplentes.length > 0 && <><SectionLabel label="Suplentes" /><div>{suplentes.map((r, i) => <Fila key={i} r={r} esTitular={false} esGec={esGec} />)}</div></>}
          {dtNombre && (
            <div className="flex items-center gap-2.5" style={{ padding: '10px 16px 10px 13px', background: '#f0fdf4', borderTop: '2px solid #bbf7d0', borderLeft: '4px solid #16a34a' }}>
              <div className="flex items-center justify-center shrink-0 text-white font-extrabold text-[0.7rem]" style={{ width: 26, height: 26, borderRadius: 8, background: '#16a34a' }}>DT</div>
              {esGec && dtId
                ? <Link href={`/dt/${dtId}`} className="flex-1 font-bold text-[#166534] hover:opacity-70" style={{ fontSize: '0.85rem' }}>{dtNombre}</Link>
                : <span className="flex-1 font-bold text-[#166534]" style={{ fontSize: '0.85rem' }}>{dtNombre}</span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SectionLabel({ label, titular }: { label: string; titular?: boolean }) {
  // Titulares = azul de marca · Suplentes = gris sobrio (estilo "opción D")
  const style = titular
    ? { color: '#1d4ed8', background: '#eff6ff', borderBottom: '1px solid #dbeafe' }
    : { color: '#475569', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }
  return (
    <div className="flex items-center gap-1.5 uppercase" style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', ...style }}>
      {titular
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="#007ad6" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4" /><circle cx="19" cy="11" r="3" /><path d="M17 21v-1a3 3 0 0 1 3-3" /></svg>}
      {label}
    </div>
  )
}

function Fila({ r, esTitular, esGec }: { r: JugadorPlanilla; esTitular: boolean; esGec: boolean }) {
  const nGoles = nGolesDe(r)
  const noIngreso = !esTitular && r.titular === false && !r.minE
  const mins = esTitular ? (r.minS ? `${r.minS}'` : "90'") : (r.minE ? `${r.minE}'` : (r.titular === false ? '' : "90'"))
  const numBg = noIngreso ? '#94a3b8' : '#344D83'
  const nameColor = noIngreso ? '#94a3b8' : '#1e293b'
  return (
    <div className="flex items-center gap-2.5" style={{ padding: '8px 16px', borderBottom: '1px solid #e2e8f0', background: noIngreso ? '#fafbfc' : undefined }}>
      <div className="flex items-center justify-center shrink-0 text-white font-extrabold text-[0.7rem]" style={{ width: 26, height: 26, borderRadius: '50%', background: numBg }}>{r.camiseta || '·'}</div>
      <div className="flex-1 text-[0.85rem]" style={{ fontWeight: noIngreso ? 400 : 600, color: nameColor }}>
        {esGec && r.jugador_id
          ? <Link href={`/jugador/${r.jugador_id}`} className="hover:opacity-60">{r.jugador}</Link>
          : <span>{r.jugador}</span>}
        {!noIngreso && nGoles > 0 && <span className="text-[0.75rem] ml-1">{'⚽'.repeat(nGoles)}</span>}
        {!noIngreso && (r.golEnContra ?? 0) > 0 && <span className="ml-1 text-[0.6rem] font-bold px-1 py-0.5 rounded" style={{ background: '#fee2e2', color: '#b91c1c' }} title="Gol en contra">EC</span>}
        {!noIngreso && (r.amarillas ?? 0) > 0 && <span className="text-[0.75rem] ml-1">🟨</span>}
        {!noIngreso && (r.rojas ?? 0) > 0 && <span className="text-[0.75rem] ml-1">🟥</span>}
      </div>
      <div className="shrink-0">
        {noIngreso
          ? <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', border: '1px solid #e2e8f0' }}>No ingresó</span>
          : mins ? <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>⏱ {mins}</span> : null}
      </div>
    </div>
  )
}
