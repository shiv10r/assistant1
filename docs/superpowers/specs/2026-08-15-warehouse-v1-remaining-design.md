# Warehouse Management V1 — Remaining Modules

Date: 2026-08-15
Status: Approved (scope + nav + route registration confirmed by user)

## 1. Purpose

Implement the remaining V1 warehouse modules from `Warehouse_Management_V1_React_Agent_Spec.md`
(§8, 12, 14, 18, 19, 20, 22, 23, 24, 25) as extensions of the existing LuxInfra warehouse
service at `frontend/src/services/warehouse/`. Everything stays frontend-only and
localStorage-backed via `useLocalCollection` (key prefix `warehouse:`), consistent with the
5 pages already shipped.

## 2. Scope

### In scope (10 modules, 9 new pages)

| Module | Spec § | Route | Collection key |
|---|---|---|---|
| Products | §8 | `/warehouse/products` | reuses `warehouse:inventory` |
| Customers | §14 | `/warehouse/customers` | `warehouse:customers` |
| Warehouses & Locations | §12 | `/warehouse/warehouses` | `warehouse:warehouses`, `warehouse:locations` |
| Stock Transfer | §18 | `/warehouse/transfers` | `warehouse:transfers` |
| Sales / Delivery Orders | §19 | `/warehouse/orders` | `warehouse:orders` |
| Picking | §20 | `/warehouse/picking` | `warehouse:picking` |
| Packing | §22 | `/warehouse/packing` | `warehouse:packing` |
| Dispatch | §23 | `/warehouse/dispatch` | `warehouse:dispatch` |
| Returns (customer + supplier) | §24 | `/warehouse/returns` | `warehouse:returns` |
| Stock Count | §25 | `/warehouse/stock-count` | `warehouse:stock-count` |

### Explicitly out of scope

- Barcode/QR scanner (§21) — requires new dependency (`html5-qrcode`); spec §49.18 forbids new libs. The nav already links to `/billing/items` for scanning.
- Users/Roles/Permissions, Notifications, Audit Logs, Reports (§28-30, 39-40) — exist at app level in LuxInfra; not part of the warehouse service.
- Backend API integration (§34, 42) — no warehouse backend exists; warehouse is a localStorage prototype.
- V2/V3 features (§46) — forecasting, RFID, IoT, etc. not implemented.

## 3. Design decisions (user-confirmed)

1. **Scope**: all remaining modules, one page per module.
2. **Navigation**: follow the existing pattern — register routes in `App.tsx` and nav items in `Layout.tsx` `SERVICE_GROUPS.warehouse`. User approved touching these two files for registration only.
3. **No new npm dependencies** (spec §49.18).
4. **Reuse**: DataTable, KpiCard, StatusBadge, Stepper, Drawer, ui kit, ledger hooks, `money()`/`fmtDate()` — no duplicate components.
5. **Stock integrity** (spec §10, §48): every quantity change is ledger-logged; never silently overwrite.

## 4. Architecture

### 4.1 Types (`types.ts` — extend)

Add:
- `Product` — actually reuses `InventoryItem`; add fields `barcode?: string`, `weight?: string`, `dimensions?: string` to `InventoryItem`.
- `Customer` — `{ id, name, company, gstin, phone, email, billingAddress, shippingAddress, status: 'active'|'inactive' }`.
- `StockTransfer` — `{ id, transferNumber, fromWarehouseId, toWarehouseId, date, status: 'created'|'dispatched'|'received'|'completed', items: { itemId, itemName, sku, qty, fromBin?, toBin? }[], notes }`.
- `SalesOrder` — `{ id, orderNumber, customerId, customerName, orderDate, warehouseId, status: 'created'|'confirmed'|'reserved'|'picking'|'packed'|'dispatched'|'completed'|'cancelled', lines: { itemId, itemName, sku, qty, price, taxPct, discountPct, total }[], subTotal, taxTotal, discountTotal, grandTotal, deliveryAddress, notes }`.
- `PickList` — `{ id, pickNumber, orderId, orderNumber, status: 'pending'|'picking'|'picked', items: { itemId, itemName, sku, location, requiredQty, pickedQty }[] }`.
- `Package` — `{ id, packageId, orderId, orderNumber, items: { itemId, itemName, qty }[], totalWeight, dimensions, packageCount, status: 'pending'|'packing'|'packed'|'ready', remarks }`.
- `Dispatch` — `{ id, dispatchNumber, orderId, orderNumber, customerName, packageId, transporter, courier, trackingNumber, dispatchDate, vehicleNumber, driver, status: 'ready'|'dispatched'|'completed', remarks }`.
- `ReturnRecord` — `{ id, returnNumber, type: 'customer'|'supplier', partyName, originalRef (order/GRN number), date, items: { itemId, itemName, qty, reason, condition: 'good'|'damaged', action: 'restock'|'quarantine'|'return_to_supplier' }[], status: 'requested'|'received'|'inspected'|'completed', remarks }`.
- `StockCount` — `{ id, countNumber, location, warehouseId, date, items: { itemId, itemName, systemQty, physicalQty, difference, reason }[], status: 'open'|'approved', createdBy }`.

