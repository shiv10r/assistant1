import { useEffect, useState } from 'react'
import { Loader2, BellRing, BellOff, Check } from 'lucide-react'
import { api } from '../api'
import type { AppUser } from '../api'
import { Modal, Button } from './ui'

interface RecipientPickerProps {
  open: boolean
  onClose: () => void
  onConfirm: (usernames: string[]) => void
  title?: string
  description?: string
}

const roleColor: Record<string, string> = {
  admin: 'rgba(224,92,122,.16) #E05C7A',
  accountant: 'rgba(46,139,87,.16) #2E8B57',
  supervisor: 'rgba(183,121,31,.16) #B7791F',
}

export default function RecipientPicker({
  open,
  onClose,
  onConfirm,
  title = 'Notify people',
  description = 'Pick who gets alerted — only their devices will receive the push.',
}: RecipientPickerProps) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [devices, setDevices] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setErr('')
    setSelected(new Set())
    Promise.all([api.auth.users().catch(() => [] as AppUser[]), api.pushDevices().catch(() => [])])
      .then(([u, d]) => {
        setUsers(u.filter((x) => x.isActive))
        setDevices(new Set(d.map((x) => x.username)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open])

  function toggle(username: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(username)) next.delete(username)
      else next.add(username)
      return next
    })
  }

  function confirm() {
    if (selected.size === 0) {
      setErr('Select at least one person to notify.')
      return
    }
    onConfirm([...selected])
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="md">
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
          </div>
        )}

        {!loading && (
          <>
            <div className="text-xs text-muted">
              {users.length} active user{users.length === 1 ? '' : 's'} · selected {selected.size}
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {users.length === 0 && (
                <div className="p-6 text-center text-sm text-muted">No active users found.</div>
              )}
              {users.map((u) => {
                const fg = (roleColor[u.role] ?? 'rgba(120,130,150,.16) #788296').split(' ')[1]
                const hasDevice = devices.has(u.username)
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggle(u.username)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-hover transition-colors"
                  >
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        selected.has(u.username)
                          ? 'bg-primary border-primary text-white'
                          : 'border-border bg-surface'
                      }`}
                    >
                      {selected.has(u.username) && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-text truncate">{u.username}</span>
                      <span className="block text-xs" style={{ color: fg }}>{u.role}</span>
                    </span>
                    {hasDevice ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600" title="Has a registered device">
                        <BellRing className="w-3.5 h-3.5" /> reachable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted" title="No device registered for push">
                        <BellOff className="w-3.5 h-3.5" /> no device
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={confirm} disabled={loading}>Notify selected</Button>
        </div>
      </div>
    </Modal>
  )
}
