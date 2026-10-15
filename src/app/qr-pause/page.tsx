import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function QRPause({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  let qrName: string | null = null

  if (slug) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('qr_codes')
      .select('name')
      .eq('slug', slug)
      .single()
    if (data) qrName = data.name
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
              style={{ background: 'linear-gradient(135deg, #041B4D, #1a3a7a)' }}>
              ⏸️
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#041B4D] mb-2">QR code en pause</h1>
          {qrName && (
            <p className="text-sm font-semibold text-gray-700 mb-1">« {qrName} »</p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Ce QR code est temporairement désactivé par son propriétaire. Revenez plus tard.
          </p>

          <Link href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
            Créer mon QR code gratuit
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Propulsé par <span className="font-semibold text-[#041B4D]">QR CODE EXPRESS</span>
        </p>
      </div>
    </main>
  )
}
