# Warehouse Management System (WMS) — V1

## React Frontend Implementation Specification for AI Coding Agent

> \*\*Purpose:\*\* Build a realistic, production-ready-looking Warehouse Management System V1 for a small/medium business.
>
---

# 1\. Product Goal

Build a modern B2B Warehouse Management System that handles the complete basic warehouse lifecycle:

```text
Supplier
   ↓
Purchase Order
   ↓
Goods Receiving / GRN
   ↓
Put-away
   ↓
Inventory
   ↓
Stock Transfer / Stock Count
   ↓
Sales / Delivery Order
   ↓
Reservation
   ↓
Picking
   ↓
Packing
   ↓
Dispatch
   ↓
Customer
   ↓
Returns
```

The application should feel like a **modern SaaS product**, not an old ERP.

The main UX principle is:

> A warehouse user should be able to complete common tasks in approximately 2–3 clicks wherever practical.

Do not over-engineer V1 with enterprise features such as RFID, IoT, AI forecasting, robotics, Kubernetes, microservices, or complex external integrations.

\---

# 2\. Frontend Technology

Use the following stack unless an existing project already has equivalent libraries:

* React
* TypeScript
* React Router
* TanStack Query
* Axios
* React Hook Form
* Zod
* Tailwind CSS
* shadcn/ui
* Lucide React
* Recharts
* TanStack Table
* Sonner for toast notifications
* `html5-qrcode` or an equivalent browser-compatible barcode scanner

## State Management

Do NOT introduce Redux for V1 unless the existing application genuinely requires it.

Use:

### React state

For:

* Modal/drawer state
* Filters
* Form state
* Selected rows
* Temporary UI state

### TanStack Query

For:

* Products
* Inventory
* Orders
* Purchase orders
* GRNs
* Transfers
* Suppliers
* Customers
* Users
* Reports

### Context

Use only for:

* Authentication/current user
* Permissions
* Theme/global UI configuration

\---

# 3\. UI Design Direction

## Style

Use:

* Modern B2B SaaS
* Clean
* Professional
* Dense but readable data tables
* Light/white background
* Subtle gray sections
* Moderate 8–10px border radius
* Minimal shadows
* Inter or similar modern sans-serif
* Lucide line icons
* Clear primary actions
* Responsive layout

Avoid:

* Excessive gradients
* Excessive animations
* Huge cards
* Excessive rounded elements
* Too many colors
* Old ERP-style dense forms
* Decorative UI that does not help operations

## Semantic Colors

Use colors consistently:

* Green → Completed / Available / Success
* Amber → Pending / Warning / Low stock
* Red → Error / Damaged / Out of stock
* Blue → Primary action / Information
* Gray → Neutral / Disabled

Status colors must have meaning.

\---

# 4\. Global Application Layout

Use:

```text
DashboardLayout
├── Sidebar
└── Main Content
    ├── Top Header
    └── Page Content
```

Desktop:

```text
┌────────────────┬──────────────────────────────────────────────┐
│                │ Header                                       │
│    SIDEBAR     ├──────────────────────────────────────────────┤
│                │                                              │
│ Dashboard      │               Page Content                   │
│ Products       │                                              │
│ Inventory      │                                              │
│ Receiving      │                                              │
│ Transfers      │                                              │
│ Orders         │                                              │
│ Picking        │                                              │
│ Packing        │                                              │
│ Dispatch       │                                              │
│ Returns        │                                              │
│ Reports        │                                              │
│ Settings       │                                              │
└────────────────┴──────────────────────────────────────────────┘
```

\---

# 5\. Sidebar Navigation

Use collapsible navigation groups.

```text
🏠 Dashboard

INVENTORY
📦 Products
📊 Inventory
📍 Locations
🔄 Transfers
🔢 Stock Count

OPERATIONS
📥 Receiving
📋 Purchase Orders
📤 Picking
📦 Packing
🚚 Dispatch
↩ Returns

PARTNERS
🏢 Suppliers
👥 Customers

REPORTS
📈 Reports

SYSTEM
👤 Users \& Roles
⚙ Settings
```

Use active-route highlighting.

Hide navigation items when the logged-in user does not have permission.

\---

# 6\. Top Header

The top header should contain:

```text
\[Page / Breadcrumb]       \[Search] \[Warehouse] \[Scan] \[Notifications] \[User]
```

Required features:

* Global/search field
* Current warehouse selector
* Global barcode scan button
* Notification icon
* Current user menu
* Logout

The barcode scanner should be accessible globally.

\---

# 7\. Dashboard

The dashboard is primarily for managers/admins.

## KPI Cards

Show:

* Total Products / SKUs
* Total Stock Quantity
* Total Stock Value
* Low Stock Items
* Out-of-Stock Items
* Pending Orders
* Pending Receiving
* Pending Picking
* Pending Dispatch
* Pending Returns

Primary KPI cards:

```text
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total Products │ │ Total Stock    │ │ Low Stock      │ │ Pending Orders │
│                │ │                │ │                │ │                │
│    12,450      │ │    84,250      │ │      126       │ │      248       │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

## Dashboard sections

Include:

1. Stock trend chart
2. Today's operations
3. Low stock table
4. Recent activity
5. Pending operations
6. Recent stock movements

Operations card:

```text
Today's Operations

Receiving       18
Picking         32
Packing         21
Dispatch        24
Returns          5
```

Charts should be useful, not decorative.

\---

# 8\. Products Module

Route:

```text
/products
/products/new
/products/:id
```

## Product fields

* Product Name
* SKU Code
* Barcode / QR Code
* Category
* Brand
* Description
* Unit
* HSN Code
* GST %
* Purchase Price
* Selling Price
* Minimum Stock
* Reorder Level
* Maximum Stock
* Weight
* Dimensions
* Product Image
* Active / Inactive
* Track Batch
* Track Serial Number
* Track Expiry

Batch/serial/expiry tracking must be configurable per product.

## Product list

Include:

* Search
* Category filter
* Status filter
* Pagination
* Sorting
* Export
* Add Product

Columns:

```text
Image
Product
SKU
Barcode
Category
Stock
Status
Actions
```

## Product details

Use tabs:

```text
Overview | Inventory | Batches | Serial Numbers | History
```

Actions:

* Edit
* Adjust Stock
* Transfer
* Print Barcode
* Deactivate

\---

# 9\. Inventory Module

Route:

```text
/inventory
/inventory/:sku
/inventory/adjustment
```

Inventory is one of the most important modules.

Show:

```text
SKU
Product
Warehouse
Location
On Hand
Reserved
Available
Damaged
Quarantine
In Transit
Status
```

Use:

```text
Available = On Hand - Reserved
```

## Inventory table

```text
\[Search SKU / Product]
\[Warehouse]
\[Category]
\[Status]

