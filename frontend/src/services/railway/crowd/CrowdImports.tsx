import { useEffect, useState } from 'react'
import { FiCheckCircle, FiUploadCloud } from 'react-icons/fi'
import { crowdApi, type CrowdSource, type SubmitCrowdObservation } from './crowd.types'

type CsvRow = SubmitCrowdObservation & { error?: string }

export default function CrowdImports() {
  const [sources, setSources] = useState<CrowdSource[]>([])
  const [sourceId, setSourceId] = useState('')
  const [count, setCount] = useState('')
  const [rows, setRows] = useState<CsvRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const result = await crowdApi.sources()
    setSources(result.data ?? [])
    setError(result.error?.message ?? '')
    if (result.data?.[0]?.id) setSourceId(result.data[0].id)
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const source = sources.find((s) => s.id === sourceId)

  async function submitManual(event: React.FormEvent) {
    event.preventDefault()
    if (!source) return
    const now = new Date()
    const result = await crowdApi.submit({
      divisionId: source.divisionId, sourceId, sourceEventId: crypto.randomUUID(),
      windowStart: new Date(now.getTime() - 60_000).toISOString(), windowEnd: now.toISOString(),
      count: Number(count), confidence: 1, qualityFlags: ['manual']
    })
    if (result.error) setError(result.error.message)
    else { setCount(''); await load() }
  }

  async function loadCsv(file?: File) {
    if (!file || !source) return
    const text = await file.text()
    const lines = text.trim().split(/\r?\n/).slice(1)
    setRows(lines.map((line, index) => {
      const [sourceEventId, countValue, windowStart, windowEnd, confidence = '1'] = line.split(',').map((c) => c.trim())
      const parsed = Number(countValue)
      return { divisionId: source.divisionId, sourceId, sourceEventId: sourceEventId || `row-${index + 1}`, count: parsed, windowStart, windowEnd, confidence: Number(confidence), qualityFlags: ['csv'], error: !sourceEventId || !Number.isFinite(parsed) || !windowStart || !windowEnd ? 'Missing or invalid required value' : undefined }
    }))
  }

  async function approve() {
    for (const row of rows.filter((r) => !r.error)) {
      const result = await crowdApi.submit(row)
      if (result.error) setError(result.error.message)
    }
    setRows([])
    await load()
  }

  if (loading) return <div role="status">Loading sources...</div>

  return <div className="railway-page crowd-page">
    <header className="crowd-header">
      <div><span className="railway-eyebrow">Station operations</span><h1>Manual & CSV imports</h1><p>Fallback manual counts and staged CSV ingestion when live adapters are unavailable.</p></div>
    </header>
    {error ? <div className="railway-panel crowd-error" role="alert">{error}</div> : null}
    <div className="crowd-split">
      <section className="railway-panel">
        <div className="railway-panel-head"><div><span>Fallback channel</span><h2>Manual count</h2></div></div>
        <form className="crowd-form" onSubmit={submitManual}>
          <label><span>Source</span><select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>{sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label><span>Aggregate count</span><input min="0" required type="number" value={count} onChange={(e) => setCount(e.target.value)} /></label>
          <button type="submit">Submit count</button>
        </form>
      </section>
      <section className="railway-panel">
        <div className="railway-panel-head"><div><span>Staged ingestion</span><h2>CSV review</h2><FiUploadCloud /></div></div>
        <input accept=".csv,text/csv" type="file" onChange={(e) => void loadCsv(e.target.files?.[0])} />
        <p className="crowd-hint">Columns: sourceEventId, count, windowStart, windowEnd, confidence</p>
        {rows.length ? (
          <div>
            <div className="crowd-import-summary"><strong>{rows.filter((r) => !r.error).length} ready</strong><span>{rows.filter((r) => r.error).length} rejected</span></div>
            <div className="railway-table-wrap"><div className="crowd-table"><div className="crowd-row head"><span>SourceEventId</span><span>Count</span><span>Window</span><span>Confidence</span><span>Status</span></div>
              {rows.map((row) => <div className={`crowd-row ${row.error ? 'crowd-error-row' : ''}`} key={row.sourceEventId}><code>{row.sourceEventId}</code><strong>{row.count}</strong><span>{row.windowStart} → {row.windowEnd}</span><span>{Math.round(row.confidence * 100)}%</span><span>{row.error ? <span className="crowd-error">{row.error}</span> : <FiCheckCircle />}</span></div>)}
            </div></div>
            <button onClick={() => void approve()}>Approve valid rows</button>
          </div>
        ) : null}
      </section>
    </div>
  </div>
}