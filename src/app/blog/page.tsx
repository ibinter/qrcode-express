import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BLOG_ARTICLES } from './articles'

export const metadata: Metadata = {
  title: 'Blog QR CODE EXPRESS — Guides & Tutoriels',
  description: 'Guides pratiques sur les QR codes pour les professionnels d\'Afrique de l\'Ouest. Menu restaurant, paiement Mobile Money, carte de visite numérique, WhatsApp.',
  openGraph: {
    title: 'Blog QR CODE EXPRESS — Guides & Tutoriels',
    description: 'Guides pratiques sur les QR codes pour les professionnels africains.',
    url: 'https://qrcode-express.com/blog',
    type: 'website',
    images: [{ url: 'https://qrcode-express.com/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://qrcode-express.com/blog' },
}

const TAGS = ['Tous', 'Restaurant', 'WhatsApp', 'Professionnel', 'Guide', 'Paiement', 'Débutant']

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="bg-[#041B4D] text-white rounded-2xl p-8 sm:p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 20%, #FF6A00, transparent 60%)' }} />
            <div className="relative">
              <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Ressources</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Blog & Tutoriels QR CODE</h1>
              <p className="text-blue-200 text-sm max-w-xl">
                Guides pratiques pour les commerçants, prestataires et entrepreneurs d&apos;Afrique de l&apos;Ouest.
              </p>
            </div>
          </div>

          {/* JSON-LD Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Blog',
                name: 'Blog QR CODE EXPRESS',
                url: 'https://qrcode-express.com/blog',
                description: 'Guides et tutoriels sur les QR codes pour les professionnels africains.',
                publisher: {
                  '@type': 'Organization',
                  name: 'IBIG SOFT',
                  url: 'https://qrcode-express.com',
                  logo: { '@type': 'ImageObject', url: 'https://qrcode-express.com/icon-192.png' },
                },
              }),
            }}
          />

          {/* Articles grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {BLOG_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Top color bar */}
                <div className="h-1.5 w-full" style={{ background: article.tagColor }} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-3xl">{article.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: `${article.tagColor}18`, color: article.tagColor }}>
                      {article.tag}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-[#041B4D] group-hover:text-[#FF6A00] transition-colors leading-snug mb-2 flex-1">
                    {article.title}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{article.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>⏱ {article.readTime}</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="font-bold text-[#041B4D] mb-1 text-base">Prêt à créer votre premier QR ?</p>
            <p className="text-gray-500 text-sm mb-4">Gratuit, sans inscription requise.</p>
            <Link href="/#generateur"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
              Essayer maintenant →
            </Link>
          </div>

          {/* Nav */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/guide" className="text-gray-500 hover:text-[#FF6A00] transition-colors">📚 Centre d&apos;aide</Link>
            <Link href="/fonctionnalites" className="text-gray-500 hover:text-[#FF6A00] transition-colors">✦ Fonctionnalités</Link>
            <Link href="/" className="text-[#FF6A00] hover:underline font-medium">← Accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
