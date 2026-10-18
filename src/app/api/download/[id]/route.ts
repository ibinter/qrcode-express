import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(req.url)
  const password = url.searchParams.get('password')
  const admin = createAdminClient()

  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'download').single()
  if (!qr) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let file: Record<string, string> = {}
  try { file = JSON.parse(qr.content) } catch {}

  if (file.password && file.password !== password) {
    if (!password) return NextResponse.json({ needs_password: true })
    return NextResponse.json({ error: 'Wrong password' }, { status: 403 })
  }

  return NextResponse.json({ file })
}
