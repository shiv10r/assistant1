import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { BizTxn, BizTxnItem, CatalogItem, Party, Settings } from '../../api'
import { PageHead, Empty, money, todayISO } from '../../ui'

const MODES = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card']
const TAX_RATES = [0, 0.25, 3, 5, 12, 18, 28]

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
  const [txnTax, setTxnTax] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [lines, setLines] = useState<BizTxnItem[]>([])

  useEffect(() => {
    Promise.all([api.billing.items(), api.billing.parties(), api.billing.settings()])
      .then(([i, p, s]) => {
        setItems(i); setParties(p); setSettings(s)
        if (s['txn.cash_sale_default'] === '1') setPartyId(0)
        if (s['gst.state_of_supply'] === '1') setStateOfSupply(s['general.firm_state'] || '')
      })
      .catch((e) => setErr(String(e)))
  }, [])

  // ---- settings-driven behaviour ----
  const gstOn = settings['gst.enabled'] !== '0'
  const stateOn = settings['gst.state_of_supply'] === '1'
  const hsnOn = settings['gst.hsn'] !== '0'
  const txnTaxOn = settings['txn.txn_wise_tax'] === '1'
  const itemTaxOn = settings['txn.item_wise_tax'] !== '0'
  const roundOn = settings['txn.round_off'] === '1'
  const termsOn = settings['txn.terms_enabled'] === '1'
  const termsText = settings['txn.terms_text'] || 'Thanks for doing business with us!'
  const billOfSupply = settings['print.bill_of_supply_non_tax'] === '1'

  const TYPES = useMemo(() => {
    const all = [
      { v: 'SALE', l: 'Sale' }, { v: 'PURCHASE', l: 'Purchase' },
      { v: 'ESTIMATE', l: 'Estimate' }, { v: 'SALE_ORDER', l: 'Sale Order' },
      { v: 'PURCHASE_ORDER', l: 'Purchase Order' }, { v: 'DELIVERY_CHALLAN', l: 'Delivery Challan' },
      { v: 'PAYMENT_IN', l: 'Payment-In' }, { v: 'PAYMENT_OUT', l: 'Payment-Out' },
    ]
    return all.filter((t) =>
      t.v === 'ESTIMATE' ? settings['txn.enable.estimate'] !== '0'
      : t.v === 'DELIVERY_CHALLAN' ? settings['txn.enable.delivery_challan'] !== '0'
      : true)
  }, [settings])

  const isPayment = type === 'PAYMENT_IN' || type === 'PAYMENT_OUT'
  const isNonTaxable = billOfSupply && txnTaxOn && txnTax === 0

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0)
    const tax = txnTaxOn
      ? subtotal * txnTax / 100
      : lines.reduce((s, l) => s + l.qty * l.rate * (l.taxRate || 0) / 100, 0)
    const d = Number(discount) || 0
    let total = Math.max(0, subtotal + tax - d)
    let roundOff = 0
    if (roundOn) { roundOff = Math.round(total) - total; total = Math.round(total) }
    let recv = Number(received) || 0
    if (isPayment) recv = total
    else recv = Math.min(recv || 0, total)
    return { subtotal, tax, total, roundOff, balance: total - recv, received: recv }
  }, [lines, discount, received, isPayment, txnTaxOn, txnTax, roundOn])

  const addLine = (item?: CatalogItem) => {
    setLines([...lines, {
      id: 0, txnId: 0, itemId: item?.id ?? 0, itemName: item?.name ?? '', hsnSac: item?.hsnSac ?? '',
      unit: item?.unit ?? 'Pcs', qty: 1, freeQty: 0, rate: item?.salePrice ?? 0, discountPct: 0,
      taxRate: item?.taxRate ?? txnTax, amount: item?.salePrice ?? 0,
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
      <PageHead icon="🧾" title={`New ${txnType(type)}`} sub="Create a bill / invoice / payment" />
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
          {stateOn && <input type="text" placeholder="State of supply" value={stateOfSupply} onChange={(e) => setStateOfSupply(e.target.value)} />}
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
            {hsnOn && <input value={l.hsnSac} placeholder="HSN/SAC" onChange={(e) => patchLine(i, { hsnSac: e.target.value })} />}
            {gstOn && !txnTaxOn && itemTaxOn && <input type="number" min={0} step="0.01" value={l.taxRate} placeholder="GST %" onChange={(e) => patchLine(i, { taxRate: Number(e.target.value) })} />}
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

        {gstOn && txnTaxOn && !isPayment && (
          <div className="form-row" style={{ marginTop: 16 }}>
            <select value={txnTax} onChange={(e) => setTxnTax(Number(e.target.value))}>
              {TAX_RATES.map((t) => <option key={t} value={t}>{t}% GST (whole transaction)</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <input style={{ flex: 1 }} type="text" value={description} placeholder="Description / note" onChange={(e) => setDescription(e.target.value)} />
        </div>

        <table className="main-table" style={{ marginTop: 18 }}>
          <tbody>
            <tr><td>Subtotal</td><td className="num">{money(totals.subtotal)}</td></tr>
            <tr><td>Tax (GST)</td><td className="num">{money(totals.tax)}</td></tr>
            {isNonTaxable && <tr><td>Bill of supply (non-taxable)</td><td className="num muted">—</td></tr>}
            <tr><td>Discount</td><td className="num">−{money(Number(discount) || 0)}</td></tr>
            {roundOn && <tr><td>Round off</td><td className="num">{money(totals.roundOff)}</td></tr>}
            <tr><td><b>Total</b></td><td className="num total"><b>{money(totals.total)}</b></td></tr>
            <tr><td>Received</td><td className="num">{money(totals.received)}</td></tr>
            <tr><td>Balance</td><td className="num">{money(totals.balance)}</td></tr>
          </tbody>
        </table>

        {termsOn && !isPayment && (
          <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>{termsText}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn" onClick={save}>💾 Save {txnType(type)}</button>
          {settings['txn.invoice_preview'] !== '0' && (
            <button className="btn ghost" onClick={() => setShowPreview(true)}>👁 Preview invoice</button>
          )}
          <button className="btn ghost" onClick={() => nav('/billing')}>Cancel</button>
        </div>
      </div>

      {showPreview && (
        <div className="modal-backdrop" onClick={() => setShowPreview(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Invoice preview</h2><button className="modal-x" onClick={() => setShowPreview(false)}>✕</button></div>
            <div className="modal-body">
              <div className="preview-invoice">
                <div className="preview-head">
                  <div className="brand">Lux<span>Infra</span></div>
                  <div className="muted" style={{ fontSize: 12 }}>{settings['general.firm_name'] || 'LuxInfra'}{settings['general.firm_gstin'] ? ` · GSTIN ${settings['general.firm_gstin']}` : ''}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{settings['general.firm_address']}</div>
                </div>
                <div className="preview-meta">
                  <span>{txnType(type)} · #{type === 'ESTIMATE' ? 'EST' : type === 'DELIVERY_CHALLAN' ? 'DC' : 'INV'}—</span>
                  <span>Date {date}</span>
                </div>
                <table>
                  <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
                  <tbody>
                    {lines.filter((l) => l.itemName).map((l, i) => (
                      <tr key={i}><td>{l.itemName}</td><td className="num">{l.qty}</td><td className="num">{money(l.rate)}</td><td className="num">{money(l.qty * l.rate)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td colSpan={3}>Total</td><td className="num total">{money(totals.total)}</td></tr>
                  </tfoot>
                </table>
                {termsOn && <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>{termsText}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const txnType = (t: string) =>
  t === 'SALE' ? 'Sale' : t === 'PURCHASE' ? 'Purchase' : t === 'ESTIMATE' ? 'Estimate'
  : t === 'PAYMENT_IN' ? 'Payment-In' : t === 'PAYMENT_OUT' ? 'Payment-Out'
  : t === 'SALE_ORDER' ? 'Sale Order' : t === 'PURCHASE_ORDER' ? 'Purchase Order' : 'Delivery Challan'
