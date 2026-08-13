import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { MeetingMinute } from '../../api'
import { Empty, Modal, fmtDate, todayISO, PageHead } from '../../ui'

export default function ProjectMom() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [mom, setMom] = useState<MeetingMinute[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ title: '', date: todayISO(), attendees: '', notes: '' })

  const load = () => api.projects.mom(pid).then(setMom).catch(() => setMom([]))
  useEffect(() => { load() }, [pid])

  const save = async () => {
    try {
      if (!f.title.trim()) { setErr('Title required'); return }
      const m: MeetingMinute = { id: 0, projectId: pid, title: f.title, date: f.date, attendees: f.attendees, notes: f.notes }
      await api.projects.saveMom(pid, m)
      setOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="📝" title="MOM" sub="Minutes of meeting" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />
      <div className="toolbar"><button className="btn ghost" onClick={() => { setErr(''); setF({ title: '', date: todayISO(), attendees: '', notes: '' }); setOpen(true) }}>＋ Add MOM</button></div>

      {mom.length === 0 ? <Empty>No meetings recorded.</Empty> : mom.map((m) => (
        <div className="card" key={m.id}>
          <h2>{m.title} <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>— {fmtDate(m.date)}</span></h2>
          {m.attendees && <div className="muted" style={{ marginBottom: 8 }}><b>Attendees:</b> {m.attendees}</div>}
          <div style={{ whiteSpace: 'pre-wrap' }}>{m.notes || <span className="muted">No notes.</span>}</div>
        </div>
      ))}

      {open && (
        <Modal title="Add MOM" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.title} placeholder="Title *" onChange={(e) => setF({ ...f, title: e.target.value })} />
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          <input value={f.attendees} placeholder="Attendees (comma separated)" onChange={(e) => setF({ ...f, attendees: e.target.value })} />
          <textarea value={f.notes} placeholder="Notes" onChange={(e) => setF({ ...f, notes: e.target.value })} />
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