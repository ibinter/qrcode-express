import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  // Verify the QR belongs to this user
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, name, user_id')
    .eq('id', id)
    .eq('type', 'event')
    .single()

  if (!qr) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
  if (qr.user_id !== user.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { data: tickets } = await admin
    .from('tickets')
    .select('code, holder_name, holder_email, status, validated_at, created_at')
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  if (!tickets || tickets.length === 0) {
    return new NextResponse('Aucun inscrit pour cet événement.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const escapeCSV = (val: string | null | undefined) => {
    if (val == null) return ''
    const s = String(val)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const header = ['Code', 'Nom', 'Email', 'Statut', 'Inscrit le', 'Validé le'].join(',')
  const rows = tickets.map(t => [
    escapeCSV(t.code),
    escapeCSV(t.holder_name),
    escapeCSV(t.holder_email),
    escapeCSV(t.status),
    escapeCSV(t.created_at ? new Date(t.created_at).toLocaleString('fr-FR') : ''),
    escapeCSV(t.validated_at ? new Date(t.validated_at).toLocaleString('fr-FR') : ''),
  ].join(','))

  const csv = [header, ...rows].join('\n')
  const filename = `inscrits-${qr.name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || id}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse('﻿' + csv, { // BOM for Excel UTF-8
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
