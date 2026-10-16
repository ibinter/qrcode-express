'use client'
import { useState } from 'react'
import { t, dir } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

interface ReviewData {
  business?: string
  logo?: string
  color?: string
  message?: string
  positive_url?: string
  threshold?: number
  whatsapp?: string
}

export default function ReviewLanding({ review, qrId, lang = 'fr' }: { review: ReviewData; qrId: string; lang?: Lang }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const accent    = review.color      || '#FF6A00'
  const threshold = review.threshold  ?? 4
  const message   = review.message    || 'Votre avis compte beaucoup pour nous !'
  const business  = review.business   || 'Nous'

  function handleStar(n: number) {
    setSelected(n)
    if (n >= threshold && review.positive_url) {
      window.location.href = review.positive_url
    }
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) return

    // If WhatsApp configured, open WhatsApp with feedback
    if (review.whatsapp) {
      const msg = `⭐ Avis ${selected}/5 pour ${business}:\n\n${feedback}`
      window.open(`https://wa.me/${review.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    await fetch(`/api/review/${qrId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: selected, feedback }),
    }).catch(() => {})

    setSubmitted(true)
  }

  const displayRating = hovered || selected

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" lang={lang} dir={dir(lang)}
      style={{ background: `linear-gradient(160deg, #0f0f1a 0%, ${accent}22 60%, #0f0f1a 100%)` }}>
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            {review.logo ? (
              <img src={review.logo} alt={business}
                className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover border-4 border-white/30 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white bg-white/20 border-4 border-white/30">
                {business[0]?.toUpperCase() ?? '⭐'}
              </div>
            )}
            <h1 className="text-white font-extrabold text-xl leading-tight">{business}</h1>
            <p className="text-white/80 text-sm mt-1">{message}</p>
          </div>
        </div>

        <div className="px-6 py-8">
          {!selected ? (
            <>
              {/* Stars selector */}
              <p className="text-center text-sm font-semibold text-gray-600 mb-5">
                {t(lang, 'review_title')}
              </p>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => handleStar(n)}
                    className="text-4xl transition-transform hover:scale-110 active:scale-95"
                    style={{ filter: n <= displayRating ? 'none' : 'grayscale(1) opacity(0.3)' }}
                    aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                {displayRating >= threshold
                  ? `🎉 ${t(lang, 'review_excellent')}`
                  : displayRating > 0
                  ? t(lang, 'review_improve')
                  : t(lang, 'review_stars')}
              </p>
            </>
          ) : selected >= threshold ? (
            /* Positive — redirect already triggered */
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-[#041B4D] text-lg">{t(lang, 'review_thanks')}</p>
              <p className="text-sm text-gray-500 mt-1">{t(lang, 'review_redirect')}</p>
            </div>
          ) : submitted ? (
            /* Negative — submitted */
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🙏</p>
              <p className="font-bold text-[#041B4D] text-lg">{t(lang, 'review_thanks')}</p>
              <p className="text-sm text-gray-500 mt-1">{t(lang, 'review_improve')}</p>
            </div>
          ) : (
            /* Negative — show feedback form */
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="flex justify-center gap-1 mb-2">
                {[1,2,3,4,5].map((n) => (
                  <span key={n} className="text-2xl" style={{ filter: n <= selected ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                ))}
              </div>
              <p className="text-sm text-center text-gray-600 font-medium">
                {t(lang, 'review_improve')}
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t(lang, 'review_placeholder')}
                rows={4}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': accent } as React.CSSProperties}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
                style={{ background: accent }}
              >
                {review.whatsapp ? t(lang, 'review_whatsapp') : t(lang, 'review_submit')}
              </button>
              <button
                type="button"
                onClick={() => setSelected(0)}
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                {t(lang, 'review_change')}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-white/40 mt-6">
        {t(lang, 'powered_by')} <span className="font-semibold" style={{ color: accent }}>QR CODE EXPRESS</span>
      </p>
    </div>
  )
}
