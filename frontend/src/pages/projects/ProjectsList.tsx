import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { Project } from '../../api'
import { Empty, Modal, money, PageHead } from '../../ui'

const STATUS = ['Ongoing', 'Completed', 'Not Started', 'On Hold']

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', address: '', value: 0, status: 'Ongoing' })

  const load = () => api.projects.list().then(setProjects).catch(() => setProjects([]))
  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      if (!f.name.trim()) { setErr('Project name is required'); return }
      const p = await api.projects.save({ id: 0, name: f.name, address: f.address, value: f.value, status: f.status, createdAt: new Date().toISOString().slice(0, 10) })
      nav(`/projects/${p.id}`)
    } catch (e) { setErr(String(e)) }
  }

  const remove = async (p: Project) => {
    if (!confirm(`Delete project "${p.name}" and all its data?`)) return
    await api.projects.remove(p.id)
    load()
  }

  return (
    <>
      <PageHead icon="🏗️" title="Projects" sub="Construction & interior-design project tracking"
        right={<button className="btn" onClick={() => { setErr(''); setOpen(true) }}>＋ New Project</button>} />

      {projects.length === 0 ? <Empty>No projects yet — tap "New Project".</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Project</th><th>Status</th><th className="num">Value</th><th></th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="cat"><Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>{p.name}</Link></td>
                  <td><span className="muted">{p.status}</span></td>
                  <td className="num">{money(p.value)}</td>
                  <td style={{ textAlign: 'right' }}><button className="del-btn" onClick={() => remove(p)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="New Project" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.name} placeholder="Project name *" onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="form-row">
            <input value={f.address} placeholder="Address" onChange={(e) => setF({ ...f, address: e.target.value })} />
            <input type="number" min={0} value={f.value || ''} placeholder="Contract value ₹" onChange={(e) => setF({ ...f, value: Number(e.target.value) })} />
          </div>
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            {STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={create}>Create</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}