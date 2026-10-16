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
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'menu').single()
  if (!qr) return buildMeta({ title: 'Menu' })
  let m: { restaurant?: string; description?: string; logo?: string } = {}
  try { m = JSON.parse(qr.content) } catch {}
  return buildMeta({ title: m.restaurant || qr.name || 'Menu', description: m.description, image: m.logo })
}


import MenuClient from './MenuClient'

interface MenuData {
  restaurant: string; description?: string; logo?: string; cover?: string
  color?: string; whatsapp?: string
  categories: { category: string; items: { name: string; price: string; description?: string; photo?: string; available?: boolean }[] }[]
}

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, name, status, design')
    .eq('id', id)
    .eq('type', 'menu')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let menu: MenuData = { restaurant: qr.name || 'Menu', categories: [] }
  try { menu = JSON.parse(qr.content) } catch {}
  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <MenuClient menu={menu} lang={lang} />
    </>
  )
}
