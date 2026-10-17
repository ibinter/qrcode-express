'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, Download, CheckCircle, XCircle, Loader2, FileText, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Row {
  name: string
  content: string
  type: string
  status: 'pending' | 'generating' | 'done' | 'error'
  error?: string
}

const EXAMPLE_CSV = `name,content,type
My website,https://mysite.com,url
WhatsApp contact,+2250700000000,whatsapp
Restaurant menu,https://menu.myrestaurant.com,url
John Doe contact,BEGIN:VCARD\nFN:John Doe\nTEL:+33600000000\nEND:VCARD,vcard`

export default function BulkPage() {
  const t = useTranslations('bulkQR')
  const [rows, setRows] = useState<Row[]>([])
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [zipUrl, setZipUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): Row[] => {
    const lines = text.trim().split('\n').filter(l => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const nameIdx = headers.indexOf('name')
    const contentIdx = headers.indexOf('content')
    const typeIdx = headers.indexOf('type')
    if (contentIdx === -1) return []
    return lines.slice(1).map(line => {
      const cols = line.split(',')
      return {
        name: nameIdx >= 0 ? (cols[nameIdx]?.trim() || `QR ${Math.random().toString(36).slice(2,6)}`) : `QR ${Math.random().toString(36).slice(2,6)}`,
        content: cols[contentIdx]?.trim() || '',
        type: typeIdx >= 0 ? (cols[typeIdx]?.trim() || 'url') : 'url',
        status: 'pending' as const,
      }
    }).filter(r => r.content)
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setDone(false); setZipUrl(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string)
      if (parsed.length === 0) {
        setError(t('err_invalid'))
      } else if (parsed.length > 500) {
        setError(t('err_max'))
      } else {
        setRows(parsed)
      }
    }
    reader.readAsText(file)
  }

  const generate = async () => {
    if (rows.length === 0) return
    setGenerating(true); setError(''); setDone(false)

    setRows(r => r.map(row => ({ ...row, status: 'generating' })))

    try {
      const res = await fetch('/api/qr/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rows.map(r => ({ name: r.name, content: r.content, type: r.type })) }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || t('server_error'))
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setZipUrl(url)
      setRows(r => r.map(row => ({ ...row, status: 'done' })))
      setDone(true)
    } catch (e: any) {
      setError(e.message || t('gen_error'))
      setRows(r => r.map(row => ({ ...row, status: 'error' })))
    } finally {
      setGenerating(false)
    }
  }

  const downloadZip = () => {
    if (!zipUrl) return
    const a = document.createElement('a')
    a.href = zipUrl
    a.download = `qrcodes-bulk-${Date.now()}.zip`
    a.click()
  }

  const reset = () => {
    setRows([]); setDone(false); setZipUrl(null); setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">{t('back')}</Link>
          <div>
            <h1 className="text-xl font-bold text-[#041B4D]">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-bold text-blue-800 mb-2">{t('csv_format')}</h2>
          <p className="text-xs text-blue-700 mb-3">{t('csv_columns').split(':')[0]}: <code className="bg-blue-100 px-1 rounded">name</code>, <code className="bg-blue-100 px-1 rounded">content</code>, <code className="bg-blue-100 px-1 rounded">type</code></p>
          <pre className="text-[11px] bg-white rounded-xl p-3 overflow-x-auto text-gray-600 border border-blue-100">{EXAMPLE_CSV}</pre>
          <button
            onClick={() => {
              const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = 'sample-bulk.csv'; a.click()
            }}
            className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <Download size={12} /> {t('csv_download')}
          </button>
        </div>

        {/* Upload zone */}
        {rows.length === 0 ? (
          <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF6A00] hover:bg-orange-50/30 transition-colors">
            <Upload size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600">{t('drop_hint')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('drop_sub')}</p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
          </label>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <span className="text-sm font-semibold text-[#041B4D]">{rows.length} {t('detected')}</span>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">{t('reset')}</button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">{t('col_name')}</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">{t('col_content')}</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">{t('col_type')}</th>
                    <th className="px-4 py-2 text-gray-500 font-medium">{t('col_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-700 truncate max-w-[120px]">{row.name}</td>
                      <td className="px-4 py-2 text-gray-500 truncate max-w-[180px]">{row.content}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{row.type}</span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {row.status === 'pending' && <span className="text-gray-300">—</span>}
                        {row.status === 'generating' && <Loader2 size={13} className="animate-spin text-[#FF6A00] mx-auto" />}
                        {row.status === 'done' && <CheckCircle size={13} className="text-green-500 mx-auto" />}
                        {row.status === 'error' && <XCircle size={13} className="text-red-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {rows.length > 0 && !done && (
          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
          >
            {generating ? <><Loader2 size={16} className="animate-spin" /> {t('generating')}</> : <><FileText size={16} /> {t('generate_btn', { n: rows.length })}</>}
          </button>
        )}

        {done && zipUrl && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-800 mb-1">{t('success', { n: rows.length })}</p>
            <p className="text-xs text-green-600 mb-4">{t('success_sub')}</p>
            <button
              onClick={downloadZip}
              className="flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
            >
              <Download size={16} /> {t('download_zip')}
            </button>
            <button onClick={reset} className="mt-3 text-xs text-gray-400 hover:underline block mx-auto">
              {t('new_import')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
