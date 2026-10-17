import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import ScannerClient from './ScannerClient'

export const instant = false

export default async function ScanPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, name, content, user_id, status')
    .eq('id', eventId)
    .eq('type', 'event')
    .single()

  if (!qr) notFound()
  if (qr.user_id !== user.id) notFound()

  let event: Record<string, unknown> = {}
  try { event = JSON.parse(qr.content || '{}') } catch {}

  const accentColor = (event.color as string) || '#041B4D'

  return (
    <ScannerClient
      eventId={eventId}
      eventName={(event.name as string) || qr.name || 'Événement'}
      accentColor={accentColor}
    />
  )
}
