import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { AttendanceRecord, SiteParty } from '../../api'
import { Empty, fmtDate, PageHead } from '../../ui'

export default function ProjectAttendance() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10))
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [parties, setParties] = useState<SiteParty[]>([])

  const load = () => {
    api.projects.detail(pid).then((d) => setParties(d.parties)).catch(() => {})
    refresh(day)
  }
  const refresh = (dt: string) => api.projects.attendance(pid, dt).then(setRecords).catch(() => setRecords([]))
  useEffect(() => { load() }, [pid])

  const shift = (n: number) => {
    const d = new Date(day + 'T00:00:00')
    d.setDate(d.getDate() + n)
    const next = d.toISOString().slice(0, 10)
    setDay(next); refresh(next)
  }

  const status = (p: SiteParty) => records.find((r) => r.partyId === p.id)?.status ?? 'Absent'
  const mark = async (p: SiteParty, s: string) => {
    if (p.id) await api.projects.setAttendanceStatus(pid, { partyId: p.id, date: day, status: s })
    refresh(day)
  }

  return (
    <>
      <PageHead icon="⏱️" title="Attendance" sub="Daily site attendance" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="toolbar">
        <button className="btn ghost" onClick={() => shift(-1)}>← Prev</button>
        <b>{fmtDate(day)}</b>
        <button className="btn ghost" onClick={() => shift(1)}>Next →</button>
      </div>

      {parties.length === 0 ? <Empty>No site parties to mark attendance.</Empty> : (
        <div className="card">
          <table className="main-table">
            <thead><tr><th>Party</th><th>Role</th><th className="num">Hours</th><th>Status</th></tr></thead>
            <tbody>{parties.map((p) => (
              <tr key={p.id}>
                <td className="cat">{p.name}</td>
                <td className="muted">{p.role}</td>
                <td className="num muted">{records.find((r) => r.partyId === p.id)?.hoursLogged ?? 0} hrs</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Present', 'Absent'].map((s) => (
                      <button key={s} className={status(p) === s ? 'btn' : 'btn ghost'} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => mark(p, s)}>{s}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  )
}