'use client'
import { useState } from 'react'
import { Plus, Trash2, FlaskConical } from 'lucide-react'

interface RoutingRule {
  id: string
  rule_type: string
  condition: Record<string, unknown>
  destination: string
  priority: number
  is_active: boolean
}

interface ABVariant { url: string; weight: number }

interface Props {
  qrId: string
  initialRules: RoutingRule[]
}

const RULE_TYPE_LABELS: Record<string, string> = {
  ab_test: '🔀 A/B Test',
  device: '📱 Appareil',
  language: '🌐 Langue',
  country: '🌍 Pays',
  schedule: '⏰ Horaire',
  scan_count: '🔢 Nbre de scans',
}

function conditionSummary(rule: RoutingRule): string {
  const c = rule.condition
  if (rule.rule_type === 'ab_test') {
    const v = c.variants as ABVariant[] | undefined
    if (!v) return '—'
    return v.map((x, i) => `V${i + 1} ${x.weight}%`).join(' / ')
  }
  if (rule.rule_type === 'device') return `Appareil = ${c.device}`
  if (rule.rule_type === 'language') return `Langue = ${c.lang}`
  if (rule.rule_type === 'country') return `Pays = ${c.country}`
  if (rule.rule_type === 'schedule') return `${c.start} – ${c.end}`
  if (rule.rule_type === 'scan_count') return `Après ${c.min} scans`
  return JSON.stringify(c)
}

const defaultVariants: ABVariant[] = [
  { url: '', weight: 50 },
  { url: '', weight: 50 },
]

