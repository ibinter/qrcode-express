import { MetadataRoute } from 'next'
import { BLOG_ARTICLES } from './blog/articles'
import { ARTICLES as GUIDE_ARTICLES } from './guide/articles'

const BASE = 'https://qrcode-express.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    { url: BASE, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${BASE}/tarifs`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${BASE}/blog`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${BASE}/guide`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE}/fonctionnalites`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE}/inscription`, priority: 0.7, changeFrequency: 'yearly' as const },
    { url: `${BASE}/connexion`, priority: 0.6, changeFrequency: 'yearly' as const },
    { url: `${BASE}/parrainage`, priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  const blogPages = BLOG_ARTICLES.map((article) => ({
    url: `${BASE}/blog/${article.slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
    lastModified: new Date(article.dateISO),
  }))

  const guidePages = GUIDE_ARTICLES.map((article) => ({
    url: `${BASE}/guide/${article.slug}`,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
    lastModified: now,
  }))

  return [
    ...staticPages.map((p) => ({ ...p, lastModified: now })),
    ...blogPages,
    ...guidePages,
  ]
}
