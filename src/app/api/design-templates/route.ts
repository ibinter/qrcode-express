import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePlan } from '@/lib/plan-guard'

export async function GET() {
  const { ok, user, error } = await requirePlan('essential')
  if (!ok) return error
  const supabase = await createClient()

  const { data, error: dbError } = await supabase
    .from('design_templates')
    .select('id, name, design, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { ok, user, error } = await requirePlan('essential')
  if (!ok) return error
  const supabase = await createClient()

  const { name, design } = await request.json()
  if (!name || !design) return NextResponse.json({ error: 'name et design requis' }, { status: 400 })

  const { data, error: dbError } = await supabase
    .from('design_templates')
    .insert({ user_id: user.id, name, design })
    .select('id, name, design, created_at')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ template: data })
}

export async function DELETE(request: NextRequest) {
  const { ok, user, error } = await requirePlan('essential')
  if (!ok) return error
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { error: dbError } = await supabase
    .from('design_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
