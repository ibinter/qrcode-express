'use client'
import { useState } from 'react'

type FormField = { id: string; type: string; label: string; required: boolean; options?: string }

interface Props {
  formId: string
  fields: FormField[]
  successMessage: string
  redirectUrl: string
  accentColor: string
}

export default function LeadFormClient({ formId, fields, successMessage, redirectUrl, accentColor }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/form/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: values }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Une erreur est survenue.')
      } else {
        setSubmitted(true)
        if (redirectUrl) {
          setTimeout(() => { window.location.href = redirectUrl }, 2000)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
        <p className="text-5xl">✅</p>
        <p className="text-lg font-bold text-[#041B4D]">{successMessage}</p>
        {redirectUrl && <p className="text-xs text-gray-400">Redirection en cours…</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              value={values[field.id] || ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              required={field.required}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          ) : field.type === 'select' ? (
            <select
              value={values[field.id] || ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              required={field.required}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
            >
              <option value="">— Choisissez —</option>
              {(field.options || '').split(',').map((opt) => opt.trim()).filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={values[field.id] || ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              required={field.required}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-opacity"
        style={{ background: accentColor }}
      >
        {loading ? 'Envoi en cours…' : 'Envoyer'}
      </button>
    </form>
  )
}
