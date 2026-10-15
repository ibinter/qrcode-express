import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  // Verify ownership
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'lead')
    .single()

  if (!qr) return NextResponse.json({ error: 'Formulaire introuvable' }, { status: 404 })

  const { data: submissions } = await admin
    .from('lead_submissions')
    .select('id, data, submitted_at, ip_country')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })
    .limit(200)

  return NextResponse.json({ submissions: submissions || [] })
}
