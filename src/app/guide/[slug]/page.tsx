import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ARTICLES, CATEGORIES, getArticle, getArticlesByCategory } from '../articles'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const art = getArticle(slug)
  if (!art) return {}
  return {
    title: `${art.title} | Aide QR CODE EXPRESS`,
    description: art.description,
    openGraph: {
      title: art.title,
      description: art.description,
      url: `https://qrcode-express.com/guide/${slug}`,
      type: 'article',
      images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: art.title, description: art.description },
    alternates: { canonical: `https://qrcode-express.com/guide/${slug}` },
  }
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const art = getArticle(slug)
  if (!art) notFound()

  const category = CATEGORIES.find((c) => c.slug === art.category)
  const related = getArticlesByCategory(art.category).filter((a) => a.slug !== slug).slice(0, 3)

  const stepsSection = art.content.find((s) => s.type === 'steps' && s.items?.length)
  const guideJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://qrcode-express.com' },
        { '@type': 'ListItem', position: 2, name: 'Centre d\'aide', item: 'https://qrcode-express.com/guide' },
        { '@type': 'ListItem', position: 3, name: art.title, item: `https://qrcode-express.com/guide/${slug}` },
      ],
    },
    stepsSection ? {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: art.title,
      description: art.description,
      step: stepsSection.items?.map((item, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text: item,
      })) ?? [],
    } : {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: art.title,
      description: art.description,
      author: { '@type': 'Organization', name: 'IBIG SOFT', url: 'https://qrcode-express.com' },
      publisher: { '@type': 'Organization', name: 'QR CODE EXPRESS', url: 'https://qrcode-express.com' },
    },
  ]

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sticky top-6">
                <Link href="/dashboard"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-white mb-3 hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #041B4D, #0d2d6e)' }}>
                  ← Dashboard
                </Link>
                <Link href="/guide" className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#FF6A00] mb-4 transition-colors">
                  ← Centre d&apos;aide
                </Link>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                  {category?.icon} {category?.label}
                </p>
                <nav className="space-y-0.5">
                  {getArticlesByCategory(art.category).map((a) => (
                    <Link key={a.slug} href={`/guide/${a.slug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        a.slug === slug
                          ? 'bg-[#FF6A00] text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}>
                      <span>{a.icon}</span>
                      <span className="truncate">{a.title}</span>
                    </Link>
                  ))}
                </nav>

                {/* All categories */}
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 mt-4 pt-4 border-t border-gray-100">
                  Autres catégories
                </p>
                <nav className="space-y-0.5">
                  {CATEGORIES.filter((c) => c.slug !== art.category).map((c) => (
                    <Link key={c.slug} href={`/guide#${c.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                <Link href="/guide" className="hover:text-[#FF6A00] transition-colors">Aide</Link>
                <span>/</span>
                <Link href={`/guide#${art.category}`} className="hover:text-[#FF6A00] transition-colors">{category?.label}</Link>
                <span>/</span>
                <span className="text-gray-600 font-medium truncate">{art.title}</span>
              </nav>

              {/* Article header */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-5">
                <div className="flex items-start gap-4">
                  <span className="text-4xl shrink-0">{art.icon}</span>
                  <div>
                    <h1 className="text-xl font-extrabold text-[#041B4D] leading-tight mb-1">{art.title}</h1>
                    <p className="text-sm text-gray-500">{art.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2">⏱ Lecture : {art.readTime}</p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {art.content.map((section, i) => {
                  if (section.type === 'intro') return (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                      <p className="text-sm text-[#041B4D] leading-relaxed">{section.text}</p>
                    </div>
                  )

                  if (section.type === 'steps') return (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                      {section.title && (
                        <h2 className="text-sm font-extrabold text-[#041B4D] mb-4 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FF6A00] text-white text-[10px] font-black flex items-center justify-center shrink-0">✓</span>
                          {section.title}
                        </h2>
                      )}
                      <ol className="space-y-3">
                        {section.items?.map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-orange-50 text-[#FF6A00] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              {j + 1}
                            </span>
                            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )

                  if (section.type === 'tip') return (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-3">
                      <span className="text-xl shrink-0">💡</span>
                      <div>
                        {section.title && <p className="text-sm font-bold text-green-800 mb-1">{section.title}</p>}
                        <p className="text-sm text-green-700 leading-relaxed">{section.text}</p>
                      </div>
                    </div>
                  )

                  if (section.type === 'warning') return (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
                      <span className="text-xl shrink-0">⚠️</span>
                      <div>
                        {section.title && <p className="text-sm font-bold text-amber-800 mb-1">{section.title}</p>}
                        <p className="text-sm text-amber-700 leading-relaxed">{section.text}</p>
                      </div>
                    </div>
                  )

                  if (section.type === 'faq') return (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                      <h2 className="text-sm font-extrabold text-[#041B4D] mb-4">❓ Questions fréquentes</h2>
                      <div className="space-y-4">
                        {section.pairs?.map((pair, j) => (
                          <div key={j} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                            <p className="text-sm font-semibold text-[#041B4D] mb-1">Q : {pair.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">→ {pair.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )

                  if (section.type === 'cta') return (
                    <div key={i} className="text-center py-2">
                      <Link href={section.href ?? '/'}
                        className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                        {section.label}
                      </Link>
                    </div>
                  )

                  return null
                })}
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wide mb-3">Articles connexes</h2>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {related.map((a) => (
                      <Link key={a.slug} href={`/guide/${a.slug}`}
                        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                        <p className="text-xl mb-1">{a.icon}</p>
                        <p className="text-xs font-bold text-[#041B4D] group-hover:text-[#FF6A00] transition-colors leading-tight">{a.title}</p>
                        <p className="text-[10px] text-gray-400 mt-1">⏱ {a.readTime}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="mt-6 bg-gradient-to-r from-[#041B4D] to-[#0d2d6e] rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">Cet article vous a aidé ?</p>
                  <p className="text-blue-200 text-xs mt-0.5">Contactez-nous si vous avez d&apos;autres questions.</p>
                </div>
                <a href="mailto:support@qrcode-express.com"
                  className="shrink-0 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                  ✉️ Contacter le support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
