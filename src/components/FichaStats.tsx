/** Fila de estadísticas para fichas (estadio/DT/árbitro): PJ + G/E/P + % victorias. */
export default function FichaStats({ pj, pg, pe, pp, labels = ['PG', 'PE', 'PP'] }: {
  pj: number; pg: number; pe: number; pp: number; labels?: [string, string, string]
}) {
  const pct = pj > 0 ? Math.round((pg / pj) * 100) : 0
  const items = [
    { num: pj, label: 'PJ', color: '#1e293b' },
    { num: pg, label: labels[0], color: '#16a34a' },
    { num: pe, label: labels[1], color: '#ca8a04' },
    { num: pp, label: labels[2], color: '#dc2626' },
    { num: `${pct}%`, label: 'Rend.', color: '#2563eb' },
  ]
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] grid grid-cols-5 divide-x divide-[#f1f5f9]">
      {items.map(s => (
        <div key={s.label} className="flex flex-col items-center py-4 gap-1">
          <span className="text-[1.4rem] font-black tabular-nums" style={{ color: s.color }}>{s.num}</span>
          <span className="text-[0.65rem] text-[#94a3b8] uppercase tracking-wide">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
