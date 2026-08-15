import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Customer } from './types'
import { CUSTOMER_SEED } from './seed'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, DonutChart } from '../../components/AdvancedPanel'

const emptyForm = {
  name: '', company: '', gstin: '', phone: '', email: '',
  billingAddress: '', shippingAddress: '', status: 'active' as 'active' | 'inactive',
}

export default function WarehouseCustomers() {
  const { items, add, update, remove } = useLocalCollection<Customer>('warehouse:customers', CUSTOMER_SEED)
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return items.filter((c) => {
      const matchesQ = `${c.name} ${c.company} ${c.phone} ${c.email} ${c.gstin}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesQ && matchesStatus
    })
  }, [items, query, statusFilter])

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(c: Customer) {
    setEditing(c)
    setForm({ name: c.name, company: c.company, gstin: c.gstin, phone: c.phone, email: c.email, billingAddress: c.billingAddress, shippingAddress: c.shippingAddress, status: c.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) {
      toast({ title: 'Customer name is required', variant: 'error' })
      return
    }
    if (editing) {
      update(editing.id, form)
      toast({ title: 'Customer updated', description: form.name })
    } else {
      add({ id: genId(), ...form })
      toast({ title: 'Customer added', description: form.name })
    }
    setModalOpen(false)
  }

  const columns: DataColumn<Customer>[] = [
    {
      key: 'name', header: 'Name',
      render: (c) => (
        <div>
          <div className="font-medium">{c.name}</div>
          {c.company && <div className="text-xs text-muted">{c.company}</div>}
        </div>
      ),
      sortValue: (c) => c.name,
      csvValue: (c) => c.name,
    },
    { key: 'gstin', header: 'GSTIN', render: (c) => <span className="font-mono text-xs">{c.gstin || '—'}</span> },
    { key: 'phone', header: 'Phone', render: (c) => c.phone || '—' },
    { key: 'email', header: 'Email', render: (c) => c.email || '—' },
    { key: 'shipping', header: 'Shipping address', render: (c) => <span className="text-xs">{c.shippingAddress || '—'}</span>, hideOnMobile: true },
    {
      key: 'status', header: 'Status',
      render: (c) => <StatusBadge status={c.status} />,
      sortValue: (c) => c.status,
      csvValue: (c) => c.status,
    },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Customer base mix and activity — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total customers', value: String(items.length), delta: `${items.filter((c) => c.status === 'active').length} active`, deltaTone: 'flat' },
            { label: 'Active', value: String(items.filter((c) => c.status === 'active').length), delta: 'engaged accounts', deltaTone: 'up' },
            { label: 'Inactive', value: String(items.filter((c) => c.status === 'inactive').length), delta: 'dormant accounts', deltaTone: 'down' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Active vs inactive</p>
              <DonutChart
                data={[
                  { label: 'Active', value: items.filter((c) => c.status === 'active').length, color: 'var(--primary)' },
                  { label: 'Inactive', value: items.filter((c) => c.status === 'inactive').length, color: '#ef4444' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Customers</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add customer</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id}
            pageSize={10}
            exportFilename="warehouse-customers"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No customers yet"
            emptyDescription="Add a customer to start creating sales orders."
            actions={(c) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
            toolbar={
              <div className="flex flex-wrap gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search name, company, GSTIN..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit customer' : 'Add customer'} size="md">
        <div className="space-y-4">
          <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>GSTIN</Label><Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div>
            <Label>Billing address</Label>
            <Input value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} />
          </div>
          <div>
            <Label>Shipping address</Label>
            <Input value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
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
            <Button onClick={save}>{editing ? 'Save changes' : 'Add customer'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}