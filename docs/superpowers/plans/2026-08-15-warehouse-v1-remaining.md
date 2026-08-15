# Warehouse V1 Remaining Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the remaining 10 V1 warehouse modules (products, customers, warehouses/locations, stock transfer, sales orders, picking, packing, dispatch, returns, stock count) as 9 new pages in the existing LuxInfra warehouse service, then push to `luxinfra-frontend`.

**Architecture:** Extend the existing localStorage-backed warehouse module (`frontend/src/services/warehouse/`). Each module = a new page file + new types + seed data + collection key (`warehouse:<name>`), reusing the shared `DataTable`/`KpiCard`/`StatusBadge`/`Stepper`/`Drawer` components and the `useStockLedger`/`useAdjustments` hooks. Register routes in `App.tsx` and nav groups in `Layout.tsx`. All quantity changes are ledger-logged; never silently mutate inventory.

**Tech Stack:** React 19, TypeScript ~6.0 (strict), react-router-dom v7, Tailwind 4, lucide-react, existing `components/ui` kit + `lib/localStore` + `lib/utils`. **No new npm dependencies.**

## Global Constraints

- **No new npm packages** (spec §49.18). Verification uses existing scripts: `npx tsc -b --pretty false`, `npx vite build`, `npx oxlint`.
- **Do not touch**: `components/ui/*`, `api.ts`, `lib/*` (incl. `lib/localStore.ts`), non-warehouse services (school/interior/billing), non-warehouse pages.
- **Only additions** to `App.tsx` (9 imports + 9 `<Route>` lines in the warehouse block, lines 45-49 + 133-140) and `Layout.tsx` (nav items in `SERVICE_GROUPS.warehouse`, lines 76-102). Nothing else in those files changes.
- **No emojis in code/UI**; use lucide icons. Currency via `money()` from `../../lib/utils` (₹).
- **No V2/V3 features** (§46): no barcode scanner component (needs new dep), no batch/serial sub-modules, no notifications/users/roles/reports/audit-logs (app-level exists).
- **Stock integrity** (spec §10, §48): every qty change via `logMovement(...)`; orders reserve by incrementing `reserved`; `availableOf(item) = item.qty - item.reserved` gates transfer/pick quantities; status transitions are forward-only via `nextStatus` helpers.
- **ID stability**: existing seeds keep ids (`wh-1`, `item-1`…`item-6`, `loc-1`…`loc-5`, `sup-1`…`sup-3`, `po-1`…`po-3`, `grn-1`). New seeds use new ids (`cust-1`…, `tr-1`…, `so-1`…, `pk-1`…, `pc-1`…, `dp-1`…, `ret-1`…, `sc-1`…).
- Every page: one primary action in Card header, DataTable (search/status filter/sort/pagination/CSV export), empty state, toasts via `useToast`, `required` labels on forms, forward-only status buttons.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/services/warehouse/types.ts` | Modify | Add Customer, StockTransfer, SalesOrder, PickList, Package, Dispatch, ReturnRecord, StockCount + flow constants; add `barcode`/`weight`/`dimensions` to InventoryItem |
| `frontend/src/services/warehouse/seed.ts` | Modify | Add CUSTOMER_SEED, TRANSFER_SEED, ORDER_SEED, PICK_SEED, PACK_SEED, DISPATCH_SEED, RETURN_SEED, STOCK_COUNT_SEED |
| `frontend/src/services/warehouse/WarehouseProducts.tsx` | Create | Products catalog over `warehouse:inventory` + detail drawer with movement history |
| `frontend/src/services/warehouse/WarehouseCustomers.tsx` | Create | Customers CRUD (`warehouse:customers`) |
| `frontend/src/services/warehouse/WarehouseWarehouses.tsx` | Create | Warehouses + Locations CRUD (`warehouse:warehouses`, `warehouse:locations`) |
| `frontend/src/services/warehouse/WarehouseTransfers.tsx` | Create | Stock transfer wizard + workflow (`warehouse:transfers`) |
| `frontend/src/services/warehouse/WarehouseOrders.tsx` | Create | Sales/delivery orders + workflow (`warehouse:orders`) |
| `frontend/src/services/warehouse/WarehousePicking.tsx` | Create | Pick lists from reserved orders (`warehouse:picking`) |
| `frontend/src/services/warehouse/WarehousePacking.tsx` | Create | Packing records (`warehouse:packing`) |
| `frontend/src/services/warehouse/WarehouseDispatch.tsx` | Create | Dispatch records (`warehouse:dispatch`) |
| `frontend/src/services/warehouse/WarehouseReturns.tsx` | Create | Customer + supplier returns (`warehouse:returns`) |
| `frontend/src/services/warehouse/WarehouseStockCount.tsx` | Create | Cycle count + auto-adjustment (`warehouse:stock-count`) |
| `frontend/src/services/warehouse/WarehouseHome.tsx` | Modify | Extend Quick links grid; add Pending picking/dispatch KPIs |
| `frontend/src/App.tsx` | Modify | 9 imports + 9 routes (warehouse block only) |
| `frontend/src/Layout.tsx` | Modify | Nav items in `SERVICE_GROUPS.warehouse` (Inventory + new Outbound group + Customers) |

---

### Task 1: Types extension

**Files:**
- Modify: `frontend/src/services/warehouse/types.ts`

**Interfaces:**
- Consumes: existing `InventoryItem`, `PO_FLOW` pattern, `MovementType`, `LocationBin`, `Warehouse`.
- Produces (exact shapes later tasks depend on):
  - `InventoryItem` gains `barcode?: string`, `weight?: string`, `dimensions?: string`
  - `Customer` = `{ id, name, company, gstin, phone, email, billingAddress, shippingAddress, status: 'active'|'inactive' }`
  - `StockTransfer` = `{ id, transferNumber, fromWarehouseId, toWarehouseId, date, status: 'created'|'dispatched'|'received'|'completed', items: StockTransferLine[], notes }`; `StockTransferLine` = `{ itemId, itemName, sku, qty, fromBin?, toBin? }`
  - `SalesOrder` = `{ id, orderNumber, customerId, customerName, orderDate, warehouseId, status: SalesOrderStatus, lines: SalesOrderLine[], subTotal, taxTotal, discountTotal, grandTotal, deliveryAddress, notes }`; `SalesOrderLine` = `{ itemId, itemName, sku, qty, price, taxPct, discountPct, total }`
  - `SalesOrderStatus` = `'created'|'confirmed'|'reserved'|'picking'|'packed'|'dispatched'|'completed'|'cancelled'`; `ORDER_FLOW` array (created→confirmed→reserved→picking→packed→dispatched→completed)
  - `PickList` = `{ id, pickNumber, orderId, orderNumber, status: 'pending'|'picking'|'picked', items: PickLine[] }`; `PickLine` = `{ itemId, itemName, sku, location, requiredQty, pickedQty }`
  - `Package` = `{ id, packageId, orderId, orderNumber, items: { itemId, itemName, qty }[], totalWeight, dimensions, packageCount, status: 'pending'|'packing'|'packed'|'ready', remarks }`
  - `Dispatch` = `{ id, dispatchNumber, orderId, orderNumber, customerName, packageId, transporter, courier, trackingNumber, dispatchDate, vehicleNumber, driver, status: 'ready'|'dispatched'|'completed', remarks }`
  - `ReturnRecord` = `{ id, returnNumber, type: 'customer'|'supplier', partyName, originalRef, date, items: ReturnLine[], status: 'requested'|'received'|'inspected'|'completed', remarks }`; `ReturnLine` = `{ itemId, itemName, qty, reason, condition: 'good'|'damaged', action: 'restock'|'quarantine'|'return_to_supplier' }`
  - `StockCount` = `{ id, countNumber, location, warehouseId, date, items: StockCountLine[], status: 'open'|'approved' }`; `StockCountLine` = `{ itemId, itemName, systemQty, physicalQty, difference, reason }`

- [ ] **Step 1: Add product fields to InventoryItem**

Add to the `InventoryItem` interface (after `gstPct`/before `location`):
```ts
  barcode?: string
  weight?: string
  dimensions?: string
