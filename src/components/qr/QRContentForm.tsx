'use client'
import { useState, useRef } from 'react'
import { QRType } from '@/lib/types'
import { Upload, FileText, X } from 'lucide-react'

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
    </div>
  )
}

function BioForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const parsed = data.bio_json ? JSON.parse(data.bio_json) : { name: '', bio: '', color: '#FF6A00', links: [] }

  function update(patch: object) {
    onChange({ ...data, bio_json: JSON.stringify({ ...parsed, ...patch }) })
  }

  function addLink() {
    update({ links: [...(parsed.links || []), { label: '', url: '', network: 'autre' }] })
  }

  function updateLink(i: number, field: string, value: string) {
    const links = [...(parsed.links || [])]
    links[i] = { ...links[i], [field]: value }
    update({ links })
  }

  function removeLink(i: number) {
    update({ links: parsed.links.filter((_: any, idx: number) => idx !== i) })
  }

  const networks = ['instagram', 'tiktok', 'facebook', 'twitter', 'linkedin', 'youtube', 'whatsapp', 'website', 'telegram', 'autre']

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
      <input value={parsed.name || ''} onChange={(e) => update({ name: e.target.value })}
        placeholder="Nom ou pseudo" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <input value={parsed.bio || ''} onChange={(e) => update({ bio: e.target.value })}
        placeholder="Bio / description courte" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Couleur accent</label>
        <input type="color" value={parsed.color || '#FF6A00'} onChange={(e) => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Liens</p>
      {(parsed.links || []).map((link: any, i: number) => (
        <div key={i} className="flex gap-2 items-center">
          <select value={link.network || 'autre'} onChange={(e) => updateLink(i, 'network', e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none w-28">
            {networks.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <input value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)}
            placeholder="Texte du bouton" className="flex-1 border border-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          <input value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)}
            placeholder="URL" className="flex-1 border border-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
          <button onClick={() => removeLink(i)} className="text-red-400 text-xs hover:text-red-600">✕</button>
        </div>
      ))}
      <button onClick={addLink} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors">
        + Ajouter un lien
      </button>
    </div>
  )
}

function AppForm({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express-ibig.vercel.app'

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
      return <Field label="URL du site web" name="url" type="url" placeholder="https://monsite.com" data={data} onChange={onChange} required />
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
      return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs text-gray-500">Carte de visite digitale avec photo et liens sociaux</p>
          <input value={vp.name || ''} onChange={(e) => updateVP({ name: e.target.value })}
            placeholder="Nom complet" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.title || ''} onChange={(e) => updateVP({ title: e.target.value })}
            placeholder="Poste / Titre (ex: Directeur Commercial)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.company || ''} onChange={(e) => updateVP({ company: e.target.value })}
            placeholder="Entreprise" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.phone || ''} onChange={(e) => updateVP({ phone: e.target.value })}
            placeholder="Téléphone" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.email || ''} onChange={(e) => updateVP({ email: e.target.value })}
            placeholder="E-mail" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.website || ''} onChange={(e) => updateVP({ website: e.target.value })}
            placeholder="Site web" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.photo || ''} onChange={(e) => updateVP({ photo: e.target.value })}
            placeholder="URL photo de profil (optionnel)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.whatsapp || ''} onChange={(e) => updateVP({ whatsapp: e.target.value })}
            placeholder="WhatsApp (ex: +22507000000)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <input value={vp.linkedin || ''} onChange={(e) => updateVP({ linkedin: e.target.value })}
            placeholder="LinkedIn URL" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Couleur accent</label>
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
      <input value={parsed.logo || ''} onChange={(e) => update({ logo: e.target.value })}
        placeholder="URL logo (optionnel)" className={inp} />
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
                <input value={p.image || ''} onChange={(e) => updateProduct(ci, pi, 'image', e.target.value)}
                  placeholder="URL image (optionnel)" className="w-full border border-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none" />
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
      <input value={parsed.logo || ''} onChange={(e) => update({ logo: e.target.value })}
        placeholder="URL logo (optionnel)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40" />
    </div>
  )
}

function EventForm({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
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
      <input value={(parsed.logo as string) || ''} onChange={(e) => update({ logo: e.target.value })}
        placeholder="URL logo/bannière (optionnel)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/40" />
    </div>
  )
}

type LeadField = { id: string; type: 'text' | 'email' | 'tel' | 'textarea' | 'select'; label: string; required: boolean; options?: string }

function LeadForm({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
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
      <input value={(parsed.logo as string) || ''} onChange={(e) => update({ logo: e.target.value })}
        placeholder="URL logo (optionnel)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40" />
    </div>
  )
}

function PaymentForm({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const raw = typeof data.payment_json === 'string' ? data.payment_json : ''
  let parsed: Record<string, unknown> = {}
  try { parsed = raw ? JSON.parse(raw) : {} } catch {}

  function update(fields: Record<string, unknown>) {
    onChange({ ...data, payment_json: JSON.stringify({ ...parsed, ...fields }) })
  }

  const methods: string[] = Array.isArray(parsed.methods) ? parsed.methods as string[] : ['wave', 'orange', 'mtn']

  function toggleMethod(m: string) {
    const next = methods.includes(m) ? methods.filter((x) => x !== m) : [...methods, m]
    update({ methods: next })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 bg-green-50 rounded-lg p-3 leading-relaxed">
        💳 <strong>QR de paiement Mobile Money</strong> : vos clients scannent et paient directement via Wave, Orange Money ou MTN MoMo.
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
        <p className="text-xs text-gray-500 mb-2">Méthodes acceptées</p>
        <div className="flex gap-3">
          {[
            { id: 'wave', label: '🌊 Wave', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            { id: 'orange', label: '🟠 Orange', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            { id: 'mtn', label: '🟡 MTN', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          ].map(({ id, label, color }) => (
            <button key={id} type="button"
              onClick={() => toggleMethod(id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${methods.includes(id) ? color : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
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
      <input value={(parsed.logo as string) || ''} onChange={(e) => update({ logo: e.target.value })}
        placeholder="URL logo marchand (optionnel)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40" />
    </div>
  )
}
