import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin
    .from('qr_codes')
    .select('type, content, name')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!qr) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let content: Record<string, unknown> = {}
  try { content = JSON.parse(qr.content) } catch {}

  return NextResponse.json({ type: qr.type, name: qr.name, content })
}
