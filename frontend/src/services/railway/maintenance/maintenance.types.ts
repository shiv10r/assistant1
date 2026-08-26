import { railwayRequest } from '../api/railwayApi'

export type WorkOrderStatus = 'Draft' | 'Triaged' | 'Approved' | 'Scheduled' | 'InProgress' | 'Blocked' | 'AwaitingVerification' | 'Completed' | 'Cancelled'
export type WorkOrder = { id: string; divisionId: string; sourceId: string; sourceType: string; targetId: string; status: WorkOrderStatus; priority: string; safetyClassified: boolean; assignedTo?: string; createdAt: string; completedAt?: string; blockReason?: string; version: number; tasks: Array<{ id: string; description: string; isCompleted: boolean }> }
export type MaintenancePlan = { id: string; divisionId: string; targetId: string; name: string; recurrenceRule: string; slaDays: number; enabled: boolean; nextDueAt: string; version: number }
export type MaintenancePart = { id: string; divisionId: string; sku: string; name: string; unit: string; onHand: number; reserved: number; reorderLevel: number; version: number }

export const workOrderApi = {
  list: (status?: WorkOrderStatus) => railwayRequest<WorkOrder[]>(`/api/railway/work-orders${status ? `?status=${status}` : ''}`),
  create: (body: { divisionId: string; sourceId: string; sourceType: string; targetId: string; priority: string; safetyClassified: boolean }) => railwayRequest<WorkOrder>('/api/railway/work-orders', { method: 'POST', body, idempotencyKey: crypto.randomUUID() }),
  execute: (order: WorkOrder, action: string, body: Record<string, unknown> = {}) => railwayRequest<WorkOrder>(`/api/railway/work-orders/${order.id}/${action}`, { method: 'POST', body, expectedVersion: order.version }),
}
export const maintenancePlanApi = {
  list: () => railwayRequest<MaintenancePlan[]>('/api/railway/maintenance/plans'),
  create: (body: { divisionId: string; targetId: string; name: string; recurrenceRule: string; slaDays: number; nextDueAt: string }) => railwayRequest<MaintenancePlan>('/api/railway/maintenance/plans', { method: 'POST', body, idempotencyKey: crypto.randomUUID() }),
}
export const maintenanceInventoryApi = {
  parts: () => railwayRequest<MaintenancePart[]>('/api/railway/maintenance/inventory/parts'),
  createPart: (body: { divisionId: string; sku: string; name: string; unit: string; reorderLevel: number }) => railwayRequest<MaintenancePart>('/api/railway/maintenance/inventory/parts', { method: 'POST', body }),
  reserve: (body: { divisionId: string; partId: string; workOrderId: string; quantity: number }) => railwayRequest('/api/railway/maintenance/inventory/reservations', { method: 'POST', body }),
  procure: (body: { divisionId: string; partId: string; quantity: number }) => railwayRequest('/api/railway/maintenance/inventory/procurement', { method: 'POST', body }),
}