```

- [ ] **Step 2: Add Customer interface + SUPPLIER-style shape**

Append after the `Supplier` interface:
```ts
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
```

- [ ] **Step 3: Add SalesOrder types + ORDER_FLOW**

Append after the PO section:
```ts
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
```

- [ ] **Step 4: Add StockTransfer + PickList + Package + Dispatch types**

```ts
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

export type PickStatus = 'pending' | 'picking' | 'picked'
export interface PickLine { itemId: string; itemName: string; sku: string; location: string; requiredQty: number; pickedQty: number }
export interface PickList {
  id: string
  pickNumber: string
  orderId: string
  orderNumber: string
  status: PickStatus
  items: PickLine[]
}

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
```

- [ ] **Step 5: Add ReturnRecord + StockCount types**

```ts
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
```

- [ ] **Step 6: Verify types compile**

Run: `npx tsc -b --pretty false` — Expected: 0 errors (new types unused yet, but must parse).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/services/warehouse/types.ts
git commit -m "feat(warehouse): add customer/order/transfer/pick/package/dispatch/return/stock-count types"
```

---

### Task 2: Seed data extension

**Files:**
- Modify: `frontend/src/services/warehouse/seed.ts`

**Interfaces:**
- Consumes: types from Task 1 (`Customer`, `StockTransfer`, `SalesOrder`, `PickList`, `Package`, `Dispatch`, `ReturnRecord`, `StockCount`).
- Produces: exported `CUSTOMER_SEED: Customer[]`, `TRANSFER_SEED: StockTransfer[]`, `ORDER_SEED: SalesOrder[]`, `PICK_SEED: PickList[]`, `PACK_SEED: Package[]`, `DISPATCH_SEED: Dispatch[]`, `RETURN_SEED: ReturnRecord[]`, `STOCK_COUNT_SEED: StockCount[]`.

- [ ] **Step 1: Add CUSTOMER_SEED**

```ts
export const CUSTOMER_SEED: Customer[] = [
  { id: 'cust-1', name: 'Urban Developers', company: 'Urban Developers Pvt Ltd', gstin: '27PQRST4567K1Z9', phone: '+91 98111 22334', email: 'procurement@urbandev.in', billingAddress: '12 MG Road, Gurgaon', shippingAddress: 'Site-7, Sector 65, Gurgaon', status: 'active' },
  { id: 'cust-2', name: 'Nirmal Interiors', company: 'Nirmal Interiors LLP', gstin: '29LMNOP8901L2Z3', phone: '+91 98222 33445', email: 'orders@nirmalinteriors.in', billingAddress: '4A Lajpat Nagar, New Delhi', shippingAddress: '4A Lajpat Nagar, New Delhi', status: 'active' },
  { id: 'cust-3', name: 'GreenBuild Projects', company: 'GreenBuild Projects Ltd', gstin: '27ABCDE1212M4Z5', phone: '+91 98333 44556', email: 'buy@greenbuild.in', billingAddress: '55 Cyber City, Gurgaon', shippingAddress: 'Plot 3, Manesar, Gurgaon', status: 'inactive' },
]
```