\[+ Stock Adjustment]

Product | SKU | Location | On Hand | Reserved | Available | Status
```

## Product detail drawer

When clicking an inventory row, prefer a side drawer for quick information.

Show:

* Product
* SKU
* On Hand
* Reserved
* Available
* Location distribution
* Batch information if applicable
* Recent movements
* Transfer action
* Adjustment action
* View full history

\---

# 10\. Stock Ledger / Transactions

Every stock movement must be recorded.

Never silently overwrite stock quantities.

Example:

```text
Date       Type          Qty     From → To
15 Aug     GRN           +500    Supplier → Warehouse
15 Aug     Transfer      -100    WH-A → WH-B
16 Aug     Pick           -50    WH-B → Dispatch
16 Aug     Adjustment     -5    Damaged
```

Transaction types:

* GRN / Receiving
* Put-away
* Transfer
* Pick
* Dispatch
* Return
* Adjustment
* Stock count

Create a reusable stock history table.

\---

# 11\. Stock Adjustment

Route:

```text
/inventory/adjustment
```

Fields:

* Product
* Warehouse
* Location
* Current quantity
* New quantity
* Difference
* Reason
* Remarks

Reasons:

* Damaged
* Lost
* Found
* Counting error
* Other

Record the adjustment in the stock ledger and audit log.

\---

# 12\. Warehouse Management

Routes:

```text
/warehouses
/warehouses/:id/locations
```

Support multiple warehouses.

Hierarchy:

```text
Warehouse
 └── Zone
      └── Rack
           └── Bin
```

Warehouse fields:

* Name
* Code
* Address
* Contact person
* Phone
* Status

Location fields:

* Location code
* Warehouse
* Zone
* Rack
* Bin
* Capacity
* Status

\---

# 13\. Suppliers

Route:

```text
/suppliers
```

Fields:

* Supplier name
* Company
* GSTIN
* Phone
* Email
* Address
* Contact person
* Payment terms
* Status

Provide:

* Search
* Filters
* Pagination
* Add/Edit/Delete
* Supplier details

\---

# 14\. Customers

Route:

```text
/customers
```

Fields:

* Customer name
* Company
* GSTIN
* Phone
* Email
* Billing address
* Shipping address
* Status

Provide standard CRUD, search and filters.

\---

# 15\. Purchase Orders

Route:

```text
/purchase-orders
/purchase-orders/:id
/purchase-orders/new
```

Fields:

* PO number
* Supplier
* Date
* Expected delivery
* Warehouse
* Products
* Quantity
* Rate
* Tax
* Discount
* Total
* Notes

Workflow:

```text
Draft
 ↓
Submitted
 ↓
Approved
 ↓
Partially Received
 ↓
Received
 ↓
Closed
```

Use status badges.

\---

# 16\. Goods Receiving / GRN

Routes:

```text
/receiving
/receiving/new
```

Use a stepper/wizard.

```text
1. Purchase Order
        ↓
2. Receive Items
        ↓
3. Inspection
        ↓
4. Put-away
        ↓
5. Complete
```

## Step 1 — PO selection

Select PO and show supplier/expected quantity.

## Step 2 — Receive items

Columns:

```text
Product
Ordered
Received
Damaged
Accepted
```

## Step 3 — Inspection

Capture:

* Accepted quantity
* Damaged quantity
* Rejected quantity
* Remarks

## Step 4 — Put-away

Show suggested location.

Allow:

```text
Product → Location → Quantity
```

A single GRN item may be split across multiple bins.

Example:

```text
Laptop — 100 units

A01-02 → 60
A01-03 → 40
```

## Step 5 — Completion

Show a confirmation summary before committing the transaction.

\---

# 17\. Put-away

Put-away must update inventory only after confirmation.

Support:

* Suggested bin
* Manual bin selection
* Quantity
* Batch
* Expiry
* Serial number where applicable

\---

# 18\. Stock Transfer

Route:

```text
/transfers
/transfers/new
/transfers/:id
```

UI:

```text
FROM
\[ Gurgaon Warehouse ]

        ↓

TO
\[ Delhi Warehouse ]

Products
\[+ Add Product]

SKU     Available     Transfer
LP001      500          100
KB002      250           50
```

V1 workflow:

```text
Created
 ↓
Dispatched
 ↓
Received
 ↓
Completed
```

For a same-warehouse bin transfer, allow:

```text
A01-02 → A01-03
```

\---

# 19\. Sales / Delivery Orders

Routes:

```text
/orders
/orders/:id
/orders/new
```

Fields:

* Order number
* Customer
* Order date
* Warehouse
* Products
* Quantity
* Price
* Tax
* Discount
* Total
* Delivery address
* Notes

Workflow:

```text
Created
 ↓
Confirmed
 ↓
Reserved
 ↓
Picking
 ↓
Packed
 ↓
Dispatched
 ↓
Completed
```

\---

# 20\. Picking

Picking must be optimized for tablet/mobile.

Desktop manager view can show pick lists.

Mobile/tablet worker view:

```text
┌─────────────────────┐
│ ← Pick #PL-1001     │
├─────────────────────┤
│ Product: LAPTOP     │
│                     │
│ Location: A01-02    │
│ Required: 20        │
│ Picked: 15          │
│                     │
│ \[ 📷 SCAN BARCODE ] │
│                     │
│ \[ CONFIRM PICK ]    │
└─────────────────────┘
```

After scan:

```text
✓ Barcode matched

Required: 20
Scanned: 20

\[Confirm]
```

Support:

* Barcode scanning
* Manual barcode entry
* Quantity confirmation
* Wrong location warning
* Wrong product warning
* Progress indicator
* Next item

\---

# 21\. Barcode / QR Scanning

Create ONE reusable component:

```text
<BarcodeScanner />
```

Reuse it in:

* Receiving
* Put-away
* Picking
* Stock count
* Transfers
* Inventory lookup
* Product lookup

Global header action:

```text
🔍 Search   📷 Scan   🔔   User
```

Scanner UI:

```text
┌────────────────────────────┐
│        Scan Barcode        │
│                            │
│       ┌──────────┐         │
│       │  CAMERA  │         │
│       └──────────┘         │
│                            │
│ Or enter barcode manually  │
│ \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]     │
└────────────────────────────┘
```

Also support USB barcode scanners, which generally behave like keyboard input.

\---

# 22\. Packing

Route:

```text
/packing
/packing/:id
```

Capture:

* Package ID
* Order
* Items
* Quantity
* Weight
* Dimensions
* Number of packages
* Remarks

Workflow:

```text
Pending
 ↓
