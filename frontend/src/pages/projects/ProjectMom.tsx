import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { MeetingMinute } from '../../api'
import { Empty, Modal, fmtDate, todayISO, PageHead, inputStyle, ghostStyle } from '../../ui'

export default function ProjectMom() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [mom, setMom] = useState<MeetingMinute[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<MeetingMinute | null>(null)
  const [f, setF] = useState({ title: '', date: todayISO(), attendees: '', notes: '' })

  const load = () => api.projects.mom(pid).then(setMom).catch(() => setMom([]))
  useEffect(() => { load() }, [pid])

  const query = q.trim().toLowerCase()
  const filteredMom = query
    ? mom.filter((m) =>
        m.title.toLowerCase().includes(query) ||
        (m.attendees || '').toLowerCase().includes(query) ||
        (m.notes || '').toLowerCase().includes(query))
    : mom

  const save = async () => {
    try {
      if (!f.title.trim()) { setErr('Title required'); return }
      const m: MeetingMinute = { id: editing?.id ?? 0, projectId: pid, title: f.title, date: f.date, attendees: f.attendees, notes: f.notes }
      await api.projects.saveMom(pid, m)
      setOpen(false); setEditing(null); load()
    } catch (e) { setErr(String(e)) }
  }

  const openAdd = () => { setEditing(null); setErr(''); setF({ title: '', date: todayISO(), attendees: '', notes: '' }); setOpen(true) }
  const openEdit = (m: MeetingMinute) => { setEditing(m); setErr(''); setF({ title: m.title, date: m.date, attendees: m.attendees || '', notes: m.notes || '' }); setOpen(true) }

  const remove = async (m: MeetingMinute) => {
    if (!confirm(`Delete meeting "${m.title}"?`)) return
    try {
      await api.projects.deleteMom(pid, m.id)
      load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="📝" title="MOM" sub="Minutes of meeting" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />
      <div className="toolbar"><button className="btn ghost" onClick={openAdd}>＋ Add MOM</button></div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search meetings (title, attendees, notes)…"
        style={{ ...inputStyle, width: '100%', margin: '8px 0 16px' }}
      />

      {filteredMom.length === 0 ? <Empty>{q ? `No meetings match "${q}".` : 'No meetings recorded.'}</Empty> : filteredMom.map((m) => (
        <div className="card" key={m.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h2 style={{ margin: 0 }}>{m.title} <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>— {fmtDate(m.date)}</span></h2>
            <div style={{ whiteSpace: 'nowrap' }}>
              <button style={ghostStyle} onClick={() => openEdit(m)} title="Edit">✎</button>{' '}
              <button style={ghostStyle} onClick={() => remove(m)} title="Delete">🗑</button>
            </div>
          </div>
          {m.attendees && <div className="muted" style={{ marginBottom: 8 }}><b>Attendees:</b> {m.attendees}</div>}
          <div style={{ whiteSpace: 'pre-wrap' }}>{m.notes || <span className="muted">No notes.</span>}</div>
        </div>
      ))}

      {open && (
        <Modal title={editing ? 'Edit MOM' : 'Add MOM'} onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.title} placeholder="Title *" onChange={(e) => setF({ ...f, title: e.target.value })} />
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          <input value={f.attendees} placeholder="Attendees (comma separated)" onChange={(e) => setF({ ...f, attendees: e.target.value })} />
          <textarea value={f.notes} placeholder="Notes" onChange={(e) => setF({ ...f, notes: e.target.value })} />
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={save}>{editing ? 'Save Changes' : 'Save'}</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}