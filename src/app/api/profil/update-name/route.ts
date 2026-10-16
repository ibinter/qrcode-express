import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { full_name } = await req.json()
  if (!full_name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ full_name: full_name.trim() }).eq('id', user.id)
  if (error) return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
