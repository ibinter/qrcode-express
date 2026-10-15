export const instant = false

export default function PaySuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center space-y-4">
        <p className="text-5xl">✅</p>
        <h1 className="text-xl font-bold text-[#041B4D]">Paiement confirmé !</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Votre paiement a bien été reçu. Vous recevrez une confirmation par SMS ou WhatsApp.
        </p>
        <p className="text-xs text-gray-400">
          Vous pouvez fermer cette page.
        </p>
      </div>
    </main>
  )
}
