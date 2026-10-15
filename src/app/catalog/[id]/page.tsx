import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export const instant = false

interface Product {
  name: string
  price: string
  description?: string
  image?: string
  available?: boolean
}

interface Category {
  name: string
  products: Product[]
}

interface CatalogData {
  store?: string
  description?: string
  whatsapp?: string
  currency?: string
  logo?: string
  color?: string
  categories?: Category[]
}

export default async function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, name, status')
    .eq('id', id)
    .eq('type', 'catalog')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let catalog: CatalogData = {}
  try { catalog = JSON.parse(qr.content) } catch {}

  const accent = catalog.color || '#041B4D'
  const currency = catalog.currency || 'FCFA'
  const categories = catalog.categories || []

  function buildWhatsAppMsg(productName: string, price: string) {
    const msg = `Bonjour, je voudrais commander : *${productName}* (${price} ${currency})${catalog.store ? ` chez *${catalog.store}*` : ''}.`
    return `https://wa.me/${(catalog.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ background: accent }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {catalog.logo ? (
            <img src={catalog.logo} alt={catalog.store || ''} className="w-10 h-10 rounded-xl object-cover border-2 border-white/30" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold text-white">
              {catalog.store?.[0]?.toUpperCase() ?? '🛍️'}
            </div>
          )}
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{catalog.store || 'Catalogue'}</h1>
            {catalog.description && (
              <p className="text-white/70 text-xs">{catalog.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="font-semibold">Catalogue vide</p>
          </div>
        ) : (
          categories.map((cat, ci) => (
            <section key={ci}>
              {/* Category title */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <h2 className="text-sm font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: accent }}>
                  {cat.name}
                </h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-2 gap-3">
                {(cat.products || []).filter((p) => p.available !== false).map((product, pi) => (
                  <div key={pi} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    {/* Product image */}
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-28 flex items-center justify-center text-3xl bg-gray-50">
                        🛒
                      </div>
                    )}

                    <div className="p-3 flex flex-col flex-1">
                      <p className="font-semibold text-[#041B4D] text-sm leading-tight mb-1">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="font-bold text-sm" style={{ color: accent }}>
                          {product.price} {currency}
                        </span>
                        {catalog.whatsapp && (
                          <a
                            href={buildWhatsAppMsg(product.name, product.price)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-80"
                            style={{ background: '#25D366' }}
                          >
                            Commander
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        {/* WhatsApp global CTA */}
        {catalog.whatsapp && (
          <div className="sticky bottom-4">
            <a
              href={`https://wa.me/${catalog.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je souhaite passer une commande${catalog.store ? ` chez ${catalog.store}` : ''}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              💬 Commander sur WhatsApp
            </a>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          Propulsé par <span className="font-semibold text-[#041B4D]">QR CODE EXPRESS</span>
        </p>
      </div>
    </main>
  )
}
