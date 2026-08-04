import { useEffect, useState } from 'react'
import { api } from '../../api'
import type { Settings } from '../../api'
import { PageHead } from '../../ui'

const FIRM = [
  ['general.firm_name', 'Firm name'],
  ['general.firm_state', 'Firm state'],
  ['general.firm_phone', 'Firm phone'],
  ['general.firm_gstin', 'Firm GSTIN'],
  ['general.firm_email', 'Firm email'],
  ['general.firm_address', 'Firm address'],
]
const TOGGLES: [string, string][] = [
  ['gst.enabled', 'Enable GST'],
  ['gst.state_of_supply', 'State of supply field'],
  ['gst.hsn', 'HSN / SAC code'],
  ['item.stock_maintenance', 'Stock / inventory maintenance'],
  ['item.units', 'Item units'],
  ['item.category', 'Item category'],
  ['txn.round_off', 'Round off totals'],
  ['txn.txn_wise_tax', 'Tax per transaction'],
  ['txn.item_wise_tax', 'Tax per item'],
  ['txn.cash_sale_default', 'Cash sale default'],
  ['txn.invoice_number', 'Invoice number'],
  ['txn.enable.estimate', 'Estimates & quotations'],
  ['txn.enable.delivery_challan', 'Delivery challans'],
  ['txn.invoice_preview', 'Invoice preview'],
  ['txn.terms_enabled', 'Invoice terms'],
  ['print.bill_of_supply_non_tax', 'Bill of supply for tax-free sales'],
]
const TEXT: [string, string][] = [
  ['txn.terms_text', 'Invoice terms & conditions'],
  ['print.signature_text', 'Signature label'],
]

export default function BillingSettings() {
  const [s, setS] = useState<Settings>({})
  const load = () => api.billing.settings().then(setS).catch(() => {})
  useEffect(() => { load() }, [])

  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }))
  const onChange = (k: string, v: string) => { set(k, v); api.billing.setSetting(k, v).catch(() => {}) }
  const toggle = (k: string) => onChange(k, s[k] === '1' ? '0' : '1')

  return (
    <>
      <PageHead icon="⚙️" title="Billing Settings" sub="Firm details, taxes, print & item preferences" />

      <div className="card">
        <h2>🏢 Firm & templates</h2>
        <div className="form-row">
          {FIRM.slice(0, 3).map(([k, label]) => (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="f-label">{label}</span>
              <input value={s[k] || ''} onChange={(e) => onChange(k, e.target.value)} />
            </label>
          ))}
        </div>
        <div className="form-row">
          {FIRM.slice(3).map(([k, label]) => (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="f-label">{label}</span>
              <input value={s[k] || ''} onChange={(e) => onChange(k, e.target.value)} />
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>🎛️ Preferences</h2>
        {TOGGLES.map(([k, label]) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={s[k] === '1'} onChange={() => toggle(k)} style={{ width: 18, height: 18 }} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="card">
        <h2>📝 Template text</h2>
        {TEXT.map(([k, label]) => (
          <label key={k} style={{ display: 'block', marginBottom: 12 }}>
            <span className="f-label">{label}</span>
            <textarea value={s[k] || ''} onChange={(e) => onChange(k, e.target.value)} />
          </label>
        ))}
      </div>
    </>
  )
}