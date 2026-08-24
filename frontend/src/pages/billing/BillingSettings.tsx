import { useEffect, useState } from 'react'
import { api } from '../../api'
import type { Settings } from '../../api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Input, Textarea, Label, Switch, Tabs, TabsList, TabsTrigger, TabsContent } from '../../platform/ui'
import { useToast } from '../../platform/ui'
import { cn, mobileDigits } from '../../lib/utils'
import { settingEnabled } from './billingPreferences'

interface Preference {
  key: string
  label: string
  desc: string
  type: 'toggle' | 'textarea'
  dependsOn?: string
}

interface PreferenceGroup {
  title: string
  description: string
  icon: string
  settings: Preference[]
}

interface FirmField {
  key: string
  label: string
  placeholder: string
  required?: boolean
  type?: string
  pattern?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  multiline?: boolean
}

const FIRM_FIELDS: FirmField[] = [
  { key: 'general.firm_name', label: 'Firm Name', placeholder: 'VSR Systems', required: true, maxLength: 120 },
  { key: 'general.firm_gstin', label: 'GSTIN', placeholder: '29AAACL1234A1Z5', pattern: '[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]', maxLength: 15 },
  { key: 'general.firm_pan', label: 'PAN', placeholder: 'AAACL1234A', pattern: '[A-Z]{5}[0-9]{4}[A-Z]', maxLength: 10 },
  { key: 'general.firm_phone', label: '10-digit Mobile', placeholder: '9876543210', type: 'tel', inputMode: 'numeric', pattern: '[0-9]{10}', maxLength: 10 },
  { key: 'general.firm_email', label: 'Email', placeholder: 'billing@vsrsystems.com', type: 'email', maxLength: 254 },
  { key: 'general.firm_state', label: 'State', placeholder: 'Karnataka', maxLength: 80 },
  { key: 'general.firm_state_code', label: 'State Code', placeholder: '29', inputMode: 'numeric', pattern: '[0-9]{2}', maxLength: 2 },
  { key: 'general.firm_address', label: 'Address', placeholder: '123 Business Park, Bangalore', multiline: true, maxLength: 500 },
  { key: 'general.firm_bank_name', label: 'Bank Name', placeholder: 'HDFC Bank', maxLength: 80 },
  { key: 'general.firm_bank_account', label: 'Account No', placeholder: '50100234567890', inputMode: 'numeric', pattern: '[0-9]{6,18}', maxLength: 18 },
  { key: 'general.firm_bank_ifsc', label: 'IFSC', placeholder: 'HDFC0001234', pattern: '[A-Z]{4}0[A-Z0-9]{6}', maxLength: 11 },
  { key: 'general.firm_bank_holder', label: 'Account Holder', placeholder: 'VSR Systems Pvt Ltd', maxLength: 120 },
]

