export type RealtimeStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

export type RealtimeEventEnvelope<T = unknown> = {
  eventId: string
  eventType: string
  version: number
  occurredAt: string
  correlationId?: string
  tenantId?: string
  payload: T
}

export type BookingStatusChangedPayload = {
  bookingId: string
  status: string
  assignedProfessionalId?: string
  scheduledStart?: string
}