Add workflow constants: `ORDER_FLOW`, `TRANSFER_FLOW`, `PICK_STATUS`, `PACK_STATUS`, `DISPATCH_STATUS`, `RETURN_FLOW`, matching existing `PO_FLOW` pattern. Extend `MovementType` with `'transfer' | 'pick' | 'dispatch' | 'return' | 'stock-count'` and `MOVEMENT_LABEL` entries.

### 4.2 Seed (`seed.ts` — extend)

- `CUSTOMER_SEED` — 3 customers.
- `TRANSFER_SEED`, `ORDER_SEED` (incl. one confirmed order ready to pick), `PICK_SEED` (linked to the confirmed order), `PACK_SEED`, `DISPATCH_SEED`, `RETURN_SEED` (one customer + one supplier), `STOCK_COUNT_SEED`.
- Extend `LOCATION_SEED` if needed for bin-to-bin transfer demo; keep `INVENTORY_SEED` id-stable so existing pages keep working.

### 4.3 New pages (9 files, one per module)

Each page follows the established pattern: `Card` header with primary action → `DataTable` with toolbar (search + status filter + CSV export) → `Modal`/`Drawer` for create/edit → toasts. Flows:

- **WarehouseProducts.tsx** — read-mostly catalog over `warehouse:inventory`: table (Image placeholder, Product, SKU, Barcode, Category, Stock, Status), search/category/status filter, detail drawer (Overview/History tabs using ledger movements), edit via the same modal shape as inventory.
- **WarehouseCustomers.tsx** — CRUD identical in shape to Suppliers.
- **WarehouseWarehouses.tsx** — two cards: Warehouses table (name/code/address/contact/phone/status, CRUD) + Locations table (code, warehouse, zone, rack, bin, capacity, status, CRUD). Hierarchical breadcrumb not needed in V1 — flat tables with warehouse filter.
- **WarehouseTransfers.tsx** — list + create wizard (2-step Stepper: select from/to + items by available qty → confirm). Status actions: Dispatch → Receive → Complete. On **Receive**: deduct from source warehouse items, add to destination (same-warehouse: bin-to-bin within the transfer item `fromBin`/`toBin`), log `transfer` movements for both sides. Completed transfers cannot be re-opened.
- **WarehouseOrders.tsx** — list + create modal (customer, warehouse, line items with price/tax/discount, grand total). Status actions: Confirm → Reserve (sets `reserved += qty` on items) → mark Picking → Packed → Dispatched → Completed. `ORDER_FLOW` badges.
- **WarehousePicking.tsx** — pick lists auto-generated from **reserved** orders (create button: "Generate pick list"; Reserve is done on the orders page before picking). Pick screen: per-item location/required/picked inputs, progress bar, Confirm Pick (deduct on-hand, log `pick` movement, release reserved). When all items picked → order status moves 'picking' → 'packed' (eligibility handled on the orders page via next-status action).
- **WarehousePacking.tsx** — packages per order: package id, items+qty, weight/dimensions/package count, remarks. Status: pending→packing→packed→ready.
- **WarehouseDispatch.tsx** — dispatch records: order, customer, package, transporter, courier, tracking, vehicle, driver. Status: ready→dispatched→completed. On dispatch: log `dispatch` movement, set order 'dispatched'.
- **WarehouseReturns.tsx** — tabs (Customer Returns / Supplier Returns). Customer: request→receive→inspect (good→restock + `return` movement into inventory; damaged→quarantine). Supplier: record → dispatch to supplier. Ledger-logged on restock.
- **WarehouseStockCount.tsx** — pick location → table of items with system qty + physical qty input → difference computed → reason → Submit creates `stock-count` adjustment in ledger + `recordAdjustment` and marks count approved.

