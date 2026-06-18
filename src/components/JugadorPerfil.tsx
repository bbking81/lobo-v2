'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { norm } from '@/lib/norm'

export interface PartidoRow {
  id: number
  fecha: string
  fechaFmt: string
  torneo: string
  año: string
  rival: string
  score: string
  resultado: 'V' | 'E' | 'D'
  esLocal: boolean
  titular: boolean
  goles: number
  amarillas: number
  rojas: number
}

export interface ConxItem {
  nombre: string
  n: number
  jugadorId?: number
}

interface Props {
  partidos: PartidoRow[]
  companeros: ConxItem[]
  rivales: ConxItem[]
  dts: ConxItem[]
  fotos: { src: string; leyenda?: string }[]
}

const SELECT_CLS =
  'w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] py-[7px] pl-2.5 pr-7 text-[0.85rem] text-[#1e293b] outline-none appearance-none cursor-pointer bg-no-repeat'
const SELECT_BG = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundPosition: 'right 8px center',
}

export default function JugadorPerfil({ partidos, companeros, rivales, dts, fotos }: Props) {
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [conxOpen, setConxOpen] = useState(false)
  const [galeriaOpen, setGaleriaOpen] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const [res, setRes] = useState('')
  const [cond, setCond] = useState('')
  const [torneo, setTorneo] = useState('')
  const [anio, setAnio] = useState('')
  const [rival, setRival] = useState('')
  const [gol, setGol] = useState('')
  const [titular, setTitular] = useState('')
  const [expulsado, setExpulsado] = useState('')

  const torneos = useMemo(
    () => [...new Set(partidos.map(p => p.torneo).filter(Boolean))].sort(),
    [partidos]
  )
  const anios = useMemo(
    () => [...new Set(partidos.map(p => p.año).filter(Boolean))].sort().reverse(),
    [partidos]
  )
  const rivalesOpts = useMemo(
    () => [...new Set(partidos.map(p => p.rival).filter(Boolean))].sort(),
    [partidos]
  )

  const filtrados = useMemo(() => {
    return partidos.filter(p => {
      if (res && p.resultado !== res) return false
      if (cond === 'local' && !p.esLocal) return false
      if (cond === 'visitante' && p.esLocal) return false
      if (torneo && p.torneo !== torneo) return false
      if (anio && p.año !== anio) return false
      if (rival && p.rival !== rival) return false
      if (gol === 'si' && p.goles <= 0) return false
      if (gol === 'no' && p.goles > 0) return false
      if (titular === 'si' && !p.titular) return false
      if (titular === 'no' && p.titular) return false
      if (expulsado === 'si' && p.rojas <= 0) return false
      if (expulsado === 'no' && p.rojas > 0) return false
      return true
    })
  }, [partidos, res, cond, torneo, anio, rival, gol, titular, expulsado])

  return (
    <>
      {/* ── FILTROS (colapsable) ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
        <div
          onClick={() => setFiltrosOpen(o => !o)}
          className="flex items-center justify-between px-[18px] py-3.5 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="2.2" fill="#dc2626" stroke="none" /><circle cx="16" cy="12" r="2.2" fill="#dc2626" stroke="none" /><circle cx="10" cy="18" r="2.2" fill="#dc2626" stroke="none" />
            </svg>
            <span className="font-bold text-[0.95rem] text-[#1e293b]">Filtros</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-[#94a3b8] transition-transform duration-200" style={{ transform: filtrosOpen ? 'rotate(180deg)' : '' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        {filtrosOpen && (
          <div className="flex flex-col gap-2.5 border-t border-[#e2e8f0] px-4 py-3.5">
            <Filtro label="Resultado" value={res} onChange={setRes}
              options={[['', 'Todos'], ['V', 'Ganados'], ['E', 'Empatados'], ['D', 'Perdidos']]} />
            <Filtro label="Condición" value={cond} onChange={setCond}
              options={[['', 'Todos'], ['local', 'Local'], ['visitante', 'Visitante']]} />
            <Filtro label="Torneo" value={torneo} onChange={setTorneo}
              options={[['', 'Todos'], ...torneos.map(t => [t, t] as [string, string])]} />
            <Filtro label="Año" value={anio} onChange={setAnio}
              options={[['', 'Todos'], ...anios.map(a => [a, a] as [string, string])]} />
            <Filtro label="Rival" value={rival} onChange={setRival}
              options={[['', 'Todos'], ...rivalesOpts.map(r => [r, r] as [string, string])]} />
            <Filtro label="Convirtió gol" value={gol} onChange={setGol}
              options={[['', 'Indistinto'], ['si', 'Sí'], ['no', 'No']]} />
            <Filtro label="Titular" value={titular} onChange={setTitular}
              options={[['', 'Indistinto'], ['si', 'Sí'], ['no', 'No']]} />
            <Filtro label="Expulsado" value={expulsado} onChange={setExpulsado}
              options={[['', 'Indistinto'], ['si', 'Sí'], ['no', 'No']]} />
          </div>
        )}
      </div>

      {/* ── LISTA DE PARTIDOS ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
        <div className="flex items-center gap-2 px-[18px] py-3.5 bg-[#f1f5f9] border-b border-[#e2e8f0]">
          <span className="text-[1.1rem]">⚽</span>
          <span className="text-[0.95rem] font-bold text-[#1e293b]">
            {filtrados.length} Partido{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div>
          {filtrados.length === 0 ? (
            <div className="py-8 text-center text-[#94a3b8]">Sin partidos con esos filtros</div>
          ) : (
            filtrados.map(p => <PartidoRowItem key={p.id} p={p} />)
          )}
        </div>
      </div>

      {/* ── CONEXIONES (colapsable) ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
        <div
          onClick={() => setConxOpen(o => !o)}
          className="flex items-center justify-between px-[18px] py-3.5 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">🔗</span>
            <span className="font-bold text-[0.95rem] text-[#1e293b]">Conexiones</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-[#94a3b8] transition-transform duration-200" style={{ transform: conxOpen ? 'rotate(180deg)' : '' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        {conxOpen && (
          <div className="flex flex-col gap-[18px] border-t border-[#e2e8f0] px-5 py-[18px]">
            <ConxBloque titulo={`👥 Compañeros de plantel (${companeros.length})`} items={companeros} />
            <ConxBloque titulo={`⚔️ Rivales enfrentados (${rivales.length})`} items={rivales} />
            <ConxBloque titulo={`🎽 DTs que lo dirigieron (${dts.length})`} items={dts} />
          </div>
        )}
      </div>

      {/* ── GALERÍA (colapsable) ── */}
      {fotos.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
          <div
            onClick={() => setGaleriaOpen(o => !o)}
            className="flex items-center justify-between px-[18px] py-3.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📷</span>
              <span className="font-bold text-[0.95rem] text-[#1e293b]">Galería</span>
              <span className="text-[0.72rem] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-[10px] font-semibold">
                {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-[#94a3b8] transition-transform duration-200" style={{ transform: galeriaOpen ? 'rotate(180deg)' : '' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {galeriaOpen && (
            <div className="border-t border-[#e2e8f0] p-4">
              <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {fotos.map((f, i) => (
                  <div key={i} onClick={() => setLightbox(i)}
                    className="rounded-[10px] overflow-hidden cursor-zoom-in border border-[#e2e8f0] bg-[#f1f5f9] flex flex-col">
                    <div className="overflow-hidden bg-[#e2e8f0]" style={{ aspectRatio: '4 / 3' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.src} alt={f.leyenda ?? ''} loading="lazy"
                        className="w-full h-full object-cover block" />
                    </div>
                    {f.leyenda && (
                      <div className="px-2.5 py-[7px] text-[0.78rem] text-[#475569] text-center leading-[1.4] bg-white border-t border-[#e2e8f0]">
                        {f.leyenda}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && fotos[lightbox] && (
        <div onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(0,0,0,0.93)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[lightbox].src} alt={fotos[lightbox].leyenda ?? ''}
            className="rounded-[10px] object-contain" style={{ maxWidth: '92vw', maxHeight: '85vh' }} />
          {fotos[lightbox].leyenda && (
            <div className="text-white text-[0.9rem] px-4 py-1.5 rounded-[20px]" style={{ background: 'rgba(0,0,0,0.5)' }}>
              {fotos[lightbox].leyenda}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function Filtro({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="uppercase tracking-[0.06em] text-[0.65rem] text-[#64748b] font-medium">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className={SELECT_CLS} style={SELECT_BG}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function PartidoRowItem({ p }: { p: PartidoRow }) {
  const resBg = p.resultado === 'V' ? '#16a34a' : p.resultado === 'E' ? '#ca8a04' : '#dc2626'
  return (
    <Link href={`/partido/partido-${p.id}`}
      className="flex items-center gap-3 px-6 py-2.5 border-b border-[#f1f5f9] text-[0.85rem] hover:bg-[#f8fafc] transition-colors">
      <span className="text-[#475569] min-w-[72px] shrink-0">{p.fechaFmt}</span>
      <span className="w-[22px] h-[22px] rounded-[5px] text-[0.7rem] font-extrabold flex items-center justify-center shrink-0 text-white"
        style={{ background: resBg }}>{p.resultado}</span>
      <span className="font-bold text-[#1e293b] min-w-[40px] text-center">{p.score}</span>
      <span className="flex-1 text-[#1e293b] font-medium">vs {p.rival}</span>
      <div className="flex gap-1 shrink-0">
        {p.titular && <span className="text-[0.7rem] px-1.5 py-0.5 rounded font-semibold bg-[#f0fdf4] text-[#166534]">T</span>}
        {p.goles > 0 && <span className="text-[0.85rem] tracking-tighter">{'⚽'.repeat(Math.min(p.goles, 5))}</span>}
        {p.amarillas > 0 && <span className="text-[0.7rem] px-1.5 py-0.5 rounded font-semibold bg-[#fef9c3]">🟨</span>}
        {p.rojas > 0 && <span className="text-[0.7rem] px-1.5 py-0.5 rounded font-semibold bg-[#fee2e2]">🟥</span>}
      </div>
      <span className="text-[#475569] text-[0.78rem] text-right hidden sm:block">{p.torneo}</span>
    </Link>
  )
}

function ConxBloque({ titulo, items }: { titulo: string; items: ConxItem[] }) {
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState(false)
  const LIMIT = 5
  const filtered = useMemo(
    () => items.filter(it => !q || norm(it.nombre).includes(norm(q))),
    [items, q]
  )
  const visible = expanded || q ? filtered : filtered.slice(0, LIMIT)
  const extra = filtered.length - LIMIT

  return (
    <div>
      <div className="text-[0.88rem] font-bold text-[#475569] mb-2.5">{titulo}</div>
      {items.length === 0 ? (
        <div className="text-[#94a3b8] text-[0.82rem] py-2">Sin datos</div>
      ) : (
        <>
          <div className="relative mb-2">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)}
              className="w-full box-border py-1.5 pl-7 pr-2.5 border border-[#e2e8f0] rounded-lg text-[0.78rem] text-[#1e293b] bg-[#f8fafc] outline-none" />
          </div>
          <div>
            {visible.map((it, i) => (
              <div key={`${it.nombre}-${i}`}
                className="flex items-center justify-between py-2 border-b border-[#e2e8f0]">
                {it.jugadorId ? (
                  <Link href={`/jugador/${it.jugadorId}`} className="text-[#2563eb] text-[0.88rem] no-underline">{it.nombre}</Link>
                ) : (
                  <span className="text-[#1e293b] text-[0.88rem]">{it.nombre}</span>
                )}
                <span className="text-[0.78rem] font-semibold text-[#64748b] whitespace-nowrap ml-2">
                  {it.n} {it.n === 1 ? 'partido' : 'partidos'}
                </span>
              </div>
            ))}
          </div>
          {!q && extra > 0 && (
            <div className="text-center pt-2 pb-0.5">
              <button onClick={() => setExpanded(e => !e)}
                className="bg-none border border-[#e2e8f0] rounded-[20px] px-4 py-1 text-[0.75rem] font-semibold text-[#64748b] cursor-pointer">
                {expanded ? 'Ver menos ▴' : `Ver ${extra} más ▾`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
