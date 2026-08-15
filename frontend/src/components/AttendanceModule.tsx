import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Empty, Modal, PageHead } from './ui'
import { useLocalCollection, genId } from '../lib/localStore'
import { fmtDate, money, num, todayISO } from '../lib/utils'

/** Minimal worker shape — any service's staff record satisfies it. */
export interface AttendanceWorker {
  id: string
  name: string
  role: string
  phone?: string
  status?: string
  dailyRate?: number
}

const STATUSES = ['Present', 'Half-Day', 'Absent']
const REQ_KINDS = ['WFH', 'Sick Leave', 'Casual Leave', 'Emergency Leave']

interface AttRecord { id: string; date: string; staffId: string; status: string; hours: number }
interface Punch { id: string; staffId: string; staffName: string; kind: 'In' | 'Out'; when: string; source: string }
interface LeaveRequest { id: string; staffId: string; staffName: string; kind: string; dateFrom: string; dateTo: string; reason: string; status: 'Pending' | 'Approved' | 'Rejected' }
interface Alert { id: string; staffId: string; staffName: string; createdAt: string; note: string; latitude: number; longitude: number; handled: boolean }

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

/**
 * Shared staff-attendance module — the same layout/format as the interior
 * design project attendance page, but backed by localStorage collections so
 * any frontend-only service (school, warehouse) can drop it in.
 */