export default function RoutingRulesManager({ qrId, initialRules }: Props) {
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    rule_type: 'ab_test',
    device: 'mobile',
    lang: 'fr',
    country: 'CI',
    start: '08:00',
    end: '20:00',
    scan_min: '0',
    destination: '',
    priority: '0',
  })
  const [abVariants, setAbVariants] = useState<ABVariant[]>(defaultVariants)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function buildCondition(): Record<string, unknown> {
    if (form.rule_type === 'ab_test') return { variants: abVariants }
    if (form.rule_type === 'device') return { device: form.device }
    if (form.rule_type === 'language') return { lang: form.lang }
    if (form.rule_type === 'country') return { country: form.country }
    if (form.rule_type === 'schedule') return { start: form.start, end: form.end }
    if (form.rule_type === 'scan_count') return { min: parseInt(form.scan_min) }
    return {}
  }

  function setVariantWeight(i: number, w: number) {
    const next = [...abVariants]
    next[i] = { ...next[i], weight: w }
    // Auto-balance remaining variants
    if (abVariants.length === 2) {
      next[1 - i] = { ...next[1 - i], weight: 100 - w }
    }
    setAbVariants(next)
  }

  function totalWeight() { return abVariants.reduce((s, v) => s + v.weight, 0) }

  async function handleAdd() {
    if (form.rule_type === 'ab_test') {
      if (abVariants.some(v => !v.url.trim())) { setError('Toutes les URLs sont requises'); return }
      if (totalWeight() !== 100) { setError('La somme des poids doit être 100%'); return }
    } else {
      if (!form.destination) { setError('URL de destination requise'); return }
    }

    setSaving(true); setError('')
    const res = await fetch(`/api/qr/${qrId}/routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rule_type: form.rule_type,
        condition: buildCondition(),
        destination: form.rule_type === 'ab_test' ? 'ab_test' : form.destination,
        priority: parseInt(form.priority),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setSaving(false); return }
    setRules(prev => [data.rule, ...prev])
    setAdding(false)
    setSaving(false)
    setAbVariants(defaultVariants)
    setForm(f => ({ ...f, destination: '' }))
  }

  async function handleDelete(ruleId: string) {
    await fetch(`/api/qr/${qrId}/routing/${ruleId}`, { method: 'DELETE' })
    setRules(prev => prev.filter(r => r.id !== ruleId))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#041B4D]">Routage intelligent &amp; A/B Test</h2>
        <button onClick={() => setAdding(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6A00] hover:text-orange-700 transition-colors">
          <Plus size={14} /> Ajouter une règle
        </button>
      </div>

      {adding && (
        <div className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3 bg-gray-50">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type de règle</label>
            <select value={form.rule_type} onChange={e => setForm(f => ({ ...f, rule_type: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              {Object.entries(RULE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* A/B Test UI */}
          {form.rule_type === 'ab_test' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                <FlaskConical size={14} />
                Le trafic sera divisé aléatoirement selon les poids définis.
              </div>

              {abVariants.map((v, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#041B4D]">Variant {String.fromCharCode(65 + i)}</span>
                    {abVariants.length > 2 && (
                      <button onClick={() => setAbVariants(prev => prev.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    )}
                  </div>
                  <input type="url" value={v.url}
                    onChange={e => { const n = [...abVariants]; n[i] = { ...n[i], url: e.target.value }; setAbVariants(n) }}
                    placeholder={`https://url-variant-${String.fromCharCode(65 + i).toLowerCase()}.com`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <div className="flex items-center gap-3">
                    <input type="range" min="1" max="99" value={v.weight}
                      onChange={e => setVariantWeight(i, parseInt(e.target.value))}
                      className="flex-1 accent-[#FF6A00]" />
                    <span className="text-sm font-bold text-[#FF6A00] w-10 text-right">{v.weight}%</span>
                  </div>
                </div>
              ))}

              {/* Visual split bar */}
              <div className="rounded-full overflow-hidden h-3 flex gap-0.5">
                {abVariants.map((v, i) => {
                  const colors = ['#FF6A00', '#041B4D', '#059669', '#7c3aed']
                  return <div key={i} style={{ width: `${v.weight}%`, background: colors[i % colors.length] }} />
                })}
              </div>
              <div className="flex gap-3 text-xs">
                {abVariants.map((v, i) => {
                  const colors = ['text-[#FF6A00]', 'text-[#041B4D]', 'text-green-600', 'text-purple-600']
                  return <span key={i} className={`font-semibold ${colors[i % colors.length]}`}>V{String.fromCharCode(65+i)}: {v.weight}%</span>
                })}
                <span className={`ml-auto font-semibold ${totalWeight() !== 100 ? 'text-red-500' : 'text-green-600'}`}>
                  Total: {totalWeight()}%
                </span>
              </div>

              {abVariants.length < 4 && (
                <button onClick={() => {
                  const remaining = Math.max(1, Math.floor((100 - totalWeight()) / 1))
                  setAbVariants(prev => [...prev, { url: '', weight: remaining }])
                }}
                  className="text-xs text-[#FF6A00] hover:underline flex items-center gap-1">
                  <Plus size={12} /> Ajouter un 3e variant
                </button>
              )}
            </div>
          )}

          {/* Standard condition fields */}
          {form.rule_type === 'device' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Appareil</label>
              <select value={form.device} onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablette</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
          )}
          {form.rule_type === 'language' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Code langue</label>
              <input value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}
                placeholder="fr, en, ar..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}
          {form.rule_type === 'country' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Code pays (ex: CI, SN, ML)</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value.toUpperCase() }))}
                placeholder="CI" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}
          {form.rule_type === 'schedule' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Heure début</label>
                <input type="time" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Heure fin</label>
                <input type="time" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
          )}
          {form.rule_type === 'scan_count' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Après X scans</label>
              <input type="number" min="0" value={form.scan_min} onChange={e => setForm(f => ({ ...f, scan_min: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}

          {/* Destination — hidden for ab_test */}
          {form.rule_type !== 'ab_test' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL de destination</label>
              <input type="url" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                placeholder="https://destination.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Priorité (plus élevé = vérifié en premier)</label>
            <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setAbVariants(defaultVariants) }}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">
              Annuler
            </button>
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
              {saving ? 'Enregistrement…' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <p className="text-sm text-gray-400 py-3 text-center">
          Aucune règle. Ajoutez un A/B test ou une règle de routage intelligent.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className={`flex items-start gap-3 p-3 rounded-xl border ${rule.rule_type === 'ab_test' ? 'border-purple-100 bg-purple-50/40' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#041B4D]">
                  {RULE_TYPE_LABELS[rule.rule_type] || rule.rule_type} — {conditionSummary(rule)}
                </p>
                {rule.rule_type === 'ab_test' ? (
                  <div className="mt-1 space-y-0.5">
                    {((rule.condition.variants as ABVariant[]) || []).map((v, i) => (
                      <p key={i} className="text-xs text-gray-500 truncate">
                        <span className="font-semibold text-gray-700">V{String.fromCharCode(65+i)} ({v.weight}%)</span> → {v.url}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 truncate mt-0.5">→ {rule.destination}</p>
                )}
              </div>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full shrink-0 mt-0.5">P{rule.priority}</span>
              <button onClick={() => handleDelete(rule.id)} className="text-red-400 hover:text-red-600 shrink-0 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