- [ ] **Step 2: Add TRANSFER_SEED**

```ts
export const TRANSFER_SEED: StockTransfer[] = [
  {
    id: 'tr-1', transferNumber: 'TR-2026-001', fromWarehouseId: 'wh-1', toWarehouseId: 'wh-2',
    date: '2026-08-10', status: 'received',
    items: [
      { itemId: 'item-1', itemName: 'Cement Bag (50kg)', sku: 'SKU-1001', qty: 40, fromBin: 'A01-01', toBin: 'B01-01' },
      { itemId: 'item-3', itemName: 'PVC Pipe 4"', sku: 'SKU-1003', qty: 20, fromBin: 'A02-01', toBin: 'B02-02' },
    ],
    notes: 'Backfill Delhi stock',
  },
  { id: 'tr-2', transferNumber: 'TR-2026-002', fromWarehouseId: 'wh-1', toWarehouseId: 'wh-2', date: '2026-08-14', status: 'created', items: [{ itemId: 'item-2', itemName: 'Steel Rod (12mm)', sku: 'SKU-1002', qty: 10, fromBin: 'A01-02', toBin: 'B01-01' }], notes: '' },
]
```

- [ ] **Step 3: Add ORDER_SEED + PICK_SEED + PACK_SEED + DISPATCH_SEED**

```ts
export const ORDER_SEED: SalesOrder[] = [
  {
    id: 'so-1', orderNumber: 'SO-2026-001', customerId: 'cust-1', customerName: 'Urban Developers',
    orderDate: '2026-08-12', warehouseId: 'wh-1', status: 'reserved',
    lines: [
      { itemId: 'item-1', itemName: 'Cement Bag (50kg)', sku: 'SKU-1001', qty: 30, price: 410, taxPct: 28, discountPct: 0, total: 15744 },
      { itemId: 'item-5', itemName: 'Copper Wire 2.5sqmm', sku: 'SKU-1005', qty: 5, price: 2100, taxPct: 18, discountPct: 0, total: 12390 },
    ],
    subTotal: 22800, taxTotal: 5334, discountTotal: 0, grandTotal: 28134,
    deliveryAddress: 'Site-7, Sector 65, Gurgaon', notes: 'Urgent delivery',
  },
  { id: 'so-2', orderNumber: 'SO-2026-002', customerId: 'cust-2', customerName: 'Nirmal Interiors', orderDate: '2026-08-14', warehouseId: 'wh-2', status: 'created', lines: [{ itemId: 'item-4', itemName: 'Paint Emulsion (20L)', sku: 'SKU-1004', qty: 4, price: 3500, taxPct: 18, discountPct: 5, total: 15694 }], subTotal: 14000, taxTotal: 2520, discountTotal: 700, grandTotal: 15820, deliveryAddress: '4A Lajpat Nagar, New Delhi', notes: '' },
]

export const PICK_SEED: PickList[] = [
  {
    id: 'pk-1', pickNumber: 'PL-2026-001', orderId: 'so-1', orderNumber: 'SO-2026-001', status: 'pending',
    items: [
      { itemId: 'item-1', itemName: 'Cement Bag (50kg)', sku: 'SKU-1001', location: 'A01-01', requiredQty: 30, pickedQty: 0 },
      { itemId: 'item-5', itemName: 'Copper Wire 2.5sqmm', sku: 'SKU-1005', location: 'B02-02', requiredQty: 5, pickedQty: 0 },
    ],
  },
]

export const PACK_SEED: Package[] = [
  { id: 'pc-1', packageId: 'PKG-2026-001', orderId: 'so-1', orderNumber: 'SO-2026-001', items: [{ itemId: 'item-1', itemName: 'Cement Bag (50kg)', qty: 30 }, { itemId: 'item-5', itemName: 'Copper Wire 2.5sqmm', qty: 5 }], totalWeight: '960 kg', dimensions: '120x100x90 cm', packageCount: 3, status: 'pending', remarks: '' },
]

export const DISPATCH_SEED: Dispatch[] = [
  { id: 'dp-1', dispatchNumber: 'DS-2026-001', orderId: 'so-1', orderNumber: 'SO-2026-001', customerName: 'Urban Developers', packageId: 'PKG-2026-001', transporter: 'Delhivery', courier: '', trackingNumber: 'DLV-889977', dispatchDate: '2026-08-15', vehicleNumber: 'HR-55-AB-1234', driver: 'Ramesh Kumar', status: 'ready', remarks: '' },
]
```

- [ ] **Step 4: Add RETURN_SEED + STOCK_COUNT_SEED**

