import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PixelSnippets from '@/components/PixelSnippets'

export const instant = false


interface MenuItem { name: string; price: string; description?: string }
interface MenuCategory { category: string; items: MenuItem[] }
interface MenuData { restaurant: string; description?: string; categories: MenuCategory[] }

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin
    .from('qr_codes')
    .select('content, name, status, design')
    .eq('id', id)
    .eq('type', 'menu')
    .single()

  if (!qr || qr.status === 'archived') notFound()

  let menu: MenuData = { restaurant: qr.name || 'Menu', categories: [] }
  try { menu = JSON.parse(qr.content) } catch {}
  const pixels = (qr.design as Record<string, unknown>)?.pixels as any

  return (
    <main className="min-h-screen bg-gray-50">
      <PixelSnippets pixels={pixels} />
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-[#041B4D] text-white px-6 pt-10 pb-8 text-center">
          <h1 className="text-2xl font-bold mb-1">{menu.restaurant}</h1>
          {menu.description && <p className="text-blue-200 text-sm">{menu.description}</p>}
        </div>

        {/* Categories */}
        <div className="px-4 py-6 space-y-6">
          {menu.categories.map((cat, ci) => (
            <div key={ci}>
              <h2 className="text-sm font-bold text-[#FF6A00] uppercase tracking-wider mb-3 px-1">{cat.category}</h2>
              <div className="space-y-2">
                {cat.items.map((item, ii) => (
                  <div key={ii} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-[#041B4D] text-sm">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                    </div>
                    {item.price && (
                      <span className="font-bold text-[#FF6A00] text-sm whitespace-nowrap">{item.price}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!menu.categories.length && (
            <p className="text-center text-gray-400 py-8">Menu en cours de préparation…</p>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 pb-6">
          Propulsé par <span className="text-[#FF6A00] font-semibold">QR CODE EXPRESS</span>
        </p>
      </div>
    </main>
  )
}
