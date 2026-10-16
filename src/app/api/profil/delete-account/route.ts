import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  // Delete user data in order of dependency
  await admin.from('referral_rewards').delete().eq('referrer_id', user.id)
  await admin.from('referral_rewards').delete().eq('referred_id', user.id)
  await admin.from('org_members').delete().eq('user_id', user.id)
  await admin.from('qr_codes').delete().eq('user_id', user.id)
  await admin.from('transactions').delete().eq('user_id', user.id)
  await admin.from('subscriptions').delete().eq('user_id', user.id)
  await admin.from('profiles').delete().eq('id', user.id)

  // Delete auth user last
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
