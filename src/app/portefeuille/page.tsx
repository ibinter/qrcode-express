import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RechargeButton from './RechargeButton'
import { getTranslations } from 'next-intl/server'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const instant = false

const CREDIT_PACKS = [
  { id: 'starter',  tkey: 'pack_test',     credits: 50,   amount: 1000,  popular: false },
  { id: 'boost',    tkey: 'pack_boost',    credits: 200,  amount: 3500,  popular: false },
  { id: 'pro',      tkey: 'pack_pro',      credits: 500,  amount: 7500,  popular: true  },
  { id: 'ultimate', tkey: 'pack_ultimate', credits: 1000, amount: 12000, popular: false },
]

export default async function PortefeuillePage({ searchParams }: { searchParams: Promise<{ recharge?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { recharge } = await searchParams

  const admin = createAdminClient()
  const [{ data: profile }, { data: transactions }] = await Promise.all([
    admin.from('profiles').select('credits, plan').eq('id', user.id).single(),
    admin.from('transactions')
      .select('id, type, amount, description, status, created_at, metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const credits = profile?.credits ?? 0
  const t = await getTranslations('wallet')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profil" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">{t('back')}</Link>
        </div>

        <h1 className="text-2xl font-bold text-[#041B4D] mb-1">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-6">{t('subtitle')}</p>

        {/* Notification recharge */}
        {recharge === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">{t('success_title')}</p>
              <p className="text-sm text-green-600">{t('success_desc')}</p>
            </div>
          </div>
        )}
        {recharge === 'cancelled' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <p className="text-sm text-orange-700 font-medium">{t('cancelled')}</p>
          </div>
        )}

        {/* Solde */}
        <div className="rounded-2xl p-6 mb-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #041B4D 0%, #1a3a7a 60%, #FF6A00 100%)' }}>
          <p className="text-white/70 text-sm font-medium mb-1">{t('balance_label')}</p>
          <p className="text-5xl font-bold tracking-tight">{credits.toLocaleString()}</p>
          <p className="text-white/60 text-sm mt-1">{t('balance_unit')}</p>
          <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
            {t('balance_info')}
          </div>
        </div>

        {/* Packs de recharge */}
        <h2 className="text-base font-bold text-[#041B4D] mb-4">{t('section_recharge')}</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id}
              className={`relative bg-white rounded-2xl border-2 p-4 flex flex-col gap-2 shadow-sm ${
                pack.popular ? 'border-[#FF6A00]' : 'border-gray-100'
              }`}>
              {pack.popular && (
                <span className="absolute -top-2.5 left-4 bg-[#FF6A00] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {t('popular')}
                </span>
              )}
              <p className="text-2xl font-bold text-[#041B4D]">
                {pack.credits >= 1000 ? `${pack.credits / 1000}K` : pack.credits}
                <span className="text-sm font-normal text-gray-500 ml-1">{t('credits_unit')}</span>
              </p>
              <p className="text-xs text-gray-400">{t(pack.tkey as 'pack_test')}</p>
              <p className="text-lg font-bold text-[#FF6A00]">
                {pack.amount.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-500">FCFA</span>
              </p>
              <RechargeButton packId={pack.id} amount={pack.amount} credits={pack.credits} />
            </div>
          ))}
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t('payment_methods')}</p>
          <div className="flex flex-wrap gap-2">
            {[t('wave'), t('orange'), t('mtn'), t('moov')].map((m) => (
              <span key={m} className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-600">{m}</span>
            ))}
          </div>
        </div>

        {/* Historique */}
        <h2 className="text-base font-bold text-[#041B4D] mb-4">{t('history_title')}</h2>
        {!transactions?.length ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 shadow-sm">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">{t('history_empty')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {transactions.map((tx) => {
              const meta = (tx.metadata ?? {}) as Record<string, unknown>
              const isCredits = meta.type === 'credits'
              const icon = isCredits ? '💳' : tx.type === 'credit' ? '➕' : '🧾'
              const statusColor = tx.status === 'success' ? 'text-green-600 bg-green-50' :
                tx.status === 'pending' ? 'text-orange-500 bg-orange-50' : 'text-red-500 bg-red-50'
              const statusLabel = tx.status === 'success' ? t('status_success') : tx.status === 'pending' ? t('status_pending') : t('status_failed')
              return (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[#041B4D] leading-tight">{tx.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isCredits && tx.status === 'success' && (
                          <span className="ml-2 text-green-600 font-semibold">{t('credits_added', { n: String(meta.credits) })}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#041B4D]">{tx.amount.toLocaleString()} FCFA</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{statusLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
  </div>
  )
}
