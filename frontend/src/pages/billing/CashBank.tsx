import { useEffect, useState } from 'react'
import { api } from '../../api'
import type { BankAccount, CashEntry } from '../../api'
import { Empty, Modal, money, fmtDate, todayISO, PageHead } from '../../ui'

export default function CashBank() {
  const [balance, setBalance] = useState(0)
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [err, setErr] = useState('')
  const [cashOpen, setCashOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [ck, setCK] = useState('add')
  const [cAmt, setCAmt] = useState('0')
  const [cDesc, setCDesc] = useState('')
  const [bk, setBK] = useState({ name: '', accNo: '', openingBalance: 0, asOf: todayISO() })

  const load = () => Promise.all([api.billing.cash(), api.billing.banks()])
    .then(([c, b]) => { setBalance(c.balance); setEntries(c.entries); setBanks(b) })
    .catch(() => {})
  useEffect(() => { load() }, [])

  const addCash = async () => {
    try {
      await api.billing.adjustCash({ id: 0, kind: ck, amount: Number(cAmt), date: todayISO(), description: cDesc })
      setCashOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }
  const addBank = async () => {
    try {
      await api.billing.saveBank({ id: 0, name: bk.name, accNo: bk.accNo, ifsc: '', upiId: '', openingBalance: Number(bk.openingBalance), asOf: bk.asOf })
      setBankOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="💵" title="Cash & Bank" sub="In-hand cash and bank accounts"
        right={<button className="btn" onClick={() => { setCashOpen(true) }}>＋ Adjust Cash</button>} />

      <div className="kpis"><div className="kpi"><div className="kpi-label">CASH IN HAND</div><div className="kpi-value accent">{money(balance)}</div></div></div>

      <div className="card">
        <h2>💵 Cash Entries ({entries.length})</h2>
        {entries.length === 0 ? <Empty>No cash adjustments yet.</Empty> : (
          <table className="main-table">
            <thead><tr><th>Type</th><th>Date</th><th>Note</th><th className="num">Amount</th></tr></thead>
            <tbody>{entries.map((e) => (
              <tr key={e.id}>
                <td style={{ color: e.kind === 'add' ? '#2E8B57' : '#E05C7A' }}>{e.kind === 'add' ? '＋ Cash added' : '− Cash reduced'}</td>
                <td className="muted">{fmtDate(e.date)}</td>
                <td className="muted">{e.description || '—'}</td>
                <td className="num">{money(e.amount)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>🏦 Bank Accounts</h2>
        {banks.length === 0 ? <Empty>No bank accounts — tap "＋ Add Bank".</Empty> : (
          <table className="main-table">
            <thead><tr><th>Bank</th><th>Account No</th><th className="num">Balance</th></tr></thead>
            <tbody>{banks.map((b) => (
              <tr key={b.id}><td className="cat">{b.name}</td><td className="muted">{b.accNo || '—'}</td><td className="num">{money(b.openingBalance)}</td></tr>
            ))}</tbody>
          </table>
        )}
        <div style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={() => setBankOpen(true)}>＋ Add Bank Account</button>
        </div>
      </div>

      {err && <div className="empty" style={{ color: '#E05C7A' }}>{err}</div>}

      {cashOpen && (
        <Modal title="Adjust Cash" onClose={() => setCashOpen(false)}>
          <div className="form-row">
            <select value={ck} onChange={(e) => setCK(e.target.value)}><option value="add">Add cash</option><option value="reduce">Reduce cash</option></select>
            <input type="number" min={0} value={cAmt} onChange={(e) => setCAmt(e.target.value)} />
          </div>
          <input value={cDesc} placeholder="Note" onChange={(e) => setCDesc(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={addCash}>Save</button>
            <button className="btn ghost" onClick={() => setCashOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {bankOpen && (
        <Modal title="Add Bank Account" onClose={() => setBankOpen(false)}>
          <div className="form-row">
            <input value={bk.name} placeholder="Bank name" onChange={(e) => setBK({ ...bk, name: e.target.value })} />
            <input value={bk.accNo} placeholder="Account no" onChange={(e) => setBK({ ...bk, accNo: e.target.value })} />
          </div>
          <input type="number" min={0} value={bk.openingBalance || ''} placeholder="Opening balance" onChange={(e) => setBK({ ...bk, openingBalance: Number(e.target.value) })} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={addBank}>Save</button>
            <button className="btn ghost" onClick={() => setBankOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}