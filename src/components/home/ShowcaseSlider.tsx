'use client'
import { useRef } from 'react'

const QR_TYPES = [
  {
    icon: '🔗', name: 'URL / Site web', color: '#041B4D', bg: '#EEF2FF',
    desc: 'Redirigez vers n\'importe quel lien', tag: 'Gratuit',
  },
  {
    icon: '🍽️', name: 'Menu Restaurant', color: '#FF6A00', bg: '#FFF7ED',
    desc: 'Menu digital mis à jour en temps réel', tag: 'Dynamique',
  },
  {
    icon: '🎟️', name: 'Billetterie', color: '#7c3aed', bg: '#F5F3FF',
    desc: 'Inscription + billet QR unique par participant', tag: 'Dynamique',
  },
  {
    icon: '💳', name: 'Paiement QR', color: '#16a34a', bg: '#F0FDF4',
    desc: 'Wave, Orange Money, MTN MoMo intégrés', tag: 'Dynamique',
  },
  {
    icon: '📋', name: 'Formulaire', color: '#0ea5e9', bg: '#F0F9FF',
    desc: 'Capturez des prospects sans site web', tag: 'Dynamique',
  },
  {
    icon: '🎫', name: 'Coupon Promo', color: '#10b981', bg: '#ECFDF5',
    desc: 'Code promo avec date d\'expiration', tag: 'Dynamique',
  },
  {
    icon: '💬', name: 'WhatsApp', color: '#25d366', bg: '#F0FDF4',
    desc: 'Message prérempli, canal n°1 en Afrique', tag: 'Gratuit',
  },
  {
    icon: '🔗', name: 'Bio Links', color: '#8b5cf6', bg: '#F5F3FF',
    desc: 'Tous vos liens sur une seule page', tag: 'Dynamique',
  },
  {
    icon: '📶', name: 'Wi-Fi', color: '#3b82f6', bg: '#EFF6FF',
    desc: 'Connexion sans partager le mot de passe', tag: 'Gratuit',
  },
  {
    icon: '👤', name: 'vCard Plus', color: '#ec4899', bg: '#FDF2F8',
    desc: 'Carte de visite interactive digitale', tag: 'Pro',
  },
  {
    icon: '🛍️', name: 'Catalogue', color: '#f97316', bg: '#FFF7ED',
    desc: 'Vitrine produits avec prix et photos', tag: 'Dynamique',
  },
  {
    icon: '⭐', name: 'Avis clients', color: '#eab308', bg: '#FEFCE8',
    desc: 'Collectez des avis Google en un scan', tag: 'Dynamique',
  },
  {
    icon: '📄', name: 'PDF', color: '#ef4444', bg: '#FEF2F2',
    desc: 'Catalogue, brochure, menu PDF', tag: 'Pro',
  },
  {
    icon: '📍', name: 'Localisation', color: '#f59e0b', bg: '#FFFBEB',
    desc: 'Votre adresse sur Google Maps', tag: 'Gratuit',
  },
  {
    icon: '📲', name: 'App Store', color: '#0ea5e9', bg: '#F0F9FF',
    desc: 'Lien universel iOS + Android', tag: 'Pro',
  },
  {
    icon: '✉️', name: 'E-mail', color: '#6366f1', bg: '#EEF2FF',
    desc: 'Email prérempli avec sujet', tag: 'Gratuit',
  },
  {
    icon: '📅', name: 'Événement', color: '#d97706', bg: '#FFFBEB',
    desc: 'Ajout automatique au calendrier', tag: 'Gratuit',
  },
  {
    icon: '📱', name: 'Réseaux sociaux', color: '#ec4899', bg: '#FDF2F8',
    desc: 'Instagram, TikTok, Facebook, LinkedIn', tag: 'Gratuit',
  },
  {
    icon: '🪪', name: 'vCard simple', color: '#64748b', bg: '#F8FAFC',
    desc: 'Contact téléphone téléchargeable', tag: 'Gratuit',
  },
  {
    icon: '📝', name: 'Texte libre', color: '#6b7280', bg: '#F9FAFB',
    desc: 'Message ou note affichée au scan', tag: 'Gratuit',
  },
]

const TAG_COLORS: Record<string, string> = {
  Dynamique: 'bg-blue-100 text-blue-700',
  Gratuit: 'bg-gray-100 text-gray-600',
  Pro: 'bg-orange-100 text-orange-700',
}

export default function ShowcaseSlider() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
          20+ types de QR codes
        </h2>
        <p className="text-gray-500 text-lg">Menus, billetterie, paiements, formulaires, vCard — tout en un</p>
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
          animation: scrollLeft 40s linear infinite;
        }
        .slider-track:hover { animation-play-state: paused; }
        .slider-wrap { overflow: hidden; }
      `}</style>

      <div className="slider-wrap">
        <div className="slider-track" ref={trackRef}>
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
