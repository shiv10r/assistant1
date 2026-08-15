import type { InventoryItem, Supplier, PurchaseOrder, GrnRecord, StaffMember, ProjectRecord, Warehouse, LocationBin, Customer, StockTransfer, SalesOrder, PickList, Package, Dispatch, ReturnRecord, StockCount } from './types'

export const WAREHOUSE_SEED: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Gurgaon Warehouse',
    code: 'WH-GGN',
    address: 'Plot 14, Sector 8, IMT Manesar, Gurgaon',
    contactPerson: 'Ramesh Iyer',
    phone: '+91 98765 43210',
    status: 'active',
  },
  {
    id: 'wh-2',
    name: 'Delhi Warehouse',
    code: 'WH-DEL',
    address: 'B-22, Okhla Phase II, New Delhi',
    contactPerson: 'Anita Rao',
    phone: '+91 91234 56789',
    status: 'active',
  },
]

export const LOCATION_SEED: LocationBin[] = [
  { id: 'loc-1', warehouseId: 'wh-1', code: 'A01-01', zone: 'A', rack: '01', bin: '01', capacity: 500, status: 'active' },
  { id: 'loc-2', warehouseId: 'wh-1', code: 'A01-02', zone: 'A', rack: '01', bin: '02', capacity: 500, status: 'active' },
  { id: 'loc-3', warehouseId: 'wh-1', code: 'A02-01', zone: 'A', rack: '02', bin: '01', capacity: 300, status: 'active' },
  { id: 'loc-4', warehouseId: 'wh-2', code: 'B01-01', zone: 'B', rack: '01', bin: '01', capacity: 400, status: 'active' },
  { id: 'loc-5', warehouseId: 'wh-2', code: 'B02-02', zone: 'B', rack: '02', bin: '02', capacity: 250, status: 'active' },
]

export const INVENTORY_SEED: InventoryItem[] = [
  {
    id: 'item-1', sku: 'SKU-1001', name: 'Cement Bag (50kg)', category: 'Construction', brand: 'UltraTech',
    description: 'OPC 53 grade cement, 50kg bag', unit: 'bag', qty: 240, reserved: 20, damaged: 5, quarantine: 0, inTransit: 100,
    reorderLevel: 50, minStock: 40, maxStock: 600, unitPrice: 380, sellingPrice: 410, hsn: '2523', gstPct: 28,
    location: 'A01-01', warehouseId: 'wh-1', isActive: true, trackBatch: false, trackSerial: false, trackExpiry: false,
  },
  {
    id: 'item-2', sku: 'SKU-1002', name: 'Steel Rod (12mm)', category: 'Construction', brand: 'Tata Tiscon',
    description: 'TMT steel rod 12mm, 12m length', unit: 'pcs', qty: 18, reserved: 5, damaged: 2, quarantine: 0, inTransit: 0,
    reorderLevel: 25, minStock: 20, maxStock: 300, unitPrice: 620, sellingPrice: 680, hsn: '7214', gstPct: 18,
    location: 'A01-02', warehouseId: 'wh-1', isActive: true, trackBatch: false, trackSerial: false, trackExpiry: false,
  },
  {
    id: 'item-3', sku: 'SKU-1003', name: 'PVC Pipe 4"', category: 'Plumbing', brand: 'Astral',
    description: 'PVC pressure pipe 4 inch, 3m length', unit: 'pcs', qty: 90, reserved: 0, damaged: 0, quarantine: 0, inTransit: 40,
    reorderLevel: 30, minStock: 20, maxStock: 400, unitPrice: 145, sellingPrice: 175, hsn: '3917', gstPct: 18,
    location: 'A02-01', warehouseId: 'wh-1', isActive: true, trackBatch: false, trackSerial: false, trackExpiry: false,
  },
  {
    id: 'item-4', sku: 'SKU-1004', name: 'Paint Emulsion (20L)', category: 'Finishing', brand: 'Asian Paints',
    description: 'Interior emulsion paint 20L white', unit: 'can', qty: 0, reserved: 0, damaged: 0, quarantine: 0, inTransit: 0,
    reorderLevel: 10, minStock: 8, maxStock: 100, unitPrice: 3200, sellingPrice: 3500, hsn: '3208', gstPct: 18,
    location: 'B01-01', warehouseId: 'wh-2', isActive: true, trackBatch: true, trackSerial: false, trackExpiry: true,
  },
  {
    id: 'item-5', sku: 'SKU-1005', name: 'Copper Wire 2.5sqmm', category: 'Electrical', brand: 'Polycab',
    description: 'FR copper wire 2.5 sq mm, 90m coil', unit: 'coil', qty: 35, reserved: 10, damaged: 0, quarantine: 0, inTransit: 0,
    reorderLevel: 20, minStock: 15, maxStock: 200, unitPrice: 1850, sellingPrice: 2100, hsn: '8544', gstPct: 18,
    location: 'B02-02', warehouseId: 'wh-2', isActive: true, trackBatch: false, trackSerial: false, trackExpiry: false,
  },
  {
    id: 'item-6', sku: 'SKU-1006', name: 'Ceramic Tiles (600x600)', category: 'Finishing', brand: 'Kajaria',
    description: 'Vitrified floor tiles 600x600mm, box of 4', unit: 'box', qty: 12, reserved: 2, damaged: 1, quarantine: 0, inTransit: 60,
    reorderLevel: 15, minStock: 10, maxStock: 150, unitPrice: 950, sellingPrice: 1150, hsn: '6907', gstPct: 18,
    location: 'B01-01', warehouseId: 'wh-2', isActive: true, trackBatch: true, trackSerial: false, trackExpiry: false,
  },
]