Packing
 ↓
Packed
 ↓
Ready for Dispatch
```

\---

# 23\. Dispatch

Route:

```text
/dispatch
/dispatch/:id
```

Capture:

* Dispatch number
* Order
* Customer
* Package
* Transporter
* Courier
* Tracking number
* Dispatch date
* Vehicle number
* Driver
* Remarks

Workflow:

```text
Ready
 ↓
Dispatched
 ↓
Completed
```

\---

# 24\. Returns

Route:

```text
/returns
```

## Customer return

```text
Customer
 ↓
Return Request
 ↓
Receive
 ↓
Inspect
 ├── Good → Stock
 └── Damaged → Quarantine
```

## Supplier return

```text
Warehouse
 ↓
Supplier Return
 ↓
Dispatch to Supplier
```

Capture:

* Return number
* Original order/GRN
* Product
* Quantity
* Reason
* Condition
* Action
* Date
* Remarks

\---

# 25\. Stock Count / Cycle Count

Route:

```text
/stock-count
```

Example:

```text
Location: A01-02

System Quantity: 500

Physical Quantity:
\[493]

Difference: -7

Reason:
\[Stock damaged]

\[Submit]
```

The system should create an adjustment transaction after confirmation/approval.

\---

# 26\. Batch / Expiry

Optional per product.

Batch fields:

* Batch number
* Manufacturing date
* Expiry date
* Quantity

Support:

* Expiring soon
* Expired
* Batch stock lookup

Do not force batch tracking for products that do not need it.

\---

# 27\. Serial Numbers

Optional per product.

Example:

```text
Product: Dell Laptop

SN12345
SN12346
SN12347
```

Each serial should have movement history.

\---

# 28\. Notifications

V1 notifications:

* Low stock
* Out of stock
* Expiring stock
* Pending receiving
* Pending picking
* Pending dispatch
* Transfer received
* Return pending

Use an in-app notification panel.

Do not build SMS/WhatsApp integrations in V1.

\---

# 29\. Users, Roles and Permissions

Roles:

```text
Admin
Warehouse Manager
Storekeeper
Picker
Dispatch User
Viewer
```

Example permission matrix:

```text
Feature             Admin  Manager  Storekeeper  Picker  Dispatch  Viewer
Products              ✓       ✓         ✓         -        -         R
Inventory              ✓       ✓         ✓         R        R         R
Receiving              ✓       ✓         ✓         -        -         R
Transfers              ✓       ✓         ✓         -        -         R
Picking                ✓       ✓         -         ✓        -         R
Packing                ✓       ✓         -         -        ✓         R
Dispatch               ✓       ✓         -         -        ✓         R
Adjustments            ✓       ✓         -         -        -         R
Reports                ✓       ✓         R         -        R         R
Users/Roles            ✓       -         -         -        -         -
```

`R` = read-only.

IMPORTANT:

Frontend permissions only control the UI. The .NET API must enforce authorization independently.

\---

# 30\. Authentication

Use:

```text
Login
 ↓
.NET API
 ↓
JWT
 ↓
Auth Context
 ↓
Protected Routes
```

React should provide:

* Login
* Logout
* Current user
* Protected routes
* Permission-aware UI

Example route structure:

```tsx
<ProtectedRoute>
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
</ProtectedRoute>
```

\---

# 31\. Reusable React Components

Create a reusable UI layer.

```text
components/
├── ui/
├── layout/
├── tables/
├── forms/
├── modals/
├── drawers/
├── charts/
├── scanner/
└── common/
```

Important components:

```text
Button
Input
Select
Dialog
Drawer
Sheet
Dropdown
Tabs
Badge
Card
DataTable
Pagination
DatePicker
FileUpload
Stepper
EmptyState
ConfirmDialog
LoadingSkeleton
ErrorState
BarcodeScanner
KpiCard
StatusBadge
PageHeader
SearchFilterBar
```

Do not duplicate these across modules.

\---

# 32\. Data Table Standard

Create one reusable `<DataTable />`.

Every major list should support:

* Search
* Pagination
* Sorting
* Filters
* Column visibility
* Row actions
* Loading state
* Empty state
* Error state
* Export where applicable
* Responsive behavior

Do not create a completely different table implementation for every module.

\---

# 33\. Forms

Use:

```text
React Hook Form
+
Zod
```

All forms need:

* Required field validation
* Inline validation messages
* Loading state
* Disabled submit during request
* Success toast
* API error handling
* Confirmation where destructive

Example product form:

```text
Add Product

Product Name \*
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]

SKU \*
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]

Barcode
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]

Category \*
\[ Select ]

Unit \*
\[ Select ]

Purchase Price
\[ ₹ \_\_\_\_\_\_\_\_\_\_ ]

Selling Price
\[ ₹ \_\_\_\_\_\_\_\_\_\_ ]

GST
\[ 18% ▼ ]

☐ Track Batch
☐ Track Serial Number
☐ Track Expiry

\[Cancel] \[Save Product]
```

\---

# 34\. API Layer

Use Axios with a central API client.

Recommended structure:

```text
services/
├── api.ts
├── authApi.ts
├── productApi.ts
├── inventoryApi.ts
├── warehouseApi.ts
├── supplierApi.ts
├── customerApi.ts
├── purchaseOrderApi.ts
├── receivingApi.ts
├── transferApi.ts
├── orderApi.ts
├── pickingApi.ts
├── packingApi.ts
├── dispatchApi.ts
├── returnApi.ts
├── reportApi.ts
└── userApi.ts
```

Do not call Axios directly from every component.

Use feature hooks:

```text
useProducts()
useProduct()
useCreateProduct()
useUpdateProduct()

useInventory()
useStockAdjustment()

usePurchaseOrders()
useCreatePurchaseOrder()

useGRNs()
useCreateGRN()

useTransfers()
useCreateTransfer()

useOrders()
usePickList()
useDispatch()
```

\---

# 35\. React Project Structure

Use feature-oriented organization.

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── layouts/
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── tables/
│   ├── forms/
│   ├── modals/
│   ├── drawers/
│   ├── charts/
│   └── scanner/
│
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── products/
│   ├── inventory/
│   ├── warehouses/
│   ├── receiving/
│   ├── transfers/
│   ├── orders/
│   ├── picking/
│   ├── packing/
│   ├── dispatch/
│   ├── returns/
│   ├── suppliers/
│   ├── customers/
│   ├── reports/
│   └── settings/
│
├── features/
│   ├── products/
│   ├── inventory/
│   ├── receiving/
│   ├── transfers/
│   ├── orders/
│   ├── picking/
│   └── dispatch/
│
├── services/
├── hooks/
├── types/
├── utils/
├── constants/
└── assets/
```

