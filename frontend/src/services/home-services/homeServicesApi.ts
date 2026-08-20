// VSR Home Services — typed API client for the .NET backend.
// Every call unwraps the ApiResponse<T> envelope and returns `data` on success;
// non-2xx responses and failed envelopes throw ApiError. The `/api` prefix is
// proxied to the backend by the Vite dev server (vite.config.ts).

import type {
  AvailabilitySlot,
  Booking,
  BookingStatus,
  City,
  CommissionRule,
  Dispute,
  HomeService,
  HomeServicePackage,
  Notification,
  Payout,
  Professional,
  ProfessionalEarning,
  ProfessionalStatus,
  Review,
  ServiceCategory,
  SupportTicket,
} from './homeServicesData'

// ---------------------------------------------------------------------------
// Envelope + error types
// ---------------------------------------------------------------------------

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string | null
  errors: string[]
  timestamp: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: readonly string[]

  constructor(message: string, errors: readonly string[] = [], status = 0) {
    super(message)
    this.name = 'ApiError'
    this.errors = errors
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// Request payload types
// ---------------------------------------------------------------------------

export type CreatePriceQuoteRequest = {
  serviceId: string
  packageId: string
  addOnIds: readonly string[]
  cityId: string
  localityId: string
  scheduledStart: string
  customerId: string
  couponCode?: string
  membershipId?: string
}

export type CreateBookingRequest = {
  serviceId: string
  packageId: string
  addOnIds: readonly string[]
  cityId: string
  localityId: string
  addressLine: string
  scheduledStart: string
  customerId: string
  customerName: string
  customerPhone: string
  notes?: string
  couponCode?: string
  membershipId?: string
  emergency?: boolean
}

export type UpdateBookingStatusRequest = {
  status: BookingStatus
  changedBy: string
  reason?: string
}

export type AssignProfessionalRequest = {
  professionalId?: string
}

export type CreatePaymentOrderRequest = {
  bookingId: string
  method: string
}

export type RefundRequest = {
  reason: string
  amount?: number
}

export type MarkPayoutPaidRequest = {
  reference?: string
}

export type CreateReviewRequest = {
  bookingId: string
  customerId: string
  professionalId: string
  rating: number
  comment: string
}

export type CreateTicketRequest = {
  customerId: string
  subject: string
  description: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
}

export type OpenDisputeRequest = {
  bookingId: string
  customerId: string
  reason: string
}

// ---------------------------------------------------------------------------
// Response DTO types
// ---------------------------------------------------------------------------

export type ServiceAddOn = {
  id: string
  name: string
  price: number
}

export type ServiceProblem = {
  id: string
  serviceId: string
  name: string
  description: string
}

export type Zone = {
  id: string
  cityId: string
  name: string
}

export type ServiceArea = {
  id: string
  cityId: string
  zoneId: string | null
  localityId: string | null
  name: string
  pincode: string | null
  serviceable: boolean
}

export type ServiceabilityResult = {
  serviceable: boolean
  cityId: string
  localityId: string | null
  serviceId: string | null
  reason: string | null
  estimatedProfessionals: number
}

export type AvailabilityResult = {
  serviceId: string
  cityId: string
  localityId: string
  date: string
  slots: readonly AvailabilitySlot[]
}

export type SearchResult = {
  query: string
  services: readonly HomeService[]
  categories: readonly ServiceCategory[]
  professionals: readonly Professional[]
}

export type PriceQuoteResult = {
  quoteId: string
  serviceId: string
  packageId: string
  basePrice: number
  addOnTotal: number
  platformFee: number
  discount: number
  membershipDiscount: number
  couponDiscount: number
  tax: number
  total: number
  validUntil: string
}

export type Payment = {
  id: string
  bookingId: string
  orderId: string
  method: string
  amount: number
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
  transactionId: string | null
  createdAt: string
}

export type PaymentInitiationResponse = {
  orderId: string
  bookingId: string
  amount: number
  method: string
  status: 'Pending' | 'Paid' | 'Failed'
  paymentUrl: string | null
  createdAt: string
}

export type WalletTransaction = {
  id: string
  customerId: string
  amount: number
  kind: 'credit' | 'debit'
  reason: string
  createdAt: string
}

export type WalletDto = {
  balance: number
  lifetimeCredited: number
  lifetimeDebited: number
  transactions: readonly WalletTransaction[]
}

export type Refund = {
  id: string
  bookingId: string
  bookingNumber: string
  customerId: string
  amount: number
  reason: string
  status: 'Pending' | 'Processed' | 'Rejected'
  processedAt: string | null
  createdAt: string
}

export type RefundResult = {
  refundId: string
  bookingId: string
  amount: number
  status: 'Pending' | 'Processed' | 'Rejected'
  processedAt: string | null
}

export type EarningsSummaryDto = {
  totalGross: number
  totalCommission: number
  totalEarnings: number
  paidEarnings: number
  pendingEarnings: number
  eligibleCount: number
  paidCount: number
}

export type PayoutStatusDto = {
  professionalId: string
  pendingAmount: number
  processingAmount: number
  paidAmount: number
  nextPayoutDate: string | null
  payouts: readonly Payout[]
}

export type InvoiceLineItem = {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export type InvoiceDto = {
  id: string
  bookingId: string
  invoiceNumber: string
  items: readonly InvoiceLineItem[]
  subtotal: number
  platformFee: number
  discount: number
  tax: number
  total: number
  status: 'Pending' | 'Paid' | 'Refunded'
  issuedAt: string
  paidAt: string | null
}

export type AnalyticsSummaryDto = {
  bookings_today: number
  revenue_today: number
  active_professionals: number
  pending_verifications: number
  open_tickets: number
  critical_disputes: number
  avg_rating_7d: number
  commission_revenue_mtd: number
}

export type TrendPoint = {
  date: string
  value: number
}

export type AnalyticsSeries = {
  label: string
  value: number
}

export type AssignmentSuccessDto = {
  assignedCount: number
  totalCount: number
  successRate: number
}

export type CustomerRepeatRateDto = {
  repeatCustomers: number
  totalCustomers: number
  repeatRate: number
}

export type ProviderPerformanceDto = {
  professionalId: string
  name: string
  jobsCompleted: number
  avgRating: number
  completionRate: number
}

export type RefundDisputeRateDto = {
  refundRate: number
  disputeRate: number
  refundedBookings: number
  disputedBookings: number
  totalBookings: number
}

export type DashboardSummaryDto = {
  totalBookings: number
  activeBookings: number
  totalRevenue: number
  totalCustomers: number
  activeProfessionals: number
  pendingVerifications: number
  openTickets: number
}

export type LiveBoardSlot = {
  slotId: string
  professionalId: string
  professionalName: string
  start: string
  end: string
  bookingId: string | null
}

export type LiveBoardDto = {
  activeBookings: number
  onTheWay: number
  inService: number
  pendingPayments: number
  slots: readonly LiveBoardSlot[]
}

// ---------------------------------------------------------------------------
// Transport helpers
// ---------------------------------------------------------------------------

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init)
  let envelope: ApiResponse<T> | null = null
  try {
    envelope = (await response.json()) as ApiResponse<T>
  } catch {
    envelope = null
  }
  if (!response.ok || envelope === null || !envelope.success) {
    throw new ApiError(
      envelope?.message ?? `Request failed with status ${response.status}`,
      envelope?.errors ?? [],
      response.status,
    )
  }
  if (envelope.data === null) {
    throw new ApiError('Server returned an empty response', [], response.status)
  }
  return envelope.data
}

