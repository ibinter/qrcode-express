'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Persist referral code across the email-verification flow
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      try { localStorage.setItem('qre_ref', ref.toUpperCase()) } catch {}
    }
  }, [searchParams])

  const refCode = searchParams.get('ref')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?claim_ref=1`,
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email.'
        : 'Une erreur est survenue. Réessayez.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?claim_ref=1` },
    })
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[#041B4D] mb-2">Vérifiez votre email</h2>
          <p className="text-sm text-gray-500">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.
            Cliquez dessus pour activer votre compte.
          </p>
          {refCode && (
            <p className="text-xs text-green-600 mt-3 font-semibold">
              🎁 Code parrain détecté — {refCode}. Vos crédits de bienvenue seront crédités à l&apos;activation.
            </p>
          )}
          <Link href="/connexion"
            className="mt-6 inline-block text-[#FF6A00] font-semibold text-sm hover:underline">
            Retour à la connexion →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <Link href="/" className="block text-center mb-6">
          <span className="text-xl font-bold text-[#041B4D]">
            QR <span className="text-[#FF6A00]">CODE</span> EXPRESS
          </span>
        </Link>
        <h1 className="text-xl font-bold text-center text-[#041B4D] mb-1">Créer un compte</h1>
        {refCode && (
          <p className="text-xs text-center text-green-600 font-semibold mb-4">
            🎁 Vous êtes parrainé ! Code : <strong>{refCode}</strong>
          </p>
        )}

        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 mb-5 transition-colors">
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
          Continuer avec Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-xs text-gray-400">ou par email</span>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none" />
            <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF6A00]/40 focus:outline-none" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
            {loading ? 'Création…' : 'Créer mon compte gratuit'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          En vous inscrivant, vous acceptez nos{' '}
          <Link href="/cgu" className="underline">CGU</Link>
        </p>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-[#FF6A00] font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}
