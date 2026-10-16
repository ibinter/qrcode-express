import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import ReviewLanding from './ReviewLanding'
import { buildMeta } from '@/lib/og-meta'
import { getLang } from '@/lib/i18n-server'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'review').single()
  if (!qr) return buildMeta({ title: 'Laissez un avis' })
  let r: { business?: string; message?: string; logo?: string } = {}
  try { r = JSON.parse(qr.content) } catch {}
  return buildMeta({ title: r.business ? `Avis — ${r.business}` : 'Laissez un avis', description: r.message, image: r.logo })
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status, design')
    .eq('id', id)
    .eq('type', 'review')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let review: Record<string, unknown> = {}
  try { review = JSON.parse(qr.content) } catch {}

  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <ReviewLanding review={review as any} qrId={id} lang={lang} />
    </>
  )
}
