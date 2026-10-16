'use client'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  paymentStatus?: 'success' | 'cancelled'
  plan: string
  credits: number
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit', essential: 'Essentiel', pro: 'Pro',
  business: 'Business', agency: 'Agency', enterprise: 'Enterprise',
}

export default function DashboardBanner({ paymentStatus, plan, credits }: Props) {
  const [dismissed, setDismissed] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 space-y-3">
      {/* Payment status notification */}
      {!dismissed && paymentStatus === 'success' && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-bold text-green-800">Paiement réussi !</p>
              <p className="text-xs text-green-700">Votre abonnement ou recharge a été activé avec succès.</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-green-600 hover:text-green-800 text-lg leading-none">×</button>
        </div>
      )}
      {!dismissed && paymentStatus === 'cancelled' && (
        <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-semibold text-yellow-800">Paiement annulé. Vous pouvez réessayer depuis <Link href="/#pricing" className="underline">les plans</Link>.</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-yellow-600 hover:text-yellow-800 text-lg leading-none">×</button>
        </div>
      )}

      {/* Plan + credits bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏷️</span>
            <span className="text-xs font-semibold text-gray-500">Plan</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
              plan === 'pro' ? 'bg-blue-100 text-blue-700' :
              plan === 'business' || plan === 'agency' || plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
              plan === 'essential' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>{PLAN_LABELS[plan] ?? plan}</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💰</span>
            <span className="text-xs font-semibold text-gray-500">Crédits</span>
            <span className="text-xs font-bold text-[#FF6A00] ml-1">{credits.toLocaleString('fr-FR')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(plan === 'free' || plan === 'essential') && (
            <Link href="/#pricing" className="text-xs font-bold text-white bg-[#FF6A00] px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Passer Pro →
            </Link>
          )}
          <Link href="/portefeuille" className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
            + Crédits
          </Link>
        </div>
      </div>
    </div>
  )
}