### 4.4 Routing + nav registration

- `App.tsx`: add 9 imports + 9 `<Route path="/warehouse/...">` entries in the warehouse block (lines 133-140).
- `Layout.tsx` `SERVICE_GROUPS.warehouse`:
  - Inventory group: add Products, Stock Transfer, Stock Count, Warehouses & Locations.
  - New "Outbound" group: Orders, Picking, Packing, Dispatch, Returns.
  - Customer & Retailer group: add Customers.
  - Icons: `Boxes`/`Barcode`, `ArrowLeftRight`, `ListChecks`, `PackageCheck`, `Truck`, `RotateCcw`, `Building2`, `ScanLine` etc. from lucide-react (all already available in the dep).

### 4.5 Home dashboard updates

- `WarehouseHome.tsx`: extend Quick links grid with new routes; optionally add "Pending receiving / picking / dispatch" KPIs using the new collections (keep KPI set coherent, ~6 cards).

## 5. Data flow / integrity rules

1. **Ledger discipline**: every qty change (transfer receive, pick, dispatch, return restock, stock-count approval) calls `logMovement(...)` from `ledger.ts`. Adjustments use `recordAdjustment`.
2. **Reserved vs available**: orders reserve by incrementing `reserved`; picks release by decrementing on-hand and reserved. `availableOf()` (qty − reserved) gates transfer/pick quantities (cannot exceed available).
3. **Status transitions**: forward-only via `nextStatus(flow)` helper per module; no silent skips; completed/cancelled terminal states.
4. **ID stability**: existing seeds keep their ids (`wh-1`, `item-1`…) — no breaking changes to the 5 shipped pages.

## 6. Error handling / UX (spec §38, §42, §44)

- Toast for success/error on every save/transition.
- Empty states with icon + CTA on every DataTable.
- Required-field validation on create modals (name for customers/warehouses, at least one line for orders/transfers) with inline `required` labels.
- Confirm destructive ops (delete customer/warehouse/package) — use existing Modal pattern; deletion of customers/warehouses is allowed (prototype), stock-affecting ops are never one-click destructive.
- Loading states: DataTable `loading` prop wired where data fetch is async (localStorage is sync, so initial render is instant — still keep `loading` support as the spec requires).

## 7. Verification (definition of done, spec §48)

- `npx tsc -b --pretty false` — 0 errors.
- `npx vite build` — exit 0.
- `npx oxlint src` — no new warnings in `services/warehouse/`.
- Every new page reachable by route; each collection key unique; ledger entries written on all stock ops.

## 8. Out of scope reminders

- No new npm packages.
- Do not touch: `components/ui/*`, `api.ts`, `lib/*`, `lib/localStore.ts`, other services (school/interior/billing), non-warehouse pages.
- Do not implement picking's barcode-scan UI (no scanner component) — manual quantity entry + location display only.

## 9. Build order

1. `types.ts` + `seed.ts` extensions (foundation — everything depends on these)
2. `ledger.ts` movement-type extension
3. Master data pages: Products, Customers, Warehouses/Locations
4. Internal: Stock Transfer
5. Outbound chain: Orders → Picking → Packing → Dispatch → Returns
6. Management: Stock Count
7. `App.tsx` routes + `Layout.tsx` nav + Home quick-links
8. Verification (`tsc`, `vite build`, `oxlint`)
9. Commit (2-3 atomic commits) + push to `luxinfra-frontend`