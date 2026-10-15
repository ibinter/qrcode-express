import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export const instant = false

const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📷', tiktok: '🎵', facebook: '👤', twitter: '🐦', x: '🐦',
  linkedin: '💼', youtube: '▶️', whatsapp: '💬', website: '🌐',
  snapchat: '👻', pinterest: '📌', telegram: '✈️', autre: '🔗',
}

interface BioLink { label: string; url: string; network?: string }
interface BioData { name: string; bio?: string; avatar?: string; color?: string; links: BioLink[] }

export default async function BioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, status')
    .eq('id', id)
    .eq('type', 'biolink')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let bio: BioData = { name: '', links: [] }
  try { bio = JSON.parse(qr.content) } catch {}

  const accent = bio.color || '#FF6A00'

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        {/* Profile */}
        <div className="text-center mb-6">
          {bio.avatar ? (
            <img src={bio.avatar} alt={bio.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-white shadow" />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white shadow"
              style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
              {bio.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h1 className="text-xl font-bold text-[#041B4D]">{bio.name}</h1>
          {bio.bio && <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{bio.bio}</p>}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {bio.links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow font-semibold text-[#041B4D] text-sm">
              <span className="text-xl">{SOCIAL_ICONS[link.network?.toLowerCase() || 'autre'] || '🔗'}</span>
              {link.label}
              <span className="ml-auto text-gray-300">→</span>
            </a>
          ))}
          {!bio.links.length && (
            <p className="text-center text-gray-400 py-4">Aucun lien ajouté</p>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 pt-4">
          Propulsé par <span className="font-semibold" style={{ color: accent }}>QR CODE EXPRESS</span>
        </p>
      </div>
    </main>
  )
}
