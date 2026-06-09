/* Página temporal para previsualizar conceptos de logo (estilo sitios de stats:
   simple, 1-2 colores, reconocible a 16px). Borrar cuando se elija uno. */

const NAVY = '#1e3a5f'
const NAVY_DARK = '#162032'
const ORANGE = '#e8742c'

// Silueta de cabeza de lobo, angular (front-facing). viewBox 0 0 100 100.
const WOLF = 'M50 20 L34 22 L26 6 L22 30 L28 52 L40 78 L50 86 L60 78 L72 52 L78 30 L74 6 L66 22 Z'
const EYE_L = '34,40 45,44 43,49 33,46'
const EYE_R = '66,40 55,44 57,49 67,46'

/* ── Concepto A: badge navy + lobo blanco + ojos naranjas (estilo app icon) ── */
function LogoA({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" aria-label="Logo A">
      <rect width="100" height="100" rx="24" fill={NAVY} />
      <g transform="translate(11,11) scale(0.78)">
        <path d={WOLF} fill="#fff" />
        <polygon points={EYE_L} fill={ORANGE} />
        <polygon points={EYE_R} fill={ORANGE} />
      </g>
    </svg>
  )
}

/* ── Concepto B: lobo + barras de estadística (la idea "stats" integrada) ── */
function LogoB({ s }: { s: number }) {
  const id = `wolfclip-${s}`
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" aria-label="Logo B">
      <rect width="100" height="100" rx="24" fill="#fff" stroke="#e2e8f0" />
      <clipPath id={id}><path d={WOLF} /></clipPath>
      <g transform="translate(11,11) scale(0.78)">
        <path d={WOLF} fill={NAVY} />
        {/* barras ascendentes naranjas recortadas dentro de la cabeza */}
        <g clipPath={`url(#${id})`}>
          <rect x="30" y="60" width="9" height="30" fill={ORANGE} />
          <rect x="45" y="48" width="9" height="42" fill={ORANGE} />
          <rect x="60" y="36" width="9" height="54" fill={ORANGE} />
        </g>
        <polygon points={EYE_L} fill="#fff" />
        <polygon points={EYE_R} fill="#fff" />
      </g>
    </svg>
  )
}

/* ── Concepto C: lobo de línea (outline), minimalista/moderno ── */
function LogoC({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" aria-label="Logo C">
      <rect width="100" height="100" rx="24" fill={NAVY_DARK} />
      <g transform="translate(11,11) scale(0.78)" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <path d={WOLF} />
        <polyline points="33,44 41,46" stroke={ORANGE} />
        <polyline points="67,44 59,46" stroke={ORANGE} />
      </g>
    </svg>
  )
}

const CONCEPTS = [
  { key: 'A', Comp: LogoA, title: 'A · Badge', desc: 'Navy + lobo blanco + ojos naranja. Estilo app icon (SofaScore/FotMob).' },
  { key: 'B', Comp: LogoB, title: 'B · Lobo + barras', desc: 'La idea "estadísticas" integrada: barras ascendentes dentro del lobo.' },
  { key: 'C', Comp: LogoC, title: 'C · Lobo de línea', desc: 'Outline minimalista, moderno. Muy limpio a tamaño chico.' },
]

export default function LogosPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-5 py-8 space-y-8">
        <header>
          <h1 className="text-2xl font-black text-[#1e293b]">Conceptos de logo</h1>
          <p className="text-sm text-gray-500 mt-1">El lobo como base, en lenguaje de sitios de stats: simple, reconocible a 16px. Elegí uno y lo afinamos.</p>
        </header>

        {CONCEPTS.map(({ key, Comp, title, desc }) => (
          <section key={key} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#1a2e4a] flex items-center justify-between">
              <span className="text-sm font-black text-white uppercase tracking-wide">{title}</span>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <p className="text-sm text-gray-600">{desc}</p>
              {/* Sobre fondo claro */}
              <div className="flex items-end gap-6 flex-wrap">
                <div className="flex flex-col items-center gap-1"><Comp s={96} /><span className="text-[0.65rem] text-gray-400">96px</span></div>
                <div className="flex flex-col items-center gap-1"><Comp s={56} /><span className="text-[0.65rem] text-gray-400">56px</span></div>
                <div className="flex flex-col items-center gap-1"><Comp s={32} /><span className="text-[0.65rem] text-gray-400">32px</span></div>
                <div className="flex flex-col items-center gap-1"><Comp s={16} /><span className="text-[0.65rem] text-gray-400">16px favicon</span></div>
              </div>
              {/* Sobre fondo oscuro (topbar/fichas) */}
              <div className="flex items-center gap-6 flex-wrap bg-[#162032] rounded-lg p-4">
                <Comp s={56} />
                <Comp s={32} />
                <Comp s={16} />
                <span className="text-xs text-gray-400">sobre fondo oscuro</span>
              </div>
              {/* Logo + texto, como iría en el topbar */}
              <div className="flex items-center gap-3 border-t border-[#f1f5f9] pt-4">
                <Comp s={48} />
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', fontFamily: 'var(--font-archivo), system-ui' }}>Lobo Entrerriano</div>
                  <div className="uppercase" style={{ fontSize: '0.55rem', fontWeight: 700, color: '#2563eb', letterSpacing: '0.22em', marginTop: 3 }}>· Estadísticas ·</div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
