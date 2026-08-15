// ---------------- Warehouse / Locations ----------------
export interface Warehouse {
  id: string
  name: string
  code: string
  address: string
  contactPerson: string
  phone: string
  status: 'active' | 'inactive'
}

export interface LocationBin {
  id: string
  warehouseId: string
  code: string // e.g. A01-02
  zone: string
  rack: string
  bin: string
  capacity: number
  status: 'active' | 'inactive'
}

// ---------------- Inventory ----------------
export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  description: string
  unit: string
  qty: number // on hand
  reserved: number
  damaged: number
  quarantine: number
  inTransit: number
  reorderLevel: number
  minStock: number
  maxStock: number
  unitPrice: number // purchase price
  sellingPrice: number
  hsn: string
  gstPct: number
  location: string // default bin code
  warehouseId: string
  isActive: boolean
  trackBatch: boolean
  trackSerial: boolean
  trackExpiry: boolean
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export const availableOf = (item: InventoryItem): number => item.qty - item.reserved

export function stockStatusOf(item: InventoryItem): StockStatus {
  if (item.qty <= 0) return 'out_of_stock'
  if (item.qty <= (item.reorderLevel || 0)) return 'low_stock'
  return 'in_stock'
}

// ---------------- Stock ledger ----------------
export type MovementType = 'GRN' | 'adjustment' | 'transfer_out' | 'transfer_in' | 'pick' | 'return' | 'stock_count'

export interface StockMovement {
  id: string
  itemId: string
  itemName: string
  sku: string
  type: MovementType
  qty: number // signed (+ in / - out)
  from: string
  to: string
  reason: string
  refNumber: string
  date: string
  notes: string
}

export interface StockAdjustment {
  id: string
  itemId: string
  itemName: string
  sku: string
  location: string
  oldQty: number
  newQty: number
  difference: number
  reason: string // Damaged | Lost | Found | Counting error | Other
  remarks: string
  date: string
}

// ---------------- Supplier ----------------
export interface Supplier {
  id: string
  name: string
  company: string
  contact: string
  phone: string
  email: string
  gstin: string
  address: string
  paymentTerms: string
  status: 'active' | 'inactive'
}

// ---------------- Purchase Order ----------------
export type POStatus = 'draft' | 'submitted' | 'approved' | 'partial' | 'received' | 'closed' | 'cancelled'

export const PO_FLOW: POStatus[] = ['draft', 'submitted', 'approved', 'partial', 'received', 'closed']

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
  expectedDelivery: string
  warehouseId: string
  status: POStatus
  lines: POLine[]
  total: number
  notes: string
}

// ---------------- GRN / Receiving ----------------
export interface PutawayBin {
  location: string
  qty: number
}

export interface GrnLine {
  itemId: string
  itemName: string
  orderedQty: number
  receivedQty: number
  damagedQty: number
  rejectedQty: number
  acceptedQty: number
  putaway: PutawayBin[]
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

// ---------------- Staff & Projects (non-routed, kept for compatibility) ----------------
export interface StaffMember {
  id: string
  name: string
  role: string
  phone: string
  status: 'active' | 'inactive'
  lastAttendance?: 'present' | 'absent'
  lastAttendanceDate?: string
}

export type ProjectStatus = 'planned' | 'active' | 'completed'

export interface ProjectRecord {
  id: string
  name: string
  client: string
  status: ProjectStatus
  startDate: string
  budget: number
}