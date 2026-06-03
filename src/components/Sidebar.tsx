'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// SVG icons inline
const Icons = {
  home:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  map:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  clock:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  shield:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  user:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ball:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  bar:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trophy:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  briefcase: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  stadium:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  whistle:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="6"/><path d="M15 9l3.4-3.4a2 2 0 0 1 2.8 2.8L18 12"/><path d="M11.5 7.5 9 12l4.5-.5"/></svg>,
}

const NAV_MAIN = [
  { href: '/',                label: 'Inicio',             icon: Icons.home },
  { href: '/buscador',        label: 'Buscador avanzado',  icon: Icons.search },
  { href: '/mapa',            label: 'Mapa global',        icon: Icons.map },
]

const NAV_ESTADISTICAS = [
  { href: '/partidos',        label: 'Partidos',           icon: Icons.clock },
  { href: '/historiales',     label: 'Historiales',        icon: Icons.shield },
  { href: '/jugadores',       label: 'Jugadores',          icon: Icons.user },
  { href: '/goleadores',      label: 'Goleadores',         icon: Icons.ball },
  { href: '/rankings',        label: 'Rankings',           icon: Icons.bar },
  { href: '/competencias',    label: 'Competencias',       icon: Icons.trophy },
  { href: '/dts',             label: 'Directores Técnicos',icon: Icons.briefcase },
]

const NAV_DATOS = [
  { href: '/dt-rivales',      label: 'DT Rivales',         icon: Icons.briefcase },
  { href: '/jugadores-rivales',label: 'Jugadores Rivales', icon: Icons.users },
  { href: '/estadios',        label: 'Estadios',           icon: Icons.stadium },
  { href: '/arbitros',        label: 'Árbitros',           icon: Icons.whistle },
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
        <Link href="/" className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://loboentrerriano.com/static/logo.png"
            alt="Lobo Entrerriano"
            className="h-[78px] w-[78px] object-contain shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://loboentrerriano.com/static/favicon.png' }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <p className="font-bold text-[#1e293b] text-[1.45rem] leading-tight whitespace-nowrap" style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Lobo Entrerriano</p>
            <p className="text-[0.58rem] font-semibold uppercase mt-1 whitespace-nowrap" style={{ color: '#2e5cda', letterSpacing: '0.22em', fontFamily: "'Inter', system-ui, sans-serif" }}>· Estadísticas ·</p>
          </div>
        </Link>

        {/* Nav principal */}
        <nav className="flex flex-col px-3 pt-4 gap-0.5">
          {NAV_MAIN.map(link => (
            <NavItem key={link.href} link={link} active={isActive(link.href)} />
          ))}
        </nav>

        {/* ESTADÍSTICAS */}
        <div className="px-5 pt-5 pb-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estadísticas</p>
        </div>
        <nav className="flex flex-col px-3 gap-0.5">
          {NAV_ESTADISTICAS.map(link => (
            <NavItem key={link.href} link={link} active={isActive(link.href)} />
          ))}
        </nav>

        {/* DATOS */}
        <div className="px-5 pt-5 pb-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos</p>
        </div>
        <nav className="flex flex-col px-3 gap-0.5 pb-6">
          {NAV_DATOS.map(link => (
            <NavItem key={link.href} link={link} active={isActive(link.href)} />
          ))}
        </nav>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {[NAV_MAIN[0], NAV_ESTADISTICAS[0], NAV_ESTADISTICAS[2], NAV_ESTADISTICAS[3], NAV_ESTADISTICAS[5]].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors ${
              isActive(link.href) ? 'text-[#2563eb]' : 'text-gray-400'
            }`}
          >
            <span className="leading-none">{link.icon}</span>
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
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[1rem] font-normal transition-all ${
        active
          ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
          : 'text-[#1e293b] hover:bg-[#2563eb]/8 hover:text-[#1d4ed8]'
      }`}
    >
      <span className={`w-5 flex items-center justify-center shrink-0 ${active ? 'text-white' : 'text-[#64748b]'}`}>{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  )
}
