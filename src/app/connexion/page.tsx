'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(t('login_error'))
    } else {
      router.refresh()
      router.push('/dashboard')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <Link href="/" className="block text-center mb-6">
          <span className="text-xl font-bold text-[#041B4D]">
            QR <span className="text-[#FF6A00]">CODE</span> EXPRESS
          </span>
        </Link>
        <h1 className="text-xl font-bold text-center text-[#041B4D] mb-6">{t('login_title')}</h1>

        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 mb-5 transition-colors">
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
          {t('login_google')}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-xs text-gray-400">{t('login_or')}</span>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('login_email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('login_password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
            {loading ? t('login_loading') : t('login_btn')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          {t('login_no_account')}{' '}
          <Link href="/inscription" className="text-[#FF6A00] font-semibold hover:underline">{t('login_signup_link')}</Link>
        </p>
      </div>
    </main>
  )
}
