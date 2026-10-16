'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GalleryData {
  title: string
  description?: string
  layout?: 'grid' | 'masonry' | 'slideshow'
  color?: string
  logo?: string
  photos?: string[]
}

export default function GalleryViewer({ gallery }: { gallery: GalleryData }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [slide, setSlide] = useState(0)

  const accent = gallery.color || '#FF6A00'
  const photos = gallery.photos || []

  useEffect(() => {
    if (gallery.layout !== 'slideshow' || photos.length === 0) return
    const t = setInterval(() => setSlide(s => (s + 1) % photos.length), 4000)
    return () => clearInterval(t)
  }, [gallery.layout, photos.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(l => Math.min((l ?? 0) + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setLightbox(l => Math.max((l ?? 0) - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, photos.length])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
        {gallery.logo && <img src={gallery.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />}
        <div>
          <h1 className="font-bold text-sm leading-tight">{gallery.title}</h1>
          {gallery.description && <p className="text-xs text-gray-400">{gallery.description}</p>}
        </div>
        <span className="ml-auto text-xs text-gray-500">{photos.length} photos</span>
      </div>

      {/* Slideshow */}
      {gallery.layout === 'slideshow' && photos.length > 0 && (
        <div className="relative w-full h-[70vh] overflow-hidden">
          {photos.map((src, i) => (
            <img key={i} src={src} alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? 'w-6' : 'w-2 bg-white/50'}`}
                style={i === slide ? { background: accent } : {}} />
            ))}
          </div>
          <button onClick={() => setSlide(s => Math.max(s - 1, 0))}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-xl">‹</button>
          <button onClick={() => setSlide(s => Math.min(s + 1, photos.length - 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-xl">›</button>
          {/* Thumbnails */}
          <div className="absolute bottom-14 left-0 right-0 flex gap-2 overflow-x-auto px-4 pb-1">
            {photos.map((src, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === slide ? 'border-white scale-110' : 'border-transparent opacity-60'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {gallery.layout !== 'slideshow' && (
        <div className={`p-3 ${gallery.layout === 'masonry' ? 'columns-2 gap-3' : 'grid grid-cols-3 gap-1.5'}`}>
          {photos.map((src, i) => (
            <button key={i} onClick={() => setLightbox(i)}
              className={`${gallery.layout === 'masonry' ? 'mb-3 block w-full rounded-xl overflow-hidden' : 'aspect-square overflow-hidden rounded-lg'} transition-transform active:scale-95`}>
              <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <img src={photos[lightbox]} alt=""
            className="max-w-full max-h-full object-contain select-none"
            onClick={e => e.stopPropagation()} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/70 bg-black/50 px-3 py-1 rounded-full">
            {lightbox + 1} / {photos.length}
          </div>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-xl">✕</button>
          {lightbox > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 1) - 1) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-2xl">‹</button>
          )}
          {lightbox < photos.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-2xl">›</button>
          )}
        </div>
      )}

      <div className="text-center py-6">
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">
          Propulsé par <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
        </Link>
      </div>
    </main>
  )
}
