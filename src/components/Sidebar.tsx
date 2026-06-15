'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useMobileNav, setMobileNav } from '@/lib/useMobileNav'

// SVG icons inline — alineados a los del original loboentrerriano.com (stroke 2.4)
const Icons = {
  home:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  map:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  clock:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  shield:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  user:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ball:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12,7 13.5,10.5 17,10.5 14.5,13 15.5,16.5 12,14.5 8.5,16.5 9.5,13 7,10.5 10.5,10.5" fill="currentColor" fillOpacity="0.3" strokeWidth="1.4"/></svg>,
  bar:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  trophy:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  briefcase: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  briefcase2:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  stadium:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 19 L2 12 Q2 5 12 5 Q22 5 22 12 L22 19"/><line x1="2" y1="19" x2="22" y2="19"/><path d="M5 19 L5 13 Q5 9 12 9 Q19 9 19 13 L19 19"/><rect x="9" y="16" width="6" height="3" rx="0.4"/></svg>,
  whistle:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
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
  { href: '/dt-rivales',      label: 'DT Rivales',         icon: Icons.briefcase2 },
  { href: '/jugadores-rivales',label: 'Jugadores Rivales', icon: Icons.users },
  { href: '/estadios',        label: 'Estadios',           icon: Icons.stadium },
  { href: '/arbitros',        label: 'Árbitros',           icon: Icons.whistle },
]

function NavContenido({ isActive, onNav }: { isActive: (h: string) => boolean; onNav: () => void }) {
  return (
    <>
      <nav className="flex flex-col px-3 pt-4 gap-0.5">
        {NAV_MAIN.map(link => <NavItem key={link.href} link={link} active={isActive(link.href)} onNav={onNav} />)}
      </nav>
      <div className="px-5 pt-5 pb-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estadísticas</p></div>
      <nav className="flex flex-col px-3 gap-0.5">
        {NAV_ESTADISTICAS.map(link => <NavItem key={link.href} link={link} active={isActive(link.href)} onNav={onNav} />)}
      </nav>
      <div className="px-5 pt-5 pb-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos</p></div>
      <nav className="flex flex-col px-3 gap-0.5 pb-6">
        {NAV_DATOS.map(link => <NavItem key={link.href} link={link} active={isActive(link.href)} onNav={onNav} />)}
      </nav>
    </>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const open = useMobileNav()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)
  const close = () => setMobileNav(false)

  // Cerrar con Escape + bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open])

  return (
    <>
      {/* Sidebar fijo en desktop (≥1024px) */}
      <aside className="hidden lg:flex flex-col w-[262px] shrink-0 bg-white border-r border-gray-200 sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto">
        <NavContenido isActive={isActive} onNav={() => {}} />
      </aside>

      {/* Overlay (tablet/celular) */}
      <div
        onClick={close}
        className={`lg:hidden fixed inset-0 z-[250] bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />
      {/* Drawer deslizable (tablet/celular), debajo del topbar (64px) */}
      <aside
        className="lg:hidden fixed top-[64px] left-0 z-[300] h-[calc(100%-64px)] w-[270px] max-w-[82vw] bg-white shadow-2xl overflow-y-auto"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.2s ease' }}
        aria-hidden={!open}
      >
        <NavContenido isActive={isActive} onNav={close} />
      </aside>
    </>
  )
}

function NavItem({ link, active, onNav }: { link: { href: string; icon: React.ReactNode; label: string }; active: boolean; onNav: () => void }) {
  return (
    <Link
      href={link.href}
      onClick={onNav}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[1rem] font-normal transition-all ${
        active
          ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
          : 'text-[#1e293b] hover:bg-[#2563eb]/8 hover:text-[#1d4ed8]'
      }`}
    >
      <span className={`w-5 flex items-center justify-center shrink-0 ${active ? 'text-white' : 'text-[#1e293b]'}`}>{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  )
}
