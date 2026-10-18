import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { answers } = await req.json()
  const admin = createAdminClient()

  await admin.from('survey_responses').insert({ qr_id: id, answers })

  return NextResponse.json({ ok: true })
}
