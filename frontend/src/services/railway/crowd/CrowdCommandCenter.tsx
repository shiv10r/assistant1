import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiRadio, FiUploadCloud, FiUsers } from 'react-icons/fi'
import { crowdApi, type CrowdAlert, type CrowdIncident, type CrowdObservation, type CrowdSource, type SubmitCrowdObservation } from './crowd.types'

type CrowdData = { observations: CrowdObservation[]; alerts: CrowdAlert[]; sources: CrowdSource[]; incidents: CrowdIncident[] }
const emptyData: CrowdData = { observations: [], alerts: [], sources: [], incidents: [] }

export default function CrowdCommandCenter() {
  const location = useLocation()
  const section = location.pathname.split('/').at(-1) ?? 'crowd'
  const [data, setData] = useState<CrowdData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    const [observations, alerts, sources, incidents] = await Promise.all([
      crowdApi.observations(), crowdApi.alerts(), crowdApi.sources(), crowdApi.incidents(),
    ])
    const failure = observations.error ?? alerts.error ?? sources.error ?? incidents.error
    setError(failure?.message ?? null)
    setData({ observations: observations.data ?? [], alerts: alerts.data ?? [], sources: sources.data ?? [], incidents: incidents.data ?? [] })
    setLoading(false)
  }

  useEffect(() => { void refresh() }, [])

  return (
    <div className="railway-page crowd-page">
      <header className="crowd-header">
        <div><span className="railway-eyebrow">Station operations</span><h1>Crowd command center</h1><p>Aggregate occupancy, source health, alerts, and coordinated response without personal tracking.</p></div>
        <span className="crowd-live"><i /> Aggregate feeds live</span>
      </header>
      <nav className="crowd-tabs" aria-label="Crowd operations">
        <Link className={section === 'crowd' ? 'active' : ''} to="/railway/crowd">Overview</Link>
        <Link className={section === 'alerts' ? 'active' : ''} to="/railway/crowd/alerts">Alerts</Link>
        <Link className={section === 'sources' ? 'active' : ''} to="/railway/crowd/sources">Sources</Link>
        <Link className={section === 'imports' ? 'active' : ''} to="/railway/crowd/imports">Manual & CSV</Link>
      </nav>
      {loading ? <div className="railway-panel" role="status">Loading aggregate station status...</div> : null}
      {error ? <div className="railway-panel crowd-error" role="alert">{error} <button onClick={() => void refresh()}>Retry</button></div> : null}
      {!loading && section === 'crowd' ? <Overview data={data} /> : null}
      {!loading && section === 'alerts' ? <Alerts alerts={data.alerts} onChanged={refresh} /> : null}
      {!loading && section === 'sources' ? <Sources sources={data.sources} onChanged={refresh} /> : null}
      {!loading && section === 'imports' ? <ManualAndCsv sources={data.sources} onChanged={refresh} /> : null}
    </div>
  )
}

function Overview({ data }: { data: CrowdData }) {
  const openAlerts = data.alerts.filter((item) => item.isOpen)
  const currentCount = data.observations.filter((item) => Date.now() - new Date(item.windowEnd).getTime() < 5 * 60_000).reduce((sum, item) => sum + item.count, 0)
  return <>
    <section className="railway-kpis">
      <Kpi icon={<FiUsers />} label="Current count" value={currentCount} detail="Latest five-minute windows" />
      <Kpi icon={<FiAlertTriangle />} label="Open alerts" value={openAlerts.length} detail={`${openAlerts.filter((item) => item.level === 'Critical').length} critical`} />
      <Kpi icon={<FiRadio />} label="Sources online" value={data.sources.filter((item) => item.enabled).length} detail={`${data.sources.length} configured`} />
      <Kpi icon={<FiActivity />} label="Open incidents" value={data.incidents.filter((item) => item.status === 'Open').length} detail="Active response coordination" />
    </section>
    <section className="railway-grid">
      <div className="railway-panel"><div className="railway-panel-head"><div><span>Recent windows</span><h2>Aggregate observations</h2></div></div><ObservationTable observations={data.observations.slice(0, 12)} /></div>
      <div className="railway-panel"><div className="railway-panel-head"><div><span>Response queue</span><h2>Current alerts</h2></div></div>
        {openAlerts.length ? openAlerts.slice(0, 6).map((alert) => <div className={`crowd-alert crowd-${alert.level.toLowerCase()}`} key={alert.id}><FiAlertTriangle /><div><strong>{alert.level}</strong><small>Zone {shortId(alert.stationZoneId)} · {formatTime(alert.raisedAt)}</small></div></div>) : <div className="crowd-empty"><FiCheckCircle />All monitored zones are normal.</div>}
      </div>
    </section>
  </>
}

