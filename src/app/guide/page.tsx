import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CATEGORIES, ARTICLES } from './articles'

export const metadata: Metadata = {
  title: 'Centre d\'aide | QR CODE EXPRESS',
  description: 'Guides, tutoriels et FAQ pour maîtriser QR CODE EXPRESS. Créer des QR codes, comprendre les statistiques, gérer votre compte.',
}

export default function GuidePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <div className="relative">
              <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Centre d&apos;aide</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Comment pouvons-nous vous aider ?</h1>
              <p className="text-blue-200 text-sm max-w-xl">
                Guides pas-à-pas, FAQ et bonnes pratiques pour tirer le meilleur de QR CODE EXPRESS.
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
            {CATEGORIES.map((cat) => {
              const count = ARTICLES.filter((a) => a.category === cat.slug).length
              return (
                <Link key={cat.slug} href={`#${cat.slug}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                  <p className="text-2xl mb-2">{cat.icon}</p>
                  <p className="text-sm font-bold text-[#041B4D] group-hover:text-[#FF6A00] transition-colors">{cat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{count} article{count > 1 ? 's' : ''}</p>
                </Link>
              )
            })}
          </div>

          {/* Articles par catégorie */}
          <div className="space-y-10">
            {CATEGORIES.map((cat) => {
              const arts = ARTICLES.filter((a) => a.category === cat.slug)
              if (!arts.length) return null
              return (
                <section key={cat.slug} id={cat.slug}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{cat.icon}</span>
                    <h2 className="text-lg font-extrabold text-[#041B4D]">{cat.label}</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{arts.length}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {arts.map((art) => (
                      <Link key={art.slug} href={`/guide/${art.slug}`}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex gap-3">
                        <span className="text-2xl shrink-0">{art.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#041B4D] group-hover:text-[#FF6A00] transition-colors leading-tight mb-1">
                            {art.title}
                          </p>
                          <p className="text-[11px] text-gray-500 line-clamp-2">{art.description}</p>
                          <p className="text-[10px] text-gray-400 mt-2">⏱ {art.readTime}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          {/* Support CTA */}
          <div className="mt-12 bg-gradient-to-r from-[#041B4D] to-[#0d2d6e] rounded-2xl p-6 text-white text-center">
            <p className="text-xl font-extrabold mb-1">Vous ne trouvez pas la réponse ?</p>
            <p className="text-blue-200 text-sm mb-5">Notre équipe est disponible pour vous aider.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="https://wa.me/message/XXXXXXXXXXXXXXX" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-green-500 text-white hover:opacity-90 transition-opacity">
                💬 WhatsApp
              </a>
              <a href="mailto:support@qrcode-express.com"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">
                ✉️ Email support
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
