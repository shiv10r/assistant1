import { useEffect, useState } from 'react'
import { api } from '../api'
import type { AppUser, UserSessionInfo } from '../api'
import { isAdmin } from '../api'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Label, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Empty } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import {
  FiUsers, FiUserPlus, FiShield, FiShieldOff, FiTrash2, FiKey, FiSearch
} from 'react-icons/fi'
import { MdVerifiedUser } from 'react-icons/md'
import { cn } from '../lib/utils'

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', accountant: 'Accountant', supervisor: 'Site Supervisor' }

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [sessions, setSessions] = useState<UserSessionInfo[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<AppUser> & { password?: string } | null>(null)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')

  const load = () => {
    api.auth.users().then(setUsers).catch(() => setUsers([]))
    api.auth.sessions().then(setSessions).catch(() => setSessions([]))
  }
  useEffect(load, [])

  const query = q.trim().toLowerCase()
  const filteredUsers = query
    ? users.filter((u) =>
        u.username.toLowerCase().includes(query) ||
        (ROLE_LABEL[u.role] || u.role).toLowerCase().includes(query))
    : users

  const save = async () => {
    if (!editing) return
    if (!editing.username?.trim()) { setErr('Username is required'); return }
    setSaving(true)
    try {
      await api.auth.saveUser(editing)
      setOpen(false)
      setEditing(null)
      load()
      toast({ title: 'User saved', description: editing.username })
    } catch (e) { setErr(String(e)); toast({ title: 'Could not save user', description: String(e), variant: 'error' }) }
    finally { setSaving(false) }
  }

  const toggle = async (u: AppUser) => {
    try {
      await api.auth.toggleUser(u.id)
      load()
      toast({ title: u.isActive ? 'User deactivated' : 'User activated', description: u.username })
    } catch (e) { toast({ title: 'Could not update user', description: String(e), variant: 'error' }) }
  }

  const remove = async (u: AppUser) => {
    if (!confirm(`Delete user "${u.username}"?`)) return
    try {
      await api.auth.deleteUser(u.id)
      load()
      toast({ title: 'User deleted', description: u.username, variant: 'error' })
    } catch (e) { toast({ title: 'Could not delete user', description: String(e), variant: 'error' }) }
  }

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="py-16">
          <Empty icon={<FiShieldOff className="w-12 h-12" />} title="Admins only" description="Only the admin role can manage staff accounts." />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Team & Roles</h1>
          <div className="muted">Create staff logins with scoped access — admin, accountant or site supervisor</div>
        </div>
        <Button onClick={() => { setEditing({ id: 0, username: '', role: 'supervisor', isActive: true, password: '' }); setErr(''); setOpen(true) }}>
          <FiUserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FiUsers className="w-5 h-5 text-primary" /> Staff accounts</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                className="pl-9 pr-3 py-2 w-56 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Search users…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <CardContent><Empty icon={<FiUsers className="w-12 h-12" />} title={q ? `No users match "${q}"` : 'No staff users'} description="Add an accountant or supervisor to share access safely." /></CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium text-text">{u.username}</p>
                      <p className="text-xs text-muted">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : u.role === 'accountant' ? 'info' : 'warning'} size="sm">
                        <FiShield className="w-3 h-3" /> {ROLE_LABEL[u.role] || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggle(u)} aria-label="Toggle active" title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <FiShieldOff className="w-4 h-4" /> : <MdVerifiedUser className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(u)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {sessions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiKey className="w-5 h-5 text-primary" /> Active sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Expires</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.token}>
                    <TableCell className="font-medium text-text">{s.username}</TableCell>
                    <TableCell className="text-muted">{ROLE_LABEL[s.role] || s.role}</TableCell>
                    <TableCell className="text-muted">{new Date(s.expiresAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); setErr('') }} title={editing?.id ? 'Edit User' : 'Add Staff User'} description="Roles control which parts of the app each login can edit.">
        <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-5">
          <div>
            <Label htmlFor="username" required>Username</Label>
            <Input id="username" value={editing?.username || ''} onChange={(e) => setEditing(p => ({ ...p!, username: e.target.value }))} placeholder="e.g. ramesh.site" autoFocus />
          </div>
          <div>
            <Label htmlFor="password" required={!editing?.id}>Password</Label>
            <Input id="password" type="password" value={editing?.password || ''} onChange={(e) => setEditing(p => ({ ...p!, password: e.target.value }))} placeholder={editing?.id ? 'Leave blank to keep current password' : 'Set a password'} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={editing?.role || 'supervisor'} onValueChange={(v) => setEditing(p => ({ ...p!, role: v }))}>
              <option value="supervisor">Site Supervisor — manage projects, attendance, materials</option>
              <option value="accountant">Accountant — manage billing, parties, cash</option>
              <option value="admin">Admin — full access + team management</option>
            </Select>
          </div>
          {err && <div className={cn('p-3 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-500')}>{err}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setErr('') }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save User'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
