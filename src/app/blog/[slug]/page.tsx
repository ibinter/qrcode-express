import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BLOG_ARTICLES, getBlogArticle } from '../articles'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) return {}
  return {
    title: `${article.title} | QR CODE EXPRESS`,
    description: article.description,
    keywords: article.keywords.join(', '),
    authors: [{ name: 'IBIG SOFT', url: 'https://qrcode-express.com' }],
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://qrcode-express.com/blog/${article.slug}`,
      type: 'article',
      publishedTime: article.dateISO,
      authors: ['IBIG SOFT'],
      images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: ['https://qrcode-express.com/og-default.png'],
    },
    alternates: { canonical: `https://qrcode-express.com/blog/${article.slug}` },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://qrcode-express.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://qrcode-express.com/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://qrcode-express.com/blog/${article.slug}` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.dateISO,
    dateModified: article.dateISO,
    author: {
      '@type': 'Organization',
      name: 'IBIG SOFT',
      url: 'https://qrcode-express.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'QR CODE EXPRESS par IBIG SOFT',
      url: 'https://qrcode-express.com',
      logo: { '@type': 'ImageObject', url: 'https://qrcode-express.com/icon-192.png' },
    },
    image: 'https://qrcode-express.com/og-default.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://qrcode-express.com/blog/${article.slug}`,
    },
    keywords: article.keywords.join(', '),
  },
  ]

  const otherArticles = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#FF6A00] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#FF6A00] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Article */}
          <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Top color bar */}
            <div className="h-2 w-full" style={{ background: article.tagColor }} />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ background: `${article.tagColor}18`, color: article.tagColor }}>
                  {article.tag}
                </span>
                <span className="text-xs text-gray-400">{article.date}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">⏱ {article.readTime}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041B4D] leading-snug mb-4">
                {article.icon} {article.title}
              </h1>

              <p className="text-gray-500 text-base leading-relaxed mb-6 pb-6 border-b border-gray-100">
                {article.description}
              </p>

              {/* Intro */}
              <p className="text-gray-700 leading-relaxed mb-8 text-[15px]">{article.intro}</p>

              {/* Sections */}
              {article.sections.map((section, i) => (
                <section key={i} className="mb-8">
                  <h2 className="text-lg font-bold text-[#041B4D] mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full inline-block flex-shrink-0"
                      style={{ background: article.tagColor }} />
                    {section.h2}
                  </h2>

                  {section.paragraphs?.map((p, j) => (
                    <p key={j} className="text-gray-700 leading-relaxed mb-3 text-[15px]">{p}</p>
                  ))}

                  {section.items && (
                    <ul className="space-y-2 mt-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-[15px] text-gray-700">
                          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ background: article.tagColor }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* Conclusion */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                <p className="text-gray-700 leading-relaxed text-[15px] italic">{article.conclusion}</p>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-[#041B4D] to-[#0f2d6e] rounded-2xl p-6 text-white text-center">
                <p className="font-extrabold text-lg mb-1">Prêt à vous lancer ?</p>
                <p className="text-blue-200 text-sm mb-4">Gratuit — aucune carte bancaire requise.</p>
                <Link href={article.ctaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
                  {article.ctaLabel}
                </Link>
              </div>
            </div>
          </article>

          {/* Keywords (SEO) */}
          <div className="mt-6 flex flex-wrap gap-2">
            {article.keywords.map((kw) => (
              <span key={kw} className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2.5 py-1 rounded-full">
                {kw}
              </span>
            ))}
          </div>

          {/* Related articles */}
          {otherArticles.length > 0 && (
            <div className="mt-10">
              <h2 className="text-base font-bold text-[#041B4D] mb-4">Articles connexes</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {otherArticles.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex gap-3">
                    <span className="text-2xl shrink-0">{a.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#041B4D] group-hover:text-[#FF6A00] transition-colors leading-tight line-clamp-2">
                        {a.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">⏱ {a.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-8 flex justify-center">
            <Link href="/blog" className="text-sm text-gray-500 hover:text-[#FF6A00] transition-colors">
              ← Retour au blog
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
