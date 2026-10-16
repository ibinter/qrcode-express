'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Track {
  title: string
  url: string
  duration?: string
}

interface AudioData {
  title: string
  artist?: string
  description?: string
  cover?: string
  logo?: string
  color?: string
  theme?: 'dark' | 'light' | 'gradient'
  playlist?: Track[]
  cta_label?: string
  cta_url?: string
}

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ data }: { data: AudioData }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const accent = data.color || '#FF6A00'
  const tracks = data.playlist || []
  const isDark = data.theme !== 'light'

  const track = tracks[currentTrack]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track?.url) return
    audio.src = track.url
    if (playing) audio.play().catch(() => setPlaying(false))
  }, [currentTrack, track?.url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }, [playing])

  function onTimeUpdate() {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    setDuration(audio.duration || 0)
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
  }

  function onEnded() {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(t => t + 1)
    } else {
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
  }

  function selectTrack(i: number) {
    setCurrentTrack(i)
    setPlaying(true)
  }

  const bg = isDark ? '#0f0f0f' : '#f8f8f8'
  const text = isDark ? '#ffffff' : '#111111'
  const muted = isDark ? '#888888' : '#666666'
  const cardBg = isDark ? '#1a1a1a' : '#ffffff'
  const border = isDark ? '#2a2a2a' : '#e5e5e5'

  return (
    <main className="min-h-screen" style={{ background: bg, color: text }}>
      <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={onEnded} onLoadedMetadata={onTimeUpdate} />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{
        background: data.theme === 'gradient'
          ? `linear-gradient(160deg, #041B4D 0%, ${accent}44 60%, #1a0a30 100%)`
          : isDark ? '#0f0f0f' : `linear-gradient(160deg, ${accent}15, ${bg})`,
        paddingTop: '3rem',
        paddingBottom: '2rem',
      }}>
        <div className="max-w-lg mx-auto px-5 flex flex-col items-center text-center gap-4">
          {/* Cover art */}
          <div className="relative w-48 h-48 rounded-3xl overflow-hidden shadow-2xl"
            style={{ boxShadow: `0 20px 60px ${accent}44` }}>
            {data.cover ? (
              <img src={data.cover} alt={data.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl"
                style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
                🎵
              </div>
            )}
            {data.logo && (
              <img src={data.logo} alt="" className="absolute bottom-2 right-2 w-8 h-8 rounded-lg object-cover shadow-lg" />
            )}
          </div>

          <div>
            <h1 className="font-extrabold text-xl leading-tight">{data.title}</h1>
            {data.artist && <p className="text-sm mt-0.5" style={{ color: accent }}>{data.artist}</p>}
            {data.description && <p className="text-xs mt-2 leading-relaxed" style={{ color: muted }}>{data.description}</p>}
          </div>
        </div>
      </div>

      {/* Player controls */}
      {tracks.length > 0 && (
        <div className="max-w-lg mx-auto px-5 -mt-4 relative z-10">
          <div className="rounded-3xl border p-5 shadow-xl" style={{ background: cardBg, borderColor: border }}>
            {/* Current track info */}
            <div className="mb-4 text-center">
              <p className="font-bold text-sm truncate">{track?.title || 'Sans titre'}</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>
                {currentTrack + 1} / {tracks.length}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="relative h-1.5 rounded-full cursor-pointer" style={{ background: border }}
                onClick={seek}>
                <div className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: accent }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md"
                  style={{ left: `${progress}%`, transform: `translate(-50%, -50%)`, background: accent }} />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: muted }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setCurrentTrack(t => Math.max(0, t - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-opacity"
                style={{ opacity: currentTrack === 0 ? 0.3 : 1 }}>
                ⏮
              </button>
              <button onClick={() => setPlaying(p => !p)}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform active:scale-95"
                style={{ background: accent, color: '#fff' }}>
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => setCurrentTrack(t => Math.min(tracks.length - 1, t + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-opacity"
                style={{ opacity: currentTrack === tracks.length - 1 ? 0.3 : 1 }}>
                ⏭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist */}
      {tracks.length > 1 && (
        <div className="max-w-lg mx-auto px-5 mt-4">
          <div className="rounded-3xl border overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <p className="text-xs font-bold uppercase tracking-widest px-5 pt-4 pb-2" style={{ color: muted }}>
              Playlist · {tracks.length} titres
            </p>
            {tracks.map((t, i) => (
              <button key={i} onClick={() => selectTrack(i)}
                className="w-full flex items-center gap-4 px-5 py-3 transition-colors text-left"
                style={{
                  background: i === currentTrack ? `${accent}18` : 'transparent',
                  borderTop: i > 0 ? `1px solid ${border}` : 'none',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{
                    background: i === currentTrack ? accent : border,
                    color: i === currentTrack ? '#fff' : muted,
                  }}>
                  {i === currentTrack && playing ? '▶' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate"
                    style={{ color: i === currentTrack ? accent : text }}>
                    {t.title}
                  </p>
                </div>
                {t.duration && <span className="text-xs shrink-0" style={{ color: muted }}>{t.duration}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {data.cta_label && data.cta_url && (
        <div className="max-w-lg mx-auto px-5 mt-4">
          <a href={data.cta_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-transform active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accent}, #041B4D)` }}>
            {data.cta_label} →
          </a>
        </div>
      )}

      <div className="text-center py-8 mt-4">
        <Link href="/" className="text-xs hover:opacity-80" style={{ color: muted }}>
          Propulsé par <span className="font-bold" style={{ color: accent }}>QR CODE EXPRESS</span>
        </Link>
      </div>
    </main>
  )
}
