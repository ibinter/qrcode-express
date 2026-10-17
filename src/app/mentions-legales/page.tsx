import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions Légales | QR CODE EXPRESS',
  description: 'Mentions légales de la plateforme QR CODE EXPRESS éditée par IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP.',
}

const SECTIONS = [
  {
    icon: '🏢',
    title: 'Éditeur du site',
    items: [
      { label: 'Raison sociale', value: 'INTERMARK BUSINESS INTERNATIONAL GROUP — IBIG SARL' },
      { label: 'Nom commercial', value: 'IBIG SOFT' },
      { label: 'Siège social', value: 'Abidjan, Côte d\'Ivoire' },
      { label: 'Capital social', value: 'En cours d\'enregistrement' },
      { label: 'RCCM', value: 'En cours' },
      { label: 'Site IBIG SOFT', value: 'ibigsoft.com', href: 'https://ibigsoft.com' },
      { label: 'Site Groupe', value: 'intermark-business.com', href: 'https://intermark-business.com' },
      { label: 'Email', value: 'contact@qrcode-express.com', href: 'mailto:contact@qrcode-express.com' },
      { label: 'Téléphone', value: '+225 27 22 27 60 14' },
      { label: 'WhatsApp', value: '+225 07 78 88 25 92', href: 'https://wa.me/2250778882592' },
    ],
  },
  {
    icon: '👤',
    title: 'Directeur de la publication',
    content: 'Le directeur de la publication est le représentant légal d\'IBIG SOFT (INTERMARK BUSINESS INTERNATIONAL GROUP — IBIG SARL).',
  },
  {
    icon: '☁️',
    title: 'Hébergement',
    items: [
      { label: 'Hébergement applicatif', value: 'Vercel Inc. — 340 Pine Street, Suite 900, San Francisco, CA 94104, USA' },
      { label: 'Base de données', value: 'Supabase Inc. — infrastructure hébergée en Europe de l\'Ouest' },
      { label: 'CDN & Edge', value: 'Vercel Edge Network — points de présence mondiaux' },
    ],
  },
  {
    icon: '©️',
    title: 'Propriété intellectuelle',
    content: 'Le site QR CODE EXPRESS et l\'ensemble de ses contenus (textes, images, logo, code source, base de données, QR codes générés) sont protégés par le droit de la propriété intellectuelle applicable en Côte d\'Ivoire et à l\'international. Toute reproduction partielle ou totale sans autorisation préalable écrite d\'IBIG SOFT est strictement interdite et passible de poursuites.',
  },
  {
    icon: '⚠️',
    title: 'Limitation de responsabilité',
    content: 'IBIG SOFT met tout en œuvre pour assurer la disponibilité et la fiabilité de la plateforme. Toutefois, IBIG SOFT ne saurait être tenu responsable des dommages directs ou indirects résultant d\'une interruption temporaire du service, d\'une perte de données, ou de l\'utilisation abusive de la plateforme par des tiers. IBIG SOFT se réserve le droit de modifier le contenu du site à tout moment et sans préavis.',
  },
  {
    icon: '🔗',
    title: 'Liens hypertextes',
    content: 'La plateforme peut contenir des liens vers des sites tiers. IBIG SOFT n\'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur disponibilité. La création de liens vers QR CODE EXPRESS est autorisée sous réserve d\'accord préalable.',
  },
]

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header banner */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2 relative">Légal</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 relative">Mentions Légales</h1>
            <p className="text-blue-300 text-sm relative">Dernière mise à jour : octobre 2026</p>
            <div className="mt-4 flex flex-wrap gap-2 relative">
              <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-blue-200 hover:text-white">
                ibigsoft.com ↗
              </a>
              <a href="https://intermark-business.com" target="_blank" rel="noopener noreferrer"
                className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-blue-200 hover:text-white">
                intermark-business.com ↗
              </a>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {SECTIONS.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{s.icon}</span>
                  <h2 className="font-bold text-[#041B4D] text-lg">{s.title}</h2>
                </div>
                {'items' in s && s.items ? (
                  <dl className="grid gap-2">
                    {s.items.map((item) => (
                      <div key={item.label} className="flex flex-col sm:flex-row sm:gap-3 py-2 border-b border-gray-50 last:border-0">
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-40 shrink-0 mb-0.5 sm:mb-0">{item.label}</dt>
                        <dd className="text-sm text-gray-700">
                          {'href' in item && item.href ? (
                            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="text-[#041B4D] font-medium hover:text-[#FF6A00] transition-colors">
                              {item.value}
                            </a>
                          ) : item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">{s.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Nav links */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/cgu" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">CGU</Link>
            <Link href="/confidentialite" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Confidentialité</Link>
            <Link href="/cookies" className="text-gray-500 hover:text-[#FF6A00] transition-colors font-medium">Cookies</Link>
            <Link href="/" className="text-[#FF6A00] hover:underline font-medium">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
