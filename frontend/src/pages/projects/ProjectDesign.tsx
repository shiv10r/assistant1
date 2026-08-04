import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { DesignFile } from '../../api'
import { Empty, Modal, fmtDate, todayISO, PageHead } from '../../ui'

const CATS = ['2D Layout', '3D Layout', 'Production Files']

export default function ProjectDesign() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [cat, setCat] = useState('2D Layout')
  const [design, setDesign] = useState<DesignFile[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', note: '', date: todayISO() })

  const load = () => api.projects.design(pid).then(setDesign).catch(() => setDesign([]))
  useEffect(() => { load() }, [pid])

  const shown = design.filter((d) => d.category === cat)

  const save = async () => {
    try {
      if (!f.name.trim()) { setErr('Name required'); return }
      const d: DesignFile = { id: 0, projectId: pid, category: cat, name: f.name, imagePath: '', note: f.note, date: f.date }
      await api.projects.saveDesign(pid, d)
      setOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="🎨" title="Design Files" sub="Layouts & production files" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />
      <div className="tabs">
        {CATS.map((c) => <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="toolbar"><button className="btn ghost" onClick={() => { setErr(''); setF({ name: '', note: '', date: todayISO() }); setOpen(true) }}>＋ Add File</button></div>

      {shown.length === 0 ? <Empty>No {cat} files.</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Name</th><th>Date</th><th>Note</th></tr></thead>
            <tbody>{shown.map((d) => (
              <tr key={d.id}><td className="cat">{d.name}</td><td className="muted">{fmtDate(d.date)}</td><td className="muted">{d.note || '—'}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Add Design File" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.name} placeholder="Name *" onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          <input value={f.note} placeholder="Note" onChange={(e) => setF({ ...f, note: e.target.value })} />
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