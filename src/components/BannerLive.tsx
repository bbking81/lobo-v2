'use client'
import { useEffect, useState } from 'react'

type ProximoType = { rival: string; fecha: string; hora: string; condicion: string; torneo: string; estadio: string; colorRival?: string; jornada?: string; fase?: string; zona?: string }
type LiveData = { enVivo: boolean; terminado: boolean; estado: string | null; minuto: number | null; golesGec: number | null; golesRival: number | null; esLocal: boolean | null; rival: string | null; actualizado: string }

const CELESTE_GEC = '#38bdf8'

function hexRgba(hex: string, a: number): string {
  const h = (hex || '').replace('#', '')
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(f, 16)
  if (Number.isNaN(n) || f.length !== 6) return `rgba(148,163,184,${a})`
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function cuentaRegresiva(fecha: string, hora: string | undefined, ahora: number): string {
  const inicio = new Date(`${fecha}T${(hora && /^\d{1,2}:\d{2}$/.test(hora) ? hora : '00:00')}:00-03:00`)
  const ms = inicio.getTime() - ahora
  if (ms <= 0) return 'Hoy'
  const min = Math.floor(ms / 60000)
  if (min < 60) return `Dentro de ${min} min`
  if (min < 60 * 24) { const h = Math.floor(min / 60); return `Dentro de ${h} hora${h !== 1 ? 's' : ''}` }
  const d = Math.floor(min / (60 * 24))
  return `Dentro de ${d} día${d !== 1 ? 's' : ''}`
}

function BannerEscudo({ url, nombre }: { url: string | null; nombre: string }) {
  return (
    <div className="flex items-center justify-center shrink-0 w-[80px] h-[80px] sm:w-[104px] sm:h-[104px]">
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={nombre} className="w-[72px] h-[72px] sm:w-[96px] sm:h-[96px]" style={{ objectFit: 'contain' }} />
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
  const [now, setNow] = useState(() => Date.now())
  const [live, setLive] = useState<LiveData | null>(null)

  // reloj para la cuenta regresiva (tic cada 30s)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

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
  const colorIzq = esLocal ? CELESTE_GEC : colorRival
  const colorDer = esLocal ? colorRival : CELESTE_GEC
  const fondo = `linear-gradient(100deg, ${hexRgba(colorIzq, 0.22)} 0%, #ffffff 48%, ${hexRgba(colorDer, 0.22)} 100%)`

  const fd = new Date(proximo.fecha + 'T12:00:00')
  const diaSemana = fd.toLocaleDateString('es-AR', { weekday: 'long' })
  const mes = fd.toLocaleDateString('es-AR', { month: 'long' })
  const fecha = `${diaSemana}, ${fd.getDate()}º ${mes}`
  const lineaInfo = [fecha, proximo.hora, proximo.estadio].filter(Boolean).join('  |  ')
  const tituloTorneo = `${proximo.torneo.trim()}${proximo.jornada ? ` - ${proximo.jornada}` : ''}`
  const subLinea = [proximo.fase, proximo.zona].filter(Boolean).join(' · ')

  const mostrarMarcador = !!live && (live.enVivo || live.terminado)
  // GEC va a la izquierda si es local; ubicar goles según el lado del escudo
  const golesIzq = esLocal ? live?.golesGec : live?.golesRival
  const golesDer = esLocal ? live?.golesRival : live?.golesGec

  return (
    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden px-4 sm:px-6 py-4" style={{ background: fondo }}>
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
            <span className="inline-block uppercase font-bold text-white text-center leading-tight" style={{ background: '#1e3a5f', fontSize: '0.72rem', letterSpacing: '0.04em', padding: '7px 14px', borderRadius: 8 }}>
              {cuentaRegresiva(proximo.fecha, proximo.hora, now)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <BannerEscudo url={der.url} nombre={der.nombre} />
          <span className="font-bold text-[#1e293b] truncate text-[1.05rem] sm:text-[1.3rem]">{der.nombre}</span>
        </div>
      </div>
      <div className="text-center mt-3 font-semibold text-[#1e293b]" style={{ fontSize: '0.92rem' }}>
        {lineaInfo}
      </div>
    </div>
  )
}