Keep large feature-specific logic close to the feature.

\---

# 36\. Routes

Implement:

```text
/login

/dashboard

/products
/products/new
/products/:id

/inventory
/inventory/:sku
/inventory/adjustment

/warehouses
/warehouses/:id/locations

/suppliers
/customers

/purchase-orders
/purchase-orders/new
/purchase-orders/:id

/receiving
/receiving/new

/transfers
/transfers/new
/transfers/:id

/orders
/orders/new
/orders/:id

/picking
/picking/:id

/packing
/packing/:id

/dispatch
/dispatch/:id

/returns

/stock-count

/reports

/settings/users
/settings/roles
/settings
```

\---

# 37\. Responsive Design

## Desktop

Full sidebar and dense tables.

## Tablet

Optimized navigation and larger touch targets.

## Mobile

Prioritize warehouse tasks:

```text
Home
Inventory
Scan
Picking
More
```

The mobile workflow should focus on:

```text
Scan
 ↓
Identify item
 ↓
Show location
 ↓
Enter/scan quantity
 ↓
Confirm
```

Do not attempt to fit the entire desktop dashboard onto a phone.

\---

# 38\. Important UX Rules

1. Every page must have one obvious primary action.
2. Use drawers for quick details.
3. Use dialogs for short confirmations.
4. Use full pages for complex workflows.
5. Use stepper/wizard for receiving.
6. Use mobile-first workflow for picking.
7. Always show loading states.
8. Always show empty states.
9. Always show API error states.
10. Confirm destructive operations.
11. Never silently change inventory.
12. Always show stock movement history.
13. Use status badges consistently.
14. Keep tables searchable and filterable.
15. Avoid unnecessary navigation.

Primary actions:

```text
Products       → + Add Product
Inventory      → + Stock Adjustment
Receiving      → + Receive Goods
Transfers      → + New Transfer
Orders         → + New Order
Picking        → Start Picking
Dispatch       → + Create Dispatch
```

\---

# 39\. Reports

V1 reports:

## Inventory

* Current stock
* Low stock
* Out of stock
* Stock valuation
* Stock movement
* Stock ageing
* Damaged stock

## Purchase

* Purchase orders
* Pending POs
* Receiving report
* Supplier-wise purchases

## Sales / Orders

* Orders
* Pending orders
* Dispatch report
* Customer-wise orders

## Warehouse

* Transfer report
* Picking report
* Dispatch report
* Location-wise stock

## Returns

* Customer returns
* Supplier returns

Support:

* Excel export
* CSV export
* PDF export where practical

\---

# 40\. Audit Log

Record important changes:

```text
User
Action
Module
Record ID
Old Value
New Value
Date/Time
```

Examples:

* Stock adjustment
* Product update
* Order status change
* GRN completion
* Transfer completion
* User/role change

\---

# 41\. V1 Database/Domain Expectations

The frontend should be designed to work with entities approximately equivalent to:

```text
Users
Roles
Permissions

Products
Categories
Units
ProductBarcodes

Warehouses
Zones
Racks
Bins

Suppliers
Customers

PurchaseOrders
PurchaseOrderItems

GRNs
GRNItems

Inventory
InventoryLocations
Batches
SerialNumbers

StockTransactions
StockAdjustments

StockTransfers
StockTransferItems

SalesOrders
SalesOrderItems

PickLists
PickListItems

Packages
PackageItems

Dispatches

CustomerReturns
CustomerReturnItems

SupplierReturns
SupplierReturnItems

StockCounts
StockCountItems

Notifications
AuditLogs
```

Do not create unnecessary frontend assumptions if the existing backend uses different naming. Map API DTOs cleanly to frontend types.

\---

# 42\. API / Frontend Error Handling

Every API request should handle:

```text
Loading
Success
Empty
Error
Unauthorized
Forbidden
Validation error
Network error
```

Show user-friendly messages.

Never expose raw stack traces to users.

Use toast notifications for simple success/error messages and inline validation for form problems.

\---

# 43\. Performance Requirements

V1 should be responsive with realistic data.

Important rules:

* Server-side pagination for large tables
* Server-side filtering where API supports it
* Avoid loading thousands of inventory rows at once
* Use TanStack Query caching
* Lazy-load large page modules where useful
* Avoid unnecessary re-renders
* Use memoization only where it provides real value
* Optimize images
* Do not render huge hidden tables

\---

# 44\. Accessibility

Use:

* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible dialogs
* Accessible tables
* Semantic buttons
* Sufficient contrast
* Tooltips only where needed

Do not make icons the only way to understand important actions.

\---

# 45\. V1 Scope — Include

The first usable version must include:

```text
✓ Authentication
✓ Dashboard
✓ Products
✓ Categories
✓ Warehouses
✓ Locations / bins
✓ Suppliers
✓ Customers
✓ Purchase Orders
✓ GRN / Receiving
✓ Put-away
✓ Inventory
✓ Stock Ledger
✓ Stock Adjustment
✓ Stock Transfer
✓ Sales / Delivery Orders
✓ Stock Reservation
✓ Picking
✓ Packing
✓ Dispatch
✓ Customer Returns
✓ Supplier Returns
✓ Stock Count
✓ Barcode / QR scanning
✓ Optional batch/expiry
✓ Optional serial numbers
✓ Notifications
✓ Users / Roles
✓ Permissions
✓ Audit Logs
✓ Reports
✓ Search / Filters
✓ Export
✓ Responsive UI
```

\---

# 46\. Explicitly Out of Scope for V1

Do NOT implement unless specifically requested:

```text
✗ AI demand forecasting
✗ RFID
✗ IoT
✗ Robotics
✗ Automated warehouse hardware
✗ Route optimization
✗ Kubernetes
✗ Microservices
✗ Complex event-driven architecture
✗ WhatsApp automation
✗ SMS integration
✗ Multiple courier integrations
✗ Full accounting system
✗ Advanced ERP
✗ Multi-country tax engine
✗ Complex enterprise approval chains
```

\---

# 47\. Implementation Order

The AI coding agent should implement in this order.

## Phase 1 — Foundation

```text
1. Project structure
2. Tailwind/shadcn setup
3. Theme
4. Routing
5. Layout
6. Sidebar
7. Header
8. Authentication shell
9. API client
10. TanStack Query setup
11. Common components
```

## Phase 2 — Master Data

```text
12. Products
13. Categories
14. Warehouses
15. Locations
16. Suppliers
17. Customers
```

## Phase 3 — Inventory

```text
18. Inventory
19. Stock ledger
20. Stock adjustment
21. Stock count
22. Barcode scanner
```

## Phase 4 — Inbound

