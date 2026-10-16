import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getIp } from '@/lib/rate-limit'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function POST(request: NextRequest) {
  // 30 uploads per IP per hour
  const { ok } = rateLimit(`upload:${getIp(request)}`, 30, 60 * 60 * 1000)
  if (!ok) return NextResponse.json({ error: 'Trop d\'uploads. Réessayez dans une heure.' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file || !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG, WebP, GIF ou SVG.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image trop volumineuse (max 5 Mo)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${user.id}/${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()

  // Validate by magic bytes (not just Content-Type header which is spoofable)
  const magic = new Uint8Array(bytes.slice(0, 8))
  const isJpeg = magic[0] === 0xFF && magic[1] === 0xD8
  const isPng  = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47
  const isWebp = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46
  const isGif  = magic[0] === 0x47 && magic[1] === 0x49 && magic[2] === 0x46
  // SVG: text-based, check for <svg tag in first 256 bytes
  const isSvg  = file.type === 'image/svg+xml' && new TextDecoder().decode(bytes.slice(0, 256)).toLowerCase().includes('<svg')
  if (!isJpeg && !isPng && !isWebp && !isGif && !isSvg) {
    return NextResponse.json({ error: 'Contenu du fichier invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin.storage
    .from('qr-images')
    .upload(filename, bytes, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: 'Erreur upload: ' + error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage.from('qr-images').getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl, path: data.path })
}
