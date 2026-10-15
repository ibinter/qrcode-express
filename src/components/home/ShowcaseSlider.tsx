'use client'
import { useRef } from 'react'

const QR_TYPES = [
  {
    icon: '🔗', name: 'URL / Site web', color: '#041B4D', bg: '#EEF2FF',
    desc: 'Redirigez vers n\'importe quel lien', tag: 'Statique',
  },
  {
    icon: '🍽️', name: 'Menu Restaurant', color: '#FF6A00', bg: '#FFF7ED',
    desc: 'Menu digital mis à jour en temps réel', tag: 'Dynamique',
  },
  {
    icon: '🎫', name: 'Coupon Promo', color: '#10b981', bg: '#ECFDF5',
    desc: 'Code promo avec date d\'expiration', tag: 'Dynamique',
  },
  {
    icon: '💬', name: 'WhatsApp', color: '#25d366', bg: '#F0FDF4',
    desc: 'Message prérempli, canal n°1 en Afrique', tag: 'Statique',
  },
  {
    icon: '🔗', name: 'Bio Links', color: '#8b5cf6', bg: '#F5F3FF',
    desc: 'Tous vos liens sur une seule page', tag: 'Dynamique',
  },
  {
    icon: '📶', name: 'Wi-Fi', color: '#3b82f6', bg: '#EFF6FF',
    desc: 'Connexion sans partager le mot de passe', tag: 'Statique',
  },
  {
    icon: '👤', name: 'vCard Plus', color: '#ec4899', bg: '#FDF2F8',
    desc: 'Carte de visite interactive digitale', tag: 'Pro',
  },
  {
    icon: '📄', name: 'PDF', color: '#ef4444', bg: '#FEF2F2',
    desc: 'Catalogue, brochure, menu PDF', tag: 'Pro',
  },
  {
    icon: '📍', name: 'Localisation', color: '#f59e0b', bg: '#FFFBEB',
    desc: 'Votre adresse sur Google Maps', tag: 'Statique',
  },
  {
    icon: '📲', name: 'App Store', color: '#0ea5e9', bg: '#F0F9FF',
    desc: 'Lien universel iOS + Android', tag: 'Pro',
  },
  {
    icon: '✉️', name: 'E-mail', color: '#6366f1', bg: '#EEF2FF',
    desc: 'Email prérempli avec sujet', tag: 'Statique',
  },
  {
    icon: '📅', name: 'Événement', color: '#d97706', bg: '#FFFBEB',
    desc: 'Ajout calendrier en un clic', tag: 'Statique',
  },
]

const TAG_COLORS: Record<string, string> = {
  Dynamique: 'bg-blue-100 text-blue-700',
  Statique: 'bg-gray-100 text-gray-600',
  Pro: 'bg-orange-100 text-orange-700',
}

export default function ShowcaseSlider() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
          14 types de QR codes
        </h2>
        <p className="text-gray-500 text-lg">Tout ce dont vous avez besoin, en un seul endroit</p>
      </div>

      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .slider-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: scrollLeft 28s linear infinite;
        }
        .slider-track:hover { animation-play-state: paused; }
        .slider-wrap { overflow: hidden; }
      `}</style>

      <div className="slider-wrap">
        <div className="slider-track" ref={trackRef}>
          {/* Duplicate for seamless loop */}
          {[...QR_TYPES, ...QR_TYPES].map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: t.bg }}>
                {t.icon}
              </div>
              <div>
                <p className="font-bold text-[#041B4D] text-sm leading-tight">{t.name}</p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">{t.desc}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[t.tag]}`}>
                {t.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
