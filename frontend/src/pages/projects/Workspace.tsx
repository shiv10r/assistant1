import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectDetail } from '../../api'
import { Empty, money, PageHead } from '../../ui'

const CARDS: [string, string, string][] = [
  ['/party', '👥', 'Party'], ['/txn', '💸', 'Transaction'], ['/site', '🏗️', 'Site'],
  ['/tasks', '📋', 'Task'], ['/attendance', '⏱️', 'Attendance'], ['/material', '🧱', 'Material'],
  ['/mom', '📝', 'MOM'], ['/design', '🎨', 'Design'], ['/files', '📁', 'Files'],
]

export default function Workspace() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [d, setD] = useState<ProjectDetail | null>(null)
  const [err, setErr] = useState('')
  const [dprOpen, setDprOpen] = useState(false)
  const [pr, setPr] = useState('0')
  const [note, setNote] = useState('')

  const load = () => api.projects.detail(pid).then(setD).catch((e) => setErr(String(e)))
  useEffect(() => { load() }, [pid])

  const addDpr = async () => {
    try {
      await api.projects.saveLog(pid, { id: 0, projectId: pid, date: new Date().toISOString().slice(0, 10), progressPercent: Number(pr), note })
      setDprOpen(false); setNote(''); setPr('0'); load()
    } catch (e) { setErr(String(e)) }
  }

  if (err) return <Empty>⚠️ {err}</Empty>
  if (!d) return <Empty>Loading…</Empty>
  const p = d.project

  return (
    <>
      <PageHead icon="🏗️" title={p.name} sub={p.status}
        right={<button className="btn ghost" onClick={() => nav('/projects')}>← Back</button>} />

      <div className="card" style={{ background: 'var(--grad)', color: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
        <div className="muted" style={{ color: 'rgba(255,255,255,.9)' }}>{p.status} · {p.address || 'No address'}</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{money(p.value)}</div>
      </div>

      <div className="grid3" style={{ marginBottom: 16 }}>
        {CARDS.map(([to, icon, label]) => (
          <Link key={to} to={`/projects/${pid}${to}`} className="grid-card">
            <div className="gc-icon">{icon}</div><div className="gc-label">{label}</div>
          </Link>
        ))}
      </div>

      <div className="chip" style={{ marginBottom: 12 }}>
        <button className="btn ghost" onClick={() => setDprOpen((o) => !o)}>＋ Add DPR</button>
      </div>

      {dprOpen && (
        <div className="card">
          <h2>＋ Add DPR</h2>
          <div className="form-row">
            <input type="number" min={0} max={100} value={pr} placeholder="Progress %" onChange={(e) => setPr(e.target.value)} />
            <input value={note} placeholder="Note" onChange={(e) => setNote(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={addDpr}>Save DPR</button>
            <button className="btn ghost" onClick={() => setDprOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {d.logs.length > 0 && (
        <div className="card">
          <h2>📅 Daily Progress Reports</h2>
          <table className="main-table">
            <thead><tr><th>Date</th><th>Progress</th><th>Note</th></tr></thead>
            <tbody>{d.logs.map((l) => (
              <tr key={l.id}><td className="muted">{l.date.slice(8, 10)}/{l.date.slice(5, 7)}/{l.date.slice(2, 4)}</td><td style={{ color: 'var(--accent)' }}>{l.progressPercent}%</td><td className="muted">{l.note || '—'}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  )
}