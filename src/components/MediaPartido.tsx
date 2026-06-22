'use client'

import { useState } from 'react'
import type { MediaFoto } from '@/types'

interface Props {
  fotos: MediaFoto[]
  videos: MediaFoto[]
  audios: MediaFoto[]
}

/**
 * Bloque de multimedia del detalle de partido, clonado del original
 * loboentrerriano.com: fotos (con lightbox), videos y audios.
 */
export default function MediaPartido({ fotos, videos, audios }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!fotos.length && !videos.length && !audios.length) return null

  const cols = fotos.length === 1 ? '1fr' : fotos.length === 2 ? '1fr 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'

  return (
    <div className="rounded-xl overflow-hidden border border-[#e2e8f0]">
      {/* Cabecera */}
      <div className="flex items-center gap-2 text-white" style={{ background: '#1e3a5f', padding: '13px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        Multimedia
      </div>

      {/* Fotos */}
      {fotos.length > 0 && (
        <>
          <SubHeader emoji="📷" label="Fotos" count={fotos.length} />
          <div className="bg-white" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
              {fotos.map((f, i) => (
                <div key={i} className="flex flex-col gap-[7px]">
                  <div onClick={() => setLightbox(i)} className="cursor-zoom-in rounded-[10px] overflow-hidden border border-[#e2e8f0] bg-[#f1f5f9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.src} alt={f.leyenda ?? f.nombre ?? ''} loading="lazy" decoding="async" className="w-full h-auto block" />
                  </div>
                  {f.leyenda && <div className="text-[0.78rem] text-[#64748b] text-center italic px-1">{f.leyenda}</div>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <>
          <SubHeader emoji="🎬" label="Videos" count={videos.length} topBorder />
          <div className="bg-white flex flex-col gap-2.5" style={{ padding: '12px 14px' }}>
            {videos.map((v, i) => (
              <div key={i}>
                <video controls className="w-full rounded-lg bg-black" style={{ maxHeight: 300 }}>
                  <source src={v.src} type={v.mime || 'video/mp4'} />
                </video>
                {v.leyenda && <div className="text-[0.78rem] text-[#64748b] mt-[5px] italic">{v.leyenda}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Audios */}
      {audios.length > 0 && (
        <>
          <SubHeader emoji="🎵" label="Audios" count={audios.length} topBorder />
          <div className="bg-white flex flex-col gap-2" style={{ padding: '12px 14px' }}>
            {audios.map((a, i) => (
              <div key={i} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg" style={{ padding: '10px 14px' }}>
                {a.leyenda && <div className="text-[0.82rem] text-[#334155] mb-1.5 italic">{a.leyenda}</div>}
                <audio controls className="w-full">
                  <source src={a.src} type={a.mime || 'audio/mpeg'} />
                </audio>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox de fotos */}
      {lightbox !== null && fotos[lightbox] && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[lightbox].src} alt={fotos[lightbox].leyenda ?? ''} className="rounded-[10px] object-contain" style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
          {fotos[lightbox].leyenda && (
            <div className="absolute left-1/2 -translate-x-1/2 text-white text-[0.9rem] px-4 py-1.5 rounded-[20px]" style={{ bottom: 30, background: 'rgba(0,0,0,0.5)' }}>
              {fotos[lightbox].leyenda}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SubHeader({ emoji, label, count, topBorder }: { emoji: string; label: string; count: number; topBorder?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 bg-[#f8fafc] border-b border-[#e2e8f0] text-[#334155]"
      style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderTop: topBorder ? '1px solid #e2e8f0' : undefined }}
    >
      {emoji} {label}
      <span className="text-white font-extrabold" style={{ background: '#344D83', fontSize: '0.6rem', padding: '1px 7px', borderRadius: 20 }}>{count}</span>
    </div>
  )
}
