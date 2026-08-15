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
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={STATUS_TONE[status] ?? 'default'} size="sm" className={className}>
      {LABEL[status] ?? status}
    </Badge>
  )
}