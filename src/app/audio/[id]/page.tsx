import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import AudioPlayer from './AudioPlayer'
import { buildMeta } from '@/lib/og-meta'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'audio').single()
  if (!qr) return buildMeta({ title: 'Audio' })
  let a: { title?: string; artist?: string; description?: string; cover?: string } = {}
  try { a = JSON.parse(qr.content) } catch {}
  const desc = [a.artist, a.description].filter(Boolean).join(' · ')
  return buildMeta({ title: a.title || 'Audio', description: desc || undefined, image: a.cover })
}

interface AudioData {
  title: string
  artist?: string
  description?: string
  cover?: string
  logo?: string
  color?: string
  theme?: 'dark' | 'light' | 'gradient'
  playlist?: { title: string; url: string; duration?: string }[]
  cta_label?: string
  cta_url?: string
}

export default async function AudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status')
    .eq('id', id)
    .eq('type', 'audio')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let audio: AudioData = { title: '' }
  try { audio = JSON.parse(qr.content) } catch {}

  return <AudioPlayer data={audio} />
}
