import type { InventoryItem, Supplier, PurchaseOrder, GrnRecord } from './types'

export const INVENTORY_SEED: InventoryItem[] = [
  { id: 'item-1', sku: 'SKU-1001', name: 'Cement Bag (50kg)', category: 'Construction', qty: 240, unit: 'bag', reorderLevel: 50, unitPrice: 380 },
  { id: 'item-2', sku: 'SKU-1002', name: 'Steel Rod (12mm)', category: 'Construction', qty: 18, unit: 'pcs', reorderLevel: 25, unitPrice: 620 },
  { id: 'item-3', sku: 'SKU-1003', name: 'PVC Pipe 4"', category: 'Plumbing', qty: 90, unit: 'pcs', reorderLevel: 30, unitPrice: 145 },
]

export const SUPPLIER_SEED: Supplier[] = [
  { id: 'sup-1', name: 'BuildMart Traders', contact: 'Ramesh Iyer', phone: '+91 98765 43210', email: 'sales@buildmart.in', gstin: '27ABCDE1234F1Z5' },
  { id: 'sup-2', name: 'SteelCore Supplies', contact: 'Anita Rao', phone: '+91 91234 56789', email: 'contact@steelcore.in', gstin: '29XYZAB5678G2Z1' },
]

export const PO_SEED: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-1',
    supplierName: 'BuildMart Traders',
    date: '2026-08-01',
    status: 'sent',
    lines: [{ itemId: 'item-1', itemName: 'Cement Bag (50kg)', qty: 100, unitPrice: 380 }],
    total: 38000,
  },
]

export const GRN_SEED: GrnRecord[] = []
