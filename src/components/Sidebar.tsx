'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_MAIN = [
  { href: '/',             icon: '🏠', label: 'Inicio' },
]

const NAV_ESTADISTICAS = [
  { href: '/competencias', icon: '🏆', label: 'Competencias' },
  { href: '/jugadores',    icon: '👤', label: 'Jugadores' },
  { href: '/goleadores',   icon: '⚽', label: 'Goleadores' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/escudo-gec" alt="GEC" className="h-12 w-12 object-contain shrink-0" />
          <div>
            <p className="font-black text-[#1a2e4a] text-base leading-tight">Lobo Entrerriano</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">· Estadísticas ·</p>
          </div>
        </Link>

        {/* Nav principal */}
        <nav className="flex flex-col px-3 pt-4 gap-0.5">
          {NAV_MAIN.map(link => (
            <NavItem key={link.href} link={link} active={isActive(link.href)} />
          ))}
        </nav>

        {/* Sección ESTADÍSTICAS */}
        <div className="px-5 pt-5 pb-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estadísticas</p>
        </div>
        <nav className="flex flex-col px-3 gap-0.5 pb-4">
          {NAV_ESTADISTICAS.map(link => (
            <NavItem key={link.href} link={link} active={isActive(link.href)} />
          ))}
        </nav>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {[...NAV_MAIN, ...NAV_ESTADISTICAS].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors ${
              isActive(link.href) ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            <span className="truncate max-w-full px-1">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

function NavItem({ link, active }: { link: { href: string; icon: string; label: string }; active: boolean }) {
  return (
    <Link
      href={link.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-base leading-none w-5 text-center">{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  )
}
