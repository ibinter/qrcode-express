import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import LeadFormClient from './LeadFormClient'

export const instant = false

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, status, design, name')
    .eq('id', id)
    .eq('type', 'lead')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let form: Record<string, unknown> = {}
  try { form = JSON.parse(qr.content || '{}') } catch {}

  const pixels = (qr.design as Record<string, unknown>)?.pixels as Record<string, string> | undefined
  const accentColor = (form.color as string) || '#7C3AED'
  const isClosed = qr.status === 'paused'

  type FormField = { id: string; type: string; label: string; required: boolean; options?: string }
  const fields: FormField[] = Array.isArray(form.fields) ? form.fields as FormField[] : []

  return (
    <>
      <PixelSnippets pixels={pixels} />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}>
          {form.logo && (
            <img src={form.logo as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="relative max-w-lg mx-auto px-6 py-10 text-center text-white">
            <p className="text-4xl mb-3">📋</p>
            <h1 className="text-2xl font-bold leading-tight mb-2">{(form.title as string) || 'Formulaire'}</h1>
            {form.description && (
              <p className="text-sm opacity-90 leading-relaxed">{form.description as string}</p>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8">
          {isClosed ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-yellow-700 font-semibold">Ce formulaire est temporairement fermé.</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl p-6 text-center text-gray-500 text-sm">
              Ce formulaire n&apos;a pas encore de champs configurés.
            </div>
          ) : (
            <LeadFormClient
              formId={id}
              fields={fields}
              successMessage={(form.success_message as string) || 'Merci ! Votre réponse a bien été enregistrée.'}
              redirectUrl={(form.redirect_url as string) || ''}
              accentColor={accentColor}
            />
          )}
        </div>
      </main>
    </>
  )
}
