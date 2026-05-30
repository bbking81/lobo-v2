'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/competencias', label: 'Competencias' },
  { href: '/jugadores', label: 'Plantel' },
  { href: '/goleadores', label: 'Goleadores' },
]

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
      {/* Franja superior: logo + nombre */}
      <div className="max-w-2xl mx-auto px-3 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/escudo-gec" alt="GEC" className="h-9 w-9 object-contain shrink-0" />
          <div className="min-w-0">
            <p className="font-black text-base leading-tight tracking-tight">Lobo Entrerriano</p>
            <p className="text-blue-300 text-[10px] uppercase tracking-widest leading-tight">
              Gimnasia y Esgrima · CdU
            </p>
          </div>
        </Link>
      </div>

      {/* Barra de navegación */}
      <nav className="border-t border-blue-800">
        <div className="max-w-2xl mx-auto px-1 flex overflow-x-auto scrollbar-none">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                isActive(link.href)
                  ? 'text-white border-white'
                  : 'text-blue-300 border-transparent hover:text-white hover:border-blue-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
