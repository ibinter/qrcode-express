'use client'
import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

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

export default function ReferralDashboard({
  referralCode,
  referralLink,
  totalEarned,
  totalReferrals,
  confirmedReferrals,
  currentCredits,
  rewards,
  referrerCredits,
  referredCredits,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!showQR || !qrRef.current) return
    if (qrInstance.current) {
      qrInstance.current.update({ data: referralLink })
      return
    }
    qrInstance.current = new QRCodeStyling({
      width: 200,
      height: 200,
      data: referralLink,
      dotsOptions: { type: 'dots', color: '#041B4D' },
      cornersSquareOptions: { type: 'extra-rounded', color: '#FF6A00' },
      cornersDotOptions: { type: 'dot', color: '#FF6A00' },
      backgroundOptions: { color: '#FFFFFF' },
      imageOptions: { crossOrigin: 'anonymous', margin: 4 },
    })
    qrInstance.current.append(qrRef.current)
  }, [showQR, referralLink])

  function downloadQR() {
    qrInstance.current?.download({ name: 'parrainage-qr', extension: 'png' })
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = referralLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '👥', label: 'Parrainés', value: totalReferrals },
          { icon: '✅', label: 'Confirmés', value: confirmedReferrals },
          { icon: '💰', label: 'Crédits gagnés', value: totalEarned },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold text-[#041B4D]">{s.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-1">Votre lien de parrainage</h2>
        <p className="text-xs text-gray-500 mb-3">
          Code : <span className="font-mono font-semibold text-[#FF6A00]">{referralCode}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 font-mono truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-[#FF6A00] text-white hover:opacity-90'
            }`}
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Rejoins QR CODE EXPRESS avec mon lien et gagne ${referredCredits} crédits offerts ! ${referralLink}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            💬 WhatsApp
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Je gagne des crédits sur @QRCodeExpress ! Inscris-toi avec mon lien et reçois ${referredCredits} crédits offerts`)}&url=${encodeURIComponent(referralLink)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1DA1F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            𝕏 Twitter
          </a>
          <a
            href={`sms:?body=${encodeURIComponent(`Rejoins QR CODE EXPRESS et gagne ${referredCredits} crédits : ${referralLink}`)}`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            📱 SMS
          </a>
          <a
            href={`mailto:?subject=Rejoins QR CODE EXPRESS&body=${encodeURIComponent(`Je t'invite à rejoindre QR CODE EXPRESS et tu reçois ${referredCredits} crédits offerts !\n\n${referralLink}`)}`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
          >
            ✉️ Email
          </a>
        </div>

        {/* QR code toggle */}
        <button
          onClick={() => setShowQR(v => !v)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {showQR ? '▲ Masquer le QR code' : '▦ Afficher mon QR code de parrainage'}
        </button>

        {showQR && (
          <div className="mt-3 flex flex-col items-center gap-3 py-4 border border-dashed border-orange-200 rounded-2xl bg-orange-50">
            <p className="text-xs text-gray-500 text-center">Scannez ce code pour rejoindre via mon lien</p>
            <div ref={qrRef} className="rounded-xl overflow-hidden shadow-sm" />
            <button
              onClick={downloadQR}
              className="px-4 py-2 rounded-xl bg-[#FF6A00] text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              ⬇ Télécharger le QR code
            </button>
          </div>
        )}
      </div>

      {/* Progression vers prochaine récompense */}
      {(() => {
        const MILESTONES = [1, 3, 5, 10, 20, 50]
        const next = MILESTONES.find(m => m > confirmedReferrals) ?? null
        if (next === null) return null
        const prev = MILESTONES[MILESTONES.indexOf(next) - 1] ?? 0
        const progress = next > prev ? Math.round(((confirmedReferrals - prev) / (next - prev)) * 100) : 100
        const bonusCredits = next * referrerCredits
        return (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#041B4D]">🏆 Prochain palier</h2>
              <span className="text-xs text-orange-500 font-bold">{confirmedReferrals}/{next} filleuls</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: 'linear-gradient(to right, #FF6A00, #f97316)' }} />
            </div>
            <p className="text-xs text-gray-500">
              Plus que <strong>{next - confirmedReferrals} filleul{next - confirmedReferrals > 1 ? 's' : ''}</strong> pour débloquer{' '}
              <strong className="text-orange-500">+{referrerCredits} crédits bonus</strong>
              {next >= 5 && <span className="ml-1 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">🎖️ Badge Champion</span>}
            </p>
          </div>
        )
      })()}

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-3">Comment ça marche ?</h2>
        <div className="space-y-3">
          {[
            { n: '1', text: `Partagez votre lien à vos amis` },
            { n: '2', text: `Ils s'inscrivent et reçoivent ${referredCredits} crédits offerts` },
            { n: '3', text: `Vous gagnez ${referrerCredits} crédits dès confirmation` },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6A00] text-white text-xs font-bold flex items-center justify-center">
                {step.n}
              </span>
              <p className="text-sm text-gray-600 pt-0.5">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards list */}
      {rewards.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-[#041B4D] mb-3">Mes filleuls</h2>
          <div className="space-y-2">
            {rewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    {r.referred_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#041B4D]">{r.referred_name ?? 'Anonyme'}</p>
                    <p className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#FF6A00]">+{r.credits_given} crédits</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{r.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rewards.length === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-sm font-semibold text-gray-600">Aucun filleul pour l'instant</p>
          <p className="text-xs text-gray-400 mt-1">Partagez votre lien pour commencer à gagner des crédits !</p>
        </div>
      )}
    </div>
  )
}
