'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getThemeTokens, type LandingTheme } from '@/lib/landing-theme'

type Question = { id: string; text: string; type: 'single' | 'multiple' | 'text' | 'rating' | 'yesno'; options?: string[] }

export default function SurveyPage() {
  const params = useParams()
  const id = params.id as string
  const [survey, setSurvey] = useState<Record<string, unknown> | null>(null)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/survey/${id}`)
      .then((r) => r.json())
      .then((d) => { setSurvey(d.survey); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSubmit() {
    await fetch(`/api/survey/${id}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    setSubmitted(true)
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-2xl animate-spin">📊</p></main>
  if (!survey) return <main className="min-h-screen flex items-center justify-center px-4"><div className="text-center"><p className="text-4xl mb-3">😕</p><p className="font-bold text-[#041B4D]">Sondage introuvable</p></div></main>

  const color = (survey.color as string) || '#041B4D'
  const th = getThemeTokens(survey.page_theme as LandingTheme, color)
  const pageStyle = th.isDark
    ? { background: (th as Record<string, unknown>).pageGradient as string || th.pageBg }
    : { background: th.pageBg }
  const questions = (survey.questions as Question[]) || []

  if (submitted) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={pageStyle}>
      <div className="w-full max-w-sm text-center space-y-4">
        <p className="text-6xl">🎉</p>
        <h1 className="text-2xl font-extrabold" style={{ color: th.textPrimary }}>Merci !</h1>
        <p style={{ color: th.textMuted }}>{(survey.success_message as string) || 'Vos réponses ont bien été enregistrées.'}</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4" style={pageStyle}>
      <div className="w-full max-w-sm space-y-4">
        {!!(survey.logo as string) && (
          <img src={survey.logo as string} alt="logo" className="h-12 object-contain mx-auto" />
        )}

        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: th.headerBg as string }}>
          <p className="text-4xl mb-2">📊</p>
          <h1 className="text-2xl font-extrabold" style={{ color: th.accentText }}>{survey.title as string}</h1>
          {!!(survey.description as string) && <p className="text-sm opacity-80 mt-1" style={{ color: th.accentText }}>{survey.description as string}</p>}
        </div>

        {questions.map((q) => (
          <div key={q.id} className="rounded-2xl border p-5" style={{ background: th.cardBg, borderColor: th.cardBorder }}>
            <p className="font-semibold mb-3" style={{ color: th.textPrimary }}>{q.text}</p>
            {q.type === 'text' && (
              <textarea className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: th.cardBorder, background: th.isDark ? 'rgba(255,255,255,0.05)' : '#fff', color: th.textPrimary } as React.CSSProperties}
                rows={3}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
            )}
            {(q.type === 'single' || q.type === 'yesno') && (
              <div className="space-y-2">
                {(q.type === 'yesno' ? ['Oui', 'Non'] : (q.options || [])).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl" style={{ color: th.textPrimary }}>
                    <input type="radio" name={q.id} value={opt} style={{ accentColor: color }}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'multiple' && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl" style={{ color: th.textPrimary }}>
                    <input type="checkbox" value={opt} style={{ accentColor: color }}
                      onChange={(e) => {
                        const prev = (answers[q.id] as string[]) || []
                        setAnswers({ ...answers, [q.id]: e.target.checked ? [...prev, opt] : prev.filter((v) => v !== opt) })
                      }} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'rating' && (
              <div className="flex gap-2 justify-center mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setAnswers({ ...answers, [q.id]: n })}
                    className="w-10 h-10 rounded-xl text-sm font-bold border transition-all"
                    style={(answers[q.id] as number) === n ? { background: color, color: '#fff', borderColor: color } : { borderColor: th.cardBorder, background: 'transparent', color: th.textPrimary }}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <button onClick={handleSubmit}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          Envoyer mes réponses
        </button>
      </div>
    </main>
  )
}
