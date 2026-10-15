'use client'
import { useEffect, useRef } from 'react'

const steps = [
  {
    n: '01',
    icon: '🎯',
    title: 'Choisissez le type',
    desc: 'URL, menu, billetterie, paiement, formulaire, vCard… 20+ types pour chaque besoin professionnel.',
  },
  {
    n: '02',
    icon: '🎨',
    title: 'Personnalisez',
    desc: 'Logo, couleurs, cadre, style — votre QR à votre image en quelques clics. Design pro garanti.',
  },
  {
    n: '03',
    icon: '⬇️',
    title: 'Téléchargez & partagez',
    desc: 'PNG gratuit, SVG vectoriel, PDF imprimable. Prêt à imprimer, coller ou envoyer.',
  },
  {
    n: '04',
    icon: '📊',
    title: 'Suivez & gérez',
    desc: 'Analytics en temps réel, modification sans réimpression, gestion d\'équipe et paiements reçus.',
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
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">En 4 étapes seulement</h2>
          <p className="text-blue-200 text-lg">De zéro à un QR professionnel en moins de 2 minutes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
          {steps.map((s) => (
            <div key={s.n} className="hiw-card relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg"
                style={{ background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)' }}>
                {s.icon}
              </div>
              <div className="absolute top-0 right-6 md:right-auto text-xs font-extrabold text-[#FF6A00] opacity-60 tracking-widest">
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
