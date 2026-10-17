'use client'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'

const SLIDE_IDS = ['menu', 'ticket', 'payment', 'form', 'biolink', 'barcode', 'labels'] as const
type SlideId = typeof SLIDE_IDS[number]

const SLIDE_META: Record<SlideId, { accent: string; bg: string; qrColor: string; bgStart: string }> = {
  menu:    { accent: '#FF6A00', bg: 'from-[#041B4D] via-[#0d2d6e] to-[#1a1a2e]',   qrColor: '#FF6A00', bgStart: '#041B4D' },
  ticket:  { accent: '#7c3aed', bg: 'from-[#1e0a3c] via-[#2d1158] to-[#1a0a2e]',   qrColor: '#7c3aed', bgStart: '#1e0a3c' },
  payment: { accent: '#16a34a', bg: 'from-[#052e16] via-[#14532d] to-[#0a2010]',   qrColor: '#16a34a', bgStart: '#052e16' },
  form:    { accent: '#0ea5e9', bg: 'from-[#0c1a2e] via-[#0a2d5e] to-[#0c1a2e]',   qrColor: '#0ea5e9', bgStart: '#0c1a2e' },
  biolink: { accent: '#8b5cf6', bg: 'from-[#1a0a3c] via-[#2d1a5e] to-[#1a0a3c]',   qrColor: '#8b5cf6', bgStart: '#1a0a3c' },
  barcode: { accent: '#3b82f6', bg: 'from-[#0a1628] via-[#1e3a5e] to-[#0a1628]',   qrColor: '#3b82f6', bgStart: '#0a1628' },
  labels:  { accent: '#a855f7', bg: 'from-[#150630] via-[#2d1158] to-[#150630]',   qrColor: '#a855f7', bgStart: '#150630' },
}

// ── Mini QR 7×7 ──
const QR7 = [1,1,1,1,1,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,0,1,1,0,1,0,0,0,1,0,1,1,1,1,1,1,1]
function MiniQR({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: 'white', borderRadius: 4, padding: 3, flexShrink: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.5, width: '100%', height: '100%' }}>
        {QR7.map((v, i) => (
          <div key={i} style={{ borderRadius: 0.5, background: v ? color : 'transparent' }} />
        ))}
      </div>
    </div>
  )
}

// ── Phone frame ──
function PhoneFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{
      position: 'relative', width: 168, height: 296, flexShrink: 0,
      borderRadius: '1.75rem', border: '2px solid rgba(255,255,255,0.15)',
      background: dark ? 'linear-gradient(145deg,#0f172a,#1e293b)' : 'linear-gradient(145deg,#1e293b,#0f172a)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 40, height: 10, background: '#000', borderRadius: 8, zIndex: 10 }} />
      {/* Screen */}
      <div style={{ position: 'absolute', inset: 8, top: 20, borderRadius: '1.4rem', overflow: 'hidden', background: '#fff' }}>
        {children}
      </div>
      {/* Home indicator */}
      <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 4 }} />
    </div>
  )
}

