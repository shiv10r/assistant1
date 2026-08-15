import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Trophy, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ResultRecord, Student } from './types'
import { RESULT_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'

function gradeOf(pct: number) {
  if (pct >= 90) return { grade: 'A+', tone: 'success' as const }
  if (pct >= 75) return { grade: 'A', tone: 'info' as const }
  if (pct >= 60) return { grade: 'B', tone: 'default' as const }
  if (pct >= 40) return { grade: 'C', tone: 'warning' as const }
  return { grade: 'D', tone: 'danger' as const }
}

export default function SchoolResults() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, add, update, remove } = useLocalCollection<ResultRecord>('school:results', RESULT_SEED)
  const [query, setQuery] = useState('')
  const [examFilter, setExamFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ResultRecord | null>(null)
  const [form, setForm] = useState({ examName: '', studentId: students[0]?.id ?? '', className: '', total: 0, maxTotal: 100 })

  const filtered = useMemo(
    () => items.filter((r) => (examFilter === 'all' || r.examName === examFilter) && `${r.studentName} ${r.examName} ${r.className}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, examFilter]
  )

  const columns: DataColumn<ResultRecord>[] = [
    { key: 'studentName', header: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span>, sortValue: (r) => r.studentName },
    { key: 'examName', header: 'Exam', render: (r) => r.examName, sortValue: (r) => r.examName },
    { key: 'className', header: 'Class', render: (r) => r.className, sortValue: (r) => r.className },
    { key: 'total', header: 'Total', render: (r) => `${r.total}/${r.maxTotal}`, sortValue: (r) => r.percentage },
    { key: 'percentage', header: 'Percentage', render: (r) => <span className="font-semibold">{r.percentage}%</span>, sortValue: (r) => r.percentage },
    { key: 'grade', header: 'Grade', render: (r) => <Badge variant={gradeOf(r.percentage).tone} size="sm">{gradeOf(r.percentage).grade}</Badge>, sortValue: (r) => r.percentage },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ examName: '', studentId: students[0]?.id ?? '', className: '', total: 0, maxTotal: 100 })
    setModalOpen(true)
  }

  function openEdit(r: ResultRecord) {
    setEditing(r)
    setForm({ examName: r.examName, studentId: r.studentId, className: r.className, total: r.total, maxTotal: r.maxTotal })
    setModalOpen(true)
  }

  function save() {
    if (!form.examName.trim()) return
    const student = students.find((s) => s.id === form.studentId)
    const total = Number(form.total)
    const maxTotal = Number(form.maxTotal) || 100
    const percentage = maxTotal ? Math.round((total / maxTotal) * 100) : 0
    const payload = { ...form, examId: editing?.examId ?? genId(), total, maxTotal, percentage, studentName: student?.name ?? '', className: student?.className ?? '', grade: gradeOf(percentage).grade }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const avgPct = items.length ? Math.round(items.reduce((s, r) => s + r.percentage, 0) / items.length) : 0
  const distinctions = items.filter((r) => r.percentage >= 75).length
  const exams = [...new Set(items.map((r) => r.examName))]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Results" value={items.length} icon={<Trophy className="w-5 h-5" />} tone="info" />
        <KpiCard label="Avg percentage" value={`${avgPct}%`} icon={<Trophy className="w-5 h-5" />} tone="success" />
        <KpiCard label="Distinctions" value={distinctions} icon={<Trophy className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Results & report cards</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add result</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(r) => r.id}
            pageSize={10}
            exportFilename="school-results"
            emptyIcon={<Trophy className="w-6 h-6" />}
            emptyTitle="No results yet"
            emptyDescription="Add results to generate report cards."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search results..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={examFilter} onValueChange={setExamFilter} className="w-40">
                  <option value="all">All exams</option>
                  {exams.map((e) => <option key={e} value={e}>{e}</option>)}
                </Select>
              </div>
            }
            actions={(r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit result' : 'Add result'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Exam name</Label><Input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} /></div>
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Total obtained</Label><Input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} /></div>
            <div><Label>Max total</Label><Input type="number" value={form.maxTotal} onChange={(e) => setForm({ ...form, maxTotal: Number(e.target.value) })} /></div>
          </div>
          {form.maxTotal > 0 && (
            <p className="text-xs text-muted">Percentage: {Math.round((Number(form.total) / Number(form.maxTotal)) * 100)}%</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add result'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}