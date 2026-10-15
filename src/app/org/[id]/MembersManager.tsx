'use client'
import { useState } from 'react'

interface Member {
  id: string
  role: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  isCurrentUser: boolean
}

interface Invitation {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
}

interface Props {
  orgId: string
  members: Member[]
  invitations: Invitation[]
  canManage: boolean
  isOwner: boolean
}

const ROLE_LABELS: Record<string, string> = {
  owner: '👑 Propriétaire', admin: '⚡ Admin', editor: '✏️ Éditeur',
  controller: '🎫 Contrôleur', reader: '👁️ Lecteur',
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-green-100 text-green-700',
  controller: 'bg-yellow-100 text-yellow-700',
  reader: 'bg-gray-100 text-gray-600',
}

export default function MembersManager({ orgId, members: initialMembers, invitations: initialInvitations, canManage, isOwner }: Props) {
  const [members, setMembers] = useState(initialMembers)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')
    try {
      const res = await fetch(`/api/org/${orgId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error || 'Erreur lors de l\'invitation')
      } else {
        setInviteSuccess(`Invitation envoyée à ${inviteEmail}`)
        setInviteEmail('')
        setInvitations((prev) => [data.invitation, ...prev])
      }
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Retirer ce membre ?')) return
    setRemovingId(memberId)
    try {
      await fetch(`/api/org/${orgId}/members/${memberId}`, { method: 'DELETE' })
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } finally {
      setRemovingId(null)
    }
  }

  async function handleRevokeInvite(invId: string) {
    setRevoking(invId)
    try {
      await fetch(`/api/org/${orgId}/invitations/${invId}`, { method: 'DELETE' })
      setInvitations((prev) => prev.filter((i) => i.id !== invId))
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Members list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#041B4D] mb-4">👥 Membres ({members.length})</h2>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#041B4D] truncate">
                  {m.full_name || 'Utilisateur'}
                  {m.isCurrentUser && <span className="text-xs text-gray-400 font-normal ml-1">(vous)</span>}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[m.role] || ROLE_COLORS.reader}`}>
                {ROLE_LABELS[m.role] || m.role}
              </span>
              {canManage && !m.isCurrentUser && m.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  disabled={removingId === m.id}
                  className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {removingId === m.id ? '…' : 'Retirer'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-[#041B4D] mb-3">⏳ Invitations en attente</h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 text-xs">
                <span className="text-base">📧</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 truncate">{inv.email}</p>
                  <p className="text-gray-400">
                    {ROLE_LABELS[inv.role] || inv.role} · expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleRevokeInvite(inv.id)}
                    disabled={revoking === inv.id}
                    className="text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {revoking === inv.id ? '…' : '✕ Révoquer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite form */}
      {canManage && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-[#041B4D] mb-4">✉️ Inviter un membre</h2>
          {inviteError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-3">{inviteError}</div>}
          {inviteSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 mb-3">{inviteSuccess}</div>}
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="adresse@email.com"
              required
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#041B4D]/30"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
            >
              <option value="admin">Admin</option>
              <option value="editor">Éditeur</option>
              <option value="controller">Contrôleur</option>
              <option value="reader">Lecteur</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#041B4D] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#041B4D]/90 transition-opacity whitespace-nowrap"
            >
              {inviting ? '…' : 'Inviter'}
            </button>
          </form>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { role: 'admin', desc: 'Gère membres et QR' },
              { role: 'editor', desc: 'Crée et édite les QR' },
              { role: 'controller', desc: 'Valide les billets' },
              { role: 'reader', desc: 'Lecture seule' },
            ].map(({ role, desc }) => (
              <div key={role} className={`text-[10px] p-2 rounded-lg text-center ${ROLE_COLORS[role]}`}>
                <p className="font-semibold">{ROLE_LABELS[role]?.replace(/^\S+\s/, '')}</p>
                <p className="opacity-70 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
