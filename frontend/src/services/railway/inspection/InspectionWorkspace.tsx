import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { railwayRequest } from '../api/railwayApi'

type Template = { id: string; divisionId: string; name: string; templateVersion: number; status: string; version: number; items: Array<{ itemId: string; label: string; required: boolean }> }
type Assignment = { id: string; divisionId: string; templateId: string; templateVersion: number; targetId: string; dueAt: string }
type Run = { id: string; divisionId: string; assignmentId: string; templateId: string; templateVersion: number; targetId: string; status: string; startedAt: string; version: number }
type RunDetail = Run & { requirements: Array<{ itemId: string; required: boolean; evidenceRequired: boolean; minimum?: number; maximum?: number }>; answers: Array<{ itemId: string; response: string; measurement?: number; evidenceIds: string[] }> }
type Defect = { id: string; inspectionRunId: string; description: string; severity: string; status: string; raisedAt: string; version: number }

export default function InspectionWorkspace({ defects = false }: { defects?: boolean }) {
  const location = useLocation()
  const section = defects ? 'defects' : location.pathname.split('/').at(-1) ?? 'inspections'
  const [templates, setTemplates] = useState<Template[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [defectItems, setDefects] = useState<Defect[]>([])
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    const [templateResult, assignmentResult, runResult, defectResult] = await Promise.all([
      railwayRequest<Template[]>('/api/railway/inspections/templates'), railwayRequest<Assignment[]>('/api/railway/inspections/assignments'),
      railwayRequest<Run[]>('/api/railway/inspections/runs'), railwayRequest<Defect[]>('/api/railway/defects'),
    ])
    setTemplates(templateResult.data ?? []); setAssignments(assignmentResult.data ?? []); setRuns(runResult.data ?? []); setDefects(defectResult.data ?? [])
    setError(templateResult.error?.message ?? assignmentResult.error?.message ?? runResult.error?.message ?? defectResult.error?.message ?? '')
  }
  useEffect(() => { void load() }, [])

  async function start(assignment: Assignment) {
    await railwayRequest('/api/railway/inspections/runs', { method: 'POST', idempotencyKey: crypto.randomUUID(), body: {
      divisionId: assignment.divisionId, assignmentId: assignment.id, templateId: assignment.templateId, targetId: assignment.targetId,
    } }); await load()
  }
  async function submit(run: Run) { await railwayRequest(`/api/railway/inspections/runs/${run.id}/submit`, { method: 'POST', idempotencyKey: crypto.randomUUID() }); await load() }
  async function review(run: Run, accepted: boolean) { await railwayRequest(`/api/railway/inspections/runs/${run.id}/review`, { method: 'POST', expectedVersion: run.version, body: { accepted, reason: accepted ? null : 'Returned for correction' } }); await load() }
  async function triage(defect: Defect) { await railwayRequest(`/api/railway/defects/${defect.id}/triage`, { method: 'POST', expectedVersion: defect.version }); await load() }

  return <div className="railway-page crowd-page">
    <header className="crowd-header"><div><span className="railway-eyebrow">Field assurance</span><h1>{defects ? 'Defect register' : 'Inspection control'}</h1><p>Assigned work, pinned checklists, review decisions, and corrective action.</p></div></header>
    <nav className="crowd-tabs"><Link to="/railway/inspections">Assignments</Link><Link to="/railway/inspections/templates">Templates</Link><Link to="/railway/inspections/review">Review queue</Link><Link to="/railway/defects">Defects</Link></nav>
    {error ? <div className="railway-panel" role="alert">{error}</div> : null}
    {section === 'templates' ? <TemplatePanel templates={templates} reload={load} /> : null}
    {section === 'review' ? <RunPanel runs={runs.filter((run) => run.status === 'Submitted')} action={(run) => review(run, true)} actionLabel="Accept" secondary={(run) => review(run, false)} /> : null}
    {section === 'defects' ? <section className="railway-panel"><div className="railway-panel-head"><div><span>Corrective action</span><h2>All defects</h2></div></div><div className="crowd-stack">{defectItems.map((item) => <article className="crowd-alert-card" key={item.id}><div><strong>{item.severity}: {item.description}</strong><p>{item.status} · {new Date(item.raisedAt).toLocaleString()}</p></div>{item.status === 'Open' ? <button onClick={() => void triage(item)}>Triage</button> : null}</article>)}</div></section> : null}
    {section === 'inspections' ? <><section className="railway-panel"><div className="railway-panel-head"><div><span>Due work</span><h2>Assignments</h2></div></div><div className="crowd-stack">{assignments.map((item) => <article className="crowd-source" key={item.id}><div><strong>Target {item.targetId.slice(0, 8)}</strong><p>Due {new Date(item.dueAt).toLocaleString()} · Template v{item.templateVersion}</p></div><button onClick={() => void start(item)}>Start inspection</button></article>)}</div></section><RunPanel runs={runs} action={submit} actionLabel="Submit" open={setActiveRunId} />{activeRunId ? <ChecklistRunner runId={activeRunId} close={() => setActiveRunId(null)} reload={load} /> : null}</> : null}
  </div>
}

