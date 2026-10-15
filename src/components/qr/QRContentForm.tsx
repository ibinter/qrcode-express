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
    case 'social':
      return <Field label="Lien du profil" name="url" type="url" placeholder="https://facebook.com/votrepage" data={data} onChange={onChange} required />
    case 'location':
      return <>
        <Field label="Latitude" name="lat" placeholder="5.3484" data={data} onChange={onChange} required />
        <Field label="Longitude" name="lng" placeholder="-4.0167" data={data} onChange={onChange} required />
      </>
    default:
      return <Field label="URL / Contenu" name="url" placeholder="https://" data={data} onChange={onChange} />
  }
}
