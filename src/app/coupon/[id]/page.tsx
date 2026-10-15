import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'

export const instant = false

interface CouponData {
  title: string
  code?: string
  discount?: string
  description?: string
  expires?: string
  brand?: string
}

export default async function CouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status, expires_at, design')
    .eq('id', id)
    .eq('type', 'coupon' as any)
    .single()

  if (!qr || qr.status === 'archived') notFound()

  const isExpired = qr.expires_at && new Date(qr.expires_at) < new Date()

  let coupon: CouponData = { title: 'Bon de réduction' }
  try { coupon = JSON.parse(qr.content) } catch {}
  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#041B4D] to-[#0a2d7a] flex items-center justify-center px-4">
      <PixelSnippets pixels={pixels} />
      <div className="w-full max-w-sm">
        {/* Coupon card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Top */}
          <div className="bg-gradient-to-r from-[#FF6A00] to-[#ee5a24] px-6 py-8 text-center text-white">
            {coupon.brand && <p className="text-sm font-semibold opacity-90 mb-1">{coupon.brand}</p>}
            <h1 className="text-2xl font-extrabold">{coupon.title}</h1>
            {coupon.discount && (
              <div className="mt-3 inline-block bg-white/20 backdrop-blur rounded-xl px-5 py-2">
                <span className="text-4xl font-black">{coupon.discount}</span>
              </div>
            )}
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-4 py-3">
            <div className="w-5 h-5 rounded-full bg-gray-100 -ml-7" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
            <div className="w-5 h-5 rounded-full bg-gray-100 -mr-7" />
          </div>

          {/* Code */}
          <div className="px-6 pb-6 text-center space-y-4">
            {coupon.description && <p className="text-sm text-gray-600">{coupon.description}</p>}

            {coupon.code && (
              <div className="bg-gray-50 border-2 border-dashed border-[#FF6A00] rounded-xl py-3 px-4">
                <p className="text-xs text-gray-400 mb-1">Code promo</p>
                <p className="text-2xl font-black tracking-widest text-[#041B4D]">{coupon.code}</p>
              </div>
            )}

            {coupon.expires && (
              <p className={`text-xs ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {isExpired ? '⚠️ Coupon expiré' : `Valable jusqu\'au ${coupon.expires}`}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-blue-300 mt-4">
          Propulsé par <span className="text-[#FF6A00] font-semibold">QR CODE EXPRESS</span>
        </p>
      </div>
    </main>
  )
}
