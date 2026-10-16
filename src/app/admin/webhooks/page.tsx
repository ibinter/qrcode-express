import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function AdminWebhooks() {
  const admin = createAdminClient()

  const { data: txs } = await admin
    .from('transactions')
    .select('id, user_id, amount, description, status, reference, created_at, metadata')
    .order('created_at', { ascending: false })
    .limit(50)

  const userIds = [...new Set((txs ?? []).map(t => t.user_id).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', userIds)
    for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? p.id.slice(0, 8)
  }

  const successCount = txs?.filter(t => t.status === 'success').length ?? 0
  const pendingCount = txs?.filter(t => t.status === 'pending').length ?? 0
  const failedCount = txs?.filter(t => t.status === 'failed').length ?? 0

  const APIS = [
    { method: 'POST', path: '/api/payment/webhook', desc: 'Webhook GeniusPay (entrée)' },
    { method: 'POST', path: '/api/payment/initiate', desc: 'Initier un paiement' },
    { method: 'POST', path: '/api/qr', desc: 'Créer un QR code' },
    { method: 'GET', path: '/api/qr/[id]', desc: 'Récupérer un QR code' },
    { method: 'POST', path: '/api/qr-ai', desc: 'Générer QR avec IA' },
    { method: 'POST', path: '/api/notify-scan', desc: 'Notifier un scan' },
    { method: 'POST', path: '/api/form/[id]/submit', desc: 'Soumettre un formulaire' },
    { method: 'POST', path: '/api/event/[id]/register', desc: 'S\'inscrire à un événement' },
    { method: 'POST', path: '/api/referral/claim', desc: 'Réclamer parrainage' },
    { method: 'POST', path: '/api/wallet/recharge', desc: 'Recharger portefeuille' },
    { method: 'GET', path: '/api/analytics/overview', desc: 'Analytics utilisateur' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Webhooks & API</h1>
        <p className="text-sm text-gray-500 mt-0.5">Historique des paiements et documentation API</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl mx-auto mb-2">✅</div>
          <p className="text-2xl font-extrabold text-green-500">{successCount}</p>
          <p className="text-xs text-gray-500 mt-1">Webhook réussis</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl mx-auto mb-2">⏳</div>
          <p className="text-2xl font-extrabold text-yellow-500">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">En attente</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl mx-auto mb-2">❌</div>
          <p className="text-2xl font-extrabold text-red-500">{failedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Échoués</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🔔</span>
          <p className="text-xs font-bold text-blue-700">URL Webhook GeniusPay</p>
        </div>
        <p className="text-xs font-mono text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2">
          https://qrcode-express.com/api/payment/webhook
        </p>
        <p className="text-[10px] text-blue-500 mt-1.5">Événements supportés : payment.success · payment.failed · payment.pending</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* API endpoints */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Endpoints API</h2>
          <div className="space-y-2">
            {APIS.map((api) => (
              <div key={api.path} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold w-12 text-center flex-shrink-0 ${
                  api.method === 'GET' ? 'bg-blue-100 text-blue-600' :
                  api.method === 'POST' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>{api.method}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-gray-600 truncate">{api.path}</p>
                  <p className="text-[10px] text-gray-400">{api.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent events */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Événements récents (50 derniers)</h2>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[10px]">Date</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[10px]">User</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[10px]">Montant</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[10px]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {(txs ?? []).map((tx, i) => (
                  <tr key={tx.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-3 py-2 text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-3 py-2">
                      <a href={`/admin/utilisateurs/${tx.user_id}`} className="text-[10px] text-orange-500 hover:underline">
                        {nameMap[tx.user_id] ?? tx.user_id?.slice(0, 6) ?? '—'}
                      </a>
                    </td>
                    <td className="px-3 py-2 font-bold text-gray-900">{Number(tx.amount).toLocaleString('fr-FR')} F</td>
                    <td className="px-3 py-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        tx.status === 'success' ? 'bg-green-100 text-green-600' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
