import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  // Get user's QR code IDs
  const { data: qrs } = await admin
    .from('qr_codes')
    .select('id')
    .eq('user_id', user.id)
    .neq('status', 'archived')

  if (!qrs?.length) {
    return NextResponse.json({ daily: [], countries: [], devices: [] })
  }

  const qrIds = qrs.map((q) => q.id)

  // Last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events } = await admin
    .from('scan_events')
    .select('scanned_at, device_type, country')
    .in('qr_id', qrIds)
    .gte('scanned_at', since)
    .eq('is_bot', false)
    .limit(5000)

  if (!events?.length) {
    return NextResponse.json({ daily: [], countries: [], devices: [] })
  }

  // Aggregate by day (last 14 days)
  const dayMap: Record<string, number> = {}
  const countryMap: Record<string, number> = {}
  const deviceMap: Record<string, number> = {}

  for (const e of events) {
    const day = e.scanned_at.slice(0, 10)
    dayMap[day] = (dayMap[day] || 0) + 1
    if (e.country) countryMap[e.country] = (countryMap[e.country] || 0) + 1
    const d = e.device_type || 'unknown'
    deviceMap[d] = (deviceMap[d] || 0) + 1
  }

  // Last 14 days ordered
  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: dayMap[key] || 0 }
  })

  const countries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count]) => ({ code, count }))

  const devices = Object.entries(deviceMap)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }))

  return NextResponse.json({ daily, countries, devices })
}