function queryString(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value))
    }
  }
  const encoded = search.toString()
  return encoded === '' ? '' : `?${encoded}`
}

function jsonInit(body: unknown, method = 'POST'): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<ServiceCategory[]> {
  return request<ServiceCategory[]>('/home-services/categories')
}

export async function createCategory(data: {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
}): Promise<ServiceCategory> {
  return request<ServiceCategory>('/home-services/categories', jsonInit(data))
}

export async function getServices(): Promise<HomeService[]> {
  return request<HomeService[]>('/home-services/services')
}

export async function getServiceById(id: string): Promise<HomeService> {
  return request<HomeService>(`/home-services/services/${id}`)
}

export async function getPackages(): Promise<HomeServicePackage[]> {
  return request<HomeServicePackage[]>('/home-services/packages')
}

export async function getAddOns(): Promise<ServiceAddOn[]> {
  return request<ServiceAddOn[]>('/home-services/add-ons')
}

export async function getProblems(): Promise<ServiceProblem[]> {
  return request<ServiceProblem[]>('/home-services/problems')
}

// ---------------------------------------------------------------------------
// Areas
// ---------------------------------------------------------------------------

export async function getCities(): Promise<City[]> {
  return request<City[]>('/home-services/cities')
}

export async function getZones(cityId?: string): Promise<Zone[]> {
  return request<Zone[]>(`/home-services/zones${queryString({ cityId })}`)
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  return request<ServiceArea[]>('/home-services/service-areas')
}

