'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useTranslations } from 'next-intl'
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn } from 'react-icons/fa6'

const YEAR = 2026

const SOCIAL = [
  { label: 'WhatsApp', href: 'https://wa.me/2250778882592', color: '#25d366', Icon: FaWhatsapp },
  { label: 'Facebook', href: 'https://facebook.com/qrcodeexpress', color: '#1877f2', Icon: FaFacebookF },
  { label: 'Instagram', href: 'https://instagram.com/qrcodeexpress', color: '#e1306c', Icon: FaInstagram },
  { label: 'TikTok', href: 'https://tiktok.com/@qrcodeexpress', color: '#ffffff', Icon: FaTiktok },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/ibigsoft', color: '#0a66c2', Icon: FaLinkedinIn },
]

export default function Footer() {
  const t = useTranslations('footer')

  const LINKS = [
    {
      title: t('col_product'),
      links: [
        { label: t('link_create_qr'), href: '/#generateur' },
        { label: t('link_pricing'), href: '/tarifs' },
        { label: t('link_features'), href: '/fonctionnalites' },
        { label: t('link_api'), href: '/api-docs' },
      ],
    },
    {
      title: t('col_solutions'),
      links: [
        { label: t('link_menu'), href: '/#generateur' },
        { label: t('link_ticketing'), href: '/#generateur' },
        { label: t('link_payment'), href: '/#generateur' },
        { label: t('link_forms'), href: '/#generateur' },
        { label: t('link_biolinks'), href: '/#generateur' },
      ],
    },
    {
      title: t('col_resources'),
      links: [
        { label: t('link_guide'), href: '/guide' },
        { label: t('link_blog'), href: '/blog' },
        { label: t('link_support'), href: 'https://wa.me/2250778882592' },
        { label: t('link_referral'), href: '/parrainage' },
      ],
    },
    {
      title: t('col_legal'),
      links: [
        { label: t('link_cgu'), href: '/cgu' },
        { label: t('link_privacy'), href: '/confidentialite' },
        { label: t('link_cookies'), href: '/cookies' },
        { label: t('link_legal'), href: '/mentions-legales' },
      ],
    },
  ]

  const TRUST = [
    { icon: '🔒', label: t('trust_ssl') },
    { icon: '🌍', label: t('trust_hosted') },
    { icon: '⚡', label: t('trust_uptime') },
    { icon: '🇨🇮', label: t('trust_origin') },
  ]

  return (
    <footer className="bg-[#041B4D] text-white">

      {/* CTA band */}
      <div className="border-b border-blue-900/60"
        style={{ background: 'linear-gradient(90deg, #041B4D 0%, #0d2d6e 50%, #041B4D 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold mb-1">{t('cta_title')}</h2>
            <p className="text-blue-300 text-sm">{t('cta_sub')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/#generateur"
              className="px-6 py-3 rounded-xl font-bold text-white text-sm text-center shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
            >
              {t('cta_btn')}
            </Link>
            <Link
              href="/inscription"
              className="px-6 py-3 rounded-xl font-semibold text-white text-sm text-center border border-white/20 hover:bg-white/10 transition-colors"
            >
              {t('cta_account')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <div className="mb-4">
              <Logo size="sm" dark />
            </div>
            <p className="text-sm text-blue-200 leading-relaxed mb-5 max-w-xs">
              {t('tagline')}
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
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: s.color }}
                >
                  <s.Icon size={16} />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-5 space-y-2 text-xs text-blue-300">
              <p>📧 <a href="mailto:contact@qrcode-express.com" className="hover:text-white transition-colors">contact@qrcode-express.com</a></p>
              <p>📞 +225 27 22 27 60 14</p>
              <p>📱 <a href="https://wa.me/2250778882592" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp : +225 07 78 88 25 92</a></p>
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
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <p>{t('copyright').replace('{year}', String(YEAR))}</p>
            <span className="hidden sm:inline text-blue-800">·</span>
            <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6A00] transition-colors">ibigsoft.com</a>
            <span className="hidden sm:inline text-blue-800">·</span>
            <a href="https://intermark-business.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6A00] transition-colors">intermark-business.com</a>
          </div>
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