// ── VISUAL: Menu ──
function MenuVisual({ accent }: { accent: string }) {
  const items = [['🐟','Attiéké poisson','3 500'],['🍛','Riz gras poulet','4 200'],['🥘','Placali sauce','2 800'],['🥗','Salade verte','1 500'],['☕','Café ou thé','500']]
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <PhoneFrame>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🍽️</span>
            <div>
              <p style={{ fontSize: 8, fontWeight: 900, color: '#041B4D', lineHeight: 1 }}>MAQUIS IVOIRIEN</p>
              <p style={{ fontSize: 6, color: '#94a3b8', marginTop: 1 }}>Menu du jour · mis à jour</p>
            </div>
          </div>
          <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {items.map(([e,n,p]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10 }}>{e}</span>
                <p style={{ flex: 1, fontSize: 7, fontWeight: 500, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</p>
                <p style={{ fontSize: 8, fontWeight: 900, color: accent, flexShrink: 0 }}>{p}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: '4px 8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 6, color: '#94a3b8' }}>Scannez pour commander</p>
            <MiniQR color={accent} size={24} />
          </div>
        </div>
      </PhoneFrame>
      <div className="float1 absolute top-0 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>🍽️ Menu mis à jour</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 2 }}>Sans réimpression</p>
      </div>
      <div className="float3 absolute bottom-10 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#041B4D', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#93c5fd', fontWeight: 600 }}>📊 +247 scans</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>aujourd'hui</p>
      </div>
      <div className="float2 absolute bottom-1 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>⚡ QR Dynamique</p>
        <p style={{ fontSize: 10, color: accent }}>Modifiable en temps réel</p>
      </div>
    </div>
  )
}

// ── VISUAL: Ticket ──
function TicketVisual({ accent }: { accent: string }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div style={{ width: 260, position: 'relative' }}>
        <div style={{ background: '#fff', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          {/* Header */}
          <div style={{ height: 70, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)', backgroundSize: '8px 8px' }} />
            <div style={{ position: 'relative', padding: '12px 16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>BILLET ÉLECTRONIQUE</p>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: 14, marginTop: 2 }}>CONCERT LIVE ABIDJAN</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, marginTop: 1 }}>Sam. 15 Nov 2026 · 20h00</p>
            </div>
          </div>
          {/* Perforation */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '0 -2px' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0a1628', marginLeft: -6, flexShrink: 0 }} />
            <div style={{ flex: 1, borderTop: `2px dashed ${accent}55`, margin: '0 4px' }} />
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0a1628', marginRight: -6, flexShrink: 0 }} />
          </div>
          {/* Body */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <p style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Porte · Siège</p>
                <p style={{ fontSize: 11, fontWeight: 900, color: '#1e293b', marginTop: 1 }}>A · Rang 12 · Siège C</p>
              </div>
              <div>
                <p style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Catégorie</p>
                <p style={{ fontSize: 11, fontWeight: 900, color: '#1e293b', marginTop: 1 }}>VIP · Accès backstage</p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 800, color: '#fff', background: '#10b981' }}>✓ VALIDÉ</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <MiniQR color={accent} size={56} />
              <p style={{ fontSize: 7, fontFamily: 'monospace', color: '#94a3b8' }}>QRE-2026-0142</p>
            </div>
          </div>
        </div>
      </div>
      <div className="float1 absolute top-0 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>🎟️ Billet scanné</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#10b981', marginTop: 2 }}>Entrée validée ✓</p>
      </div>
      <div className="float3 absolute bottom-10 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#1e0a3c', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#c4b5fd', fontWeight: 600 }}>👥 84 inscrits</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>sur 100 places</p>
      </div>
      <div className="float2 absolute bottom-0 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>✅ Anti-fraude</p>
        <p style={{ fontSize: 10, color: accent }}>Billet unique par scan</p>
      </div>
    </div>
  )
}

// ── VISUAL: Payment ──
function PaymentVisual({ accent }: { accent: string }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div style={{ width: 224, position: 'relative' }}>
        <div style={{ background: '#fff', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '20px 20px 16px', textAlign: 'center', background: `linear-gradient(180deg,${accent}18,transparent)` }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${accent},${accent}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: `0 8px 20px ${accent}44`, fontSize: 22, color: '#fff' }}>✓</div>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Paiement reçu</p>
            <p style={{ fontSize: 30, fontWeight: 900, color: accent, marginTop: 4, lineHeight: 1 }}>15 000</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>FCFA</p>
          </div>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['🌊','Opérateur','Wave CI'],['👤','Client','Jean K. Kouassi'],['📱','Numéro','+225 07 XX XX XX']].map(([ic,l,v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{ic}</span>
                <div><p style={{ fontSize: 8, color: '#94a3b8' }}>{l}</p><p style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>{v}</p></div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 8, color: '#94a3b8', fontFamily: 'monospace' }}>Réf: WV20261115-042</p>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: 999 }}>✓ OK</span>
            </div>
          </div>
        </div>
      </div>
      <div className="float1 absolute top-4 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>💳 Paiement reçu</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 2 }}>15 000 FCFA</p>
      </div>
      <div className="float3 absolute bottom-10 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#052e16', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#86efac', fontWeight: 600 }}>🌍 Wave · MTN · Orange</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>Multi-pays Afrique</p>
      </div>
      <div className="float2 absolute bottom-2 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>⚡ Instantané</p>
        <p style={{ fontSize: 10, color: accent }}>Confirmation en 5s</p>
      </div>
    </div>
  )
}

// ── VISUAL: Form ──
function FormVisual({ accent }: { accent: string }) {
  const fields = [['👤','Nom complet','Marie Kouassi'],['📧','Email','marie@example.ci'],['📞','Téléphone','+225 07 XX XX XX'],['💬','Message','Je suis intéressé(e)...']]
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div style={{ width: 232, position: 'relative' }}>
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}>📋</div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#041B4D' }}>Contactez-nous</p>
              <p style={{ fontSize: 8, color: '#94a3b8' }}>Formulaire en ligne</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {fields.map(([ic,lb,val]) => (
              <div key={lb}>
                <p style={{ fontSize: 7, color: '#94a3b8', marginBottom: 2 }}>{ic} {lb}</p>
                <div style={{ height: 22, borderRadius: 8, border: `1px solid ${accent}44`, background: '#f8fafc', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 8, color: '#64748b' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '8px 0', borderRadius: 12, background: `linear-gradient(135deg,${accent},${accent}cc)`, textAlign: 'center', color: '#fff', fontSize: 10, fontWeight: 900 }}>Envoyer →</div>
        </div>
      </div>
      <div className="float1 absolute top-2 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>📋 Nouveau contact</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 2 }}>Formulaire soumis</p>
      </div>
      <div className="float3 absolute bottom-8 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#7dd3fc', fontWeight: 600 }}>📈 +12 leads</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>cette semaine</p>
      </div>
      <div className="float2 absolute bottom-0 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>📤 Export CSV</p>
        <p style={{ fontSize: 10, color: accent }}>Données exportables</p>
      </div>
    </div>
  )
}

// ── VISUAL: Biolink ──
function BiolinkVisual({ accent }: { accent: string }) {
  const links = [['📸','Instagram','#e1306c'],['💬','WhatsApp','#25d366'],['🛍️','Ma boutique',accent],['🌐','Mon site web','#6366f1'],['📧','Me contacter','#64748b']]
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <PhoneFrame>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '12px 8px 8px', textAlign: 'center', background: `linear-gradient(180deg,${accent}22,transparent)` }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${accent},${accent}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, margin: '0 auto 6px', boxShadow: `0 4px 12px ${accent}55` }}>MK</div>
            <p style={{ fontSize: 9, fontWeight: 900, color: '#041B4D' }}>Marie Kouassi</p>
            <p style={{ fontSize: 7, color: '#94a3b8', marginTop: 1 }}>Designer · Abidjan 🇨🇮</p>
          </div>
          <div style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden' }}>
            {links.map(([ic,lb,col]) => (
              <div key={lb} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 8, background: `${col}14`, border: `1px solid ${col}33` }}>
                <span style={{ fontSize: 10 }}>{ic}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: '#334155' }}>{lb}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '4px 8px 6px', textAlign: 'center' }}>
            <p style={{ fontSize: 6, color: '#cbd5e1' }}>Powered by QR CODE EXPRESS</p>
          </div>
        </div>
      </PhoneFrame>
      <div className="float1 absolute top-0 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>🔗 Bio Links</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 2 }}>8 liens actifs</p>
      </div>
      <div className="float3 absolute bottom-10 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#1a0a3c', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#c4b5fd', fontWeight: 600 }}>📱 +580 clics</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>ce mois</p>
      </div>
      <div className="float2 absolute bottom-1 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>✨ Page personnalisée</p>
        <p style={{ fontSize: 10, color: accent }}>Vos couleurs & logo</p>
      </div>
    </div>
  )
}

