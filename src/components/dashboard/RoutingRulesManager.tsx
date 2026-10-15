'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface RoutingRule {
  id: string
  rule_type: string
  condition: Record<string, unknown>
  destination: string
  priority: number
  is_active: boolean
}

interface Props {
  qrId: string
  initialRules: RoutingRule[]
}

const RULE_TYPE_LABELS: Record<string, string> = {
  device: '📱 Appareil',
  language: '🌐 Langue',
  country: '🌍 Pays',
  schedule: '⏰ Horaire',
  scan_count: '🔢 Nbre de scans',
}

function conditionSummary(rule: RoutingRule): string {
  const c = rule.condition
  if (rule.rule_type === 'device') return `Appareil = ${c.device}`
  if (rule.rule_type === 'language') return `Langue = ${c.lang}`
  if (rule.rule_type === 'country') return `Pays = ${c.country}`
  if (rule.rule_type === 'schedule') return `${c.start} – ${c.end}`
  if (rule.rule_type === 'scan_count') return `Après ${c.min} scans`
  return JSON.stringify(c)
}

export default function RoutingRulesManager({ qrId, initialRules }: Props) {
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    rule_type: 'device',
    device: 'mobile',
    lang: 'fr',
    country: 'CI',
    start: '08:00',
    end: '20:00',
    scan_min: '0',
    destination: '',
    priority: '0',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function buildCondition(): Record<string, unknown> {
    if (form.rule_type === 'device') return { device: form.device }
    if (form.rule_type === 'language') return { lang: form.lang }
    if (form.rule_type === 'country') return { country: form.country }
    if (form.rule_type === 'schedule') return { start: form.start, end: form.end }
    if (form.rule_type === 'scan_count') return { min: parseInt(form.scan_min) }
    return {}
  }

  async function handleAdd() {
    if (!form.destination) { setError('URL de destination requise'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/qr/${qrId}/routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rule_type: form.rule_type,
        condition: buildCondition(),
        destination: form.destination,
        priority: parseInt(form.priority),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setSaving(false); return }
    setRules((prev) => [data.rule, ...prev])
    setAdding(false)
    setSaving(false)
    setForm((f) => ({ ...f, destination: '' }))
  }

  async function handleDelete(ruleId: string) {
    await fetch(`/api/qr/${qrId}/routing/${ruleId}`, { method: 'DELETE' })
    setRules((prev) => prev.filter((r) => r.id !== ruleId))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#041B4D]">Routage intelligent</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6A00] hover:text-orange-700 transition-colors"
        >
          <Plus size={14} /> Ajouter une règle
        </button>
      </div>

      {adding && (
        <div className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3 bg-gray-50">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type de règle</label>
            <select value={form.rule_type} onChange={(e) => setForm((f) => ({ ...f, rule_type: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {Object.entries(RULE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Condition fields by type */}
          {form.rule_type === 'device' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Appareil</label>
              <select value={form.device} onChange={(e) => setForm((f) => ({ ...f, device: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablette</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
          )}
          {form.rule_type === 'language' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Code langue</label>
              <input value={form.lang} onChange={(e) => setForm((f) => ({ ...f, lang: e.target.value }))}
                placeholder="fr, en, ar..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}
          {form.rule_type === 'country' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Code pays (ex: CI, SN, ML)</label>
              <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
                placeholder="CI" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}
          {form.rule_type === 'schedule' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Heure début</label>
                <input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Heure fin</label>
                <input type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
          )}
          {form.rule_type === 'scan_count' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Après X scans</label>
              <input type="number" min="0" value={form.scan_min} onChange={(e) => setForm((f) => ({ ...f, scan_min: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">URL de destination</label>
            <input type="url" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              placeholder="https://destination.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Priorité (plus élevé = vérifié en premier)</label>
            <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">
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
          Aucune règle. Ajoutez une règle pour rediriger selon l'appareil, le pays ou l'heure.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#041B4D]">
                  {RULE_TYPE_LABELS[rule.rule_type] || rule.rule_type} — {conditionSummary(rule)}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">→ {rule.destination}</p>
              </div>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full shrink-0">P{rule.priority}</span>
              <button onClick={() => handleDelete(rule.id)} className="text-red-400 hover:text-red-600 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
