import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { Monitor, Plus, Pencil, Trash2, Rocket, CircleStop } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { OnlineExam, TestAttempt, Student, SchoolClass } from './types'
import { ONLINE_EXAM_SEED, ATTEMPT_SEED, STUDENT_SEED, CLASS_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolOnlineExams() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: exams, add: addExam, update: updateExam, remove: removeExam } = useLocalCollection<OnlineExam>('school:online-exams', ONLINE_EXAM_SEED)
  const { items: attempts, add: addAttempt, update: updateAttempt, remove: removeAttempt } = useLocalCollection<TestAttempt>('school:attempts', ATTEMPT_SEED)
  const [examModal, setExamModal] = useState(false)
  const [attemptModal, setAttemptModal] = useState(false)
  const [editingExam, setEditingExam] = useState<OnlineExam | null>(null)
  const [editingAttempt, setEditingAttempt] = useState<TestAttempt | null>(null)
  const [examForm, setExamForm] = useState({ name: '', subject: '', classId: classes[0]?.id ?? '', durationMin: 30, totalMarks: 10, questionIds: '', status: 'draft' as OnlineExam['status'], scheduledAt: '' })
  const [attemptForm, setAttemptForm] = useState({ examId: exams[0]?.id ?? '', studentId: students[0]?.id ?? '', score: 0 })
  const [tab, setTab] = useState('exams')

  const examColumns: DataColumn<OnlineExam>[] = [
    { key: 'name', header: 'Exam', render: (e) => <span className="font-medium">{e.name}</span>, sortValue: (e) => e.name },
    { key: 'subject', header: 'Subject', render: (e) => e.subject },
    { key: 'className', header: 'Class', render: (e) => e.className, sortValue: (e) => e.className },
    { key: 'duration', header: 'Duration', render: (e) => `${e.durationMin} min` },
    { key: 'questions', header: 'Questions', render: (e) => e.questionIds.length },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} />, sortValue: (e) => e.status },
  ]

  const attemptColumns: DataColumn<TestAttempt>[] = [
    { key: 'studentName', header: 'Student', render: (a) => <span className="font-medium">{a.studentName}</span>, sortValue: (a) => a.studentName },
    { key: 'examName', header: 'Exam', render: (a) => a.examName, sortValue: (a) => a.examName },
    { key: 'score', header: 'Score', render: (a) => <span className={a.totalMarks && a.score / a.totalMarks >= 0.6 ? 'text-emerald-600 font-semibold' : 'text-text'}>{a.score}/{a.totalMarks}</span>, sortValue: (a) => a.score },
    { key: 'pct', header: '%', render: (a) => a.totalMarks ? `${Math.round((a.score / a.totalMarks) * 100)}%` : '—', sortValue: (a) => (a.totalMarks ? a.score / a.totalMarks : 0) },
    { key: 'submittedAt', header: 'Submitted', render: (a) => a.submittedAt.slice(0, 10) },
  ]

  function openAddExam() {
    setEditingExam(null)
    setExamForm({ name: '', subject: '', classId: classes[0]?.id ?? '', durationMin: 30, totalMarks: 10, questionIds: '', status: 'draft', scheduledAt: '' })
    setExamModal(true)
  }

  function openEditExam(e: OnlineExam) {
    setEditingExam(e)
    setExamForm({ name: e.name, subject: e.subject, classId: e.classId, durationMin: e.durationMin, totalMarks: e.totalMarks, questionIds: e.questionIds.join('\n'), status: e.status, scheduledAt: e.scheduledAt ?? '' })
    setExamModal(true)
  }

  function saveExam() {
    if (!examForm.name.trim()) return
    const cls = classes.find((c) => c.id === examForm.classId)
    const questionIds = examForm.questionIds.split('\n').map((s) => s.trim()).filter(Boolean)
    const payload = { ...examForm, className: cls ? `${cls.name} - ${cls.section}` : '', questionIds, durationMin: Number(examForm.durationMin), totalMarks: Number(examForm.totalMarks), scheduledAt: examForm.scheduledAt || undefined }
    if (editingExam) updateExam(editingExam.id, payload)
    else addExam({ id: genId(), ...payload })
    setExamModal(false)
  }

  function openAddAttempt() {
    setEditingAttempt(null)
    setAttemptForm({ examId: exams[0]?.id ?? '', studentId: students[0]?.id ?? '', score: 0 })
    setAttemptModal(true)
  }

  function openEditAttempt(a: TestAttempt) {
    setEditingAttempt(a)
    setAttemptForm({ examId: a.examId, studentId: a.studentId, score: a.score })
    setAttemptModal(true)
  }

  function saveAttempt() {
    const exam = exams.find((e) => e.id === attemptForm.examId)
    const student = students.find((s) => s.id === attemptForm.studentId)
    const payload = { ...attemptForm, examName: exam?.name ?? '', studentName: student?.name ?? '', totalMarks: exam?.totalMarks ?? 0, score: Number(attemptForm.score), submittedAt: new Date().toISOString().slice(0, 10) }
    if (editingAttempt) updateAttempt(editingAttempt.id, payload)
    else addAttempt({ id: genId(), ...payload })
    setAttemptModal(false)
  }

  const live = exams.filter((e) => e.status === 'live').length
  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.totalMarks ? a.score / a.totalMarks : 0), 0) / attempts.length * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Online exams" value={exams.length} icon={<Monitor className="w-5 h-5" />} tone="info" />
        <KPICard label="Live now" value={live} icon={<Monitor className="w-5 h-5" />} tone="success" />
        <KPICard label="Attempts" value={attempts.length} icon={<Monitor className="w-5 h-5" />} tone="default" />
        <KPICard label="Avg score" value={`${avgScore}%`} icon={<Monitor className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="attempts">Attempts</TabsTrigger>
            </TabsList>
            <TabsContent value="exams" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddExam}><Plus className="w-4 h-4" /> Add exam</Button>
              </div>
              <DataTable
                columns={examColumns}
                rows={exams}
                rowKey={(e) => e.id}
                pageSize={10}
                exportFilename="school-online-exams"
                emptyIcon={<Monitor className="w-6 h-6" />}
                emptyTitle="No online exams"
                emptyDescription="Create an online exam from your question bank."
                actions={(e) => (
                  <div className="flex gap-1">
                    {e.status === 'draft' && <Button variant="ghost" size="icon" onClick={() => updateExam(e.id, { status: 'live' })} aria-label="Launch"><Rocket className="w-4 h-4 text-emerald-500" /></Button>}
                    {e.status === 'live' && <Button variant="ghost" size="icon" onClick={() => updateExam(e.id, { status: 'closed' })} aria-label="Close"><CircleStop className="w-4 h-4 text-amber-500" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => openEditExam(e)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeExam(e.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="attempts" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddAttempt}><Plus className="w-4 h-4" /> Record attempt</Button>
              </div>
              <DataTable
                columns={attemptColumns}
                rows={attempts}
                rowKey={(a) => a.id}
                pageSize={10}
                exportFilename="school-attempts"
                emptyIcon={<Monitor className="w-6 h-6" />}
                emptyTitle="No attempts yet"
                emptyDescription="Record a student's test attempt."
                actions={(a) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditAttempt(a)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeAttempt(a.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={examModal} onClose={() => setExamModal(false)} title={editingExam ? 'Edit exam' : 'Add exam'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Exam name</Label><Input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} /></div>
            <div><Label>Subject</Label><Input value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={examForm.classId} onValueChange={(v) => setExamForm({ ...examForm, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
            <div><Label>Duration (min)</Label><Input type="number" value={examForm.durationMin} onChange={(e) => setExamForm({ ...examForm, durationMin: Number(e.target.value) })} /></div>
            <div><Label>Total marks</Label><Input type="number" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })} /></div>
          </div>
          <div>
            <Label>Question IDs (one per line)</Label>
            <Textarea value={examForm.questionIds} onChange={(e) => setExamForm({ ...examForm, questionIds: e.target.value })} placeholder={'q-1\nq-2'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={examForm.status} onValueChange={(v) => setExamForm({ ...examForm, status: v as OnlineExam['status'] })}>
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div><Label>Scheduled at</Label><Input type="date" value={examForm.scheduledAt} onChange={(e) => setExamForm({ ...examForm, scheduledAt: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setExamModal(false)}>Cancel</Button>
            <Button onClick={saveExam}>{editingExam ? 'Save changes' : 'Add exam'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={attemptModal} onClose={() => setAttemptModal(false)} title={editingAttempt ? 'Edit attempt' : 'Record attempt'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Exam</Label>
              <Select value={attemptForm.examId} onValueChange={(v) => setAttemptForm({ ...attemptForm, examId: v })}>
                {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Student</Label>
              <Select value={attemptForm.studentId} onValueChange={(v) => setAttemptForm({ ...attemptForm, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Score</Label><Input type="number" value={attemptForm.score} onChange={(e) => setAttemptForm({ ...attemptForm, score: Number(e.target.value) })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAttemptModal(false)}>Cancel</Button>
            <Button onClick={saveAttempt}>{editingAttempt ? 'Save changes' : 'Record attempt'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}