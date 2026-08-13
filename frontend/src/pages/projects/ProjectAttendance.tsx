import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { AttendancePunch, AttendanceRecord, AttendanceRequest, EmergencyAlert, SiteParty } from '../../api'
import { Empty, fmtDate, Modal, money, num, PageHead } from '../../ui'

const ROLES = ['Site Staff', 'Sub-contractor', 'Material Supplier']
const STATUSES = ['Present', 'Half-Day', 'Absent']
const REQ_KINDS = ['WFH', 'Sick Leave', 'Casual Leave', 'Emergency Leave']

function blankWorker(pid: number): SiteParty {
  return { id: 0, projectId: pid, name: '', phone: '', role: 'Site Staff', openingBalance: 0, balanceType: 'pending', currentBalance: 0, isActive: true, dailyRate: 0 }
}

function getPos(): Promise<{ lat: number; lng: number; acc: number }> {
  return new Promise((res) => {
    if (!navigator.geolocation) return res({ lat: 0, lng: 0, acc: 0 })
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      () => res({ lat: 0, lng: 0, acc: 0 }),
      { enableHighAccuracy: true, timeout: 9000 }
    )
  })
}

function fmtTime(when: string) {
  const d = new Date(when)
  return isNaN(d.getTime()) ? when : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  const [punches, setPunches] = useState<AttendancePunch[]>([])
  const [requests, setRequests] = useState<AttendanceRequest[]>([])
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([])
  const [provider, setProvider] = useState(0)
  const [punchBusy, setPunchBusy] = useState<'In' | 'Out' | null>(null)
  const [sosBusy, setSosBusy] = useState(false)
  const [lastPunch, setLastPunch] = useState<AttendancePunch | null>(null)
  const [reqOpen, setReqOpen] = useState(false)
  const [reqKind, setReqKind] = useState(REQ_KINDS[0])
  const [reqFrom, setReqFrom] = useState(() => new Date().toISOString().slice(0, 10))
  const [reqTo, setReqTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [reqReason, setReqReason] = useState('')

  const load = () => {
    api.projects.detail(pid).then((d) => {
      setParties(d.parties)
      if (!provider && d.parties[0]) setProvider(d.parties[0].id)
    }).catch(() => {})
    refresh(day)
    const today = new Date().toISOString().slice(0, 10)
    api.projects.punches(pid, today).then(setPunches).catch(() => setPunches([]))
    api.projects.requests(pid).then(setRequests).catch(() => setRequests([]))
    api.projects.emergencies(pid).then(setEmergencies).catch(() => setEmergencies([]))
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

  const refreshPunchFeed = () => {
    const today = new Date().toISOString().slice(0, 10)
    api.projects.punches(pid, today).then(setPunches).catch(() => setPunches([]))
    api.projects.requests(pid).then(setRequests).catch(() => setRequests([]))
    api.projects.emergencies(pid).then(setEmergencies).catch(() => setEmergencies([]))
    load()
  }

  const doPunch = async (kind: 'In' | 'Out') => {
    if (!provider) { setErr('Select a worker first'); return }
    setPunchBusy(kind); setErr('')
    try {
      const pos = await getPos()
      const punch = await api.projects.punch(pid, {
        partyId: provider, kind, source: 'Remote',
        latitude: pos.lat, longitude: pos.lng, accuracy: pos.acc,
      })
      setLastPunch(punch)
      refreshPunchFeed()
    } catch (e) { setErr(String(e)) } finally { setPunchBusy(null) }
  }

  const doSos = async () => {
    if (!provider) { setErr('Select a worker first'); return }
    if (!window.confirm('🚨 Raise an emergency SOS with the current GPS location?')) return
    setSosBusy(true); setErr('')
    try {
      const pos = await getPos()
      await api.projects.sos(pid, { partyId: provider, latitude: pos.lat, longitude: pos.lng, accuracy: pos.acc })
      refreshPunchFeed()
    } catch (e) { setErr(String(e)) } finally { setSosBusy(false) }
  }

  const submitRequest = async () => {
    if (!provider) { setErr('Select a worker first'); return }
    if (!reqReason.trim()) { setErr('Add a reason'); return }
    try {
      await api.projects.submitRequest(pid, { partyId: provider, kind: reqKind, dateFrom: reqFrom, dateTo: reqTo, reason: reqReason })
      setReqOpen(false); setReqReason(''); setErr('')
      api.projects.requests(pid).then(setRequests).catch(() => setRequests([]))
    } catch (e) { setErr(String(e)) }
  }

  const decide = async (r: AttendanceRequest, status: string) => {
    await api.projects.decideRequest(pid, r.id, status)
    api.projects.requests(pid).then(setRequests).catch(() => setRequests([]))
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

      <div className="card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 600 }}>Punch for</label>
          <select value={provider} onChange={(e) => setProvider(Number(e.target.value))} style={{ minWidth: 170 }}>
            <option value={0}>Select worker…</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="btn" disabled={!provider || !!punchBusy} onClick={() => doPunch('In')}>
            {punchBusy === 'In' ? 'Punching…' : '⏱ Remote Punch In'}
          </button>
          <button className="btn ghost" disabled={!provider || !!punchBusy} onClick={() => doPunch('Out')}>
            {punchBusy === 'Out' ? 'Punching…' : 'Remote Punch Out'}
          </button>
          <button className="btn ghost" disabled={!provider} onClick={() => { setErr(''); setReqOpen(true) }}>📝 WFH / Leave Request</button>
          <button className="btn danger" disabled={!provider || sosBusy} onClick={doSos}>
            {sosBusy ? 'Sending SOS…' : '🚨 SOS'}
          </button>
          {emergencies.length > 0 && (
            <span style={{ color: '#E05C7A', fontSize: 12.5, fontWeight: 700 }}>🚨 {emergencies.length} active emergency</span>
          )}
          {lastPunch && (
            <span style={{ marginLeft: 'auto', fontSize: 12.5 }}>
              {lastPunch.kind === 'In' ? 'Clocked in' : 'Clocked out'}{' '}at <b>{fmtTime(lastPunch.when)}</b>{' '}
              {lastPunch.inGeofence
                ? <span style={{ color: '#2E8B57' }}>✓ <b>{lastPunch.distanceMeters}m</b> in geofence</span>
                : <span style={{ color: '#E05C7A' }}>⚠ <b>{lastPunch.distanceMeters}m</b> outside geofence</span>}
            </span>
          )}
        </div>
        {err && <div className="muted" style={{ color: '#E05C7A', marginTop: 8, fontSize: 12.5 }}>{err}</div>}
      </div>

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

      {(punches.length > 0 || requests.length > 0) && (
        <div className="card-grid">
          <div className="card" style={{ margin: 0 }}>
            <h2>Today's Punches <span className="muted" style={{ fontWeight: 400 }}>(manual, remote & biometric)</span></h2>
            {punches.length === 0 ? (
              <div className="empty" style={{ padding: '18px 0' }}>No punches recorded today.</div>
            ) : (
              <table className="main-table">
                <thead><tr><th>Time</th><th>Worker</th><th>In/Out</th><th>Source</th><th className="num">Geofence</th></tr></thead>
                <tbody>
                  {punches.map((p) => (
                    <tr key={p.id}>
                      <td className="muted">{fmtTime(p.when)}</td>
                      <td className="cat">{p.partyName}</td>
                      <td>{p.kind === 'In' ? <b style={{ color: '#2E8B57' }}>In</b> : <b style={{ color: '#4B6CF5' }}>Out</b>}</td>
                      <td className="muted">{p.source}</td>
                      <td className="num">
                        {p.inGeofence
                          ? <span style={{ color: '#2E8B57' }}>✓ {num(p.distanceMeters)}m</span>
                          : <span style={{ color: '#E05C7A' }}>⚠ outside</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h2>WFH / Leave Requests</h2>
            {requests.length === 0 ? (
              <div className="empty" style={{ padding: '18px 0' }}>No requests yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.map((r) => (
                  <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', background: 'var(--surface2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <b>{r.kind}</b>
                      <span className="muted">— {r.partyName}</span>
                      <span className="muted">{fmtDate(r.dateFrom)} → {fmtDate(r.dateTo)}</span>
                      <span
                        style={{
                          marginLeft: 'auto', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          color: r.status === 'Approved' ? '#2E8B57' : r.status === 'Rejected' ? '#E05C7A' : '#B7791F',
                          background: r.status === 'Approved' ? 'rgba(46,139,87,.14)' : r.status === 'Rejected' ? 'rgba(224,92,122,.14)' : 'rgba(183,121,31,.14)',
                        }}
                      >{r.status}</span>
                    </div>
                    {r.reason && <div className="muted" style={{ marginTop: 4, fontSize: 12.5 }}>{r.reason}</div>}
                    {r.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => decide(r, 'Approved')}>Approve</button>
                        <button className="btn ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => decide(r, 'Rejected')}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {reqOpen && (
        <Modal title="WFH / Leave Request" onClose={() => setReqOpen(false)}>
          <div className="form-row">
            <select value={reqKind} onChange={(e) => setReqKind(e.target.value)}>
              {REQ_KINDS.map((k) => <option key={k}>{k}</option>)}
            </select>
            <select value={provider} onChange={(e) => setProvider(Number(e.target.value))}>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label style={{ fontSize: 12, color: 'var(--dim)' }}>From</label>
            <input type="date" value={reqFrom} onChange={(e) => setReqFrom(e.target.value)} />
            <label style={{ fontSize: 12, color: 'var(--dim)' }}>To</label>
            <input type="date" value={reqTo} onChange={(e) => setReqTo(e.target.value)} />
          </div>
          <textarea
            rows={2} placeholder="Reason…" value={reqReason}
            onChange={(e) => setReqReason(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', fontSize: 14 }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={submitRequest}>Submit Request</button>
            <button className="btn ghost" onClick={() => setReqOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}