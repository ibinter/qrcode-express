import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { requirePlan } from '@/lib/plan-guard'

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN

// Replicate model: zylim0702/qr_code_controlnet
const MODEL_VERSION = '628e604e13cc966c82f5be740cde28e3d16e9c59f6de37b4e5a6b7d65b9c05de'

const STYLE_PRESETS: Record<string, string> = {
  nature: 'lush green forest, trees, sunlight through leaves, photorealistic, 8k',
  city: 'modern city skyline at night, neon lights, cyberpunk, ultra detailed',
  abstract: 'abstract art, colorful geometric shapes, vibrant colors, digital art',
  vintage: 'vintage retro poster style, warm colors, aged paper texture',
  watercolor: 'watercolor painting, soft colors, artistic brush strokes',
  space: 'galaxy, stars, nebula, cosmic space, deep universe, photorealistic',
  food: 'delicious gourmet food photography, professional lighting, restaurant style',
  fashion: 'luxury fashion editorial, high end boutique, elegant style',
}

// 5 crédits si plan < Pro
export async function POST(request: NextRequest) {
  const { ok, user, error } = await requirePlan('pro', 20)
  if (!ok) return error

  if (!REPLICATE_TOKEN) {
    return NextResponse.json({ error: 'Service IA non configuré' }, { status: 503 })
  }

  const { content, prompt, style, fgColor = '#000000', bgColor = '#ffffff' } = await request.json()

  if (!content) return NextResponse.json({ error: 'Contenu QR requis' }, { status: 400 })

  // Generate base QR code as data URL (high error correction for IA overlay)
  const qrDataUrl = await QRCode.toDataURL(content, {
    width: 768,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: fgColor, light: bgColor },
  })

  // Build prompt
  const stylePrompt = style ? (STYLE_PRESETS[style] || style) : (prompt || 'beautiful landscape, vibrant colors, professional photography')
  const fullPrompt = `${stylePrompt}, high quality, detailed`

  // Start Replicate prediction
  const startRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        prompt: fullPrompt,
        qr_code_content: content,
        image: qrDataUrl,
        num_inference_steps: 40,
        guidance_scale: 7.5,
        controlnet_conditioning_scale: 1.5,
        seed: Math.floor(Math.random() * 1000000),
        negative_prompt: 'ugly, blurry, low quality, distorted, nsfw',
      },
    }),
  })

  if (!startRes.ok) {
    const err = await startRes.text()
    return NextResponse.json({ error: `Replicate: ${err}` }, { status: 500 })
  }

  const prediction = await startRes.json()

  // Poll until done (max 120s)
  let result = prediction
  for (let i = 0; i < 60; i++) {
    if (result.status === 'succeeded') break
    if (result.status === 'failed' || result.status === 'canceled') {
      return NextResponse.json({ error: 'Génération échouée' }, { status: 500 })
    }
    await new Promise(r => setTimeout(r, 2000))
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    })
    result = await pollRes.json()
  }

  if (result.status !== 'succeeded' || !result.output) {
    return NextResponse.json({ error: 'Timeout — réessayez' }, { status: 504 })
  }

  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output

  return NextResponse.json({ imageUrl, predictionId: prediction.id })
}
