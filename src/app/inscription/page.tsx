import { Suspense } from 'react'
import InscriptionContent from './InscriptionContent'

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionContent />
    </Suspense>
  )
}
