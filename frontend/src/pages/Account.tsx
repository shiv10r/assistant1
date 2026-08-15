import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Settings, BackupStatus, FirebaseVersion } from '../api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Select, Label, Button, Badge } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { usePlan } from '../hooks/usePlan'
import { Building2, Phone, MapPin, Banknote, BadgeIndianRupee, Save, CheckCircle2, XCircle, Loader2, Crown, CreditCard, Settings2, HardDrive, Cloud, Bell, ShieldCheck, Database, Info } from 'lucide-react'
import { cn } from '../lib/utils'
import { Link } from 'react-router-dom'

const STATE_LIST = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const BUSINESS_TYPES = ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'OPC', 'Trust / Society', 'Other']

function Field({ label, value, onChange, placeholder, type, list }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  list?: string[]
}) {
  return (
    <div>
      <Label>{label}</Label>
      {list ? (
        <Select value={value} onValueChange={onChange}>
          <option value="">Select…</option>
          {list.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      ) : (
        <Input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  )
}

function ServiceRow({ icon, title, state, note, action }: {
  icon: React.ReactNode
  title: string
  state: 'ok' | 'warn' | 'off'
  note: string
  action?: React.ReactNode
}) {
  const tone = state === 'ok' ? 'text-emerald-500' : state === 'warn' ? 'text-amber-500' : 'text-text/40'
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className={cn('text-xs mt-0.5', tone)}>{note}</p>
      </div>
      {action}
    </div>
  )
}

const PLAN_LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' }

export default function Account() {
  const { toast } = useToast()
  const { plan, isPremium, setPlan } = usePlan()
  const [s, setS] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [backup, setBackup] = useState<BackupStatus | null>(null)
  const [firebase, setFirebase] = useState<FirebaseVersion | null>(null)
  const [drive, setDrive] = useState<{ configured: boolean; hasCredentials: boolean; folder?: string; email?: string } | null>(null)
  const [pushDevices, setPushDevices] = useState<number>(0)

  useEffect(() => {
    api.billing.settings().then(setS).catch(() => {})
    api.backupStatus().then(setBackup).catch(() => {})
    api.firebaseVersion().then(setFirebase).catch(() => {})
    api.integrations.driveStatus().then(setDrive).catch(() => {})
    api.pushDevices().then((d) => setPushDevices(d.length)).catch(() => {})
  }, [])

  const set = (k: string) => (v: string) => setS((p) => ({ ...p, [k]: v }))

  const saveFirm = async () => {
    const keys = [
      'general.firm_name', 'general.owner_name', 'general.business_type', 'general.firm_gstin', 'general.firm_pan',
      'general.firm_state_code',
      'general.firm_phone', 'general.firm_email', 'general.firm_website',
      'general.firm_address', 'general.firm_city', 'general.firm_state', 'general.firm_pincode',
      'bank.bank_name', 'bank.acc_no', 'bank.ifsc', 'bank.upi',
      'general.firm_bank_name', 'general.firm_bank_account', 'general.firm_bank_ifsc', 'general.firm_bank_holder',
      'print.footer_note', 'print.amount_words', 'general.firm_logo',
    ]
    setSaving(true)
    try {
      for (const k of keys) await api.billing.setSetting(k, s[k] || '')
      setMsg({ ok: true, text: 'Firm profile saved successfully.' })
      toast({ title: 'Firm profile saved' })
      setTimeout(() => setMsg(null), 3000)
    } catch (e) {
      setMsg({ ok: false, text: String(e) })
      toast({ title: 'Could not save profile', description: String(e), variant: 'error' })
    }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Account</h1>
          <div className="muted">Your firm profile, billing, services and data</div>
        </div>
        <Button onClick={saveFirm} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Profile</>}
        </Button>
      </div>

      {msg && (
        <div className={cn('mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border', msg.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500')}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Plan & profile summary */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xl font-bold shrink-0">
              {(s['general.firm_name'] || 'Lux').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg truncate">{s['general.firm_name'] || 'VSR Systems'}</p>
                <Badge variant={isPremium ? 'success' : 'outline'}><Crown className="w-3 h-3" /> {PLAN_LABEL[plan] ?? 'Free'}</Badge>
              </div>
              <p className="text-sm text-muted mt-0.5 truncate">
                {[s['general.firm_city'], s['general.firm_state']].filter(Boolean).join(', ') || 'Set your firm details below'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPremium && <Button size="sm" onClick={() => setPlan('pro')}><Crown className="w-4 h-4" /> Activate Pro</Button>}
              <Link to="/plans" className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg bg-surface border border-border text-text hover:bg-surface-hover"><CreditCard className="w-4 h-4" /> Plans</Link>
              <Link to="/settings" className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg text-text hover:bg-surface"><Settings2 className="w-4 h-4" /> Settings</Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Identity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Business Identity</CardTitle>
          <CardDescription>These details appear on invoices, quotes and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Firm Name *" value={s['general.firm_name'] || ''} onChange={set('general.firm_name')} placeholder="VSR Systems Interiors" />
            <Field label="Owner / Proprietor" value={s['general.owner_name'] || ''} onChange={set('general.owner_name')} placeholder="Full name" />
            <Field label="Business Type" value={s['general.business_type'] || ''} onChange={set('general.business_type')} list={BUSINESS_TYPES} />
            <Field label="GSTIN" value={s['general.firm_gstin'] || ''} onChange={set('general.firm_gstin')} placeholder="29AAACL1234A1Z5" />
            <Field label="PAN" value={s['general.firm_pan'] || ''} onChange={set('general.firm_pan')} placeholder="AABCL1234F" />
            <Field label="Firm State Code" value={s['general.firm_state_code'] || ''} onChange={set('general.firm_state_code')} placeholder="29 (for e-invoice Stcd)" />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> Contact Details</CardTitle>
          <CardDescription>How clients and vendors reach you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Phone / Mobile" value={s['general.firm_phone'] || ''} onChange={set('general.firm_phone')} placeholder="+91 98765 43210" type="tel" />
            <Field label="Email" value={s['general.firm_email'] || ''} onChange={set('general.firm_email')} placeholder="hello@vsrsystems.com" type="email" />
            <Field label="Website" value={s['general.firm_website'] || ''} onChange={set('general.firm_website')} placeholder="www.vsrsystems.com" />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Registered Address</CardTitle>
          <CardDescription>Used as the bill-to / ship-from address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Street Address</Label>
              <Textarea value={s['general.firm_address'] || ''} onChange={(e) => setS({ ...s, 'general.firm_address': e.target.value })} placeholder="123, Business Park, Outer Ring Road" rows={2} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="City" value={s['general.firm_city'] || ''} onChange={set('general.firm_city')} placeholder="Bengaluru" />
              <Field label="State" value={s['general.firm_state'] || ''} onChange={set('general.firm_state')} list={STATE_LIST} />
              <Field label="PIN Code" value={s['general.firm_pincode'] || ''} onChange={set('general.firm_pincode')} placeholder="560103" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5 text-primary" /> Bank Details</CardTitle>
          <CardDescription>For receiving payments and reference on invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Bank Name" value={s['bank.bank_name'] || ''} onChange={set('bank.bank_name')} placeholder="HDFC Bank" />
            <Field label="Account Number" value={s['bank.acc_no'] || ''} onChange={set('bank.acc_no')} placeholder="XXXXXXXX1234" />
            <Field label="IFSC" value={s['bank.ifsc'] || ''} onChange={set('bank.ifsc')} placeholder="HDFC0001234" />
            <Field label="UPI ID" value={s['bank.upi'] || ''} onChange={set('bank.upi')} placeholder="firm@okhdfcbank" />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted mb-3">Bank details on GST invoices (BANK DETAILS block)</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank Name (invoice)" value={s['general.firm_bank_name'] || ''} onChange={set('general.firm_bank_name')} placeholder="HDFC Bank" />
              <Field label="Account No (invoice)" value={s['general.firm_bank_account'] || ''} onChange={set('general.firm_bank_account')} placeholder="50100234567890" />
              <Field label="IFSC (invoice)" value={s['general.firm_bank_ifsc'] || ''} onChange={set('general.firm_bank_ifsc')} placeholder="HDFC0001234" />
              <Field label="Account Holder (invoice)" value={s['general.firm_bank_holder'] || ''} onChange={set('general.firm_bank_holder')} placeholder="VSR Systems Pvt Ltd" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BadgeIndianRupee className="w-5 h-5 text-primary" /> Invoicing Preferences</CardTitle>
          <CardDescription>Invoice-level defaults</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Logo URL</Label>
                <Input value={s['general.firm_logo'] || ''} onChange={(e) => setS({ ...s, 'general.firm_logo': e.target.value })} placeholder="https://…/logo.png" />
              </div>
              <div>
                <Label>Amount in Words</Label>
                <Select value={s['print.amount_words'] || ''} onValueChange={set('print.amount_words')}>
                  <option value="">Not set</option>
                  <option value="1">Show amount in words on invoices</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Invoice Footer / Note</Label>
              <Textarea value={s['print.footer_note'] || ''} onChange={(e) => setS({ ...s, 'print.footer_note': e.target.value })} placeholder="e.g. Thank you for your business! Payments within 15 days." rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected services */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Cloud className="w-5 h-5 text-primary" /> Connected Services</CardTitle>
          <CardDescription>Backup, notifications and cloud status</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <ServiceRow
            icon={<HardDrive className="w-4 h-4" />}
            title="Google Drive backup"
            state={drive?.configured ? 'ok' : drive?.hasCredentials ? 'warn' : 'off'}
            note={drive?.configured ? `Backing up to ${drive.folder}${drive.email ? ` · ${drive.email}` : ''}` : drive?.hasCredentials ? 'Credentials set — connect via Integrations' : 'Not configured'}
            action={<Link to="/integrations" className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-transparent text-text hover:bg-surface whitespace-nowrap">Set up</Link>}
          />
          <ServiceRow
            icon={<Database className="w-4 h-4" />}
            title="Cloud sync"
            state={backup?.enabled ? 'ok' : 'off'}
            note={backup?.enabled ? `Turso mirror ${backup.localRows ?? 0} local records synced` : 'Turso not configured'}
          />
          <ServiceRow
            icon={<Cloud className="w-4 h-4" />}
            title="Firebase mirror"
            state={firebase?.enabled ? 'ok' : 'off'}
            note={firebase?.enabled ? `Auto-restore on redeploy · v${firebase.version ?? 0}` : 'Firebase not configured'}
            action={firebase?.enabled ? <Link to="/backup" className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-transparent text-text hover:bg-surface whitespace-nowrap">Manage</Link> : undefined}
          />
          <ServiceRow
            icon={<Bell className="w-4 h-4" />}
            title="Push notifications"
            state={pushDevices > 0 ? 'ok' : 'warn'}
            note={pushDevices > 0 ? `${pushDevices} device(s) receiving alerts` : 'No device registered yet'}
            action={<Link to="/backup" className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-transparent text-text hover:bg-surface whitespace-nowrap">Enable</Link>}
          />
        </CardContent>
      </Card>

      {/* Account security + app info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><BadgeIndianRupee className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-text">Default login is <Badge variant="outline" size="sm">admin</Badge></p>
                <p className="text-sm text-muted mt-0.5">Password set via <code className="text-primary">AUTH_PASS</code> server env variable.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> App &amp; Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Database className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-text">Data is stored on the backend (SQLite)</p>
                <p className="text-sm text-muted mt-0.5">Back up to Trail Tech services in <Link className="text-primary hover:underline" to="/backup">Backup &amp; Sync</Link> or Drive above.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
