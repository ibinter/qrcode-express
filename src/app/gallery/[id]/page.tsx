import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import GalleryViewer from './GalleryViewer'
import { buildMeta } from '@/lib/og-meta'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'gallery').single()
  if (!qr) return buildMeta({ title: 'Galerie photos' })
  let g: { title?: string; description?: string; photos?: string[] } = {}
  try { g = JSON.parse(qr.content) } catch {}
  return buildMeta({ title: g.title || 'Galerie photos', description: g.description, image: g.photos?.[0] })
}

interface GalleryData {
  title: string
  description?: string
  layout?: 'grid' | 'masonry' | 'slideshow'
  color?: string
  logo?: string
  photos?: string[]
}

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status')
    .eq('id', id)
    .eq('type', 'gallery')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let gallery: GalleryData = { title: '' }
  try { gallery = JSON.parse(qr.content) } catch {}

  return <GalleryViewer gallery={gallery} />
}
