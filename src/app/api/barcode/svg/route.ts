import { NextRequest, NextResponse } from 'next/server'
import bwipjs from 'bwip-js'
import { requirePlan, BARCODE_MIN_PLAN, BARCODE_CREDIT_COST } from '@/lib/plan-guard'

export const instant = false

// GET /api/barcode/svg?type=code128&text=...&download=1 (download=1 triggers auth+credit check)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'code128'
  const text = searchParams.get('text') || ''

  // Gate on download — SVG preview can remain free, download requires plan or credits
  if (searchParams.get('download') === '1') {
    const minPlan = BARCODE_MIN_PLAN[type]
    if (minPlan) {
      const creditCost = BARCODE_CREDIT_COST[type] ?? 30
      const { ok, error: planError } = await requirePlan(minPlan, creditCost)
      if (!ok) return planError
    }
  }
  const color = (searchParams.get('color') || '000000').replace('#', '')
  const bg = (searchParams.get('bg') || 'ffffff').replace('#', '')
  const height = Math.min(Number(searchParams.get('height') || 15), 60)
  const scale = Math.min(Number(searchParams.get('scale') || 3), 8)
  const includetext = searchParams.get('includetext') !== 'false'

  if (!text.trim()) {
    return NextResponse.json({ error: 'Texte requis' }, { status: 400 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = (bwipjs as any).toSVG({
      bcid: type,
      text: text.trim(),
      scale,
      height,
      includetext,
      textxalign: 'center',
      barcolor: color,
      backgroundcolor: bg,
    })

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur génération SVG'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