function Kpi({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return <article className="railway-kpi"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}

function ObservationTable({ observations }: { observations: CrowdObservation[] }) {
  if (!observations.length) return <div className="crowd-empty">No aggregate observations received.</div>
  return <div className="railway-table-wrap"><div className="crowd-table"><div className="crowd-row head"><span>Station</span><span>Zone</span><span>Count</span><span>Confidence</span><span>Window</span></div>{observations.map((item) => <div className="crowd-row" key={item.id}><code>{shortId(item.stationId)}</code><code>{shortId(item.stationZoneId)}</code><strong>{item.count}</strong><span>{Math.round(item.confidence * 100)}%</span><span>{formatTime(item.windowEnd)}</span></div>)}</div></div>
}

function Alerts({ alerts, onChanged }: { alerts: CrowdAlert[]; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState<string | null>(null)
  async function acknowledge(alert: CrowdAlert) { setBusy(alert.id); await crowdApi.acknowledge(alert.id, alert.version); await onChanged(); setBusy(null) }
  return <section className="railway-panel"><div className="railway-panel-head"><div><span>Escalation queue</span><h2>Alerts and acknowledgements</h2></div></div>
    <div className="crowd-stack">{alerts.map((alert) => <article className={`crowd-alert-card crowd-${alert.level.toLowerCase()}`} key={alert.id}><FiAlertTriangle /><div><strong>{alert.level} zone threshold</strong><p>Station {shortId(alert.stationId)} · Zone {shortId(alert.stationZoneId)}</p><small>Raised {formatTime(alert.raisedAt)}</small></div>{alert.acknowledgedAt ? <span className="crowd-status">Acknowledged</span> : <button disabled={busy === alert.id} onClick={() => void acknowledge(alert)}>{busy === alert.id ? 'Saving...' : 'Acknowledge'}</button>}</article>)}</div>
  </section>
}

function Sources({ sources, onChanged }: { sources: CrowdSource[]; onChanged: () => Promise<void> }) {
  const [credential, setCredential] = useState<string | null>(null)
  const [form, setForm] = useState({ divisionId: '', stationId: '', stationZoneId: '', name: '', adapterType: 'manual-json' })
  async function create(event: React.FormEvent) { event.preventDefault(); const result = await crowdApi.createSource(form); setCredential(result.data?.signingSecret ?? null); if (!result.error) await onChanged() }
  async function rotate(sourceId: string) { const result = await crowdApi.rotateCredential(sourceId); setCredential(result.data?.signingSecret ?? null); if (!result.error) await onChanged() }
  return <div className="crowd-split"><section className="railway-panel"><div className="railway-panel-head"><div><span>Feed health</span><h2>Configured sources</h2></div></div><div className="crowd-stack">{sources.map((source) => <article className="crowd-source" key={source.id}><span className={source.enabled ? 'online' : ''}><FiRadio /></span><div><strong>{source.name}</strong><small>{source.adapterType} · station {shortId(source.stationId)}</small><p>{source.lastObservationAt ? `Last observation ${formatTime(source.lastObservationAt)}` : 'Waiting for first observation'}</p></div><button onClick={() => void rotate(source.id)}>Rotate key</button></article>)}</div></section>
    <section className="railway-panel"><div className="railway-panel-head"><div><span>Source registry</span><h2>Add aggregate feed</h2></div></div><form className="crowd-form" onSubmit={create}>{Object.entries(form).map(([key, value]) => <label key={key}><span>{label(key)}</span><input required value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<button type="submit">Create source</button></form>{credential ? <div className="crowd-credential"><strong>Copy this secret now</strong><code>{credential}</code><small>It will not be displayed again.</small></div> : null}</section></div>
}

type CsvRow = SubmitCrowdObservation & { error?: string }
function ManualAndCsv({ sources, onChanged }: { sources: CrowdSource[]; onChanged: () => Promise<void> }) {
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '')
  const [count, setCount] = useState('')
  const [rows, setRows] = useState<CsvRow[]>([])
  const source = sources.find((item) => item.id === sourceId)
  async function submitManual(event: React.FormEvent) { event.preventDefault(); if (!source) return; const now = new Date(); await crowdApi.submit({ divisionId: source.divisionId, sourceId, sourceEventId: crypto.randomUUID(), windowStart: new Date(now.getTime() - 60_000).toISOString(), windowEnd: now.toISOString(), count: Number(count), confidence: 1, qualityFlags: ['manual'] }); setCount(''); await onChanged() }
  async function loadCsv(file?: File) { if (!file || !source) return; const lines = (await file.text()).trim().split(/\r?\n/).slice(1); setRows(lines.map((line, index) => { const [sourceEventId, countValue, windowStart, windowEnd, confidence = '1'] = line.split(',').map((cell) => cell.trim()); const parsed = Number(countValue); return { divisionId: source.divisionId, sourceId, sourceEventId: sourceEventId || `row-${index + 1}`, count: parsed, windowStart, windowEnd, confidence: Number(confidence), qualityFlags: ['csv'], error: !sourceEventId || !Number.isFinite(parsed) || !windowStart || !windowEnd ? 'Missing or invalid required value' : undefined } })) }
  async function approve() { for (const row of rows.filter((item) => !item.error)) await crowdApi.submit(row); setRows([]); await onChanged() }
  return <div className="crowd-split"><section className="railway-panel"><div className="railway-panel-head"><div><span>Fallback channel</span><h2>Manual count</h2></div></div><form className="crowd-form" onSubmit={submitManual}><label><span>Source</span><select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>{sources.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label><span>Aggregate count</span><input min="0" required type="number" value={count} onChange={(event) => setCount(event.target.value)} /></label><button type="submit">Submit count</button></form></section>
    <section className="railway-panel"><div className="railway-panel-head"><div><span>Staged ingestion</span><h2>CSV review</h2></div><FiUploadCloud /></div><input aria-label="Crowd CSV file" accept=".csv,text/csv" type="file" onChange={(event) => void loadCsv(event.target.files?.[0])} /><p className="crowd-hint">Columns: sourceEventId, count, windowStart, windowEnd, confidence</p>{rows.length ? <><div className="crowd-import-summary"><strong>{rows.length - rows.filter((item) => item.error).length} ready</strong><span>{rows.filter((item) => item.error).length} rejected</span></div><button onClick={() => void approve()}>Approve valid rows</button></> : null}</section></div>
}

const shortId = (value: string) => value.slice(0, 8)
const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const label = (value: string) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
