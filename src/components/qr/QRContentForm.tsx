'use client'
import { useState, useRef } from 'react'
import { QRType } from '@/lib/types'
import { Upload, FileText, X, Link2 } from 'lucide-react'
import ImageUploadField from './ImageUploadField'

function ShortenButton({ url, onShortened }: { url: string; onShortened: (short: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!url || !url.startsWith('http')) return null

  async function shorten() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (json.shortUrl) {
        onShortened(json.shortUrl)
        setDone(true)
      } else {
        setError(json.error || 'Erreur')
      }
    } catch {
      setError('Erreur réseau')
    }
    setLoading(false)
  }

  return (
    <div className="mt-1.5">
      {done ? (
        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
          <Link2 size={12} /> Lien raccourci ✓
        </p>
      ) : (
        <button
          type="button"
          onClick={shorten}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6A00] hover:text-orange-700 transition-colors disabled:opacity-50"
        >
          <Link2 size={12} />
          {loading ? 'Raccourcissement…' : '⚡ Raccourcir ce lien'}
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

interface Props {
  type: QRType
  data: Record<string, string>
  onChange: (data: Record<string, string>) => void
}

function Field({ label, name, type = 'text', placeholder, data, onChange, required }: {
  label: string; name: string; type?: string; placeholder?: string
  data: Record<string, string>; onChange: (d: Record<string, string>) => void; required?: boolean
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={data[name] || ''}
        onChange={(e) => onChange({ ...data, [name]: e.target.value })}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
      />
    </div>
  )
}

function MenuForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.menu_json ? JSON.parse(data.menu_json) : {
    restaurant: '', description: '', categories: [],
    cover: '', logo: '', phone: '', whatsapp: '', website: '',
    facebook: '', instagram: '', tiktok: '', address: '', map_url: '',
    color: '#FF6A00', theme: 'light', hours: {},
  }

  function update(patch: object) {
    onChange({ ...data, menu_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  function addCategory() {
    update({ categories: [...(parsed.categories || []), { category: 'Nouvelle catégorie', items: [] }] })
  }

  function removeCategory(ci: number) {
    update({ categories: parsed.categories.filter((_: any, i: number) => i !== ci) })
  }

  function updateCategory(ci: number, name: string) {
    const cats = [...parsed.categories]
    cats[ci] = { ...cats[ci], category: name }
    update({ categories: cats })
  }

  function addItem(ci: number) {
    const cats = [...parsed.categories]
    cats[ci] = { ...cats[ci], items: [...(cats[ci].items || []), { name: '', price: '', description: '', photo: '', available: true }] }
    update({ categories: cats })
  }

  function updateItem(ci: number, ii: number, field: string, value: string | boolean) {
    const cats = [...parsed.categories]
    cats[ci].items[ii] = { ...cats[ci].items[ii], [field]: value }
    update({ categories: cats })
  }

  function removeItem(ci: number, ii: number) {
    const cats = [...parsed.categories]
    cats[ci].items = cats[ci].items.filter((_: any, i: number) => i !== ii)
    update({ categories: cats })
  }

  function updateHours(day: string, field: string, value: string | boolean) {
    const hours = { ...(parsed.hours || {}) }
    hours[day] = { ...(hours[day] || { open: '08:00', close: '22:00', closed: false }), [field]: value }
    update({ hours })
  }

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  const themes = [{ v: 'light', l: '☀️ Clair' }, { v: 'dark', l: '🌙 Sombre' }, { v: 'gradient', l: '🌈 Gradient' }]
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-3 pb-1 border-t border-gray-100 mt-2'

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      {/* Identité */}
      <input value={parsed.restaurant || ''} onChange={(e) => update({ restaurant: e.target.value })}
        placeholder="Nom du restaurant *" className={inp} />
      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description / slogan" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />

      {/* Visuels */}
      <p className={sec}>Visuels &amp; Apparence</p>
      <ImageUploadField label="Photo de couverture (bannière)" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="1200×400 recommandé" />
      <ImageUploadField label="Logo du restaurant" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Format carré" />
      <div className="flex gap-2">
        {themes.map(t => (
          <button key={t.v} type="button" onClick={() => update({ theme: t.v })}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${parsed.theme === t.v ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'bg-white text-gray-600 border-gray-200'}`}>
            {t.l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 flex-1">Couleur accent</label>
        <input type="color" value={parsed.color || '#FF6A00'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>

      {/* Contact */}
      <p className={sec}>Contact</p>
      <input type="tel" value={parsed.phone || ''} onChange={(e) => update({ phone: e.target.value })}
        placeholder="Téléphone (ex: +225 07 00 00 00)" className={inp} />
      <input type="tel" value={parsed.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp (ex: +22507000000)" className={inp} />
      <input type="url" value={parsed.website || ''} onChange={(e) => update({ website: e.target.value })}
        placeholder="Site web (https://...)" className={inp} />
      <input value={parsed.address || ''} onChange={(e) => update({ address: e.target.value })}
        placeholder="Adresse complète" className={inp} />
      <input type="url" value={parsed.map_url || ''} onChange={(e) => update({ map_url: e.target.value })}
        placeholder="Lien Google Maps (https://maps.google.com/...)" className={inp} />

      {/* Réseaux sociaux */}
      <p className={sec}>Réseaux sociaux</p>
      <input type="url" value={parsed.facebook || ''} onChange={(e) => update({ facebook: e.target.value })}
        placeholder="Facebook (https://facebook.com/...)" className={inp} />
      <input type="url" value={parsed.instagram || ''} onChange={(e) => update({ instagram: e.target.value })}
        placeholder="Instagram (https://instagram.com/...)" className={inp} />
      <input type="url" value={parsed.tiktok || ''} onChange={(e) => update({ tiktok: e.target.value })}
        placeholder="TikTok (https://tiktok.com/@...)" className={inp} />

      {/* Horaires */}
      <p className={sec}>Horaires d&apos;ouverture</p>
      {days.map(day => {
        const h = ((parsed.hours || {}) as Record<string, { open: string; close: string; closed: boolean }>)[day] || { open: '08:00', close: '22:00', closed: false }
        return (
          <div key={day} className="flex items-center gap-2 text-xs">
            <span className="w-14 font-semibold text-gray-600 shrink-0">{day.slice(0, 3)}</span>
            <input type="time" value={h.open || '08:00'} disabled={h.closed}
              onChange={(e) => updateHours(day, 'open', e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none disabled:opacity-40" />
            <span className="text-gray-400">—</span>
            <input type="time" value={h.close || '22:00'} disabled={h.closed}
              onChange={(e) => updateHours(day, 'close', e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none disabled:opacity-40" />
            <label className="flex items-center gap-1 shrink-0 cursor-pointer text-gray-500">
              <input type="checkbox" checked={!!h.closed} onChange={(e) => updateHours(day, 'closed', e.target.checked)} className="rounded" />
              Fermé
            </label>
          </div>
        )
      })}

      {/* Menu */}
      <p className={sec}>Menu / Plats</p>
      {(parsed.categories || []).map((cat: any, ci: number) => (
        <div key={ci} className="border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <input value={cat.category} onChange={(e) => updateCategory(ci, e.target.value)}
              className="flex-1 font-semibold text-sm border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40" />
            <button type="button" onClick={() => removeCategory(ci)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
          </div>
          {(cat.items || []).map((item: any, ii: number) => (
            <div key={ii} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
              <div className="flex gap-2 items-center">
                <input value={item.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)}
                  placeholder="Nom du plat" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                <input value={item.price} onChange={(e) => updateItem(ci, ii, 'price', e.target.value)}
                  placeholder="Prix" className="w-20 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                <button type="button" onClick={() => removeItem(ci, ii)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
              <input value={item.description || ''} onChange={(e) => updateItem(ci, ii, 'description', e.target.value)}
                placeholder="Description (ingrédients, allergènes…)" className="w-full border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ImageUploadField label="Photo du plat" value={item.photo || ''} onChange={(url) => updateItem(ci, ii, 'photo', url)} hint="Optionnel" />
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer shrink-0">
                  <input type="checkbox" checked={item.available !== false} onChange={(e) => updateItem(ci, ii, 'available', e.target.checked)} className="rounded" />
                  Dispo
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addItem(ci)} className="text-xs text-[#FF6A00] font-semibold hover:underline">+ Ajouter un plat</button>
        </div>
      ))}
      <button type="button" onClick={addCategory} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors">
        + Ajouter une catégorie
      </button>
    </div>
  )
}

function CouponForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.coupon_json ? JSON.parse(data.coupon_json) : {}

  function update(patch: object) {
    onChange({ ...data, coupon_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'

  return (
    <div className="space-y-3">
      <input value={parsed.title || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre du coupon (ex: Offre spéciale)" className={inp} />
      <input value={parsed.brand || ''} onChange={(e) => update({ brand: e.target.value })}
        placeholder="Nom de la marque / boutique" className={inp} />
      <input value={parsed.discount || ''} onChange={(e) => update({ discount: e.target.value })}
        placeholder="Réduction (ex: -20%, 500 FCFA offerts)" className={inp} />
      <input value={parsed.code || ''} onChange={(e) => update({ code: e.target.value })}
        placeholder="Code promo (ex: PROMO2025)" className={`${inp} font-mono`} />
      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description / conditions d'utilisation" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date d&apos;expiration</label>
          <input type="date" value={parsed.expires || ''} onChange={(e) => update({ expires: e.target.value })}
            className={inp} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nombre max d&apos;utilisations</label>
          <input type="number" min={1} value={parsed.max_uses || ''} onChange={(e) => update({ max_uses: e.target.value })}
            placeholder="ex: 100" className={inp} />
        </div>
      </div>
      <input type="url" value={parsed.redeem_url || ''} onChange={(e) => update({ redeem_url: e.target.value })}
        placeholder="URL pour utiliser le coupon (optionnel)" className={inp} />
      <input value={parsed.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp pour valider (ex: +22507...)" className={inp} />
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
        <input type="color" value={parsed.color || '#FF6A00'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
        <label className="text-xs text-gray-500 whitespace-nowrap ml-2">Fond</label>
        <input type="color" value={parsed.bg_color || '#FFF7ED'} onChange={(e) => update({ bg_color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <ImageUploadField label="Bannière / Image promo" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="1200×400 recommandé" />
      <ImageUploadField label="Logo de la marque" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Format carré" />
    </div>
  )
}

function BioForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.bio_json ? JSON.parse(data.bio_json) : {
    name: '', bio: '', color: '#FF6A00', theme: 'light', links: [],
    cover: '', avatar: '', title: '', company: '', phone: '', email: '', whatsapp: '',
    show_vcard: true,
  }

  function update(patch: object) {
    onChange({ ...data, bio_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  function addLink() {
    update({ links: [...(parsed.links || []), { label: '', url: '', network: 'instagram' }] })
  }

  function updateLink(i: number, field: string, value: string) {
    const links = [...(parsed.links || [])]
    links[i] = { ...links[i], [field]: value }
    update({ links })
  }

  function removeLink(i: number) {
    update({ links: parsed.links.filter((_: any, idx: number) => idx !== i) })
  }

  function moveLink(i: number, dir: -1 | 1) {
    const links = [...(parsed.links || [])]
    const j = i + dir
    if (j < 0 || j >= links.length) return
    ;[links[i], links[j]] = [links[j], links[i]]
    update({ links })
  }

  const networks = [
    'instagram', 'tiktok', 'facebook', 'twitter', 'x', 'linkedin', 'youtube',
    'whatsapp', 'telegram', 'snapchat', 'pinterest', 'website', 'autre',
  ]

  const themes = [
    { value: 'light', label: '☀️ Clair' },
    { value: 'dark', label: '🌙 Sombre' },
    { value: 'gradient', label: '🌈 Gradient' },
  ]

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
  const sec = "text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1"

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">

      {/* Identité */}
      <input value={parsed.name || ''} onChange={(e) => update({ name: e.target.value })}
        placeholder="Nom complet ou pseudo *" className={inp} />
      <textarea value={parsed.bio || ''} onChange={(e) => update({ bio: e.target.value })}
        placeholder="Bio / description courte" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />

      {/* Section pro */}
      <p className={sec}>Infos professionnelles</p>
      <input value={parsed.title || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre / poste (ex: Designer UX)" className={inp} />
      <input value={parsed.company || ''} onChange={(e) => update({ company: e.target.value })}
        placeholder="Entreprise / marque" className={inp} />

      {/* Contact direct */}
      <p className={sec}>Contact rapide</p>
      <input type="tel" value={parsed.phone || ''} onChange={(e) => update({ phone: e.target.value })}
        placeholder="Téléphone (ex: +22600000000)" className={inp} />
      <input type="tel" value={parsed.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp (numéro)" className={inp} />
      <input type="email" value={parsed.email || ''} onChange={(e) => update({ email: e.target.value })}
        placeholder="E-mail de contact" className={inp} />

      {/* Visuels */}
      <p className={sec}>Visuels</p>
      <ImageUploadField label="Photo de profil (avatar)" value={parsed.avatar || ''} onChange={(url) => update({ avatar: url })} hint="Optionnel" />
      <ImageUploadField label="Photo de couverture (bannière)" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="Optionnel" />

      {/* Thème + couleur */}
      <p className={sec}>Apparence</p>
      <div className="flex gap-2">
        {themes.map(t => (
          <button key={t.value} onClick={() => update({ theme: t.value })}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${parsed.theme === t.value ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'bg-white text-gray-600 border-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 flex-1">Couleur accent</label>
        <input type="color" value={parsed.color || '#FF6A00'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={parsed.show_vcard !== false} onChange={(e) => update({ show_vcard: e.target.checked })} className="rounded" />
        Afficher bouton "Enregistrer le contact"
      </label>

      {/* Liens */}
      <p className={sec}>Liens & réseaux sociaux</p>
      {(parsed.links || []).map((link: any, i: number) => (
        <div key={i} className="bg-gray-50 rounded-xl p-2 space-y-1.5 border border-gray-100">
          <div className="flex gap-2 items-center">
            <select value={link.network || 'autre'} onChange={(e) => updateLink(i, 'network', e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none w-32 bg-white">
              {networks.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="flex gap-1 ml-auto">
              <button onClick={() => moveLink(i, -1)} className="text-gray-400 text-xs px-1 hover:text-gray-600">↑</button>
              <button onClick={() => moveLink(i, 1)} className="text-gray-400 text-xs px-1 hover:text-gray-600">↓</button>
              <button onClick={() => removeLink(i)} className="text-red-400 text-xs px-1 hover:text-red-600">✕</button>
            </div>
          </div>
          <input value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)}
            placeholder="Texte du bouton" className="w-full border border-gray-100 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40" />
          <input value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)}
            placeholder="URL (https://...)" className="w-full border border-gray-100 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40" />
        </div>
      ))}
      <button onClick={addLink} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors">
        + Ajouter un lien
      </button>
    </div>
  )
}

function AppForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'

  function updateApp(patch: Partial<{ ios: string; android: string; fallback: string }>) {
    const current = data.app_json ? JSON.parse(data.app_json) : {}
    const updated = { ...current, ...patch }
    onChange({ ...data, app_json: JSON.stringify(updated), url: `${appUrl}/app/${data.app_slug || 'mon-app'}` })
  }

  const parsed = data.app_json ? JSON.parse(data.app_json) : {}

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Le QR détecte l&apos;appareil et redirige automatiquement vers l&apos;App Store ou le Play Store.</p>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
          🍎 Lien App Store (iOS)
        </label>
        <input type="url" value={parsed.ios || ''} placeholder="https://apps.apple.com/app/id..."
          onChange={(e) => updateApp({ ios: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
          🤖 Lien Play Store (Android)
        </label>
        <input type="url" value={parsed.android || ''} placeholder="https://play.google.com/store/apps/details?id=..."
          onChange={(e) => updateApp({ android: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">🖥️ Lien de secours (desktop)</label>
        <input type="url" value={parsed.fallback || ''} placeholder="https://monsite.com/telecharger"
          onChange={(e) => updateApp({ fallback: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      </div>

      {(parsed.ios || parsed.android) && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
          ✅ QR prêt — redirige automatiquement iOS → App Store, Android → Play Store
        </div>
      )}
    </div>
  )
}

function PDFForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file || file.type !== 'application/pdf') { setError('Fichier PDF uniquement.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Max 10 Mo.'); return }
    setUploading(true); setError('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload/pdf', { method: 'POST', body: form })
    const json = await res.json()
    if (json.url) {
      onChange({ ...data, pdf_url: json.url, pdf_name: file.name })
    } else {
      setError(json.error || 'Erreur upload.')
    }
    setUploading(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">Le QR code ouvrira directement votre PDF sur mobile et desktop.</p>

      {data.pdf_url ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText size={20} className="text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800 truncate">{data.pdf_name || 'PDF uploadé'}</p>
              <p className="text-xs text-green-600 truncate">{data.pdf_url}</p>
            </div>
            <button onClick={() => onChange({ ...data, pdf_url: '', pdf_name: '' })} className="text-gray-400 hover:text-red-500">
              <X size={16} />
            </button>
          </div>
          <ShortenButton url={data.pdf_url} onShortened={(short) => onChange({ ...data, pdf_url: short })} />
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f) }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-[#FF6A00] bg-orange-50' : 'border-gray-200 hover:border-[#FF6A00]/50'
          }`}
        >
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />
          <Upload size={28} className="mx-auto mb-2 text-gray-400" />
          {uploading ? (
            <p className="text-sm text-[#FF6A00] font-semibold">Upload en cours…</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-700">Glissez votre PDF ici</p>
              <p className="text-xs text-gray-400 mt-1">ou cliquez pour choisir un fichier · Max 10 Mo</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Ou coller un lien PDF direct</label>
        <input type="url" value={data.pdf_url || ''} placeholder="https://exemple.com/document.pdf"
          onChange={(e) => onChange({ ...data, pdf_url: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      </div>
    </div>
  )
}

export default function QRContentForm({ type, data, onChange }: Props) {
  switch (type) {
    case 'url':
      return (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">URL du site web</label>
          <input
            type="url"
            value={data.url || ''}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://monsite.com"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
          />
          <ShortenButton url={data.url || ''} onShortened={(short) => onChange({ ...data, url: short })} />
        </div>
      )
    case 'text':
      return (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Texte</label>
          <textarea
            value={data.text || ''}
            onChange={(e) => onChange({ ...data, text: e.target.value })}
            placeholder="Votre texte..."
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
          />
        </div>
      )
    case 'email':
      return <>
        <Field label="Adresse e-mail" name="email" type="email" placeholder="contact@exemple.com" data={data} onChange={onChange} required />
        <Field label="Sujet (optionnel)" name="subject" placeholder="Sujet du message" data={data} onChange={onChange} />
      </>
    case 'phone':
      return <Field label="Numéro de téléphone" name="phone" type="tel" placeholder="+225 07 00 00 00 00" data={data} onChange={onChange} required />
    case 'sms':
      return <>
        <Field label="Numéro de téléphone" name="phone" type="tel" placeholder="+225 07 00 00 00 00" data={data} onChange={onChange} required />
        <Field label="Message (optionnel)" name="message" placeholder="Votre message..." data={data} onChange={onChange} />
      </>
    case 'wifi': {
      const inp2 = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
      return (
        <div className="space-y-3">
          <Field label="Nom du réseau (SSID)" name="ssid" placeholder="MonWiFi" data={data} onChange={onChange} required />
          <Field label="Mot de passe" name="password" type="password" placeholder="••••••••" data={data} onChange={onChange} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sécurité</label>
            <select value={data.encryption || 'WPA'} onChange={(e) => onChange({ ...data, encryption: e.target.value })} className={inp2}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Aucun</option>
            </select>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Réseau masqué</p>
              <p className="text-xs text-gray-400">SSID non diffusé</p>
            </div>
            <button type="button" onClick={() => onChange({ ...data, hidden: data.hidden === 'true' ? 'false' : 'true' })}
              className={`relative w-10 h-5 rounded-full transition-colors ${data.hidden === 'true' ? 'bg-orange-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${data.hidden === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <ImageUploadField label="Logo / Image d'accueil (optionnel)" value={data.wifi_logo || ''} onChange={(url) => onChange({ ...data, wifi_logo: url })} hint="Affiché sur la page de connexion" />
          <input value={data.welcome_msg || ''} onChange={(e) => onChange({ ...data, welcome_msg: e.target.value })} placeholder="Message d'accueil (ex: Bienvenue chez nous !)" className={inp2} />
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Couleur</label>
            <input type="color" value={data.wifi_color || '#041B4D'} onChange={(e) => onChange({ ...data, wifi_color: e.target.value })}
              className="h-8 w-16 border border-gray-200 rounded cursor-pointer" />
          </div>
        </div>
      )
    }
    case 'vcard': {
      const inp3 = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
      return (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <ImageUploadField label="Photo de profil" value={data.vcard_photo || ''} onChange={(url) => onChange({ ...data, vcard_photo: url })} hint="Photo ou avatar" />
          <Field label="Nom complet" name="name" placeholder="Marie Kouassi" data={data} onChange={onChange} required />
          <Field label="Titre / Fonction" name="title" placeholder="Directrice Commerciale" data={data} onChange={onChange} />
          <Field label="Téléphone" name="phone" type="tel" placeholder="+225 07 00 00 00 00" data={data} onChange={onChange} />
          <Field label="Téléphone 2 (optionnel)" name="phone2" type="tel" placeholder="+225 05 00 00 00 00" data={data} onChange={onChange} />
          <Field label="E-mail" name="email" type="email" placeholder="contact@exemple.com" data={data} onChange={onChange} />
          <Field label="Entreprise" name="org" placeholder="IBIG SARL" data={data} onChange={onChange} />
          <Field label="Site web" name="website" type="url" placeholder="https://monsite.com" data={data} onChange={onChange} />
          <Field label="Adresse" name="address" placeholder="Abidjan, Cocody" data={data} onChange={onChange} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date de naissance (optionnel)</label>
            <input type="date" value={data.birthday || ''} onChange={(e) => onChange({ ...data, birthday: e.target.value })} className={inp3} />
          </div>
          <Field label="LinkedIn (optionnel)" name="linkedin" placeholder="https://linkedin.com/in/..." data={data} onChange={onChange} />
          <Field label="WhatsApp (optionnel)" name="whatsapp" type="tel" placeholder="+225 07 00 00 00 00" data={data} onChange={onChange} />
        </div>
      )
    }
    case 'whatsapp':
      return <>
        <Field label="Numéro WhatsApp (avec indicatif)" name="phone" placeholder="+225 07 00 00 00 00" data={data} onChange={onChange} required />
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Message prérempli (optionnel)</label>
          <textarea
            value={data.message || ''}
            onChange={(e) => onChange({ ...data, message: e.target.value })}
            placeholder="Bonjour, je souhaite..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
          />
        </div>
      </>
    case 'app':
      return <AppForm data={data} onChange={onChange} />
    case 'pdf':
      return <PDFForm data={data} onChange={onChange} />
    case 'menu':
      return <MenuForm data={data} onChange={onChange} />
    case 'coupon':
      return <CouponForm data={data} onChange={onChange} />
    case 'biolink':
      return <BioForm data={data} onChange={onChange} />
    case 'social': {
      const NETWORKS = [
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
        { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
        { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
        { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
        { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/...' },
        { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
        { key: 'whatsapp', label: 'WhatsApp', placeholder: '+225 07 00 00 00 00' },
        { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/...' },
        { key: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/...' },
        { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/...' },
        { key: 'website', label: 'Site web', placeholder: 'https://monsite.com' },
      ]
      const inp4 = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
      return (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <ImageUploadField label="Photo de profil / Avatar" value={data.social_photo || ''} onChange={(url) => onChange({ ...data, social_photo: url })} hint="Votre photo ou logo" />
          <input value={data.social_name || ''} onChange={(e) => onChange({ ...data, social_name: e.target.value })} placeholder="Votre nom / pseudo *" className={inp4} />
          <input value={data.social_bio || ''} onChange={(e) => onChange({ ...data, social_bio: e.target.value })} placeholder="Bio courte (optionnel)" className={inp4} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">Vos liens</p>
          {NETWORKS.map((n) => (
            <div key={n.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{n.label}</label>
              <input type="url" value={(data as Record<string, string>)[`social_${n.key}`] || ''} onChange={(e) => onChange({ ...data, [`social_${n.key}`]: e.target.value })}
                placeholder={n.placeholder} className={inp4} />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Couleur</label>
            <input type="color" value={data.social_color || '#041B4D'} onChange={(e) => onChange({ ...data, social_color: e.target.value })}
              className="h-8 w-16 border border-gray-200 rounded cursor-pointer" />
          </div>
        </div>
      )
    }
    case 'location': {
      const inp5 = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
      return (
        <div className="space-y-3">
          <ImageUploadField label="Photo du lieu (optionnel)" value={data.loc_photo || ''} onChange={(url) => onChange({ ...data, loc_photo: url })} hint="Photo ou image du lieu" />
          <input value={data.loc_name || ''} onChange={(e) => onChange({ ...data, loc_name: e.target.value })} placeholder="Nom du lieu (ex: Hôtel Ivoire)" className={inp5} />
          <input value={data.loc_description || ''} onChange={(e) => onChange({ ...data, loc_description: e.target.value })} placeholder="Description (optionnel)" className={inp5} />
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Option 1 — Adresse</p>
            <input value={data.loc_address || ''} onChange={(e) => onChange({ ...data, loc_address: e.target.value })} placeholder="Adresse complète" className={inp5} />
            <input type="url" value={data.loc_maps_url || ''} onChange={(e) => onChange({ ...data, loc_maps_url: e.target.value })} placeholder="Lien Google Maps (optionnel)" className={inp5} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Option 2 — Coordonnées GPS</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={data.lat || ''} onChange={(e) => onChange({ ...data, lat: e.target.value })} placeholder="Latitude (ex: 5.3484)" className={inp5} />
              <input value={data.lng || ''} onChange={(e) => onChange({ ...data, lng: e.target.value })} placeholder="Longitude (ex: -4.0167)" className={inp5} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Couleur</label>
            <input type="color" value={data.loc_color || '#041B4D'} onChange={(e) => onChange({ ...data, loc_color: e.target.value })}
              className="h-8 w-16 border border-gray-200 rounded cursor-pointer" />
          </div>
        </div>
      )
    }
    case 'event':
      return <EventForm data={data} onChange={onChange} />
    case 'lead':
      return <LeadForm data={data} onChange={onChange} />
    case 'payment':
      return <PaymentForm data={data} onChange={onChange} />
    case 'crypto':
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cryptomonnaie</label>
            <select
              value={data.coin || 'bitcoin'}
              onChange={(e) => onChange({ ...data, coin: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="litecoin">Litecoin (LTC)</option>
              <option value="bitcoincash">Bitcoin Cash (BCH)</option>
              <option value="dogecoin">Dogecoin (DOGE)</option>
              <option value="dash">Dash (DASH)</option>
              <option value="monero">Monero (XMR)</option>
              <option value="solana">Solana (SOL)</option>
              <option value="bnb">BNB / BSC (BNB)</option>
              <option value="tron">Tron (TRX)</option>
            </select>
          </div>
          <Field label="Adresse du portefeuille *" name="address" placeholder="bc1q... / 0x... / T..." data={data} onChange={onChange} required />
          <Field label="Montant (optionnel)" name="amount" placeholder="0.001" data={data} onChange={onChange} />
          <Field label="Libellé (optionnel)" name="label" placeholder="Paiement à IBIG SARL" data={data} onChange={onChange} />
          <Field label="Message (optionnel)" name="message" placeholder="Merci pour votre paiement" data={data} onChange={onChange} />
        </>
      )
    case 'vcard_plus': {
      const vp = data.vcard_json ? JSON.parse(data.vcard_json) : {}
      function updateVP(patch: object) {
        onChange({ ...data, vcard_json: JSON.stringify({ ...vp, ...patch }) })
      }
      const vcInp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
      const vcSec = "text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1"
      const vcThemes = [{ v: 'light', l: '☀️ Clair' }, { v: 'dark', l: '🌙 Sombre' }, { v: 'gradient', l: '🌈 Gradient' }]
      return (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <p className={vcSec}>Identité</p>
          <input value={vp.name || ''} onChange={(e) => updateVP({ name: e.target.value })}
            placeholder="Nom complet *" className={vcInp} />
          <input value={vp.title || ''} onChange={(e) => updateVP({ title: e.target.value })}
            placeholder="Poste / Titre (ex: Directeur Commercial)" className={vcInp} />
          <input value={vp.company || ''} onChange={(e) => updateVP({ company: e.target.value })}
            placeholder="Entreprise / Organisation" className={vcInp} />
          <textarea value={vp.note || ''} onChange={(e) => updateVP({ note: e.target.value })}
            placeholder="Note courte / slogan" rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />

          <p className={vcSec}>Contact</p>
          <input type="tel" value={vp.phone || ''} onChange={(e) => updateVP({ phone: e.target.value })}
            placeholder="Téléphone principal" className={vcInp} />
          <input type="tel" value={vp.phone2 || ''} onChange={(e) => updateVP({ phone2: e.target.value })}
            placeholder="Téléphone professionnel (optionnel)" className={vcInp} />
          <input type="tel" value={vp.whatsapp || ''} onChange={(e) => updateVP({ whatsapp: e.target.value })}
            placeholder="WhatsApp (ex: +22507000000)" className={vcInp} />
          <input type="email" value={vp.email || ''} onChange={(e) => updateVP({ email: e.target.value })}
            placeholder="E-mail personnel" className={vcInp} />
          <input type="email" value={vp.email2 || ''} onChange={(e) => updateVP({ email2: e.target.value })}
            placeholder="E-mail professionnel (optionnel)" className={vcInp} />
          <input value={vp.website || ''} onChange={(e) => updateVP({ website: e.target.value })}
            placeholder="Site web (https://...)" className={vcInp} />
          <input value={vp.address || ''} onChange={(e) => updateVP({ address: e.target.value })}
            placeholder="Adresse (optionnel)" className={vcInp} />

          <p className={vcSec}>Réseaux sociaux</p>
          <input value={vp.linkedin || ''} onChange={(e) => updateVP({ linkedin: e.target.value })}
            placeholder="LinkedIn URL" className={vcInp} />
          <input value={vp.instagram || ''} onChange={(e) => updateVP({ instagram: e.target.value })}
            placeholder="Instagram URL" className={vcInp} />
          <input value={vp.twitter || ''} onChange={(e) => updateVP({ twitter: e.target.value })}
            placeholder="Twitter / X URL" className={vcInp} />
          <input value={vp.facebook || ''} onChange={(e) => updateVP({ facebook: e.target.value })}
            placeholder="Facebook URL" className={vcInp} />

          <p className={vcSec}>Visuels & apparence</p>
          <ImageUploadField label="Photo de profil" value={vp.photo || ''} onChange={(url) => updateVP({ photo: url })} hint="Optionnel" />
          <ImageUploadField label="Photo de couverture" value={vp.cover || ''} onChange={(url) => updateVP({ cover: url })} hint="Optionnel" />
          <div className="flex gap-2">
            {vcThemes.map(t => (
              <button key={t.v} onClick={() => updateVP({ theme: t.v })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${vp.theme === t.v ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'bg-white text-gray-600 border-gray-200'}`}>
                {t.l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex-1">Couleur accent</label>
            <input type="color" value={vp.color || '#041B4D'} onChange={(e) => updateVP({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
          </div>
        </div>
      )
    }
    case 'catalog':
      return <CatalogForm data={data} onChange={onChange} />
    case 'review':
      return <ReviewForm data={data} onChange={onChange} />
    case 'business':
      return <BusinessForm data={data} onChange={onChange} />
    case 'gallery':
      return <GalleryForm data={data} onChange={onChange} />
    case 'video':
      return <VideoForm data={data} onChange={onChange} />
    case 'audio':
      return <AudioForm data={data} onChange={onChange} />
    case 'ticket':
      return <TicketForm data={data} onChange={onChange} />
    case 'loyalty':
      return <LoyaltyForm data={data} onChange={onChange} />
    case 'appointment':
      return <AppointmentForm data={data} onChange={onChange} />
    case 'survey':
      return <SurveyForm data={data} onChange={onChange} />
    case 'job':
      return <JobForm data={data} onChange={onChange} />
    case 'giftcard':
      return <GiftCardForm data={data} onChange={onChange} />
    case 'download':
      return <DownloadForm data={data} onChange={onChange} />
    default:
      return <Field label="URL / Contenu" name="url" placeholder="https://" data={data} onChange={onChange} />
  }
}

function CatalogForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.catalog_json ? JSON.parse(data.catalog_json) : {
    store: '', description: '', whatsapp: '', currency: 'FCFA', logo: '', color: '#041B4D', categories: []
  }

  function update(patch: object) {
    onChange({ ...data, catalog_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  function addCategory() {
    update({ categories: [...(parsed.categories || []), { name: 'Nouvelle catégorie', products: [] }] })
  }

  function updateCategory(ci: number, name: string) {
    const cats = [...parsed.categories]
    cats[ci] = { ...cats[ci], name }
    update({ categories: cats })
  }

  function addProduct(ci: number) {
    const cats = [...parsed.categories]
    cats[ci] = { ...cats[ci], products: [...(cats[ci].products || []), { name: '', price: '', description: '', image: '', available: true }] }
    update({ categories: cats })
  }

  function updateProduct(ci: number, pi: number, field: string, value: string | boolean) {
    const cats = [...parsed.categories]
    cats[ci].products[pi] = { ...cats[ci].products[pi], [field]: value }
    update({ categories: cats })
  }

  function removeProduct(ci: number, pi: number) {
    const cats = [...parsed.categories]
    cats[ci].products = cats[ci].products.filter((_: unknown, i: number) => i !== pi)
    update({ categories: cats })
  }

  function removeCategory(ci: number) {
    update({ categories: parsed.categories.filter((_: unknown, i: number) => i !== ci) })
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'

  return (
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
      <input value={parsed.store || ''} onChange={(e) => update({ store: e.target.value })}
        placeholder="Nom de la boutique / marque" className={inp} />
      <input value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Slogan ou description courte" className={inp} />
      <div className="grid grid-cols-2 gap-2">
        <input value={parsed.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })}
          placeholder="WhatsApp commande (+225…)" className={inp} />
        <select value={parsed.currency || 'FCFA'} onChange={(e) => update({ currency: e.target.value })}
          className={inp}>
          <option value="FCFA">FCFA</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GNF">GNF</option>
          <option value="XAF">XAF</option>
        </select>
      </div>
      <ImageUploadField label="Logo de la boutique" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Optionnel" />
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 shrink-0">Couleur accent</label>
        <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Catégories & produits</p>
        {(parsed.categories || []).map((cat: { name: string; products: { name: string; price: string; description: string; image: string; available: boolean }[] }, ci: number) => (
          <div key={ci} className="border border-gray-200 rounded-xl p-3 mb-3 space-y-2">
            <div className="flex gap-2 items-center">
              <input value={cat.name} onChange={(e) => updateCategory(ci, e.target.value)}
                className="flex-1 font-semibold text-sm border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40" />
              <button onClick={() => removeCategory(ci)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
            </div>
            {(cat.products || []).map((p: { name: string; price: string; description: string; image: string; available: boolean }, pi: number) => (
              <div key={pi} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                <div className="flex gap-2">
                  <input value={p.name} onChange={(e) => updateProduct(ci, pi, 'name', e.target.value)}
                    placeholder="Nom du produit" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                  <input value={p.price} onChange={(e) => updateProduct(ci, pi, 'price', e.target.value)}
                    placeholder="Prix" className="w-24 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                  <button onClick={() => removeProduct(ci, pi)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
                <input value={p.description || ''} onChange={(e) => updateProduct(ci, pi, 'description', e.target.value)}
                  placeholder="Description courte (optionnel)" className="w-full border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                <ImageUploadField label="Photo du produit" value={p.image || ''} onChange={(url) => updateProduct(ci, pi, 'image', url)} hint="Optionnel" />
              </div>
            ))}
            <button onClick={() => addProduct(ci)} className="text-xs text-[#FF6A00] font-semibold hover:underline">+ Ajouter un produit</button>
          </div>
        ))}
        <button onClick={addCategory} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors">
          + Ajouter une catégorie
        </button>
      </div>
    </div>
  )
}

function ReviewForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.review_json ? JSON.parse(data.review_json) : {
    business: '', logo: '', color: '#FF6A00', message: 'Votre avis compte beaucoup pour nous !',
    positive_url: '', threshold: 4, whatsapp: '',
  }

  function update(patch: object) {
    onChange({ ...data, review_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        ⭐ <strong>Review gating</strong> : les clients satisfaits (≥ seuil) sont envoyés vers Google/Trustpilot. Les insatisfaits reçoivent un formulaire privé.
      </p>
      <input value={parsed.business} onChange={(e) => update({ business: e.target.value })}
        placeholder="Nom de l'établissement *" required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.message} onChange={(e) => update({ message: e.target.value })}
        placeholder="Message d'invitation (ex: Laissez-nous un avis !)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input type="url" value={parsed.positive_url} onChange={(e) => update({ positive_url: e.target.value })}
        placeholder="URL Google Maps / Trustpilot / Facebook *" required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp pour recevoir les avis négatifs (ex: +22507...)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 whitespace-nowrap">Seuil positif ≥</label>
        <select value={parsed.threshold} onChange={(e) => update({ threshold: Number(e.target.value) })}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
          {[3,4,5].map((n) => <option key={n} value={n}>{n} étoiles</option>)}
        </select>
        <label className="text-xs text-gray-500 ml-2 whitespace-nowrap">Couleur</label>
        <input type="color" value={parsed.color || '#FF6A00'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <ImageUploadField label="Logo" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Optionnel" />
    </div>
  )
}

function EventForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.event_json === 'string' ? data.event_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, event_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3 leading-relaxed">
        🎟️ <strong>Billetterie QR</strong> : créez un événement avec inscription en ligne. Chaque inscrit reçoit un billet QR unique, validable par scan.
      </p>
      <input value={(parsed.name as string) || ''} onChange={(e) => update({ name: e.target.value })}
        placeholder="Nom de l'événement *" required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
      <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description de l'événement" rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40 resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date *</label>
          <input type="date" value={(parsed.date as string) || ''} onChange={(e) => update({ date: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Heure</label>
          <input type="time" value={(parsed.time as string) || ''} onChange={(e) => update({ time: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
        </div>
      </div>
      <input value={(parsed.location as string) || ''} onChange={(e) => update({ location: e.target.value })}
        placeholder="Lieu (adresse ou lien Google Maps)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Capacité max</label>
          <input type="number" min={1} value={(parsed.capacity as number) || ''} onChange={(e) => update({ capacity: Number(e.target.value) })}
            placeholder="ex: 100"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Prix billet (0 = gratuit)</label>
          <input type="number" min={0} value={(parsed.price as number) ?? ''} onChange={(e) => update({ price: Number(e.target.value) })}
            placeholder="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
        </div>
      </div>
      <input value={(parsed.organizer as string) || ''} onChange={(e) => update({ organizer: e.target.value })}
        placeholder="Organisateur"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
      <input value={(parsed.whatsapp as string) || ''} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp organisateur (ex: +22507...)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
      <input type="url" value={(parsed.website as string) || ''} onChange={(e) => update({ website: e.target.value })}
        placeholder="Site de l'événement (https://...)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date de fin (optionnel)</label>
          <input type="date" value={(parsed.end_date as string) || ''} onChange={(e) => update({ end_date: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Heure de fin</label>
          <input type="time" value={(parsed.end_time as string) || ''} onChange={(e) => update({ end_time: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
        <input type="color" value={(parsed.color as string) || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <ImageUploadField label="Bannière / Affiche" value={(parsed.cover as string) || ''} onChange={(url) => update({ cover: url })} hint="1200×600 recommandé — affichée en haut" />
      <ImageUploadField label="Logo organisateur" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="Optionnel — petit logo en superposition" />

      {/* Speakers */}
      {(() => {
        const speakers: { name: string; role: string; photo: string }[] = Array.isArray(parsed.speakers) ? parsed.speakers as any : []
        function addSpeaker() { update({ speakers: [...speakers, { name: '', role: '', photo: '' }] }) }
        function updateSpeaker(i: number, field: string, value: string) {
          const s = [...speakers]; s[i] = { ...s[i], [field]: value }; update({ speakers: s })
        }
        function removeSpeaker(i: number) { update({ speakers: speakers.filter((_, j) => j !== i) }) }
        return (
          <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Intervenants / Speakers</p>
              <button type="button" onClick={addSpeaker} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">+ Ajouter</button>
            </div>
            {speakers.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                <div className="flex gap-2 items-center">
                  <input value={s.name} onChange={(e) => updateSpeaker(i, 'name', e.target.value)}
                    placeholder="Nom" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                  <input value={s.role} onChange={(e) => updateSpeaker(i, 'role', e.target.value)}
                    placeholder="Rôle / titre" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                  <button type="button" onClick={() => removeSpeaker(i)} className="text-red-400 text-xs">✕</button>
                </div>
                <ImageUploadField label="Photo" value={s.photo || ''} onChange={(url) => updateSpeaker(i, 'photo', url)} hint="Optionnel" />
              </div>
            ))}
          </div>
        )
      })()}

      {/* Agenda */}
      {(() => {
        const agenda: { time: string; title: string }[] = Array.isArray(parsed.agenda) ? parsed.agenda as any : []
        function addAgendaItem() { update({ agenda: [...agenda, { time: '', title: '' }] }) }
        function updateAgendaItem(i: number, field: string, value: string) {
          const a = [...agenda]; a[i] = { ...a[i], [field]: value }; update({ agenda: a })
        }
        function removeAgendaItem(i: number) { update({ agenda: agenda.filter((_, j) => j !== i) }) }
        return (
          <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Programme / Agenda</p>
              <button type="button" onClick={addAgendaItem} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">+ Ajouter</button>
            </div>
            {agenda.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="time" value={item.time} onChange={(e) => updateAgendaItem(i, 'time', e.target.value)}
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                <input value={item.title} onChange={(e) => updateAgendaItem(i, 'title', e.target.value)}
                  placeholder="Intitulé de l'activité" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                <button type="button" onClick={() => removeAgendaItem(i)} className="text-red-400 text-xs">✕</button>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

type LeadField = { id: string; type: 'text' | 'email' | 'tel' | 'textarea' | 'select'; label: string; required: boolean; options?: string }

function LeadForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.lead_json === 'string' ? data.lead_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  const fields: LeadField[] = Array.isArray(parsed.fields) ? parsed.fields as LeadField[] : []

  function update(patch: Record<string, unknown>) {
    onChange({ ...data, lead_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  function addField() {
    const newField: LeadField = { id: Date.now().toString(), type: 'text', label: '', required: false }
    update({ fields: [...fields, newField] })
  }

  function removeField(id: string) {
    update({ fields: fields.filter((f) => f.id !== id) })
  }

  function updateField(id: string, patch: Partial<LeadField>) {
    update({ fields: fields.map((f) => f.id === id ? { ...f, ...patch } : f) })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 bg-purple-50 rounded-lg p-3 leading-relaxed">
        📋 <strong>Formulaire prospects</strong> : collectez des contacts via QR code. Chaque soumission est enregistrée dans votre tableau de bord.
      </p>
      <input value={(parsed.title as string) || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre du formulaire *" required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40" />
      <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description / accroche" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 resize-none" />

      {/* Fields builder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600">Champs du formulaire</p>
          <button type="button" onClick={addField}
            className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition-colors">
            + Ajouter un champ
          </button>
        </div>
        {fields.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">Aucun champ. Cliquez sur &quot;+ Ajouter&quot;.</p>
        )}
        {fields.map((field) => (
          <div key={field.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="Libellé du champ"
                className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300" />
              <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as LeadField['type'] })}
                className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none">
                <option value="text">Texte</option>
                <option value="email">E-mail</option>
                <option value="tel">Téléphone</option>
                <option value="textarea">Paragraphe</option>
                <option value="select">Liste</option>
              </select>
              <button type="button" onClick={() => removeField(field.id)}
                className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
            </div>
            {field.type === 'select' && (
              <input value={field.options || ''} onChange={(e) => updateField(field.id, { options: e.target.value })}
                placeholder="Options séparées par des virgules (ex: Option A, Option B)"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300" />
            )}
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="rounded" />
              Champ obligatoire
            </label>
          </div>
        ))}
      </div>

      <input value={(parsed.success_message as string) || ''} onChange={(e) => update({ success_message: e.target.value })}
        placeholder="Message de confirmation (ex: Merci ! Nous vous recontacterons.)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40" />
      <input type="url" value={(parsed.redirect_url as string) || ''} onChange={(e) => update({ redirect_url: e.target.value })}
        placeholder="URL de redirection après envoi (optionnel)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40" />
      <input value={(parsed.whatsapp as string) || ''} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp pour recevoir les soumissions (ex: +22507...)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40" />
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
        <input type="color" value={(parsed.color as string) || '#7C3AED'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <ImageUploadField label="Logo" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="Optionnel" />
    </div>
  )
}

function PaymentForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.payment_json === 'string' ? data.payment_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, payment_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  const methods: string[] = Array.isArray(parsed.methods) ? parsed.methods as string[] : ['stripe', 'wave', 'orange', 'mtn']
  const customMethods: { id: string; label: string }[] = Array.isArray(parsed.custom_methods) ? parsed.custom_methods as { id: string; label: string }[] : []
  const [newMethod, setNewMethod] = useState('')

  function toggleMethod(m: string) {
    const next = methods.includes(m) ? methods.filter((x) => x !== m) : [...methods, m]
    update({ methods: next })
  }

  function addCustomMethod() {
    const label = newMethod.trim()
    if (!label) return
    const id = `custom_${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
    const next = [...customMethods, { id, label }]
    update({ custom_methods: next, methods: [...methods, id] })
    setNewMethod('')
  }

  function removeCustomMethod(id: string) {
    const next = customMethods.filter((m) => m.id !== id)
    update({ custom_methods: next, methods: methods.filter((m) => m !== id) })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 bg-green-50 rounded-lg p-3 leading-relaxed">
        💳 <strong>QR de paiement universel</strong> : carte bancaire (Stripe), Wave, Orange Money, MTN MoMo, Moov, Free Money, M-Pesa, Airtel Money et plus — via GeniusPay.
      </p>
      <input value={(parsed.merchant as string) || ''} onChange={(e) => update({ merchant: e.target.value })}
        placeholder="Nom du marchand / établissement *" required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40" />
      <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description du produit ou service" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-green-400/40" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Montant fixe (FCFA)</label>
          <input type="number" min={100} value={(parsed.amount as number) || ''} onChange={(e) => update({ amount: Number(e.target.value) })}
            placeholder="ex: 5000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Laisser choisir le montant</label>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={!!parsed.custom_amount} onChange={(e) => update({ custom_amount: e.target.checked })}
              className="rounded" />
            <span className="text-sm text-gray-600">Montant libre</span>
          </label>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Méthodes acceptées <span className="text-gray-400">(GeniusPay sélectionne selon le pays du client)</span></p>

        {/* Mobile Money — Afrique de l'Ouest */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">📱 Mobile Money — Afrique de l'Ouest</p>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { id: 'wave',     label: '🌊 Wave',        color: 'bg-blue-100 text-blue-700 border-blue-200',       hint: 'CI · SN' },
            { id: 'orange',   label: '🟠 Orange Money', color: 'bg-orange-100 text-orange-700 border-orange-200', hint: 'CI · SN · CM · ML…' },
            { id: 'mtn',      label: '🟡 MTN MoMo',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', hint: 'CI · GH · CM · BJ…' },
            { id: 'moov',     label: '🔵 Moov Money',  color: 'bg-sky-100 text-sky-700 border-sky-200',          hint: 'BJ · TG · BF · ML' },
            { id: 'free',     label: '🟣 Free Money',  color: 'bg-purple-100 text-purple-700 border-purple-200', hint: 'SN' },
            { id: 'wizall',   label: '🔷 Wizall',      color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       hint: 'SN · CI' },
            { id: 'expresso', label: '🟤 Expresso',    color: 'bg-amber-100 text-amber-700 border-amber-200',    hint: 'SN · GN' },
            { id: 'emoney',   label: '🟢 E-Money',     color: 'bg-lime-100 text-lime-700 border-lime-200',       hint: 'GN' },
            { id: 'tmoney',   label: '🟩 T-Money',     color: 'bg-teal-100 text-teal-700 border-teal-200',       hint: 'TG' },
          ].map(({ id, label, color, hint }) => (
            <button key={id} type="button" onClick={() => toggleMethod(id)}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all text-left ${methods.includes(id) ? color : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
              <div>{label}</div>
              <div className={`text-[9px] font-normal ${methods.includes(id) ? 'opacity-60' : 'text-gray-300'}`}>{hint}</div>
            </button>
          ))}
        </div>

        {/* Mobile Money — Afrique de l'Est & Centrale */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">📱 Mobile Money — Afrique de l'Est & Centrale</p>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { id: 'mpesa',    label: '🟢 M-Pesa',      color: 'bg-green-100 text-green-700 border-green-200',   hint: 'KE · TZ · MZ · RW' },
            { id: 'airtel',   label: '🔴 Airtel Money', color: 'bg-red-100 text-red-700 border-red-200',         hint: 'UG · RW · ZM · MW' },
            { id: 'mtn_momo', label: '🟡 MTN Rwanda',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', hint: 'RW · UG · ZM' },
            { id: 'zamtel',   label: '🟠 Zamtel',      color: 'bg-orange-100 text-orange-800 border-orange-200', hint: 'ZM' },
            { id: 'tigo',     label: '🔵 Tigo Pesa',   color: 'bg-blue-100 text-blue-700 border-blue-200',       hint: 'TZ · GH' },
            { id: 'halopesa', label: '🟤 HaloPesa',    color: 'bg-amber-100 text-amber-700 border-amber-200',    hint: 'TZ' },
          ].map(({ id, label, color, hint }) => (
            <button key={id} type="button" onClick={() => toggleMethod(id)}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all text-left ${methods.includes(id) ? color : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
              <div>{label}</div>
              <div className={`text-[9px] font-normal ${methods.includes(id) ? 'opacity-60' : 'text-gray-300'}`}>{hint}</div>
            </button>
          ))}
        </div>

        {/* Cartes & Wallets */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">💳 Cartes & Wallets internationaux</p>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { id: 'visa',       label: '💳 Visa',        color: 'bg-indigo-100 text-indigo-700 border-indigo-200', hint: 'Monde entier' },
            { id: 'mastercard', label: '💳 Mastercard',  color: 'bg-indigo-100 text-indigo-700 border-indigo-200', hint: 'Monde entier' },
            { id: 'amex',       label: '💳 Amex',        color: 'bg-violet-100 text-violet-700 border-violet-200', hint: 'International' },
            { id: 'verve',      label: '💳 Verve',       color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', hint: 'GH · NG' },
            { id: 'applepay',   label: '🍎 Apple Pay',   color: 'bg-gray-200 text-gray-700 border-gray-300',      hint: 'iOS / Mac' },
            { id: 'googlepay',  label: '🔵 Google Pay',  color: 'bg-blue-100 text-blue-700 border-blue-200',       hint: 'Android' },
            { id: 'paypal',     label: '🅿️ PayPal',      color: 'bg-sky-100 text-sky-700 border-sky-200',          hint: 'International' },
            { id: 'stripe',     label: '⚡ Stripe',      color: 'bg-purple-100 text-purple-700 border-purple-200', hint: '135+ devises' },
          ].map(({ id, label, color, hint }) => (
            <button key={id} type="button" onClick={() => toggleMethod(id)}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all text-left ${methods.includes(id) ? color : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
              <div>{label}</div>
              <div className={`text-[9px] font-normal ${methods.includes(id) ? 'opacity-60' : 'text-gray-300'}`}>{hint}</div>
            </button>
          ))}
        </div>

        {/* Méthodes personnalisées */}
        {customMethods.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">➕ Méthodes personnalisées</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {customMethods.map(({ id, label }) => (
                <div key={id} className={`relative py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all flex items-center justify-between gap-1 ${methods.includes(id) ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  <button type="button" onClick={() => toggleMethod(id)} className="flex-1 text-left truncate">💼 {label}</button>
                  <button type="button" onClick={() => removeCustomMethod(id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">×</button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-1 flex gap-2">
          <input value={newMethod} onChange={(e) => setNewMethod(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomMethod() } }}
            placeholder="Autre moyen de paiement…" maxLength={40}
            className="flex-1 border border-dashed border-green-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400/40 bg-green-50 placeholder:text-green-400" />
          <button type="button" onClick={addCustomMethod}
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors whitespace-nowrap">
            + Ajouter
          </button>
        </div>
      </div>
      <input value={(parsed.phone as string) || ''} onChange={(e) => update({ phone: e.target.value })}
        placeholder="Numéro WhatsApp marchand (optionnel, pour notifications)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40" />
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur</label>
        <input type="color" value={(parsed.color as string) || '#16A34A'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <ImageUploadField label="Logo marchand" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="Optionnel" />
    </div>
  )
}

// ─── BUSINESS PAGE ─────────────────────────────────────────────────────────

const BUSINESS_CATEGORIES = [
  'Restaurant / Café', 'Boutique / Mode', 'Hôtel / Hébergement', 'Salon de beauté / Coiffure',
  'Pharmacie / Santé', 'Agence immobilière', 'Agence de voyage', 'Garage / Auto',
  'École / Formation', 'Cabinet médical', 'Studio photo / Vidéo', 'Événementiel',
  'E-commerce / Livraison', 'Banque / Finance', 'Autre',
]

function BusinessForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.business_json === 'string' ? data.business_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, business_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  const galleries: string[] = Array.isArray(parsed.gallery) ? parsed.gallery as string[] : []
  const hours: Record<string, {open:string;close:string;closed:boolean}> = (parsed.hours as any) || {}
  const socials: Record<string, string> = (parsed.socials as any) || {}
  const ctaBtns: {label:string;url:string;icon:string}[] = Array.isArray(parsed.cta_buttons) ? parsed.cta_buttons as any : []

  const days = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-xs text-gray-500 bg-orange-50 rounded-lg p-3 leading-relaxed">
        🏪 <strong>Page Business</strong> : mini site web professionnel avec photo de couverture, horaires, boutons CTA, réseaux sociaux et galerie.
      </p>

      {/* Identité */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Identité</p>
        <input value={(parsed.name as string) || ''} onChange={(e) => update({ name: e.target.value })}
          placeholder="Nom de l'établissement *" required className={inp} />
        <select value={(parsed.category as string) || ''} onChange={(e) => update({ category: e.target.value })} className={inp}>
          <option value="">Catégorie…</option>
          {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea value={(parsed.tagline as string) || ''} onChange={(e) => update({ tagline: e.target.value })}
          placeholder="Slogan (ex: Le meilleur attiéké de la ville)" rows={2}
          className={`${inp} resize-none`} />
        <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
          placeholder="Description détaillée…" rows={3}
          className={`${inp} resize-none`} />
      </div>

      {/* Médias */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Médias</p>
        <ImageUploadField label="Photo de couverture" value={(parsed.cover as string) || ''} onChange={(url) => update({ cover: url })} hint="Bannière — 1200×400 recommandé" />
        <ImageUploadField label="Logo" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="Format carré — 400×400" />
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
          <input type="color" value={(parsed.color as string) || '#FF6A00'} onChange={(e) => update({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
          <select value={(parsed.theme as string) || 'light'} onChange={(e) => update({ theme: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
            <option value="light">Thème clair</option>
            <option value="dark">Thème sombre</option>
            <option value="gradient">Dégradé</option>
          </select>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contact</p>
        <input value={(parsed.phone as string) || ''} onChange={(e) => update({ phone: e.target.value })}
          placeholder="Téléphone" className={inp} />
        <input value={(parsed.whatsapp as string) || ''} onChange={(e) => update({ whatsapp: e.target.value })}
          placeholder="WhatsApp (ex: +22507...)" className={inp} />
        <input value={(parsed.email as string) || ''} onChange={(e) => update({ email: e.target.value })}
          placeholder="E-mail" className={inp} />
        <input value={(parsed.website as string) || ''} onChange={(e) => update({ website: e.target.value })}
          placeholder="Site web (https://...)" className={inp} />
        <input value={(parsed.address as string) || ''} onChange={(e) => update({ address: e.target.value })}
          placeholder="Adresse complète" className={inp} />
        <input value={(parsed.map_url as string) || ''} onChange={(e) => update({ map_url: e.target.value })}
          placeholder="Lien Google Maps (https://maps.google.com/...)" className={inp} />
      </div>

      {/* Boutons CTA personnalisés */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Boutons d'action</p>
          <button type="button" onClick={() => update({ cta_buttons: [...ctaBtns, { label: '', url: '', icon: '🔗' }] })}
            className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 font-semibold">+ Ajouter</button>
        </div>
        {ctaBtns.map((btn, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <input value={btn.icon} onChange={(e) => { const a=[...ctaBtns]; a[i]={...a[i],icon:e.target.value}; update({cta_buttons:a}) }}
              placeholder="🔗" className="w-10 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" maxLength={4} />
            <input value={btn.label} onChange={(e) => { const a=[...ctaBtns]; a[i]={...a[i],label:e.target.value}; update({cta_buttons:a}) }}
              placeholder="Texte du bouton" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
            <input value={btn.url} onChange={(e) => { const a=[...ctaBtns]; a[i]={...a[i],url:e.target.value}; update({cta_buttons:a}) }}
              placeholder="URL ou tel: ou wa.me/..." className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
            <button onClick={() => update({ cta_buttons: ctaBtns.filter((_,j)=>j!==i) })} className="text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>

      {/* Horaires */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Horaires d'ouverture</p>
        {days.map((day) => {
          const key = day.toLowerCase()
          const h = hours[key] || { open: '08:00', close: '18:00', closed: false }
          return (
            <div key={day} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-16 shrink-0">{day}</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={!!h.closed} onChange={(e) => update({ hours: { ...hours, [key]: { ...h, closed: e.target.checked } } })}
                  className="rounded" />
                <span className="text-xs text-gray-400">Fermé</span>
              </label>
              {!h.closed && <>
                <input type="time" value={h.open} onChange={(e) => update({ hours: { ...hours, [key]: { ...h, open: e.target.value } } })}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                <span className="text-xs text-gray-400">→</span>
                <input type="time" value={h.close} onChange={(e) => update({ hours: { ...hours, [key]: { ...h, close: e.target.value } } })}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
              </>}
            </div>
          )
        })}
      </div>

      {/* Réseaux sociaux */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Réseaux sociaux</p>
        {[['instagram','📷 Instagram'],['facebook','👤 Facebook'],['tiktok','🎵 TikTok'],['youtube','▶️ YouTube'],['twitter','🐦 Twitter/X'],['linkedin','💼 LinkedIn']].map(([key,label]) => (
          <input key={key} value={socials[key] || ''} onChange={(e) => update({ socials: { ...socials, [key]: e.target.value } })}
            placeholder={`${label} URL`} className={inp} />
        ))}
      </div>

      {/* Galerie */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Galerie photos <span className="font-normal text-gray-400">(max 8)</span></p>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: Math.min(galleries.length + 1, 8) }).map((_, i) => (
            <ImageUploadField key={i} label={`Photo ${i + 1}`} value={galleries[i] || ''}
              onChange={(url) => {
                const g = [...galleries]; g[i] = url
                update({ gallery: g.filter(Boolean) })
              }} hint="" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── GALLERY ───────────────────────────────────────────────────────────────

function GalleryForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.gallery_json === 'string' ? data.gallery_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, gallery_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  const photos: string[] = Array.isArray(parsed.photos) ? parsed.photos as string[] : []
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-xs text-gray-500 bg-orange-50 rounded-lg p-3">
        🖼️ <strong>Galerie Photos</strong> : portfolio, album événement, catalogue — avec lightbox et navigation tactile.
      </p>
      <input value={(parsed.title as string) || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre de la galerie *" className={inp} />
      <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description (optionnel)" rows={2} className={`${inp} resize-none`} />
      <div className="flex gap-3 items-center">
        <select value={(parsed.layout as string) || 'grid'} onChange={(e) => update({ layout: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm flex-1">
          <option value="grid">Grille uniforme</option>
          <option value="masonry">Masonry (Pinterest)</option>
          <option value="slideshow">Diaporama</option>
        </select>
        <input type="color" value={(parsed.color as string) || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="w-9 h-9 rounded cursor-pointer border border-gray-200" title="Couleur accent" />
      </div>
      <ImageUploadField label="Logo (optionnel)" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="" />

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Photos <span className="font-normal text-gray-400">(max 20)</span></p>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: Math.min(photos.length + 1, 20) }).map((_, i) => (
            <ImageUploadField key={i} label={`Photo ${i + 1}`} value={photos[i] || ''}
              onChange={(url) => {
                const p = [...photos]; p[i] = url
                update({ photos: p.filter(Boolean) })
              }} hint="" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── VIDEO ─────────────────────────────────────────────────────────────────

function VideoForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.video_json === 'string' ? data.video_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, video_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 bg-orange-50 rounded-lg p-3">
        ▶️ <strong>QR Vidéo</strong> : lien YouTube, Vimeo ou vidéo directe — s'ouvre en plein écran avec lecteur intégré et autoplay.
      </p>
      <input value={(parsed.title as string) || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre de la vidéo *" className={inp} />
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Lien vidéo *</label>
        <input type="url" value={(parsed.video_url as string) || ''} onChange={(e) => update({ video_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/... ou .mp4 direct"
          className={inp} />
        <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, TikTok, ou fichier MP4 direct acceptés</p>
      </div>
      <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description (optionnel)" rows={2} className={`${inp} resize-none`} />
      <ImageUploadField label="Thumbnail personnalisé" value={(parsed.thumbnail as string) || ''} onChange={(url) => update({ thumbnail: url })} hint="Optionnel — généré automatiquement pour YouTube" />
      <ImageUploadField label="Logo (optionnel)" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="" />
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
        <input type="color" value={(parsed.color as string) || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={!!(parsed.autoplay)} onChange={(e) => update({ autoplay: e.target.checked })} />
          <span>Autoplay (muet)</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={!!(parsed.loop)} onChange={(e) => update({ loop: e.target.checked })} />
          <span>Boucle</span>
        </label>
      </div>
      {/* CTA optionnel sous la vidéo */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bouton CTA sous la vidéo (optionnel)</p>
        <div className="flex gap-2">
          <input value={(parsed.cta_label as string) || ''} onChange={(e) => update({ cta_label: e.target.value })}
            placeholder="ex: Commander maintenant" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          <input value={(parsed.cta_url as string) || ''} onChange={(e) => update({ cta_url: e.target.value })}
            placeholder="URL" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
        </div>
      </div>
    </div>
  )
}

// ─── AUDIO ─────────────────────────────────────────────────────────────────

function AudioForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const raw = typeof data.audio_json === 'string' ? data.audio_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, audio_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40'
  const playlist: {title:string;url:string;duration?:string}[] = Array.isArray(parsed.playlist) ? parsed.playlist as any : []

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-xs text-gray-500 bg-orange-50 rounded-lg p-3">
        🎵 <strong>QR Audio</strong> : lecteur MP3 stylé avec playlist, cover art, barre de progression. Idéal pour musique, podcast, menu audio, annonce.
      </p>
      <input value={(parsed.title as string) || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre de l'album / podcast *" className={inp} />
      <input value={(parsed.artist as string) || ''} onChange={(e) => update({ artist: e.target.value })}
        placeholder="Artiste / auteur" className={inp} />
      <textarea value={(parsed.description as string) || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description (optionnel)" rows={2} className={`${inp} resize-none`} />

      <ImageUploadField label="Cover art" value={(parsed.cover as string) || ''} onChange={(url) => update({ cover: url })} hint="Format carré — 800×800 recommandé" />
      <ImageUploadField label="Logo (optionnel)" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="" />

      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
        <input type="color" value={(parsed.color as string) || '#7C3AED'} onChange={(e) => update({ color: e.target.value })}
          className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
        <select value={(parsed.theme as string) || 'dark'} onChange={(e) => update({ theme: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
          <option value="dark">Lecteur sombre</option>
          <option value="light">Lecteur clair</option>
          <option value="gradient">Dégradé vibrant</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Playlist</p>
          <button type="button" onClick={() => update({ playlist: [...playlist, { title: '', url: '', duration: '' }] })}
            className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-semibold">+ Ajouter un titre</button>
        </div>
        {playlist.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3 border-2 border-dashed border-gray-200 rounded-xl">Cliquez sur &quot;+ Ajouter&quot; pour créer votre playlist</p>
        )}
        {playlist.map((track, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 mb-2 space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
              <input value={track.title} onChange={(e) => { const p=[...playlist]; p[i]={...p[i],title:e.target.value}; update({playlist:p}) }}
                placeholder="Titre du morceau" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
              <input value={track.duration||''} onChange={(e) => { const p=[...playlist]; p[i]={...p[i],duration:e.target.value}; update({playlist:p}) }}
                placeholder="ex: 3:45" className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none" />
              <button onClick={() => update({ playlist: playlist.filter((_,j)=>j!==i) })} className="text-red-400 text-xs">✕</button>
            </div>
            <input type="url" value={track.url} onChange={(e) => { const p=[...playlist]; p[i]={...p[i],url:e.target.value}; update({playlist:p}) }}
              placeholder="Lien MP3 direct (https://...mp3)" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bouton CTA (optionnel)</p>
        <div className="flex gap-2">
          <input value={(parsed.cta_label as string) || ''} onChange={(e) => update({ cta_label: e.target.value })}
            placeholder="ex: Télécharger l'album" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          <input value={(parsed.cta_url as string) || ''} onChange={(e) => update({ cta_url: e.target.value })}
            placeholder="URL" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
        </div>
      </div>
    </div>
  )
}

// ─── Ticket Form ────────────────────────────────────────────────────────────
function TicketForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.ticket_json ? JSON.parse(data.ticket_json) : {
    event_name: '', date: '', time: '', location: '', category: 'Standard', color: '#041B4D',
    holder_name: '', holder_email: '', note: '', cover: '', logo: '', organizer: '', price: '', seat: '',
  }
  function update(patch: object) { onChange({ ...data, ticket_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <p className={sec}>Événement</p>
      <input value={parsed.event_name || ''} onChange={(e) => update({ event_name: e.target.value })} placeholder="Nom de l'événement *" className={inp} />
      <input value={parsed.organizer || ''} onChange={(e) => update({ organizer: e.target.value })} placeholder="Organisateur" className={inp} />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={parsed.date || ''} onChange={(e) => update({ date: e.target.value })} className={inp} />
        <input type="time" value={parsed.time || ''} onChange={(e) => update({ time: e.target.value })} className={inp} />
      </div>
      <input value={parsed.location || ''} onChange={(e) => update({ location: e.target.value })} placeholder="Lieu / Adresse" className={inp} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie de billet</label>
          <select value={parsed.category || 'Standard'} onChange={(e) => update({ category: e.target.value })} className={inp}>
            <option>Standard</option><option>VIP</option><option>Premium</option>
            <option>Presse</option><option>Invité</option><option>Staff</option><option>Gratuit</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Prix du billet</label>
          <input value={parsed.price || ''} onChange={(e) => update({ price: e.target.value })} placeholder="ex: 5 000 FCFA" className={inp} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Siège / Zone (optionnel)</label>
          <input value={parsed.seat || ''} onChange={(e) => update({ seat: e.target.value })} placeholder="ex: A12 / Zone VIP" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Couleur</label>
          <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
            className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer" />
        </div>
      </div>

      <p className={sec}>Participant (billet nominatif)</p>
      <input value={parsed.holder_name || ''} onChange={(e) => update({ holder_name: e.target.value })} placeholder="Nom du participant" className={inp} />
      <input type="email" value={parsed.holder_email || ''} onChange={(e) => update({ holder_email: e.target.value })} placeholder="E-mail du participant" className={inp} />
      <textarea value={parsed.note || ''} onChange={(e) => update({ note: e.target.value })} placeholder="Note / instructions / conditions (optionnel)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />

      <p className={sec}>Visuels</p>
      <ImageUploadField label="Affiche / Bannière de l'événement" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="1200×600 recommandé" />
      <ImageUploadField label="Logo de l'organisateur" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Format carré" />
    </div>
  )
}

// ─── Loyalty Form ────────────────────────────────────────────────────────────
function LoyaltyForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.loyalty_json ? JSON.parse(data.loyalty_json) : {
    name: '', description: '', total_stamps: 10, reward_text: '', color: '#041B4D', logo: '', cover: '', card_expiry: '', stamp_type: '🪙',
  }
  function update(patch: object) { onChange({ ...data, loyalty_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  const stampEmojis = ['🪙', '⭐', '☕', '🍕', '🎯', '❤️', '✅', '🔥', '🎁', '💎']
  return (
    <div className="space-y-3">
      <input value={parsed.name || ''} onChange={(e) => update({ name: e.target.value })} placeholder="Nom de la carte (ex: Café Fidélité) *" className={inp} />
      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description (ex: 1 tampon par achat de café)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <input value={parsed.reward_text || ''} onChange={(e) => update({ reward_text: e.target.value })}
        placeholder="Récompense (ex: 1 café offert, -20% sur votre commande) *" className={inp} />

      <p className={sec}>Paramètres de la carte</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tampons pour récompense</label>
          <input type="number" min="2" max="50" value={parsed.total_stamps || 10}
            onChange={(e) => update({ total_stamps: parseInt(e.target.value) || 10 })} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Couleur accent</label>
          <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
            className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Icône de tampon</label>
        <div className="flex flex-wrap gap-2">
          {stampEmojis.map((e) => (
            <button key={e} type="button" onClick={() => update({ stamp_type: e })}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${parsed.stamp_type === e ? 'border-[#FF6A00] bg-orange-50' : 'border-gray-200 hover:border-gray-400'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Date d&apos;expiration de la carte (optionnel)</label>
        <input type="date" value={parsed.card_expiry || ''} onChange={(e) => update({ card_expiry: e.target.value })} className={inp} />
      </div>

      <p className={sec}>Visuels</p>
      <ImageUploadField label="Logo de la carte" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Format carré recommandé" />
      <ImageUploadField label="Photo de couverture" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="Optionnel — bannière en haut de la carte" />
    </div>
  )
}

// ─── Appointment Form ────────────────────────────────────────────────────────
function AppointmentForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.appointment_json ? JSON.parse(data.appointment_json) : {
    name: '', profession: '', phone: '', email: '', address: '', booking_url: '',
    description: '', color: '#041B4D', services: [], schedule: '', photo: '',
    whatsapp: '', instagram: '', website: '', languages: '', page_theme: 'light',
  }
  function update(patch: object) { onChange({ ...data, appointment_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <ImageUploadField label="Photo de profil / Logo" value={parsed.photo || ''} onChange={(url) => update({ photo: url })} hint="Votre photo ou logo professionnel" />
      <input value={parsed.name || ''} onChange={(e) => update({ name: e.target.value })} placeholder="Votre nom / cabinet / entreprise *" className={inp} />
      <input value={parsed.profession || ''} onChange={(e) => update({ profession: e.target.value })} placeholder="Profession / spécialité (ex: Médecin généraliste)" className={inp} />
      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description de vos services..." rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <p className={sec}>Contact & réservation</p>
      <input type="tel" value={parsed.phone || ''} onChange={(e) => update({ phone: e.target.value })} placeholder="Téléphone" className={inp} />
      <input type="tel" value={parsed.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="WhatsApp (optionnel)" className={inp} />
      <input type="email" value={parsed.email || ''} onChange={(e) => update({ email: e.target.value })} placeholder="E-mail" className={inp} />
      <input value={parsed.address || ''} onChange={(e) => update({ address: e.target.value })} placeholder="Adresse / Localisation" className={inp} />
      <input type="url" value={parsed.booking_url || ''} onChange={(e) => update({ booking_url: e.target.value })}
        placeholder="Lien Calendly / Cal.com / autre (optionnel)" className={inp} />
      <p className={sec}>Services & horaires</p>
      <input value={parsed.services?.join(', ') || ''} onChange={(e) => update({ services: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
        placeholder="Services séparés par virgule (ex: Consultation, Téléconsultation)" className={inp} />
      <textarea value={parsed.schedule || ''} onChange={(e) => update({ schedule: e.target.value })}
        placeholder="Horaires (ex: Lun-Ven 8h-18h, Sam 9h-13h)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <p className={sec}>Réseaux & langue</p>
      <input value={parsed.instagram || ''} onChange={(e) => update({ instagram: e.target.value })} placeholder="Instagram (optionnel)" className={inp} />
      <input type="url" value={parsed.website || ''} onChange={(e) => update({ website: e.target.value })} placeholder="Site web (optionnel)" className={inp} />
      <input value={parsed.languages || ''} onChange={(e) => update({ languages: e.target.value })} placeholder="Langues parlées (ex: Français, English)" className={inp} />
      <p className={sec}>Apparence de la page</p>
      <div className="grid grid-cols-4 gap-2">
        {(['light', 'dark', 'glass', 'gradient'] as const).map((t) => (
          <button key={t} type="button" onClick={() => update({ page_theme: t })}
            className={`py-2 rounded-lg text-[10px] font-bold capitalize border transition-all ${parsed.page_theme === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
            {t === 'light' ? '☀️ Clair' : t === 'dark' ? '🌙 Sombre' : t === 'glass' ? '✨ Verre' : '🌈 Dégradé'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-600">Couleur principale</label>
        <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="h-8 w-16 border border-gray-200 rounded cursor-pointer" />
      </div>
    </div>
  )
}

// ─── Survey Form ─────────────────────────────────────────────────────────────
function SurveyForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.survey_json ? JSON.parse(data.survey_json) : {
    title: '', description: '', color: '#041B4D', questions: [], success_message: 'Merci pour votre participation !',
    logo: '', anonymous: false, show_progress: true,
  }
  function update(patch: object) { onChange({ ...data, survey_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  type SurveyQ = { id: string; text: string; type: 'text' | 'single' | 'multiple' | 'rating' | 'yesno'; options?: string[]; required?: boolean }
  const questions: SurveyQ[] = parsed.questions || []
  function addQ() {
    update({ questions: [...questions, { id: Date.now().toString(), text: '', type: 'single', options: ['Option 1', 'Option 2'], required: false }] })
  }
  function updateQ(id: string, patch: Partial<SurveyQ>) {
    update({ questions: questions.map((q) => q.id === id ? { ...q, ...patch } : q) })
  }
  function removeQ(id: string) { update({ questions: questions.filter((q) => q.id !== id) }) }
  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <ImageUploadField label="Logo / Image de couverture" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Affiché en haut du sondage" />
      <input value={parsed.title || ''} onChange={(e) => update({ title: e.target.value })} placeholder="Titre du sondage *" className={inp} />
      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description / instructions (optionnel)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />

      <p className={sec}>Options</p>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div>
          <p className="text-xs font-semibold text-gray-700">Réponses anonymes</p>
          <p className="text-xs text-gray-400">Ne pas collecter l'identité</p>
        </div>
        <button type="button" onClick={() => update({ anonymous: !parsed.anonymous })}
          className={`relative w-10 h-5 rounded-full transition-colors ${parsed.anonymous ? 'bg-orange-500' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${parsed.anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div>
          <p className="text-xs font-semibold text-gray-700">Barre de progression</p>
          <p className="text-xs text-gray-400">Afficher l'avancement</p>
        </div>
        <button type="button" onClick={() => update({ show_progress: !parsed.show_progress })}
          className={`relative w-10 h-5 rounded-full transition-colors ${parsed.show_progress !== false ? 'bg-orange-500' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${parsed.show_progress !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <p className={sec}>Questions ({questions.length})</p>
      <button type="button" onClick={addQ} className="w-full text-xs px-2.5 py-2 rounded-lg bg-orange-100 text-orange-700 font-semibold hover:bg-orange-200">+ Ajouter une question</button>
      {questions.map((q, idx) => (
        <div key={q.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input type="checkbox" checked={q.required || false} onChange={(e) => updateQ(q.id, { required: e.target.checked })} className="accent-orange-500" />
                Obligatoire
              </label>
              <button type="button" onClick={() => removeQ(q.id)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
            </div>
          </div>
          <input value={q.text} onChange={(e) => updateQ(q.id, { text: e.target.value })} placeholder="Texte de la question *"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none" />
          <select value={q.type} onChange={(e) => updateQ(q.id, { type: e.target.value as SurveyQ['type'] })}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none">
            <option value="single">Choix unique</option>
            <option value="multiple">Choix multiple</option>
            <option value="text">Texte libre</option>
            <option value="rating">Note (1-5 étoiles)</option>
            <option value="yesno">Oui / Non</option>
          </select>
          {(q.type === 'single' || q.type === 'multiple') && (
            <input value={q.options?.join(', ') || ''} onChange={(e) => updateQ(q.id, { options: e.target.value.split(',').map((s) => s.trim()) })}
              placeholder="Options séparées par virgule" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none" />
          )}
        </div>
      ))}

      <p className={sec}>Fin & apparence</p>
      <input value={parsed.success_message || ''} onChange={(e) => update({ success_message: e.target.value })}
        placeholder="Message de remerciement après envoi" className={inp} />
      <div className="grid grid-cols-4 gap-2">
        {(['light', 'dark', 'glass', 'gradient'] as const).map((t) => (
          <button key={t} type="button" onClick={() => update({ page_theme: t })}
            className={`py-2 rounded-lg text-[10px] font-bold capitalize border transition-all ${parsed.page_theme === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : t === 'glass' ? '✨' : '🌈'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-600">Couleur</label>
        <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="h-8 w-16 border border-gray-200 rounded cursor-pointer" />
      </div>
    </div>
  )
}

// ─── Job Form ─────────────────────────────────────────────────────────────────
function JobForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.job_json ? JSON.parse(data.job_json) : {
    company: '', title: '', location: '', type: 'CDI', description: '', requirements: '',
    salary_range: '', apply_email: '', apply_url: '', color: '#041B4D', logo: '', cover: '',
    deadline: '', benefits: '', experience: 'Tout niveau', remote: false, whatsapp: '',
  }
  function update(patch: object) { onChange({ ...data, job_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <input value={parsed.title || ''} onChange={(e) => update({ title: e.target.value })} placeholder="Intitulé du poste *" className={inp} />
      <input value={parsed.company || ''} onChange={(e) => update({ company: e.target.value })} placeholder="Entreprise / Organisation *" className={inp} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Type de contrat</label>
          <select value={parsed.type || 'CDI'} onChange={(e) => update({ type: e.target.value })} className={inp}>
            <option>CDI</option><option>CDD</option><option>Stage</option>
            <option>Freelance</option><option>Alternance</option><option>Temps partiel</option><option>Bénévolat</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Niveau d&apos;expérience</label>
          <select value={parsed.experience || 'Tout niveau'} onChange={(e) => update({ experience: e.target.value })} className={inp}>
            <option>Tout niveau</option><option>Débutant (0-1 an)</option><option>Junior (1-3 ans)</option>
            <option>Confirmé (3-5 ans)</option><option>Senior (5+ ans)</option><option>Expert (10+ ans)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input value={parsed.location || ''} onChange={(e) => update({ location: e.target.value })} placeholder="Localisation" className={inp} />
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
          <input type="checkbox" id="remote" checked={!!parsed.remote} onChange={(e) => update({ remote: e.target.checked })} className="rounded" />
          <label htmlFor="remote" className="text-sm text-gray-600 cursor-pointer">🏠 Télétravail</label>
        </div>
      </div>

      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description du poste *" rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <textarea value={parsed.requirements || ''} onChange={(e) => update({ requirements: e.target.value })}
        placeholder="Profil recherché / Compétences requises" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <textarea value={parsed.benefits || ''} onChange={(e) => update({ benefits: e.target.value })}
        placeholder="Avantages du poste (ex: assurance santé, voiture de fonction, congés payés…)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <input value={parsed.salary_range || ''} onChange={(e) => update({ salary_range: e.target.value })}
        placeholder="Salaire (ex: 200 000 - 350 000 FCFA/mois)" className={inp} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date limite de candidature</label>
          <input type="date" value={parsed.deadline || ''} onChange={(e) => update({ deadline: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Couleur</label>
          <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
            className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer" />
        </div>
      </div>

      <p className={sec}>Candidature</p>
      <input type="email" value={parsed.apply_email || ''} onChange={(e) => update({ apply_email: e.target.value })}
        placeholder="E-mail de candidature" className={inp} />
      <input type="url" value={parsed.apply_url || ''} onChange={(e) => update({ apply_url: e.target.value })}
        placeholder="Lien de candidature (optionnel)" className={inp} />
      <input value={parsed.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder="WhatsApp RH (optionnel — ex: +22507...)" className={inp} />

      <p className={sec}>Visuels & apparence</p>
      <ImageUploadField label="Logo / Photo de l'entreprise" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Format carré recommandé" />
      <ImageUploadField label="Bannière / Image d'en-tête" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="Optionnel — 1200×400 recommandé" />
      <div className="grid grid-cols-4 gap-2">
        {(['light', 'dark', 'glass', 'gradient'] as const).map((t) => (
          <button key={t} type="button" onClick={() => update({ page_theme: t })}
            className={`py-2 rounded-lg text-[10px] font-bold capitalize border transition-all ${parsed.page_theme === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : t === 'glass' ? '✨' : '🌈'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── GiftCard Form ────────────────────────────────────────────────────────────
function GiftCardForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.giftcard_json ? JSON.parse(data.giftcard_json) : {
    brand: '', amount: '', currency: 'FCFA', recipient_name: '', message: '',
    expiry_date: '', color: '#8B5CF6', logo: '', cover: '', theme: 'gradient',
    redeem_url: '', terms: '', occasion: '',
  }
  function update(patch: object) { onChange({ ...data, giftcard_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  const occasions = ['🎂 Anniversaire', '🎄 Noël', '💝 Saint-Valentin', '🎓 Diplôme', '💍 Mariage', '🌸 Fête des mères', '👔 Fête des pères', '🎉 Célébration', '🙏 Remerciement']
  return (
    <div className="space-y-3">
      <input value={parsed.brand || ''} onChange={(e) => update({ brand: e.target.value })} placeholder="Votre marque / boutique *" className={inp} />
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <input type="number" value={parsed.amount || ''} onChange={(e) => update({ amount: e.target.value })}
            placeholder="Valeur de la carte *" className={inp} />
        </div>
        <select value={parsed.currency || 'FCFA'} onChange={(e) => update({ currency: e.target.value })} className={inp}>
          <option>FCFA</option><option>XOF</option><option>XAF</option><option>USD</option><option>EUR</option><option>GHS</option><option>NGN</option>
        </select>
      </div>

      <p className={sec}>Destinataire & occasion</p>
      <input value={parsed.recipient_name || ''} onChange={(e) => update({ recipient_name: e.target.value })}
        placeholder="Nom du destinataire (optionnel)" className={inp} />
      <textarea value={parsed.message || ''} onChange={(e) => update({ message: e.target.value })}
        placeholder="Message personnalisé (optionnel)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Occasion</label>
        <div className="flex flex-wrap gap-1.5">
          {occasions.map((o) => (
            <button key={o} type="button" onClick={() => update({ occasion: parsed.occasion === o ? '' : o })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${parsed.occasion === o ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <p className={sec}>Paramètres</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date d&apos;expiration</label>
          <input type="date" value={parsed.expiry_date || ''} onChange={(e) => update({ expiry_date: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Couleur</label>
          <input type="color" value={parsed.color || '#8B5CF6'} onChange={(e) => update({ color: e.target.value })}
            className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Thème de la carte</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[['gradient', '🌈 Dégradé'], ['solid', '🎨 Couleur unie'], ['dark', '🌙 Sombre']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => update({ theme: v })}
              className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${parsed.theme === v ? 'bg-[#041B4D] text-white border-[#041B4D]' : 'bg-white text-gray-600 border-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <input type="url" value={parsed.redeem_url || ''} onChange={(e) => update({ redeem_url: e.target.value })}
        placeholder="Lien pour utiliser la carte (boutique en ligne, optionnel)" className={inp} />
      <textarea value={parsed.terms || ''} onChange={(e) => update({ terms: e.target.value })}
        placeholder="Conditions d'utilisation (optionnel)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />

      <p className={sec}>Visuels</p>
      <ImageUploadField label="Logo de la marque" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Format carré — affiché sur la carte" />
      <ImageUploadField label="Image de fond / Bannière" value={parsed.cover || ''} onChange={(url) => update({ cover: url })} hint="Optionnel — personnalise l'arrière-plan" />
    </div>
  )
}

// ─── Download Form ────────────────────────────────────────────────────────────
function DownloadForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.download_json ? JSON.parse(data.download_json) : {
    title: '', description: '', file_url: '', file_name: '', file_size: '',
    button_label: 'Télécharger', color: '#041B4D', password: '', max_downloads: '',
  }
  function update(patch: object) { onChange({ ...data, download_json: JSON.stringify({ ...parsed, ...patch }) }) }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]'
  const sec = 'text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100 mt-1'
  return (
    <div className="space-y-3">
      <input value={parsed.title || ''} onChange={(e) => update({ title: e.target.value })} placeholder="Titre du fichier *" className={inp} />
      <textarea value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description (optionnel)" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 resize-none" />
      <input type="url" value={parsed.file_url || ''} onChange={(e) => update({ file_url: e.target.value })}
        placeholder="URL du fichier (Google Drive, Dropbox, S3…) *" className={inp} />
      <div className="grid grid-cols-2 gap-2">
        <input value={parsed.file_name || ''} onChange={(e) => update({ file_name: e.target.value })} placeholder="Nom du fichier affiché" className={inp} />
        <input value={parsed.file_size || ''} onChange={(e) => update({ file_size: e.target.value })} placeholder="Taille (ex: 2.4 MB)" className={inp} />
      </div>
      <input value={parsed.button_label || ''} onChange={(e) => update({ button_label: e.target.value })}
        placeholder="Texte du bouton (ex: Télécharger)" className={inp} />
      <p className={sec}>Sécurité (optionnel)</p>
      <input type="password" value={parsed.password || ''} onChange={(e) => update({ password: e.target.value })}
        placeholder="Mot de passe pour protéger le téléchargement" className={inp} />
      <input type="number" value={parsed.max_downloads || ''} onChange={(e) => update({ max_downloads: e.target.value })}
        placeholder="Nbre max de téléchargements (0 = illimité)" className={inp} />
      <input type="color" value={parsed.color || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
        className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer" />
    </div>
  )
}