```text
23. Purchase Orders
24. GRN
25. Receiving
26. Put-away
```

## Phase 5 — Internal Operations

```text
27. Stock Transfer
28. Batch/expiry
29. Serial numbers
```

## Phase 6 — Outbound

```text
30. Sales/Delivery Orders
31. Reservation
32. Picking
33. Packing
34. Dispatch
35. Returns
```

## Phase 7 — Management

```text
36. Dashboard
37. Notifications
38. Reports
39. Users
40. Roles
41. Permissions
42. Audit Logs
```

## Phase 8 — Polish

```text
43. Responsive design
44. Loading states
45. Empty states
46. Error handling
47. Accessibility
48. Performance optimization
49. Final UI consistency
50. Production build validation
```

\---

# 48\. Definition of Done

A module is NOT complete merely because the page exists.

For every module, verify:

```text
✓ Route works
✓ UI is responsive
✓ API integration works
✓ Loading state exists
✓ Empty state exists
✓ Error state exists
✓ Form validation works
✓ Success notification works
✓ Permission handling works
✓ Pagination works where needed
✓ Search/filter works where needed
✓ No console errors
✓ No TypeScript errors
✓ No obvious duplicate components
```

For inventory-related modules additionally verify:

```text
✓ Stock movement is recorded
✓ Quantities cannot silently become inconsistent
✓ Warehouse/location is tracked
✓ Reserved vs available is handled
✓ Audit trail exists
```

\---

# 49\. Agent Rules

The coding agent must follow these rules:

1. Inspect the existing project before changing architecture.
2. Reuse existing components where they are good.
3. Do not rewrite working functionality unnecessarily.
4. Do not create duplicate components.
5. Keep TypeScript strict and avoid `any` unless unavoidable.
6. Keep API calls out of presentational components.
7. Use reusable hooks for server state.
8. Use reusable DataTable components.
9. Use reusable forms and validation patterns.
10. Keep business logic out of UI components where possible.
11. Do not hardcode business data in production components.
12. Use environment variables for API URLs and configuration.
13. Do not expose secrets in React.
14. Do not trust frontend permissions; backend must enforce authorization.
15. Do not silently modify inventory.
16. Maintain consistent naming.
17. Maintain responsive behavior.
18. Do not add unnecessary libraries.
19. Do not implement V2/V3 features unless explicitly requested.
20. After each major phase, verify the application builds successfully.

\---

# 50\. Final Product UX Target

The finished application should feel like:

> \*\*A modern SaaS warehouse system with the simplicity of a Shopify-style admin panel, combined with practical warehouse workflows.\*\*

It should NOT feel like:

> A legacy ERP with huge forms and dozens of unrelated buttons.

The most important workflows must be fast:

```text
Receive Goods
→ Scan/Select PO
→ Confirm quantities
→ Put-away
→ Inventory updated

Pick Order
→ Open Pick List
→ Navigate to location
→ Scan barcode
→ Confirm quantity
→ Complete pick

Transfer Stock
→ Select source
→ Select destination
→ Add items
→ Dispatch
→ Receive

Stock Count
→ Select location
→ Count
→ Compare
→ Adjust
```

Build V1 around these workflows first. The dashboard and visual polish should support the workflows rather than replace them.

Yes — the issue in the screenshot is that the **search icon is sitting on top of / overlapping the placeholder text** (`Search staff...`). The icon needs its own space inside the input.

Give the agent this exact instruction:

```md
### Fix: Search Input Icon Overlapping Placeholder

The search icon in the "Search staff..." input is overlapping the placeholder text.

Current issue:
- The search icon is positioned too close to the left edge/text.
- "Search staff..." starts underneath or too close to the icon.
- The icon and text must never overlap.

Required fix:
1. Keep the search icon inside the input on the left.
2. Give the input text sufficient left padding so the placeholder starts AFTER the icon.
3. Vertically center the icon and text.
4. The icon must remain properly aligned when the input is focused.
5. Do not change the overall height, width, border, background, or visual design of the search box unnecessarily.
6. Make sure the fix works for both placeholder text and actual entered text.
7. Ensure the layout remains correct on responsive/mobile screens.

Expected layout:

┌──────────────────────────────────────────────┐
│  🔍   Search staff...                        │
└──────────────────────────────────────────────┘

NOT:

┌──────────────────────────────────────────────┐
│ 🔍Search staff...                            │
└──────────────────────────────────────────────┘

Implementation guidance:
- Position the search icon absolutely inside the input container.
- Keep the icon vertically centered.
- Add adequate left padding (`padding-left`) to the input.
- The icon should not participate in the input text flow.
- Use relative positioning on the wrapper and absolute positioning for the icon.
- Do not use negative margins or positioning hacks to solve the overlap.
```

If you're using **Tailwind**, the typical structure should be:

```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />

  <Input
    placeholder="Search staff..."
    className="pl-12"
  />
</div>
```

The key part is **`pl-12`** (or an equivalent adequate left padding), so `"Search staff..."` starts to the right of the icon.

Add Bank Account
Enter your bank details for balance tracking button is not  working 
The  current  color of the applicaiton text and backgrounds  is not acceptable its loooks shitty  not  feels like  enterprize level app
LuxInfra
● Online

🌤️



Assistant
Dashboard
Chat
Analytics
Backup & Sync
Activity
Settings

Business
Insights
Video Call

More
Broadcast
PRO
Upcoming Feature
when ever i click on any of the option while  staying on ware house service it swaps the  service navigates back  to some random not on the page where i have logged in  


LuxInfra
Choose the workspace for this session


🏠
Interior Design
Projects, sites, design boards & material planning
Open workspace

📦
Warehouse Store
Inventory, stock levels, suppliers & purchase orders
Open workspace

🎓
School Management
Students, classes, fees & attendance (coming soon)
redesign this entire page  filled iht animation   can refer this 

To bring this launcher to a modern, enterprise-grade finish, you need **smooth micro-interactions, layout transitions, dynamic states, and responsive depth** using **Framer Motion** and **Tailwind CSS**.

Here is a production-ready component complete with smooth hover scaling, card lift, subtle gradient borders, and reactive accessibility states:

---

