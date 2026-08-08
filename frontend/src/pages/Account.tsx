import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Settings } from '../api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Select, Label, Button, Badge } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { Building2, Phone, MapPin, Banknote, BadgeIndianRupee, Save, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

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

export default function Account() {
  const { toast } = useToast()
  const [s, setS] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => { api.billing.settings().then(setS).catch(() => {}) }, [])

  const set = (k: string) => (v: string) => setS((p) => ({ ...p, [k]: v }))

  const saveFirm = async () => {
    const keys = [
      'general.firm_name', 'general.owner_name', 'general.business_type', 'general.firm_gstin', 'general.firm_pan',
      'general.firm_phone', 'general.firm_email', 'general.firm_website',
      'general.firm_address', 'general.firm_city', 'general.firm_state', 'general.firm_pincode',
      'bank.bank_name', 'bank.acc_no', 'bank.ifsc', 'bank.upi',
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
          <div className="muted">Your firm profile, contact details and bank information</div>
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

      {/* Business Identity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Business Identity</CardTitle>
          <CardDescription>These details appear on invoices, quotes and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Firm Name *" value={s['general.firm_name'] || ''} onChange={set('general.firm_name')} placeholder="LuxInfra Interiors" />
            <Field label="Owner / Proprietor" value={s['general.owner_name'] || ''} onChange={set('general.owner_name')} placeholder="Full name" />
            <Field label="Business Type" value={s['general.business_type'] || ''} onChange={set('general.business_type')} list={BUSINESS_TYPES} />
            <Field label="GSTIN" value={s['general.firm_gstin'] || ''} onChange={set('general.firm_gstin')} placeholder="29AAACL1234A1Z5" />
            <Field label="PAN" value={s['general.firm_pan'] || ''} onChange={set('general.firm_pan')} placeholder="AABCL1234F" />
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
            <Field label="Email" value={s['general.firm_email'] || ''} onChange={set('general.firm_email')} placeholder="hello@luxinfra.com" type="email" />
            <Field label="Website" value={s['general.firm_website'] || ''} onChange={set('general.firm_website')} placeholder="www.luxinfra.com" />
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

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><BadgeIndianRupee className="w-5 h-5" /></div>
            <div>
              <p className="font-medium text-text">Account Security</p>
              <p className="text-sm text-muted">Default login is <Badge variant="outline" size="sm">admin</Badge> · password set via <code className="text-primary">AUTH_PASS</code> server env variable.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