// ── VISUAL: Barcode ── (SVG-rendered EAN-13 + Code 128)
function BarcodeVisual({ accent }: { accent: string }) {
  // EAN-13 style barcode pattern (alternating bar widths, odd=black, even=white)
  const ean13 = [3,1,1,2,1,4,2,1,1,2,3,1,1,1,2,1,2,1,2,1,1,2,1,3,1,2,1,1,3,1,2,1,1,2,1,3,1,2,1,1,2,1,3,2]
  const ean13Total = ean13.reduce((a,b)=>a+b,0)
  let xEan = 0
  const ean13Rects = ean13.map((w,i)=>{ const r={x:xEan,w,i}; xEan+=w; return r })

  // Code 128 style pattern (varies more)
  const c128 = [1,2,1,3,2,1,1,2,3,1,1,3,1,2,1,4,1,1,2,1,3,1,1,2,1,2,3,1,1,2,1,3,2,1,1,2,3,1,1,2,1,1,3,2,1,1,2,1,4,1,1,2,1,3,2]
  const c128Total = c128.reduce((a,b)=>a+b,0)
  let xC128 = 0
  const c128Rects = c128.map((w,i)=>{ const r={x:xC128,w,i}; xC128+=w; return r })

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div style={{ width: 264, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* EAN-13 product card */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${accent}18`, border: `2px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>☕</div>
            <div>
              <p style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Produit retail</p>
              <p style={{ fontSize: 14, fontWeight: 900, color: '#041B4D', lineHeight: 1.2 }}>CAFÉ ARABICA</p>
              <p style={{ fontSize: 10, color: '#64748b' }}>Premium · 250g</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: accent, marginTop: 3 }}>3 500 FCFA</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            <svg viewBox={`0 0 ${ean13Total} 40`} style={{ width: '100%', height: 40, display: 'block' }}>
              {ean13Rects.filter(r=>r.i%2===0).map(r=>(
                <rect key={r.i} x={r.x} y={0} width={r.w} height={r.i<4||r.i>ean13.length-5?40:32} fill="#1a1a2e"/>
              ))}
            </svg>
            <p style={{ textAlign: 'center', fontSize: 9, fontFamily: 'monospace', color: '#64748b', marginTop: 3 }}>3 701234 567890 — EAN-13</p>
          </div>
        </div>

        {/* Code 128 logistics */}
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '0.9rem', padding: '10px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0ea5e922', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 8, fontWeight: 900, color: '#041B4D' }}>Code 128 · Logistique</p>
              <p style={{ fontSize: 7, color: '#64748b', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>COLIS-ABJ-2026-00142</p>
            </div>
            <span style={{ fontSize: 7, fontWeight: 700, background: `${accent}22`, color: accent, padding: '2px 6px', borderRadius: 999, flexShrink: 0 }}>PNG·SVG</span>
          </div>
          <svg viewBox={`0 0 ${c128Total} 22`} style={{ width: '100%', height: 22, display: 'block' }}>
            {c128Rects.filter(r=>r.i%2===0).map(r=>(
              <rect key={r.i} x={r.x} y={0} width={r.w} height={r.i<3||r.i>c128.length-4?22:16} fill="#1a1a2e"/>
            ))}
          </svg>
        </div>
      </div>

      <div className="float1 absolute top-2 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>📊 EAN-13 généré</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 2 }}>PNG HD · 300 dpi</p>
      </div>
      <div className="float3 absolute bottom-16 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#93c5fd', fontWeight: 600 }}>📦 +350 codes</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>ce mois-ci</p>
      </div>
      <div className="float2 absolute bottom-2 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>⚡ Batch CSV</p>
        <p style={{ fontSize: 10, color: accent }}>500 codes en 1 clic</p>
      </div>
    </div>
  )
}

