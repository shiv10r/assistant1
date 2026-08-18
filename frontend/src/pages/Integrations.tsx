import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { IntegrationStatus, BizTxn } from '../api'
import { Card, CardContent, Badge, Button, Label, Input, Select, money } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { FiMail, FiHardDrive, FiRefreshCw, FiExternalLink, FiCheckCircle, FiXCircle, FiCopy, FiSmartphone } from 'react-icons/fi'
import { IoSparkles, IoQrCode } from 'react-icons/io5'
import { cn } from '../lib/utils'
import type { UpiLinkResult } from '../api'

function StatusPill({ ok }: { ok: boolean }) {
  return ok
    ? <Badge variant="success" size="sm"><FiCheckCircle className="w-3 h-3" /> Configured</Badge>
    : <Badge variant="warning" size="sm"><FiXCircle className="w-3 h-3" /> Not configured</Badge>
}

export default function Integrations() {
  const { toast } = useToast()
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [txns, setTxns] = useState<BizTxn[]>([])
  const [txnId, setTxnId] = useState('')
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

  // ---- UPI (free, works with PhonePe / GPay / Paytm) ----
  const [upiId, setUpiId] = useState('')
  const [upiAmount, setUpiAmount] = useState('')
  const [upiNote, setUpiNote] = useState('')
  const [upiResult, setUpiResult] = useState<UpiLinkResult | null>(null)
  const [upiBusy, setUpiBusy] = useState('')

  useEffect(() => {
    if (status?.upiId) setUpiId(status.upiId)
  }, [status?.upiId])

  const saveUpiId = async () => {
    const id = upiId.trim()
    if (!id || !id.includes('@')) { toast({ title: 'Enter a valid UPI ID', description: 'e.g. yourname@okhdfcbank', variant: 'error' }); return }
    setUpiBusy('upi-save')
    try {
      await api.billing.setSetting('payment.upi_id', id)
      loadStatus()
      toast({ title: 'UPI ID saved', description: 'Customers can now pay you by UPI / PhonePe / GPay' })
    } catch (e) { toast({ title: 'Could not save UPI ID', description: String(e), variant: 'error' }) } finally { setUpiBusy('') }
  }

  const generateUpi = async () => {
    const amt = Number(upiAmount)
    if (!amt || amt <= 0) { toast({ title: 'Enter a valid amount (₹)', variant: 'error' }); return }
    setUpiBusy('upi-link')
    try {
      const r = await api.integrations.upiLink(amt, upiNote.trim() || undefined)
      if (r.ok) { setUpiResult(r) }
      else toast({ title: r.code === 'not_configured' ? 'No UPI ID set' : 'Could not create UPI link', description: r.message || r.error || 'Unknown error', variant: 'error' })
    } catch (e) { toast({ title: 'Could not create UPI link', description: String(e), variant: 'error' }) } finally { setUpiBusy('') }
  }

  const copyUpi = async () => {
    if (!upiResult?.upiUrl) return
    try { await navigator.clipboard.writeText(upiResult.upiUrl); toast({ title: 'UPI link copied', description: 'Paste it in WhatsApp, SMS or email' }) }
    catch { toast({ title: 'Could not copy', variant: 'error' }) }
  }

  const runDriveBackup = async () => {
    setDriveBusy(true)
    try {
      const r = await api.integrations.driveBackup()
      if (r.ok) toast({ title: 'Backup complete', description: r.message })
      else toast({ title: 'Drive backup unavailable', description: r.message || r.error || 'Unknown error', variant: 'error' })
    } catch (e) { toast({ title: 'Drive backup failed', description: String(e), variant: 'error' }) } finally { setDriveBusy(false) }
  }

  const connectDrive = async () => {
    setBusy('drive-connect')
    try {
      const r = await api.integrations.driveAuthUrl()
      if (r.ok && r.url) window.open(r.url, '_blank', 'noopener')
      else toast({ title: r.code === 'not_configured' ? 'Drive not configured' : 'Could not start Drive setup', description: r.message || 'Unknown error', variant: 'error' })
    } catch (e) { toast({ title: 'Could not start Drive setup', description: String(e), variant: 'error' }) } finally { setBusy('') }
  }

  const disconnectDrive = async () => {
    if (!confirm('Disconnect Google Drive? Backups will stop until you reconnect.')) return
    try {
      await api.integrations.driveDisconnect()
      loadStatus()
      toast({ title: 'Google Drive disconnected' })
    } catch (e) { toast({ title: 'Could not disconnect', description: String(e), variant: 'error' }) }
  }

  const cards = [
    {
      key: 'email' as const,
      title: 'Email Invoices',
      desc: 'Send invoice PDFs to parties with a saved email address.',
      icon: <FiMail className="w-6 h-6" />,
      ok: status?.email === 'configured',
      hint: status?.email === 'configured' ? `Provider: ${status.emailProvider}` : 'Add RESEND_API_KEY (or SENDGRID_API_KEY) and redeploy.',
    },
    {
      key: 'upi' as const,
      title: 'UPI Payments',
      desc: 'Collect money via PhonePe, GPay & Paytm — 100% free.',
      icon: <FiSmartphone className="w-6 h-6" />,
      ok: status?.upi === 'configured',
      hint: status?.upi === 'configured' ? `Paying to: ${status.upiId}` : 'Enter your UPI ID below — no account, no KYC needed.',
    },
    {
      key: 'drive' as const,
      title: 'Google Drive Backup',
      desc: 'Back up the whole database to Google Drive.',
      icon: <FiHardDrive className="w-6 h-6" />,
      ok: status?.drive === 'configured',
      hint: status?.drive === 'configured' ? `Folder: ${status.driveFolder}` : (status?.drive === 'needs_connect' ? 'Credentials found — connect your Google account below.' : 'Add GOOGLE_DRIVE_CLIENT_ID + GOOGLE_DRIVE_CLIENT_SECRET and redeploy.'),
    },
    {
      key: 'vision' as const,
      title: 'AI Vision Progress',
      desc: 'Estimate site progress % from a photo (OpenRouter).',
      icon: <IoSparkles className="w-6 h-6" />,
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
        <Button variant="outline" onClick={loadStatus}><FiRefreshCw className="w-4 h-4" /> Refresh</Button>
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
                <FiMail className="w-4 h-4 text-primary" />
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
                  <FiExternalLink className="w-4 h-4" /> {busy === 'einvoice' ? 'Building…' : 'GST e-Invoice JSON'}
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
                <FiSmartphone className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-text m-0">Collect a UPI payment</h2>
              </div>

              <div className="p-4 rounded-xl bg-surface2/60 border border-border space-y-3">
                <div>
                  <Label htmlFor="upiid">Your UPI ID (where money is received)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="upiid" type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okhdfcbank" className="flex-1" />
                    <Button variant="outline" onClick={saveUpiId} disabled={upiBusy === 'upi-save'}>{upiBusy === 'upi-save' ? 'Saving…' : 'Save'}</Button>
                  </div>
                  <p className="text-xs text-muted mt-1.5">Free forever — PhonePe, GPay, Paytm & every UPI app. Find your UPI ID in your bank's UPI app.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="uamt">Amount (₹)</Label>
                <Input id="uamt" type="number" min="0" step="0.01" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="unote">Note (optional)</Label>
                <Input id="unote" type="text" value={upiNote} onChange={(e) => setUpiNote(e.target.value)} placeholder="e.g. Invoice #5 — Dining table" className="mt-1" />
              </div>
              <Button onClick={generateUpi} disabled={upiBusy === 'upi-link'}>
                <IoQrCode className="w-4 h-4" /> {upiBusy === 'upi-link' ? 'Generating…' : 'Generate UPI link & QR'}
              </Button>

              {upiResult?.ok && upiResult.upiUrl && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiResult.qrData ?? '')}`}
                      alt="UPI QR code"
                      width={110}
                      height={110}
                      className="rounded-lg bg-white p-1.5 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text">Pay {money(upiResult.amountInr ?? 0)} to <span className="text-primary">{upiResult.upiId}</span></p>
                      <p className="text-sm text-muted mt-1 break-all">{upiResult.note}</p>
                      <p className="text-xs text-muted mt-2">Scan with any UPI app, or tap a wallet below:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <a href={upiResult.upiUrl} className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/20">UPI app</a>
                        <a href={upiResult.providers?.phonepe} className="text-xs font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/30 rounded-lg px-3 py-1.5 hover:bg-violet-500/20">PhonePe</a>
                        <a href={upiResult.providers?.gpay} className="text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/30 rounded-lg px-3 py-1.5 hover:bg-blue-500/20">GPay</a>
                        <a href={upiResult.providers?.paytm} className="text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/30 rounded-lg px-3 py-1.5 hover:bg-sky-500/20">Paytm</a>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyUpi} className="w-full">
                    <FiCopy className="w-4 h-4" /> Copy UPI link (send via WhatsApp)
                  </Button>
                  <p className="text-[11px] text-muted">Once paid, record the receipt in Billing → Transactions to update the party balance.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiHardDrive className="w-5 h-5 text-muted" />
            <div>
              <div className="font-medium text-text">Back up database to Google Drive</div>
              <div className="text-sm text-muted">
                {status?.drive === 'configured'
                  ? `Connected — snapshots land in the "${status.driveFolder}" folder on Drive.`
                  : 'Full database snapshot uploaded to a folder on your Drive.'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status?.drive !== 'configured' && status?.drive === 'needs_connect' && (
              <Button variant="outline" onClick={connectDrive} disabled={busy === 'drive-connect'}>
                <FiHardDrive className="w-4 h-4" /> {busy === 'drive-connect' ? 'Opening…' : 'Connect Google Drive'}
              </Button>
            )}
            <Button variant="outline" onClick={runDriveBackup} disabled={driveBusy || status?.drive !== 'configured'} title={status?.drive !== 'configured' ? 'Connect Google Drive first' : undefined}>
              <FiHardDrive className="w-4 h-4" /> {driveBusy ? 'Backing up…' : 'Run backup'}
            </Button>
            {status?.drive === 'configured' && (
              <Button variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={disconnectDrive}>
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-text mb-2">Where do I add these keys?</h2>
            <p className="text-sm text-muted mb-4">On Render: open your backend service → <b>Environment</b> → add the variables shown above, save, then deploy. On local dev, add them to <code className="text-xs bg-surface2 px-1.5 py-0.5 rounded">backend/.env</code> or your shell before running the API. No keys? Every feature stays hidden behind a friendly notice — nothing breaks.</p>
            <p className="text-sm text-muted mb-4">Google Drive is the one exception: after adding <code className="text-xs bg-surface2 px-1.5 py-0.5 rounded">GOOGLE_DRIVE_CLIENT_ID</code> + <code className="text-xs bg-surface2 px-1.5 py-0.5 rounded">GOOGLE_DRIVE_CLIENT_SECRET</code>, click <b>Connect Google Drive</b> once to authorise your account — no access token is ever needed in env vars.</p>
            <Link to="/txn" className="text-sm text-primary hover:underline font-medium">Open transactions →</Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
