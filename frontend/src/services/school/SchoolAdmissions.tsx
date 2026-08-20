import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Select, Modal } from '../../components/ui'
import { UserPlus, Phone, Plus, Pencil, Trash2, Search, ArrowRight } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { AdmissionLead, AdmissionStage } from './types'
import { ADMISSION_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { todayISO } from '../../lib/utils'

const STAGES: AdmissionStage[] = ['lead', 'contacted', 'visit', 'applied', 'test', 'approved', 'paid', 'enrolled']

export default function SchoolAdmissions() {
  const { items, add, update, remove } = useLocalCollection<AdmissionLead>('school:admissions', ADMISSION_SEED)
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdmissionLead | null>(null)
  const [form, setForm] = useState({ studentName: '', guardianName: '', phone: '', email: '', grade: 'Grade 5 - A', source: 'referral', stage: 'lead' as AdmissionStage, followUpDate: '', notes: '', createdAt: '' })

  const filtered = useMemo(
    () => items.filter((a) => (source === 'all' || a.source === source) && `${a.studentName} ${a.guardianName} ${a.phone}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, source]
  )

  function advance(a: AdmissionLead) {
    const i = STAGES.indexOf(a.stage)
    if (i < STAGES.length - 1) update(a.id, { stage: STAGES[i + 1] })
  }

  const columns: DataColumn<AdmissionLead>[] = [
    { key: 'studentName', header: 'Student', render: (a) => <span className="font-medium">{a.studentName}</span>, sortValue: (a) => a.studentName },
    { key: 'guardianName', header: 'Guardian', render: (a) => a.guardianName },
    { key: 'phone', header: 'Phone', render: (a) => <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted" />{a.phone}</span> },
    { key: 'grade', header: 'Grade', render: (a) => a.grade, sortValue: (a) => a.grade },
    { key: 'source', header: 'Source', render: (a) => <Badge variant="outline" size="sm">{a.source}</Badge>, sortValue: (a) => a.source },
    { key: 'stage', header: 'Stage', render: (a) => <StatusBadge status={a.stage} />, sortValue: (a) => STAGES.indexOf(a.stage) },
    { key: 'followUp', header: 'Follow-up', render: (a) => a.followUpDate ? <span className={a.followUpDate < todayISO() && a.stage !== 'enrolled' ? 'text-red-500' : ''}>{a.followUpDate.slice(0, 10)}</span> : '—', sortValue: (a) => a.followUpDate ?? '' },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ studentName: '', guardianName: '', phone: '', email: '', grade: 'Grade 5 - A', source: 'referral', stage: 'lead', followUpDate: '', notes: '', createdAt: todayISO() })
    setModalOpen(true)
  }

  function openEdit(a: AdmissionLead) {
    setEditing(a)
    setForm({ studentName: a.studentName, guardianName: a.guardianName, phone: a.phone, email: a.email ?? '', grade: a.grade, source: a.source, stage: a.stage, followUpDate: a.followUpDate ?? '', notes: a.notes ?? '', createdAt: a.createdAt })
    setModalOpen(true)
  }

  function save() {
    if (!form.studentName.trim() || !form.phone.trim()) return
    const payload = { ...form, followUpDate: form.followUpDate || undefined, notes: form.notes || undefined }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const enrolled = items.filter((a) => a.stage === 'enrolled').length
  const pendingFollowUps = items.filter((a) => a.followUpDate && a.followUpDate >= todayISO() && a.stage !== 'enrolled').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total leads" value={items.length} icon={<UserPlus className="w-5 h-5" />} tone="info" />
        <KPICard label="Enrolled" value={enrolled} icon={<UserPlus className="w-5 h-5" />} tone="success" />
        <KPICard label="Pending follow-ups" value={pendingFollowUps} icon={<UserPlus className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Admissions pipeline</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add lead</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(a) => a.id}
            pageSize={10}
            exportFilename="school-admissions"
            emptyIcon={<UserPlus className="w-6 h-6" />}
            emptyTitle="No leads yet"
            emptyDescription="Add an admission lead to start the pipeline."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search leads..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={source} onValueChange={setSource} className="w-36">
                  <option value="all">All sources</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="campaign">Campaign</option>
                </Select>
              </div>
            }
            actions={(a) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => advance(a)} aria-label="Advance stage" disabled={a.stage === 'enrolled'}><ArrowRight className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(a.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit lead' : 'Add lead'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Student name</Label><Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></div>
            <div><Label>Guardian name</Label><Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Grade</Label>
              <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
                <option value="Grade 5 - A">Grade 5 - A</option>
                <option value="Grade 6 - B">Grade 6 - B</option>
                <option value="Grade 7 - A">Grade 7 - A</option>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <option value="referral">Referral</option>
                <option value="website">Website</option>
                <option value="walk-in">Walk-in</option>
                <option value="campaign">Campaign</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as AdmissionStage })}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div><Label>Follow-up date</Label><Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></div>
          </div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add lead'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}