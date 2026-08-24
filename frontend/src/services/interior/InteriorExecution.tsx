import { useMemo, useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Modal, Select, money, fmtDate, num } from '../../platform/ui'
import { AlertTriangle, Check, ClipboardCheck, Clock3, Package, Plus } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { DecisionStatus, InteriorDecision, InteriorPhase, InteriorProcurement, InteriorProject, InteriorTask, InteriorTaskStatus, ProcurementStatus } from './types'
import { DECISION_SEED, PROCUREMENT_SEED, PROJECT_SEED, TASK_SEED } from './seed'

const STATUSES: InteriorTaskStatus[] = ['not-started', 'in-progress', 'blocked', 'completed']
const STATUS_LABEL: Record<InteriorTaskStatus, string> = { 'not-started': 'Planned', 'in-progress': 'In progress', blocked: 'Blocked', completed: 'Completed' }
const PHASES: InteriorPhase[] = ['Discovery', 'Concept', 'Design Development', 'Procurement', 'Execution', 'Handover']
const emptyTask = { title: '', projectId: '', phase: 'Concept' as InteriorPhase, owner: '', dueDate: '' }

export default function InteriorExecution() {
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: tasks, add, update } = useLocalCollection<InteriorTask>('interior:tasks', TASK_SEED)
  const { items: procurement, update: updateProcurement } = useLocalCollection<InteriorProcurement>('interior:procurement', PROCUREMENT_SEED)
  const { items: decisions, update: updateDecision } = useLocalCollection<InteriorDecision>('interior:decisions', DECISION_SEED)
  const [view, setView] = useState<'tasks' | 'procurement' | 'approvals'>('tasks')
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState(emptyTask)

  const blocked = tasks.filter((task) => task.status === 'blocked').length
  const deliveredValue = procurement.filter((item) => item.status === 'delivered').reduce((sum, item) => sum + item.amount, 0)
  const committedValue = procurement.reduce((sum, item) => sum + item.amount, 0)
  const pendingApprovals = decisions.filter((decision) => decision.status === 'pending').length
  const completion = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0

  const sortedProcurement = useMemo(() => [...procurement].sort((a, b) => a.expectedDate.localeCompare(b.expectedDate)), [procurement])

  function projectName(id: string) { return projects.find((project) => project.id === id)?.name ?? 'Unknown project' }

  function addTask() {
    if (!taskForm.title.trim() || !taskForm.projectId) return
    add({ id: genId(), ...taskForm, title: taskForm.title.trim(), owner: taskForm.owner.trim() || 'Unassigned', status: 'not-started', progress: 0 })
    setTaskForm(emptyTask)
    setTaskOpen(false)
  }

  function moveTask(task: InteriorTask) {
    const index = STATUSES.indexOf(task.status)
    const status = STATUSES[Math.min(index + 1, STATUSES.length - 1)]
    const progress = status === 'completed' ? 100 : status === 'in-progress' ? Math.max(task.progress, 35) : task.progress
    update(task.id, { status, progress })
  }

  function setDecision(id: string, status: DecisionStatus) { updateDecision(id, { status }) }

  return (
    <div className="interior-page space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><span className="interior-eyebrow !text-primary"><ClipboardCheck className="w-3.5 h-3.5" /> Delivery control</span><h1 className="text-3xl font-semibold text-text mt-2">Execution studio</h1><p className="text-sm text-muted mt-1">Coordinate work, procurement risk and client decisions across every live project.</p></div>
        <Button onClick={() => setTaskOpen(true)}><Plus className="w-4 h-4" /> Add task</Button>
      </div>

      <section className="interior-metrics">
        <div className="interior-metric" style={{ '--metric-color': '#7f9278' } as React.CSSProperties}><p className="interior-metric-label">Portfolio completion</p><p className="interior-metric-value">{completion}%</p><p className="interior-metric-note">Weighted across {tasks.length} tasks</p></div>
        <div className="interior-metric" style={{ '--metric-color': '#d97706' } as React.CSSProperties}><p className="interior-metric-label">Blocked work</p><p className="interior-metric-value">{num(blocked)}</p><p className="interior-metric-note">Requires owner action</p></div>
        <div className="interior-metric" style={{ '--metric-color': '#526b80' } as React.CSSProperties}><p className="interior-metric-label">Committed orders</p><p className="interior-metric-value">{money(committedValue)}</p><p className="interior-metric-note">{money(deliveredValue)} delivered</p></div>
        <div className="interior-metric"><p className="interior-metric-label">Client approvals</p><p className="interior-metric-value">{num(pendingApprovals)}</p><p className="interior-metric-note">Pending decisions</p></div>
      </section>

      <div className="interior-chip-row">
        <button className={`interior-chip ${view === 'tasks' ? 'is-active' : ''}`} onClick={() => setView('tasks')}>Work board</button>
        <button className={`interior-chip ${view === 'procurement' ? 'is-active' : ''}`} onClick={() => setView('procurement')}>Procurement</button>
        <button className={`interior-chip ${view === 'approvals' ? 'is-active' : ''}`} onClick={() => setView('approvals')}>Client approvals</button>
      </div>

      {view === 'tasks' && (
        <div className="interior-board">
          {STATUSES.map((status) => {
            const statusTasks = tasks.filter((task) => task.status === status)
            return <section className="interior-board-column" key={status}>
              <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-muted">{STATUS_LABEL[status]}</p><Badge variant={status === 'blocked' ? 'danger' : status === 'completed' ? 'success' : 'outline'} size="sm">{statusTasks.length}</Badge></div>
              {statusTasks.map((task) => <article className="interior-task-card" key={task.id}>
                <p className="text-sm font-semibold text-text">{task.title}</p><p className="text-[11px] text-muted mt-1">{projectName(task.projectId)}</p>
                <div className="interior-progress-track mt-3"><div className="interior-progress-fill" style={{ width: `${task.progress}%` }} /></div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-muted"><span>{task.owner}</span><span className="flex items-center gap-1"><Clock3 className="w-3 h-3" /> {fmtDate(task.dueDate)}</span></div>
                {status !== 'completed' && <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => moveTask(task)}>Move forward</Button>}
              </article>)}
            </section>
          })}
        </div>
      )}

      {view === 'procurement' && <Card><CardHeader><CardTitle>Procurement control tower</CardTitle></CardHeader><CardContent className="space-y-2">
        {sortedProcurement.map((item) => <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] gap-3 items-center p-3 rounded-lg border border-border bg-surface2">
          <div><p className="text-sm font-semibold text-text">{item.item}</p><p className="text-xs text-muted">{projectName(item.projectId)} · {item.vendor}</p></div>
          <span className="text-xs text-muted">Expected {fmtDate(item.expectedDate)}</span><span className="text-sm font-semibold">{money(item.amount)}</span>
          <Badge variant={item.status === 'delayed' ? 'danger' : item.status === 'delivered' ? 'success' : item.status === 'in-transit' ? 'info' : 'outline'} size="sm">{item.status}</Badge>
          <Select value={item.status} onValueChange={(status) => updateProcurement(item.id, { status: status as ProcurementStatus })}><option value="planned">Planned</option><option value="quoted">Quoted</option><option value="ordered">Ordered</option><option value="in-transit">In transit</option><option value="delivered">Delivered</option><option value="delayed">Delayed</option></Select>
        </div>)}
      </CardContent></Card>}

      {view === 'approvals' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {decisions.map((decision) => <Card key={decision.id}><CardContent className="p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-text">{decision.title}</p><p className="text-xs text-muted mt-1">{projectName(decision.projectId)} · requested from {decision.requestedFrom}</p></div><Badge variant={decision.status === 'approved' ? 'success' : decision.status === 'changes-requested' ? 'danger' : 'warning'} size="sm">{decision.status}</Badge></div>
          <p className="text-xs text-muted mt-4">Decision due {fmtDate(decision.dueDate)}</p>
          <div className="flex justify-end gap-2 mt-4"><Button variant="outline" size="sm" onClick={() => setDecision(decision.id, 'changes-requested')}><AlertTriangle className="w-3.5 h-3.5" /> Request changes</Button><Button size="sm" onClick={() => setDecision(decision.id, 'approved')}><Check className="w-3.5 h-3.5" /> Approve</Button></div>
        </CardContent></Card>)}
      </div>}

      <Modal open={taskOpen} onClose={() => setTaskOpen(false)} title="Add delivery task" size="md"><div className="space-y-4">
        <div><Label required>Task</Label><Input value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="e.g. Approve flooring shop drawing" /></div>
        <div><Label required>Project</Label><Select value={taskForm.projectId} onValueChange={(projectId) => setTaskForm({ ...taskForm, projectId })}><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Phase</Label><Select value={taskForm.phase} onValueChange={(phase) => setTaskForm({ ...taskForm, phase: phase as InteriorPhase })}>{PHASES.map((phase) => <option key={phase}>{phase}</option>)}</Select></div><div><Label>Due date</Label><Input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} /></div></div>
        <div><Label>Owner</Label><Input value={taskForm.owner} onChange={(event) => setTaskForm({ ...taskForm, owner: event.target.value })} placeholder="Designer, contractor or site team" /></div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button><Button onClick={addTask} disabled={!taskForm.title.trim() || !taskForm.projectId}><Package className="w-4 h-4" /> Add task</Button></div>
      </div></Modal>
    </div>
  )
}
