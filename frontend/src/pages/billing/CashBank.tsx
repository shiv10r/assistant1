import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import type { BankAccount, CashEntry } from '../../api'
import { Card, CardContent, Badge, Button, Input, Textarea, Label, Modal, Empty, money, todayISO, fmtDate } from '../../components/ui'
import { Banknote, Landmark, Plus, Minus, Pencil, Trash2, Wallet, PiggyBank, CreditCard, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

function blankBank(): BankAccount {
  return { id: 0, name: '', accNo: '', ifsc: '', upiId: '', openingBalance: 0, asOf: todayISO() }
}

export default function CashBank() {
  const [balance, setBalance] = useState(0)
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [err, setErr] = useState('')
  const [cashOpen, setCashOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [bankForm, setBankForm] = useState<BankAccount>(blankBank())
  const [savingBank, setSavingBank] = useState(false)
  const [ck, setCK] = useState('add')
  const [cAmt, setCAmt] = useState('')
  const [cDate, setCDate] = useState(todayISO())
  const [cDesc, setCDesc] = useState('')

  const load = () => Promise.all([api.billing.cash(), api.billing.banks()])
    .then(([c, b]) => { setBalance(c.balance); setEntries(c.entries); setBanks(b) })
    .catch(() => {})
  useEffect(() => { load() }, [])

  const totalBank = useMemo(() => banks.reduce((s, b) => s + b.openingBalance, 0), [banks])

  const addCash = async () => {
    const amt = Number(cAmt)
    if (!cAmt || amt <= 0) { setErr('Enter a valid amount'); return }
    try {
      await api.billing.adjustCash({ id: 0, kind: ck, amount: amt, date: cDate || todayISO(), description: cDesc })
      setErr('')
      setCashOpen(false); setCAmt(''); setCDesc('')
      load()
    } catch (e) { setErr(String(e)) }
  }

  const openAddBank = () => { setBankForm(blankBank()); setErr(''); setBankOpen(true) }
  const openEditBank = (b: BankAccount) => { setBankForm({ ...b }); setErr(''); setBankOpen(true) }

  const saveBank = async () => {
    if (!bankForm.name.trim()) { setErr('Bank name is required'); return }
    if (bankForm.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankForm.ifsc.toUpperCase())) { setErr('IFSC code looks invalid (e.g. HDFC0001234)'); return }
    setSavingBank(true)
    try {
      await api.billing.saveBank({
        ...bankForm,
        name: bankForm.name.trim(),
        ifsc: bankForm.ifsc.toUpperCase(),
        openingBalance: Number(bankForm.openingBalance) || 0,
        asOf: bankForm.asOf || todayISO(),
      })
      setErr('')
      setBankOpen(false)
      load()
    } catch (e) { setErr(String(e)) }
    finally { setSavingBank(false) }
  }

  const removeBank = async (b: BankAccount) => {
    if (!confirm(`Delete bank account "${b.name}"?`)) return
    try {
      await api.billing.deleteBank(b.id)
      load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Cash & Bank</h1>
          <div className="muted">In-hand cash and your bank accounts</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setCK('add'); setCAmt(''); setCDesc(''); setCDate(todayISO()); setErr(''); setCashOpen(true) }}>
            <Plus className="w-4 h-4" /> Adjust Cash
          </Button>
          <Button onClick={openAddBank}><Landmark className="w-4 h-4" /> Add Bank Account</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Kpi label="Cash In Hand" value={money(balance)} icon={<Wallet className="w-5 h-5" />} tone="emerald" />
        <Kpi label="Bank Balance" value={money(totalBank)} icon={<Landmark className="w-5 h-5" />} tone="violet" />
        <Kpi label="Bank Accounts" value={String(banks.length)} icon={<PiggyBank className="w-5 h-5" />} tone="cyan" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cash */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold m-0">Cash Entries</h2>
              <Badge variant="success" size="sm" className="capitalize">{balance >= 0 ? 'In hand' : 'Negative'}</Badge>
            </div>
            {entries.length === 0 ? (
              <Empty icon={<Banknote className="w-12 h-12" />} title="No cash adjustments yet" description="Record cash added or reduced from your register" />
            ) : (
              <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', e.kind === 'add' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                      {e.kind === 'add' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text capitalize">{e.kind === 'add' ? 'Cash added' : 'Cash reduced'}</p>
                      <p className="text-xs text-muted mt-0.5">{e.description || '—'} · {fmtDate(e.date)}</p>
                    </div>
                    <span className={cn('font-semibold', e.kind === 'add' ? 'text-emerald-500' : 'text-red-500')}>
                      {e.kind === 'add' ? '+' : '−'}{money(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banks */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold m-0">Bank Accounts</h2>
              <Button size="sm" variant="outline" onClick={openAddBank}><Plus className="w-4 h-4" /> Add</Button>
            </div>
            {banks.length === 0 ? (
              <Empty icon={<Landmark className="w-12 h-12" />} title="No bank accounts" description="Add your bank details to track balances" action={<Button onClick={openAddBank}><Landmark className="w-4 h-4" /> Add Bank Account</Button>} />
            ) : (
              <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                {banks.map((b) => (
                  <div key={b.id} className="p-4 hover:bg-surface/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text truncate">{b.name || 'Unnamed account'}</p>
                          <p className="text-xs text-muted truncate">A/C •••• {b.accNo ? b.accNo.slice(-4) : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditBank(b)} aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeBank(b)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-lg font-bold text-text">{money(b.openingBalance)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted">
                      {b.ifsc && <span className="inline-flex items-center gap-1"><CreditCard className="w-3 h-3" />{b.ifsc}</span>}
                      {b.upiId && <span className="inline-flex items-center gap-1"><Banknote className="w-3 h-3" />{b.upiId}</span>}
                      {b.asOf && <span>as of {fmtDate(b.asOf)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {err && <div className="mt-4 p-3 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-500">{err}</div>}

      {/* Adjust Cash modal */}
      <Modal open={cashOpen} onClose={() => setCashOpen(false)} title="Adjust Cash" description="Record a manual cash entry" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); addCash() }} className="space-y-5">
          <div>
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCK('add')}
                className={cn('flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all', ck === 'add' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-surface border-border text-muted')}
              >
                <Plus className="w-4 h-4" /> Add cash
              </button>
              <button
                type="button"
                onClick={() => setCK('reduce')}
                className={cn('flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all', ck === 'reduce' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-surface border-border text-muted')}
              >
                <Minus className="w-4 h-4" /> Reduce cash
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="camt" required>Amount (₹)</Label>
              <Input id="camt" type="number" min="0" step="0.01" value={cAmt} onChange={(e) => setCAmt(e.target.value)} placeholder="0" autoFocus />
            </div>
            <div>
              <Label htmlFor="cdate">Date</Label>
              <Input id="cdate" type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="cnote">Note</Label>
            <Textarea id="cnote" value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="Reason for this entry" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setCashOpen(false)}>Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </Modal>

      {/* Bank account modal */}
      <Modal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        title={bankForm.id ? 'Edit Bank Account' : 'Add Bank Account'}
        description="Enter your bank details for balance tracking"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveBank() }} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bname" required>Bank Name</Label>
              <Input id="bname" value={bankForm.name} onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })} placeholder="e.g. HDFC Bank" autoFocus />
            </div>
            <div>
              <Label htmlFor="bacc">Account Number</Label>
              <Input id="bacc" value={bankForm.accNo} onChange={(e) => setBankForm({ ...bankForm, accNo: e.target.value })} placeholder="11-digit account number" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bifsc">IFSC Code</Label>
              <Input id="bifsc" value={bankForm.ifsc} onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })} placeholder="HDFC0001234" />
            </div>
            <div>
              <Label htmlFor="bupi">UPI ID</Label>
              <Input id="bupi" value={bankForm.upiId} onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })} placeholder="name@bank" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bopening">Opening Balance (₹)</Label>
              <Input id="bopening" type="number" step="0.01" value={bankForm.openingBalance || ''} onChange={(e) => setBankForm({ ...bankForm, openingBalance: Number(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div>
              <Label htmlFor="basof">Balance As Of</Label>
              <Input id="basof" type="date" value={bankForm.asOf} onChange={(e) => setBankForm({ ...bankForm, asOf: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setBankOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={savingBank}>{savingBank ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : (bankForm.id ? 'Save Changes' : 'Add Account')}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function Kpi({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: 'violet' | 'cyan' | 'amber' | 'emerald' }) {
  const tones = {
    violet: 'bg-violet-500/10 text-violet-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    amber: 'bg-amber-500/10 text-amber-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
  }
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-xl font-bold text-text mt-1">{value}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tones[tone])}>{icon}</div>
      </CardContent>
    </Card>
  )
}
