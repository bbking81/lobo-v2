// Bandera por nacionalidad (usa flag-icons). Mapa país→ISO del original.
const COUNTRY_CODES: Record<string, string> = {
  argentina: 'ar', uruguay: 'uy', brasil: 'br', brazil: 'br',
  paraguay: 'py', chile: 'cl', colombia: 'co', peru: 'pe',
  bolivia: 'bo', ecuador: 'ec', venezuela: 've', mexico: 'mx',
  españa: 'es', spain: 'es', italia: 'it', portugal: 'pt',
  francia: 'fr', france: 'fr', alemania: 'de', germany: 'de',
  holanda: 'nl', netherlands: 'nl', 'costa rica': 'cr', panama: 'pa',
  cuba: 'cu', inglaterra: 'gb-eng', croacia: 'hr', japon: 'jp',
  'estados unidos': 'us', canada: 'ca', senegal: 'sn', nigeria: 'ng',
  ghana: 'gh', marruecos: 'ma', 'costa de marfil': 'ci', camerun: 'cm',
}

export function flagCode(pais?: string | null): string | null {
  if (!pais) return null
  return COUNTRY_CODES[pais.toLowerCase().trim()] ?? null
}

export default function Flag({ pais, size = 22 }: { pais?: string | null; size?: number }) {
  const code = flagCode(pais)
  if (!code) return null
  return (
    <span
      className={`fi fi-${code}`}
      title={pais ?? undefined}
      style={{ width: size, height: Math.round(size * 0.73), display: 'inline-block', borderRadius: 2, verticalAlign: 'middle', backgroundSize: 'cover' }}
    />
  )
}
