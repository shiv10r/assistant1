import { Badge } from '../../../components/ui'

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'default'> = {
  // inventory
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
  // active/inactive
  active: 'success',
  inactive: 'outline',
  // PO workflow
  draft: 'outline',
  submitted: 'info',
  approved: 'info',
  partial: 'warning',
  received: 'success',
  closed: 'default',
  cancelled: 'danger',
  // GRN
  completed: 'success',
  // Sales order workflow
  created: 'outline',
  confirmed: 'info',
  reserved: 'info',
  picking: 'warning',
  picked: 'success',
  // Packing
  packing: 'warning',
  packed: 'success',
  // Dispatch
  ready: 'info',
  dispatched: 'warning',
  // Transfers
  // (created/dispatched/received/completed already mapped above)
  // Returns
  requested: 'warning',
  inspected: 'info',
  // Stock count
  open: 'warning',
  // misc
  pending: 'warning',
  damaged: 'danger',
  quarantine: 'danger',
  available: 'success',
}

const LABEL: Record<string, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  submitted: 'Submitted',
  approved: 'Approved',
  partial: 'Partially received',
  received: 'Received',
  closed: 'Closed',
  cancelled: 'Cancelled',
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
  completed: 'Completed',
  pending: 'Pending',
  damaged: 'Damaged',
  quarantine: 'Quarantine',
  available: 'Available',
  created: 'Created',
  confirmed: 'Confirmed',
  reserved: 'Reserved',
  picking: 'Picking',
  picked: 'Picked',
  packing: 'Packing',
  packed: 'Packed',
  ready: 'Ready',
  dispatched: 'Dispatched',
  requested: 'Requested',
  inspected: 'Inspected',
  open: 'Open',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={STATUS_TONE[status] ?? 'default'} size="sm" className={className}>
      {LABEL[status] ?? status}
    </Badge>
  )
}