import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getIp } from '@/lib/rate-limit'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  // 10 PDF uploads per IP per hour
  const { ok } = rateLimit(`pdf:${getIp(request)}`, 10, 60 * 60 * 1000)
  if (!ok) return NextResponse.json({ error: 'Trop d\'uploads. Réessayez dans une heure.' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Fichier PDF requis' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()

  // Validate PDF magic bytes: %PDF
  const magic = new Uint8Array(bytes.slice(0, 4))
  if (!(magic[0] === 0x25 && magic[1] === 0x50 && magic[2] === 0x44 && magic[3] === 0x46)) {
    return NextResponse.json({ error: 'Contenu du fichier invalide' }, { status: 400 })
  }

  const filename = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '_')}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('qr-pdfs')
    .upload(filename, bytes, { contentType: 'application/pdf', upsert: false })

  if (error) {
    return NextResponse.json({ error: 'Erreur upload: ' + error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage.from('qr-pdfs').getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl, path: data.path })
}
