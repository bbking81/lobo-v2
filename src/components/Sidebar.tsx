'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_MAIN = [
  { href: '/', label: 'Inicio', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
]

const NAV_ESTADISTICAS = [
  { href: '/partidos',    label: 'Partidos',    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
  { href: '/jugadores',   label: 'Jugadores',   icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/goleadores',  label: 'Goleadores',  icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> },
  { href: '/competencias',label: 'Competencias',icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-[262px] shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://loboentrerriano.com/static/logo.png"
            alt="Lobo Entrerriano"
            className="h-12 w-12 object-contain shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://loboentrerriano.com/static/favicon.png' }}
          />
          <div>
            <p className="font-black text-[#1e293b] text-base leading-tight">Lobo Entrerriano</p>
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

function NavItem({ link, active }: { link: { href: string; icon: React.ReactNode; label: string }; active: boolean }) {
  return (
    <Link
      href={link.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="w-5 flex items-center justify-center shrink-0">{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  )
}
