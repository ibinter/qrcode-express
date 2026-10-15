'use client'
import { useEffect, useRef } from 'react'

const steps = [
  {
    n: '01',
    icon: '🎯',
    title: 'Choisissez le type',
    desc: 'URL, menu, coupon, vCard, Wi-Fi… 14 types disponibles pour chaque besoin.',
  },
  {
    n: '02',
    icon: '🎨',
    title: 'Personnalisez',
    desc: 'Logo, couleurs, cadre, style — votre QR à votre image en quelques clics.',
  },
  {
    n: '03',
    icon: '⬇️',
    title: 'Téléchargez & partagez',
    desc: 'PNG gratuit, SVG vectoriel, PDF imprimable. Prêt à coller partout.',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('.hiw-card')
    cards.forEach((c) => { c.style.opacity = '0'; c.style.transform = 'translateY(28px)' })
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity .6s ease, transform .6s ease'
            c.style.opacity = '1'
            c.style.transform = 'translateY(0)'
          }, i * 150)
        })
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#041B4D] to-[#0a2d7a] text-white">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">En 3 étapes seulement</h2>
          <p className="text-blue-200 text-lg">Moins de 30 secondes pour votre premier QR</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-white/10" />

          {steps.map((s) => (
            <div key={s.n} className="hiw-card relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg"
                style={{ background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)' }}>
                {s.icon}
              </div>
              <div className="absolute top-0 right-6 md:right-auto md:left-auto text-xs font-extrabold text-[#FF6A00] opacity-60 tracking-widest">
                {s.n}
              </div>
              <h3 className="font-bold text-xl mb-2">{s.title}</h3>
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#generateur"
            className="inline-block px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg hover:scale-105 transition-transform duration-200"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
          >
            Créer mon QR maintenant →
          </a>
        </div>
      </div>
    </section>
  )
}
