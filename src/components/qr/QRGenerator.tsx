'use client'
import { useState, useEffect } from 'react'
import QRTypeSelector from './QRTypeSelector'
import QRContentForm from './QRContentForm'
import QRPreview from './QRPreview'
import QRDesignPanel from './QRDesignPanel'
import QRReadinessScore from './QRReadinessScore'
import { QRType, QRDesign } from '@/lib/types'
import { buildQRContent } from '@/lib/qr-content'
import { createClient } from '@/lib/supabase/client'
import { Save, LogIn, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const DEFAULT_DESIGN: QRDesign = {
  fgColor: '#041B4D',
  bgColor: '#FFFFFF',
  moduleStyle: 'squares',
  eyeStyle: 'square',
  errorCorrection: 'M',
}

export default function QRGenerator() {
  const [type, setType] = useState<QRType>('url')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [design, setDesign] = useState<QRDesign>(DEFAULT_DESIGN)
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { setSavedUrl(null) }, [type, formData])

  const DYNAMIC_TYPES = ['menu', 'coupon', 'biolink'] as const
  const isDynamic = DYNAMIC_TYPES.includes(type as any)
  const [savedUrl, setSavedUrl] = useState<string | null>(null)

  const content = savedUrl ?? buildQRContent(type, formData)

  function getDynamicContent(): string {
    if (type === 'menu') return formData.menu_json || ''
    if (type === 'coupon') return formData.coupon_json || ''
    if (type === 'biolink') return formData.bio_json || ''
    return buildQRContent(type, formData)
  }

  function getDynamicName(): string {
    try {
      if (type === 'menu') return JSON.parse(formData.menu_json || '{}').restaurant || 'Menu restaurant'
      if (type === 'coupon') return JSON.parse(formData.coupon_json || '{}').title || 'Coupon'
      if (type === 'biolink') return JSON.parse(formData.bio_json || '{}').name || 'Bio Links'
    } catch {}
    return `QR ${type}`
  }

  async function handleSave() {
    if (!user) return
    const saveContent = isDynamic ? getDynamicContent() : buildQRContent(type, formData)
    if (!saveContent) return
    setSaving(true)
    setSaveError('')
    setSaved(false)

    const name = isDynamic ? getDynamicName() : (formData.url || formData.text || formData.nom || `QR ${type}`)
    const { data: inserted, error } = await supabase.from('qr_codes').insert({
      user_id: user.id,
      type,
      mode: isDynamic ? 'dynamic' : 'static',
      content: saveContent,
      name: name.slice(0, 100),
      design,
      status: 'active',
    }).select('id').single()

    if (error || !inserted) {
      setSaveError('Erreur lors de la sauvegarde.')
    } else {
      if (isDynamic) {
        const origin = window.location.origin
        const pathMap: Record<string, string> = { menu: 'menu', coupon: 'coupon', biolink: 'bio' }
        setSavedUrl(`${origin}/${pathMap[type]}/${inserted.id}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-[#041B4D] mb-1">Créer un QR code</h2>
        <p className="text-sm text-gray-500 mb-5">Gratuit · Sans inscription · Téléchargement PNG immédiat</p>

        {/* Type selector */}
        <QRTypeSelector selected={type} onChange={setType} />

        {/* Tabs */}
        <div className="flex gap-1 mt-5 border-b border-gray-200">
          {(['content', 'design'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                tab === t
                  ? 'bg-white border border-b-white border-gray-200 text-[#FF6A00] -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'content' ? 'Contenu' : 'Design'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: form */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
          {tab === 'content' ? (
            <QRContentForm type={type} data={formData} onChange={setFormData} />
          ) : (
            <QRDesignPanel design={design} onChange={setDesign} />
          )}
        </div>

        {/* Right: preview */}
        <div className="p-6 flex flex-col items-center gap-4">
          <QRPreview content={content} design={design} />
          <QRReadinessScore design={design} content={content} />

          {/* Save button */}
          {content && (
            <div className="w-full max-w-[280px]">
              {user ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-[#041B4D] text-[#041B4D] hover:bg-[#041B4D] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {saved ? (
                      <><CheckCircle size={16} className="text-green-600" /><span className="text-green-600">Sauvegardé !</span></>
                    ) : (
                      <><Save size={16} />{saving ? 'Sauvegarde…' : 'Sauvegarder dans mon espace'}</>
                    )}
                  </button>
                  {saveError && <p className="text-xs text-red-500 text-center mt-1">{saveError}</p>}
                </>
              ) : (
                <Link
                  href="/connexion"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-[#041B4D] text-[#041B4D] hover:bg-[#041B4D] hover:text-white transition-colors"
                >
                  <LogIn size={16} />
                  Se connecter pour sauvegarder
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
