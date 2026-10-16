import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminUserActions from './AdminUserActions'

export const instant = false

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8', essential: '#10b981', pro: '#3b82f6',
  business: '#7c3aed', agency: '#f59e0b', enterprise: '#ec4899',
}

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const [
    { data: profile },
    { data: authUser },
    { data: qrs },
    { data: transactions },
    { data: subscription },
    { data: referrals },
  ] = await Promise.all([
    admin.from('profiles').select('*').eq('id', id).single(),
    admin.auth.admin.getUserById(id),
    admin.from('qr_codes').select('id, name, type, mode, status, scan_count, created_at').eq('user_id', id).order('created_at', { ascending: false }),
    admin.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('subscriptions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1).single(),
    admin.from('referral_rewards').select('id, status, credits_given, created_at').eq('referrer_id', id),
  ])

  if (!profile) notFound()

  const email = authUser?.user?.email ?? '—'
  const totalScans = qrs?.reduce((s, q) => s + (q.scan_count || 0), 0) ?? 0
  const totalSpent = transactions?.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const qrByType: Record<string, number> = {}
  for (const q of qrs ?? []) qrByType[q.type] = (qrByType[q.type] || 0) + 1

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/utilisateurs" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Utilisateurs
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-semibold">{profile.full_name ?? email}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${PLAN_COLORS[profile.plan] ?? '#94a3b8'}, #FF6A00)` }}>
            {profile.full_name?.[0]?.toUpperCase() ?? email[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-extrabold text-gray-900">{profile.full_name ?? 'Sans nom'}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold capitalize"
                style={{ background: (PLAN_COLORS[profile.plan] ?? '#94a3b8') + '20', color: PLAN_COLORS[profile.plan] ?? '#94a3b8' }}>
                {profile.plan}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{email}</p>
            <p className="text-xs text-gray-300 font-mono mt-0.5">{id}</p>
            <p className="text-xs text-gray-400 mt-1">
              Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-5 flex-shrink-0">
            {[
              { value: (profile.credits ?? 0).toLocaleString('fr-FR'), label: 'crédits', color: 'text-orange-500' },
              { value: qrs?.length ?? 0, label: 'QR codes', color: 'text-blue-500' },
              { value: totalScans.toLocaleString(), label: 'scans', color: 'text-green-500' },
              { value: `${totalSpent.toLocaleString('fr-FR')} F`, label: 'dépensé', color: 'text-purple-500' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Actions */}
        <div className="space-y-4">
          <AdminUserActions userId={id} currentPlan={profile.plan} currentCredits={profile.credits ?? 0} />

          {/* QR type breakdown */}
          {Object.keys(qrByType).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">QR par type</h3>
              <div className="space-y-1.5">
                {Object.entries(qrByType).map(([type, cnt]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-bold text-gray-900">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription */}
          {subscription && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Abonnement</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-bold text-gray-900 capitalize">{subscription.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut</span>
                  <span className={`font-bold ${subscription.status === 'active' ? 'text-green-500' : 'text-orange-400'}`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.period_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expire</span>
                    <span className="text-gray-900">{new Date(subscription.period_end).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Referral */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Parrainage</h3>
            <p className="text-xs text-gray-500">Code : <span className="font-mono text-gray-900">{profile.referral_code ?? '—'}</span></p>
            <p className="text-xs text-gray-500 mt-1">{referrals?.length ?? 0} filleul(s) parrainé(s)</p>
          </div>
        </div>

        {/* Right: QR + Transactions */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">QR Codes ({qrs?.length ?? 0})</h3>
              <span className="text-xs text-gray-400">{totalScans.toLocaleString('fr-FR')} scans</span>
            </div>
            <div className="space-y-2 max-h-52 overflow-auto">
              {(qrs ?? []).map((q) => (
                <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{q.name || q.type}</p>
                    <p className="text-[10px] text-gray-400">{q.type} · {q.mode} · {new Date(q.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{q.scan_count} scans</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      q.status === 'active' ? 'bg-green-100 text-green-600' :
                      q.status === 'paused' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'
                    }`}>{q.status}</span>
                  </div>
                </div>
              ))}
              {!qrs?.length && <p className="text-xs text-gray-400 text-center py-4">Aucun QR code</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Transactions</h3>
            <div className="space-y-2">
              {(transactions ?? []).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{tx.description || 'Paiement'}</p>
                    <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-900">{Number(tx.amount).toLocaleString('fr-FR')} F</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      tx.status === 'success' ? 'bg-green-100 text-green-600' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                    }`}>{tx.status}</span>
                  </div>
                </div>
              ))}
              {!transactions?.length && <p className="text-xs text-gray-400 text-center py-4">Aucune transaction</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
