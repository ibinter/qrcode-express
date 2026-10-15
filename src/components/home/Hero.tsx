'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const ROTATING_WORDS = [
  'restaurant', 'boutique', 'événement', 'carte de visite',
  'coupon promo', 'réseau Wi-Fi', 'bio links', 'billetterie',
  'paiement QR', 'formulaire', 'équipe', 'catalogue',
]

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % ROTATING_WORDS.length)
        setVisible(true)
      }, 300)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#041B4D] text-white">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FF6A00 0%, transparent 70%)', animation: 'float1 8s ease-in-out infinite' }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', animation: 'float2 10s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #FF6A00 0%, transparent 70%)', animation: 'float1 6s ease-in-out infinite reverse' }} />
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideWord { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .anim-1{animation:fadeUp .7s ease both}
        .anim-2{animation:fadeUp .7s .15s ease both}
        .anim-3{animation:fadeUp .7s .3s ease both}
        .anim-4{animation:fadeUp .7s .45s ease both}
        .word-in{animation:slideWord .3s ease both}
        .word-out{opacity:0;transform:translateY(-10px);transition:all .3s}
        @keyframes qrFloat { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
        @keyframes qrFloat2 { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-8px) rotate(-1deg)} }
        .qr-float{animation:qrFloat 4s ease-in-out infinite}
        .qr-float2{animation:qrFloat2 5s ease-in-out infinite}
      `}</style>

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <p className="anim-1 inline-flex items-center gap-2 text-xs font-bold text-[#FF6A00] uppercase tracking-widest mb-5 bg-[#FF6A00]/10 px-3 py-1.5 rounded-full border border-[#FF6A00]/20">
            ⚡ par IBIG SOFT · Made in Côte d&apos;Ivoire
          </p>

          <h1 className="anim-2 text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Le QR code<br />
            de votre{' '}
            <span
              className={`text-[#FF6A00] inline-block transition-all duration-300 ${visible ? 'word-in' : 'word-out'}`}
              style={{ minWidth: 200 }}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
          </h1>

          <p className="anim-3 text-lg md:text-xl text-blue-100/80 max-w-lg mb-8 leading-relaxed">
            20+ types de QR codes. Menus, billetterie, paiements Mobile Money, formulaires, bio links, organisations — tout en un, fait pour l&apos;Afrique.
          </p>

          <div className="anim-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
            <Link
              href="#generateur"
              className="px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
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

          {/* Trust badges */}
          <div className="anim-4 flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start text-xs text-blue-300">
            {['Sans inscription', 'PNG gratuit', 'Aucun filigrane', 'Wave · Orange · MTN'].map((t) => (
              <span key={t} className="flex items-center gap-1"><span className="text-green-400">✓</span> {t}</span>
            ))}
          </div>
        </div>

        {/* Right: Floating QR mockups */}
        <div className="relative flex-shrink-0 w-72 h-72 md:w-96 md:h-96">
          {/* Main QR card */}
          <div className="qr-float absolute top-0 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-5 w-52">
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="w-full aspect-square grid grid-cols-7 gap-0.5">
                {[1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1].map((v, i) => (
                  <div key={i} className={`rounded-sm ${v ? 'bg-[#041B4D]' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <p className="text-center text-[10px] font-bold text-[#041B4D] uppercase tracking-wide">SCAN ME</p>
            <div className="mt-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #FF6A00, #041B4D)' }} />
          </div>

          {/* Floating badge: Billetterie */}
          <div className="qr-float2 absolute top-4 -right-2 md:-right-8 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
            <span className="text-lg">🎟️</span>
            <div>
              <p className="text-[10px] font-bold text-[#041B4D]">Billetterie QR</p>
              <p className="text-[9px] text-gray-400">Inscription + ticket</p>
            </div>
          </div>

          {/* Floating badge: Paiement */}
          <div className="qr-float absolute bottom-8 -left-4 md:-left-10 bg-[#041B4D] border border-white/10 rounded-xl shadow-lg px-3 py-2">
            <p className="text-[9px] text-blue-300 font-semibold">💳 Paiement reçu</p>
            <p className="text-white font-extrabold text-base">+15 000 FCFA</p>
            <div className="flex gap-1 mt-1 text-[9px] text-blue-200">
              <span>🌊 Wave</span><span>🟠 Orange</span>
            </div>
          </div>

          {/* Floating badge: Design */}
          <div className="qr-float2 absolute bottom-4 -right-2 md:-right-6 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100">
            <p className="text-[10px] font-bold text-[#041B4D] mb-1">🏢 Organisations</p>
            <p className="text-[9px] text-gray-400">Partagez en équipe</p>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-12 bg-white" style={{ marginTop: -1 }}>
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0 48L1440 48L1440 0C1200 40 960 48 720 40C480 32 240 0 0 24L0 48Z" fill="#041B4D"/>
        </svg>
      </div>
    </section>
  )
}
