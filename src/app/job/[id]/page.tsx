import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: qr } = await admin.from('qr_codes').select('content, name').eq('id', id).eq('type', 'job').single()
  if (!qr) notFound()

  let d: Record<string, string> = {}
  try { d = JSON.parse(qr.content) } catch {}

  const color = d.color || '#041B4D'

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-3xl text-white p-8 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          {d.logo ? (
            <img src={d.logo} alt="logo" className="w-16 h-16 rounded-2xl object-contain bg-white p-2 mx-auto mb-4" />
          ) : (
            <p className="text-5xl text-center mb-3">💼</p>
          )}
          <h1 className="text-2xl font-extrabold text-center">{d.title}</h1>
          <p className="text-center opacity-80 mt-1">{d.company}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {d.type && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">{d.type}</span>}
            {d.location && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">📍 {d.location}</span>}
            {d.salary_range && <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">💰 {d.salary_range}</span>}
          </div>
        </div>

        {d.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description du poste</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{d.description}</p>
          </div>
        )}

        {d.requirements && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Profil recherché</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{d.requirements}</p>
          </div>
        )}

        <div className="space-y-3">
          {d.apply_url && (
            <a href={d.apply_url} target="_blank" rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm shadow"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              Postuler maintenant
            </a>
          )}
          {d.apply_email && (
            <a href={`mailto:${d.apply_email}?subject=Candidature - ${d.title}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm">
              ✉️ Envoyer ma candidature
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
