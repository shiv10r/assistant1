import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { Settings } from '../api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Select, Label, Button, Badge } from '../platform/ui'
import { useToast } from '../platform/ui'
import { usePlan } from '../hooks/usePlan'
import {
  FiPhone, FiMapPin, FiSave, FiCheckCircle, FiXCircle, FiLoader,
  FiCamera, FiCreditCard, FiSettings, FiHardDrive, FiCloud, FiBell, FiDatabase, FiInfo, FiTrash2, FiUser
} from 'react-icons/fi'
import { MdApartment, MdCurrencyRupee, MdWorkspacePremium, MdVerifiedUser } from 'react-icons/md'
import { cn, isValidMobile, mobileDigits } from '../lib/utils'
import { Link } from 'react-router-dom'
import { getEmail, getRole, getUsername, getUserProfile, saveUserProfile } from '../platform/auth'
import type { UserProfile } from '../platform/auth'

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
          <option value="">Select...</option>
          {list.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      ) : (
        <Input
          type={type || 'text'}
          value={value}
          onChange={(e) => onChange(type === 'tel' ? mobileDigits(e.target.value) : e.target.value)}
          placeholder={placeholder}
          inputMode={type === 'tel' ? 'numeric' : undefined}
          maxLength={type === 'tel' ? 10 : undefined}
          pattern={type === 'tel' ? '[0-9]{10}' : undefined}
        />
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

function avatarData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('The selected file is not a valid image.'))
      image.onload = () => {
        const scale = Math.min(1, 512 / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', .86))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export default function Account() {
  const username = getUsername() || 'User'
  const role = getRole()
  const { toast } = useToast()
  const { plan, isPremium, setPlan } = usePlan()
  const [s, setS] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [drive, setDrive] = useState<{ configured: boolean; hasCredentials: boolean; folder?: string; email?: string } | null>(null)
  const [pushDevices, setPushDevices] = useState<number>(0)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = getUserProfile(username)
    return { ...stored, email: stored.email || getEmail(), phone: mobileDigits(stored.phone) }
  })
  const avatarInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.billing.settings().then((settings) => setS({ ...settings, 'general.firm_phone': mobileDigits(settings['general.firm_phone'] || '') })).catch(() => {})
    api.integrations.driveStatus().then(setDrive).catch(() => {})
    api.pushDevices().then((d) => setPushDevices(d.length)).catch(() => {})
  }, [])

  const set = (k: string) => (v: string) => setS((p) => ({ ...p, [k]: v }))
  const setProfileField = (key: keyof UserProfile) => (value: string) => setProfile((current) => ({ ...current, [key]: value }))

  const uploadAvatar = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image is too large', description: 'Choose an image smaller than 5 MB.', variant: 'error' })
      return
    }
    try {
      setProfileField('avatar')(await avatarData(file))
    } catch (error) {
      toast({ title: 'Could not use image', description: String(error), variant: 'error' })
    }
  }

  const saveFirm = async () => {
    if ((profile.phone && !isValidMobile(profile.phone)) || (s['general.firm_phone'] && !isValidMobile(s['general.firm_phone']))) {
      const text = 'Enter a valid 10-digit mobile number.'
      setMsg({ ok: false, text })
      toast({ title: text, variant: 'error' })
      return
    }
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
      saveUserProfile(username, profile)
      for (const k of keys) await api.billing.setSetting(k, s[k] || '')
      setMsg({ ok: true, text: 'Account and business profile saved.' })
      toast({ title: 'Account profile saved' })
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
          <div className="muted">Your personal details, business identity and connected services</div>
        </div>
        <Button onClick={saveFirm} disabled={saving}>
          {saving ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving...</> : <><FiSave className="w-4 h-4" /> Save Profile</>}
        </Button>
      </div>

      {msg && (
        <div className={cn('mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border', msg.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500')}>
          {msg.ok ? <FiCheckCircle className="w-4 h-4" /> : <FiXCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/20" />
        <CardContent className="relative p-5 pt-0">
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <div className="-mt-10 shrink-0">
              <div className="w-24 h-24 overflow-hidden rounded-2xl border-4 border-surface bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {profile.avatar ? <img src={profile.avatar} alt={`${profile.displayName || username} avatar preview`} className="w-full h-full object-cover" /> : (profile.displayName || username).slice(0, 1).toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-text">{profile.displayName || username}</p>
              <p className="text-sm text-muted">@{username} <span className="mx-1">/</span> <span className="capitalize">{role}</span></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(event) => { void uploadAvatar(event.target.files?.[0]); event.target.value = '' }} />
              <Button type="button" variant="outline" size="sm" onClick={() => avatarInput.current?.click()}><FiCamera className="w-4 h-4" /> Upload avatar</Button>
              {profile.avatar && <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => setProfileField('avatar')('')}><FiTrash2 className="w-4 h-4" /> Remove</Button>}
            </div>
          </div>
          <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Display Name" value={profile.displayName} onChange={setProfileField('displayName')} placeholder={username} />
            <Field label="Email Address" value={profile.email} onChange={setProfileField('email')} placeholder="you@company.com" type="email" />
            <Field label="Phone Number" value={profile.phone} onChange={setProfileField('phone')} placeholder="9876543210" type="tel" />
            <Field label="Job Title" value={profile.jobTitle} onChange={setProfileField('jobTitle')} placeholder="Operations manager" />
          </div>
          <p className="mt-3 text-xs text-muted">Avatar and personal details are stored for this signed-in user on this device.</p>
        </CardContent>
      </Card>

      {/* Plan & business summary */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xl font-bold shrink-0">
              {(s['general.firm_name'] || 'Lux').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg truncate">{s['general.firm_name'] || 'VSR Systems'}</p>
                <Badge variant={isPremium ? 'success' : 'outline'}><MdWorkspacePremium className="w-3 h-3" /> {PLAN_LABEL[plan] ?? 'Free'}</Badge>
              </div>
              <p className="text-sm text-muted mt-0.5 truncate">
                {[s['general.firm_city'], s['general.firm_state']].filter(Boolean).join(', ') || 'Set your firm details below'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPremium && <Button size="sm" onClick={() => setPlan('pro')}><MdWorkspacePremium className="w-4 h-4" /> Activate Pro</Button>}
              <Link to="/plans" className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg bg-surface border border-border text-text hover:bg-surface-hover"><FiCreditCard className="w-4 h-4" /> Plans</Link>
              <Link to="/settings" className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg text-text hover:bg-surface"><FiSettings className="w-4 h-4" /> Settings</Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Identity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MdApartment className="w-5 h-5 text-primary" /> Business Identity</CardTitle>
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
          <CardTitle className="flex items-center gap-2"><FiPhone className="w-5 h-5 text-primary" /> Contact Details</CardTitle>
          <CardDescription>How clients and vendors reach you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Phone / Mobile" value={s['general.firm_phone'] || ''} onChange={set('general.firm_phone')} placeholder="9876543210" type="tel" />
            <Field label="Email" value={s['general.firm_email'] || ''} onChange={set('general.firm_email')} placeholder="hello@vsrsystems.com" type="email" />
            <Field label="Website" value={s['general.firm_website'] || ''} onChange={set('general.firm_website')} placeholder="www.vsrsystems.com" />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FiMapPin className="w-5 h-5 text-primary" /> Registered Address</CardTitle>
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
          <CardTitle className="flex items-center gap-2"><MdCurrencyRupee className="w-5 h-5 text-primary" /> Bank Details</CardTitle>
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
          <CardTitle className="flex items-center gap-2"><MdWorkspacePremium className="w-5 h-5 text-primary" /> Invoicing Preferences</CardTitle>
          <CardDescription>Invoice-level defaults</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Logo URL</Label>
                <Input value={s['general.firm_logo'] || ''} onChange={(e) => setS({ ...s, 'general.firm_logo': e.target.value })} placeholder="https://example.com/logo.png" />
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
          <CardTitle className="flex items-center gap-2"><FiCloud className="w-5 h-5 text-primary" /> Connected Services</CardTitle>
          <CardDescription>Integration and notification status for this account</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <ServiceRow
            icon={<FiHardDrive className="w-4 h-4" />}
            title="Google Drive backup"
            state={drive?.configured ? 'ok' : drive?.hasCredentials ? 'warn' : 'off'}
            note={drive?.configured ? `Backing up to ${drive.folder}${drive.email ? ` - ${drive.email}` : ''}` : drive?.hasCredentials ? 'Credentials set - connect via Integrations' : 'Not configured'}
            action={<Link to="/integrations" className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-transparent text-text hover:bg-surface whitespace-nowrap">Manage</Link>}
          />
          <ServiceRow
            icon={<FiBell className="w-4 h-4" />}
            title="Push notifications"
            state={pushDevices > 0 ? 'ok' : 'warn'}
            note={pushDevices > 0 ? `${pushDevices} device(s) receiving alerts` : 'No device registered yet'}
            action={<Link to="/settings" className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-transparent text-text hover:bg-surface whitespace-nowrap">Manage</Link>}
          />
        </CardContent>
      </Card>

      {/* Account security + app info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MdVerifiedUser className="w-5 h-5 text-primary" /> Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><FiUser className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-text">Signed in as <Badge variant="outline" size="sm">{username}</Badge></p>
                <p className="text-sm text-muted mt-0.5">Your current access role is <span className="capitalize text-primary">{role}</span>.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiInfo className="w-5 h-5 text-primary" /> App &amp; Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><FiDatabase className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-text">Managed project storage</p>
                <p className="text-sm text-muted mt-0.5">Project files use signed Supabase storage when enabled, with private browser storage as the local fallback. Google Drive is managed under <Link className="text-primary hover:underline" to="/integrations">Integrations</Link>.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