export async function checkServiceability(cityId: string, localityId?: string, serviceId?: string, signal?: AbortSignal): Promise<ServiceabilityResult> {
  return request<ServiceabilityResult>(`/home-services/serviceability${queryString({ cityId, localityId, serviceId })}`, { signal })
}

export async function getAvailability(serviceId: string, cityId: string, localityId: string, date: string, signal?: AbortSignal): Promise<AvailabilityResult> {
  return request<AvailabilityResult>(`/home-services/availability${queryString({ serviceId, cityId, localityId, date })}`, { signal })
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchServices(q: string, categoryId?: string, cityId?: string, signal?: AbortSignal): Promise<SearchResult> {
  return request<SearchResult>(`/home-services/search${queryString({ q, categoryId, cityId })}`, { signal })
}

// ---------------------------------------------------------------------------
// Professionals
// ---------------------------------------------------------------------------

export async function getProfessionals(status?: ProfessionalStatus, signal?: AbortSignal): Promise<Professional[]> {
  return request<Professional[]>(`/home-services/professionals${queryString({ status })}`, { signal })
}

export async function getProfessionalById(id: string): Promise<Professional> {
  return request<Professional>(`/home-services/professionals/${id}`)
}

export async function getProfessionalEarnings(professionalId: string, signal?: AbortSignal): Promise<ProfessionalEarning[]> {
  return request<ProfessionalEarning[]>(`/home-services/professional/earnings${queryString({ professionalId })}`, { signal })
}

export async function getProfessionalEarningsSummary(professionalId: string, signal?: AbortSignal): Promise<EarningsSummaryDto> {
  return request<EarningsSummaryDto>(`/home-services/professional/earnings/summary${queryString({ professionalId })}`, { signal })
}

export async function getProfessionalPayouts(professionalId: string, signal?: AbortSignal): Promise<Payout[]> {
  return request<Payout[]>(`/home-services/professional/payouts${queryString({ professionalId })}`, { signal })
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function createPriceQuote(req: CreatePriceQuoteRequest): Promise<PriceQuoteResult> {
  return request<PriceQuoteResult>('/home-services/bookings/price-quotes', jsonInit(req))
}

export async function createBooking(req: CreateBookingRequest): Promise<Booking> {
  return request<Booking>('/home-services/bookings', jsonInit(req))
}

export async function getBookings(customerId?: string, signal?: AbortSignal): Promise<Booking[]> {
  return request<Booking[]>(`/home-services/bookings${queryString({ customerId })}`, { signal })
}

export async function getBookingById(id: string): Promise<Booking> {
  return request<Booking>(`/home-services/bookings/${id}`)
}

export async function updateBookingStatus(id: string, to: BookingStatus, changedBy: string, reason?: string): Promise<Booking> {
  const payload: UpdateBookingStatusRequest = { status: to, changedBy }
  if (reason !== undefined) payload.reason = reason
  return request<Booking>(`/home-services/bookings/${id}/status`, jsonInit(payload, 'PUT'))
}

export async function assignProfessional(bookingId: string, professionalId?: string): Promise<Booking> {
  const payload: AssignProfessionalRequest = {}
  if (professionalId !== undefined) payload.professionalId = professionalId
  return request<Booking>(`/home-services/bookings/${bookingId}/assignment`, jsonInit(payload))
}

export async function cancelBooking(id: string, customerId: string, reason: string): Promise<Booking> {
  return request<Booking>(`/home-services/bookings/${id}/cancel`, jsonInit({ customerId, reason }))
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function createPaymentOrder(bookingId: string, method: string): Promise<PaymentInitiationResponse> {
  return request<PaymentInitiationResponse>('/home-services/payments/create-order', jsonInit({ bookingId, method }))
}

export async function getPaymentsForBooking(bookingId: string, signal?: AbortSignal): Promise<Payment[]> {
  return request<Payment[]>(`/home-services/payments${queryString({ bookingId })}`, { signal })
}

export async function getWallet(customerId: string, signal?: AbortSignal): Promise<WalletDto> {
  return request<WalletDto>(`/home-services/customer/wallet${queryString({ customerId })}`, { signal })
}

export async function getRefunds(customerId?: string, signal?: AbortSignal): Promise<Refund[]> {
  return request<Refund[]>(`/home-services/customer/refunds${queryString({ customerId })}`, { signal })
}

export async function requestRefund(bookingId: string, reason: string, amount?: number): Promise<RefundResult> {
  const payload: RefundRequest = { reason }
  if (amount !== undefined) payload.amount = amount
  return request<RefundResult>(`/home-services/customer/refunds/${bookingId}`, jsonInit(payload))
}

// ---------------------------------------------------------------------------
// Earnings / payouts / commissions
// ---------------------------------------------------------------------------

export async function markPayoutPaid(id: string, reference?: string): Promise<Payout> {
  const payload: MarkPayoutPaidRequest = {}
  if (reference !== undefined) payload.reference = reference
  return request<Payout>(`/home-services/admin/finance/payouts/${id}/mark-paid`, jsonInit(payload))
}

export async function getPayoutStatus(professionalId: string, signal?: AbortSignal): Promise<PayoutStatusDto> {
  return request<PayoutStatusDto>(`/home-services/professional/payouts/status${queryString({ professionalId })}`, { signal })
}

export async function getCommissionRules(): Promise<CommissionRule[]> {
  return request<CommissionRule[]>('/home-services/admin/finance/commissions')
}

// ---------------------------------------------------------------------------
// Analytics — all server-aggregated, never client-computed
// ---------------------------------------------------------------------------

export async function getAnalyticsSummary(signal?: AbortSignal): Promise<AnalyticsSummaryDto> {
  return request<AnalyticsSummaryDto>('/home-services/admin/analytics/summary', { signal })
}

export async function getBookingsTrend(period?: string, signal?: AbortSignal): Promise<TrendPoint[]> {
  return request<TrendPoint[]>(`/home-services/admin/analytics/bookings-trend${queryString({ period })}`, { signal })
}

export async function getRevenueTrend(period?: string, signal?: AbortSignal): Promise<TrendPoint[]> {
  return request<TrendPoint[]>(`/home-services/admin/analytics/revenue-trend${queryString({ period })}`, { signal })
}

export async function getTopCategories(signal?: AbortSignal): Promise<AnalyticsSeries[]> {
  return request<AnalyticsSeries[]>('/home-services/admin/analytics/top-categories', { signal })
}

export async function getTopServices(signal?: AbortSignal): Promise<AnalyticsSeries[]> {
  return request<AnalyticsSeries[]>('/home-services/admin/analytics/top-services', { signal })
}

export async function getTopCities(signal?: AbortSignal): Promise<AnalyticsSeries[]> {
  return request<AnalyticsSeries[]>('/home-services/admin/analytics/top-cities', { signal })
}

export async function getAssignmentSuccess(signal?: AbortSignal): Promise<AssignmentSuccessDto> {
  return request<AssignmentSuccessDto>('/home-services/admin/analytics/assignment-success', { signal })
}

export async function getCancellationReasons(signal?: AbortSignal): Promise<AnalyticsSeries[]> {
  return request<AnalyticsSeries[]>('/home-services/admin/analytics/cancellation-reasons', { signal })
}

export async function getCustomerRepeatRate(signal?: AbortSignal): Promise<CustomerRepeatRateDto> {
  return request<CustomerRepeatRateDto>('/home-services/admin/analytics/customer-repeat-rate', { signal })
}

export async function getProviderPerformance(signal?: AbortSignal): Promise<ProviderPerformanceDto[]> {
  return request<ProviderPerformanceDto[]>('/home-services/admin/analytics/provider-performance', { signal })
}

export async function getRefundDisputeRate(signal?: AbortSignal): Promise<RefundDisputeRateDto> {
  return request<RefundDisputeRateDto>('/home-services/admin/analytics/refund-dispute-rate', { signal })
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function getReviews(professionalId?: string, signal?: AbortSignal): Promise<Review[]> {
  return request<Review[]>(`/home-services/reviews${queryString({ professionalId })}`, { signal })
}

export async function createReview(req: CreateReviewRequest): Promise<Review> {
  return request<Review>('/home-services/reviews', jsonInit(req))
}

// ---------------------------------------------------------------------------
// Support
// ---------------------------------------------------------------------------

export async function getTickets(customerId?: string, signal?: AbortSignal): Promise<SupportTicket[]> {
  return request<SupportTicket[]>(`/home-services/support${queryString({ customerId })}`, { signal })
}

export async function createTicket(req: CreateTicketRequest): Promise<SupportTicket> {
  return request<SupportTicket>('/home-services/support', jsonInit(req))
}

export async function getDisputes(): Promise<Dispute[]> {
  return request<Dispute[]>('/home-services/disputes')
}

export async function openDispute(req: OpenDisputeRequest): Promise<Dispute> {
  return request<Dispute>('/home-services/disputes', jsonInit(req))
}

export async function getNotifications(userId: string, signal?: AbortSignal): Promise<Notification[]> {
  return request<Notification[]>(`/home-services/notifications${queryString({ userId })}`, { signal })
}

// ---------------------------------------------------------------------------
// Grouped API surface
// ---------------------------------------------------------------------------

export const homeServicesApi = {
  getCategories,
  createCategory,
  getServices,
  getServiceById,
  getPackages,
  getAddOns,
  getProblems,
  getCities,
  getZones,
  getServiceAreas,
  checkServiceability,
  getAvailability,
  searchServices,
  getProfessionals,
  getProfessionalById,
  getProfessionalEarnings,
  getProfessionalEarningsSummary,
  getProfessionalPayouts,
  createPriceQuote,
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  assignProfessional,
  cancelBooking,
  createPaymentOrder,
  getPaymentsForBooking,
  getWallet,
  getRefunds,
  requestRefund,
  markPayoutPaid,
  getPayoutStatus,
  getCommissionRules,
  getAnalyticsSummary,
  getBookingsTrend,
  getRevenueTrend,
  getTopCategories,
  getTopServices,
  getTopCities,
  getAssignmentSuccess,
  getCancellationReasons,
  getCustomerRepeatRate,
  getProviderPerformance,
  getRefundDisputeRate,
  getReviews,
  createReview,
  getTickets,
  createTicket,
  getDisputes,
  openDispute,
  getNotifications,
}