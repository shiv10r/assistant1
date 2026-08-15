import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { CheckSquare, Plus, Pencil, Trash2, Search, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { TaskItem } from './types'
import { TASK_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolTasks() {
  const { items, add, update, remove } = useLocalCollection<TaskItem>('school:tasks', TASK_SEED)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TaskItem | null>(null)
  const [form, setForm] = useState({ title: '', description: '', assignee: '', priority: 'medium' as TaskItem['priority'], dueDate: '', status: 'todo' as TaskItem['status'] })

  const filtered = useMemo(
    () => items.filter((t) => (statusFilter === 'all' || t.status === statusFilter) && `${t.title} ${t.assignee} ${t.description}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, statusFilter]
  )

  const columns: DataColumn<TaskItem>[] = [
    { key: 'title', header: 'Task', render: (t) => <span className="font-medium">{t.title}</span>, sortValue: (t) => t.title },
    { key: 'assignee', header: 'Assignee', render: (t) => t.assignee || <span className="text-muted text-sm">—</span> },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} />, sortValue: (t) => t.priority },
    { key: 'dueDate', header: 'Due', render: (t) => {
      const overdue = t.status !== 'done' && t.dueDate < new Date().toISOString().slice(0, 10)
      return <span className={overdue ? 'text-red-600 font-semibold' : 'text-text'}>{t.dueDate.slice(0, 10)}{overdue ? ' (overdue)' : ''}</span>
    }, sortValue: (t) => t.dueDate },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} />, sortValue: (t) => t.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' })
    setModalOpen(true)
  }

  function openEdit(t: TaskItem) {
    setEditing(t)
    setForm({ title: t.title, description: t.description, assignee: t.assignee, priority: t.priority, dueDate: t.dueDate, status: t.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const todo = items.filter((t) => t.status === 'todo').length
  const inprogress = items.filter((t) => t.status === 'inprogress').length
  const done = items.filter((t) => t.status === 'done').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tasks" value={items.length} icon={<CheckSquare className="w-5 h-5" />} tone="info" />
        <KpiCard label="To do" value={todo} icon={<CheckSquare className="w-5 h-5" />} tone="warning" />
        <KpiCard label="In progress" value={inprogress} icon={<CheckSquare className="w-5 h-5" />} tone="default" />
        <KpiCard label="Done" value={done} icon={<CheckSquare className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Task manager</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add task</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(t) => t.id}
            pageSize={10}
            exportFilename="school-tasks"
            emptyIcon={<CheckSquare className="w-6 h-6" />}
            emptyTitle="No tasks"
            emptyDescription="Assign and track tasks for staff."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search tasks..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter} className="w-36">
                  <option value="all">All status</option>
                  <option value="todo">To do</option>
                  <option value="inprogress">In progress</option>
                  <option value="done">Done</option>
                </Select>
              </div>
            }
            actions={(t) => (
              <div className="flex gap-1">
                {t.status === 'todo' && <Button variant="ghost" size="icon" onClick={() => update(t.id, { status: 'inprogress' })} aria-label="Start"><ArrowRight className="w-4 h-4 text-emerald-500" /></Button>}
                {t.status === 'inprogress' && <Button variant="ghost" size="icon" onClick={() => update(t.id, { status: 'done' })} aria-label="Done"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit task' : 'Add task'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Assignee</Label><Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TaskItem['priority'] })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskItem['status'] })}>
              <option value="todo">To do</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add task'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}