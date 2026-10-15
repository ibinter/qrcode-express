'use client'
import { useMemo } from 'react'
import { QRDesign } from '@/lib/types'

interface Props {
  design: QRDesign
  content: string
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = luminance(hexToRgb(hex1))
  const l2 = luminance(hexToRgb(hex2))
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export default function QRReadinessScore({ design, content }: Props) {
  const score = useMemo(() => {
    if (!content) return null
    let s = 100
    const issues: string[] = []

    // Contraste
    const ratio = contrastRatio(design.fgColor, design.bgColor)
    if (ratio < 4) { s -= 30; issues.push('Contraste insuffisant (min 4:1)') }
    else if (ratio < 7) { s -= 10 }

    // Logo sans correction haute
    if (design.logoUrl && design.errorCorrection !== 'H') {
      s -= 15; issues.push('Passez la correction à H avec un logo')
    }

    // Fond non blanc avec correction basse
    if (design.bgColor !== '#FFFFFF' && design.bgColor !== '#ffffff' && design.errorCorrection === 'L') {
      s -= 5; issues.push('Correction L risquée sur fond coloré')
    }

    // Densité du contenu
    if (content.length > 300) { s -= 10; issues.push('Contenu long → QR dense, agrandissez à l\'impression') }
    if (content.length > 800) { s -= 15; issues.push('Contenu très long → risque de lisibilité') }

    return { score: Math.max(0, s), issues }
  }, [design, content])

  if (!score) return null

  const color = score.score >= 80 ? 'text-green-600' : score.score >= 60 ? 'text-yellow-600' : 'text-red-600'
  const bg = score.score >= 80 ? 'bg-green-50' : score.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'

  return (
    <div className={`w-full rounded-xl p-3 ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600">Score de lisibilité</span>
        <span className={`text-lg font-extrabold ${color}`}>{score.score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${score.score >= 80 ? 'bg-green-500' : score.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score.score}%` }}
        />
      </div>
      {score.issues.length > 0 && (
        <ul className="space-y-0.5">
          {score.issues.map((i) => (
            <li key={i} className="text-xs text-gray-600">⚠️ {i}</li>
          ))}
        </ul>
      )}
      {score.score >= 80 && (
        <p className="text-xs text-green-700">✓ Excellent — testez avant impression</p>
      )}
    </div>
  )
}
