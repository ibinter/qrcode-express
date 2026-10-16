import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'patriceky1er@gmail.com').split(',').map(e => e.trim().toLowerCase())

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())) return null
  return user
}

export async function POST(request: NextRequest) {
  const adminUser = await checkAdmin()
  if (!adminUser) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await request.json()
  const { action, userId, qrId } = body
  const admin = createAdminClient()

  switch (action) {
    case 'plan': {
      const { plan } = body
      const validPlans = ['free', 'essential', 'pro', 'business', 'agency', 'enterprise']
      if (!validPlans.includes(plan)) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
      await admin.from('profiles').update({ plan }).eq('id', userId)
      // Also update active subscription if exists
      await admin.from('subscriptions').update({ plan }).eq('user_id', userId).eq('status', 'active')
      return NextResponse.json({ message: `Plan mis à jour → ${plan}` })
    }

    case 'credits': {
      const { amount } = body
      if (!amount || typeof amount !== 'number') return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
      await admin.rpc('add_credits', { user_uuid: userId, amount })
      return NextResponse.json({ message: `${amount > 0 ? '+' : ''}${amount} crédits appliqués` })
    }

    case 'reset_subscription': {
      await admin.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId).eq('status', 'active')
      await admin.from('profiles').update({ plan: 'free' }).eq('id', userId)
      return NextResponse.json({ message: 'Abonnement réinitialisé → gratuit' })
    }

    case 'qr_status': {
      const { status } = body
      const validStatuses = ['active', 'paused', 'archived']
      if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      await admin.from('qr_codes').update({ status }).eq('id', qrId)
      return NextResponse.json({ message: `QR ${status}` })
    }

    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }
}
