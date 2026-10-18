import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  await admin.from('loyalty_stamps').insert({ qr_id: id })

  const { count } = await admin.from('loyalty_stamps').select('*', { count: 'exact', head: true }).eq('qr_id', id)

  return NextResponse.json({ stamps: count ?? 0 })
}
