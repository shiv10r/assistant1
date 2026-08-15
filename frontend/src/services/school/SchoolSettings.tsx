import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Modal } from '../../components/ui'
import { Settings, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { SchoolSetting } from './types'
import { SETTING_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'

export default function SchoolSettings() {
  const { items, add, update, remove } = useLocalCollection<SchoolSetting>('school:settings', SETTING_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolSetting | null>(null)
  const [form, setForm] = useState({ key: '', value: '' })

  const filtered = useMemo(
    () => items.filter((s) => `${s.key} ${s.value}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<SchoolSetting>[] = [
    { key: 'key', header: 'Setting', render: (s) => <span className="font-mono text-sm font-medium">{s.key}</span>, sortValue: (s) => s.key },
    { key: 'value', header: 'Value', render: (s) => s.value },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ key: '', value: '' })
    setModalOpen(true)
  }

  function openEdit(s: SchoolSetting) {
    setEditing(s)
    setForm({ key: s.key, value: s.value })
    setModalOpen(true)
  }

  function save() {
    if (!form.key.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const schoolName = items.find((s) => s.key === 'schoolName')?.value ?? '—'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Settings" value={items.length} icon={<Settings className="w-5 h-5" />} tone="info" />
        <KpiCard label="School" value={schoolName} icon={<Settings className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>School settings</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add setting</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(s) => s.id}
            pageSize={10}
            exportFilename="school-settings"
            emptyIcon={<Settings className="w-6 h-6" />}
            emptyTitle="No settings"
            emptyDescription="Configure school-wide settings."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search settings..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(s) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit setting' : 'Add setting'} size="md">
        <div className="space-y-4">
          <div><Label required>Key</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="schoolName, session, examPattern..." /></div>
          <div><Label>Value</Label><Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add setting'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}