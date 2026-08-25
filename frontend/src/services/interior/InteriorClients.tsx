import { useMemo, useState } from 'react'
import { BriefcaseBusiness, Mail, Pencil, Phone, Plus, Search, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLocalCollection, genId } from '../../lib/localStore'
import { DataTable, type DataColumn } from '../../platform/tables'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, KPICard, Label, Modal, Select } from '../../platform/ui'
import { CLIENT_SEED, PROJECT_SEED } from './seed'
import type { InteriorClient, InteriorProject } from './types'

const emptyClient = { name: '', email: '', phone: '', address: '', status: 'lead' as InteriorClient['status'] }

export default function InteriorClients() {
  const navigate = useNavigate()
  const { items, add, update, remove } = useLocalCollection<InteriorClient>('interior:clients', CLIENT_SEED)
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<InteriorClient | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyClient)

  const filtered = useMemo(
    () => items.filter((client) => `${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  )
  const activeProjectsFor = (client: InteriorClient) => projects.filter((project) =>
    (project.clientId === client.id || (!project.clientId && project.clientName === client.name)) && project.status === 'active',
  )
  const columns: DataColumn<InteriorClient>[] = [
    { key: 'name', header: 'Client', render: (client) => <div><p className="font-medium text-text">{client.name}</p><p className="mt-0.5 text-xs text-muted">{client.address || 'Address not provided'}</p></div>, sortValue: (client) => client.name },
    { key: 'contact', header: 'Contact', render: (client) => <div className="space-y-1 text-xs text-muted"><p className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email || 'No email'}</p><p className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone || 'No phone'}</p></div> },
    { key: 'projects', header: 'Active projects', render: (client) => activeProjectsFor(client).length, sortValue: (client) => activeProjectsFor(client).length },
    { key: 'status', header: 'Status', render: (client) => <Badge variant={client.status === 'active' ? 'success' : client.status === 'lead' ? 'warning' : 'outline'}>{client.status}</Badge>, sortValue: (client) => client.status },
  ]

  function openCreate() {
    setEditing(null)
    setForm(emptyClient)
    setOpen(true)
  }

  function openEdit(client: InteriorClient) {
    setEditing(client)
    setForm({ name: client.name, email: client.email, phone: client.phone, address: client.address, status: client.status })
    setOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim() }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), createdAt: new Date().toISOString(), ...payload })
    setOpen(false)
  }

  function deleteClient(client: InteriorClient) {
    if (projects.some((project) => project.clientId === client.id || (!project.clientId && project.clientName === client.name))) {
      window.alert('Reassign this client\'s projects before deleting the client.')
      return
    }
    if (window.confirm(`Delete ${client.name}?`)) remove(client.id)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard label="Clients" value={items.length} icon={<Users className="h-5 w-5" />} tone="info" />
        <KPICard label="Active clients" value={items.filter((client) => client.status === 'active').length} icon={<BriefcaseBusiness className="h-5 w-5" />} tone="success" />
        <KPICard label="Leads" value={items.filter((client) => client.status === 'lead').length} icon={<Users className="h-5 w-5" />} tone="warning" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4"><CardTitle>Client registry</CardTitle><Button onClick={openCreate}><Plus className="h-4 w-4" /> Add client</Button></CardHeader>
        <CardContent>
          <DataTable columns={columns} rows={filtered} rowKey={(client) => client.id} pageSize={10} exportFilename="interior-clients" emptyIcon={<Users className="h-6 w-6" />} emptyTitle="No clients" emptyDescription="Add a client before creating their first project." toolbar={<div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Search clients..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>} actions={(client) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => navigate(`/interior/projects?client=${client.id}&new=1`)}>New project</Button><Button variant="ghost" size="icon" onClick={() => openEdit(client)} aria-label="Edit client"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteClient(client)} aria-label="Delete client"><Trash2 className="h-4 w-4" /></Button></div>} />
        </CardContent>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit client' : 'Add client'} size="md">
        <div className="space-y-4">
          <div><Label required>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><Label>Email</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div><div><Label>Phone</Label><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div></div>
          <div><Label>Address</Label><Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
          <div><Label>Status</Label><Select value={form.status} onValueChange={(status) => setForm({ ...form, status: status as InteriorClient['status'] })}><option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.name.trim()}>Save client</Button></div>
        </div>
      </Modal>
    </div>
  )
}
