import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectTask } from '../../api'
import { Empty, Modal, PageHead } from '../../ui'

const STATUS = ['Not Started', 'Ongoing', 'Completed']

export default function ProjectTasks() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [err, setErr] = useState('')
  const [statusF, setStatusF] = useState('')
  const [memberF, setMemberF] = useState('')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<ProjectTask>(blank(pid))
  const set = (k: keyof ProjectTask, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  function blank(pid: number): ProjectTask {
    const t = new Date().toISOString().slice(0, 10)
    return { id: 0, projectId: pid, name: '', status: 'Not Started', members: '', location: '', durationDays: 1, startDate: t, endDate: t, estQuantity: 0, progressPercent: 0, imagePath: '', link: '' }
  }

  const load = () => api.projects.detail(pid).then((d) => setTasks(d.tasks)).catch(() => setTasks([]))
  useEffect(() => { load() }, [pid])

  const all = tasks
  const notStarted = all.filter((t) => t.status === 'Not Started').length
  const ongoing = all.filter((t) => t.status === 'Ongoing').length
  const overall = all.length ? Math.round(all.reduce((s, t) => s + t.progressPercent, 0) / all.length) : 0

  const filtered = all.filter((t) =>
    (!statusF || t.status === statusF) && (!memberF || t.members.toLowerCase().includes(memberF.toLowerCase())))

  const save = async () => {
    try {
      if (!f.name.trim()) { setErr('Name is required'); return }
      const d = new Date(f.startDate)
      d.setDate(d.getDate() + f.durationDays - 1)
      const endDate = d.toISOString().slice(0, 10)
      await api.projects.saveTask(pid, { ...f, endDate })
      setOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="📋" title="Tasks" sub="Task tracking" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">NOT STARTED</div><div className="kpi-value">{notStarted}</div></div>
        <div className="kpi"><div className="kpi-label">ONGOING</div><div className="kpi-value">{ongoing}</div></div>
        <div className="kpi"><div className="kpi-label">OVERALL PROGRESS</div><div className="kpi-value accent">{overall}%</div></div>
      </div>

      <div className="toolbar">
        <button className="btn ghost" onClick={() => { setF(blank(pid)); setErr(''); setOpen(true) }}>＋ Add Task</button>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="">All statuses</option>{STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="Filter by member" value={memberF} onChange={(e) => setMemberF(e.target.value)} />
      </div>

      {filtered.length === 0 ? <Empty>No tasks match.</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Task</th><th>Status</th><th>Members</th><th>Progress</th></tr></thead>
            <tbody>{filtered.map((t) => (
              <tr key={t.id}>
                <td className="cat">{t.name}<div className="muted">{t.location || ''}</div></td>
                <td><span className="muted">{t.status}</span></td>
                <td className="muted">{t.members || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <progress value={t.progressPercent} max={100} style={{ flex: 1 }} />
                    <span className="muted">{t.progressPercent}%</span>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Add Task" onClose={() => setOpen(false)} wide>
          <div className="form-row">
            <input value={f.name} placeholder="Task name *" onChange={(e) => set('name', e.target.value)} />
            <select value={f.status} onChange={(e) => set('status', e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div className="form-row">
            <input value={f.members} placeholder="Members (comma separated)" onChange={(e) => set('members', e.target.value)} />
            <input value={f.location} placeholder="Location" onChange={(e) => set('location', e.target.value)} />
          </div>
          <div className="form-row">
            <input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} />
            <input type="number" min={1} value={f.durationDays} onChange={(e) => set('durationDays', Number(e.target.value))} />
            <input type="number" min={0} max={100} value={f.progressPercent || ''} placeholder="Progress %" onChange={(e) => set('progressPercent', Number(e.target.value))} />
          </div>
          <input type="number" min={0} value={f.estQuantity || ''} placeholder="Estimated quantity" onChange={(e) => set('estQuantity', Number(e.target.value))} />
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={save}>Save</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}