function RunPanel({ runs, action, actionLabel, secondary, open }: { runs: Run[]; action: (run: Run) => Promise<void>; actionLabel: string; secondary?: (run: Run) => Promise<void>; open?: (id: string) => void }) {
  return <section className="railway-panel"><div className="railway-panel-head"><div><span>Inspection records</span><h2>Runs</h2></div></div><div className="crowd-stack">{runs.map((run) => <article className="crowd-source" key={run.id}><div><strong>{run.status} · Target {run.targetId.slice(0, 8)}</strong><p>Template v{run.templateVersion} · {new Date(run.startedAt).toLocaleString()}</p></div>{run.status === 'Draft' && open ? <button onClick={() => open(run.id)}>Open checklist</button> : null}{(run.status === 'Draft' || run.status === 'Submitted') ? <button onClick={() => void action(run)}>{actionLabel}</button> : null}{secondary ? <button onClick={() => void secondary(run)}>Reject</button> : null}</article>)}</div></section>
}

function ChecklistRunner({ runId, close, reload }: { runId: string; close: () => void; reload: () => Promise<void> }) {
  const [run, setRun] = useState<RunDetail | null>(null); const [answers, setAnswers] = useState<Record<string, string>>({}); const [evidence, setEvidence] = useState<Record<string, string>>({})
  useEffect(() => { void railwayRequest<RunDetail>(`/api/railway/inspections/runs/${runId}`).then((result) => { setRun(result.data); setAnswers(Object.fromEntries((result.data?.answers ?? []).map((item) => [item.itemId, item.response]))) }) }, [runId])
  async function save() { if (!run) return; for (const requirement of run.requirements) { const ids = (evidence[requirement.itemId] ?? '').split(',').map((id) => id.trim()).filter(Boolean); await railwayRequest(`/api/railway/inspections/runs/${run.id}/answers`, { method: 'PUT', expectedVersion: run.version, body: { itemId: requirement.itemId, response: answers[requirement.itemId] ?? '', measurement: null, evidenceIds: ids } }) } await reload(); close() }
  if (!run) return <div className="railway-panel">Loading checklist...</div>
  return <section className="railway-panel"><div className="railway-panel-head"><div><span>Pinned template v{run.templateVersion}</span><h2>Checklist runner</h2></div><button onClick={close}>Close</button></div><div className="crowd-form">{run.requirements.map((item) => <div className="crowd-source" key={item.itemId}><div><strong>{item.itemId}{item.required ? ' *' : ''}</strong>{item.minimum !== undefined || item.maximum !== undefined ? <small>Range {item.minimum ?? '—'} to {item.maximum ?? '—'}</small> : null}<input required={item.required} placeholder="Inspection response" value={answers[item.itemId] ?? ''} onChange={(event) => setAnswers({ ...answers, [item.itemId]: event.target.value })} />{item.evidenceRequired ? <input placeholder="Evidence IDs, comma separated" value={evidence[item.itemId] ?? ''} onChange={(event) => setEvidence({ ...evidence, [item.itemId]: event.target.value })} /> : null}</div></div>)}<button onClick={() => void save()}>Save checklist</button></div></section>
}

function TemplatePanel({ templates, reload }: { templates: Template[]; reload: () => Promise<void> }) {
  const [divisionId, setDivisionId] = useState(''); const [name, setName] = useState(''); const [label, setLabel] = useState('')
  async function create(event: React.FormEvent) { event.preventDefault(); await railwayRequest('/api/railway/inspections/templates', { method: 'POST', idempotencyKey: crypto.randomUUID(), body: { divisionId, name, items: [{ itemId: crypto.randomUUID(), label, required: true, evidenceRequired: false }] } }); setName(''); setLabel(''); await reload() }
  async function publish(template: Template) { await railwayRequest(`/api/railway/inspections/templates/${template.id}/publish`, { method: 'POST', expectedVersion: template.version }); await reload() }
  return <div className="crowd-split"><section className="railway-panel"><div className="crowd-stack">{templates.map((item) => <article className="crowd-source" key={item.id}><div><strong>{item.name}</strong><p>Version {item.templateVersion} · {item.items.length} items · {item.status}</p></div>{item.status === 'Draft' ? <button onClick={() => void publish(item)}>Publish</button> : null}</article>)}</div></section><section className="railway-panel"><h2>New checklist</h2><form className="crowd-form" onSubmit={create}><label><span>Division ID</span><input required value={divisionId} onChange={(event) => setDivisionId(event.target.value)} /></label><label><span>Template name</span><input required value={name} onChange={(event) => setName(event.target.value)} /></label><label><span>First checklist item</span><input required value={label} onChange={(event) => setLabel(event.target.value)} /></label><button>Create draft</button></form></section></div>
}
