import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { ClipboardList, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ExamSchedule, MarksEntry, SchoolClass, Student } from './types'
import { EXAM_SCHEDULE_SEED, MARKS_SEED, CLASS_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolExams() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: schedules, add: addSchedule, update: updateSchedule, remove: removeSchedule } = useLocalCollection<ExamSchedule>('school:exam-schedule', EXAM_SCHEDULE_SEED)
  const { items: marks, add: addMark, update: updateMark, remove: removeMark } = useLocalCollection<MarksEntry>('school:marks', MARKS_SEED)
  const [query, setQuery] = useState('')
  const [scheduleModal, setScheduleModal] = useState(false)
  const [marksModal, setMarksModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null)
  const [editingMark, setEditingMark] = useState<MarksEntry | null>(null)
  const [scheduleForm, setScheduleForm] = useState({ name: '', classId: classes[0]?.id ?? '', date: '', time: '', subject: '', status: 'scheduled' as ExamSchedule['status'] })
  const [marksForm, setMarksForm] = useState({ examId: schedules[0]?.id ?? '', studentId: students[0]?.id ?? '', subject: '', marksObtained: 0, maxMarks: 50 })
  const [tab, setTab] = useState('schedule')

  const scheduleColumns: DataColumn<ExamSchedule>[] = [
    { key: 'name', header: 'Exam', render: (e) => <span className="font-medium">{e.name}</span>, sortValue: (e) => e.name },
    { key: 'className', header: 'Class', render: (e) => e.className, sortValue: (e) => e.className },
    { key: 'subject', header: 'Subject', render: (e) => e.subject },
    { key: 'date', header: 'Date', render: (e) => e.date.slice(0, 10), sortValue: (e) => e.date },
    { key: 'time', header: 'Time', render: (e) => e.time },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} />, sortValue: (e) => e.status },
  ]

  const marksColumns: DataColumn<MarksEntry>[] = [
    { key: 'examName', header: 'Exam', render: (m) => <span className="font-medium">{m.examName}</span>, sortValue: (m) => m.examName },
    { key: 'studentName', header: 'Student', render: (m) => m.studentName, sortValue: (m) => m.studentName },
    { key: 'subject', header: 'Subject', render: (m) => m.subject },
    { key: 'marks', header: 'Marks', render: (m) => (
      <span className={m.maxMarks && m.marksObtained / m.maxMarks >= 0.75 ? 'text-emerald-600 font-semibold' : 'text-text'}>{m.marksObtained}/{m.maxMarks}</span>
    ), sortValue: (m) => m.marksObtained },
    { key: 'pct', header: '%', render: (m) => m.maxMarks ? `${Math.round((m.marksObtained / m.maxMarks) * 100)}%` : '—', sortValue: (m) => (m.maxMarks ? m.marksObtained / m.maxMarks : 0) },
  ]

  function openAddSchedule() {
    setEditingSchedule(null)
    setScheduleForm({ name: '', classId: classes[0]?.id ?? '', date: '', time: '', subject: '', status: 'scheduled' })
    setScheduleModal(true)
  }

  function openEditSchedule(e: ExamSchedule) {
    setEditingSchedule(e)
    setScheduleForm({ name: e.name, classId: e.classId, date: e.date, time: e.time, subject: e.subject, status: e.status })
    setScheduleModal(true)
  }

  function saveSchedule() {
    if (!scheduleForm.name.trim()) return
    const cls = classes.find((c) => c.id === scheduleForm.classId)
    const payload = { ...scheduleForm, className: cls ? `${cls.name} - ${cls.section}` : '' }
    if (editingSchedule) updateSchedule(editingSchedule.id, payload)
    else addSchedule({ id: genId(), ...payload })
    setScheduleModal(false)
  }

  function openAddMark() {
    setEditingMark(null)
    setMarksForm({ examId: schedules[0]?.id ?? '', studentId: students[0]?.id ?? '', subject: '', marksObtained: 0, maxMarks: 50 })
    setMarksModal(true)
  }

  function openEditMark(m: MarksEntry) {
    setEditingMark(m)
    setMarksForm({ examId: m.examId, studentId: m.studentId, subject: m.subject, marksObtained: m.marksObtained, maxMarks: m.maxMarks })
    setMarksModal(true)
  }

  function saveMark() {
    const exam = schedules.find((e) => e.id === marksForm.examId)
    const student = students.find((s) => s.id === marksForm.studentId)
    const payload = { ...marksForm, examName: exam?.name ?? '', studentName: student?.name ?? '', marksObtained: Number(marksForm.marksObtained), maxMarks: Number(marksForm.maxMarks) }
    if (editingMark) updateMark(editingMark.id, payload)
    else addMark({ id: genId(), ...payload })
    setMarksModal(false)
  }

  const completed = schedules.filter((e) => e.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Exams" value={schedules.length} icon={<ClipboardList className="w-5 h-5" />} tone="info" />
        <KpiCard label="Completed" value={completed} icon={<ClipboardList className="w-5 h-5" />} tone="success" />
        <KpiCard label="Marks entries" value={marks.length} icon={<ClipboardList className="w-5 h-5" />} tone="default" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="marks">Marks entry</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddSchedule}><Plus className="w-4 h-4" /> Add exam</Button>
              </div>
              <DataTable
                columns={scheduleColumns}
                rows={schedules}
                rowKey={(e) => e.id}
                pageSize={10}
                exportFilename="school-exam-schedule"
                emptyIcon={<ClipboardList className="w-6 h-6" />}
                emptyTitle="No exams scheduled"
                emptyDescription="Schedule an exam for a class."
                toolbar={
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input placeholder="Search exams..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                }
                actions={(e) => (
                  <div className="flex gap-1">
                    {e.status === 'scheduled' && (
                      <Button variant="ghost" size="icon" onClick={() => updateSchedule(e.id, { status: 'completed' })} aria-label="Complete"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditSchedule(e)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeSchedule(e.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="marks" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddMark}><Plus className="w-4 h-4" /> Add marks</Button>
              </div>
              <DataTable
                columns={marksColumns}
                rows={marks}
                rowKey={(m) => m.id}
                pageSize={10}
                exportFilename="school-marks"
                emptyIcon={<ClipboardList className="w-6 h-6" />}
                emptyTitle="No marks entered"
                emptyDescription="Enter marks for an exam."
                actions={(m) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditMark(m)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeMark(m.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={scheduleModal} onClose={() => setScheduleModal(false)} title={editingSchedule ? 'Edit exam' : 'Add exam'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Exam name</Label><Input value={scheduleForm.name} onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })} /></div>
            <div>
              <Label>Class</Label>
              <Select value={scheduleForm.classId} onValueChange={(v) => setScheduleForm({ ...scheduleForm, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Subject</Label><Input value={scheduleForm.subject} onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={scheduleForm.status} onValueChange={(v) => setScheduleForm({ ...scheduleForm, status: v as ExamSchedule['status'] })}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} /></div>
            <div><Label>Time</Label><Input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setScheduleModal(false)}>Cancel</Button>
            <Button onClick={saveSchedule}>{editingSchedule ? 'Save changes' : 'Add exam'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={marksModal} onClose={() => setMarksModal(false)} title={editingMark ? 'Edit marks' : 'Add marks'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Exam</Label>
              <Select value={marksForm.examId} onValueChange={(v) => setMarksForm({ ...marksForm, examId: v })}>
                {schedules.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Student</Label>
              <Select value={marksForm.studentId} onValueChange={(v) => setMarksForm({ ...marksForm, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Subject</Label><Input value={marksForm.subject} onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Marks obtained</Label><Input type="number" value={marksForm.marksObtained} onChange={(e) => setMarksForm({ ...marksForm, marksObtained: Number(e.target.value) })} /></div>
            <div><Label>Max marks</Label><Input type="number" value={marksForm.maxMarks} onChange={(e) => setMarksForm({ ...marksForm, maxMarks: Number(e.target.value) })} /></div>
          </div>
          {marksForm.maxMarks > 0 && (
            <p className="text-xs text-muted">Percentage: {Math.round((marksForm.marksObtained / marksForm.maxMarks) * 100)}%</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMarksModal(false)}>Cancel</Button>
            <Button onClick={saveMark}>{editingMark ? 'Save changes' : 'Add marks'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}