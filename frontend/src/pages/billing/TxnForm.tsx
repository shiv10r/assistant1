import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { BizTxn, BizTxnItem, CatalogItem, Party, Settings } from '../../api'
import { PageHead, Empty, money, todayISO } from '../../ui'

const TYPES = [
  { v: 'SALE', l: 'Sale' }, { v: 'PURCHASE', l: 'Purchase' }, { v: 'ESTIMATE', l: 'Estimate' },
  { v: 'SALE_ORDER', l: 'Sale Order' }, { v: 'PURCHASE_ORDER', l: 'Purchase Order' },
  { v: 'DELIVERY_CHALLAN', l: 'Delivery Challan' }, { v: 'PAYMENT_IN', l: 'Payment-In' }, { v: 'PAYMENT_OUT', l: 'Payment-Out' },
]
const MODES = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card']

export default function TxnForm() {
  const nav = useNavigate()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [settings, setSettings] = useState<Settings>({})
  const [err, setErr] = useState('')

  const [type, setType] = useState('SALE')
  const [partyId, setPartyId] = useState(0)
  const [date, setDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState(todayISO())
  const [mode, setMode] = useState('Cash')
  const [discount, setDiscount] = useState('0')
  const [received, setReceived] = useState('0')
  const [description, setDescription] = useState('')
  const [stateOfSupply, setStateOfSupply] = useState('')
  const [lines, setLines] = useState<BizTxnItem[]>([])

  useEffect(() => {
    Promise.all([api.billing.items(), api.billing.parties(), api.billing.settings()])
      .then(([i, p, s]) => { setItems(i); setParties(p); setSettings(s) })
      .catch((e) => setErr(String(e)))
  }, [])

  const isPayment = type === 'PAYMENT_IN' || type === 'PAYMENT_OUT'

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0)
    const tax = lines.reduce((s, l) => s + l.qty * l.rate * (l.taxRate || 0) / 100, 0)
    const d = Number(discount) || 0
    let total = Math.max(0, subtotal + tax - d)
    let roundOff = 0
    if (settings['txn.round_off'] === '1') { roundOff = Math.round(total) - total; total = Math.round(total) }
    let recv = Number(received) || 0
    if (isPayment) recv = total
    else recv = Math.min(recv || 0, total)
    return { subtotal, tax, total, roundOff, balance: total - recv, received: recv }
  }, [lines, discount, received, isPayment, settings])

  const addLine = (item?: CatalogItem) => {
    setLines([...lines, {
      id: 0, txnId: 0, itemId: item?.id ?? 0, itemName: item?.name ?? '', hsnSac: item?.hsnSac ?? '',
      unit: item?.unit ?? 'Pcs', qty: 1, freeQty: 0, rate: item?.salePrice ?? 0, discountPct: 0,
      taxRate: item?.taxRate ?? 0, amount: item?.salePrice ?? 0,
    }])
  }
  const patchLine = (i: number, patch: Partial<BizTxnItem>) => {
    setLines(lines.map((l, idx) => idx === i ? { ...l, ...patch } : l))
  }
  const delLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i))

  const selectParty = (id: number) => {
    setPartyId(id)
    const p = parties.find((x) => x.id === id)
    if (p) setStateOfSupply(p.state || '')
  }

  const save = async () => {
    try {
      const txn: BizTxn = {
        id: 0, partyId, partyName: parties.find((p) => p.id === partyId)?.name || '', type,
        refNo: 0, prefix: '', date, dueDate,
        subtotal: totals.subtotal, discount: Number(discount) || 0, tax: totals.tax,
        roundOff: totals.roundOff, total: totals.total, received: totals.received,
        balance: totals.balance, paymentMode: mode, chequeStatus: mode === 'Cheque' ? 'open' : '',
        description, stateOfSupply, status: 'OPEN',
      }
      const good = lines.filter((l) => l.itemName && l.qty > 0 && l.rate > 0)
      await api.billing.saveTxn(txn, good)
      nav('/billing')
    } catch (e) { setErr(String(e)) }
  }

  if (err) return <Empty>⚠️ {err}</Empty>

  return (
    <>
      <PageHead icon="🧾" title="New Sale" sub="Create a bill / invoice / payment" />
      <div className="card">
        <div className="form-row">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
          <select value={partyId} onChange={(e) => selectParty(Number(e.target.value))}>
            <option value={0}>{isPayment ? 'Select party' : 'Cash'}</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {!isPayment && <div className="form-row">
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <select value={mode} onChange={(e) => setMode(e.target.value)}>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
          <input type="text" placeholder="State of supply" value={stateOfSupply} onChange={(e) => setStateOfSupply(e.target.value)} />
        </div>}

        <h2 style={{ marginTop: 18 }}>Line items</h2>
        <div className="toolbar">
          <select onChange={(e) => { const it = items.find((x) => x.id === Number(e.target.value)); if (it) addLine(it) }} defaultValue="">
            <option value="" disabled>＋ Add item…</option>
            {items.map((it) => <option key={it.id} value={it.id}>{it.name} — {money(it.salePrice)}</option>)}
          </select>
          <button className="btn ghost" onClick={() => addLine()}>＋ Free text line</button>
        </div>

        {lines.map((l, i) => (
          <div className="form-row" key={i} style={{ alignItems: 'flex-end' }}>
            <input value={l.itemName} placeholder="Item name" onChange={(e) => patchLine(i, { itemName: e.target.value })} />
            <input type="number" min={0} value={l.qty} placeholder="Qty" onChange={(e) => patchLine(i, { qty: Number(e.target.value) })} />
            <input type="number" min={0} value={l.rate} placeholder="Rate" onChange={(e) => patchLine(i, { rate: Number(e.target.value) })} />
            <input type="number" min={0} step="0.01" value={l.taxRate} placeholder="GST %" onChange={(e) => patchLine(i, { taxRate: Number(e.target.value) })} />
            <button className="del-btn" onClick={() => delLine(i)}>✕</button>
          </div>
        ))}

        {!isPayment && <div className="form-row" style={{ marginTop: 16 }}>
          <input type="number" min={0} value={discount} placeholder="Discount ₹" onChange={(e) => setDiscount(e.target.value)} />
          <input type="number" min={0} value={received} placeholder="Amount received" onChange={(e) => setReceived(e.target.value)} />
        </div>}
        {isPayment && <div className="form-row" style={{ marginTop: 16 }}>
          <input type="number" min={0} value={received} placeholder="Payment amount" onChange={(e) => setReceived(e.target.value)} />
        </div>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <input style={{ flex: 1 }} type="text" value={description} placeholder="Description / note" onChange={(e) => setDescription(e.target.value)} />
        </div>

        <table className="main-table" style={{ marginTop: 18 }}>
          <tbody>
            <tr><td>Subtotal</td><td className="num">{money(totals.subtotal)}</td></tr>
            <tr><td>Tax (GST)</td><td className="num">{money(totals.tax)}</td></tr>
            <tr><td>Discount</td><td className="num">−{money(Number(discount) || 0)}</td></tr>
            {settings['txn.round_off'] === '1' && <tr><td>Round off</td><td className="num">{money(totals.roundOff)}</td></tr>}
            <tr><td><b>Total</b></td><td className="num total"><b>{money(totals.total)}</b></td></tr>
            <tr><td>Received</td><td className="num">{money(totals.received)}</td></tr>
            <tr><td>Balance</td><td className="num">{money(totals.balance)}</td></tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn" onClick={save}>💾 Save {txnType(type)}</button>
          <button className="btn ghost" onClick={() => nav('/billing')}>Cancel</button>
        </div>
      </div>
    </>
  )
}

const txnType = (t: string) =>
  t === 'SALE' ? 'Sale' : t === 'PURCHASE' ? 'Purchase' : t === 'ESTIMATE' ? 'Estimate'
  : t === 'PAYMENT_IN' ? 'Payment-In' : t === 'PAYMENT_OUT' ? 'Payment-Out'
  : t === 'SALE_ORDER' ? 'Sale Order' : t === 'PURCHASE_ORDER' ? 'Purchase Order' : 'Delivery Challan'
