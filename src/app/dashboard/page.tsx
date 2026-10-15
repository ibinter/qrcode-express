import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: qrs } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#041B4D]">Mon espace QR CODE EXPRESS</h1>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
          >
            + Créer un QR
          </Link>
        </div>

        {!qrs?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📱</p>
            <p className="font-semibold text-lg text-gray-600">Aucun QR enregistré</p>
            <p className="text-sm mt-1">Créez votre premier QR code et connectez-vous pour le sauvegarder.</p>
            <Link href="/" className="mt-4 inline-block text-[#FF6A00] font-semibold hover:underline">
              Créer mon premier QR →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrs.map((qr) => (
              <div key={qr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#041B4D] text-sm">{qr.name || `QR ${qr.type}`}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      qr.mode === 'dynamic' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {qr.mode === 'dynamic' ? 'Dynamique' : 'Statique'}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    qr.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {qr.status === 'active' ? 'Actif' : qr.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mb-3">{qr.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>📊 {qr.scan_count} scans</span>
                  <span>{new Date(qr.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
