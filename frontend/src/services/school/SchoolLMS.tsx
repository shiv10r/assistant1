import { useMemo, useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Course, Lesson, SchoolClass } from './types'
import { COURSE_SEED, LESSON_SEED, CLASS_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolLMS() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items: courses, add: addCourse, update: updateCourse, remove: removeCourse } = useLocalCollection<Course>('school:courses', COURSE_SEED)
  const { items: lessons, add: addLesson, update: updateLesson, remove: removeLesson } = useLocalCollection<Lesson>('school:lessons', LESSON_SEED)
  const [query, setQuery] = useState('')
  const [courseModal, setCourseModal] = useState(false)
  const [lessonModal, setLessonModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [courseForm, setCourseForm] = useState({ name: '', subject: '', classId: classes[0]?.id ?? '', description: '', status: 'draft' as Course['status'], createdAt: '' })
  const [lessonForm, setLessonForm] = useState({ courseId: courses[0]?.id ?? '', title: '', contentType: 'video' as Lesson['contentType'], content: '', durationMin: '', order: 1 })
  const [tab, setTab] = useState('courses')

  const filteredCourses = useMemo(
    () => courses.filter((c) => `${c.name} ${c.subject} ${c.className}`.toLowerCase().includes(query.toLowerCase())),
    [courses, query]
  )

  const courseColumns: DataColumn<Course>[] = [
    { key: 'name', header: 'Course', render: (c) => <span className="font-medium">{c.name}</span>, sortValue: (c) => c.name },
    { key: 'subject', header: 'Subject', render: (c) => c.subject },
    { key: 'className', header: 'Class', render: (c) => c.className, sortValue: (c) => c.className },
    { key: 'lessons', header: 'Lessons', render: (c) => lessons.filter((l) => l.courseId === c.id).length, sortValue: (c) => lessons.filter((l) => l.courseId === c.id).length },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ]

  const lessonColumns: DataColumn<Lesson>[] = [
    { key: 'order', header: '#', render: (l) => <span className="text-muted">{l.order}</span>, sortValue: (l) => l.order },
    { key: 'title', header: 'Lesson', render: (l) => <span className="font-medium">{l.title}</span>, sortValue: (l) => l.title },
    { key: 'course', header: 'Course', render: (l) => courses.find((c) => c.id === l.courseId)?.name ?? '—' },
    { key: 'contentType', header: 'Type', render: (l) => <StatusBadge status={l.contentType} /> },
    { key: 'duration', header: 'Duration', render: (l) => l.durationMin ? `${l.durationMin} min` : '—' },
  ]

  function openAddCourse() {
    setEditingCourse(null)
    setCourseForm({ name: '', subject: '', classId: classes[0]?.id ?? '', description: '', status: 'draft', createdAt: new Date().toISOString().slice(0, 10) })
    setCourseModal(true)
  }

  function openEditCourse(c: Course) {
    setEditingCourse(c)
    setCourseForm({ name: c.name, subject: c.subject, classId: c.classId, description: c.description ?? '', status: c.status, createdAt: c.createdAt })
    setCourseModal(true)
  }

  function saveCourse() {
    if (!courseForm.name.trim()) return
    const cls = classes.find((c) => c.id === courseForm.classId)
    const payload = { ...courseForm, className: cls ? `${cls.name} - ${cls.section}` : '', description: courseForm.description || undefined }
    if (editingCourse) updateCourse(editingCourse.id, payload)
    else addCourse({ id: genId(), ...payload })
    setCourseModal(false)
  }

  function openAddLesson() {
    setEditingLesson(null)
    setLessonForm({ courseId: courses[0]?.id ?? '', title: '', contentType: 'video', content: '', durationMin: '', order: lessons.length + 1 })
    setLessonModal(true)
  }

  function openEditLesson(l: Lesson) {
    setEditingLesson(l)
    setLessonForm({ courseId: l.courseId, title: l.title, contentType: l.contentType, content: l.content, durationMin: l.durationMin ? String(l.durationMin) : '', order: l.order })
    setLessonModal(true)
  }

  function saveLesson() {
    if (!lessonForm.title.trim()) return
    const payload = { ...lessonForm, durationMin: lessonForm.durationMin ? Number(lessonForm.durationMin) : undefined, order: Number(lessonForm.order) }
    if (editingLesson) updateLesson(editingLesson.id, payload)
    else addLesson({ id: genId(), ...payload })
    setLessonModal(false)
  }

  const publishedCourses = courses.filter((c) => c.status === 'published').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Courses" value={courses.length} icon={<BookOpen className="w-5 h-5" />} tone="info" />
        <KpiCard label="Published" value={publishedCourses} icon={<BookOpen className="w-5 h-5" />} tone="success" />
        <KpiCard label="Lessons" value={lessons.length} icon={<BookOpen className="w-5 h-5" />} tone="default" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
            </TabsList>
            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddCourse}><Plus className="w-4 h-4" /> Add course</Button>
              </div>
              <DataTable
                columns={courseColumns}
                rows={filteredCourses}
                rowKey={(c) => c.id}
                pageSize={10}
                exportFilename="school-courses"
                emptyIcon={<BookOpen className="w-6 h-6" />}
                emptyTitle="No courses yet"
                emptyDescription="Create a course to start building your LMS."
                toolbar={
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input placeholder="Search courses..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                }
                actions={(c) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditCourse(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeCourse(c.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="lessons" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddLesson}><Plus className="w-4 h-4" /> Add lesson</Button>
              </div>
              <DataTable
                columns={lessonColumns}
                rows={lessons}
                rowKey={(l) => l.id}
                pageSize={10}
                exportFilename="school-lessons"
                emptyIcon={<BookOpen className="w-6 h-6" />}
                emptyTitle="No lessons yet"
                emptyDescription="Add lessons under a course."
                actions={(l) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditLesson(l)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeLesson(l.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={courseModal} onClose={() => setCourseModal(false)} title={editingCourse ? 'Edit course' : 'Add course'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Course name</Label><Input value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} /></div>
            <div><Label>Subject</Label><Input value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={courseForm.classId} onValueChange={(v) => setCourseForm({ ...courseForm, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={courseForm.status} onValueChange={(v) => setCourseForm({ ...courseForm, status: v as Course['status'] })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCourseModal(false)}>Cancel</Button>
            <Button onClick={saveCourse}>{editingCourse ? 'Save changes' : 'Add course'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={lessonModal} onClose={() => setLessonModal(false)} title={editingLesson ? 'Edit lesson' : 'Add lesson'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={lessonForm.courseId} onValueChange={(v) => setLessonForm({ ...lessonForm, courseId: v })}>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div><Label>Order</Label><Input type="number" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })} /></div>
          </div>
          <div><Label required>Lesson title</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Content type</Label>
              <Select value={lessonForm.contentType} onValueChange={(v) => setLessonForm({ ...lessonForm, contentType: v as Lesson['contentType'] })}>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="quiz">Quiz</option>
                <option value="link">Link</option>
              </Select>
            </div>
            <div><Label>Duration (min)</Label><Input value={lessonForm.durationMin} onChange={(e) => setLessonForm({ ...lessonForm, durationMin: e.target.value })} /></div>
          </div>
          <div><Label>Content</Label><Input value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="URL or description" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLessonModal(false)}>Cancel</Button>
            <Button onClick={saveLesson}>{editingLesson ? 'Save changes' : 'Add lesson'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}