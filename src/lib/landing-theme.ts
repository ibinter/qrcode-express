export type LandingTheme = 'light' | 'dark' | 'glass' | 'gradient'

export function getThemeTokens(theme: LandingTheme | undefined, accentColor: string) {
  const t = theme || 'light'
  switch (t) {
    case 'dark':
      return {
        pageBg: '#0d0f1a',
        cardBg: '#1a1d2e',
        cardBorder: '#2a2d3e',
        headerBg: `linear-gradient(135deg, #1a1d2e, #0d0f1a)`,
        textPrimary: '#f1f5f9',
        textMuted: 'rgba(255,255,255,0.55)',
        accentText: accentColor,
        isDark: true,
      }
    case 'glass':
      return {
        pageBg: undefined,
        pageGradient: `linear-gradient(160deg, #041B4D 0%, ${accentColor}44 55%, #1a0035 100%)`,
        cardBg: 'rgba(255,255,255,0.08)',
        cardBorder: 'rgba(255,255,255,0.15)',
        headerBg: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}66)`,
        textPrimary: '#ffffff',
        textMuted: 'rgba(255,255,255,0.6)',
        accentText: '#fff',
        isDark: true,
        isGlass: true,
      }
    case 'gradient':
      return {
        pageBg: undefined,
        pageGradient: `linear-gradient(160deg, ${accentColor} 0%, #041B4D 100%)`,
        cardBg: 'rgba(255,255,255,0.12)',
        cardBorder: 'rgba(255,255,255,0.2)',
        headerBg: `linear-gradient(135deg, rgba(0,0,0,0.3), transparent)`,
        textPrimary: '#ffffff',
        textMuted: 'rgba(255,255,255,0.7)',
        accentText: '#fff',
        isDark: true,
      }
    default: // light
      return {
        pageBg: '#f9fafb',
        cardBg: '#ffffff',
        cardBorder: '#e5e7eb',
        headerBg: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        textPrimary: '#041B4D',
        textMuted: '#6b7280',
        accentText: '#ffffff',
        isDark: false,
      }
  }
}
