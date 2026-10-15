'use client'
import { useState } from 'react'

interface ReviewData {
  business?: string
  logo?: string
  color?: string
  message?: string
  positive_url?: string
  threshold?: number
  whatsapp?: string
}

export default function ReviewLanding({ review, qrId }: { review: ReviewData; qrId: string }) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 text-center" style={{ background: accent }}>
          {review.logo ? (
            <img src={review.logo} alt={business}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white/30 shadow" />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white bg-white/20 border-4 border-white/30">
              {business[0]?.toUpperCase() ?? '⭐'}
            </div>
          )}
          <h1 className="text-white font-bold text-xl leading-tight">{business}</h1>
          <p className="text-white/80 text-sm mt-1">{message}</p>
        </div>

        <div className="px-6 py-8">
          {!selected ? (
            <>
              {/* Stars selector */}
              <p className="text-center text-sm font-semibold text-gray-600 mb-5">
                Comment évaluez-vous votre expérience ?
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
                  ? `🎉 Excellent ! Vous serez redirigé vers notre page d'avis`
                  : displayRating > 0
                  ? 'Votre avis nous aidera à nous améliorer'
                  : 'Touchez une étoile pour noter'}
              </p>
            </>
          ) : selected >= threshold ? (
            /* Positive — redirect already triggered */
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-[#041B4D] text-lg">Merci !</p>
              <p className="text-sm text-gray-500 mt-1">Redirection vers la page d'avis…</p>
            </div>
          ) : submitted ? (
            /* Negative — submitted */
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🙏</p>
              <p className="font-bold text-[#041B4D] text-lg">Merci pour votre retour !</p>
              <p className="text-sm text-gray-500 mt-1">Votre avis nous aide à nous améliorer.</p>
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
                Aidez-nous à nous améliorer
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Décrivez votre expérience…"
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
                {review.whatsapp ? '💬 Envoyer via WhatsApp' : 'Envoyer mon avis'}
              </button>
              <button
                type="button"
                onClick={() => setSelected(0)}
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                ← Rechoisir ma note
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Propulsé par <span className="font-semibold text-[#041B4D]">QR CODE EXPRESS</span>
      </p>
    </div>
  )
}
