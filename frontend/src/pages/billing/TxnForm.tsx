import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import type { BizTxn, BizTxnItem, CatalogItem, Party, Settings } from '../../api'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Textarea, Select, Label, Modal, money, todayISO } from '../../components/ui'
import { Plus, Trash2, Eye, Save, X, ReceiptText, User, Wallet, FileText } from 'lucide-react'
import { cn } from '../../lib/utils'

const MODES = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card']
const TAX_RATES = [0, 0.25, 3, 5, 12, 18, 28]

export default function TxnForm() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const editId = Number(params.get('id')) || 0
  const [keepRef, setKeepRef] = useState({ refNo: 0, prefix: '', status: 'OPEN' })
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
  const [tcs, setTcs] = useState('0')
  const [tds, setTds] = useState('0')
  const [reverseCharge, setReverseCharge] = useState(false)
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

  useEffect(() => {
    if (!editId) return
    Promise.all([api.billing.txns(), api.billing.txnLines(editId)])
      .then(([all, ls]) => {
        const t = all.find((x) => x.id === editId)
        if (!t) return
        setType(t.type)
        setPartyId(t.partyId)
        setDate(t.date?.slice(0, 10) || todayISO())
        setDueDate(t.dueDate?.slice(0, 10) || t.date?.slice(0, 10) || todayISO())
        setMode(t.paymentMode || 'Cash')
        setDiscount(String(t.discount || 0))
        setReceived(String(t.received || 0))
        setDescription(t.description || '')
        setStateOfSupply(t.stateOfSupply || '')
        setTcs(String(t.tcs || 0))
        setTds(String(t.tds || 0))
        setReverseCharge(t.reverseCharge)
        setKeepRef({ refNo: t.refNo, prefix: t.prefix || '', status: t.status || 'OPEN' })
        setLines(ls.map((l) => ({ ...l })))
      })
      .catch((e) => setErr(String(e)))
  }, [editId])

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
  const autoInvoiceNo = settings['txn.invoice_number'] !== '0'
  const tcsOn = gstOn && settings['gst.tcs'] === '1'
  const tdsOn = gstOn && settings['gst.tds'] === '1'
  const reverseChargeOn = gstOn && settings['gst.reverse_charge'] === '1'

  const TYPES = useMemo(() => {
    const all = [
      { v: 'SALE', l: 'Sale' }, { v: 'PURCHASE', l: 'Purchase' },
      { v: 'ESTIMATE', l: 'Estimate' }, { v: 'SALE_ORDER', l: 'Sale Order' },
      { v: 'PURCHASE_ORDER', l: 'Purchase Order' }, { v: 'DELIVERY_CHALLAN', l: 'Delivery Challan' },
      { v: 'PROFORMA', l: 'Proforma Invoice' },
      { v: 'PAYMENT_IN', l: 'Payment-In' }, { v: 'PAYMENT_OUT', l: 'Payment-Out' },
    ]
    return all.filter((t) =>
      t.v === 'ESTIMATE' ? settings['txn.enable.estimate'] !== '0'
      : t.v === 'DELIVERY_CHALLAN' ? settings['txn.enable.delivery_challan'] !== '0'
      : t.v === 'PROFORMA' ? settings['txn.enable.proforma'] === '1'
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
    const tcsAmt = tcsOn ? subtotal * Number(tcs || 0) / 100 : 0
    const tdsAmt = tdsOn ? subtotal * Number(tds || 0) / 100 : 0
    let total = Math.max(0, subtotal + tax - d)
    if (type !== 'PAYMENT_IN' && type !== 'PAYMENT_OUT') total += tcsAmt
    if (type === 'PURCHASE') total -= tdsAmt
    let roundOff = 0
    if (roundOn) { roundOff = Math.round(total) - total; total = Math.round(total) }
    let recv = Number(received) || 0
    if (isPayment) recv = total
    else recv = Math.min(recv || 0, total)
    return { subtotal, tax, total, roundOff, balance: total - recv, received: recv, tcsAmt, tdsAmt }
  }, [lines, discount, received, isPayment, txnTaxOn, txnTax, roundOn, tcsOn, tcs, tdsOn, tds, type])

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
        id: editId, partyId, partyName: parties.find((p) => p.id === partyId)?.name || '', type,
        refNo: keepRef.refNo, prefix: keepRef.prefix, date, dueDate,
        subtotal: totals.subtotal, discount: Number(discount) || 0, tax: totals.tax,
        roundOff: totals.roundOff, total: totals.total, received: totals.received,
        balance: totals.balance, paymentMode: mode, chequeStatus: mode === 'Cheque' ? (keepRef.status === 'OPEN' ? 'open' : '') : '',
        description, stateOfSupply, tcs: totals.tcsAmt, tds: totals.tdsAmt, reverseCharge, status: keepRef.status,
      }
      const good = lines.filter((l) => l.itemName && l.qty > 0 && l.rate > 0)
      await api.billing.saveTxn(txn, good)
      nav('/billing')
    } catch (e) { setErr(String(e)) }
  }

  if (err) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">⚠️ {err}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{editId ? `Edit ${txnType(type)}` : `New ${txnType(type)}`}</h1>
          <div className="muted">Create a bill, invoice, estimate or payment</div>
        </div>
        <Button variant="outline" onClick={() => nav('/billing')}><X className="w-4 h-4" /> Cancel</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ReceiptText className="w-5 h-5 text-primary" /> Document Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Party / Customer</Label>
                  <Select value={partyId} onValueChange={(v) => selectParty(Number(v))}>
                    <option value={0}>{isPayment ? 'Select party' : 'Cash / walk-in'}</option>
                    {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              {!isPayment && (
                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Payment Mode</Label>
                    <Select value={mode} onValueChange={setMode}>
                      {MODES.map((m) => <option key={m}>{m}</option>)}
                    </Select>
                  </div>
                  {stateOn && (
                    <div>
                      <Label>State of Supply</Label>
                      <Input value={stateOfSupply} placeholder="e.g. Karnataka" onChange={(e) => setStateOfSupply(e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Line Items</CardTitle>
              <div className="flex items-center gap-2">
                <Select className="w-52" value="" onValueChange={(v) => { const it = items.find((x) => x.id === Number(v)); if (it) addLine(it) }}>
                  <option value="" disabled>Add item…</option>
                  {items.map((it) => <option key={it.id} value={it.id}>{it.name} — {money(it.salePrice)}</option>)}
                </Select>
                <Button type="button" variant="outline" onClick={() => addLine()}><Plus className="w-4 h-4" /> Free text</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {lines.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No line items yet — add items from your catalog.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-muted px-4 py-3">Item</th>
                        <th className="w-20 text-center font-medium text-muted px-2 py-3">Qty</th>
                        <th className="w-28 text-right font-medium text-muted px-2 py-3">Rate</th>
                        {hsnOn && <th className="w-28 hidden md:table-cell text-left font-medium text-muted px-2 py-3">HSN/SAC</th>}
                        {gstOn && !txnTaxOn && itemTaxOn && <th className="w-24 text-center font-medium text-muted px-2 py-3">GST %</th>}
                        <th className="w-12 px-2 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2">
                            <Input value={l.itemName} placeholder="Item name" onChange={(e) => patchLine(i, { itemName: e.target.value })} />
                          </td>
                          <td className="px-2 py-2 w-20">
                            <Input type="number" min={0} value={l.qty} onChange={(e) => patchLine(i, { qty: Number(e.target.value) })} className="text-center" />
                          </td>
                          <td className="px-2 py-2 w-28">
                            <Input type="number" min={0} value={l.rate} onChange={(e) => patchLine(i, { rate: Number(e.target.value) })} className="text-right" />
                          </td>
                          {hsnOn && (
                            <td className="px-2 py-2 hidden md:table-cell">
                              <Input value={l.hsnSac} placeholder="HSN" onChange={(e) => patchLine(i, { hsnSac: e.target.value })} />
                            </td>
                          )}
                          {gstOn && !txnTaxOn && itemTaxOn && (
                            <td className="px-2 py-2 w-24">
                              <Input type="number" min={0} step="0.01" value={l.taxRate} onChange={(e) => patchLine(i, { taxRate: Number(e.target.value) })} className="text-center" />
                            </td>
                          )}
                          <td className="px-2 py-2 text-center">
                            <Button variant="ghost" size="icon" onClick={() => delLine(i)} aria-label="Remove" className="text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Notes & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {!isPayment ? (
                  <>
                    <div>
                      <Label>Discount (₹)</Label>
                      <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <Label>Amount Received</Label>
                      <Input type="number" min={0} value={received} onChange={(e) => setReceived(e.target.value)} placeholder="0" />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label>Payment Amount</Label>
                    <Input type="number" min={0} value={received} onChange={(e) => setReceived(e.target.value)} placeholder="0" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Label>Description / Note</Label>
                <Textarea value={description} placeholder="Reference, note or memo…" rows={2} onChange={(e) => setDescription(e.target.value)} />
              </div>
              {gstOn && txnTaxOn && !isPayment && (
                <div className="mt-4">
                  <Label>GST (whole transaction)</Label>
                  <Select value={txnTax} onValueChange={(v) => setTxnTax(Number(v))}>
                    {TAX_RATES.map((t) => <option key={t} value={t}>{t}% GST</option>)}
                  </Select>
                </div>
              )}
              {(tcsOn || tdsOn) && !isPayment && (
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {tcsOn && (
                    <div>
                      <Label>TCS % <span className="text-xs text-muted">(tax collected at source)</span></Label>
                      <Input type="number" min={0} step="0.01" value={tcs} onChange={(e) => setTcs(e.target.value)} placeholder="0" />
                    </div>
                  )}
                  {tdsOn && (
                    <div>
                      <Label>TDS % <span className="text-xs text-muted">(tax deducted at source)</span></Label>
                      <Input type="number" min={0} step="0.01" value={tds} onChange={(e) => setTds(e.target.value)} placeholder="0" />
                    </div>
                  )}
                </div>
              )}
              {reverseChargeOn && !isPayment && (
                <div className="mt-4 flex items-center gap-2">
                  <input type="checkbox" checked={reverseCharge} onChange={(e) => setReverseCharge(e.target.checked)} className="accent-[var(--primary)]" />
                  <Label className="mb-0">Reverse Charge (GST payable by recipient)</Label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card className="lg:sticky lg:top-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span className="text-text">{money(totals.subtotal)}</span></div>
                <div className="flex justify-between text-muted"><span>Tax (GST)</span><span className="text-text">{money(totals.tax)}</span></div>
                {isNonTaxable && <div className="flex justify-between text-muted"><span>Bill of supply (non-taxable)</span><Badge variant="info" size="sm">Non-taxable</Badge></div>}
                <div className="flex justify-between text-muted"><span>Discount</span><span className="text-text">−{money(Number(discount) || 0)}</span></div>
                {tcsOn && totals.tcsAmt > 0 && <div className="flex justify-between text-muted"><span>TCS</span><span className="text-text">{money(totals.tcsAmt)}</span></div>}
                {tdsOn && totals.tdsAmt > 0 && <div className="flex justify-between text-muted"><span>TDS</span><span className="text-text">−{money(totals.tdsAmt)}</span></div>}
                {roundOn && <div className="flex justify-between text-muted"><span>Round off</span><span className="text-text">{money(totals.roundOff)}</span></div>}
                <div className="border-t border-border pt-3 flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">{money(totals.total)}</span></div>
                <div className="flex justify-between text-muted"><span>Received</span><span className="text-text">{money(totals.received)}</span></div>
                <div className="flex justify-between text-muted"><span>Balance</span><span className={cn('font-semibold', totals.balance > 0 ? 'text-amber-500' : 'text-emerald-500')}>{money(totals.balance)}</span></div>
              </div>
              {termsOn && !isPayment && (
                <p className="text-xs text-muted mt-4 border-t border-border pt-3">{termsText}</p>
              )}
              <div className="flex flex-col gap-2 mt-5">
                <Button onClick={save}><Save className="w-4 h-4" /> Save {txnType(type)}</Button>
                {settings['txn.invoice_preview'] !== '0' && (
                  <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4" /> Preview invoice</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Invoice preview" size="lg">
        <div className="border border-border rounded-xl p-6 bg-surface">
          <div className="flex items-start justify-between">
            <div>
              <div className="brand" style={{ fontSize: 20 }}>{settings['general.firm_name'] || 'Lux'}<span>Infra</span></div>
              <div className="text-xs text-muted mt-1">{settings['general.firm_gstin'] ? `GSTIN ${settings['general.firm_gstin']}` : ''}</div>
              {settings['general.firm_pan'] && <div className="text-xs text-muted">PAN {settings['general.firm_pan']}</div>}
              {settings['general.firm_phone'] && <div className="text-xs text-muted">Ph: {settings['general.firm_phone']}</div>}
              {settings['general.firm_email'] && <div className="text-xs text-muted">{settings['general.firm_email']}</div>}
              {settings['general.firm_state'] && <div className="text-xs text-muted">State: {settings['general.firm_state']}{settings['general.firm_state_code'] ? ` (Code ${settings['general.firm_state_code']})` : ''}</div>}
              <div className="text-xs text-muted">{settings['general.firm_address']}</div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text">{txnType(type)}</p>
              {autoInvoiceNo && <p className="text-xs text-muted">{settings['general.firm_name'] ? 'Invoice No' : '#'}{type === 'ESTIMATE' ? ' EST' : type === 'DELIVERY_CHALLAN' ? ' DC' : type === 'PROFORMA' ? ' PF' : ' INV'}—auto</p>}
              <p className="text-xs text-muted">Date {date}</p>
              {dueDate && dueDate !== date && <p className="text-xs text-muted">Due {dueDate}</p>}
              {stateOn && <p className="text-xs text-muted">Place of Supply: {stateOfSupply || '—'}</p>}
              {reverseCharge && <p className="text-xs text-muted">Reverse charge</p>}
            </div>
          </div>
          <table className="w-full text-sm mt-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium text-muted py-2">Item</th>
                <th className="text-right font-medium text-muted py-2">Qty</th>
                <th className="text-right font-medium text-muted py-2">Rate</th>
                <th className="text-right font-medium text-muted py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.filter((l) => l.itemName).map((l, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-2">{l.itemName}</td>
                  <td className="text-right py-2">{l.qty}</td>
                  <td className="text-right py-2">{money(l.rate)}</td>
                  <td className="text-right py-2">{money(l.qty * l.rate)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right font-semibold py-3">Total</td>
                <td className="text-right font-bold text-primary py-3">{money(totals.total)}</td>
              </tr>
            </tfoot>
          </table>
          {termsOn && <p className="text-xs text-muted mt-4">{termsText}</p>}
          {settings['general.firm_bank_account'] && (
            <div className="text-xs text-muted mt-4 pt-3 border-t border-border">
              <p className="font-semibold text-text mb-1">Bank Details</p>
              {settings['general.firm_bank_name'] && <p>{settings['general.firm_bank_name']}</p>}
              {settings['general.firm_bank_holder'] && <p>Account Holder: {settings['general.firm_bank_holder']}</p>}
              <p>Account No: {settings['general.firm_bank_account']}</p>
              {settings['general.firm_bank_ifsc'] && <p>IFSC: {settings['general.firm_bank_ifsc']}</p>}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

const txnType = (t: string) =>
  t === 'SALE' ? 'Sale' : t === 'PURCHASE' ? 'Purchase' : t === 'ESTIMATE' ? 'Estimate'
  : t === 'PAYMENT_IN' ? 'Payment-In' : t === 'PAYMENT_OUT' ? 'Payment-Out'
  : t === 'SALE_ORDER' ? 'Sale Order' : t === 'PURCHASE_ORDER' ? 'Purchase Order' : 'Delivery Challan'
