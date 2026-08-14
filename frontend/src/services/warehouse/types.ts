export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  qty: number
  unit: string
  reorderLevel: number
  unitPrice: number
}

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  gstin: string
}

export type POStatus = 'draft' | 'sent' | 'received' | 'cancelled'

export interface POLine {
  itemId: string
  itemName: string
  qty: number
  unitPrice: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  date: string
  status: POStatus
  lines: POLine[]
  total: number
}

export interface GrnLine {
  itemId: string
  itemName: string
  orderedQty: number
  receivedQty: number
}

export interface GrnRecord {
  id: string
  grnNumber: string
  poId: string
  poNumber: string
  date: string
  lines: GrnLine[]
  notes: string
}
