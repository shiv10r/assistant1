import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectDetail } from '../../api'
import { Empty, Modal, num, PageHead, todayISO } from '../../ui'

export default function ProjectSite() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [d, setD] = useState<ProjectDetail | null>(null)
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [dpr, setDpr] = useState({ date: todayISO(), progress: 0, note: '' })
  const [taskOpen, setTaskOpen] = useState<number | null>(null)
  const [taskPct, setTaskPct] = useState(0)

  const load = () => api.projects.detail(pid).then(setD).catch((e) => setErr(String(e)))
  useEffect(() => { load() }, [pid])

  if (err) return <Empty>⚠️ {err}</Empty>
  if (!d) return <Empty>Loading…</Empty>

  const present = d.logs.length ? d.logs[0] : null
  const ongoingTasks = d.tasks.filter((t) => t.status === 'Ongoing')
  const matReceived = d.materials.filter((m) => m.kind === 'Received').reduce((s, m) => s + m.quantity, 0)
  const matUsed = d.materials.filter((m) => m.kind === 'Delivered').reduce((s, m) => s + m.quantity, 0)
  const hasMap = d.project.latitude && d.project.longitude

  const saveDpr = async () => {
    try {
      await api.projects.saveLog(pid, { id: 0, projectId: pid, date: dpr.date, progressPercent: dpr.progress, note: dpr.note })
      setOpen(false); setDpr({ date: todayISO(), progress: 0, note: '' }); load()
    } catch (e) { setErr(String(e)) }
  }

  const updateTask = async (t: any) => {
    try {
      await api.projects.saveTask(pid, { ...t, progressPercent: taskPct })
      setTaskOpen(null); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="🏗️" title="Site" sub={d.project.name} right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">LATEST PROGRESS</div><div className="kpi-value accent">{present ? `${present.progressPercent}%` : '—'}</div></div>
        <div className="kpi"><div className="kpi-label">MATERIAL RECEIVED</div><div className="kpi-value">{num(matReceived)}</div></div>
        <div className="kpi"><div className="kpi-label">MATERIAL USED</div><div className="kpi-value">{num(matUsed)}</div></div>
        <div className="kpi"><div className="kpi-label">SITE LOGS</div><div className="kpi-value">{d.logs.length}</div></div>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={() => { setDpr({ date: todayISO(), progress: present?.progressPercent ?? 0, note: '' }); setErr(''); setOpen(true) }}>＋ Log Today&apos;s Progress</button>
        {hasMap && (
          <a className="btn ghost" target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${d.project.latitude},${d.project.longitude}`}>📍 Open in Maps</a>
        )}
      </div>

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
        {hasMap && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              title="site-map" style={{ width: '100%', height: 300, border: 0, display: 'block' }}
              src={`https://maps.google.com/maps?q=${d.project.latitude},${d.project.longitude}&z=15&output=embed`}
              loading="lazy"
            />
          </div>
        )}

        <div className="card">
          <h2>📋 Ongoing Tasks</h2>
          {ongoingTasks.length === 0 ? <Empty>No ongoing tasks.</Empty> : (
            <table className="main-table">
              <thead><tr><th>Task</th><th>Members</th><th>Progress</th><th></th></tr></thead>
              <tbody>{ongoingTasks.map((t) => (
                <tr key={t.id}>
                  <td className="cat">{t.name}</td>
                  <td className="muted">{t.members || '—'}</td>
                  <td><progress value={t.progressPercent} max={100} style={{ width: 90 }} /> {t.progressPercent}%</td>
                  <td><button className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setTaskOpen(t.id); setTaskPct(t.progressPercent) }}>Update</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h2>🗓️ Site Log (DPR)</h2>
        {d.logs.length === 0 ? <Empty>No progress logs yet. Add one above.</Empty> : (
          <table className="main-table">
            <thead><tr><th>Date</th><th>Progress</th><th>Note</th></tr></thead>
            <tbody>{[...d.logs].reverse().map((l) => (
              <tr key={l.id}>
                <td className="cat">{l.date.slice(8, 10)}/{l.date.slice(5, 7)}/{l.date.slice(0, 4)}</td>
                <td><progress value={l.progressPercent} max={100} style={{ width: 90 }} /> {l.progressPercent}%</td>
                <td className="muted">{l.note || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {open && (
        <Modal title="Log Site Progress" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input type="date" value={dpr.date} onChange={(e) => setDpr({ ...dpr, date: e.target.value })} />
            <input type="range" min={0} max={100} value={dpr.progress} onChange={(e) => setDpr({ ...dpr, progress: Number(e.target.value) })} />
          </div>
          <div className="kpi-value accent" style={{ textAlign: 'center' }}>{dpr.progress}%</div>
          <input value={dpr.note} placeholder="What happened on site today?" onChange={(e) => setDpr({ ...dpr, note: e.target.value })} />
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={saveDpr}>Save</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {taskOpen !== null && d.tasks.find((t) => t.id === taskOpen) && (
        <Modal title="Update Task Progress" onClose={() => setTaskOpen(null)}>
          <p className="muted">{d.tasks.find((t) => t.id === taskOpen)?.name}</p>
          <input type="range" min={0} max={100} value={taskPct} onChange={(e) => setTaskPct(Number(e.target.value))} />
          <div className="kpi-value accent" style={{ textAlign: 'center' }}>{taskPct}%</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={() => updateTask(d.tasks.find((t) => t.id === taskOpen))}>Save</button>
            <button className="btn ghost" onClick={() => setTaskOpen(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}