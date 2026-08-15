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
  barcode?: string
  weight?: string
  dimensions?: string
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
export type MovementType = 'GRN' | 'adjustment' | 'transfer_out' | 'transfer_in' | 'pick' | 'return' | 'stock_count' | 'dispatch'

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

// ---------------- Customer ----------------
export interface Customer {
  id: string
  name: string
  company: string
  gstin: string
  phone: string
  email: string
  billingAddress: string
  shippingAddress: string
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

// ---------------- Sales / Delivery Orders ----------------
export type SalesOrderStatus = 'created' | 'confirmed' | 'reserved' | 'picking' | 'packed' | 'dispatched' | 'completed' | 'cancelled'
export const ORDER_FLOW: SalesOrderStatus[] = ['created', 'confirmed', 'reserved', 'picking', 'packed', 'dispatched', 'completed']

export interface SalesOrderLine {
  itemId: string
  itemName: string
  sku: string
  qty: number
  price: number
  taxPct: number
  discountPct: number
  total: number
}

export interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  orderDate: string
  warehouseId: string
  status: SalesOrderStatus
  lines: SalesOrderLine[]
  subTotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  deliveryAddress: string
  notes: string
}

// ---------------- Stock Transfer ----------------
export type TransferStatus = 'created' | 'dispatched' | 'received' | 'completed'
export const TRANSFER_FLOW: TransferStatus[] = ['created', 'dispatched', 'received', 'completed']

export interface StockTransferLine {
  itemId: string
  itemName: string
  sku: string
  qty: number
  fromBin?: string
  toBin?: string
}

export interface StockTransfer {
  id: string
  transferNumber: string
  fromWarehouseId: string
  toWarehouseId: string
  date: string
  status: TransferStatus
  items: StockTransferLine[]
  notes: string
}

// ---------------- Picking ----------------
export type PickStatus = 'pending' | 'picking' | 'picked'
export interface PickLine {
  itemId: string
  itemName: string
  sku: string
  location: string
  requiredQty: number
  pickedQty: number
}
export interface PickList {
  id: string
  pickNumber: string
  orderId: string
  orderNumber: string
  status: PickStatus
  items: PickLine[]
}

// ---------------- Packing ----------------
export type PackStatus = 'pending' | 'packing' | 'packed' | 'ready'
export interface Package {
  id: string
  packageId: string
  orderId: string
  orderNumber: string
  items: { itemId: string; itemName: string; qty: number }[]
  totalWeight: string
  dimensions: string
  packageCount: number
  status: PackStatus
  remarks: string
}

// ---------------- Dispatch ----------------
export type DispatchStatus = 'ready' | 'dispatched' | 'completed'
export interface Dispatch {
  id: string
  dispatchNumber: string
  orderId: string
  orderNumber: string
  customerName: string
  packageId: string
  transporter: string
  courier: string
  trackingNumber: string
  dispatchDate: string
  vehicleNumber: string
  driver: string
  status: DispatchStatus
  remarks: string
}

// ---------------- Returns ----------------
export type ReturnStatus = 'requested' | 'received' | 'inspected' | 'completed'
export const RETURN_FLOW: ReturnStatus[] = ['requested', 'received', 'inspected', 'completed']

export interface ReturnLine {
  itemId: string
  itemName: string
  qty: number
  reason: string
  condition: 'good' | 'damaged'
  action: 'restock' | 'quarantine' | 'return_to_supplier'
}

export interface ReturnRecord {
  id: string
  returnNumber: string
  type: 'customer' | 'supplier'
  partyName: string
  originalRef: string
  date: string
  items: ReturnLine[]
  status: ReturnStatus
  remarks: string
}

// ---------------- Stock Count ----------------
export interface StockCountLine {
  itemId: string
  itemName: string
  systemQty: number
  physicalQty: number
  difference: number
  reason: string
}

export interface StockCount {
  id: string
  countNumber: string
  location: string
  warehouseId: string
  date: string
  items: StockCountLine[]
  status: 'open' | 'approved'
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
  dailyRate?: number
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