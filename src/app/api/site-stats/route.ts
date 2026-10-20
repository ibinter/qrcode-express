import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 60

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('site_stats')
      .select('value')
      .eq('key', 'total_visits')
      .single()
    return NextResponse.json({ count: data?.value ?? 3255 })
  } catch {
    return NextResponse.json({ count: 3255 })
  }
}
