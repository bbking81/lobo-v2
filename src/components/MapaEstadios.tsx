'use client'

import { useEffect, useRef } from 'react'

export interface EstadioMapa {
  id: number
  nombre: string
  ciudad: string | null
  provincia: string | null
  pais: string | null
  pj: number
  lat: number
  lng: number
  fotoUrl: string | null
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { L?: any } }

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

/**
 * Mapa de estadios con Leaflet (cargado desde CDN), clonado del original
 * loboentrerriano.com: tiles CARTO, label "Islas Malvinas", markers azules.
 */
export default function MapaEstadios({ estadios }: { estadios: EstadioMapa[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Inyectar CSS de Leaflet
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }

    const crearMapa = () => {
      const L = window.L
      if (!L || !ref.current || mapRef.current) return

      const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: true })
      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19,
      }).addTo(map)

      // Label "Islas Malvinas" (nomenclatura argentina)
      L.marker([-51.8, -59.2], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:#f8fafc;padding:2px 6px;font-size:10px;font-weight:700;color:#64748b;letter-spacing:0.06em;font-family:sans-serif;white-space:nowrap;border-radius:2px;pointer-events:none">ISLAS MALVINAS</div>',
          iconAnchor: [58, 8], iconSize: [116, 16],
        }),
        interactive: false, zIndexOffset: 1000,
      }).addTo(map)

      const icon = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;background:#2563eb;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(37,99,235,0.6)"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10],
      })

      if (estadios.length === 0) {
        map.setView([-32.5, -58.5], 5)
        return
      }

      const bounds: [number, number][] = []
      for (const e of estadios) {
        bounds.push([e.lat, e.lng])
        const lugar = [e.ciudad, e.provincia, e.pais].filter(Boolean).join(', ') || '—'
        const popup =
          '<div style="font-family:DM Sans,sans-serif;min-width:180px;max-width:240px">'
          + (e.fotoUrl ? `<img src="${e.fotoUrl}" style="width:calc(100% + 32px);height:120px;object-fit:cover;border-radius:8px 8px 0 0;display:block;margin:-14px -16px 10px">` : '')
          + `<div style="font-weight:700;font-size:0.92rem;color:#1e293b;margin-bottom:3px">${e.nombre}</div>`
          + `<div style="font-size:0.78rem;color:#64748b;margin-bottom:8px">📍 ${lugar}</div>`
          + `<div style="font-size:0.8rem;color:#475569">${e.pj} partido${e.pj !== 1 ? 's' : ''}</div>`
          + '</div>'
        L.marker([e.lat, e.lng], { icon }).bindPopup(popup, { maxWidth: 240 }).addTo(map)
      }

      if (bounds.length === 1) map.setView(bounds[0], 10)
      else map.fitBounds(bounds, { padding: [40, 40] })

      setTimeout(() => map.invalidateSize(), 200)
    }

    // Cargar Leaflet JS (si hace falta) y crear el mapa
    if (window.L) {
      crearMapa()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_JS}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = LEAFLET_JS
        document.head.appendChild(script)
      }
      script.addEventListener('load', crearMapa)
    }

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [estadios])

  return <div ref={ref} className="w-full" style={{ height: 480, background: '#e2e8f0' }} />
}
