import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePlan } from '@/lib/plan-guard'
import QRCode from 'qrcode'
import JSZip from 'jszip'

interface BulkRow {
  name: string
  content: string
  type: string
}

const DEFAULT_DESIGN = {
  fgColor: '#041B4D',
  bgColor: '#ffffff',
  moduleStyle: 'squares',
  eyeStyle: 'square',
  frameStyle: 'none',
  errorCorrection: 'M',
}

export async function POST(request: NextRequest) {
  const { rows } = await request.json() as { rows: BulkRow[] }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Aucune donnée' }, { status: 400 })
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 QR codes par import' }, { status: 400 })
  }

  // 1 crédit par tranche de 10 QR si plan < Business
  const creditCost = Math.ceil(rows.length / 10)
  const { ok, user, usedCredits, error } = await requirePlan('business', creditCost)
  if (!ok) return error

  // Pro users are limited to 100 QR per bulk import
  if (!usedCredits && user.plan === 'pro' && rows.length > 100) {
    return NextResponse.json({ error: 'Plan Pro limité à 100 QR par import. Passez en Business ou utilisez des crédits.' }, { status: 403 })
  }

  const admin = createAdminClient()
  const zip = new JSZip()
  const folder = zip.folder('qrcodes')!
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row.content?.trim()) continue

    try {
      // Insert QR record
      const { data: qr } = await admin.from('qr_codes').insert({
        user_id: user.id,
        type: row.type || 'url',
        mode: 'static',
        content: row.content.trim(),
        name: row.name || `QR ${i + 1}`,
        design: DEFAULT_DESIGN,
        status: 'active',
        scan_count: 0,
      }).select('id').single()

      // Generate QR PNG
      const pngBuffer = await QRCode.toBuffer(row.content.trim(), {
        type: 'png',
        width: 512,
        margin: 2,
        color: { dark: '#041B4D', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })

      const safeName = (row.name || `qr-${i + 1}`).replace(/[^a-z0-9\-_]/gi, '_').toLowerCase()
      folder.file(`${String(i + 1).padStart(3, '0')}_${safeName}.png`, pngBuffer)
    } catch (e: any) {
      errors.push(`Ligne ${i + 2}: ${e.message}`)
    }
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="qrcodes-bulk.zip"`,
    },
  })
}
