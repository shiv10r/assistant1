import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiCheckCircle, FiClock, FiTool } from 'react-icons/fi'
import { maintenanceInventoryApi, maintenancePlanApi, workOrderApi, type MaintenancePart, type MaintenancePlan, type WorkOrder } from './maintenance.types'

export default function MaintenanceDashboard() {
  const [orders, setOrders] = useState<WorkOrder[]>([]); const [plans, setPlans] = useState<MaintenancePlan[]>([]); const [parts, setParts] = useState<MaintenancePart[]>([]); const [error, setError] = useState('')
  async function load() { const [orderResult, planResult, partResult] = await Promise.all([workOrderApi.list(), maintenancePlanApi.list(), maintenanceInventoryApi.parts()]); setOrders(orderResult.data ?? []); setPlans(planResult.data ?? []); setParts(partResult.data ?? []); setError(orderResult.error?.message ?? planResult.error?.message ?? partResult.error?.message ?? '') }
  useEffect(() => { void load() }, [])
  async function execute(order: WorkOrder, action: string, body: Record<string, unknown> = {}) { await workOrderApi.execute(order, action, body); await load() }
  return <div className="railway-page crowd-page"><header className="crowd-header"><div><span className="railway-eyebrow">Asset reliability</span><h1>Maintenance control</h1><p>Preventive plans, corrective work, technician execution, and independent verification.</p></div></header>
    {error ? <div className="railway-panel" role="alert">{error}</div> : null}
    <section className="railway-kpis"><Kpi label="Active work" value={orders.filter((item) => !['Completed', 'Cancelled'].includes(item.status)).length} icon={<FiTool />} /><Kpi label="Critical" value={orders.filter((item) => item.priority === 'Critical').length} icon={<FiAlertTriangle />} /><Kpi label="Awaiting verification" value={orders.filter((item) => item.status === 'AwaitingVerification').length} icon={<FiCheckCircle />} /><Kpi label="Preventive plans" value={plans.length} icon={<FiClock />} /></section>
    <div className="crowd-split"><section className="railway-panel"><div className="railway-panel-head"><div><span>Execution board</span><h2>Work orders</h2></div></div><div className="crowd-stack">{orders.map((order) => <article className="crowd-source" key={order.id}><div><strong>{order.priority} · {order.status}</strong><p>{order.sourceType} {order.sourceId.slice(0, 8)} · target {order.targetId.slice(0, 8)}</p><small>{order.tasks.filter((task) => task.isCompleted).length}/{order.tasks.length} tasks complete</small></div><OrderAction order={order} run={execute} /></article>)}</div></section><CreateOrder reload={load} /></div>
    <div className="crowd-split"><section className="railway-panel"><div className="railway-panel-head"><div><span>Recurring work</span><h2>Maintenance plans</h2></div></div><div className="crowd-stack">{plans.map((plan) => <article className="crowd-source" key={plan.id}><div><strong>{plan.name}</strong><p>{plan.recurrenceRule} · SLA {plan.slaDays} days</p><small>Next due {new Date(plan.nextDueAt).toLocaleString()}</small></div></article>)}</div></section><CreatePlan reload={load} /></div>
    <div className="crowd-split"><section className="railway-panel"><div className="railway-panel-head"><div><span>Stores</span><h2>Parts inventory</h2></div></div><div className="crowd-stack">{parts.map((part) => <article className="crowd-source" key={part.id}><div><strong>{part.sku} · {part.name}</strong><p>{part.onHand - part.reserved} {part.unit} available · {part.reserved} reserved</p></div>{part.onHand - part.reserved <= part.reorderLevel ? <button onClick={() => void maintenanceInventoryApi.procure({ divisionId: part.divisionId, partId: part.id, quantity: Math.max(part.reorderLevel * 2, 1) })}>Request stock</button> : null}</article>)}</div></section><CreatePart reload={load} /></div>
  </div>
}

