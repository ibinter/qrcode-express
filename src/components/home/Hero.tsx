'use client'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'

const SLIDES = [
  {
    id: 'menu',
    tag: '🍽️ Menu Restaurant',
    title: 'Votre menu\ntoujours à jour',
    subtitle: 'Modifiez vos plats, prix et photos sans réimprimer. Vos clients scannent, ils voient la carte du jour.',
    accent: '#FF6A00',
    bg: 'from-[#041B4D] via-[#0d2d6e] to-[#1a1a2e]',
    badge1: { icon: '🍽️', title: 'Menu mis à jour', sub: 'Sans réimpression', color: '#FF6A00' },
    badge2: { icon: '📊', title: '+247 scans', sub: 'aujourd\'hui', dark: true },
    badge3: { icon: '⚡', title: 'QR Dynamique', sub: 'Modifiable en temps réel', color: '#10b981' },
    qrColor: '#FF6A00',
    trust: ['Sans réimpression', 'Mise à jour instantanée', 'Menu PDF inclus'],
  },
  {
    id: 'ticket',
    tag: '🎟️ Billetterie',
    title: 'Vendez vos\nbillets par QR',
    subtitle: 'Créez un événement, gérez les inscriptions et émettez un billet QR unique par participant. Validation à l\'entrée en un scan.',
    accent: '#7c3aed',
    bg: 'from-[#1e0a3c] via-[#2d1158] to-[#1a0a2e]',
    badge1: { icon: '🎟️', title: 'Billet scanné', sub: 'Entrée validée ✓', color: '#7c3aed' },
    badge2: { icon: '👥', title: '84 inscrits', sub: 'sur 100 places', dark: true },
    badge3: { icon: '✅', title: 'Anti-fraude', sub: 'Billet unique par scan', color: '#7c3aed' },
    qrColor: '#7c3aed',
    trust: ['Inscription en ligne', 'Billet QR unique', 'Validation à l\'entrée'],
  },
  {
    id: 'payment',
    tag: '💳 Paiement Mobile Money',
    title: 'Encaissez\npar QR code',
    subtitle: 'Wave, Orange Money, MTN MoMo. Vos clients scannent et paient en 10 secondes. Aucun terminal, aucune caisse.',
    accent: '#16a34a',
    bg: 'from-[#052e16] via-[#14532d] to-[#0a2010]',
    badge1: { icon: '💳', title: 'Paiement reçu', sub: '15 000 FCFA', color: '#16a34a' },
    badge2: { icon: '🌊', title: 'Wave · Orange · MTN', sub: 'Mobile Money', dark: true },
    badge3: { icon: '⚡', title: 'Instantané', sub: 'Confirmation en 5s', color: '#16a34a' },
    qrColor: '#16a34a',
    trust: ['Wave + Orange + MTN', 'Montant fixe ou libre', 'Historique des paiements'],
  },
  {
    id: 'form',
    tag: '📋 Formulaire prospect',
    title: 'Capturez vos\nprospects sans site',
    subtitle: 'Créez un formulaire personnalisé accessible par QR. Collectez noms, emails, numéros — partagez en un scan.',
    accent: '#0ea5e9',
    bg: 'from-[#0c1a2e] via-[#0a2d5e] to-[#0c1a2e]',
    badge1: { icon: '📋', title: 'Nouveau contact', sub: 'Formulaire soumis', color: '#0ea5e9' },
    badge2: { icon: '📈', title: '+12 leads', sub: 'cette semaine', dark: true },
    badge3: { icon: '📤', title: 'Export CSV', sub: 'Données exportables', color: '#0ea5e9' },
    qrColor: '#0ea5e9',
    trust: ['Champs personnalisés', 'Export des réponses', 'Notification WhatsApp'],
  },
  {
    id: 'biolink',
    tag: '🔗 Bio Links',
    title: 'Tous vos liens\nen une page',
    subtitle: 'Instagram, WhatsApp, site web, boutique — une seule page, un seul QR. Votre vitrine digitale en 30 secondes.',
    accent: '#8b5cf6',
    bg: 'from-[#1a0a3c] via-[#2d1a5e] to-[#1a0a3c]',
    badge1: { icon: '🔗', title: 'Bio Links', sub: '8 liens actifs', color: '#8b5cf6' },
    badge2: { icon: '📱', title: '+580 clics', sub: 'ce mois', dark: true },
    badge3: { icon: '✨', title: 'Page personnalisée', sub: 'Vos couleurs & logo', color: '#8b5cf6' },
    qrColor: '#8b5cf6',
    trust: ['Page personnalisée', 'Instagram · TikTok · WhatsApp', 'Stats de clics incluses'],
  },
]

