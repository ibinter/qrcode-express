import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QRDashboardCards from '@/components/dashboard/QRDashboardCards'

export const instant = false

const TYPE_ICONS: Record<string, string> = {
  url: '🔗', whatsapp: '💬', vcard: '👤', wifi: '📶', text: '📝',
  email: '✉️', phone: '📞', sms: '💬', pdf: '📄', app: '📲',
  menu: '🍽️', coupon: '🎫', biolink: '🔗', social: '📱', location: '📍',
}

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
    .limit(50)

  const totalScans = qrs?.reduce((sum, q) => sum + (q.scan_count || 0), 0) ?? 0
  const dynamicCount = qrs?.filter((q) => q.mode === 'dynamic').length ?? 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#041B4D]">Mes QR codes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
          >
            + Créer un QR
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'QR codes', value: qrs?.length ?? 0, icon: '📱' },
            { label: 'Scans total', value: totalScans, icon: '📊' },
            { label: 'Dynamiques', value: dynamicCount, icon: '⚡' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-3xl font-bold text-[#041B4D]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* QR list */}
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
          <QRDashboardCards qrs={qrs} typeIcons={TYPE_ICONS} />
        )}
      </div>
    </main>
  )
}
