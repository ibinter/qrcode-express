import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const instant = false

export default async function QRExpire({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  let qrName: string | null = null
  let expiresAt: string | null = null
  let maxScans: number | null = null
  let scanCount: number | null = null

  if (slug) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('qr_codes')
      .select('name, expires_at, max_scans, scan_count')
      .eq('slug', slug)
      .single()
    if (data) {
      qrName = data.name
      expiresAt = data.expires_at
      maxScans = data.max_scans
      scanCount = data.scan_count
    }
  }

  const isMaxScans = maxScans && scanCount && scanCount >= maxScans

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
              style={{ background: 'linear-gradient(135deg, #041B4D, #1a3a7a)' }}>
              ⏱️
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#041B4D] mb-2">
            {isMaxScans ? 'Limite de scans atteinte' : 'QR code expiré'}
          </h1>

          {qrName && (
            <p className="text-sm font-semibold text-gray-700 mb-1">« {qrName} »</p>
          )}

          <p className="text-sm text-gray-500 mb-4">
            {isMaxScans
              ? `Ce QR code a atteint sa limite de ${maxScans} scans.`
              : expiresAt
              ? `Ce QR code a expiré le ${new Date(expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`
              : "Ce QR code n'est plus actif."}
          </p>

          {/* Stats */}
          {scanCount !== null && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 inline-flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="text-sm text-gray-600 font-semibold">{scanCount} scan{scanCount !== 1 ? 's' : ''} enregistré{scanCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="space-y-2">
            <Link href="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
              Créer un nouveau QR code
            </Link>
            <Link href="/#pricing"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm border border-[#041B4D]/20 text-[#041B4D] hover:bg-[#041B4D]/5 transition-colors">
              Voir les plans
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Propulsé par <span className="font-semibold text-[#041B4D]">QR CODE EXPRESS</span>
        </p>
      </div>
    </main>
  )
}
