import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
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
