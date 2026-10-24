import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { requirePlan } from '@/lib/plan-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

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

// Chaque génération coûte ~23 FCFA à IBIG (Replicate, ~0,039 $). Elle est donc limitée :
//  - plan inférieur à « Essentiel » (code interne pro) : 30 crédits par génération ;
//  - plan suffisant : un quota mensuel inclus, puis 30 crédits par génération supplémentaire.
// Codes de plan internes (décalés par rapport aux noms affichés, voir lib/plan-utils.ts).
const AI_CREDIT_COST = 30
const AI_MONTHLY_QUOTA: Record<string, number> = {
  pro: 20,        // affiché « Essentiel »
  business: 60,   // affiché « Pro »
  agency: 150,    // affiché « Business »
  enterprise: 300,
}

function monthStartISO(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString()
}

export async function POST(request: NextRequest) {
  // Service non configuré : on le dit AVANT de débiter quoi que ce soit.
  if (!REPLICATE_TOKEN) {
    return NextResponse.json({ error: 'Service IA momentanément indisponible' }, { status: 503 })
  }

  const { ok, user, usedCredits, error } = await requirePlan('pro', AI_CREDIT_COST)
  if (!ok) return error

  const admin = createAdminClient()

  // Anti-rafale : 6 générations maximum par 10 minutes et par utilisateur.
  if (!rateLimit(`qr-ai:${user.id}`, 6, 10 * 60 * 1000).ok) {
    if (usedCredits) await admin.rpc('add_credits', { user_uuid: user.id, amount: AI_CREDIT_COST })
    return NextResponse.json({ error: 'Trop de générations rapprochées. Patientez quelques minutes.' }, { status: 429 })
  }

  // Quota mensuel inclus dans le plan ; au-delà, chaque génération coûte des crédits.
  let chargedCredits = usedCredits // vrai si des crédits ont été débités pour cette génération
  let usedThisMonth = 0
  const quota = AI_MONTHLY_QUOTA[user.plan] ?? 0
  if (!usedCredits) {
    const { count } = await admin.from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('actor_id', user.id).eq('action', 'qr_ai_generate').gte('created_at', monthStartISO())
    usedThisMonth = count ?? 0
    if (usedThisMonth >= quota) {
      const { data: prof } = await admin.from('profiles').select('credits').eq('id', user.id).single()
      if ((prof?.credits ?? 0) < AI_CREDIT_COST) {
        return NextResponse.json({
          error: `Quota mensuel atteint (${quota} générations IA incluses dans votre plan). Rechargez ${AI_CREDIT_COST} crédits par génération supplémentaire, ou attendez le mois prochain.`,
          quota, usedThisMonth, creditCost: AI_CREDIT_COST, rechargeUrl: '/portefeuille',
        }, { status: 429 })
      }
      await admin.rpc('add_credits', { user_uuid: user.id, amount: -AI_CREDIT_COST })
      chargedCredits = true
    }
  }
  // Une génération qui échoue ne doit coûter ni crédits ni quota.
  const refund = async () => {
    if (chargedCredits) await admin.rpc('add_credits', { user_uuid: user.id, amount: AI_CREDIT_COST })
  }

  const { content, prompt, style, fgColor = '#000000', bgColor = '#ffffff' } = await request.json()

  if (!content) {
    await refund()
    return NextResponse.json({ error: 'Contenu QR requis' }, { status: 400 })
  }

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
    console.error('[qr-ai] Replicate HTTP', startRes.status, (await startRes.text().catch(() => '')).slice(0, 200))
    await refund()
    return NextResponse.json({ error: 'Génération IA indisponible pour le moment. Réessayez plus tard.' }, { status: 502 })
  }

  const prediction = await startRes.json()

  // Poll until done (max 120s)
  let result = prediction
  for (let i = 0; i < 60; i++) {
    if (result.status === 'succeeded') break
    if (result.status === 'failed' || result.status === 'canceled') {
      await refund()
      return NextResponse.json({ error: 'Génération échouée' }, { status: 500 })
    }
    await new Promise(r => setTimeout(r, 2000))
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    })
    result = await pollRes.json()
  }

  if (result.status !== 'succeeded' || !result.output) {
    await refund()
    return NextResponse.json({ error: 'Timeout — réessayez' }, { status: 504 })
  }

  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output

  // Journal : compte le quota mensuel du plan et garde une trace des générations (coût Replicate)
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'qr_ai_generate',
    resource: 'qr-ai',
    resource_id: prediction.id,
    metadata: { paid_with: chargedCredits ? 'credits' : 'plan', plan: user.plan },
  })

  return NextResponse.json({
    imageUrl,
    predictionId: prediction.id,
    quota: chargedCredits ? null : { used: usedThisMonth + 1, limit: quota },
  })
}