// Deterministic QR pattern
const QR_PATTERN = [1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const goTo = useCallback((idx: number, dir: 'next' | 'prev' = 'next') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 400)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % SLIDES.length, 'next'), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev'), [current, goTo])

  // Auto-advance every 4.5s
  useEffect(() => {
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [next])

  const s = SLIDES[current]

  return (
    <section className="relative overflow-hidden text-white" style={{ minHeight: 560 }}>
      <style>{`
        @keyframes slideInRight { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideOutLeft { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-60px)} }
        @keyframes slideOutRight{ from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(60px)} }
        @keyframes fadeInUp     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-8px) rotate(-1deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes bgPulse { 0%,100%{opacity:0.15} 50%{opacity:0.25} }
        .slide-in-r { animation: slideInRight .4s ease forwards }
        .slide-in-l { animation: slideInLeft .4s ease forwards }
        .slide-out-l { animation: slideOutLeft .4s ease forwards }
        .float1 { animation: float1 4s ease-in-out infinite }
        .float2 { animation: float2 5s ease-in-out infinite }
        .float3 { animation: float3 3.5s ease-in-out infinite }
        .fadeup { animation: fadeInUp .5s ease forwards }
        .bg-pulse { animation: bgPulse 3s ease-in-out infinite }
      `}</style>

      {/* Dynamic gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-all duration-700`}
      />

      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="bg-pulse absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${s.accent}55 0%, transparent 70%)` }} />
        <div className="bg-pulse absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: `radial-gradient(circle, ${s.accent}33 0%, transparent 70%)`, animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">

        {/* LEFT — Text content */}
        <div
          key={`text-${current}`}
          className={`flex-1 text-center md:text-left ${animating ? '' : 'fadeup'}`}
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full border"
            style={{ background: s.accent + '22', borderColor: s.accent + '44', color: s.accent }}>
            {s.tag}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 whitespace-pre-line">
            {s.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 max-w-lg mb-8 leading-relaxed">
            {s.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
            <Link
              href="#generateur"
              className="px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg hover:scale-105 transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${s.accent}, ${s.accent}bb)` }}
            >
              Créer mon QR gratuit →
            </Link>
            <Link
              href="/inscription"
              className="px-8 py-3.5 rounded-xl font-semibold text-white text-base border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Ouvrir un compte
            </Link>
          </div>

          {/* Trust */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start text-xs text-white/50">
            {s.trust.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-green-400">✓</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — Floating mockup */}
        <div key={`visual-${current}`} className={`relative flex-shrink-0 w-72 h-80 md:w-96 md:h-96 ${animating ? '' : 'fadeup'}`}>

          {/* Main QR card */}
          <div className="float1 absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-5 w-52">
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="w-full aspect-square grid grid-cols-7 gap-0.5">
                {QR_PATTERN.map((v, i) => (
                  <div key={i} className="rounded-sm transition-colors duration-700"
                    style={{ background: v ? s.qrColor : 'transparent' }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-[#041B4D] uppercase tracking-wide">SCAN ME</p>
              <span className="text-sm">{s.badge1.icon}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full transition-all duration-700"
              style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.qrColor}88)` }} />
          </div>

          {/* Badge top-right */}
          <div className="float2 absolute top-2 -right-2 md:-right-8 bg-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2 border border-gray-100 min-w-[130px]">
            <span className="text-xl flex-shrink-0">{s.badge1.icon}</span>
            <div>
              <p className="text-[11px] font-bold text-[#041B4D] leading-tight">{s.badge1.title}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.badge1.color }}>{s.badge1.sub}</p>
            </div>
          </div>

          {/* Badge bottom-left */}
          <div className="float3 absolute bottom-10 -left-4 md:-left-10 rounded-xl shadow-lg px-3.5 py-2.5 min-w-[130px]"
            style={{ background: '#041B4D', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-[10px] text-blue-300 font-semibold">{s.badge2.icon} {s.badge2.title}</p>
            <p className="text-white font-extrabold text-sm mt-0.5">{s.badge2.sub}</p>
          </div>

          {/* Badge bottom-right */}
          <div className="float2 absolute bottom-2 -right-2 md:-right-6 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100 min-w-[130px]" style={{ animationDelay: '1s' }}>
            <p className="text-[11px] font-bold text-[#041B4D] mb-0.5">{s.badge3.icon} {s.badge3.title}</p>
            <p className="text-[10px]" style={{ color: s.badge3.color }}>{s.badge3.sub}</p>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="relative pb-8 flex flex-col items-center gap-4">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((sl, i) => (
            <button
              key={sl.id}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              aria-label={sl.tag}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                background: i === current ? s.accent : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="absolute right-4 bottom-0 flex gap-2 mb-2 md:mb-4 md:right-8">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
            aria-label="Précédent"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
            aria-label="Suivant"
          >
            ›
          </button>
        </div>

        {/* Slide counter */}
        <p className="text-white/30 text-xs font-mono">
          {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          key={current}
          className="h-full rounded-full transition-none"
          style={{
            background: s.accent,
            animation: 'progress 4.5s linear forwards',
            width: '100%',
            transformOrigin: 'left',
            transform: 'scaleX(0)',
          }}
        />
      </div>
      <style>{`
        @keyframes progress { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>

      {/* Bottom wave */}
      <div className="relative h-10 bg-white" style={{ marginTop: -1 }}>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0 40L1440 40L1440 0C1200 32 960 40 720 32C480 24 240 0 0 18L0 40Z" fill="currentColor" className="text-[#041B4D]"
            style={{ fill: SLIDES[current]?.bg.includes('052e16') ? '#052e16' : SLIDES[current]?.bg.includes('1e0a3c') ? '#1e0a3c' : SLIDES[current]?.bg.includes('0c1a2e') ? '#0c1a2e' : SLIDES[current]?.bg.includes('1a0a3c') ? '#1a0a3c' : '#041B4D' }}
          />
        </svg>
      </div>
    </section>
  )
}
