import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buildMeta } from '@/lib/og-meta'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'video').single()
  if (!qr) return buildMeta({ title: 'Vidéo' })
  let v: { title?: string; description?: string; thumbnail?: string; video_url?: string } = {}
  try { v = JSON.parse(qr.content) } catch {}
  const ytMatch = v.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  const thumb = v.thumbnail || (ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : null)
  return buildMeta({ title: v.title || 'Vidéo', description: v.description, image: thumb })
}

interface VideoData {
  title: string
  video_url?: string
  description?: string
  thumbnail?: string
  logo?: string
  color?: string
  autoplay?: boolean
  loop?: boolean
  cta_label?: string
  cta_url?: string
}

function getEmbedUrl(url: string, autoplay: boolean, loop: boolean): { type: 'youtube' | 'vimeo' | 'mp4'; embed: string; thumb?: string } {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    const vid = ytMatch[1]
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
    if (autoplay) params.set('autoplay', '1')
    if (loop) { params.set('loop', '1'); params.set('playlist', vid) }
    return {
      type: 'youtube',
      embed: `https://www.youtube.com/embed/${vid}?${params}`,
      thumb: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
    }
  }
  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) {
    const vid = vmMatch[1]
    const params = new URLSearchParams({ color: 'FF6A00', title: '0', byline: '0' })
    if (autoplay) params.set('autoplay', '1')
    if (loop) params.set('loop', '1')
    return { type: 'vimeo', embed: `https://player.vimeo.com/video/${vid}?${params}` }
  }
  // Direct MP4
  return { type: 'mp4', embed: url }
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status')
    .eq('id', id)
    .eq('type', 'video')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let vid: VideoData = { title: '' }
  try { vid = JSON.parse(qr.content) } catch {}

  const accent = vid.color || '#041B4D'
  const embed = vid.video_url ? getEmbedUrl(vid.video_url, !!vid.autoplay, !!vid.loop) : null
  const thumbSrc = vid.thumbnail || embed?.thumb || null

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Video player */}
      <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
        {embed ? (
          embed.type === 'mp4' ? (
            <video
              src={embed.embed}
              controls
              autoPlay={!!vid.autoplay}
              loop={!!vid.loop}
              muted={!!vid.autoplay}
              playsInline
              poster={thumbSrc || undefined}
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              src={embed.embed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={vid.title}
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            {thumbSrc ? (
              <img src={thumbSrc} alt="" className="w-full h-full object-cover opacity-50" />
            ) : (
              <span className="text-6xl">▶️</span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4">
        {/* Title + logo */}
        <div className="flex items-start gap-3">
          {vid.logo && <img src={vid.logo} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />}
          <div>
            <h1 className="font-extrabold text-lg leading-tight">{vid.title}</h1>
          </div>
        </div>

        {vid.description && (
          <p className="text-sm text-gray-400 leading-relaxed">{vid.description}</p>
        )}

        {/* CTA */}
        {vid.cta_label && vid.cta_url && (
          <a href={vid.cta_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-transform active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accent}, #FF6A00)` }}>
            {vid.cta_label} →
          </a>
        )}

        {/* Source link */}
        {vid.video_url && (
          <a href={vid.video_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm border border-white/20 text-white/70 hover:bg-white/5 transition-colors">
            🔗 Ouvrir dans l'application originale
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-white/10">
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400">
          Propulsé par <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
        </Link>
      </div>
    </main>
  )
}
