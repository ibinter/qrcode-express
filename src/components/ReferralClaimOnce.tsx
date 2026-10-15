'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ReferralClaimOnce() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('claim_ref') !== '1') return

    let ref = ''
    try { ref = localStorage.getItem('qre_ref') || '' } catch {}
    if (!ref) return

    fetch('/api/referral/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referral_code: ref }),
    }).then(() => {
      try { localStorage.removeItem('qre_ref') } catch {}
    })
  }, [searchParams])

  return null
}
