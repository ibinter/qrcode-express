'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  fullName: string
  email: string
}

export default function ProfileActions({ fullName, email }: Props) {
  const router = useRouter()
  const [name, setName] = useState(fullName)
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function saveName() {
    if (!name.trim()) return
    setSavingName(true)
    setNameMsg('')
    try {
      const res = await fetch('/api/profil/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim() }),
      })
      if (res.ok) {
        setNameMsg('Nom mis à jour !')
        setEditingName(false)
        router.refresh()
      } else {
        setNameMsg('Erreur lors de la mise à jour')
      }
    } catch {
      setNameMsg('Erreur réseau')
    } finally {
      setSavingName(false)
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== email) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/profil/delete-account', { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
      } else {
        const data = await res.json().catch(() => ({}))
        setDeleteError(data.error ?? 'Erreur lors de la suppression')
        setDeleting(false)
      }
    } catch {
      setDeleteError('Erreur réseau')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Edit name */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-3">Informations personnelles</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Nom complet</label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6A00] transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  autoFocus
                  maxLength={80}
                />
                <button
                  onClick={saveName}
                  disabled={savingName || !name.trim()}
                  className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {savingName ? '...' : 'Sauver'}
                </button>
                <button
                  onClick={() => { setEditingName(false); setName(fullName) }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#041B4D] font-semibold">{name || 'Non renseigné'}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs text-[#FF6A00] font-semibold hover:underline"
                >
                  Modifier
                </button>
              </div>
            )}
            {nameMsg && (
              <p className={`text-xs mt-1 ${nameMsg.startsWith('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                {nameMsg}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Email</label>
            <span className="text-sm text-[#041B4D] font-semibold">{email}</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-red-700 mb-1">Zone dangereuse</h2>
        <p className="text-xs text-gray-500 mb-3">La suppression de votre compte est irréversible. Toutes vos données seront effacées.</p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-xs font-semibold text-red-600 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition-colors"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Pour confirmer, saisissez votre email : <strong>{email}</strong>
            </p>
            <input
              type="email"
              className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
              placeholder={email}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleteConfirm !== email || deleting}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {deleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
