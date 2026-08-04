import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectDetail } from '../../api'
import { Empty, num, PageHead } from '../../ui'

export default function ProjectSite() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [d, setD] = useState<ProjectDetail | null>(null)
  const [err, setErr] = useState('')

  const load = () => api.projects.detail(pid).then(setD).catch((e) => setErr(String(e)))
  useEffect(() => { load() }, [pid])

  if (err) return <Empty>⚠️ {err}</Empty>
  if (!d) return <Empty>Loading…</Empty>

  const present = d.logs.length ? d.logs[0] : null
  const ongoingTasks = d.tasks.filter((t) => t.status === 'Ongoing')
  const matReceived = d.materials.filter((m) => m.kind === 'Received').reduce((s, m) => s + m.quantity, 0)
  const matUsed = d.materials.filter((m) => m.kind === 'Delivered').reduce((s, m) => s + m.quantity, 0)

  return (
    <>
      <PageHead icon="🏗️" title="Site" sub={d.project.name} right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">LATEST PROGRESS</div><div className="kpi-value accent">{present ? `${present.progressPercent}%` : '—'}</div></div>
        <div className="kpi"><div className="kpi-label">MATERIAL RECEIVED</div><div className="kpi-value">{num(matReceived)}</div></div>
        <div className="kpi"><div className="kpi-label">MATERIAL USED</div><div className="kpi-value">{num(matUsed)}</div></div>
      </div>

      <div className="card">
        <h2>📋 Ongoing Tasks</h2>
        {ongoingTasks.length === 0 ? <Empty>No ongoing tasks.</Empty> : (
          <table className="main-table">
            <thead><tr><th>Task</th><th>Members</th><th>Progress</th></tr></thead>
            <tbody>{ongoingTasks.map((t) => (
              <tr key={t.id}>
                <td className="cat">{t.name}</td>
                <td className="muted">{t.members || '—'}</td>
                <td><progress value={t.progressPercent} max={100} style={{ width: 120 }} /> {t.progressPercent}%</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  )
}