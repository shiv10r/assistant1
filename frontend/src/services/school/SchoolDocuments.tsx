import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { FileText, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { DocumentRecord } from './types'
import { DOCUMENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolDocuments() {
  const { items, add, update, remove } = useLocalCollection<DocumentRecord>('school:documents', DOCUMENT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DocumentRecord | null>(null)
  const [form, setForm] = useState({ title: '', category: '', ownerType: 'general' as DocumentRecord['ownerType'], ownerName: '', fileName: '', expiry: '', status: 'valid' as DocumentRecord['status'] })

  const filtered = useMemo(
    () => items.filter((d) => `${d.title} ${d.category} ${d.ownerName}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<DocumentRecord>[] = [
    { key: 'title', header: 'Document', render: (d) => <span className="font-medium">{d.title}</span>, sortValue: (d) => d.title },
    { key: 'category', header: 'Category', render: (d) => d.category, sortValue: (d) => d.category },
    { key: 'ownerName', header: 'Owner', render: (d) => <span>{d.ownerName}<span className="text-xs text-muted"> ({d.ownerType})</span></span>, sortValue: (d) => d.ownerName },
    { key: 'fileName', header: 'File', render: (d) => <span className="font-mono text-xs">{d.fileName}</span>, hideOnMobile: true },
    { key: 'expiry', header: 'Expiry', render: (d) => d.expiry ? d.expiry.slice(0, 10) : <span className="text-muted text-sm">—</span> },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} />, sortValue: (d) => d.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', category: '', ownerType: 'general', ownerName: '', fileName: '', expiry: '', status: 'valid' })
    setModalOpen(true)
  }

  function openEdit(d: DocumentRecord) {
    setEditing(d)
    setForm({ title: d.title, category: d.category, ownerType: d.ownerType, ownerName: d.ownerName, fileName: d.fileName, expiry: d.expiry ?? '', status: d.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    const payload = { ...form, expiry: form.expiry || undefined }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const valid = items.filter((d) => d.status === 'valid').length
  const attention = items.filter((d) => d.status === 'expiring' || d.status === 'expired').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Documents" value={items.length} icon={<FileText className="w-5 h-5" />} tone="info" />
        <KpiCard label="Valid" value={valid} icon={<FileText className="w-5 h-5" />} tone="success" />
        <KpiCard label="Expiring/expired" value={attention} icon={<FileText className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Document registry</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add document</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(d) => d.id}
            pageSize={10}
            exportFilename="school-documents"
            emptyIcon={<FileText className="w-6 h-6" />}
            emptyTitle="No documents"
            emptyDescription="Track student and staff documents with expiry alerts."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search documents..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(d) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(d)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(d.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit document' : 'Add document'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Birth cert, ID proof..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Owner type</Label>
              <Select value={form.ownerType} onValueChange={(v) => setForm({ ...form, ownerType: v as DocumentRecord['ownerType'] })}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="general">General</option>
              </Select>
            </div>
            <div><Label>Owner name</Label><Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>File name</Label><Input value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="scan.pdf" /></div>
            <div><Label>Expiry</Label><Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DocumentRecord['status'] })}>
                <option value="valid">Valid</option>
                <option value="expiring">Expiring soon</option>
                <option value="expired">Expired</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add document'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}