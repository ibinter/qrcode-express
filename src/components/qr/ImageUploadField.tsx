'use client'
import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
  placeholder?: string
  hint?: string
}

export default function ImageUploadField({ label, value, onChange, placeholder, hint }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setError('')
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: form })
    const json = await res.json()
    if (json.url) {
      onChange(json.url)
    } else if (res.status === 401) {
      setError('Connectez-vous pour uploader une image, ou utilisez le mode URL.')
    } else {
      setError(json.error || 'Erreur upload')
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="flex gap-1 text-xs">
          <button type="button" onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${mode === 'upload' ? 'bg-[#FF6A00] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            Upload
          </button>
          <button type="button" onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${mode === 'url' ? 'bg-[#FF6A00] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
          <img src={value} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '' }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{value.startsWith('http') ? new URL(value).pathname.split('/').pop() : value}</p>
          </div>
          <button type="button" onClick={() => onChange('')} className="text-gray-400 hover:text-red-500 shrink-0">
            <X size={16} />
          </button>
        </div>
      ) : mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragging ? 'border-[#FF6A00] bg-orange-50' : 'border-gray-200 hover:border-[#FF6A00]/50 hover:bg-orange-50/30'
          }`}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#FF6A00] font-semibold">Upload en cours…</span>
            </div>
          ) : (
            <>
              <Upload size={22} className="mx-auto mb-1.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-600">Glissez une image ou cliquez</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 5 Mo</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-gray-400 shrink-0" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'https://exemple.com/image.jpg'}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00]"
          />
        </div>
      )}

      {hint && !value && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
