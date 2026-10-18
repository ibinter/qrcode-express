import { NextRequest, NextResponse } from 'next/server'
import bwipjs from 'bwip-js'
import { requirePlan, BARCODE_MIN_PLAN, BARCODE_CREDIT_COST } from '@/lib/plan-guard'

export const instant = false

// GET /api/barcode/svg?type=code128&text=...&download=1 (download=1 triggers auth+credit check)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'code128'
  const text = searchParams.get('text') || ''

  const isDownload = searchParams.get('download') === '1'
  const isPremiumType = !!BARCODE_MIN_PLAN[type]

  // Gate on download — SVG preview can remain free, download requires plan or credits
  if (isDownload) {
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
    let svg = (bwipjs as any).toSVG({
      bcid: type,
      text: text.trim(),
      scale,
      height,
      includetext,
      textxalign: 'center',
      barcolor: color,
      backgroundcolor: bg,
    })

    // For premium types in preview mode: inject watermark text into SVG pixels
    if (isPremiumType && !isDownload) {
      const watermark = `<rect x="0" y="0" width="100%" height="100%" fill="rgba(255,255,255,0.45)"/>` +
        `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" ` +
        `font-family="Arial,sans-serif" font-size="9" font-weight="bold" ` +
        `fill="rgba(80,80,80,0.75)" transform="rotate(-20,0,0)" transform-origin="center">` +
        `APERCU — qrcode-express.com</text>`
      svg = svg.replace('</svg>', watermark + '</svg>')
    }

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
