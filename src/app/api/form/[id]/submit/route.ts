import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await req.json()

  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, status, design')
    .eq('id', id)
    .eq('type', 'lead')
    .single()

  if (!qr || qr.status === 'archived') {
    return NextResponse.json({ error: 'Formulaire introuvable' }, { status: 404 })
  }
  if (qr.status === 'paused') {
    return NextResponse.json({ error: 'Formulaire fermé' }, { status: 409 })
  }

  // Validate required fields
  let form: Record<string, unknown> = {}
  try { form = JSON.parse(qr.content || '{}') } catch {}

  type FormField = { id: string; required: boolean; label: string }
  const fields: FormField[] = Array.isArray(form.fields) ? form.fields as FormField[] : []
  for (const field of fields) {
    if (field.required && !String(data[field.id] || '').trim()) {
      return NextResponse.json({ error: `Le champ "${field.label}" est obligatoire` }, { status: 400 })
    }
  }

  const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null

  const { error } = await admin.from('lead_submissions').insert({
    form_id: id,
    data,
    ip_country: country,
  })

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
  }

  // Notify via WhatsApp if configured
  const whatsapp = form.whatsapp as string | undefined
  if (whatsapp) {
    const summary = fields
      .map((f) => `${f.label}: ${String(data[f.id] || '-')}`)
      .join('\n')
    const msg = encodeURIComponent(`📋 Nouvelle soumission — ${form.title || 'Formulaire'}\n\n${summary}`)
    // We return the WhatsApp URL in the response so the client can optionally open it
    return NextResponse.json({ ok: true, whatsapp_url: `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${msg}` })
  }

  return NextResponse.json({ ok: true })
}
