import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RechargeButton from './RechargeButton'

export const instant = false

const CREDIT_PACKS = [
  { id: 'starter',  credits: 50,   amount: 1000,  popular: false, description: 'Idéal pour tester' },
  { id: 'boost',    credits: 200,  amount: 3500,  popular: false, description: '17,5 FCFA / crédit' },
  { id: 'pro',      credits: 500,  amount: 7500,  popular: true,  description: '15 FCFA / crédit' },
  { id: 'ultimate', credits: 1000, amount: 12000, popular: false, description: '12 FCFA / crédit' },
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profil" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">← Profil</Link>
        </div>

        <h1 className="text-2xl font-bold text-[#041B4D] mb-1">Mon portefeuille</h1>
        <p className="text-sm text-gray-500 mb-6">Rechargez vos crédits pour créer des QR codes dynamiques</p>

        {/* Notification recharge */}
        {recharge === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Recharge réussie !</p>
              <p className="text-sm text-green-600">Vos crédits ont été ajoutés à votre solde.</p>
            </div>
          </div>
        )}
        {recharge === 'cancelled' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <p className="text-sm text-orange-700 font-medium">Paiement annulé. Votre solde n'a pas changé.</p>
          </div>
        )}

        {/* Solde */}
        <div className="rounded-2xl p-6 mb-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #041B4D 0%, #1a3a7a 60%, #FF6A00 100%)' }}>
          <p className="text-white/70 text-sm font-medium mb-1">Solde disponible</p>
          <p className="text-5xl font-bold tracking-tight">{credits.toLocaleString('fr-FR')}</p>
          <p className="text-white/60 text-sm mt-1">crédits</p>
          <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
            1 crédit = 1 QR code dynamique créé · Valable sans expiration
          </div>
        </div>

        {/* Packs de recharge */}
        <h2 className="text-base font-bold text-[#041B4D] mb-4">Recharger mes crédits</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id}
              className={`relative bg-white rounded-2xl border-2 p-4 flex flex-col gap-2 shadow-sm ${
                pack.popular ? 'border-[#FF6A00]' : 'border-gray-100'
              }`}>
              {pack.popular && (
                <span className="absolute -top-2.5 left-4 bg-[#FF6A00] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Populaire
                </span>
              )}
              <p className="text-2xl font-bold text-[#041B4D]">
                {pack.credits >= 1000 ? `${pack.credits / 1000}K` : pack.credits}
                <span className="text-sm font-normal text-gray-500 ml-1">crédits</span>
              </p>
              <p className="text-xs text-gray-400">{pack.description}</p>
              <p className="text-lg font-bold text-[#FF6A00]">
                {pack.amount.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-500">FCFA</span>
              </p>
              <RechargeButton packId={pack.id} amount={pack.amount} credits={pack.credits} />
            </div>
          ))}
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Méthodes acceptées</p>
          <div className="flex flex-wrap gap-2">
            {['Wave CI 🌊', 'Orange Money 🟠', 'MTN MoMo 🟡', 'Moov Money 💙'].map((m) => (
              <span key={m} className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-600">{m}</span>
            ))}
          </div>
        </div>

        {/* Historique */}
        <h2 className="text-base font-bold text-[#041B4D] mb-4">Historique des transactions</h2>
        {!transactions?.length ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 shadow-sm">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">Aucune transaction pour l'instant</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {transactions.map((tx) => {
              const meta = (tx.metadata ?? {}) as Record<string, unknown>
              const isCredits = meta.type === 'credits'
              const icon = isCredits ? '💳' : tx.type === 'credit' ? '➕' : '🧾'
              const statusColor = tx.status === 'success' ? 'text-green-600 bg-green-50' :
                tx.status === 'pending' ? 'text-orange-500 bg-orange-50' : 'text-red-500 bg-red-50'
              const statusLabel = tx.status === 'success' ? 'Réussi' : tx.status === 'pending' ? 'En attente' : 'Échoué'
              return (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[#041B4D] leading-tight">{tx.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isCredits && tx.status === 'success' && (
                          <span className="ml-2 text-green-600 font-semibold">+{String(meta.credits)} crédits</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#041B4D]">{tx.amount.toLocaleString('fr-FR')} FCFA</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{statusLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
