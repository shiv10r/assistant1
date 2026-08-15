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

