import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import { buildMeta } from '@/lib/og-meta'
import { getLang } from '@/lib/i18n-server'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'coupon' as any).single()
  if (!qr) return buildMeta({ title: 'Coupon de réduction' })
  let c: { title?: string; discount?: string; description?: string } = {}
  try { c = JSON.parse(qr.content) } catch {}
  const desc = c.discount ? `Réduction de ${c.discount}${c.description ? ' · ' + c.description : ''}` : c.description
  return buildMeta({ title: c.title || 'Coupon de réduction', description: desc })
}

import CouponClient from './CouponClient'

interface CouponData {
  title: string; code?: string; discount?: string; description?: string
  expires?: string; brand?: string; logo?: string; color?: string
  cta_label?: string; cta_url?: string
}

export default async function CouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status, expires_at, design')
    .eq('id', id)
    .eq('type', 'coupon' as any)
    .single()

  if (!qr || qr.status === 'archived') notFound()

  const isExpired = !!(qr.expires_at && new Date(qr.expires_at) < new Date())
  let coupon: CouponData = { title: 'Bon de réduction' }
  try { coupon = JSON.parse(qr.content) } catch {}
  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <CouponClient coupon={coupon} isExpired={isExpired} lang={lang} />
    </>
  )
}