```ts
export const RETURN_SEED: ReturnRecord[] = [
  {
    id: 'ret-1', returnNumber: 'RET-2026-001', type: 'customer', partyName: 'Urban Developers',
    originalRef: 'SO-2026-001', date: '2026-08-13', status: 'received',
    items: [{ itemId: 'item-5', itemName: 'Copper Wire 2.5sqmm', qty: 1, reason: 'Wrong specification', condition: 'good', action: 'restock' }],
    remarks: '',
  },
  { id: 'ret-2', returnNumber: 'RET-2026-002', type: 'supplier', partyName: 'SteelCore Supplies', originalRef: 'GRN-2026-001', date: '2026-08-14', status: 'requested', items: [{ itemId: 'item-2', itemName: 'Steel Rod (12mm)', qty: 2, reason: 'Damaged in transit', condition: 'damaged', action: 'return_to_supplier' }], remarks: '' },
]

export const STOCK_COUNT_SEED: StockCount[] = [
  { id: 'sc-1', countNumber: 'SC-2026-001', location: 'A01-01', warehouseId: 'wh-1', date: '2026-08-12', status: 'approved', items: [{ itemId: 'item-1', itemName: 'Cement Bag (50kg)', systemQty: 240, physicalQty: 238, difference: -2, reason: 'Stock damaged' }] },
]
```

- [ ] **Step 5: Update seed import line**

Change line 1 to:
```ts
import type { InventoryItem, Supplier, PurchaseOrder, GrnRecord, StaffMember, ProjectRecord, Warehouse, LocationBin, Customer, StockTransfer, SalesOrder, PickList, Package, Dispatch, ReturnRecord, StockCount } from './types'
```

- [ ] **Step 6: Verify compile**

Run: `npx tsc -b --pretty false` — Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/services/warehouse/seed.ts
git commit -m "feat(warehouse): seed data for customers, transfers, orders, picking, packing, dispatch, returns, stock count"
```

---

### Task 3: Products page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseProducts.tsx`

**Interfaces:**
- Consumes: `useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)`, `useStockLedger`, `DataTable`, `Drawer`, `stockStatusOf`, `availableOf`, `StatusBadge`.
- Produces: default-exported component (no props), rendered at `/warehouse/products`.

- [ ] **Step 1: Create the page**

Read-only catalog over inventory: Card header "Products" + primary action "Add Product" (opens the same edit modal pattern as Inventory — copy the modal shape from `WarehouseInventory.tsx`, fields: name, sku, category, brand, unit, hsn, gstPct, unitPrice, sellingPrice, barcode, weight, dimensions, reorderLevel, minStock, maxStock, isActive, trackBatch/trackSerial/trackExpiry; add via `add(...)` from the collection). Table columns: Product (name+brand), SKU, Barcode, Category, Stock (qty+unit), Status (`stockStatusOf`), Actions (detail). Row click opens `Drawer` detail with Overview (fields grid incl. prices, barcode, weight/dimensions) and History (movements filtered by `itemId` from `useStockLedger().movements`, rendered as a compact list with `MOVEMENT_LABEL` + signed qty). Toolbar: search (name/sku/barcode/category), category filter (`Select` from unique categories), CSV export `warehouse-products`. Empty state icon `Boxes`.

- [ ] **Step 2: Verify compile**

Run: `npx tsc -b --pretty false` — Expected: 0 errors.
Run: `npx oxlint src/services/warehouse/WarehouseProducts.tsx` — Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseProducts.tsx
git commit -m "feat(warehouse): products catalog page with detail drawer and history"
```

---

### Task 4: Customers page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseCustomers.tsx`

**Interfaces:**
- Consumes: `Customer`, `CUSTOMER_SEED`, `useLocalCollection('warehouse:customers')`, `DataTable`, `StatusBadge`.
- Produces: default-exported component at `/warehouse/customers`.

- [ ] **Step 1: Create the page**

Clone the shape of `WarehouseSuppliers.tsx` (same CRUD + modal + toolbar pattern) but for `Customer` fields: name (required), company, gstin (mono font cell), phone, email, billingAddress, shippingAddress, status. Modal grid: name/company, phone/email, gstin/status, billingAddress, shippingAddress. Search across name/company/phone/email/gstin. Status filter (all/active/inactive). Export `warehouse-customers`. Empty icon `Users`.

- [ ] **Step 2: Verify compile**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on the file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseCustomers.tsx
git commit -m "feat(warehouse): customers CRUD page"
```

---

### Task 5: Warehouses & Locations page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseWarehouses.tsx`

**Interfaces:**
- Consumes: `Warehouse`, `LocationBin`, `WAREHOUSE_SEED`, `LOCATION_SEED`, `useLocalCollection('warehouse:warehouses')`, `useLocalCollection('warehouse:locations')`.
- Produces: default-exported component at `/warehouse/warehouses`.

- [ ] **Step 1: Create the page**

Two Cards stacked:
1. **Warehouses** — DataTable (Code, Name, Address, Contact, Phone, Status) + CRUD modal (name/code/address/contactPerson/phone/status). Export `warehouse-warehouses`. Empty icon `Building2`.
2. **Locations** — DataTable (Code, Warehouse [name from warehouseId via WAREHOUSE_SEED], Zone, Rack, Bin, Capacity, Status) + warehouse filter `Select` (all/wh-1/wh-2) + CRUD modal (warehouseId Select, code, zone, rack, bin, capacity, status). Export `warehouse-locations`. Empty icon `MapPin`.

Delete guards: deleting a warehouse that has locations — block with toast "Remove locations first". Deleting locations is free (prototype).

- [ ] **Step 2: Verify compile**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on the file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseWarehouses.tsx
git commit -m "feat(warehouse): warehouses and locations management page"
```

---

### Task 6: Stock Transfer page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseTransfers.tsx`

**Interfaces:**
- Consumes: `StockTransfer`, `TRANSFER_FLOW`, `TRANSFER_SEED`, `useLocalCollection('warehouse:transfers')`, `useLocalCollection('warehouse:inventory')`, `useStockLedger`, `Stepper`, `DataTable`, `StatusBadge`, `WAREHOUSE_SEED`, `LOCATION_SEED`, `availableOf`.
- Produces: default-exported component at `/warehouse/transfers`.

