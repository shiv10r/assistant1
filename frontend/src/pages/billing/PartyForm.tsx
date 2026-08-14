import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { Party } from '../../api'
import { PageHead, todayISO } from '../../ui'

const GST_TYPES = ['Unregistered/Consumer', 'Registered Business - Regular', 'Registered Business - Composition']

export default function PartyForm() {
  const nav = useNavigate()
  const [err, setErr] = useState('')
  const [f, setF] = useState<Party>({
    id: 0, name: '', phone: '', openingBalance: 0, balanceType: 'receive', asOfDate: todayISO(),
    creditLimit: 0, gstType: GST_TYPES[0], gstin: '', state: '', stateCode: '', billingAddress: '', email: '', currentBalance: 0,
  })
  const set = (k: keyof Party, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  const save = async () => {
    try {
      if (!f.name.trim()) { setErr('Party name is required'); return }
      await api.billing.saveParty(f)
      nav('/billing')
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="👥" title="Add Party" sub="Customer / supplier / party" />
      <div className="card">
        <div className="form-row">
          <input value={f.name} placeholder="Party name *" onChange={(e) => set('name', e.target.value)} />
          <input value={f.phone} placeholder="Phone" onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="form-row">
          <input value={f.email} placeholder="Email" onChange={(e) => set('email', e.target.value)} />
          <input type="number" min={0} value={f.openingBalance || ''} placeholder="Opening balance" onChange={(e) => set('openingBalance', Number(e.target.value))} />
        </div>
        <div className="form-row">
          <select value={f.balanceType} onChange={(e) => set('balanceType', e.target.value)}>
            <option value="receive">To Receive (they owe you)</option>
            <option value="pay">To Pay (you owe them)</option>
          </select>
          <input type="date" value={f.asOfDate} onChange={(e) => set('asOfDate', e.target.value)} />
        </div>
        <div className="form-row">
          <select value={f.gstType} onChange={(e) => set('gstType', e.target.value)}>
            {GST_TYPES.map((g) => <option key={g}>{g}</option>)}
          </select>
          {f.gstType !== 'Unregistered/Consumer' && <input value={f.gstin} placeholder="GSTIN" onChange={(e) => set('gstin', e.target.value)} />}
        </div>
        <div className="form-row">
          <input value={f.state} placeholder="State" onChange={(e) => set('state', e.target.value)} />
          <input value={f.stateCode} placeholder="State code (e.g. 06)" onChange={(e) => set('stateCode', e.target.value)} />
        </div>
        <div className="form-row">
          <input type="number" min={0} value={f.creditLimit || ''} placeholder="Credit limit (Gold)" onChange={(e) => set('creditLimit', Number(e.target.value))} />
        </div>
        <textarea value={f.billingAddress} placeholder="Billing address" onChange={(e) => set('billingAddress', e.target.value)} />

        {err && <div className="empty" style={{ color: '#E05C7A', padding: '12px 0' }}>{err}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn" onClick={save}>💾 Save Party</button>
          <button className="btn ghost" onClick={() => nav('/billing')}>Cancel</button>
        </div>
      </div>
    </>
  )
}