export const SUPPLIER_SEED: Supplier[] = [
  {
    id: 'sup-1', name: 'BuildMart Traders', company: 'BuildMart Traders Pvt Ltd', contact: 'Ramesh Iyer',
    phone: '+91 98765 43210', email: 'sales@buildmart.in', gstin: '27ABCDE1234F1Z5',
    address: 'Plot 9, Udyog Vihar, Gurgaon', paymentTerms: 'Net 30', status: 'active',
  },
  {
    id: 'sup-2', name: 'SteelCore Supplies', company: 'SteelCore Supplies LLP', contact: 'Anita Rao',
    phone: '+91 91234 56789', email: 'contact@steelcore.in', gstin: '29XYZAB5678G2Z1',
    address: 'Sector 6, Okhla Phase II, New Delhi', paymentTerms: 'Advance + Net 15', status: 'active',
  },
  {
    id: 'sup-3', name: 'Polycab Distribution', company: 'Polycab Wires Pvt Ltd', contact: 'Suresh Menon',
    phone: '+91 99887 76655', email: 'orders@polycab.in', gstin: '27MNOQR9012H3Z8',
    address: 'Bawana Industrial Area, Delhi', paymentTerms: 'Net 45', status: 'active',
  },
]

export const PO_SEED: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-1',
    supplierName: 'BuildMart Traders',
    date: '2026-08-01',
    expectedDelivery: '2026-08-10',
    warehouseId: 'wh-1',
    status: 'approved',
    lines: [{ itemId: 'item-1', itemName: 'Cement Bag (50kg)', qty: 100, unitPrice: 380 }],
    total: 38000,
    notes: 'Site priority order',
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-002',
    supplierId: 'sup-3',
    supplierName: 'Polycab Distribution',
    date: '2026-08-05',
    expectedDelivery: '2026-08-15',
    warehouseId: 'wh-2',
    status: 'submitted',
    lines: [
      { itemId: 'item-5', itemName: 'Copper Wire 2.5sqmm', qty: 30, unitPrice: 1850 },
      { itemId: 'item-3', itemName: 'PVC Pipe 4"', qty: 50, unitPrice: 145 },
    ],
    total: 62750,
    notes: '',
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-003',
    supplierId: 'sup-2',
    supplierName: 'SteelCore Supplies',
    date: '2026-07-20',
    expectedDelivery: '2026-07-28',
    warehouseId: 'wh-1',
    status: 'received',
    lines: [{ itemId: 'item-2', itemName: 'Steel Rod (12mm)', qty: 50, unitPrice: 620 }],
    total: 31000,
    notes: 'Fully received',
  },
]

export const GRN_SEED: GrnRecord[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-001',
    poId: 'po-3',
    poNumber: 'PO-2026-003',
    date: '2026-07-28',
    lines: [
      {
        itemId: 'item-2', itemName: 'Steel Rod (12mm)', orderedQty: 50, receivedQty: 50,
        damagedQty: 0, rejectedQty: 0, acceptedQty: 50,
        putaway: [{ location: 'A01-02', qty: 50 }],
      },
    ],
    notes: 'All good',
  },
]

export const CUSTOMER_SEED: Customer[] = [
  { id: 'cust-1', name: 'Urban Developers', company: 'Urban Developers Pvt Ltd', gstin: '27PQRST4567K1Z9', phone: '+91 98111 22334', email: 'procurement@urbandev.in', billingAddress: '12 MG Road, Gurgaon', shippingAddress: 'Site-7, Sector 65, Gurgaon', status: 'active' },
  { id: 'cust-2', name: 'Nirmal Interiors', company: 'Nirmal Interiors LLP', gstin: '29LMNOP8901L2Z3', phone: '+91 98222 33445', email: 'orders@nirmalinteriors.in', billingAddress: '4A Lajpat Nagar, New Delhi', shippingAddress: '4A Lajpat Nagar, New Delhi', status: 'active' },
  { id: 'cust-3', name: 'GreenBuild Projects', company: 'GreenBuild Projects Ltd', gstin: '27ABCDE1212M4Z5', phone: '+91 98333 44556', email: 'buy@greenbuild.in', billingAddress: '55 Cyber City, Gurgaon', shippingAddress: 'Plot 3, Manesar, Gurgaon', status: 'inactive' },
]

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

export const STAFF_SEED: StaffMember[] = [
  { id: 'staff-1', name: 'Vikram Singh', role: 'Warehouse Supervisor', phone: '+91 98765 12340', status: 'active' },
  { id: 'staff-2', name: 'Priya Nair', role: 'Inventory Clerk', phone: '+91 98765 56780', status: 'active' },
]

export const PROJECT_SEED: ProjectRecord[] = [
  { id: 'wproj-1', name: 'Warehouse Expansion - Bay 3', client: 'Internal', status: 'active', startDate: '2026-07-01', budget: 850000, address: 'Plot 14, Sector 8, IMT Manesar, Gurgaon', latitude: 28.4139, longitude: 76.9829 },
]