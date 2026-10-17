import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileActions from './ProfileActions'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const instant = false

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  const [{ data: qrs }, { data: subscription }, { data: profile }, { data: transactions }] = await Promise.all([
    admin.from('qr_codes').select('id, scan_count, mode').eq('user_id', user.id).neq('status', 'archived'),
    admin.from('subscriptions').select('plan, status, period_end').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('profiles').select('credits, plan, full_name').eq('id', user.id).single(),
    admin.from('transactions').select('id, amount, description, status, created_at, metadata').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const totalScans = qrs?.reduce((s, q) => s + (q.scan_count || 0), 0) ?? 0
  const credits = profile?.credits ?? 0
  const dynamicCount = qrs?.filter((q) => q.mode === 'dynamic').length ?? 0
  // Use active subscription plan, fallback to profile plan
  const plan = subscription?.plan ?? profile?.plan ?? 'free'
  const PLAN_LABELS: Record<string, string> = {
    free: 'Gratuit', essential: 'Essentiel', pro: 'Pro',
    business: 'Business', agency: 'Agency', enterprise: 'Enterprise',
  }
  const planLabel = PLAN_LABELS[plan] ?? 'Gratuit'
  const planColor = plan === 'pro' ? 'bg-blue-100 text-blue-700'
    : plan === 'business' || plan === 'agency' || plan === 'enterprise' ? 'bg-purple-100 text-purple-700'
    : plan === 'essential' ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-500'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">← Tableau de bord</Link>
        </div>

        {/* Avatar + info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow"
            style={{ background: 'linear-gradient(135deg, #041B4D, #FF6A00)' }}>
            {(profile?.full_name ?? user.email)?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            {profile?.full_name && (
              <p className="font-bold text-[#041B4D] text-lg leading-tight truncate">{profile.full_name}</p>
            )}
            <p className={`text-gray-500 truncate ${profile?.full_name ? 'text-xs' : 'font-bold text-[#041B4D] text-lg leading-tight'}`}>{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-semibold ${planColor}`}>
              Plan {planLabel}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: '📱', label: 'QR codes', value: qrs?.length ?? 0 },
            { icon: '📊', label: 'Scans total', value: totalScans },
            { icon: '⚡', label: 'Dynamiques', value: dynamicCount },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-2xl font-bold text-[#041B4D]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
          {/* Crédits */}
          <Link href="/portefeuille"
            className="bg-white rounded-2xl border-2 border-[#FF6A00]/30 shadow-sm p-4 text-center hover:border-[#FF6A00] transition-colors group">
            <p className="text-xl mb-1">💰</p>
            <p className="text-2xl font-bold text-[#FF6A00]">{credits.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-gray-500 mt-0.5">Crédits</p>
            <p className="text-xs text-[#FF6A00] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Recharger →</p>
          </Link>
        </div>

        {/* Subscription details */}
        {subscription && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">Abonnement</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="font-semibold text-[#041B4D]">{planLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>
                  {subscription.status === 'active' ? 'Actif' : subscription.status}
                </span>
              </div>
              {subscription.period_end && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Renouvellement</span>
                  <span className="font-semibold text-[#041B4D]">
                    {new Date(subscription.period_end).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {(plan === 'free' || plan === 'gratuit') && (
          <div className="rounded-2xl p-5 text-center mb-5" style={{ background: 'linear-gradient(135deg, #041B4D, #1a3a7a)' }}>
            <p className="text-white font-bold mb-1">Passez au plan Essentiel 🚀</p>
            <p className="text-white/70 text-xs mb-4">QR dynamiques, analytics, logo personnalisé</p>
            <Link href="/#pricing"
              className="inline-block bg-[#FF6A00] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              Voir les plans
            </Link>
          </div>
        )}

        {/* Payment history */}
        {transactions && transactions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-bold text-[#041B4D] mb-3">Historique des transactions</h2>
            <div className="space-y-2">
              {transactions.map((tx) => {
                const meta = (tx.metadata ?? {}) as Record<string, unknown>
                const isCredits = meta.type === 'credits'
                const icon = isCredits ? '💰' : '📋'
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-[#041B4D] leading-tight truncate max-w-[180px]">
                          {tx.description || (isCredits ? `+${meta.credits} crédits` : 'Paiement')}
                        </p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#041B4D]">{Number(tx.amount).toLocaleString('fr-FR')} FCFA</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        tx.status === 'success' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{tx.status === 'success' ? 'Réussi' : tx.status === 'pending' ? 'En attente' : 'Échoué'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Profile actions: edit name + delete account */}
        <ProfileActions fullName={profile?.full_name ?? ''} email={user.email ?? ''} />

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link href="/parrainage" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-[#FF6A00]/40 transition-colors">
            <p className="text-xl mb-1">🎁</p>
            <p className="text-xs font-semibold text-[#041B4D]">Parrainage</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Inviter des amis</p>
          </Link>
          <Link href="/portefeuille" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-[#FF6A00]/40 transition-colors">
            <p className="text-xl mb-1">💰</p>
            <p className="text-xs font-semibold text-[#041B4D]">Portefeuille</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Recharger crédits</p>
          </Link>
        </div>
      </div>
  </div>
  )
}
