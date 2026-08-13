import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectTxn, SiteParty } from '../../api'
import { Badge, Empty, Modal, money, fmtDate, todayISO, PageHead } from '../../ui'

const MODES = ['Cash', 'Bank Transfer', 'Cheque']

export default function ProjectTxn() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [txns, setTxns] = useState<ProjectTxn[]>([])
  const [parties, setParties] = useState<SiteParty[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('PAYMENT_OUT')
  const [f, setF] = useState({ partyId: 0, amount: 0, description: '', referenceNumber: '', paymentMethod: 'Cash', costCode: '', date: todayISO() })

  const load = () => api.projects.detail(pid).then((d) => { setTxns(d.txns); setParties(d.parties) }).catch(() => {})
  useEffect(() => { load() }, [pid])

  const totalIn = txns.filter((t) => t.type === 'PAYMENT_IN').reduce((s, t) => s + t.amount, 0)
  const totalOut = txns.filter((t) => t.type === 'PAYMENT_OUT').reduce((s, t) => s + t.amount, 0)

  const save = async () => {
    try {
      if (!f.partyId) { setErr('Select a party'); return }
      const txn: ProjectTxn = { id: 0, projectId: pid, type: kind, partyId: f.partyId, partyName: parties.find((p) => p.id === f.partyId)?.name || '', amount: Number(f.amount), description: f.description, referenceNumber: f.referenceNumber, paymentMethod: f.paymentMethod, costCode: f.costCode, date: f.date }
      await api.projects.saveTxn(pid, txn)
      setOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="💸" title="Transactions" sub="Payments to / from site parties" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">TOTAL IN</div><div className="kpi-value" style={{ color: '#2E8B57' }}>{money(totalIn)}</div></div>
        <div className="kpi"><div className="kpi-label">TOTAL OUT</div><div className="kpi-value" style={{ color: '#E05C7A' }}>{money(totalOut)}</div></div>
        <div className="kpi"><div className="kpi-label">BALANCE</div><div className="kpi-value accent">{money(totalIn - totalOut)}</div></div>
      </div>

      <div className="toolbar">
        <button className="btn ghost" onClick={() => { setErr(''); setKind('PAYMENT_OUT'); setF({ partyId: 0, amount: 0, description: '', referenceNumber: '', paymentMethod: 'Cash', costCode: '', date: todayISO() }); setOpen(true) }}>＋ Add Payment</button>
      </div>

      {txns.length === 0 ? <Empty>No transactions yet.</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Party</th><th>Type</th><th>Method</th><th>Date</th><th className="num">Amount</th></tr></thead>
            <tbody>{txns.map((t) => (
              <tr key={t.id}>
                <td className="cat">{t.partyName}</td>
                <td><Badge tone={t.type === 'PAYMENT_IN' ? 'green' : 'pink'}>{t.type === 'PAYMENT_IN' ? 'Payment In' : 'Payment Out'}</Badge></td>
                <td className="muted">{t.paymentMethod}</td>
                <td className="muted">{fmtDate(t.date)}</td>
                <td className="num" style={{ color: t.type === 'PAYMENT_IN' ? '#2E8B57' : '#E05C7A' }}>{money(t.amount)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Add Payment" onClose={() => setOpen(false)}>
          <div className="form-row">
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="PAYMENT_OUT">Payment Out</option><option value="PAYMENT_IN">Payment In</option>
            </select>
            <select value={f.partyId} onChange={(e) => setF({ ...f, partyId: Number(e.target.value) })}>
              <option value={0}>Select party</option>{parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <input type="number" min={0} value={f.amount || ''} placeholder="Amount *" onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
            <select value={f.paymentMethod} onChange={(e) => setF({ ...f, paymentMethod: e.target.value })}>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
          </div>
          <div className="form-row">
            <input value={f.referenceNumber} placeholder="Reference no" onChange={(e) => setF({ ...f, referenceNumber: e.target.value })} />
            <input value={f.costCode} placeholder="Cost code" onChange={(e) => setF({ ...f, costCode: e.target.value })} />
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          <input value={f.description} placeholder="Description" onChange={(e) => setF({ ...f, description: e.target.value })} />
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