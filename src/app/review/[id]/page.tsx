import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import ReviewLanding from './ReviewLanding'

export const instant = false

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
      <ReviewLanding review={review as any} qrId={id} />
    </>
  )
}
