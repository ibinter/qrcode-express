'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useTranslations } from 'next-intl'

const YEAR = 2026

const SOCIAL = [
  {
    label: 'WhatsApp', href: 'https://wa.me/2250778882592', color: '#25d366',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  },
  {
    label: 'Facebook', href: 'https://facebook.com/qrcodeexpress', color: '#1877f2',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    label: 'Instagram', href: 'https://instagram.com/qrcodeexpress', color: '#e1306c',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
  {
    label: 'TikTok', href: 'https://tiktok.com/@qrcodeexpress', color: '#ffffff',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>,
  },
  {
    label: 'LinkedIn', href: 'https://linkedin.com/company/ibigsoft', color: '#0a66c2',
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
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
                  {s.svg}
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
