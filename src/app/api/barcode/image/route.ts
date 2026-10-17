import { NextRequest, NextResponse } from 'next/server'
import bwipjs from 'bwip-js'

export const instant = false

// GET /api/barcode/image?type=ean13&text=5901234123457&color=000000&bg=ffffff&height=15&scale=3
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'code128'
  const text = searchParams.get('text') || '0000000000000'
  const color = (searchParams.get('color') || '000000').replace('#', '')
  const bg = (searchParams.get('bg') || 'ffffff').replace('#', '')
  const height = Math.min(Number(searchParams.get('height') || 15), 60)
  const scale = Math.min(Number(searchParams.get('scale') || 3), 8)
  const includetext = searchParams.get('includetext') !== 'false'

  if (!text.trim()) {
    return NextResponse.json({ error: 'Texte requis' }, { status: 400 })
  }

  try {
    const png = await bwipjs.toBuffer({
      bcid: type,
      text: text.trim(),
      scale,
      height,
      includetext,
      textxalign: 'center',
      barcolor: color,
      backgroundcolor: bg,
    })

    return new NextResponse(png as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur génération'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
