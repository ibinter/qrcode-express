'use client'
import { QRType } from '@/lib/types'

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
