'use client'
import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('referral')
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
          { icon: '👥', label: t('referred_count'), value: totalReferrals },
          { icon: '✅', label: t('confirmed_count'), value: confirmedReferrals },
          { icon: '💰', label: t('credits_earned'), value: totalEarned },
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
        <h2 className="text-sm font-bold text-[#041B4D] mb-1">{t('your_link')}</h2>
        <p className="text-xs text-gray-500 mb-3">
          {t('code_label')} <span className="font-mono font-semibold text-[#FF6A00]">{referralCode}</span>
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
            {copied ? t('copied') : t('copy')}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${t('whatsapp_text', { n: referredCredits })} ${referralLink}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            💬 WhatsApp
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(t('twitter_text', { n: referredCredits }))}&url=${encodeURIComponent(referralLink)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1DA1F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            𝕏 Twitter
          </a>
          <a
            href={`sms:?body=${encodeURIComponent(`${t('sms_text', { n: referredCredits })} ${referralLink}`)}`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            📱 SMS
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(t('email_subject'))}&body=${encodeURIComponent(`${t('email_body', { n: referredCredits })}\n\n${referralLink}`)}`}
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
          {showQR ? t('hide_qr') : t('show_qr')}
        </button>

        {showQR && (
          <div className="mt-3 flex flex-col items-center gap-3 py-4 border border-dashed border-orange-200 rounded-2xl bg-orange-50">
            <p className="text-xs text-gray-500 text-center">{t('scan_hint')}</p>
            <div ref={qrRef} className="rounded-xl overflow-hidden shadow-sm" />
            <button
              onClick={downloadQR}
              className="px-4 py-2 rounded-xl bg-[#FF6A00] text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {t('download_qr')}
            </button>
          </div>
        )}
      </div>

      {/* Next milestone */}
      {(() => {
        const MILESTONES = [1, 3, 5, 10, 20, 50]
        const next = MILESTONES.find(m => m > confirmedReferrals) ?? null
        if (next === null) return null
        const prev = MILESTONES[MILESTONES.indexOf(next) - 1] ?? 0
        const progress = next > prev ? Math.round(((confirmedReferrals - prev) / (next - prev)) * 100) : 100
        return (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#041B4D]">{t('next_tier')}</h2>
              <span className="text-xs text-orange-500 font-bold">{t('referrals_count', { n: confirmedReferrals, m: next })}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: 'linear-gradient(to right, #FF6A00, #f97316)' }} />
            </div>
            <p className="text-xs text-gray-500">
              {t('remaining', { n: next - confirmedReferrals })}{' '}
              <strong className="text-orange-500">{t('bonus_credits', { n: referrerCredits })}</strong>
              {next >= 5 && <span className="ml-1 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">{t('champion_badge')}</span>}
            </p>
          </div>
        )
      })()}

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-3">{t('how_title')}</h2>
        <div className="space-y-3">
          {[
            { n: '1', text: t('how_1') },
            { n: '2', text: t('how_2', { n: referredCredits }) },
            { n: '3', text: t('how_3', { n: referrerCredits }) },
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
          <h2 className="text-sm font-bold text-[#041B4D] mb-3">{t('my_referrals')}</h2>
          <div className="space-y-2">
            {rewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    {r.referred_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#041B4D]">{r.referred_name ?? t('anonymous')}</p>
                    <p className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#FF6A00]">{t('credits_gained', { n: r.credits_given })}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{r.status === 'confirmed' ? t('confirmed') : t('pending')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rewards.length === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-sm font-semibold text-gray-600">{t('empty')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('empty_sub')}</p>
        </div>
      )}
    </div>
  )
}
