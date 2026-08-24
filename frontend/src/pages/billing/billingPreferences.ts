import type { Settings } from '../../api'

const ENABLED_BY_DEFAULT = new Set([
  'gst.enabled',
  'gst.hsn',
  'txn.invoice_number',
  'txn.item_wise_tax',
  'txn.enable.estimate',
  'txn.enable.delivery_challan',
  'txn.invoice_preview',
  'item.stock_maintenance',
  'item.units',
  'item.category',
  'item.type',
  'item.barcode',
  'item.min_stock',
  'cash.adjustments_enabled',
  'bank.accounts_enabled',
  'bank.ifsc',
  'bank.upi',
])

export function settingEnabled(settings: Settings, key: string) {
  const value = settings[key]
  return value === undefined ? ENABLED_BY_DEFAULT.has(key) : value === '1'
}
