import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'
const APP_NAME = 'QR CODE EXPRESS'
const DEFAULT_IMAGE = `${APP_URL}/og-default.png`

export function buildMeta(opts: {
  title: string
  description?: string
  image?: string | null
  url?: string
  type?: 'website' | 'article'
}): Metadata {
  const title = opts.title ? `${opts.title} · ${APP_NAME}` : APP_NAME
  const description = opts.description || 'Scannez ce QR code pour accéder au contenu.'
  const image = opts.image || DEFAULT_IMAGE
  const url = opts.url || APP_URL

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: opts.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
