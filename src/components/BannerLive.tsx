'use client'
import { useEffect, useState, type SyntheticEvent } from 'react'

type ProximoType = { rival: string; fecha: string; hora: string; condicion: string; torneo: string; estadio: string; colorRival?: string; colorRival2?: string; jornada?: string; fase?: string; zona?: string }
type LiveData = { enVivo: boolean; terminado: boolean; estado: string | null; minuto: number | null; golesGec: number | null; golesRival: number | null; esLocal: boolean | null; rival: string | null; actualizado: string }

const CELESTE_GEC = '#38bdf8'

function hexRgba(hex: string, a: number): string {
  const h = (hex || '').replace('#', '')
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(f, 16)
  if (Number.isNaN(n) || f.length !== 6) return `rgba(148,163,184,${a})`
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Cuenta regresiva en vivo estilo marcador (HH:MM:SS, con prefijo "Nd" si faltan
 * días). Subcomponente propio para que el tic de 1s solo re-renderice el número. */
function CuentaRegresiva({ fecha, hora }: { fecha: string; hora?: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const inicio = new Date(`${fecha}T${(hora && /^\d{1,2}:\d{2}$/.test(hora) ? hora : '00:00')}:00-03:00`)
  const ms = inicio.getTime() - now
  if (ms <= 0) return <span className="uppercase font-bold text-[#1e3a5f]" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>¡Hoy!</span>
  const tot = Math.floor(ms / 1000)
  const d = Math.floor(tot / 86400)
  const h = Math.floor((tot % 86400) / 3600)
  const m = Math.floor((tot % 3600) / 60)
  const s = tot % 60
  const z = (n: number) => String(n).padStart(2, '0')
  const Celda = ({ val, lbl }: { val: number; lbl: string }) => (
    <div className="text-center">
      <div className="bg-white border border-[#e2e8f0] rounded-lg tabular-nums font-medium text-[#1e3a5f] leading-none px-2 py-1.5 text-[1.3rem] sm:text-[1.6rem]">{z(val)}</div>
      <div className="text-[0.55rem] sm:text-[0.6rem] text-[#64748b] mt-1 tracking-wide">{lbl}</div>
    </div>
  )
  const Sep = () => <div className="text-[#4178a0] text-[1.3rem] sm:text-[1.6rem] font-medium pb-4 sm:pb-5">:</div>
  return (
    <div className="inline-flex items-end gap-1.5 sm:gap-2">
      {d > 0 && <><Celda val={d} lbl="DÍAS" /><Sep /></>}
      <Celda val={h} lbl="HS" /><Sep />
      <Celda val={m} lbl="MIN" /><Sep />
      <Celda val={s} lbl="SEG" />
    </div>
  )
}

function BannerEscudo({ url, nombre }: { url: string | null; nombre: string }) {
  // Autorregulador: distintos escudos tienen formas distintas (uno vertical, otro
  // casi cuadrado). object-fit:contain los iguala por altura, pero el cuadrado
  // "pesa" más. Medimos la proporción al cargar y normalizamos el área visual
  // para que todos ocupen un tamaño parejo dentro de la caja.
  const [scale, setScale] = useState(1)
  const medir = (img: HTMLImageElement | null) => {
    if (!img || !img.naturalWidth || !img.naturalHeight) return
    const ar = img.naturalWidth / img.naturalHeight
    // tamaño dentro de la caja (lado mayor = 1)
    const w = ar >= 1 ? 1 : ar
    const h = ar >= 1 ? 1 / ar : 1
    const geom = Math.sqrt(w * h)        // "diámetro" visual
    const target = 0.86                   // área visual objetivo
    setScale(Math.max(0.75, Math.min(1.18, target / geom)))
  }
  // Callback ref: si la imagen ya está cacheada (complete) al montar, onLoad NO
  // dispara en React → medimos acá. onLoad cubre las que cargan después.
  const refMedir = (img: HTMLImageElement | null) => { if (img && img.complete) medir(img) }
  return (
    <div className="flex items-center justify-center shrink-0 w-[80px] h-[80px] sm:w-[104px] sm:h-[104px]">
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={nombre} ref={refMedir} onLoad={(e: SyntheticEvent<HTMLImageElement>) => medir(e.currentTarget)} className="w-[72px] h-[72px] sm:w-[96px] sm:h-[96px]" style={{ objectFit: 'contain', transform: `scale(${scale})`, transition: 'transform 0.15s ease' }} />
        : <span className="text-[2.6rem] sm:text-[3.2rem]">⚽</span>}
    </div>
  )
}

/** Etiqueta del estado del partido para el pill en vivo. */
function rotuloEstado(estado: string | null, minuto: number | null): string {
  if (estado === 'HT') return 'Entretiempo'
  if (estado === 'FT' || estado === 'AET' || estado === 'PEN') return 'Final'
  if (minuto != null) return `${minuto}'`
  return 'En juego'
}

export default function BannerLive({ proximo, escudoRival }: { proximo: ProximoType; escudoRival: string | null }) {
  const [live, setLive] = useState<LiveData | null>(null)

  // polling del marcador en vivo cada 20s
  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        const r = await fetch('/api/live', { cache: 'no-store' })
        if (!r.ok) return
        const d: LiveData = await r.json()
        if (activo) setLive(d)
      } catch { /* sin conexión: se queda con la cuenta regresiva */ }
    }
    cargar()
    const t = setInterval(cargar, 20000)
    return () => { activo = false; clearInterval(t) }
  }, [])

  // Orden local-izq / visitante-der: durante el vivo manda la API (verdad del fixture);
  // antes del partido, lo que esté cargado en el admin (campo "Condición").
  const esLocalAdmin = (proximo.condicion || '').toLowerCase().startsWith('local')
  const esLocal = (live && live.esLocal != null) ? live.esLocal : esLocalAdmin
  const izq = esLocal
    ? { url: '/api/escudo-gec', nombre: 'Gimnasia y Esgrima' }
    : { url: escudoRival, nombre: proximo.rival }
  const der = esLocal
    ? { url: escudoRival, nombre: proximo.rival }
    : { url: '/api/escudo-gec', nombre: 'Gimnasia y Esgrima' }

  const colorRival = proximo.colorRival || '#dc2626'
  const colorRival2 = proximo.colorRival2 && proximo.colorRival2 !== colorRival ? proximo.colorRival2 : null
  const A = 0.22
  let fondo: string
  if (colorRival2) {
    // lado rival con dos tonos (rayas/franjas); Gimnasia mantiene su celeste
    const rivalStops = esLocal
      ? `${hexRgba(colorRival, A)} 76%, ${hexRgba(colorRival2, A)} 100%`
      : `${hexRgba(colorRival2, A)} 0%, ${hexRgba(colorRival, A)} 24%`
    fondo = esLocal
      ? `linear-gradient(100deg, ${hexRgba(CELESTE_GEC, A)} 0%, #ffffff 48%, ${rivalStops})`
      : `linear-gradient(100deg, ${rivalStops}, #ffffff 52%, ${hexRgba(CELESTE_GEC, A)} 100%)`
  } else {
    const colorIzq = esLocal ? CELESTE_GEC : colorRival
    const colorDer = esLocal ? colorRival : CELESTE_GEC
    fondo = `linear-gradient(100deg, ${hexRgba(colorIzq, A)} 0%, #ffffff 48%, ${hexRgba(colorDer, A)} 100%)`
  }

  const fd = new Date(proximo.fecha + 'T12:00:00')
  const fecha = `${String(fd.getDate()).padStart(2, '0')}/${String(fd.getMonth() + 1).padStart(2, '0')}/${fd.getFullYear()}`
  const tituloTorneo = `${proximo.torneo.trim()}${proximo.jornada ? ` - ${proximo.jornada}` : ''}`
  const subLinea = [proximo.fase, proximo.zona].filter(Boolean).join(' · ')

  const mostrarMarcador = !!live && (live.enVivo || live.terminado)
  // GEC va a la izquierda si es local; ubicar goles según el lado del escudo
  const golesIzq = esLocal ? live?.golesGec : live?.golesRival
  const golesDer = esLocal ? live?.golesRival : live?.golesGec

  return (
    <div className="relative border border-[#e2e8f0] rounded-xl overflow-hidden px-4 sm:px-6 py-4" style={{ background: fondo }}>
      {!mostrarMarcador && (
        <span className="absolute top-0 right-0 uppercase font-medium text-white" style={{ background: '#1e3a5f', fontSize: '0.6rem', letterSpacing: '0.06em', padding: '5px 14px', borderRadius: '0 12px 0 10px' }}>
          Próximo partido
        </span>
      )}
      <div className="text-center uppercase font-bold mb-1 text-[#1e293b] text-[0.85rem] sm:text-[0.98rem]" style={{ letterSpacing: '0.04em' }}>
        {tituloTorneo}
      </div>
      {subLinea && (
        <div className="text-center mb-3 text-[#475569] font-medium" style={{ fontSize: '0.75rem' }}>
          {subLinea}
        </div>
      )}
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <span className="font-bold text-[#1e293b] text-right truncate text-[1.05rem] sm:text-[1.3rem]">{izq.nombre}</span>
          <BannerEscudo url={izq.url} nombre={izq.nombre} />
        </div>

        <div className="shrink-0 flex flex-col items-center justify-center min-w-[100px] sm:min-w-[130px] gap-1.5">
          {mostrarMarcador ? (
            <>
              <div className="flex items-center gap-2 tabular-nums font-black text-[#1e293b] leading-none" style={{ fontSize: '2.4rem' }}>
                <span>{golesIzq ?? 0}</span>
                <span className="text-[#94a3b8] font-bold" style={{ fontSize: '1.6rem' }}>-</span>
                <span>{golesDer ?? 0}</span>
              </div>
              {live!.enVivo ? (
                <span className="inline-flex items-center gap-1.5 uppercase font-bold text-white" style={{ background: '#dc2626', fontSize: '0.62rem', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 20 }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  EN VIVO · {rotuloEstado(live!.estado, live!.minuto)}
                </span>
              ) : (
                <span className="inline-block uppercase font-bold text-white" style={{ background: '#1e293b', fontSize: '0.62rem', letterSpacing: '0.06em', padding: '4px 12px', borderRadius: 20 }}>
                  Final
                </span>
              )}
            </>
          ) : (
            <CuentaRegresiva fecha={proximo.fecha} hora={proximo.hora} />
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <BannerEscudo url={der.url} nombre={der.nombre} />
          <span className="font-bold text-[#1e293b] truncate text-[1.05rem] sm:text-[1.3rem]">{der.nombre}</span>
        </div>
      </div>
      <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 mt-3 font-semibold text-[#1e293b]" style={{ fontSize: '0.92rem' }}>
        <span className="inline-flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          {fecha}
        </span>
        {proximo.hora && <>
          <span aria-hidden="true" className="opacity-30">|</span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>
            {proximo.hora}
          </span>
        </>}
        {proximo.estadio && <>
          <span aria-hidden="true" className="opacity-30">|</span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="12" y1="4" x2="12" y2="20" /><circle cx="12" cy="12" r="2.6" /><path d="M2 8h3.5v8H2" /><path d="M22 8h-3.5v8h3.5" /></svg>
            {proximo.estadio}
          </span>
        </>}
      </div>
    </div>
  )
}
