import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Boxes, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { AssetRecord } from './types'
import { ASSET_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { money } from '../../components/ui'

export default function SchoolAssets() {
  const { items, add, update, remove } = useLocalCollection<AssetRecord>('school:assets', ASSET_SEED)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AssetRecord | null>(null)
  const [form, setForm] = useState({ name: '', category: '', tag: '', purchaseDate: '', cost: 0, location: '', status: 'active' as AssetRecord['status'] })

  const categories = useMemo(() => [...new Set(items.map((a) => a.category).filter(Boolean))], [items])

  const filtered = useMemo(
    () => items.filter((a) => (categoryFilter === 'all' || a.category === categoryFilter) && `${a.name} ${a.tag} ${a.location}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, categoryFilter]
  )

  const columns: DataColumn<AssetRecord>[] = [
    { key: 'name', header: 'Asset', render: (a) => <span className="font-medium">{a.name}</span>, sortValue: (a) => a.name },
    { key: 'category', header: 'Category', render: (a) => a.category, sortValue: (a) => a.category },
    { key: 'tag', header: 'Tag', render: (a) => <span className="font-mono text-xs">{a.tag}</span> },
    { key: 'cost', header: 'Cost', render: (a) => money(a.cost), sortValue: (a) => a.cost },
    { key: 'location', header: 'Location', render: (a) => a.location, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} />, sortValue: (a) => a.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', category: '', tag: '', purchaseDate: '', cost: 0, location: '', status: 'active' })
    setModalOpen(true)
  }

  function openEdit(a: AssetRecord) {
    setEditing(a)
    setForm({ name: a.name, category: a.category, tag: a.tag, purchaseDate: a.purchaseDate, cost: a.cost, location: a.location, status: a.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { ...form, cost: Number(form.cost) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const totalValue = items.filter((a) => a.status !== 'retired').reduce((s, a) => s + a.cost, 0)
  const maintenance = items.filter((a) => a.status === 'maintenance').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Assets" value={items.length} icon={<Boxes className="w-5 h-5" />} tone="info" />
        <KPICard label="Asset value" value={money(totalValue)} icon={<Boxes className="w-5 h-5" />} tone="success" />
        <KPICard label="In maintenance" value={maintenance} icon={<Boxes className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Assets & inventory</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add asset</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(a) => a.id}
            pageSize={10}
            exportFilename="school-assets"
            emptyIcon={<Boxes className="w-6 h-6" />}
            emptyTitle="No assets"
            emptyDescription="Track school assets and their condition."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search assets..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter} className="w-40">
                  <option value="all">All categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            }
            actions={(a) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(a.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit asset' : 'Add asset'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Asset name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Tag</Label><Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="AST-002" /></div>
            <div><Label>Cost</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Purchase date</Label><Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AssetRecord['status'] })}>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add asset'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}