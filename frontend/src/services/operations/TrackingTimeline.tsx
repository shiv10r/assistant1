import { useState } from 'react'
import { AlertTriangle, Check, Circle, Flag, Plus } from 'lucide-react'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../platform/dashboard'
import { Badge, Button, Input, Label, Modal, Select, Textarea, fmtDate } from '../../platform/ui'
import { genId } from '../../lib/localStore'
import type { OperationsConfig } from './config'
import type { Checkpoint, LocalCollection, WorkItem } from './types'

export default function TrackingTimeline({ config, work, checkpoints, isAdvanced }: { config: OperationsConfig; work: WorkItem[]; checkpoints: LocalCollection<Checkpoint>; isAdvanced: boolean }) {
  const [workId, setWorkId] = useState(work[0]?.id ?? '')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', owner: '', dueDate: '', note: '' })
  const selectedWork = work.find((item) => item.id === workId)
  const current = checkpoints.items.filter((item) => item.workId === workId).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const overdue = checkpoints.items.filter((item) => item.status !== 'Complete' && item.dueDate < new Date().toISOString().slice(0, 10)).length
  const complete = checkpoints.items.filter((item) => item.status === 'Complete').length
  const bars: BarDatum[] = work.map((item) => {
    const itemCheckpoints = checkpoints.items.filter((entry) => entry.workId === item.id)
    const value = itemCheckpoints.length ? Math.round(itemCheckpoints.filter((entry) => entry.status === 'Complete').length / itemCheckpoints.length * 100) : 0
    return { label: item.title, value, valueLabel: `${value}%` }
  })
  const statuses = ['Complete', 'In progress', 'Blocked', 'Not started'] as const
  const colors = ['#2CB5A8', '#4F86F7', '#F0708D', '#94A3B8']
  const donut: DonutDatum[] = statuses.map((status, index) => ({ label: status, value: checkpoints.items.filter((item) => item.status === status).length, color: colors[index] }))

  const add = () => {
    if (!form.title.trim() || !workId) return
    checkpoints.add({ id: genId(), workId, title: form.title.trim(), owner: form.owner.trim() || selectedWork?.owner || 'Unassigned', dueDate: form.dueDate || new Date().toISOString().slice(0, 10), status: 'Not started', note: form.note.trim(), updatedAt: new Date().toISOString() })
    setOpen(false); setForm({ title: '', owner: '', dueDate: '', note: '' })
  }

  return <div className="operations-page">
    <header className="ops-page-head"><div><span>Global tracking</span><h1>{capitalize(config.timelineLabel)}</h1><p>See every {config.item} on one checkpoint system, surface slippage early and record handoffs as they happen.</p></div><Button onClick={() => setOpen(true)} disabled={!work.length}><Plus className="w-4 h-4" /> Add {config.checkpoint}</Button></header>
    <section className="ops-tracking-strip">{work.map((item) => { const related = checkpoints.items.filter((entry) => entry.workId === item.id); const done = related.filter((entry) => entry.status === 'Complete').length; const percent = related.length ? Math.round(done / related.length * 100) : 0; return <button key={item.id} className={item.id === workId ? 'is-active' : ''} onClick={() => setWorkId(item.id)}><span><strong>{item.title}</strong><Badge variant={item.status === 'Completed' ? 'success' : 'info'} size="sm">{item.status}</Badge></span><i><b style={{ width: `${percent}%` }} /></i><small>{done}/{related.length} checkpoints complete · {fmtDate(item.dueDate)}</small></button>})}</section>
    {isAdvanced && <AdvancedPanel title="Checkpoint intelligence" subtitle={`Cross-${config.item} completion, flow state and schedule exposure.`} bars={bars} donut={donut} compare={[{ label: 'Checkpoint completion', value: checkpoints.items.length ? `${Math.round(complete / checkpoints.items.length * 100)}%` : '0%', delta: `${complete} verified`, deltaTone: 'up' }, { label: 'Schedule exposure', value: String(overdue), delta: overdue ? 'Needs intervention' : 'On track', deltaTone: overdue ? 'down' : 'up' }, { label: 'Blocked handoffs', value: String(checkpoints.items.filter((item) => item.status === 'Blocked').length), delta: 'Across portfolio', deltaTone: 'flat' }]} />}
    <div className="ops-timeline-board">
      <div className="ops-timeline-context"><span>{selectedWork?.location}</span><h2>{selectedWork?.title ?? `Select a ${config.item}`}</h2><p>{selectedWork?.customer} · Owned by {selectedWork?.owner}</p></div>
      <div className="ops-checkpoint-list">{current.map((item, index) => <article key={item.id} className={`is-${item.status.toLowerCase().replace(' ', '-')}`}>
        <div className="ops-checkpoint-marker">{item.status === 'Complete' ? <Check /> : item.status === 'Blocked' ? <AlertTriangle /> : item.status === 'In progress' ? <Flag /> : <Circle />}</div>
        <div className="ops-checkpoint-card"><div><span>{config.checkpoint} {index + 1}</span><h3>{item.title}</h3><p>{item.note || 'No checkpoint note has been added.'}</p><small>{item.owner} · Due {fmtDate(item.dueDate)}</small></div><Select value={item.status} onValueChange={(status) => checkpoints.update(item.id, { status: status as Checkpoint['status'], updatedAt: new Date().toISOString() })}><option>Not started</option><option>In progress</option><option>Blocked</option><option>Complete</option></Select></div>
      </article>)}{!current.length && <div className="ops-empty"><Flag /><h2>No checkpoints</h2><p>Add the first milestone to this {config.item}.</p></div>}</div>
    </div>
    <Modal open={open} onClose={() => setOpen(false)} title={`Add ${config.checkpoint}`} size="md"><div className="space-y-4"><div><Label>{capitalize(config.item)}</Label><Select value={workId} onValueChange={setWorkId}>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div><div><Label required>Checkpoint</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={config.checkpointLabels[0]} /></div><div className="grid grid-cols-2 gap-4"><div><Label>Owner</Label><Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></div><div><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></div></div><div><Label>Handoff note</Label><Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!form.title.trim()}>Add checkpoint</Button></div></div></Modal>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