- [ ] **Step 1: Create the page**

List (DataTable: Transfer #, From, To, Date, Items, Status) + primary action "+ New Transfer" opening a 2-step Stepper modal (`['Details', 'Confirm']`):
- **Step 1 Details**: fromWarehouse `Select`, toWarehouse `Select` (disabled if === from; allow same-warehouse for bin-to-bin), date `Input type="date"`, line-item editor (item `Select` filtered to items whose `availableOf > 0`, qty `Input`, auto fromBin = item's `location` for source warehouse; for same-warehouse show toBin `Select` of destination warehouse locations), "+ Add item" per line.
- **Step 2 Confirm**: summary table (item, qty, from bin → to bin), notes `Input`, Save → `add({...})` with status `'created'` and generated `transferNumber` `TR-2026-XXX`.

Status actions (per-row `actions`): `nextStatus` = created→dispatched→received→completed. Buttons: "Mark dispatched" (created), "Mark received" (dispatched), "Complete" (received).
**On received** (the critical stock op): for each item — find source item in `warehouse:inventory` by `itemId` AND matching warehouse (`fromWarehouseId`): `update(item.id, { qty: item.qty - line.qty })`; find or create dest item (same sku in `toWarehouseId`; if none, `add` a copy with qty 0): `update(dest.id, { qty: dest.qty + line.qty, location: line.toBin ?? dest.location })`. Log `logMovement({ type: 'transfer_out', qty: -line.qty, from: fromWhName, to: toWhName, reason: 'Stock transfer', refNumber: transferNumber, notes })` and `logMovement({ type: 'transfer_in', qty: line.qty, ... })`. Same-warehouse bin transfer: update item `location` to `toBin`.
**On completed**: no stock op (received already applied); just status.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseTransfers.tsx
git commit -m "feat(warehouse): stock transfer wizard with ledger-logged receive"
```

---

### Task 7: Sales / Delivery Orders page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseOrders.tsx`

**Interfaces:**
- Consumes: `SalesOrder`, `ORDER_FLOW`, `ORDER_SEED`, `CUSTOMER_SEED`, `useLocalCollection('warehouse:orders')`, `useLocalCollection('warehouse:customers')`, `useLocalCollection('warehouse:inventory')`, `useStockLedger`, `DataTable`, `StatusBadge`, `WAREHOUSE_SEED`, `availableOf`, `money`.
- Produces: default-exported component at `/warehouse/orders`.

- [ ] **Step 1: Create the page**

List (DataTable: Order #, Customer, Date, Items, Total, Status) + primary "+ New Order" modal:
- Customer `Select` (from customers), warehouse `Select`, deliveryAddress auto-fill from customer's `shippingAddress`, orderDate date input.
- Line items editor: item `Select` (available > 0), qty, price (default `sellingPrice`), taxPct `Select` (0/5/12/18/28), discountPct input. `total = qty*price*(1-tax)*... ` — compute: `subTotal = Σ qty*price`; `discountTotal = Σ (qty*price*discountPct/100)`; `taxTotal = Σ ((qty*price - discount)*taxPct/100)`; `grandTotal = subTotal - discountTotal + taxTotal`. Show totals footer.
- Save → `add` status `'created'`, `orderNumber` `SO-2026-XXX`.

Status actions per row (`nextStatus(ORDER_FLOW)`): created→"Confirm"→confirmed→"Reserve stock"→reserved→"Start picking"→picking→"Mark packed"→packed→"Dispatch"→dispatched→"Complete"→completed.
**On Reserve**: for each line, find inventory item by `itemId`: `update(item.id, { reserved: item.reserved + line.qty })`. Guard: if any `availableOf(item) < line.qty`, toast error and abort reserve (no partial).
**On Dispatch**: log `logMovement({ type: 'dispatch'? — use 'pick' movement? No: dispatches are outbound stock — log type: 'return' is wrong. Use existing type: for outbound dispatch, log `logMovement({ type: 'pick', qty: -line.qty, from: warehouse, to: 'Customer', reason: 'Dispatch', refNumber: orderNumber })`. (MovementType has no 'dispatch' — reuse 'pick' semantics for outbound; acceptable V1.)** Alternative: add `'dispatch'` to MovementType in Task 1 — **prefer this**: Task 1 Step 5 already defines `MovementType`; extend it with `'dispatch'` and `MOVEMENT_LABEL` in `ledger.ts` accordingly. Adjust: in Task 1, change `MovementType` union to include `'dispatch'`; in `ledger.ts` add `dispatch: 'Dispatch'`.
- Completed/cancelled terminal; cancelled allowed from created/confirmed (destructive → confirm dialog).

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseOrders.tsx
git commit -m "feat(warehouse): sales/delivery orders with reservation workflow"
```

---

### Task 8: Picking page

**Files:**
- Create: `frontend/src/services/warehouse/WarehousePicking.tsx`

**Interfaces:**
- Consumes: `PickList`, `PICK_SEED`, `useLocalCollection('warehouse:picking')`, `useLocalCollection('warehouse:orders')`, `useLocalCollection('warehouse:inventory')`, `useStockLedger`, `DataTable`, `StatusBadge`.
- Produces: default-exported component at `/warehouse/picking`.

- [ ] **Step 1: Create the page**

List (Pick #, Order #, Items, Status) + primary "+ Generate Pick List" — creates a `PickList` from the first `reserved` order (status `'pending'`), items' location from inventory item `location`, `requiredQty` = order line qty. If none reserved, toast "No reserved orders to pick".
Row action "Start picking" (pending→picking) opens a full-width Card (like GRN wizard, no Stepper needed — single screen): per item row — item name, location badge, required qty, picked qty `Input`. Progress header: `picked/required` sum + progress bar (use existing `div` with `bg-primary` width %).
"Confirm Pick" action: for each item — `update(item.id, { qty: item.qty - pickedQty, reserved: item.reserved - pickedQty })` (release reserved as picked), `logMovement({ type: 'pick', qty: -pickedQty, from: location, to: 'Dispatch', reason: 'Picking', refNumber: pickNumber })`. Set pick status `'picked'`; update order to `'packed'` (via orders collection: `update(order.id, { status: 'packed' })`). Guard: pickedQty ≤ requiredQty and ≤ available; if pickedQty < requiredQty allow partial (status stays 'picking', toast "Partial pick — continue"). 

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehousePicking.tsx
git commit -m "feat(warehouse): picking page with pick lists and ledger-logged picks"
```

---

### Task 9: Packing page

**Files:**
- Create: `frontend/src/services/warehouse/WarehousePacking.tsx`

**Interfaces:**
- Consumes: `Package`, `PACK_SEED`, `useLocalCollection('warehouse:packing')`, `useLocalCollection('warehouse:orders')`, `DataTable`, `StatusBadge`.
- Produces: default-exported component at `/warehouse/packing`.

- [ ] **Step 1: Create the page**

List (Package ID, Order #, Items, Status) + "+ New Package" modal: order `Select` (status `'packed'` orders), packageId, items auto-copied from order lines (read-only display), totalWeight, dimensions, packageCount, remarks. Status actions: pending→packing→packed→ready via `nextStatus`. No stock ops (packing doesn't move inventory). Export `warehouse-packing`. Empty icon `PackageCheck`.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehousePacking.tsx
git commit -m "feat(warehouse): packing page"
```

---

### Task 10: Dispatch page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseDispatch.tsx`

**Interfaces:**
- Consumes: `Dispatch`, `DISPATCH_SEED`, `useLocalCollection('warehouse:dispatch')`, `useLocalCollection('warehouse:packing')`, `useLocalCollection('warehouse:orders')`, `useStockLedger`, `DataTable`, `StatusBadge`.
- Produces: default-exported component at `/warehouse/dispatch`.

- [ ] **Step 1: Create the page**

List (Dispatch #, Order #, Customer, Transporter, Tracking, Date, Status) + "+ Create Dispatch" modal: order `Select` (status `'packed'`), package `Select` (from `warehouse:packing`, ready packages), transporter, courier, trackingNumber, dispatchDate, vehicleNumber, driver, remarks. Status actions: ready→dispatched→completed.
**On dispatched**: for each order line — `logMovement({ type: 'dispatch', qty: -line.qty, from: warehouseName, to: 'Customer', reason: 'Dispatch', refNumber: dispatchNumber })` (inventory already decremented at pick time; dispatch only records outbound ledger). Update order status `'dispatched'`.
**On completed**: update order status `'completed'`.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseDispatch.tsx
git commit -m "feat(warehouse): dispatch page with outbound ledger logging"
```

---

### Task 11: Returns page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseReturns.tsx`

**Interfaces:**
- Consumes: `ReturnRecord`, `RETURN_FLOW`, `RETURN_SEED`, `useLocalCollection('warehouse:returns')`, `useLocalCollection('warehouse:inventory')`, `useStockLedger`, `DataTable`, `StatusBadge`, `Tabs` (from `components/ui`).
- Produces: default-exported component at `/warehouse/returns`.

- [ ] **Step 1: Create the page**

Two tabs (use `Tabs` component from ui kit): **Customer Returns** / **Supplier Returns**, filtering `type`.
List (Return #, Party, Ref, Date, Items, Status) + "+ New Return": type Select (customer/supplier — presets the active tab), partyName, originalRef, date, line items (item Select, qty, reason, condition Select good/damaged, action Select defaulted: good→restock, damaged→quarantine for customer / return_to_supplier for supplier).
Status actions via `RETURN_FLOW`: requested→received→inspected→completed.
**On inspected** (stock op): for lines with action `'restock'` and condition `'good'` — find inventory item by itemId, `update(item.id, { qty: item.qty + line.qty })`, `logMovement({ type: 'return', qty: line.qty, from: 'Customer', to: item.location, reason: 'Customer return', refNumber: returnNumber })`. For `'quarantine'`/damaged — `update(item.id, { quarantine: (item.quarantine||0) + line.qty })` + ledger `return` movement with reason 'Damaged — quarantined'. Supplier returns (`return_to_supplier`) — no inventory change; ledger `return` with negative qty, reason 'Returned to supplier'.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseReturns.tsx
git commit -m "feat(warehouse): customer and supplier returns with restock/quarantine"
```

---

### Task 12: Stock Count page

**Files:**
- Create: `frontend/src/services/warehouse/WarehouseStockCount.tsx`

**Interfaces:**
- Consumes: `StockCount`, `STOCK_COUNT_SEED`, `useLocalCollection('warehouse:stock-count')`, `useLocalCollection('warehouse:inventory')`, `useAdjustments`, `useStockLedger`, `DataTable`, `LOCATION_SEED`, `WAREHOUSE_SEED`.
- Produces: default-exported component at `/warehouse/stock-count`.

- [ ] **Step 1: Create the page**

List (Count #, Location, Warehouse, Date, Status) + "+ New Count": location `Select` (from LOCATION_SEED grouped by warehouse — show `code — warehouse name`), warehouseId auto from location. On save: items auto-filled from inventory items whose `location === chosen location`, each with `systemQty = item.qty`, `physicalQty` input, difference shown (computed), reason input.
"Approve" action (open→approved): for each line with `difference !== 0` — `update(item.id, { qty: item.qty + line.difference })` (difference = physical − system, so apply directly), `recordAdjustment({ itemId, itemName, sku, location, oldQty: systemQty, newQty: physicalQty, difference, reason: line.reason || 'Stock count', remarks: countNumber })`, `logMovement({ type: 'stock_count', qty: line.difference, from: location, to: location, reason: line.reason || 'Stock count', refNumber: countNumber })`. Approved counts are read-only.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseStockCount.tsx
git commit -m "feat(warehouse): stock count with auto-adjustment on approval"
```

---

### Task 13: MovementType 'dispatch' extension

**Files:**
- Modify: `frontend/src/services/warehouse/types.ts` (MovementType union)
- Modify: `frontend/src/services/warehouse/ledger.ts` (MOVEMENT_LABEL)

**Interfaces:**
- Consumes: nothing new.
- Produces: `MovementType` includes `'dispatch'`; `MOVEMENT_LABEL.dispatch = 'Dispatch'`. Required by Tasks 10-11.

- [ ] **Step 1: Add 'dispatch' to MovementType**

In `types.ts` change:
```ts
export type MovementType = 'GRN' | 'adjustment' | 'transfer_out' | 'transfer_in' | 'pick' | 'return' | 'stock_count'
```
to:
```ts
export type MovementType = 'GRN' | 'adjustment' | 'transfer_out' | 'transfer_in' | 'pick' | 'return' | 'stock_count' | 'dispatch'
```

- [ ] **Step 2: Add MOVEMENT_LABEL entry**

In `ledger.ts` add to `MOVEMENT_LABEL`:
```ts
  dispatch: 'Dispatch',
```

- [ ] **Step 3: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on both files — clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/warehouse/types.ts frontend/src/services/warehouse/ledger.ts
git commit -m "feat(warehouse): add dispatch movement type to ledger"
```

---

### Task 14: Home dashboard updates

**Files:**
- Modify: `frontend/src/services/warehouse/WarehouseHome.tsx`

**Interfaces:**
- Consumes: new seeds (`ORDER_SEED`, `PICK_SEED`), existing KPI grid pattern.
- Produces: extended KPI row + Quick links grid.

- [ ] **Step 1: Add outbound KPIs + links**

- Add collections: `const { items: orders } = useLocalCollection<SalesOrder>('warehouse:orders', ORDER_SEED)` and `const { items: picks } = useLocalCollection<PickList>('warehouse:picking', PICK_SEED)`.
- Add 2 KPIs to the existing grid: `{ label: 'Pending picking', value: picks.filter(p => p.status !== 'picked').length, icon: <ListChecks />, tone: 'warning', to: '/warehouse/picking' }` and `{ label: 'Pending dispatch', value: orders.filter(o => o.status === 'dispatched').length, icon: <Truck />, tone: 'info', to: '/warehouse/dispatch' }` — but keep the grid at a coherent size: replace the 6-KPI grid with these 8 KPIs (grid handles it: `lg:grid-cols-4`).
- Quick links grid: add Products, Customers, Transfers, Orders, Picking, Packing, Dispatch, Returns, Stock Count, Warehouses (icons: `Boxes`, `Users`, `ArrowLeftRight`, `ShoppingCart`, `ListChecks`, `PackageCheck`, `Truck`, `RotateCcw`, `ClipboardCheck`, `Building2`).
- Import new types + seeds at top.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc -b --pretty false` — Expected: 0 errors. Run oxlint on file — clean.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/warehouse/WarehouseHome.tsx
git commit -m "feat(warehouse): home dashboard outbound KPIs and quick links"
```

---

### Task 15: Route + nav registration

**Files:**
- Modify: `frontend/src/App.tsx` (imports 45-59 + warehouse routes 133-140)
- Modify: `frontend/src/Layout.tsx` (SERVICE_GROUPS.warehouse 76-102)

**Interfaces:**
- Consumes: all 9 new page default exports.
- Produces: navigable routes + sidebar groups.

- [ ] **Step 1: Add App.tsx imports**

After line 49 (`import WarehouseSuppliers ...`), add:
```ts
import WarehouseProducts from './services/warehouse/WarehouseProducts'
import WarehouseCustomers from './services/warehouse/WarehouseCustomers'
import WarehouseWarehouses from './services/warehouse/WarehouseWarehouses'
import WarehouseTransfers from './services/warehouse/WarehouseTransfers'
import WarehouseOrders from './services/warehouse/WarehouseOrders'
import WarehousePicking from './services/warehouse/WarehousePicking'
import WarehousePacking from './services/warehouse/WarehousePacking'
import WarehouseDispatch from './services/warehouse/WarehouseDispatch'
import WarehouseReturns from './services/warehouse/WarehouseReturns'
import WarehouseStockCount from './services/warehouse/WarehouseStockCount'
```

- [ ] **Step 2: Add App.tsx routes**

In the warehouse block (after line 138 `suppliers` route), add:
```tsx
          <Route path="/warehouse/products" element={<WarehouseProducts />} />
          <Route path="/warehouse/customers" element={<WarehouseCustomers />} />
          <Route path="/warehouse/warehouses" element={<WarehouseWarehouses />} />
          <Route path="/warehouse/transfers" element={<WarehouseTransfers />} />
          <Route path="/warehouse/orders" element={<WarehouseOrders />} />
          <Route path="/warehouse/picking" element={<WarehousePicking />} />
          <Route path="/warehouse/packing" element={<WarehousePacking />} />
          <Route path="/warehouse/dispatch" element={<WarehouseDispatch />} />
          <Route path="/warehouse/returns" element={<WarehouseReturns />} />
          <Route path="/warehouse/stock-count" element={<WarehouseStockCount />} />
```

- [ ] **Step 3: Add Layout.tsx nav items**

In `SERVICE_GROUPS.warehouse`:
- Inventory group (lines 84-89): add after GRN:
```tsx
      { label: 'Products', to: '/warehouse/products', icon: <Boxes className="w-5 h-5" /> },
      { label: 'Stock Transfer', to: '/warehouse/transfers', icon: <ArrowLeftRight className="w-5 h-5" /> },
      { label: 'Stock Count', to: '/warehouse/stock-count', icon: <ClipboardCheck className="w-5 h-5" /> },
      { label: 'Warehouses & Locations', to: '/warehouse/warehouses', icon: <Building2 className="w-5 h-5" /> },
```
- Customer & Retailer group (lines 80-83): add:
```tsx
      { label: 'Customers', to: '/warehouse/customers', icon: <Users className="w-5 h-5" /> },
```
- Add a new Outbound group after Inventory group:
```tsx
    { title: 'Outbound', items: [
      { label: 'Orders', to: '/warehouse/orders', icon: <ShoppingCart className="w-5 h-5" /> },
      { label: 'Picking', to: '/warehouse/picking', icon: <ListChecks className="w-5 h-5" /> },
      { label: 'Packing', to: '/warehouse/packing', icon: <PackageCheck className="w-5 h-5" /> },
      { label: 'Dispatch', to: '/warehouse/dispatch', icon: <Truck className="w-5 h-5" /> },
      { label: 'Returns', to: '/warehouse/returns', icon: <RotateCcw className="w-5 h-5" /> },
    ]},
```
- Add to the lucide import block (lines 11-48): `ArrowLeftRight`, `ClipboardCheck`, `Building2`, `ShoppingCart`, `ListChecks`, `PackageCheck`, `RotateCcw`.

- [ ] **Step 4: Verify compile + full build**

Run: `npx tsc -b --pretty false` — Expected: 0 errors.
Run: `npx vite build` — Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/Layout.tsx
git commit -m "feat(warehouse): register remaining module routes and navigation"
```

---

### Task 16: Full verification

**Files:** none (read-only checks)

- [ ] **Step 1: TypeScript**

Run: `npx tsc -b --pretty false` — Expected: exit 0, no output.

- [ ] **Step 2: Production build**

Run: `npx vite build` — Expected: `✓ built in ...s`, exit 0. (Pre-existing chunk-size warning is acceptable.)

- [ ] **Step 3: Lint warehouse code**

Run: `npx oxlint src/services/warehouse` — Expected: clean output, exit 0.

- [ ] **Step 4: Route smoke check**

Greps to confirm all 10 routes registered:
Run: `Select-String -Path frontend/src/App.tsx -Pattern 'warehouse/(products|customers|warehouses|transfers|orders|picking|packing|dispatch|returns|stock-count)'` — Expected: 10 matches.

- [ ] **Step 5: Confirm no forbidden files changed**

Run: `git status` — Expected: only warehouse files + App.tsx + Layout.tsx + spec/plan docs modified.

---

### Task 17: Commit remaining + push

**Files:** none

- [ ] **Step 1: Check clean tree**

Run: `git status --short` — Expect only `docs/services/warehouse-management-v1.md` untracked (keep untracked, or commit if user wants).

- [ ] **Step 2: Push**

```bash
git push origin luxinfra-frontend
```
Expected: `luxinfra-frontend -> luxinfra-frontend`.

- [ ] **Step 3: Report**

Summarize: 9 new pages, 10 modules, ledger discipline, routes, nav, verification evidence (tsc/build/lint exit codes).

---

## Self-Review Notes

- **Spec coverage**: §8 Products → Task 3; §12 Warehouses/Locations → Task 5; §14 Customers → Task 4; §18 Transfers → Task 6; §19 Orders → Task 7; §20 Picking → Task 8; §22 Packing → Task 9; §23 Dispatch → Task 10; §24 Returns → Task 11; §25 Stock Count → Task 12. §10 ledger discipline woven through Tasks 6-12. §32 DataTable reused everywhere. §38 UX rules in every page. §21 barcode scanner explicitly out (new dep). §29-30, 39-40 out (app-level). §34 API out (no backend).
- **Type consistency**: `availableOf(item)` = qty − reserved (existing); ORDER_FLOW/TRANSFER_FLOW/RETURN_FLOW defined Task 1, used Tasks 6-12; `recordAdjustment` (Task 12) matches `useAdjustments` signature `{ itemId, itemName, sku, location, oldQty, newQty, difference, reason, remarks }`.
- **One known dependency**: Task 10 uses MovementType `'dispatch'` — defined in Task 13. Task ordering keeps 13 before/with 10 in commit sequence; if executing in order, run Task 13 immediately after Task 2 (or before Task 10). No circular deps.