const PREFERENCE_GROUPS: Record<string, PreferenceGroup> = {
  gst: {
    title: 'GST & Tax',
    description: 'Configure GST behavior for invoices and transactions',
    icon: '📋',
    settings: [
      { key: 'gst.enabled', label: 'Enable GST', desc: 'Show GST fields on invoices and calculate tax automatically', type: 'toggle' },
      { key: 'gst.state_of_supply', label: 'State of Supply', desc: 'Add state of supply field for inter-state transactions', type: 'toggle', dependsOn: 'gst.enabled' },
      { key: 'gst.hsn', label: 'HSN/SAC Codes', desc: 'Show HSN/SAC field on items and invoice lines', type: 'toggle', dependsOn: 'gst.enabled' },
      { key: 'gst.reverse_charge', label: 'Reverse Charge', desc: 'Enable reverse charge mechanism for applicable transactions', type: 'toggle', dependsOn: 'gst.enabled' },
      { key: 'gst.tcs', label: 'TCS (Tax Collected at Source)', desc: 'Enable TCS on eligible sales', type: 'toggle', dependsOn: 'gst.enabled' },
      { key: 'gst.tds', label: 'TDS (Tax Deducted at Source)', desc: 'Enable TDS deduction on purchases', type: 'toggle', dependsOn: 'gst.enabled' },
    ]
  },
  invoicing: {
    title: 'Invoicing',
    description: 'Control invoice behavior, numbering, and document types',
    icon: '🧾',
    settings: [
      { key: 'txn.invoice_number', label: 'Auto Invoice Number', desc: 'Automatically generate sequential invoice numbers', type: 'toggle' },
      { key: 'txn.cash_sale_default', label: 'Cash Sale Default', desc: 'Default new transactions to cash sale (no party required)', type: 'toggle' },
      { key: 'txn.round_off', label: 'Round Off Totals', desc: 'Round invoice totals to nearest rupee', type: 'toggle' },
      { key: 'txn.txn_wise_tax', label: 'Transaction-wise Tax', desc: 'Single tax rate for entire transaction vs per-item', type: 'toggle' },
      { key: 'txn.item_wise_tax', label: 'Item-wise Tax', desc: 'Allow different tax rates per line item', type: 'toggle' },
      { key: 'txn.terms_enabled', label: 'Invoice Terms', desc: 'Show terms & conditions on invoices', type: 'toggle' },
      { key: 'txn.terms_text', label: 'Default Terms Text', desc: 'Standard terms to include on all invoices', type: 'textarea', dependsOn: 'txn.terms_enabled' },
      { key: 'txn.enable.estimate', label: 'Enable Estimates', desc: 'Allow creating estimates/quotations', type: 'toggle' },
      { key: 'txn.enable.delivery_challan', label: 'Enable Delivery Challans', desc: 'Allow creating delivery challans', type: 'toggle' },
      { key: 'txn.enable.proforma', label: 'Enable Proforma Invoices', desc: 'Allow creating proforma invoices', type: 'toggle' },
      { key: 'txn.invoice_preview', label: 'Invoice Preview', desc: 'Show preview button before saving invoices', type: 'toggle' },
    ]
  },
  items: {
    title: 'Items & Inventory',
    description: 'Configure item master data fields and inventory tracking',
    icon: '📦',
    settings: [
      { key: 'item.stock_maintenance', label: 'Stock Maintenance', desc: 'Track stock quantities and enable inventory features', type: 'toggle' },
      { key: 'item.units', label: 'Item Units', desc: 'Enable unit of measure (Pcs, Kg, Mtr, etc.)', type: 'toggle' },
      { key: 'item.category', label: 'Item Categories', desc: 'Enable categorization of items', type: 'toggle' },
      { key: 'item.type', label: 'Item Types', desc: 'Distinguish between Products and Services', type: 'toggle' },
      { key: 'item.wholesale_price', label: 'Wholesale Price', desc: 'Add wholesale price field to items', type: 'toggle' },
      { key: 'item.barcode', label: 'Barcode/QR Code', desc: 'Enable barcode scanning for items', type: 'toggle' },
      { key: 'item.min_stock', label: 'Min Stock Alerts', desc: 'Show low stock warnings', type: 'toggle', dependsOn: 'item.stock_maintenance' },
      { key: 'item.mrp', label: 'MRP Field', desc: 'Add Maximum Retail Price field', type: 'toggle' },
    ]
  },
  printing: {
    title: 'Print & Export',
    description: 'Customize invoice appearance and export options',
    icon: '🖨️',
    settings: [
      { key: 'print.bill_of_supply_non_tax', label: 'Bill of Supply', desc: 'Show "Bill of Supply" for non-taxable invoices', type: 'toggle' },
      { key: 'print.amount_grouping', label: 'Indian Number Grouping', desc: 'Format amounts as 1,00,000 instead of 100,000', type: 'toggle' },
      { key: 'print.amount_words', label: 'Amount in Words', desc: 'Print amount in words on invoices', type: 'toggle' },
      { key: 'print.you_saved', label: 'You Saved', desc: 'Show savings amount on invoices', type: 'toggle' },
      { key: 'print.signature', label: 'Signature', desc: 'Include signature line on invoices', type: 'toggle' },
      { key: 'print.signature_text', label: 'Signature Label', desc: 'Custom text for signature line', type: 'textarea', dependsOn: 'print.signature' },
      { key: 'print.payment_mode', label: 'Payment Mode', desc: 'Show payment mode on invoices', type: 'toggle' },
      { key: 'print.page_numbers', label: 'Page Numbers', desc: 'Add page numbers to multi-page invoices', type: 'toggle' },
      { key: 'print.pan_on_sale', label: 'PAN', desc: 'Print firm PAN on tax invoices', type: 'toggle' },
      { key: 'print.state_code', label: 'State Code', desc: 'Show state code next to state names', type: 'toggle' },
      { key: 'print.place_of_supply', label: 'Place of Supply', desc: 'Show place of supply on GST invoices', type: 'toggle' },
      { key: 'print.bank_details', label: 'Bank Details', desc: 'Print firm bank details on invoices', type: 'toggle' },
    ]
  },
  cashbank: {
    title: 'Cash & Bank',
    description: 'Control manual cash records and the bank details captured by billing',
    icon: '🏦',
    settings: [
      { key: 'cash.adjustments_enabled', label: 'Cash Adjustments', desc: 'Allow manual cash additions and reductions', type: 'toggle' },
      { key: 'bank.accounts_enabled', label: 'Bank Accounts', desc: 'Allow bank accounts to be added and maintained', type: 'toggle' },
      { key: 'bank.ifsc', label: 'IFSC Details', desc: 'Capture IFSC when bank accounts are enabled', type: 'toggle', dependsOn: 'bank.accounts_enabled' },
      { key: 'bank.upi', label: 'UPI Details', desc: 'Capture a UPI ID for enabled bank accounts', type: 'toggle', dependsOn: 'bank.accounts_enabled' },
    ]
  },
}

