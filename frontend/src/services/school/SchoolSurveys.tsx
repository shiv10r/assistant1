import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { ClipboardCheck, Plus, Pencil, Trash2, Search, Rocket, XCircle } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Survey } from './types'
import { SURVEY_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolSurveys() {
  const { items, add, update, remove } = useLocalCollection<Survey>('school:surveys', SURVEY_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Survey | null>(null)
  const [form, setForm] = useState({ title: '', audience: 'parents', questions: 5, status: 'draft' as Survey['status'], responses: 0 })

  const filtered = useMemo(
    () => items.filter((s) => s.title.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Survey>[] = [
    { key: 'title', header: 'Survey', render: (s) => <span className="font-medium">{s.title}</span>, sortValue: (s) => s.title },
    { key: 'audience', header: 'Audience', render: (s) => <span className="capitalize">{s.audience}</span>, sortValue: (s) => s.audience },
    { key: 'questions', header: 'Questions', render: (s) => s.questions },
    { key: 'responses', header: 'Responses', render: (s) => s.responses, sortValue: (s) => s.responses },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} />, sortValue: (s) => s.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', audience: 'parents', questions: 5, status: 'draft', responses: 0 })
    setModalOpen(true)
  }

  function openEdit(s: Survey) {
    setEditing(s)
    setForm({ title: s.title, audience: s.audience, questions: s.questions, status: s.status, responses: s.responses })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    const payload = { ...form, questions: Number(form.questions), responses: Number(form.responses) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const live = items.filter((s) => s.status === 'live').length
  const totalResponses = items.reduce((sum, s) => sum + s.responses, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Surveys" value={items.length} icon={<ClipboardCheck className="w-5 h-5" />} tone="info" />
        <KPICard label="Live" value={live} icon={<ClipboardCheck className="w-5 h-5" />} tone="success" />
        <KPICard label="Responses" value={totalResponses} icon={<ClipboardCheck className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Surveys & feedback</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add survey</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(s) => s.id}
            pageSize={10}
            exportFilename="school-surveys"
            emptyIcon={<ClipboardCheck className="w-6 h-6" />}
            emptyTitle="No surveys"
            emptyDescription="Create surveys to collect feedback."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search surveys..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(s) => (
              <div className="flex gap-1">
                {s.status === 'draft' && (
                  <Button variant="ghost" size="icon" onClick={() => update(s.id, { status: 'live' })} aria-label="Launch"><Rocket className="w-4 h-4 text-emerald-500" /></Button>
                )}
                {s.status === 'live' && (
                  <Button variant="ghost" size="icon" onClick={() => update(s.id, { status: 'closed' })} aria-label="Close"><XCircle className="w-4 h-4 text-amber-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit survey' : 'Add survey'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                <option value="parents">Parents</option>
                <option value="students">Students</option>
                <option value="staff">Staff</option>
                <option value="all">Everyone</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Questions</Label><Input type="number" value={form.questions} onChange={(e) => setForm({ ...form, questions: Number(e.target.value) })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Survey['status'] })}>
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div><Label>Responses</Label><Input type="number" value={form.responses} onChange={(e) => setForm({ ...form, responses: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add survey'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}