import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'
import LeadFormClient from './LeadFormClient'
import { buildMeta } from '@/lib/og-meta'
import { getLang } from '@/lib/i18n-server'
import { t, dir } from '@/lib/i18n'
import type { Metadata } from 'next'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'lead').single()
  if (!qr) return buildMeta({ title: 'Formulaire' })
  let f: { title?: string; description?: string } = {}
  try { f = JSON.parse(qr.content) } catch {}
  return buildMeta({ title: f.title || qr.name || 'Formulaire', description: f.description })
}

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lang = await getLang()
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
      <main className="min-h-screen bg-gray-50" lang={lang} dir={dir(lang)}>

        {/* Hero */}
        <div className="relative w-full overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)` }}>
          {typeof form.cover === 'string' && form.cover && (
            <img src={form.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="relative max-w-lg mx-auto px-6 py-10 text-center text-white">
            {typeof form.logo === 'string' && form.logo ? (
              <img src={form.logo} alt="" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg border-2 border-white/30" />
            ) : (
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl bg-white/20">📋</div>
            )}
            <h1 className="text-2xl font-extrabold leading-tight">{(form.title as string) || 'Formulaire'}</h1>
            {typeof form.description === 'string' && form.description && (
              <p className="text-sm opacity-90 leading-relaxed mt-2 max-w-xs mx-auto">{form.description}</p>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6">
          {isClosed ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-3xl mb-2">🔒</p>
              <p className="text-yellow-700 font-semibold">{t(lang, 'form_closed')}</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl p-6 text-center text-gray-500 text-sm">
              Ce formulaire n&apos;a pas encore de champs configurés.
            </div>
          ) : (
            <LeadFormClient
              formId={id}
              fields={fields}
              successMessage={(form.success_message as string) || t(lang, 'form_success')}
              redirectUrl={(form.redirect_url as string) || ''}
              accentColor={accentColor}
              lang={lang}
            />
          )}
        </div>
      </main>
    </>
  )
}
