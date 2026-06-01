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
    <header className="bg-[#162d4a] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-2xl mx-auto flex items-stretch">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 shrink-0 border-r border-blue-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/escudo-gec" alt="GEC" className="h-8 w-8 object-contain" />
          <div className="hidden sm:block">
            <p className="font-black text-sm leading-tight">Lobo Entrerriano</p>
            <p className="text-blue-400 text-[9px] uppercase tracking-widest leading-tight">GEC · Estadísticas</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex-1 flex overflow-x-auto scrollbar-none">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 flex items-center text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                isActive(link.href)
                  ? 'text-white border-[#e8b84b]'
                  : 'text-blue-300 border-transparent hover:text-white hover:border-blue-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
