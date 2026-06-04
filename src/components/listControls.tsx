'use client'

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** Input de búsqueda con lupa, igual a los `.filter-input` del original. */
export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="relative max-w-[280px]">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg py-2 pl-8 pr-3 text-sm text-[#1e293b] outline-none focus:border-[#2563eb]"
      />
    </div>
  )
}

/** Barra de filtro alfabético (Todos + A-Z), clon de `.alpha-btn`. */
export function AlphaBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const Btn = ({ label }: { label: string }) => {
    const active = value === label || (label === 'Todos' && value === 'todos')
    const v = label === 'Todos' ? 'todos' : label
    return (
      <button onClick={() => onChange(v)}
        className="px-2.5 py-1 border rounded-md text-[0.82rem] font-semibold transition-colors"
        style={active
          ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' }
          : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
        {label}
      </button>
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <Btn label="Todos" />
      {LETRAS.map(l => <Btn key={l} label={l} />)}
    </div>
  )
}

/** Ícono de orden para encabezados de columna. */
export function sortIcon(active: boolean, dir: 1 | -1) {
  return active ? (dir === 1 ? '↑' : '↓') : '↕'
}

/** Celda de encabezado ordenable. */
export function SortTh({ children, onClick, className, style }: {
  children: React.ReactNode; onClick: () => void; className?: string; style?: React.CSSProperties
}) {
  return (
    <span onClick={onClick} className={`cursor-pointer select-none ${className ?? ''}`} style={style}>
      {children}
    </span>
  )
}