export default function AttendanceModule({ collection, seed, backTo, title, sub = 'Daily attendance & wages' }: {
  collection: string
  seed: AttendanceWorker[]
  backTo: string
  title: string
  sub?: string
}) {
  const nav = useNavigate()
  const workers = useLocalCollection<AttendanceWorker>(collection, seed)
  const attendance = useLocalCollection<AttRecord>(`${collection}:attendance`, [])
  const punches = useLocalCollection<Punch>(`${collection}:punches`, [])
  const requests = useLocalCollection<LeaveRequest>(`${collection}:requests`, [])
  const alerts = useLocalCollection<Alert>(`${collection}:alerts`, [])

  const [day, setDay] = useState(() => todayISO())
  const [hours, setHours] = useState<Record<string, string>>({})
  const [savingHour, setSavingHour] = useState<string | null>(null)
  const [provider, setProvider] = useState('')
  const [err, setErr] = useState('')
  const [lastPunch, setLastPunch] = useState<Punch | null>(null)
  const [punchBusy, setPunchBusy] = useState<'In' | 'Out' | null>(null)
  const [sosBusy, setSosBusy] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [wName, setWName] = useState('')
  const [wRole, setWRole] = useState('Site Staff')
  const [wPhone, setWPhone] = useState('')
  const [wRate, setWRate] = useState('')

  const [reqOpen, setReqOpen] = useState(false)
  const [reqKind, setReqKind] = useState(REQ_KINDS[0])
  const [reqFrom, setReqFrom] = useState(() => todayISO())
  const [reqTo, setReqTo] = useState(() => todayISO())
  const [reqReason, setReqReason] = useState('')

  const dayRecords = attendance.items.filter((a) => a.date === day)

  // Load hours for the selected day into the edit buffer whenever the day changes.
  useEffect(() => {
    const rs = attendance.items.filter((a) => a.date === day)
    setHours(Object.fromEntries(rs.filter((r) => r.hours > 0).map((r) => [r.staffId, String(r.hours)])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  const shift = (n: number) => {
    const d = new Date(day + 'T00:00:00')
    d.setDate(d.getDate() + n)
    setDay(d.toISOString().slice(0, 10))
  }

  const status = (w: AttendanceWorker) => dayRecords.find((r) => r.staffId === w.id)?.status ?? null

  const upsertRecord = (w: AttendanceWorker, patch: Partial<AttRecord>) => {
    const existing = dayRecords.find((r) => r.staffId === w.id)
    if (existing) attendance.update(existing.id, patch)
    else attendance.add({ id: `${day}_${w.id}`, date: day, staffId: w.id, status: 'Present', hours: 0, ...patch })
  }

  const mark = (w: AttendanceWorker, s: string) => {
    const existing = dayRecords.find((r) => r.staffId === w.id)
    if (existing) attendance.update(existing.id, { status: s })
    else attendance.add({ id: `${day}_${w.id}`, date: day, staffId: w.id, status: s, hours: s === 'Present' ? 8 : 0 })
  }

  const markAll = (s: string) => {
    for (const w of workers.items) mark(w, s)
  }

  const saveHours = (w: AttendanceWorker) => {
    const v = Number(hours[w.id]) || 0
    setSavingHour(w.id)
    upsertRecord(w, { hours: v, status: dayRecords.find((r) => r.staffId === w.id)?.status ?? 'Present' })
    setSavingHour(null)
  }

  const doPunch = async (kind: 'In' | 'Out') => {
    const w = workers.items.find((x) => x.id === provider)
    if (!w) { setErr('Select a worker first'); return }
    setPunchBusy(kind); setErr('')
    const punch: Punch = { id: genId(), staffId: w.id, staffName: w.name, kind, when: new Date().toISOString(), source: 'Remote' }
    punches.add(punch)
    setLastPunch(punch)
    // Punching in marks the worker present for today (8h) if not already recorded.
    const existing = dayRecords.find((r) => r.staffId === w.id)
    if (!existing) attendance.add({ id: `${day}_${w.id}`, date: day, staffId: w.id, status: 'Present', hours: 8 })
    setPunchBusy(null)
  }

  const saveWorker = () => {
    if (!wName.trim()) { setErr('Name is required'); return }
    const saved = { id: genId(), name: wName.trim(), role: wRole, phone: wPhone.trim(), status: 'active', dailyRate: Number(wRate) || 0 }
    workers.add(saved)
    attendance.add({ id: `${day}_${saved.id}`, date: day, staffId: saved.id, status: 'Present', hours: 8 })
    setAddOpen(false); setWName(''); setWRole('Site Staff'); setWPhone(''); setWRate(''); setErr('')
  }

  const submitRequest = () => {
    const w = workers.items.find((x) => x.id === provider)
    if (!w) { setErr('Select a worker first'); return }
    if (!reqReason.trim()) { setErr('Add a reason'); return }
    requests.add({ id: genId(), staffId: w.id, staffName: w.name, kind: reqKind, dateFrom: reqFrom, dateTo: reqTo, reason: reqReason.trim(), status: 'Pending' })
    setReqOpen(false); setReqReason(''); setErr('')
  }

  const decide = (r: LeaveRequest, status: string) => requests.update(r.id, { status: status as LeaveRequest['status'] })

  const doSos = async () => {
    const w = workers.items.find((x) => x.id === provider)
    if (!w) { setErr('Select a worker first'); return }
    setSosBusy(true); setErr('')
    const pos = await getPos()
    alerts.add({ id: genId(), staffId: w.id, staffName: w.name, createdAt: new Date().toISOString(), note: `${w.name} raised an emergency alert`, latitude: pos.lat, longitude: pos.lng, handled: false })
    setSosBusy(false)
  }

  const resolveSos = (a: Alert) => alerts.update(a.id, { handled: true })

  const present = dayRecords.filter((r) => r.status === 'Present').length
  const half = dayRecords.filter((r) => r.status === 'Half-Day').length
  const absent = dayRecords.filter((r) => r.status === 'Absent').length
  const totalHours = dayRecords.reduce((s, r) => s + r.hours, 0)
  const wages = dayRecords.reduce((s, r) => {
    const w = workers.items.find((x) => x.id === r.staffId)
    if (!w || !w.dailyRate) return s
    return s + w.dailyRate * (r.status === 'Half-Day' ? 0.5 : r.status === 'Present' ? 1 : 0)
  }, 0)
  const activeEmergencies = alerts.items.filter((a) => !a.handled).length
  const todayPunches = punches.items.filter((p) => p.when.slice(0, 10) === todayISO())

  return (
    <>
      <PageHead icon="⏱️" title={title} sub={sub} right={<button className="btn" onClick={() => nav(backTo)}>← Back</button>} />

      <div className="card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 600 }}>Punch for</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} style={{ minWidth: 170 }}>
            <option value="">Select worker…</option>
            {workers.items.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
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
          {activeEmergencies > 0 && (
            <span style={{ color: '#E05C7A', fontSize: 12.5, fontWeight: 700 }}>🚨 {activeEmergencies} active emergency</span>
          )}
          {lastPunch && (
            <span style={{ marginLeft: 'auto', fontSize: 12.5 }}>
              {lastPunch.kind === 'In' ? 'Clocked in' : 'Clocked out'}{' '}at <b>{fmtTime(lastPunch.when)}</b>
            </span>
          )}
        </div>
        {err && <div className="muted" style={{ color: '#E05C7A', marginTop: 8, fontSize: 12.5 }}>{err}</div>}
      </div>

      <div className="toolbar">
        <button className="btn ghost" onClick={() => shift(-1)}>← Prev</button>
        <b>{fmtDate(day)}</b>
        <button className="btn ghost" onClick={() => setDay(todayISO())}>Today</button>
        <button className="btn ghost" onClick={() => shift(1)}>Next →</button>
        {workers.items.length > 0 && (
          <>
            <span className="muted" style={{ marginLeft: 8 }}>Mark all</span>
            {STATUSES.map((s) => <button key={s} className="btn ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => markAll(s)}>{s}</button>)}
          </>
        )}
        <button className="btn ghost" style={{ marginLeft: 'auto' }} onClick={() => { setErr(''); setAddOpen(true) }}>＋ Add Worker</button>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">PRESENT</div><div className="kpi-value" style={{ color: '#2E8B57' }}>{present}</div></div>
        <div className="kpi"><div className="kpi-label">HALF-DAY</div><div className="kpi-value">{half}</div></div>
        <div className="kpi"><div className="kpi-label">ABSENT</div><div className="kpi-value" style={{ color: '#E05C7A' }}>{absent}</div></div>
        <div className="kpi"><div className="kpi-label">TOTAL HOURS</div><div className="kpi-value">{num(totalHours)} hr</div></div>
        <div className="kpi"><div className="kpi-label">TODAY WAGES</div><div className="kpi-value accent">{money(Math.round(wages))}</div></div>
      </div>

      {workers.items.length === 0 ? (
        <Empty title={'No workers added yet. Use "＋ Add Worker" to start tracking attendance.'} />
      ) : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead>
              <tr>
                <th>Worker</th><th>Role</th><th className="num">Rate</th>
                <th>Hours</th><th className="num">Status</th>
              </tr>
            </thead>
            <tbody>{workers.items.map((w) => (
              <tr key={w.id}>
                <td className="cat">{w.name}</td>
                <td className="muted">{w.role}</td>
                <td className="num muted">{w.dailyRate ? money(w.dailyRate) : '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number" min={0} step={0.5} value={hours[w.id] ?? ''} placeholder="0"
                      style={{ width: 64, padding: '6px 8px' }}
                      onChange={(e) => setHours({ ...hours, [w.id]: e.target.value })}
                      onBlur={() => saveHours(w)}
                    />
                    {savingHour === w.id && <span className="muted" style={{ fontSize: 11 }}>saving…</span>}
                  </div>
                </td>
                <td className="num">
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    {STATUSES.map((s) => (
                      <button key={s} className={status(w) === s ? 'btn' : 'btn ghost'}
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => mark(w, s)}>{s}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {(todayPunches.length > 0 || requests.items.length > 0 || alerts.items.length > 0) && (
        <div className="card-grid">
          <div className="card" style={{ margin: 0 }}>
            <h2>Today's Punches <span className="muted" style={{ fontWeight: 400 }}>(manual, remote & biometric)</span></h2>
            {todayPunches.length === 0 ? (
              <div className="empty" style={{ padding: '18px 0' }}>No punches recorded today.</div>
            ) : (
              <table className="main-table">
                <thead><tr><th>Time</th><th>Worker</th><th>In/Out</th><th>Source</th></tr></thead>
                <tbody>
                  {todayPunches.map((p) => (
                    <tr key={p.id}>
                      <td className="muted">{fmtTime(p.when)}</td>
                      <td className="cat">{p.staffName}</td>
                      <td>{p.kind === 'In' ? <b style={{ color: '#2E8B57' }}>In</b> : <b style={{ color: '#4B6CF5' }}>Out</b>}</td>
                      <td className="muted">{p.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h2>WFH / Leave Requests</h2>
            {requests.items.length === 0 ? (
              <div className="empty" style={{ padding: '18px 0' }}>No requests yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.items.map((r) => (
                  <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', background: 'var(--surface2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <b>{r.kind}</b>
                      <span className="muted">— {r.staffName}</span>
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

          <div className="card" style={{ margin: 0, borderColor: 'rgba(224,92,122,.4)' }}>
            <h2 style={{ color: '#E05C7A' }}>🚨 Emergency Alerts</h2>
            {alerts.items.length === 0 ? (
              <div className="empty" style={{ padding: '18px 0' }}>No SOS alerts raised.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.items.map((a) => (
                  <div key={a.id} style={{
                    border: `1px solid ${a.handled ? 'var(--border)' : 'rgba(224,92,122,.5)'}`,
                    borderRadius: 10, padding: '10px 12px',
                    background: a.handled ? 'var(--surface2)' : 'rgba(224,92,122,.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <b style={{ color: a.handled ? 'var(--text)' : '#E05C7A' }}>{a.staffName}</b>
                      <span className="muted">{fmtTime(a.createdAt)}</span>
                      {a.latitude !== 0 && (
                        <a
                          className="btn ghost"
                          style={{ padding: '2px 8px', fontSize: 11 }}
                          target="_blank" rel="noopener noreferrer"
                          href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                        >📍 View spot</a>
                      )}
                      <span
                        style={{
                          marginLeft: 'auto', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          color: a.handled ? '#2E8B57' : '#E05C7A',
                          background: a.handled ? 'rgba(46,139,87,.14)' : 'rgba(224,92,122,.14)',
                        }}
                      >{a.handled ? 'Resolved' : 'Active'}</span>
                    </div>
                    {a.note && <div className="muted" style={{ marginTop: 4, fontSize: 12.5 }}>{a.note}</div>}
                    {!a.handled && (
                      <button className="btn" style={{ marginTop: 8, padding: '4px 12px', fontSize: 12 }} onClick={() => resolveSos(a)}>
                        ✓ Mark resolved & stop alerts
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {addOpen && (
        <Modal open={addOpen} title="Add Worker" onClose={() => setAddOpen(false)} size="sm">
          <div className="form-row">
            <input value={wName} placeholder="Name *" onChange={(e) => setWName(e.target.value)} />
            <select value={wRole} onChange={(e) => setWRole(e.target.value)}>
              {['Site Staff', 'Sub-contractor', 'Material Supplier', 'Teacher', 'Support Staff', 'Supervisor'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-row">
            <input value={wPhone} placeholder="Phone" onChange={(e) => setWPhone(e.target.value)} />
            <input type="number" min={0} step="0.01" value={wRate} placeholder="Daily rate ₹" onChange={(e) => setWRate(e.target.value)} />
          </div>
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={saveWorker}>Save & Mark Present</button>
            <button className="btn ghost" onClick={() => setAddOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {reqOpen && (
        <Modal open={reqOpen} title="WFH / Leave Request" onClose={() => setReqOpen(false)} size="sm">
          <div className="form-row">
            <select value={reqKind} onChange={(e) => setReqKind(e.target.value)}>
              {REQ_KINDS.map((k) => <option key={k}>{k}</option>)}
            </select>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="">Select worker…</option>
              {workers.items.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
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
