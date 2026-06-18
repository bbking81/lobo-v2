/* Footer global — franja gris del original loboentrerriano.com */
export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between flex-wrap gap-4 shrink-0"
      style={{ background: '#e2e8f0', borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 40px' }}
    >
      <div className="flex items-center gap-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://loboentrerriano.com/static/logo.png?v=gec8" alt="Gimnasia y Esgrima" className="w-10 h-10 object-contain" />
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.5px', fontFamily: 'var(--font-archivo), system-ui, sans-serif' }}>
            Lobo entrerriano
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
            Estadísticas · Gimnasia y Esgrima de Concepción del Uruguay · Entre Ríos, Argentina
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div style={{ fontSize: '0.76rem', fontWeight: 400, color: '#475569' }}>Creado por Data Mens Sana</div>
        <a
          href="mailto:contactoloboentrerriano@gmail.com"
          title="Escribinos a contactoloboentrerriano@gmail.com"
          className="flex items-center justify-center transition-colors"
          style={{ width: 34, height: 34, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, color: '#64748b' }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
