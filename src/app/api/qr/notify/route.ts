import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePlan } from '@/lib/plan-guard'

export async function POST(request: NextRequest) {
  const { ok, user, error } = await requirePlan('pro')
  if (!ok) return error

  const { qrId, email } = await request.json()
  if (!qrId) return NextResponse.json({ error: 'Missing qrId' }, { status: 400 })

  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('design').eq('id', qrId).eq('user_id', user.id).single()
  if (!qr) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const design = (qr.design || {}) as Record<string, unknown>
  if (email) {
    design.notify_on_scan = email
  } else {
    delete design.notify_on_scan
  }

  await admin.from('qr_codes').update({ design }).eq('id', qrId)
  return NextResponse.json({ ok: true })
}
