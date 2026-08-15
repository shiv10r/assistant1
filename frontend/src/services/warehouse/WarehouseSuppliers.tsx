import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Supplier } from './types'
import { SUPPLIER_SEED } from './seed'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, DonutChart } from '../../components/AdvancedPanel'

const emptyForm = {
  name: '', company: '', contact: '', phone: '', email: '', gstin: '',
  address: '', paymentTerms: '', status: 'active' as 'active' | 'inactive',
}

export default function WarehouseSuppliers() {
  const { items, add, update, remove } = useLocalCollection<Supplier>('warehouse:suppliers', SUPPLIER_SEED)
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return items.filter((s) => {
      const matchesQ = `${s.name} ${s.company} ${s.contact} ${s.phone} ${s.email} ${s.gstin}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesQ && matchesStatus
    })
  }, [items, query, statusFilter])

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(s: Supplier) {
    setEditing(s)
    setForm({ name: s.name, company: s.company, contact: s.contact, phone: s.phone, email: s.email, gstin: s.gstin, address: s.address, paymentTerms: s.paymentTerms, status: s.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) {
      toast({ title: 'Supplier name is required', variant: 'error' })
      return
    }
    if (editing) {
      update(editing.id, form)
      toast({ title: 'Supplier updated', description: form.name })
    } else {
      add({ id: genId(), ...form })
      toast({ title: 'Supplier added', description: form.name })
    }
    setModalOpen(false)
  }

  const columns: DataColumn<Supplier>[] = [
    {
      key: 'name', header: 'Name',
      render: (s) => (
        <div>
          <div className="font-medium">{s.name}</div>
          {s.company && <div className="text-xs text-muted">{s.company}</div>}
        </div>
      ),
      sortValue: (s) => s.name,
      csvValue: (s) => s.name,
    },
    { key: 'contact', header: 'Contact', render: (s) => s.contact || '—', sortValue: (s) => s.contact },
    { key: 'phone', header: 'Phone', render: (s) => s.phone || '—' },
    { key: 'email', header: 'Email', render: (s) => s.email || '—' },
    { key: 'gstin', header: 'GSTIN', render: (s) => <span className="font-mono text-xs">{s.gstin || '—'}</span> },
    { key: 'terms', header: 'Payment terms', render: (s) => s.paymentTerms || '—', hideOnMobile: true },
    {
      key: 'status', header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
      sortValue: (s) => s.status,
      csvValue: (s) => s.status,
    },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Supplier base mix and activity — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total suppliers', value: String(items.length), delta: `${items.filter((s) => s.status === 'active').length} active`, deltaTone: 'flat' },
            { label: 'Active', value: String(items.filter((s) => s.status === 'active').length), delta: 'engaged vendors', deltaTone: 'up' },
            { label: 'Inactive', value: String(items.filter((s) => s.status === 'inactive').length), delta: 'dormant vendors', deltaTone: 'down' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Active vs inactive</p>
              <DonutChart
                data={[
                  { label: 'Active', value: items.filter((s) => s.status === 'active').length, color: 'var(--primary)' },
                  { label: 'Inactive', value: items.filter((s) => s.status === 'inactive').length, color: '#ef4444' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Suppliers</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add supplier</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(s) => s.id}
            pageSize={10}
            exportFilename="warehouse-suppliers"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No suppliers yet"
            emptyDescription="Add a supplier to start creating purchase orders."
            actions={(s) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
            toolbar={
              <div className="flex flex-wrap gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search name, contact, GSTIN..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="w-40">
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit supplier' : 'Add supplier'} size="md">
        <div className="space-y-4">
          <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Contact person</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>GSTIN</Label><Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
            <div><Label>Payment terms</Label><Input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="e.g. Net 30" /></div>
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add supplier'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}