const labelByKey = Object.fromEntries(Object.values(PREFERENCE_GROUPS).flatMap(g => g.settings.map(s => [s.key, s.label])))

export default function BillingSettings() {
  const { toast } = useToast()
  const [s, setS] = useState<Settings>({})
  const [activeTab, setActiveTab] = useState<'firm' | 'gst' | 'invoicing' | 'items' | 'printing' | 'cashbank'>('firm')
  const [saving, setSaving] = useState<string | null>(null)
  const [firmErrors, setFirmErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    api.billing.settings().then((settings) => setS({ ...settings, 'general.firm_phone': mobileDigits(settings['general.firm_phone'] || '') })).catch(() => {})
  }, [])

  const onChange = async (k: string, v: string, notify = false) => {
    setS(prev => ({ ...prev, [k]: v }))
    setSaving(k)
    try {
      await api.billing.setSetting(k, v)
      if (notify) toast({ title: 'Setting saved', description: labelByKey[k] || k })
    } catch {
      setS(prev => ({ ...prev, [k]: s[k] }))
      toast({ title: 'Could not save setting', description: labelByKey[k] || k, variant: 'error' })
    } finally {
      setSaving(null)
    }
  }

  const isEnabled = (k: string) => settingEnabled(s, k)

  const updateFirmField = (field: FirmField, value: string) => {
    let next = value
    if (field.type === 'tel' || field.inputMode === 'numeric') next = value.replace(/\D/g, '')
    if (['general.firm_gstin', 'general.firm_pan', 'general.firm_bank_ifsc'].includes(field.key)) next = next.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setS((previous) => ({ ...previous, [field.key]: next }))
    setFirmErrors((previous) => ({ ...previous, [field.key]: '' }))
  }

  const saveFirmField = (field: FirmField) => {
    const value = (s[field.key] || '').trim()
    const valid = !field.pattern || !value || new RegExp(`^(?:${field.pattern})$`).test(value)
    if ((field.required && !value) || !valid) {
      setFirmErrors((previous) => ({ ...previous, [field.key]: !value ? `${field.label} is required` : `Enter a valid ${field.label.toLowerCase()}` }))
      return
    }
    void onChange(field.key, value, true)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Billing Settings</h1>
          <div className="muted">Configure firm details, taxes, invoicing, and inventory preferences</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="firm">Firm Details</TabsTrigger>
          <TabsTrigger value="gst">GST & Tax</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="items">Items & Inventory</TabsTrigger>
          <TabsTrigger value="printing">Print & Export</TabsTrigger>
          <TabsTrigger value="cashbank">Cash & Bank</TabsTrigger>
        </TabsList>

        <TabsContent value="firm">
          <Card>
            <CardHeader>
              <CardTitle>Firm Details</CardTitle>
              <CardDescription>These details appear on all invoices, reports, and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {FIRM_FIELDS.map((field) => (
                  <div key={field.key} className={cn(field.multiline && 'md:col-span-2')}>
                    <Label htmlFor={field.key}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                    {field.multiline ? (
                      <Textarea
                        id={field.key}
                        value={s[field.key] || ''}
                        onChange={(e) => updateFirmField(field, e.target.value)}
                        onBlur={() => saveFirmField(field)}
                        placeholder={field.placeholder}
                        rows={3}
                        maxLength={field.maxLength}
                        error={firmErrors[field.key]}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type || 'text'}
                        value={s[field.key] || ''}
                        onChange={(e) => updateFirmField(field, e.target.value)}
                        onBlur={() => saveFirmField(field)}
                        placeholder={field.placeholder}
                        pattern={field.pattern}
                        inputMode={field.inputMode}
                        maxLength={field.maxLength}
                        required={field.required}
                        error={firmErrors[field.key]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(['gst', 'invoicing', 'items', 'printing', 'cashbank'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>{PREFERENCE_GROUPS[tab].title}</CardTitle>
                <CardDescription>{PREFERENCE_GROUPS[tab].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PREFERENCE_GROUPS[tab].settings.map((setting) => (
                    <PreferenceRow
                      key={setting.key}
                      setting={setting}
                      value={s[setting.key] || ''}
                      onChange={onChange}
                      isEnabled={isEnabled(setting.key)}
                      saving={saving === setting.key}
                      dependencyMet={!setting.dependsOn || isEnabled(setting.dependsOn)}
                    />
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}

function PreferenceRow({ setting, value, onChange, isEnabled, saving, dependencyMet }: {
  setting: Preference
  value: string
  onChange: (k: string, v: string, notify?: boolean) => void
  isEnabled: boolean
  saving: boolean
  dependencyMet: boolean
}) {
  return (
    <div className={cn('flex items-start gap-4 p-4 bg-surface/50 rounded-xl border border-border transition-colors', !dependencyMet && 'bg-surface2/50')}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-text">{setting.label}</h4>
          {setting.dependsOn && (
            <Badge variant="outline" size="sm" className="text-xs">
              Requires: {labelByKey[setting.dependsOn]}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted mt-0.5">{setting.desc}</p>
        {!dependencyMet && setting.dependsOn && <p className="text-xs text-amber-600 mt-1">Turn on {labelByKey[setting.dependsOn]} first.</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {setting.type === 'toggle' && (
          <Switch
            checked={dependencyMet && isEnabled}
            onCheckedChange={(checked) => onChange(setting.key, checked ? '1' : '0', true)}
            disabled={saving || !dependencyMet}
            aria-label={setting.label}
          />
        )}
        {setting.type === 'textarea' && (
          <Textarea
            value={value}
            onChange={(e) => onChange(setting.key, e.target.value)}
            placeholder={`Enter ${setting.label.toLowerCase()}`}
            rows={2}
            className="w-64"
            disabled={saving || !dependencyMet}
          />
        )}
      </div>
    </div>
  )
}
