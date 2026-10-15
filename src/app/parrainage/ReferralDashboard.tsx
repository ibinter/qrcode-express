'use client'
import { useState } from 'react'

interface Reward {
  id: string
  status: string
  credits_given: number
  created_at: string
  referred_name: string | null
}

interface Props {
  referralCode: string
  referralLink: string
  totalEarned: number
  totalReferrals: number
  confirmedReferrals: number
  currentCredits: number
  rewards: Reward[]
  referrerCredits: number
  referredCredits: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: '✅ Confirmé', color: 'text-green-700 bg-green-50' },
  pending:   { label: '⏳ En attente', color: 'text-yellow-700 bg-yellow-50' },
  cancelled: { label: '❌ Annulé', color: 'text-red-700 bg-red-50' },
}

export default function ReferralDashboard({
  referralCode, referralLink, totalEarned, totalReferrals, confirmedReferrals,
  currentCredits, rewards, referrerCredits, referredCredits,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function copyCode() {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(
      `🎁 Rejoins QR CODE EXPRESS et crée des QR codes professionnels !\n\nUtilise mon lien de parrainage pour obtenir ${referredCredits} crédits offerts :\n${referralLink}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '👥', value: totalReferrals, label: 'Filleuls invités' },
          { icon: '✅', value: confirmedReferrals, label: 'Confirmés' },
          { icon: '🪙', value: totalEarned, label: 'Crédits gagnés' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-extrabold text-[#041B4D]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-1">Votre lien de parrainage</h2>
        <p className="text-xs text-gray-500 mb-4">
          Partagez ce lien. Vous gagnez <strong>{referrerCredits} crédits</strong> à chaque inscription confirmée.
        </p>

        {/* Link display */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-3">
          <p className="flex-1 text-xs font-mono text-gray-700 truncate">{referralLink}</p>
          <button onClick={copyLink}
            className="px-3 py-1.5 rounded-lg bg-[#041B4D] text-white text-xs font-bold whitespace-nowrap hover:bg-[#041B4D]/90 transition-colors">
            {copied ? '✅ Copié !' : '📋 Copier'}
          </button>
        </div>

        {/* Code */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gradient-to-r from-[#041B4D] to-[#0a2d6e] rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Code parrainage</p>
              <p className="text-xl font-extrabold text-white tracking-widest">{referralCode}</p>
            </div>
            <button onClick={copyCode}
              className="text-white/80 hover:text-white text-xs font-semibold transition-colors">
              {copiedCode ? '✅' : '📋'}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors">
            <span>📲</span> WhatsApp
          </button>
          <button onClick={copyLink}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors">
            <span>🔗</span> Copier le lien
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-[#FF6A00]/10 to-[#041B4D]/5 rounded-2xl border border-[#FF6A00]/20 p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-3">🎯 Comment ça marche</h2>
        <div className="space-y-3">
          {[
            { step: '1', text: `Partagez votre lien ou code à un ami`, color: 'bg-[#FF6A00]' },
            { step: '2', text: `Votre ami s'inscrit via votre lien`, color: 'bg-[#041B4D]' },
            { step: '3', text: `Il reçoit ${referredCredits} crédits de bienvenue`, color: 'bg-green-500' },
            { step: '4', text: `Vous recevez ${referrerCredits} crédits automatiquement`, color: 'bg-green-500' },
          ].map(({ step, text, color }) => (
            <div key={step} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{step}</span>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral history */}
      {rewards.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-[#041B4D] mb-3">Historique des filleuls</h2>
          <div className="space-y-2">
            {rewards.map((r) => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
              return (
                <div key={r.id} className="flex items-center gap-3 text-xs">
                  <span className="text-lg">👤</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">{r.referred_name || 'Filleul'}</p>
                    <p className="text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
                  {r.status === 'confirmed' && (
                    <span className="text-green-600 font-bold">+{r.credits_given} cr.</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {rewards.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-4xl mb-2">🚀</p>
          <p className="font-semibold text-[#041B4D]">Aucun filleul pour l&apos;instant</p>
          <p className="text-sm text-gray-400 mt-1">Partagez votre lien pour commencer à gagner des crédits !</p>
        </div>
      )}
    </div>
  )
}
