import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('qr_codes')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { content, name, status, fallback_url, utm } = body
  if (!content && !name && !status && fallback_url === undefined && utm === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data: existing } = await supabase.from('qr_codes').select('mode, content, design').eq('id', id).eq('user_id', user.id).single()

  const patch: Record<string, unknown> = {}
  if (content) patch.content = content
  if (name) patch.name = name
  if (status) patch.status = status

  // fallback_url and utm stored in design JSONB
  if (fallback_url !== undefined || utm !== undefined) {
    const currentDesign = (existing?.design || {}) as Record<string, unknown>
    patch.design = {
      ...currentDesign,
      ...(fallback_url !== undefined ? { fallback_url: fallback_url || null } : {}),
      ...(utm !== undefined ? { utm: utm || null } : {}),
    }
  }

  const { error } = await supabase
    .from('qr_codes')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Track destination change for dynamic QRs
  if (content && existing?.mode === 'dynamic' && existing.content !== content) {
    await supabase.from('qr_destinations').update({ is_active: false }).eq('qr_id', id)
    await supabase.from('qr_destinations').insert({ qr_id: id, destination: content, is_active: true, set_by: user.id })
  }

  return NextResponse.json({ ok: true })
}
