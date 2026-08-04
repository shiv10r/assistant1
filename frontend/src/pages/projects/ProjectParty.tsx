import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { SiteParty } from '../../api'
import { Badge, Empty, Modal, money, PageHead } from '../../ui'

const ROLES = ['Site Staff', 'Sub-contractor', 'Material Supplier']

function blank(pid: number): SiteParty {
  return { id: 0, projectId: pid, name: '', phone: '', role: 'Site Staff', openingBalance: 0, balanceType: 'pending', currentBalance: 0, isActive: true }
}

export default function ProjectParty() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [parties, setParties] = useState<SiteParty[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<SiteParty>(blank(pid))
  const set = (k: keyof SiteParty, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  const load = () => api.projects.detail(pid).then((d) => setParties(d.parties)).catch(() => setParties([]))
  useEffect(() => { load() }, [pid])

  const adv = parties.filter((p) => p.currentBalance > 0).reduce((s, p) => s + p.currentBalance, 0)
  const pend = parties.filter((p) => p.currentBalance < 0).reduce((s, p) => s - p.currentBalance, 0)

  const save = async () => {
    try {
      if (!f.name.trim()) { setErr('Name is required'); return }
      await api.projects.saveParty(pid, f)
      setOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="👥" title="Parties" sub="Site staff & vendors" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">ADVANCE PAID</div><div className="kpi-value" style={{ color: '#2E8B57' }}>{money(adv)}</div></div>
        <div className="kpi"><div className="kpi-label">PENDING TO PAY</div><div className="kpi-value" style={{ color: '#E05C7A' }}>{money(pend)}</div></div>
      </div>

      <div className="toolbar"><button className="btn ghost" onClick={() => { setF(blank(pid)); setErr(''); setOpen(true) }}>＋ Add Party</button></div>

      {parties.length === 0 ? <Empty>No parties yet.</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th className="num">Balance</th><th>Type</th></tr></thead>
            <tbody>{parties.map((p) => (
              <tr key={p.id}>
                <td className="cat">{p.name}</td>
                <td className="muted">{p.role}</td>
                <td className="muted">{p.phone || '—'}</td>
                <td className="num" style={{ color: p.currentBalance >= 0 ? '#2E8B57' : '#E05C7A' }}>{money(Math.abs(p.currentBalance))}</td>
                <td><Badge tone={p.currentBalance >= 0 ? 'green' : 'pink'}>{p.currentBalance >= 0 ? 'Advance' : 'Pending'}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Add Party" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.name} placeholder="Name *" onChange={(e) => set('name', e.target.value)} />
            <input value={f.phone} placeholder="Phone" onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="form-row">
            <select value={f.role} onChange={(e) => set('role', e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            <select value={f.balanceType} onChange={(e) => set('balanceType', e.target.value)}>
              <option value="advance">Advance (paid to them)</option><option value="pending">Pending (owe them)</option>
            </select>
          </div>
          <input type="number" min={0} value={f.openingBalance || ''} placeholder="Opening balance" onChange={(e) => set('openingBalance', Number(e.target.value))} />
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