### React + Framer Motion Component

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  Square3Stack3DIcon, 
  AcademicCapIcon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const workspaces = [
  {
    id: 'interior',
    title: 'Interior Design',
    desc: 'Project management, site tracking, design boards & material planning.',
    icon: BuildingOffice2Icon,
    status: 'Active',
    metrics: '12 Active Sites',
    color: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'group-hover:border-purple-500/50',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    enabled: true,
  },
  {
    id: 'warehouse',
    title: 'Warehouse Store',
    desc: 'Real-time stock tracking, supplier POs, receiving logs & dispatching.',
    icon: Square3Stack3DIcon,
    status: 'Active',
    metrics: '3 Low Stock Alerts',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'group-hover:border-blue-500/50',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    enabled: true,
  },
  {
    id: 'school',
    title: 'School Management',
    desc: 'Student records, classes, fee collection & automated attendance tracking.',
    icon: AcademicCapIcon,
    status: 'Coming Soon',
    metrics: 'Q4 2026 Release',
    color: 'from-slate-800/20 to-slate-800/10',
    borderColor: 'border-slate-800',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    enabled: false,
  },
];

export default function EnterpriseLauncher() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header Navigation */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-16 border-b border-slate-800/80 bg-[#0F172A]/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Lux<span className="text-blue-500">Infra</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Enterprise v2.4
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800 transition-all">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
            <span>Search apps or commands...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">⌘K</kbd>
          </button>
          
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors relative">
            <BellIcon className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
          </button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-semibold text-xs text-white ring-2 ring-slate-800 cursor-pointer">
            JD
          </div>
        </div>
      </motion.header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center sm:text-left"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Select Workspace</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Choose an authorized portal to manage real-time site operations, resources, and enterprise metrics.
          </p>
        </motion.div>

        {/* Grid Container */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {workspaces.map((ws) => {
            const Icon = ws.icon;
            return (
              <motion.div
                key={ws.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={ws.enabled ? { y: -6, transition: { duration: 0.2 } } : {}}
                onHoverStart={() => setHoveredCard(ws.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`relative group rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between overflow-hidden transition-colors ${
                  ws.enabled ? 'hover:border-slate-700 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Subtle Background Glow Animation */}
                <AnimatePresence>
                  {hoveredCard === ws.id && ws.enabled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-gradient-to-br ${ws.color} pointer-events-none blur-xl`}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  {/* Top Badge & Icon */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 text-white shadow-inner">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${ws.badgeColor}`}>
                      {ws.metrics}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>

                {/* Animated Call-To-Action Button */}
                <div className="relative z-10 mt-8">
                  <motion.button
                    disabled={!ws.enabled}
                    whileTap={ws.enabled ? { scale: 0.98 } : {}}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      ws.enabled
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{ws.enabled ? 'Open Workspace' : 'Access Restricted'}</span>
                    {ws.enabled && (
                      <motion.div
                        animate={{ x: hoveredCard === ws.id ? 4 : 0 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}

```

---

### Key Enterprise Design Enhancements

* **Staggered Entry Animations:** Cards fade and slide in sequentially on load via Framer Motion variants.
* **Glow Effects:** Hovering over an active workspace generates a blurred background glow tailored to the workspace's accent palette.
* **Interactive Directional Indicators:** The action arrow icon dynamically slides forward (`x: 4px`) on hover, signaling clickability.
* **Glassmorphism Header:** The header features an operational command palette trigger (`⌘K`), active notification bell badge, and user avatar.
* **Clear Accessibility & Disabled States:** Inactive cards like *School Management* drop opacity, disable pointer events, and explicitly display restriction statuses without breaking layout alignment.

ADDED ONE IMAGE THAT KIND IF DESIGN WE MIGHT NEED 

Yes — give the coding agent this **exact text specification**. It focuses on reproducing the visual design, not explaining the screenshot generally.

````md
# LuxInfra — Workspace Selection Page UI Specification

## Goal

Redesign the existing LuxInfra workspace-selection page to closely reproduce the provided reference design.

The page should feel like a **premium modern B2B SaaS application** with a dark navy/charcoal theme, warm orange accent color, subtle background decoration, strong typography, and polished cards.

Do NOT simply copy the existing layout. Rework the visual hierarchy and styling to match the specification below.

---

# 1. Overall Page

Create a full-screen workspace selection page.

### Layout

- Full viewport height: `min-height: 100vh`
- Dark navy/charcoal background
- Content vertically centered
- No visible browser-style container around the application
- Responsive on desktop, tablet and mobile
- Content should have generous spacing
- Maximum content width around `1200–1250px`

### Background

Use a very dark navy/charcoal background rather than the current olive/brown background.

Suggested:

```text
#080D16
#0B1019
#0D121C
````

Do NOT use a pure black background.

Add subtle decorative elements:

* Very faint orange dotted pattern toward the left
* Very faint circular/radial orange line pattern toward the right
* Similar subtle curved lines in the bottom-left
* Decorations must remain low contrast
* They must never interfere with readability

The background decoration should feel premium and subtle, not like a large graphic.

---

# 2. Header

Place a simple application header at the top.

### Left

LuxInfra logo/brand:

```text
[Home/Infrastructure icon] LuxInfra
```

Brand styling:

* "Lux" → white/light gray
* "Infra" → orange
* Bold typography
* Logo icon in orange
* Approximate font size: `28–32px`

Example:

```text
⌂ LuxInfra
```

Use the actual existing LuxInfra logo if available rather than replacing it with a generic icon.

### Right

Add:

```text
? Help     |     [A] Admin ▼
```

Help:

* Question-circle icon
* "Help"
* Light gray text

Admin control:

* Rounded dark translucent button
* Orange circular avatar containing `A`
* Text: `Admin`
* Down-chevron icon

Example:

```text
                         ? Help   │   🟠 A  Admin  ˅
```

The header should not consume too much vertical space.

---

# 3. Main Heading

Center the main content.

Heading:

```text
Welcome to LuxInfra
```

Styling:

* Large
* Bold
* White
* Approximately `48–56px` desktop
* "Lux" / "Welcome to" in white
* "Infra" in orange

Example:

```text
Welcome to LuxInfra
              ^^^^^
              orange
```

Below it:

```text
Choose the workspace for this session
```

Styling:

* Light gray
* Approximately `18–20px`
* Regular weight

Add a small orange horizontal accent line below the subtitle.

Example:

```text
Welcome to LuxInfra
Choose the workspace for this session
             ─────
```

The accent line should be approximately:

```text
width: 60px
height: 4px
border-radius: 999px
```

---

# 4. Workspace Cards

Place three cards horizontally on desktop.

```text
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │  │                  │
│      ICON        │  │      ICON        │  │      ICON        │
│                  │  │                  │  │                  │
│ Interior Design  │  │ Warehouse Store  │  │ School Management│
│                  │  │                  │  │                  │
│ Description      │  │ Description      │  │ Description      │
│                  │  │                  │  │                  │
│ Open workspace → │  │ Open workspace → │  │ Open workspace → │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Card dimensions

Desktop:

* Three equal-width cards
* Gap approximately `36–40px`
* Width approximately `370–390px`
* Height approximately `400px`
* Border radius: `14–18px`

Use:

```css
background: rgba(...)
border: 1px solid ...
```

Cards should have a subtle glass/dark-panel appearance.

---

# 5. Card 1 — Interior Design

Icon:

Use a modern interior/home icon.

Prefer an icon from Lucide or the existing icon system instead of emoji.

Icon container:

* Rounded square
* Warm peach/orange background
* Approximately `110x110px`
* Centered

Title:

```text
Interior Design
```

Description:

```text
Projects, sites, design boards
& material planning
```

Button:

```text
Open workspace    →
```

---

# 6. Card 2 — Warehouse Store

This is the PRIMARY / ACTIVE workspace.

It must visually stand out from the other cards.

Title:

```text
Warehouse Store
```

Description:

```text
Inventory, stock levels,
suppliers & purchase orders
```

Icon:

Use a warehouse/storage icon.

### Active card styling

Use:

* Orange border
* Slight orange glow
* Slightly warmer card background
* More visual emphasis than the other two cards

Example:

```css
border: 1px solid orange;
box-shadow: 0 0 30px rgba(orange, 0.15);
```

Do NOT make the glow excessive.

### Active button

The Warehouse button should be filled orange:

```text
[ Open workspace   → ]
```

Other workspace buttons should preferably use an outlined/dark style.

This immediately communicates:

> Warehouse Store is the currently selected/primary workspace.

---

# 7. Card 3 — School Management

Title:

```text
School Management
```

Description:

```text
Students, classes, fees &
attendance (coming soon)
```

Icon:

Use a graduation-cap/school icon.

Since it is coming soon:

* Keep the card visually available
* Do not make it look broken
* Optionally show a small `Coming Soon` badge
* Keep the workspace button available only if the existing business logic supports it
* If disabled, clearly communicate disabled state

---

# 8. Card Content Alignment

All three cards must have consistent structure.

Use approximately:

```text
Icon
   ↓
Title
   ↓
Description
   ↓
Divider
   ↓
Button
```

Do NOT allow one card's button to move vertically because its description is longer.

Cards should have consistent heights.

Use flexbox:

```text
display: flex;
flex-direction: column;
```

and push the action section toward the bottom.

---

# 9. Workspace Buttons

Button style:

```text
Open workspace  →
```

Use:

* Medium/large height
* `12–14px` vertical padding
* `20–28px` horizontal padding
* Border radius approximately `8–10px`
* Semibold font
* Arrow icon on the right

### Active button

Filled orange.

### Inactive button

Dark/transparent background with orange border or subtle border.

### Hover

Add a subtle:

* brightness increase
* border change
* 2–4px upward movement
* shadow/glow

Do not add excessive animation.

---

# 10. Return Button

Below the workspace cards, center a secondary action.

Text:

```text
Want to switch back?

[ ←  Return to Warehouse Store ]
```

The question text should be light gray and relatively small.

Button:

* Dark transparent background
* Subtle border
* Rounded corners
* White text
* "Warehouse Store" highlighted in orange
* Left arrow icon

Example:

```text
Want to switch back?

┌─────────────────────────────────┐
│ ←  Return to Warehouse Store    │
└─────────────────────────────────┘
```

Only display this section when there is actually a previous workspace/session to return to.

---

# 11. Bottom Feature Strip

Add a premium feature strip near the bottom of the content.

Use one horizontal container divided into four sections.

```text
┌───────────────────────────────────────────────────────────────┐
│ 🛡 Secure & Reliable │ ◷ Always Available │ ⚡ Fast & Efficient │
│                       │                   │                    │
│ Your data is protected│ 24/7 access       │ Built for          │
│                       │ from anywhere      │ your productivity  │
├───────────────────────────────────────────────────────────────┤
│ 👥 Role Based Access                                             │
│    Right access, right people                                   │
└───────────────────────────────────────────────────────────────┘
```

On desktop, all four should appear in one horizontal row.

Features:

### 1

Icon: Shield

Title:

```text
Secure & Reliable
```

Subtitle:

```text
Your data is protected
```

### 2

Icon: Clock

Title:

```text
Always Available
```

Subtitle:

```text
24/7 access from anywhere
```

### 3

Icon: Zap

Title:

```text
Fast & Efficient
```

Subtitle:

```text
Built for your productivity
```

### 4

Icon: Users

Title:

```text
Role Based Access
```

Subtitle:

```text
Right access, right people
```

Icons should use the LuxInfra orange accent.

Use subtle vertical dividers between items.

---

# 12. Typography

Use a modern font such as:

```text
Inter
```

or the existing application font if already configured.

Hierarchy:

```text
Logo              28–32px / bold
Main heading      48–56px / 700–800
Subtitle          18–20px / 400
Card title        24–26px / 700
Card description  16–17px / 400
Button            15–16px / 600
Feature title     15–16px / 600
Feature subtitle  13–14px / 400
```

Do not use excessively heavy fonts everywhere.

---

# 13. Color System

Use a consistent theme.

### Background

```text
Deep Navy:
#080D16
```

### Card

```text
#151B25
```

### Active card

```text
Dark warm/orange-tinted navy
```

### Primary Orange

Use a warm LuxInfra orange approximately:

```text
#FF9638
```

or reuse the existing LuxInfra brand orange if already defined.

### Text

Primary:

```text
#F5F7FA
```

Secondary:

```text
#AAB2BF
```

Muted:

```text
#737D8C
```

Borders:

```text
rgba(255,255,255,0.12)
```

Active border:

```text
#FF9638
```

Do not introduce random colors.

---

# 14. Spacing

Desktop content should feel spacious.

Approximate:

```text
Header horizontal padding: 32–40px

Main top spacing: 50–70px

Heading → subtitle: 12px

Subtitle → accent: 20px

Accent → cards: 32–40px

Card internal padding: 36–40px

Card gap: 32–40px

Cards → return section: 35–45px

Return section → feature strip: 30–40px
```

Avoid making everything tightly packed.

---

# 15. Responsive Behavior

### Desktop ≥ 1100px

Three cards horizontally.

```text
[Interior] [Warehouse] [School]
```

### Tablet 768–1099px

Cards can remain two columns or transition to:

```text
[Interior] [Warehouse]

[School]
```

Feature strip may become two columns.

### Mobile < 768px

Everything becomes one column:

```text
Logo

Welcome to LuxInfra
Choose workspace

[Interior Design]
[Warehouse Store]
[School Management]

Want to switch back?

[Return button]

[Security]
[Availability]
[Efficiency]
[Role Access]
```

Cards should become nearly full width with appropriate horizontal padding.

Header:

```text
LuxInfra                       ☰
```

or collapse Help/Admin into a compact menu.

---

# 16. Interaction Behavior

### Workspace card

Entire card can be clickable, but the button must remain the obvious primary action.

On hover:

* Slightly brighten card
* Move card up by approximately 2px
* Show subtle border glow

### Active Warehouse card

Maintain orange highlight.

### Button

Arrow should move slightly right on hover.

Use subtle transitions:

```css
transition: all 180ms ease;
```

Do not use large animations.

---

# 17. Important Visual Corrections From Current Page

The current page has several issues that must be corrected:

### Current issue 1 — Background

Current background feels:

* Too olive/brown
* Too dark without enough hierarchy

Change to:

> Deep navy/charcoal SaaS background with subtle orange decoration.

### Current issue 2 — Cards

Current cards look like basic rectangular panels.

Change to:

> Premium dark cards with rounded corners, subtle borders, consistent spacing and active-state emphasis.

### Current issue 3 — Active workspace

Warehouse Store should clearly look like the selected/primary workspace.

Use:

> Orange border + subtle orange glow + filled orange CTA.

### Current issue 4 — Branding

Make LuxInfra branding more prominent and polished.

### Current issue 5 — Typography

Increase hierarchy between:

* Brand
* Heading
* Subtitle
* Card title
* Description
* Buttons

### Current issue 6 — Bottom area

Make the return action and feature strip feel intentional rather than floating elements.

### Current issue 7 — Emoji icons

If the current implementation uses emojis such as:

```text
🏠
📦
🎓
```

replace them with consistent professional SVG/Lucide-style icons where possible.

This is important for a premium SaaS appearance.

---

# 18. Implementation Constraints

Do not rebuild the application's business logic.

Only redesign/restructure the UI unless a UI interaction requires a small frontend logic change.

Reuse:

* Existing routing
* Existing authentication
* Existing workspace selection logic
* Existing API calls
* Existing permissions
* Existing workspace names

Do not hardcode a fake workspace state if the application already has real workspace data.

The UI must remain fully functional.

---

# 19. Final Visual Target

The final page should communicate:

```text
Premium
Modern
Professional
Secure
Enterprise-ready
Simple
Fast
```

The visual priority should be:

```text
LuxInfra branding
        ↓
Welcome heading
        ↓
Workspace selection
        ↓
Warehouse highlighted as active
        ↓
Return/switch action
        ↓
Security/productivity feature strip
```

The page should look like a **real commercial SaaS product**, not a generic React template.

---

# 20. Acceptance Criteria

The implementation is complete only when:

* [ ] Full-screen dark navy background
* [ ] LuxInfra branding is prominent
* [ ] Welcome heading is centered
* [ ] Orange accent on "Infra"
* [ ] Subtitle is correctly positioned
* [ ] Three consistent workspace cards
* [ ] Warehouse Store is visually highlighted
* [ ] Professional SVG/Lucide icons
* [ ] Card heights are equal
* [ ] Buttons align consistently
* [ ] Active button is orange
* [ ] Return button is centered
* [ ] Four feature items appear at bottom
* [ ] Background decorative elements are subtle
* [ ] Desktop layout matches the specified hierarchy
* [ ] Tablet layout works
* [ ] Mobile layout works
* [ ] Existing workspace functionality still works
* [ ] No horizontal overflow
* [ ] No console errors
* [ ] No broken icons
* [ ] No text overlap
* [ ] No excessive animation
* [ ] No unnecessary UI elements

```

**Important:** Tell the agent to treat this as a **visual redesign specification** and inspect the existing code before implementation. The goal is to reproduce the **layout, hierarchy, spacing, colors, card treatment, active state, and responsive behavior** described above—not merely change the background color.
```
 add htisfeature  for the dahbaord page to navigate to  diff setvices 
Leave bug 2 its fixed move on next items in the  list  chek the md file i have  added few more taks  work on each task dont  spent  too mush time unecessary testing i will  do that u  jsut develo p do the coding 

once done alll the above task 
 create a new branch from frontend keep theoptimized version of the code industry level code use less numebr of files try to accomodate in less fiels 
 Dont stop for my approvals just do whats is best recommneded 

Do all the changes on the lux infra  frontend branch  as it was heppening previosuly  optimized branch i  will deploy later will chk alter 

 Here is major bug when ever side nav is open  the  right side of the  card items are  nto  coming in proper length that  are overlapping each other  wh ni close the hamburger  after clicking it the nthe form rows for 99%  cases is coming properly not overlapping  

 Rows per page is not  organized cprrectly it should in one line only 

 Through out the application staff attendence  should be common module  used in all the services  of this formate alreayd impl,ented in attendence section once project is added in  interior design service so  make it like  this 
  ⏱️ Attendance
Daily site attendance & wages
← Back
Punch for

Select worker…
in office punch in punch out
⏱ Remote Punch In
Remote Punch Out
📝 WFH / Leave Request
🚨 SOS
← Prev
15/08/2026
Today
Next →
＋ Add Worker
PRESENT
1
HALF-DAY
0
ABSENT
0
TOTAL HOURS
8 hr
TODAY WAGES
₹0
No workers added yet. Use "＋ Add Worker" to start tracking attendance.
Today's Punches (manual, remote & biometric)
Time	Worker	In/Out	Source	Geofence
09:36 AM	g	In	Remote	⚠ outside
WFH / Leave Requests
No requests yet.
🚨 Emergency Alerts
Unknown
06:21 PM
📍 View spot
Resolved
diag
ok
03:25 PM
📍 View spot
Resolved
ok
03:25 PM
📍 View spot
Resolve



update pricing model chek refrence of image and steps told
 pro 1500 business 2500 update the cards ui 
  what ever verssion selected same should come in top  bar in this ● Online row like if its free then all acroass all the three services 

 in the same row give serch icon with global search feature where anything in the application could be searched 
 


 i want project feature to be common across all the 2 service interior and warehouse  along with site map feature  it should come in project management section of warehouse eveything under one card 

 l
In Discussion
l
Set location
Edit Project
Contract Value

₹0

Received

₹0

Spent

₹5,467

Task Progress

36465%

Weather is unavailable because this project has no location set.

Set project location
Party
Site staff & vendors
Transaction
Payments in & out
Site
Daily progress logs
Task
Task management
Attendance
Daily attendance
Material
Material & stock
MOM
Meeting minutes
Design
Drawings & designs
Files
Folders & docs
Payroll
Salary computation
Daily Progress Reports
Add DPR
No daily progress reports yet.

 i am very ambitious about this project add a toggl button switch b/w simple view and advance view in standard view show current ui in advance view along with current view add charts kpis metrices multiple compare patameters etc for all the feature across the application