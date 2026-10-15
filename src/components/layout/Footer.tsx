'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const YEAR = 2026

const SOCIAL = [
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/2250778551234', color: '#25d366' },
  { icon: '📘', label: 'Facebook', href: 'https://facebook.com/qrcodeexpress', color: '#1877f2' },
  { icon: '📸', label: 'Instagram', href: 'https://instagram.com/qrcodeexpress', color: '#e1306c' },
  { icon: '▶️', label: 'TikTok', href: 'https://tiktok.com/@qrcodeexpress', color: '#010101' },
  { icon: '💼', label: 'LinkedIn', href: 'https://linkedin.com/company/ibigsoft', color: '#0a66c2' },
]

const LINKS = [
  {
    title: 'Produit',
    links: [
      { label: 'Créer un QR gratuit', href: '/#generateur' },
      { label: 'Tarifs & formules', href: '/tarifs' },
      { label: 'Fonctionnalités', href: '/fonctionnalites' },
      { label: 'API REST', href: '/api-docs' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Menu Restaurant', href: '/#generateur' },
      { label: 'Billetterie QR', href: '/#generateur' },
      { label: 'Paiement Mobile Money', href: '/#generateur' },
      { label: 'Formulaires prospects', href: '/#generateur' },
      { label: 'Bio Links', href: '/#generateur' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Guide d\'impression', href: '/guide' },
      { label: 'Blog & tutoriels', href: '/blog' },
      { label: 'Support WhatsApp', href: 'https://wa.me/2250778551234' },
      { label: 'Parrainage', href: '/parrainage' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'CGU', href: '/cgu' },
      { label: 'Politique de confidentialité', href: '/confidentialite' },
      { label: 'Politique cookies', href: '/cookies' },
      { label: 'Mentions légales', href: '/mentions-legales' },
    ],
  },
]

const TRUST = [
  { icon: '🔒', label: 'Données chiffrées SSL' },
  { icon: '🌍', label: 'Hébergé en Europe' },
  { icon: '⚡', label: '99,9% de disponibilité' },
  { icon: '🇨🇮', label: 'Made in Côte d\'Ivoire' },
]

export default function Footer() {
  return (
    <footer className="bg-[#041B4D] text-white">

      {/* CTA band */}
      <div className="border-b border-blue-900/60"
        style={{ background: 'linear-gradient(90deg, #041B4D 0%, #0d2d6e 50%, #041B4D 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold mb-1">Prêt à créer votre premier QR ?</h2>
            <p className="text-blue-300 text-sm">Gratuit, sans carte bancaire. Opérationnel en 30 secondes.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/#generateur"
              className="px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
            >
              Créer un QR gratuit →
            </Link>
            <Link
              href="/inscription"
              className="px-6 py-3 rounded-xl font-semibold text-white text-sm border border-white/20 hover:bg-white/10 transition-colors"
            >
              Ouvrir un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size="sm" dark />
            </div>
            <p className="text-sm text-blue-200 leading-relaxed mb-5 max-w-xs">
              La plateforme QR professionnelle d'Afrique. Menus, billetterie, paiements Mobile Money, formulaires et plus encore.
            </p>

            {/* Social links */}
            <div className="flex gap-3 flex-wrap">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base hover:scale-110 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-5 space-y-2 text-xs text-blue-300">
              <p>📧 contact@qrcodeexpress.ci</p>
              <p>📱 WhatsApp : +225 07 78 55 12 34</p>
              <p>🏢 Abidjan, Côte d&apos;Ivoire</p>
            </div>
          </div>

          {/* Nav columns */}
          {LINKS.map((col) => (
            <div key={col.title}>
              <p className="font-bold text-sm text-white mb-4 uppercase tracking-wide">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-blue-300 hover:text-[#FF6A00] transition-colors leading-snug"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-blue-900/60 flex flex-wrap justify-center gap-6">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-xs text-blue-400">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-900/60 py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-500">
          <p>© {YEAR} IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-[#FF6A00] transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-[#FF6A00] transition-colors">Confidentialité</Link>
            <Link href="/cookies" className="hover:text-[#FF6A00] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
