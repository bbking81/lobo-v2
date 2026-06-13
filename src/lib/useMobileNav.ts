'use client'
import { useSyncExternalStore } from 'react'

// Mini-store para el menú móvil/tablet: lo comparten el Topbar (botón hamburguesa)
// y el Sidebar (panel deslizable), que son componentes separados del layout.
let abierto = false
const listeners = new Set<() => void>()

export function setMobileNav(v: boolean) {
  if (abierto === v) return
  abierto = v
  listeners.forEach(l => l())
}
export function toggleMobileNav() { setMobileNav(!abierto) }

export function useMobileNav() {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => listeners.delete(cb) },
    () => abierto,
    () => false,
  )
}
