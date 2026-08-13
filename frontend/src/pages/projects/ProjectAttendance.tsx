import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { AttendanceRecord, SiteParty } from '../../api'
import { Empty, fmtDate, Modal, money, num, PageHead } from '../../ui'

const ROLES = ['Site Staff', 'Sub-contractor', 'Material Supplier']
const STATUSES = ['Present', 'Half-Day', 'Absent']

function blankWorker(pid: number): SiteParty {
  return { id: 0, projectId: pid, name: '', phone: '', role: 'Site Staff', openingBalance: 0, balanceType: 'pending', currentBalance: 0, isActive: true, dailyRate: 0 }
}

export default function ProjectAttendance() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10))
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [parties, setParties] = useState<SiteParty[]>([])
  const [hours, setHours] = useState<Record<number, string>>({})
  const [savingHour, setSavingHour] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState('')
  const [w, setWState] = useState<SiteParty>(blankWorker(pid))
  const setW = (k: keyof SiteParty, v: unknown) => setWState((p) => ({ ...p, [k]: v }))

  const load = () => {
    api.projects.detail(pid).then((d) => setParties(d.parties)).catch(() => {})
    refresh(day)
  }
  const refresh = (dt: string) => api.projects.attendance(pid, dt).then((rs) => {
    setRecords(rs)
    setHours(Object.fromEntries(rs.filter((r) => r.hoursLogged > 0).map((r) => [r.partyId, String(r.hoursLogged)])))
  }).catch(() => setRecords([]))
  useEffect(() => { load() }, [pid])

  const shift = (n: number) => {
    const d = new Date(day + 'T00:00:00')
    d.setDate(d.getDate() + n)
    const next = d.toISOString().slice(0, 10)
    setDay(next); refresh(next)
  }

  const status = (p: SiteParty) => records.find((r) => r.partyId === p.id)?.status ?? null

  const mark = async (p: SiteParty, s: string) => {
    if (!p.id) return
    await api.projects.setAttendanceStatus(pid, { partyId: p.id, date: day, status: s })
    if (s === 'Present' && !records.find((r) => r.partyId === p.id)) {
      await api.projects.setAttendanceHours(pid, { partyId: p.id, date: day, hours: 8 })
    }
    refresh(day)
  }

  const saveHours = async (p: SiteParty) => {
    const v = Number(hours[p.id]) || 0
    setSavingHour(p.id)
    try {
      await api.projects.setAttendanceHours(pid, { partyId: p.id, date: day, hours: v })
      await api.projects.setAttendanceStatus(pid, { partyId: p.id, date: day, status: records.find((r) => r.partyId === p.id)?.status ?? 'Present' })
      refresh(day)
    } finally {
      setSavingHour(null)
    }
  }

  const markAll = async (s: string) => {
    for (const p of parties) await mark(p, s)
    refresh(day)
  }

  const saveWorker = async () => {
    try {
      if (!w.name.trim()) { setErr('Name is required'); return }
      const saved = await api.projects.saveParty(pid, w)
      await api.projects.setAttendanceStatus(pid, { partyId: saved.id, date: day, status: 'Present' })
      await api.projects.setAttendanceHours(pid, { partyId: saved.id, date: day, hours: 8 })
      setOpen(false); setWState(blankWorker(pid)); load()
    } catch (e) { setErr(String(e)) }
  }

  const present = records.filter((r) => r.status === 'Present').length
  const half = records.filter((r) => r.status === 'Half-Day').length
  const absent = records.filter((r) => r.status === 'Absent').length
  const totalHours = records.reduce((s, r) => s + r.hoursLogged, 0)
  const wages = records.reduce((s, r) => {
    const p = parties.find((x) => x.id === r.partyId)
    if (!p || !p.dailyRate) return s
    return s + p.dailyRate * (r.status === 'Half-Day' ? 0.5 : r.status === 'Present' ? 1 : 0)
  }, 0)

  return (
    <>
      <PageHead icon="⏱️" title="Attendance" sub="Daily site attendance & wages" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="toolbar">
        <button className="btn ghost" onClick={() => shift(-1)}>← Prev</button>
        <b>{fmtDate(day)}</b>
        <button className="btn ghost" onClick={() => { const t = new Date().toISOString().slice(0, 10); setDay(t); refresh(t) }}>Today</button>
        <button className="btn ghost" onClick={() => shift(1)}>Next →</button>
        {parties.length > 0 && (
          <>
            <span className="muted" style={{ marginLeft: 8 }}>Mark all</span>
            {STATUSES.map((s) => <button key={s} className="btn ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => markAll(s)}>{s}</button>)}
          </>
        )}
        <button className="btn ghost" style={{ marginLeft: 'auto' }} onClick={() => { setWState(blankWorker(pid)); setErr(''); setOpen(true) }}>＋ Add Worker</button>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">PRESENT</div><div className="kpi-value" style={{ color: '#2E8B57' }}>{present}</div></div>
        <div className="kpi"><div className="kpi-label">HALF-DAY</div><div className="kpi-value">{half}</div></div>
        <div className="kpi"><div className="kpi-label">ABSENT</div><div className="kpi-value" style={{ color: '#E05C7A' }}>{absent}</div></div>
        <div className="kpi"><div className="kpi-label">TOTAL HOURS</div><div className="kpi-value">{num(totalHours)} hr</div></div>
        <div className="kpi"><div className="kpi-label">TODAY WAGES</div><div className="kpi-value accent">{money(Math.round(wages))}</div></div>
      </div>

      {parties.length === 0 ? (
        <>
          <Empty>No workers added yet. Use "＋ Add Worker" to start tracking attendance.</Empty>
        </>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead>
              <tr>
                <th>Worker</th><th>Role</th><th className="num">Rate</th>
                <th>Hours</th><th className="num">Status</th>
              </tr>
            </thead>
            <tbody>{parties.map((p) => (
              <tr key={p.id}>
                <td className="cat">{p.name}</td>
                <td className="muted">{p.role}</td>
                <td className="num muted">{p.dailyRate ? money(p.dailyRate) : '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number" min={0} step={0.5} value={hours[p.id] ?? ''} placeholder="0"
                      style={{ width: 64, padding: '6px 8px' }}
                      onChange={(e) => setHours({ ...hours, [p.id]: e.target.value })}
                      onBlur={() => saveHours(p)}
                    />
                    {savingHour === p.id && <span className="muted" style={{ fontSize: 11 }}>saving…</span>}
                  </div>
                </td>
                <td className="num">
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    {STATUSES.map((s) => (
                      <button key={s} className={status(p) === s ? 'btn' : 'btn ghost'}
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => mark(p, s)}>{s}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Add Worker" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={w.name} placeholder="Name *" onChange={(e) => setW('name', e.target.value)} />
            <select value={w.role} onChange={(e) => setW('role', e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </div>
          <div className="form-row">
            <input value={w.phone} placeholder="Phone" onChange={(e) => setW('phone', e.target.value)} />
            <input type="number" min={0} step="0.01" value={w.dailyRate || ''} placeholder="Daily rate ₹" onChange={(e) => setW('dailyRate', Number(e.target.value))} />
          </div>
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={saveWorker}>Save & Mark Present</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}