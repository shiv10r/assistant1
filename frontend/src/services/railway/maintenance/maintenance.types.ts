import { railwayRequest } from '../api/railwayApi'

export type WorkOrderStatus =
  | 'Draft' | 'Triaged' | 'Approved' | 'Scheduled' | 'InProgress'
  | 'Blocked' | 'AwaitingVerification' | 'Completed' | 'Cancelled'

export type WorkOrder = {
  id: string
  sourceId: string
  sourceType: string
  status: WorkOrderStatus
  priority: string
  assignedTo?: string
  createdAt: string
  completedAt?: string
}

export type MaintenancePlan = {
  id: string
  name: string
  description: string
  recurrenceRule: string
  slaDays: number
  isEnabled: boolean
}

export const workOrderApi = {
  list: (status?: WorkOrderStatus) =>
    railwayRequest<WorkOrder[]>(`/api/railway/work-orders${status ? `?status=${status}` : ''}`),
  create: (sourceId: string, sourceType: string, priority: string) =>
    railwayRequest<{ id: string }>('/api/railway/work-orders', {
      method: 'POST',
      body: { sourceId, sourceType, priority },
      idempotencyKey: `wo-${Date.now()}`,
    }),
  approve: (orderId: string) =>
    railwayRequest<WorkOrder>(`/api/railway/work-orders/${orderId}/approve`, { method: 'PATCH' }),
  complete: (orderId: string, reason: string) =>
    railwayRequest<WorkOrder>(`/api/railway/work-orders/${orderId}/complete`, {
      method: 'PATCH',
      body: { reason },
    }),
}

export const maintenancePlanApi = {
  list: () => railwayRequest<MaintenancePlan[]>('/api/railway/maintenance/plans'),
  create: (name: string, description: string, slaDays: number) =>
    railwayRequest<{ id: string }>('/api/railway/maintenance/plans', {
      method: 'POST',
      body: { name, description, slaDays },
    }),
}