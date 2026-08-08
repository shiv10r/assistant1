import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { IntegrationStatus, BizTxn } from '../api'
import { Card, CardContent, Badge, Button, Label, Input, Select, money } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { Mail, CreditCard, HardDrive, Sparkles, RefreshCw, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'

function StatusPill({ ok }: { ok: boolean }) {
  return ok
    ? <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3" /> Configured</Badge>
    : <Badge variant="warning" size="sm"><XCircle className="w-3 h-3" /> Not configured</Badge>
}

export default function Integrations() {
  const { toast } = useToast()
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [txns, setTxns] = useState<BizTxn[]>([])
  const [txnId, setTxnId] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState('')
  const [driveBusy, setDriveBusy] = useState(false)
  const [einvoice, setEinvoice] = useState<any>(null)

  const loadStatus = () => {
    api.integrations.status().then(setStatus).catch(() => setStatus(null))
    api.billing.txns().then((t) => { setTxns(t); if (t.length === 1) setTxnId(String(t[0].id)) }).catch(() => setTxns([]))
  }
  useEffect(() => { loadStatus() }, [])

  const sendEmail = async () => {
    if (!txnId) { toast({ title: 'Pick a transaction', variant: 'error' }); return }
    setBusy('email')
    try {
      const r = await api.integrations.emailInvoice(Number(txnId))
      if (r.ok) toast({ title: 'Invoice emailed', description: r.to })
      else toast({ title: r.code === 'not_configured' ? 'Email not configured' : 'Could not email invoice', description: r.message || r.error || 'Unknown error', variant: 'error' })
    } catch (e) { toast({ title: 'Could not email invoice', description: String(e), variant: 'error' }) } finally { setBusy('') }
  }

  const fetchEinvoice = async () => {
    if (!txnId) { toast({ title: 'Pick a transaction', variant: 'error' }); return }
    setBusy('einvoice')
    try {
      const r = await api.integrations.einvoice(Number(txnId))
      if (r.ok) { setEinvoice(r.payload); toast({ title: 'e-Invoice generated', description: r.txn?.refLabel }) }
      else toast({ title: 'Could not generate e-invoice', description: r.error, variant: 'error' })
    } catch (e) { toast({ title: 'Could not generate e-invoice', description: String(e), variant: 'error' }) } finally { setBusy('') }
  }

  const createOrder = async () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) { toast({ title: 'Enter a valid amount (₹)', variant: 'error' }); return }
    setBusy('razorpay')
    try {
      const r = await api.integrations.razorpayOrder(amt)
      if (r.ok) toast({ title: 'Payment order created', description: `Order ${r.orderId} · key ${r.keyId}` })
      else toast({ title: r.code === 'not_configured' ? 'Razorpay not configured' : 'Could not create order', description: r.message || r.error || 'Unknown error', variant: 'error' })
    } catch (e) { toast({ title: 'Could not create order', description: String(e), variant: 'error' }) } finally { setBusy('') }
  }

  const runDriveBackup = async () => {
    setDriveBusy(true)
    try {
      const r = await api.integrations.driveBackup()
      if (r.ok) toast({ title: 'Backup complete' })
      else toast({ title: 'Drive backup unavailable', description: r.message || r.error || 'Unknown error', variant: 'error' })
    } catch (e) { toast({ title: 'Drive backup failed', description: String(e), variant: 'error' }) } finally { setDriveBusy(false) }
  }

  const cards = [
    {
      key: 'email' as const,
      title: 'Email Invoices',
      desc: 'Send invoice PDFs to parties with a saved email address.',
      icon: <Mail className="w-6 h-6" />,
      ok: status?.email === 'configured',
      hint: status?.email === 'configured' ? `Provider: ${status.emailProvider}` : 'Add RESEND_API_KEY (or SENDGRID_API_KEY) and redeploy.',
    },
    {
      key: 'razorpay' as const,
      title: 'Razorpay Payments',
      desc: 'Create payment orders to collect money from customers.',
      icon: <CreditCard className="w-6 h-6" />,
      ok: status?.razorpay === 'configured',
      hint: status?.razorpay === 'configured' ? `Key ID: ${status.razorpayKeyId}` : 'Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET and redeploy.',
    },
    {
      key: 'drive' as const,
      title: 'Google Drive Backup',
      desc: 'Back up the whole database to Google Drive.',
      icon: <HardDrive className="w-6 h-6" />,
      ok: status?.drive === 'configured',
      hint: status?.drive === 'configured' ? `Folder: ${status.driveFolder}` : 'Add GOOGLE_DRIVE_ACCESS_TOKEN and redeploy.',
    },
    {
      key: 'vision' as const,
      title: 'AI Vision Progress',
      desc: 'Estimate site progress % from a photo (OpenRouter).',
      icon: <Sparkles className="w-6 h-6" />,
      ok: status?.vision === 'configured',
      hint: status?.vision === 'configured' ? `Model: ${status.visionModel}` : 'Add OPENROUTER_API_KEY and redeploy.',
    },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Integrations</h1>
          <div className="muted">Email, payments, backups and AI — all optional</div>
        </div>
        <Button variant="outline" onClick={loadStatus}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {cards.map((c) => (
          <Card key={c.key} className="mb-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', c.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface2 text-muted')}>{c.icon}</div>
                <StatusPill ok={c.ok} />
              </div>
              <h2 className="text-base font-semibold text-text mt-4 mb-1">{c.title}</h2>
              <p className="text-sm text-muted mb-3">{c.desc}</p>
              <p className="text-xs text-muted">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {txns.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2 mb-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-text m-0">Email an invoice</h2>
              </div>
              <div>
                <Label htmlFor="itxn">Transaction</Label>
                <Select id="itxn" value={txnId} onValueChange={setTxnId} className="mt-1">
                  <option value="">Select…</option>
                  {txns.map((t) => <option key={t.id} value={String(t.id)}>{t.prefix || '#'}{t.refNo} · {money(t.total)}</option>)}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={sendEmail} disabled={busy === 'email'}>{busy === 'email' ? 'Sending…' : 'Send PDF invoice'}</Button>
                <Button variant="outline" onClick={fetchEinvoice} disabled={busy === 'einvoice'}>
                  <ExternalLink className="w-4 h-4" /> {busy === 'einvoice' ? 'Building…' : 'GST e-Invoice JSON'}
                </Button>
              </div>
              {einvoice && (
                <pre className="p-3 rounded-lg bg-surface2/60 border border-border text-xs text-muted overflow-auto max-h-56 whitespace-pre-wrap">
                  {JSON.stringify(einvoice, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-text m-0">Create a Razorpay order</h2>
              </div>
              <div>
                <Label htmlFor="amt">Amount (₹)</Label>
                <Input id="amt" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1" />
              </div>
              <Button onClick={createOrder} disabled={busy === 'razorpay'}>{busy === 'razorpay' ? 'Creating…' : 'Create payment order'}</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-muted" />
            <div>
              <div className="font-medium text-text">Back up database to Google Drive</div>
              <div className="text-sm text-muted">Full database snapshot uploaded to your Drive folder.</div>
            </div>
          </div>
          <Button variant="outline" onClick={runDriveBackup} disabled={driveBusy}>
            <HardDrive className="w-4 h-4" /> {driveBusy ? 'Backing up…' : 'Run backup'}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-text mb-2">Where do I add these keys?</h2>
            <p className="text-sm text-muted mb-4">On Render: open your backend service → <b>Environment</b> → add the variables shown above, save, then deploy. On local dev, add them to <code className="text-xs bg-surface2 px-1.5 py-0.5 rounded">backend/.env</code> or your shell before running the API. No keys? Every feature stays hidden behind a friendly notice — nothing breaks.</p>
            <Link to="/txn" className="text-sm text-primary hover:underline font-medium">Open transactions →</Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
