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
  const parsed = data.menu_json ? JSON.parse(data.menu_json) : { restaurant: '', description: '', categories: [] }

  function update(patch: object) {
    const updated = { ...parsed, ...patch }
    onChange({ ...data, menu_json: JSON.stringify(updated) })
  }

  function addCategory() {
    update({ categories: [...(parsed.categories || []), { category: 'Nouvelle catégorie', items: [] }] })
  }

  function updateCategory(ci: number, name: string) {
    const cats = [...parsed.categories]
    cats[ci] = { ...cats[ci], category: name }
    update({ categories: cats })
  }

  function addItem(ci: number) {
    const cats = [...parsed.categories]
    cats[ci] = { ...cats[ci], items: [...(cats[ci].items || []), { name: '', price: '', description: '' }] }
    update({ categories: cats })
  }

  function updateItem(ci: number, ii: number, field: string, value: string) {
    const cats = [...parsed.categories]
    cats[ci].items[ii] = { ...cats[ci].items[ii], [field]: value }
    update({ categories: cats })
  }

  function removeItem(ci: number, ii: number) {
    const cats = [...parsed.categories]
    cats[ci].items = cats[ci].items.filter((_: any, i: number) => i !== ii)
    update({ categories: cats })
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <input value={parsed.restaurant || ''} onChange={(e) => update({ restaurant: e.target.value })}
        placeholder="Nom du restaurant" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description (optionnel)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />

      {(parsed.categories || []).map((cat: any, ci: number) => (
        <div key={ci} className="border border-gray-200 rounded-xl p-3 space-y-2">
          <input value={cat.category} onChange={(e) => updateCategory(ci, e.target.value)}
            className="w-full font-semibold text-sm border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/40" />
          {(cat.items || []).map((item: any, ii: number) => (
            <div key={ii} className="flex gap-2 items-center">
              <input value={item.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)}
                placeholder="Plat" className="flex-1 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
              <input value={item.price} onChange={(e) => updateItem(ci, ii, 'price', e.target.value)}
                placeholder="Prix" className="w-20 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
              <button onClick={() => removeItem(ci, ii)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>
          ))}
          <button onClick={() => addItem(ci)} className="text-xs text-[#FF6A00] font-semibold hover:underline">+ Ajouter un plat</button>
        </div>
      ))}
      <button onClick={addCategory} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors">
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

  return (
    <div className="space-y-3">
      <input value={parsed.title || ''} onChange={(e) => update({ title: e.target.value })}
        placeholder="Titre du coupon (ex: Offre spéciale)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.brand || ''} onChange={(e) => update({ brand: e.target.value })}
        placeholder="Nom de la marque / boutique" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.discount || ''} onChange={(e) => update({ discount: e.target.value })}
        placeholder="Réduction (ex: -20%, 500 FCFA offerts)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.code || ''} onChange={(e) => update({ code: e.target.value })}
        placeholder="Code promo (ex: PROMO2025)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.description || ''} onChange={(e) => update({ description: e.target.value })}
        placeholder="Description / conditions" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <div>
        <label className="block text-xs text-gray-500 mb-1">Date d'expiration</label>
        <input type="date" value={parsed.expires || ''} onChange={(e) => update({ expires: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      </div>
      <ImageUploadField label="Logo / Image" value={parsed.logo || ''} onChange={(url) => update({ logo: url })} hint="Optionnel" />
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
    case 'wifi':
      return <>
        <Field label="Nom du réseau (SSID)" name="ssid" placeholder="MonWiFi" data={data} onChange={onChange} required />
        <Field label="Mot de passe" name="password" type="password" placeholder="••••••••" data={data} onChange={onChange} />
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Sécurité</label>
          <select
            value={data.encryption || 'WPA'}
            onChange={(e) => onChange({ ...data, encryption: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">Aucun</option>
          </select>
        </div>
      </>
    case 'vcard':
      return <>
        <Field label="Nom complet" name="name" placeholder="Marie Kouassi" data={data} onChange={onChange} required />
        <Field label="Téléphone" name="phone" type="tel" placeholder="+225 07 00 00 00 00" data={data} onChange={onChange} />
        <Field label="E-mail" name="email" type="email" placeholder="contact@exemple.com" data={data} onChange={onChange} />
        <Field label="Entreprise" name="org" placeholder="IBIG SARL" data={data} onChange={onChange} />
        <Field label="Site web" name="website" type="url" placeholder="https://monsite.com" data={data} onChange={onChange} />
      </>
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
    case 'social':
      return <Field label="Lien du profil" name="url" type="url" placeholder="https://facebook.com/votrepage" data={data} onChange={onChange} required />
    case 'location':
      return <>
        <Field label="Latitude" name="lat" placeholder="5.3484" data={data} onChange={onChange} required />
        <Field label="Longitude" name="lng" placeholder="-4.0167" data={data} onChange={onChange} required />
      </>
    case 'event':
      return <EventForm data={data} onChange={onChange} />
    case 'lead':
      return <LeadForm data={data} onChange={onChange} />
    case 'payment':
      return <PaymentForm data={data} onChange={onChange} />
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
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 whitespace-nowrap">Couleur accent</label>
        <input type="color" value={(parsed.color as string) || '#041B4D'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>
      <ImageUploadField label="Logo / Bannière" value={(parsed.logo as string) || ''} onChange={(url) => update({ logo: url })} hint="Optionnel — affiché en haut de la page événement" />
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

  function toggleMethod(m: string) {
    const next = methods.includes(m) ? methods.filter((x) => x !== m) : [...methods, m]
    update({ methods: next })
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
        <p className="text-xs text-gray-500 mb-2">Méthodes acceptées <span className="text-gray-400">(GeniusPay gère la sélection finale)</span></p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'stripe', label: '💳 Carte', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
            { id: 'wave',   label: '🌊 Wave',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
            { id: 'orange', label: '🟠 Orange', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            { id: 'mtn',    label: '🟡 MTN',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            { id: 'moov',   label: '🔵 Moov',   color: 'bg-sky-100 text-sky-700 border-sky-200' },
            { id: 'free',   label: '🟣 Free',   color: 'bg-purple-100 text-purple-700 border-purple-200' },
            { id: 'mpesa',  label: '🟢 M-Pesa', color: 'bg-green-100 text-green-700 border-green-200' },
            { id: 'airtel', label: '🔴 Airtel', color: 'bg-red-100 text-red-700 border-red-200' },
          ].map(({ id, label, color }) => (
            <button key={id} type="button"
              onClick={() => toggleMethod(id)}
              className={`py-2 text-xs font-semibold rounded-lg border transition-all ${methods.includes(id) ? color : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
              {label}
            </button>
          ))}
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
