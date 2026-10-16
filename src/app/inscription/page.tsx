import type { Metadata } from 'next'
import { Suspense } from 'react'
import InscriptionContent from './InscriptionContent'


export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionContent />
    </Suspense>
  )
}
