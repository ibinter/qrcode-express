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
import { Save, LogIn, CheckCircle, Zap, Lock, Calendar, Hash, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const DEFAULT_DESIGN: QRDesign = {
  fgColor: '#041B4D',
  bgColor: '#FFFFFF',
  moduleStyle: 'squares',
  eyeStyle: 'square',
  errorCorrection: 'M',
}

// Types toujours dynamiques (landing page dédiée)
const ALWAYS_DYNAMIC = ['menu', 'coupon', 'biolink', 'vcard_plus', 'catalog', 'review', 'event', 'lead', 'payment', 'business', 'gallery', 'video', 'audio'] as const
// Types qui peuvent devenir dynamiques via toggle (suivi + URL modifiable)
const SUPPORTS_DYNAMIC = ['url', 'whatsapp', 'social', 'pdf', 'email', 'phone', 'sms', 'location', 'event', 'vcard', 'vcard_plus', 'app'] as const

export default function QRGenerator() {
  const tg = useTranslations('generator')
  const [type, setType] = useState<QRType>('url')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const t = params.get('type') as QRType | null
    if (t) setType(t)
  }, [])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [design, setDesign] = useState<QRDesign>(DEFAULT_DESIGN)
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Dynamic mode settings
  const [dynamicMode, setDynamicMode] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [qrPassword, setQrPassword] = useState('')
  const [maxScans, setMaxScans] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setSavedUrl(null)
    setAiImageUrl(null)
    if (!SUPPORTS_DYNAMIC.includes(type as any)) setDynamicMode(false)
  }, [type, formData])

  async function generateAI() {
    if (!content) return
    setAiLoading(true); setAiError(''); setAiImageUrl(null)
    try {
      const res = await fetch('/api/qr-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: design.aiPrompt,
          style: design.aiStyle,
          fgColor: design.fgColor,
          bgColor: design.bgColor,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur IA')
      setAiImageUrl(data.imageUrl)
    } catch (e: any) {
      setAiError(e.message || 'Erreur lors de la génération IA')
    } finally {
      setAiLoading(false)
    }
  }

  const isAlwaysDynamic = ALWAYS_DYNAMIC.includes(type as any)
  const supportsDynamicToggle = SUPPORTS_DYNAMIC.includes(type as any)
  const effectiveDynamic = isAlwaysDynamic || dynamicMode

  const content = savedUrl ?? buildQRContent(type, formData)

  function getDynamicContent(): string {
    if (type === 'menu') return formData.menu_json || ''
    if (type === 'coupon') return formData.coupon_json || ''
    if (type === 'biolink') return formData.bio_json || ''
    if (type === 'vcard_plus') return formData.vcard_json || ''
    if (type === 'catalog') return formData.catalog_json || ''
    if (type === 'review') return formData.review_json || ''
    if (type === 'event') return formData.event_json || ''
    if (type === 'lead') return formData.lead_json || ''
    if (type === 'payment')  return formData.payment_json  || ''
    if (type === 'business') return formData.business_json || ''
    if (type === 'gallery')  return formData.gallery_json  || ''
    if (type === 'video')    return formData.video_json    || ''
    if (type === 'audio')    return formData.audio_json    || ''
    return buildQRContent(type, formData)
  }

  function getDynamicName(): string {
    try {
      if (type === 'menu') return JSON.parse(formData.menu_json || '{}').restaurant || 'Menu restaurant'
      if (type === 'coupon') return JSON.parse(formData.coupon_json || '{}').title || 'Coupon'
      if (type === 'biolink') return JSON.parse(formData.bio_json || '{}').name || 'Bio Links'
      if (type === 'vcard_plus') return JSON.parse(formData.vcard_json || '{}').name || 'Carte Pro'
      if (type === 'catalog') return JSON.parse(formData.catalog_json || '{}').store || 'Catalogue'
      if (type === 'review')  return JSON.parse(formData.review_json  || '{}').business || 'Avis clients'
      if (type === 'event')   return JSON.parse(formData.event_json   || '{}').name || 'Événement'
      if (type === 'lead')     return JSON.parse(formData.lead_json     || '{}').title || 'Formulaire'
      if (type === 'payment')  return JSON.parse(formData.payment_json  || '{}').merchant || 'Paiement'
      if (type === 'business') return JSON.parse(formData.business_json || '{}').name || 'Page Business'
      if (type === 'gallery')  return JSON.parse(formData.gallery_json  || '{}').title || 'Galerie photos'
      if (type === 'video')    return JSON.parse(formData.video_json    || '{}').title || 'Vidéo'
      if (type === 'audio')    return JSON.parse(formData.audio_json    || '{}').title || 'Audio'
    } catch {}
    return formData.url || formData.text || formData.nom || `QR ${type}`
  }

  async function handleSave() {
    if (!user) return
    const saveContent = effectiveDynamic ? getDynamicContent() : buildQRContent(type, formData)
    if (!saveContent) return
    setSaving(true)
    setSaveError('')
    setSaved(false)

    const name = getDynamicName()

    if (effectiveDynamic) {
      // Use API to generate slug for dynamic QRs
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          mode: 'dynamic',
          content: saveContent,
          name: name.slice(0, 100),
          design,
          expires_at: expiresAt || undefined,
          max_scans: maxScans ? parseInt(maxScans) : undefined,
          password: qrPassword || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || 'Erreur lors de la sauvegarde.')
        setSaving(false)
        return
      }
      const origin = window.location.origin
      if (isAlwaysDynamic) {
        const pathMap: Record<string, string> = { menu: 'menu', coupon: 'coupon', biolink: 'bio', vcard_plus: 'vcard', catalog: 'catalog', review: 'review', event: 'event', lead: 'form', payment: 'pay', business: 'business', gallery: 'gallery', video: 'video', audio: 'audio' }
        setSavedUrl(`${origin}/${pathMap[type]}/${data.qr.id}`)
      } else {
        // URL-based dynamic: use /r/slug redirect for tracking
        setSavedUrl(`${origin}/r/${data.qr.slug}`)
      }
    } else {
      // Static QR: direct Supabase insert
      const { data: inserted, error } = await supabase.from('qr_codes').insert({
        user_id: user.id,
        type,
        mode: 'static',
        content: saveContent,
        name: name.slice(0, 100),
        design,
        status: 'active',
      }).select('id').single()

      if (error || !inserted) {
        setSaveError('Erreur lors de la sauvegarde.')
        setSaving(false)
        return
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-[#041B4D] mb-1">{tg('create_title')}</h2>
        <p className="text-sm text-gray-500 mb-5">{tg('create_sub')}</p>

        {/* Type selector */}
        <QRTypeSelector selected={type} onChange={setType} />

        {/* Dynamic mode toggle for supported types */}
        {user && supportsDynamicToggle && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-800">{tg('dynamic_mode')}</p>
                <p className="text-xs text-blue-600">{tg('dynamic_sub')}</p>
              </div>
            </div>
            <button
              onClick={() => setDynamicMode((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dynamicMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${dynamicMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}

        {/* Security settings shown when dynamic mode is on */}
        {user && (effectiveDynamic && !isAlwaysDynamic || dynamicMode) && (
          <div className="mt-3 border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{tg('adv_options')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1">
                  <Calendar size={12} /> {tg('lbl_expiry')}
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1">
                  <Hash size={12} /> {tg('lbl_max_scans')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxScans}
                  onChange={(e) => setMaxScans(e.target.value)}
                  placeholder={tg('lbl_unlimited')}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1">
                <Lock size={12} /> {tg('lbl_password')}
              </label>
              <input
                type="password"
                value={qrPassword}
                onChange={(e) => setQrPassword(e.target.value)}
                placeholder={tg('lbl_password_ph')}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40"
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-gray-200">
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
              {t === 'content' ? tg('tab_content') : tg('tab_design')}
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
          <QRPreview content={content} design={design} aiImageUrl={aiImageUrl ?? undefined} />

          {/* AI generate button */}
          {tab === 'design' && content && (
            <div className="w-full max-w-[280px] space-y-2">
              <button
                onClick={generateAI}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {aiLoading ? <><Loader2 size={16} className="animate-spin" /> {tg('ai_loading')}</> : <><Sparkles size={16} /> {tg('ai_generate')}</>}
              </button>
              {aiError && <p className="text-xs text-red-500 text-center">{aiError}</p>}
              {aiImageUrl && (
                <button onClick={() => setAiImageUrl(null)} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                  {tg('ai_back')}
                </button>
              )}
            </div>
          )}
          <QRReadinessScore design={design} content={content} />

          {/* Dynamic mode badge */}
          {effectiveDynamic && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
              <Zap size={12} /> {tg('dynamic_badge')}
            </div>
          )}

          {/* Saved URL display */}
          {savedUrl && (
            <div className="w-full max-w-[280px] bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-green-700 font-semibold mb-1">{tg('saved_ok')}</p>
              <p className="text-xs text-green-600 break-all font-mono">{savedUrl}</p>
            </div>
          )}

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
                      <><CheckCircle size={16} className="text-green-600" /><span className="text-green-600">{tg('btn_saved')}</span></>
                    ) : (
                      <><Save size={16} />{saving ? tg('btn_saving') : tg('btn_save')}</>
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
                  {tg('btn_login')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
