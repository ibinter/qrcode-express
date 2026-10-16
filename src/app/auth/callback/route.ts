import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const claimRef = searchParams.get('claim_ref') === '1'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Send welcome email for new signups (user created within last 10 minutes)
      if (claimRef && sessionData?.user) {
        const createdAt = new Date(sessionData.user.created_at)
        const isNew = Date.now() - createdAt.getTime() < 10 * 60 * 1000
        if (isNew) {
          const admin = createAdminClient()
          const { data: profile } = await admin.from('profiles').select('full_name').eq('id', sessionData.user.id).single()
          sendWelcomeEmail(sessionData.user.email ?? '', profile?.full_name ?? '').catch(() => {})
        }
      }

      // If came from signup with potential referral, redirect to dashboard with flag
      // The actual claim happens client-side via localStorage → /api/referral/claim
      const redirectUrl = claimRef
        ? `${origin}/dashboard?welcome=1&claim_ref=1`
        : `${origin}${next}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`)
}