// ── VISUAL: Labels ──
function LabelsVisual({ accent }: { accent: string }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div style={{ width: 264, display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Commerce price label */}
        <div style={{ background: '#fff', borderRadius: '0.9rem', padding: '10px 12px', boxShadow: '0 10px 24px rgba(0,0,0,0.3)', borderLeft: `4px solid ${accent}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🏷️</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 7, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Étiquette prix</p>
                <p style={{ fontSize: 15, fontWeight: 900, color: '#041B4D', lineHeight: 1.1 }}>2 500 FCFA</p>
                <p style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>Tissu Wax · Ref: WX-042</p>
              </div>
              <MiniQR color={accent} size={28} />
            </div>
          </div>
        </div>

        {/* Pharmacie label */}
        <div style={{ background: '#fff', borderRadius: '0.9rem', padding: '10px 12px', boxShadow: '0 10px 24px rgba(0,0,0,0.3)', borderLeft: '4px solid #10b981', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>💊</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 7, color: '#10b981', fontWeight: 900, textTransform: 'uppercase' }}>Étiquette Pharmacie</p>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#041B4D', marginTop: 1 }}>Paracétamol 500mg</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <p style={{ fontSize: 7, color: '#64748b' }}>DL: 12/2027</p>
              <p style={{ fontSize: 7, color: '#64748b' }}>Lot: PH20261A</p>
              <p style={{ fontSize: 7, color: '#64748b' }}>EN:97432</p>
            </div>
          </div>
        </div>

        {/* Luxury label */}
        <div style={{ background: 'linear-gradient(135deg,#1a1209,#2d1f0a)', borderRadius: '0.9rem', padding: '10px 12px', boxShadow: '0 10px 24px rgba(0,0,0,0.45)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>✨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#d4af37' }}>Bijoux · Luxe</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginTop: 1 }}>MAISON DORÉE</p>
            <p style={{ fontSize: 8, color: 'rgba(212,175,55,0.8)', marginTop: 1 }}>Bague Or 18K · 75 000 FCFA</p>
          </div>
        </div>
      </div>

      <div className="float1 absolute top-2 -right-2 md:-right-10 bg-white rounded-xl shadow-xl px-3 py-2.5 border border-gray-100" style={{ minWidth: 132 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>🏷️ PDF généré</p>
        <p style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 2 }}>Prêt à imprimer</p>
      </div>
      <div className="float3 absolute bottom-2 -left-2 md:-left-12 rounded-xl shadow-xl px-3.5 py-2.5" style={{ background: '#150630', border: '1px solid rgba(255,255,255,0.12)', minWidth: 132 }}>
        <p style={{ fontSize: 10, color: '#d8b4fe', fontWeight: 600 }}>🎨 24 étiquettes</p>
        <p style={{ fontSize: 13, color: '#fff', fontWeight: 900, marginTop: 2 }}>par feuille A4 Avery</p>
      </div>
      <div className="float2 absolute top-14 -right-2 md:-right-8 bg-white rounded-xl shadow-xl px-3 py-2 border border-gray-100" style={{ minWidth: 132, animationDelay: '1s' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#041B4D' }}>⬆️ Upload logo</p>
        <p style={{ fontSize: 10, color: accent }}>PNG · JPG · SVG</p>
      </div>
    </div>
  )
}

// ── Dispatch ──
function SlideVisual({ id, accent }: { id: SlideId; accent: string }) {
  switch (id) {
    case 'menu':    return <MenuVisual accent={accent} />
    case 'ticket':  return <TicketVisual accent={accent} />
    case 'payment': return <PaymentVisual accent={accent} />
    case 'form':    return <FormVisual accent={accent} />
    case 'biolink': return <BiolinkVisual accent={accent} />
    case 'barcode': return <BarcodeVisual accent={accent} />
    case 'labels':  return <LabelsVisual accent={accent} />
  }
}

// ── Main Hero ──────────────────────────────────────────────────────
export default function Hero() {
  const t = useTranslations('hero')
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setCurrent(idx); setAnimating(false) }, 380)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % SLIDE_IDS.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + SLIDE_IDS.length) % SLIDE_IDS.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const meta   = SLIDE_META[SLIDE_IDS[current]]
  const sk     = `slides.${SLIDE_IDS[current]}`
  const tag    = t(`${sk}.tag` as any)
  const title  = t(`${sk}.title` as any)
  const sub    = t(`${sk}.subtitle` as any)
  const trust  = [t(`${sk}.trust_0` as any), t(`${sk}.trust_1` as any), t(`${sk}.trust_2` as any)]

  return (
    <section className="relative overflow-hidden text-white">

      {/* Dynamic background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.bg} transition-all duration-700`} />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="bg-pulse absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full"
          style={{ background: `radial-gradient(circle, ${meta.accent}44 0%, transparent 65%)` }} />
        <div className="bg-pulse absolute -bottom-20 -right-20 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${meta.accent}2e 0%, transparent 65%)`, animationDelay: '2s' }} />
        <div className="bg-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full"
          style={{ background: `radial-gradient(circle, ${meta.accent}18 0%, transparent 60%)`, animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-22 flex flex-col md:flex-row items-center gap-8 md:gap-10">

        {/* ── LEFT: Text ── */}
        <div key={`t-${current}`} className={`flex-1 text-center md:text-left ${animating ? 'opacity-0' : 'fadeup'}`}>

          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full border"
            style={{ background: meta.accent + '22', borderColor: meta.accent + '44', color: meta.accent }}>
            {tag}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 whitespace-pre-line">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-lg mb-8 leading-relaxed">
            {sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
            <Link
              href="#generateur"
              className="px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg hover:scale-105 transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)` }}
            >
              {t('cta_primary')}
            </Link>
            <Link
              href="/inscription"
              className="px-8 py-3.5 rounded-xl font-semibold text-white text-base border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              {t('cta_secondary')}
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start text-xs text-white/50">
            {trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-green-400">✓</span> {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Per-slide visual ── */}
        <div
          key={`v-${current}`}
          className={`relative flex-shrink-0 w-72 md:w-[440px] mx-auto md:mx-0 ${animating ? 'opacity-0' : 'fadeup'}`}
          style={{ height: 360 }}
        >
          <SlideVisual id={SLIDE_IDS[current]} accent={meta.accent} />
        </div>
      </div>

      {/* Slide controls */}
      <div className="relative pb-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          {SLIDE_IDS.map((id, i) => (
            <button
              key={id}
              onClick={() => goTo(i)}
              aria-label={id}
              className="transition-all duration-300 rounded-full"
              style={{
                width:  i === current ? 28 : 8,
                height: 8,
                background: i === current ? meta.accent : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        <div className="absolute right-4 bottom-0 flex gap-2 mb-2 md:mb-4 md:right-8">
          <button onClick={prev} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105" aria-label={t('prev')}>‹</button>
          <button onClick={next} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105" aria-label={t('next')}>›</button>
        </div>

        <p className="text-white/30 text-xs font-mono">
          {String(current + 1).padStart(2, '0')} / {String(SLIDE_IDS.length).padStart(2, '0')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          key={current}
          className="h-full rounded-full"
          style={{
            background: meta.accent,
            animation: 'progress 5s linear forwards',
            width: '100%',
            transformOrigin: 'left',
            transform: 'scaleX(0)',
          }}
        />
      </div>
      <style>{`@keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>

      {/* Bottom wave */}
      <div className="relative h-10 bg-white" style={{ marginTop: -1 }}>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0 40L1440 40L1440 0C1200 32 960 40 720 32C480 24 240 0 0 18L0 40Z"
            style={{ fill: meta.bgStart }} />
        </svg>
      </div>
    </section>
  )
}