function OrderAction({ order, run }: { order: WorkOrder; run: (order: WorkOrder, action: string, body?: Record<string, unknown>) => Promise<void> }) {
  if (order.status === 'Draft') return <button onClick={() => void run(order, 'add-task', { reason: 'Complete assigned maintenance work' }).then(() => run(order, 'triage'))}>Add task & triage</button>
  if (order.status === 'Triaged') return <button onClick={() => void run(order, 'approve')}>Approve</button>
  if (order.status === 'Approved') return <button onClick={() => { const assignee = prompt('Technician user ID'); if (assignee) void run(order, 'schedule', { assigneeId: assignee }) }}>Schedule</button>
  if (order.status === 'Scheduled') return <button onClick={() => void run(order, 'start')}>Start</button>
  if (order.status === 'InProgress') { const task = order.tasks.find((item) => !item.isCompleted); return task ? <button onClick={() => void run(order, 'complete-task', { taskId: task.id })}>Complete task</button> : <button onClick={() => void run(order, 'submit-verification')}>Request verification</button> }
  if (order.status === 'Blocked') return <button onClick={() => void run(order, 'unblock')}>Resume</button>
  if (order.status === 'AwaitingVerification') return <button onClick={() => void run(order, 'verify')}>Verify</button>
  return null
}

function CreateOrder({ reload }: { reload: () => Promise<void> }) {
  const [form, setForm] = useState({ divisionId: '', sourceId: '', sourceType: 'Manual', targetId: '', priority: 'Medium', safetyClassified: false })
  async function submit(event: React.FormEvent) { event.preventDefault(); await workOrderApi.create(form); await reload() }
  return <section className="railway-panel"><h2>New work order</h2><form className="crowd-form" onSubmit={submit}>{['divisionId', 'sourceId', 'sourceType', 'targetId', 'priority'].map((key) => <label key={key}><span>{key}</span><input required value={String(form[key as keyof typeof form])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label><span>Safety classified</span><input type="checkbox" checked={form.safetyClassified} onChange={(event) => setForm({ ...form, safetyClassified: event.target.checked })} /></label><button>Create</button></form></section>
}

function CreatePlan({ reload }: { reload: () => Promise<void> }) {
  const [form, setForm] = useState({ divisionId: '', targetId: '', name: '', recurrenceRule: 'FREQ=MONTHLY', slaDays: 7, nextDueAt: new Date().toISOString().slice(0, 16) })
  async function submit(event: React.FormEvent) { event.preventDefault(); await maintenancePlanApi.create({ ...form, nextDueAt: new Date(form.nextDueAt).toISOString() }); await reload() }
  return <section className="railway-panel"><h2>New preventive plan</h2><form className="crowd-form" onSubmit={submit}>{['divisionId', 'targetId', 'name', 'recurrenceRule', 'nextDueAt'].map((key) => <label key={key}><span>{key}</span><input required value={String(form[key as keyof typeof form])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label><span>SLA days</span><input type="number" value={form.slaDays} onChange={(event) => setForm({ ...form, slaDays: Number(event.target.value) })} /></label><button>Create plan</button></form></section>
}
function CreatePart({ reload }: { reload: () => Promise<void> }) {
  const [form, setForm] = useState({ divisionId: '', sku: '', name: '', unit: 'each', reorderLevel: 1 })
  async function submit(event: React.FormEvent) { event.preventDefault(); await maintenanceInventoryApi.createPart(form); await reload() }
  return <section className="railway-panel"><h2>Add stocked part</h2><form className="crowd-form" onSubmit={submit}>{['divisionId', 'sku', 'name', 'unit'].map((key) => <label key={key}><span>{key}</span><input required value={String(form[key as keyof typeof form])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label><span>Reorder level</span><input type="number" value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: Number(event.target.value) })} /></label><button>Add part</button></form></section>
}
function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) { return <article className="railway-kpi"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article> }
