import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { FileQuestion, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Question, SchoolClass, QuestionType } from './types'
import { QUESTION_SEED, CLASS_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolQuestionBank() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items, add, update, remove } = useLocalCollection<Question>('school:questions', QUESTION_SEED)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [form, setForm] = useState({ subject: '', classId: classes[0]?.id ?? '', type: 'mcq' as QuestionType, difficulty: 'easy' as Question['difficulty'], text: '', options: '', answer: '', marks: 1 })

  const filtered = useMemo(
    () => items.filter((q) =>
      (typeFilter === 'all' || q.type === typeFilter) &&
      (difficulty === 'all' || q.difficulty === difficulty) &&
      `${q.subject} ${q.text} ${q.className}`.toLowerCase().includes(query.toLowerCase())
    ),
    [items, query, typeFilter, difficulty]
  )

  const columns: DataColumn<Question>[] = [
    { key: 'text', header: 'Question', render: (q) => <span className="font-medium">{q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text}</span> },
    { key: 'subject', header: 'Subject', render: (q) => q.subject, sortValue: (q) => q.subject },
    { key: 'className', header: 'Class', render: (q) => q.className, sortValue: (q) => q.className },
    { key: 'type', header: 'Type', render: (q) => <StatusBadge status={q.type} />, sortValue: (q) => q.type },
    { key: 'difficulty', header: 'Difficulty', render: (q) => <StatusBadge status={q.difficulty} />, sortValue: (q) => q.difficulty },
    { key: 'marks', header: 'Marks', render: (q) => q.marks, sortValue: (q) => q.marks },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ subject: '', classId: classes[0]?.id ?? '', type: 'mcq', difficulty: 'easy', text: '', options: '', answer: '', marks: 1 })
    setModalOpen(true)
  }

  function openEdit(q: Question) {
    setEditing(q)
    setForm({ subject: q.subject, classId: q.classId, type: q.type, difficulty: q.difficulty, text: q.text, options: (q.options ?? []).join('\n'), answer: q.answer, marks: q.marks })
    setModalOpen(true)
  }

  function save() {
    if (!form.text.trim()) return
    const cls = classes.find((c) => c.id === form.classId)
    const options = form.type === 'mcq' ? form.options.split('\n').map((s) => s.trim()).filter(Boolean) : undefined
    const payload = { ...form, className: cls ? `${cls.name} - ${cls.section}` : '', options, marks: Number(form.marks) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const mcqCount = items.filter((q) => q.type === 'mcq').length
  const totalMarks = items.reduce((s, q) => s + q.marks, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Questions" value={items.length} icon={<FileQuestion className="w-5 h-5" />} tone="info" />
        <KpiCard label="MCQ" value={mcqCount} icon={<FileQuestion className="w-5 h-5" />} tone="default" />
        <KpiCard label="Total marks" value={totalMarks} icon={<FileQuestion className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Question bank</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add question</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(q) => q.id}
            pageSize={10}
            exportFilename="school-questions"
            emptyIcon={<FileQuestion className="w-6 h-6" />}
            emptyTitle="No questions yet"
            emptyDescription="Add questions to build your question bank."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search questions..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter} className="w-32">
                  <option value="all">All types</option>
                  <option value="mcq">MCQ</option>
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </Select>
                <Select value={difficulty} onValueChange={setDifficulty} className="w-32">
                  <option value="all">All levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </div>
            }
            actions={(q) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(q)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(q.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit question' : 'Add question'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as QuestionType })}>
                <option value="mcq">MCQ</option>
                <option value="short">Short</option>
                <option value="long">Long</option>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as Question['difficulty'] })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
            <div><Label>Marks</Label><Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} /></div>
          </div>
          <div><Label required>Question text</Label><Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
          {form.type === 'mcq' && (
            <div><Label>Options (one per line)</Label><Textarea value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder={'Option A\nOption B\nOption C\nOption D'} /></div>
          )}
          <div><Label>Answer</Label><Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add question'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}