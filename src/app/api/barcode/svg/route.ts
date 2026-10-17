import { NextRequest, NextResponse } from 'next/server'
import bwipjs from 'bwip-js'

export const instant = false

// GET /api/barcode/svg?type=code128&text=ABC&color=000000&bg=ffffff&height=15&scale=3
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'code128'
  const text = searchParams.get('text') || ''
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
