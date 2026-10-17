'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

interface Props {
  eventId: string
  eventName: string
  accentColor: string
}

type ScanResult = { ok: true; holderName: string; code: string } | { ok: false; error: string; code?: string }

export default function ScannerClient({ eventId, eventName, accentColor }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const loopRef = useRef<number>(0)
  const lastCodeRef = useRef<string>('')
  const cooldownRef = useRef<boolean>(false)

  const [state, setState] = useState<'idle' | 'loading' | 'scanning' | 'result' | 'error'>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [camError, setCamError] = useState('')
  const [scanCount, setScanCount] = useState(0)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(loopRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  async function validateCode(code: string) {
    if (cooldownRef.current) return
    cooldownRef.current = true
    setState('result')

    try {
      const res = await fetch(`/api/ticket/${encodeURIComponent(code)}/validate`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        // Fetch holder name
        const infoRes = await fetch(`/api/ticket/${encodeURIComponent(code)}/info`)
        const info = infoRes.ok ? await infoRes.json() : {}
        setResult({ ok: true, holderName: info.holder_name || '', code })
        setScanCount(c => c + 1)
      } else {
        setResult({ ok: false, error: json.error || 'Billet invalide', code })
      }
    } catch {
      setResult({ ok: false, error: 'Erreur réseau', code })
    }
  }

  async function startCamera() {
    setState('loading')
    setCamError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('scanning')
      scanLoop()
    } catch (e: unknown) {
      const err = e as Error
      setCamError(err.name === 'NotAllowedError' ? 'Accès caméra refusé. Autorisez la caméra dans les paramètres.' : `Caméra indisponible : ${err.message}`)
      setState('error')
    }
  }

  function scanLoop() {
    loopRef.current = requestAnimationFrame(async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) { scanLoop(); return }

      const ctx = canvas.getContext('2d')
      if (!ctx) { scanLoop(); return }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
          const barcodes = await detector.detect(canvas)
          for (const barcode of barcodes) {
            await handleDetected(barcode.rawValue)
          }
        }
      } catch {}

      if (!cooldownRef.current) scanLoop()
    })
  }

  async function handleDetected(raw: string) {
    if (cooldownRef.current) return
    // Extract ticket code: support both full URL and bare code
    let code = raw.trim().toUpperCase()
    const match = raw.match(/\/ticket\/([A-Z0-9]{4}-[A-Z0-9]{4})/i)
    if (match) code = match[1].toUpperCase()

    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) return
    if (code === lastCodeRef.current) return
    lastCodeRef.current = code

    cancelAnimationFrame(loopRef.current)
    await validateCode(code)
  }

  function resumeScan() {
    lastCodeRef.current = ''
    cooldownRef.current = false
    setResult(null)
    setState('scanning')
    scanLoop()
  }

  useEffect(() => () => stopCamera(), [stopCamera])

  const nativeSupportCheck = typeof window !== 'undefined' && !('BarcodeDetector' in window)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" style={{ color: '#f9fafb' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <Link href="/dashboard" className="text-gray-400 text-sm">← Retour</Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate" style={{ color: accentColor }}>Scanner billets</h1>
          <p className="text-xs text-gray-400 truncate">{eventName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500">Validés</p>
          <p className="text-lg font-bold" style={{ color: accentColor }}>{scanCount}</p>
        </div>
      </div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">

        {nativeSupportCheck && state !== 'idle' && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-xl p-4 text-xs text-yellow-300 text-center">
            ⚠️ Votre navigateur ne supporte pas le scan natif. Utilisez <strong>Chrome</strong> ou un navigateur Chromium pour scanner.
          </div>
        )}

        {/* Idle state */}
        {state === 'idle' && (
          <div className="text-center space-y-6 max-w-xs">
            <div className="text-6xl">📷</div>
            <div>
              <h2 className="text-lg font-bold mb-2">Scanner un billet</h2>
              <p className="text-sm text-gray-400">Activez la caméra pour scanner les QR codes des billets à l'entrée.</p>
            </div>
            <button onClick={startCamera}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-transform active:scale-95"
              style={{ background: accentColor }}>
              📷 Activer la caméra
            </button>
          </div>
        )}

        {/* Loading */}
        {state === 'loading' && (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-gray-600 rounded-full mx-auto animate-spin" style={{ borderTopColor: accentColor }} />
            <p className="text-sm text-gray-400">Activation de la caméra…</p>
          </div>
        )}

        {/* Scanning */}
        {(state === 'scanning' || state === 'result') && (
          <div className="w-full max-w-sm space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: accentColor }} />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: accentColor }} />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: accentColor }} />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: accentColor }} />
                  {/* Scan line animation */}
                  <div className="absolute left-2 right-2 h-0.5 animate-bounce opacity-80" style={{ background: accentColor, top: '50%' }} />
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-center text-sm text-gray-400">Pointez la caméra sur le QR du billet</p>
          </div>
        )}

        {/* Result overlay */}
        {state === 'result' && result && (
          <div className={`w-full max-w-sm rounded-2xl border-2 p-5 text-center space-y-3 transition-all ${
            result.ok
              ? 'bg-green-900/60 border-green-500'
              : 'bg-red-900/60 border-red-500'
          }`}>
            <p className="text-4xl">{result.ok ? '✅' : '❌'}</p>
            <div>
              <p className={`text-xl font-bold ${result.ok ? 'text-green-300' : 'text-red-300'}`}>
                {result.ok ? 'Billet valide !' : 'Billet refusé'}
              </p>
              {result.ok && result.holderName && (
                <p className="text-sm text-green-200 mt-1">{result.holderName}</p>
              )}
              {!result.ok && (
                <p className="text-sm text-red-300 mt-1">{result.error}</p>
              )}
              {result.code && (
                <p className="text-xs font-mono text-gray-400 mt-2">{result.code}</p>
              )}
            </div>
            <button onClick={resumeScan}
              className="w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
              style={{ background: result.ok ? '#16a34a' : '#dc2626' }}>
              Scanner le suivant →
            </button>
          </div>
        )}

        {/* Camera error */}
        {state === 'error' && (
          <div className="text-center space-y-4 max-w-xs">
            <p className="text-4xl">🚫</p>
            <p className="text-sm text-red-300">{camError}</p>
            <button onClick={startCamera}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: accentColor }}>
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
