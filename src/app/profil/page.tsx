import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  const [{ data: qrs }, { data: subscription }] = await Promise.all([
    admin.from('qr_codes').select('id, scan_count, mode').eq('user_id', user.id).neq('status', 'archived'),
    admin.from('subscriptions').select('plan, status, current_period_end').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
  ])

  const totalScans = qrs?.reduce((s, q) => s + (q.scan_count || 0), 0) ?? 0
  const dynamicCount = qrs?.filter((q) => q.mode === 'dynamic').length ?? 0
  const plan = subscription?.plan ?? 'gratuit'
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'business' ? 'Business' : 'Gratuit'
  const planColor = plan === 'pro' ? 'bg-blue-100 text-blue-700' : plan === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">← Tableau de bord</Link>
        </div>

        {/* Avatar + info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow"
            style={{ background: 'linear-gradient(135deg, #041B4D, #FF6A00)' }}>
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#041B4D] text-lg leading-tight truncate">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-semibold ${planColor}`}>
              Plan {planLabel}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
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
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Renouvellement</span>
                  <span className="font-semibold text-[#041B4D]">
                    {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {plan === 'gratuit' && (
          <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #041B4D, #1a3a7a)' }}>
            <p className="text-white font-bold mb-1">Passez au plan Pro 🚀</p>
            <p className="text-white/70 text-xs mb-4">QR dynamiques illimités, analytics avancés, logo personnalisé</p>
            <Link href="/#pricing"
              className="inline-block bg-[#FF6A00] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              Voir les plans
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
