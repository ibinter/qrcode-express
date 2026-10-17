import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function CTAFinal() {
  const t = await getTranslations('ctaFinal')

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0a2d7a 50%, #1a1035 100%)' }} />

      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FF6A00 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Badge */}
        <span className="inline-block bg-white/10 text-[#FF6A00] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/10">
          {t('badge')}
        </span>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 whitespace-pre-line">
          {t('title')}
        </h2>

        <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/inscription"
            className="px-10 py-4 rounded-2xl font-bold text-white text-lg shadow-2xl hover:scale-105 hover:shadow-orange-500/40 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)', boxShadow: '0 8px 32px rgba(255,106,0,0.5)' }}
          >
            {t('btn_primary')}
          </Link>
          <Link
            href="#generateur"
            className="px-10 py-4 rounded-2xl font-semibold text-white text-lg border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            {t('btn_secondary')}
          </Link>
        </div>

        {/* Trust bullets */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/50">
          {(['trust_0', 'trust_1', 'trust_2', 'trust_3'] as const).map((key) => (
            <span key={key} className="flex items-center gap-1">{t(key)}</span>
          ))}
        </div>

        {/* Social proof mini */}
        <div className="mt-12 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {['KB', 'FD', 'AK', 'SA', 'IC'].map((initials, i) => (
              <div key={i}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-[#041B4D]"
                style={{ background: ['#FF6A00', '#7c3aed', '#ec4899', '#0ea5e9', '#16a34a'][i] }}>
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/60">
            <strong className="text-white">{t('social_count')}</strong> {t('social_text')}
          </p>
        </div>
      </div>
    </section>
  )
}
