'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

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
  const questions = (survey.questions as Question[]) || []

  if (submitted) return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <p className="text-6xl">🎉</p>
        <h1 className="text-2xl font-extrabold text-[#041B4D]">Merci !</h1>
        <p className="text-gray-600">{(survey.success_message as string) || 'Vos réponses ont bien été enregistrées.'}</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white text-center p-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <p className="text-4xl mb-2">📊</p>
          <h1 className="text-2xl font-extrabold">{survey.title as string}</h1>
          {survey.description && <p className="text-sm opacity-80 mt-1">{survey.description as string}</p>}
        </div>

        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-semibold text-[#041B4D] mb-3">{q.text}</p>
            {q.type === 'text' && (
              <textarea className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2" rows={3}
                style={{ '--tw-ring-color': color } as React.CSSProperties}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
            )}
            {(q.type === 'single' || q.type === 'yesno') && (
              <div className="space-y-2">
                {(q.type === 'yesno' ? ['Oui', 'Non'] : (q.options || [])).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50">
                    <input type="radio" name={q.id} value={opt} className="accent-current"
                      style={{ accentColor: color }}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'multiple' && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50">
                    <input type="checkbox" value={opt} style={{ accentColor: color }}
                      onChange={(e) => {
                        const prev = (answers[q.id] as string[]) || []
                        setAnswers({ ...answers, [q.id]: e.target.checked ? [...prev, opt] : prev.filter((v) => v !== opt) })
                      }} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'rating' && (
              <div className="flex gap-2 justify-center mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setAnswers({ ...answers, [q.id]: n })}
                    className="w-10 h-10 rounded-xl text-sm font-bold border transition-all"
                    style={(answers[q.id] as number) === n ? { background: color, color: '#fff', borderColor: color } : { borderColor: '#e5e7eb' }}>
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
