import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'survey').single()
  if (!qr) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let survey = {}
  try { survey = JSON.parse(qr.content) } catch {}

  return NextResponse.json({ survey })
}
