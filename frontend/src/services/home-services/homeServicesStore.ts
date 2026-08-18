import { useCallback, useMemo, useState } from 'react'
import {
  BOOKING_SEED, CITIES, COMMISSION_RULES, COUPONS, CUSTOMERS,
  EARNINGS_SEED, MEMBERSHIP_PLANS, NOTIFICATIONS, PAYOUTS_SEED, PROFESSIONALS,
  REVIEWS, SERVICES, SERVICE_CATEGORIES, SERVICE_ADDONS, SUPPORT_TICKETS, DISPUTES,
  buildAvailabilitySlots,
  type Booking, type BookingStatus, type Customer, type Professional,
  type ProfessionalEarning, type Review, type Payout, type SupportTicket, type Dispute,
  type AvailabilitySlot,
} from './homeServicesData'

// VSR Home Services — client-side demo state. In production the .NET backend is
// authoritative for pricing, availability, booking status, assignment, refunds,
// commission and payouts. This store simulates those server rules locally so the
// full marketplace workflow can be exercised end-to-end in the demo.

const BOOKINGS_KEY = 'vsr-hs-bookings'
const REVIEWS_KEY = 'vsr-hs-reviews'
const EARNINGS_KEY = 'vsr-hs-earnings'
const PAYOUTS_KEY = 'vsr-hs-payouts'
const NOTIF_READ_KEY = 'vsr-hs-notif-read'
const ASSIGNED_KEY = 'vsr-hs-assigned'
const VERIFIED_KEY = 'vsr-hs-verified'

export type QuoteLine = {
  label: string
  amount: number
}

export type Quote = {
  basePrice: number
  addOnTotal: number
  inspectionFee: number
  emergencyFee: number
  weekendFee: number
  platformFee: number
  subtotal: number
  discount: number
  couponLabel: string | null
  tax: number
  total: number
  lines: readonly QuoteLine[]
}

export const TAX_RATE = 0.18
export const PLATFORM_FEE_RATE = 0.05
export const EMERGENCY_FEE = 250
export const WEEKEND_FEE = 150

export type AssignedProfessional = {
  professionalId: string
  bookingId: string
  assignedAt: string
  accepted: boolean
  declined: boolean
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    return (parsed as T) ?? fallback
  } catch (error) {
    if (error instanceof SyntaxError) return fallback
    throw error
  }
}

function isWeekend(dateKey: string): boolean {
  const [y, m, d] = dateKey.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day === 0 || day === 6
}

export function todayKey(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

export function useHomeServicesStore() {
  const [bookings, setBookings] = useState<readonly Booking[]>(() => readJson(BOOKINGS_KEY, BOOKING_SEED))
  const [reviews, setReviews] = useState<readonly Review[]>(() => readJson(REVIEWS_KEY, REVIEWS))
  const [earnings, setEarnings] = useState<readonly ProfessionalEarning[]>(() => readJson(EARNINGS_KEY, EARNINGS_SEED))
  const [payouts, setPayouts] = useState<readonly Payout[]>(() => readJson(PAYOUTS_KEY, PAYOUTS_SEED))
  const [readNotifs, setReadNotifs] = useState<readonly string[]>(() => readJson(NOTIF_READ_KEY, [] as string[]))
  const [assigned, setAssigned] = useState<readonly AssignedProfessional[]>(() => readJson(ASSIGNED_KEY, [] as AssignedProfessional[]))
  const [verifiedIds, setVerifiedIds] = useState<readonly string[]>(() => readJson(VERIFIED_KEY, [] as string[]))

  const persist = useCallback((key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [])

  // -------------------------------------------------------------------------
  // Lookups
  // -------------------------------------------------------------------------

  const serviceById = useCallback((id: string) => SERVICES.find((s) => s.id === id) ?? null, [])
  const categoryById = useCallback((id: string) => SERVICE_CATEGORIES.find((c) => c.id === id) ?? null, [])
  const packageById = useCallback((id: string) => SERVICES.flatMap((s) => s.packages).find((p) => p.id === id) ?? null, [])
  const professionalById = useCallback((id: string) => PROFESSIONALS.find((p) => p.id === id) ?? null, [])
  const cityById = useCallback((id: string) => CITIES.find((c) => c.id === id) ?? null, [])
  const customerById = useCallback((id: string) => CUSTOMERS.find((c) => c.id === id) ?? null, [])
  const membershipById = useCallback((id: string | null) => (id ? MEMBERSHIP_PLANS.find((m) => m.id === id) ?? null : null), [])

  const couponByCode = useCallback((code: string) => COUPONS.find((c) => c.code.toLowerCase() === code.toLowerCase() && c.active) ?? null, [])

  // -------------------------------------------------------------------------
  // Quote engine (doc #119) — server-simulated, never computed in React UI
  // -------------------------------------------------------------------------

  function computeQuote(opts: {
    serviceId: string
    packageId: string
    addOnIds: readonly string[]
    cityId: string
    date: string
    emergency: boolean
    couponCode?: string | null
    membershipId?: string | null
  }): Quote {
    const service = serviceById(opts.serviceId)
    const pkg = packageById(opts.packageId)
    if (!service || !pkg) {
      throw new Error('Unknown service or package for quote')
    }
    const basePrice = pkg.basePrice
    const addOnTotal = opts.addOnIds.reduce((sum, id) => {
      const addOn = SERVICE_ADDONS.find((a) => a.id === id)
      return sum + (addOn?.price ?? 0)
    }, 0)
    const inspectionFee = service.needsInspection ? service.inspectionFee : 0
    const emergencyFee = opts.emergency && service.isEmergency ? EMERGENCY_FEE : 0
    const weekendFee = isWeekend(opts.date) ? WEEKEND_FEE : 0
    const subtotal = basePrice + addOnTotal + inspectionFee + emergencyFee + weekendFee
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE)

    // Coupon
    let discount = 0
    let couponLabel: string | null = null
    if (opts.couponCode) {
      const coupon = couponByCode(opts.couponCode)
      if (coupon && subtotal >= coupon.minOrder) {
        if (coupon.type === 'percent') {
          discount = Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount)
        } else {
          discount = Math.min(coupon.value, subtotal)
        }
        couponLabel = coupon.code
      }
    }

    // Membership discount
    const membership = membershipById(opts.membershipId ?? null)
    let membershipDiscount = 0
    if (membership) {
      membershipDiscount = Math.round((subtotal - discount) * (membership.serviceDiscountPct / 100))
    }

    const taxable = subtotal + platformFee - discount - membershipDiscount
    const tax = Math.round(taxable * TAX_RATE)
    const total = taxable + tax

    const lines: QuoteLine[] = [
      { label: `${service.name} — ${pkg.name}`, amount: basePrice },
      ...opts.addOnIds.map((id) => {
        const addOn = SERVICE_ADDONS.find((a) => a.id === id)
        return { label: addOn?.name ?? id, amount: addOn?.price ?? 0 }
      }),
    ]
    if (inspectionFee > 0) lines.push({ label: 'Inspection fee', amount: inspectionFee })
    if (emergencyFee > 0) lines.push({ label: 'Emergency service fee', amount: emergencyFee })
    if (weekendFee > 0) lines.push({ label: 'Weekend fee', amount: weekendFee })
    lines.push({ label: 'Platform fee', amount: platformFee })
    if (discount > 0) lines.push({ label: `Coupon ${couponLabel}`, amount: -discount })
    if (membershipDiscount > 0) lines.push({ label: `${membership?.name ?? 'Membership'} discount`, amount: -membershipDiscount })
    lines.push({ label: 'GST (18%)', amount: tax })

    return { basePrice, addOnTotal, inspectionFee, emergencyFee, weekendFee, platformFee, subtotal, discount, couponLabel, tax, total, lines }
  }

  // -------------------------------------------------------------------------
  // Slot availability (doc #58, #121) — serviceability + professional matching
  // -------------------------------------------------------------------------

  function professionalsForService(serviceId: string, cityId: string, localityId: string): readonly Professional[] {
    const service = serviceById(serviceId)
    if (!service) return []
    const locality = cityById(cityId)?.localities.find((l) => l.id === localityId)
    if (!locality) return []
    return PROFESSIONALS.filter(
      (p) =>
        p.cityId === cityId &&
        p.status === 'Active' &&
        p.skills.includes(serviceId) &&
        p.areas.includes(localityId),
    )
  }

  function availableSlotsFor(serviceId: string, cityId: string, localityId: string, date: string): AvailabilitySlot[] {
    const pros = professionalsForService(serviceId, cityId, localityId)
    const allSlots = pros.flatMap((p) => buildAvailabilitySlots(p.id, date, 1))
    // Mark slots already taken by overlapping bookings
    return allSlots.map((slot) => {
      const clash = bookings.some((b) => {
        if (b.assignedProfessionalId !== slot.professionalId) return false
        if (b.status === 'Cancelled' || b.status === 'Completed') return false
        const bStart = b.scheduledStart.slice(0, 16)
        const bEnd = b.expectedEnd.slice(0, 16)
        const slotStart = `${slot.date}T${slot.start}`
        const slotEnd = `${slot.date}T${slot.end}`
        return slotStart < bEnd && slotEnd > bStart
      })
      return clash ? { ...slot, status: 'Booked' as const } : slot
    })
  }

  function professionalsForSlot(serviceId: string, cityId: string, localityId: string, date: string, start: string): readonly Professional[] {
    const slots = availableSlotsFor(serviceId, cityId, localityId, date)
    return slots.filter((s) => s.start === start && s.status === 'Available').map((s) => professionalById(s.professionalId)).filter((p): p is Professional => p !== null)
  }

  // -------------------------------------------------------------------------
  // Booking creation + state machine (doc #117-#118, #123-#124)
  // -------------------------------------------------------------------------

  function createBooking(opts: {
    customer: Customer
    serviceId: string
    packageId: string
    addOnIds: readonly string[]
    cityId: string
    localityId: string
    addressLine: string
    scheduledStart: string
    quote: Quote
    paymentMethod: string
    customerNotes: string
    emergency: boolean
    couponCode?: string | null
  }): Booking {
    const now = new Date().toISOString()
    const end = new Date(new Date(opts.scheduledStart).getTime() + 60 * 60 * 1000).toISOString()
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      number: `VSR-${1000 + bookings.length + 1}`,
      customerId: opts.customer.id,
      customerName: opts.customer.name,
      serviceId: opts.serviceId,
      packageId: opts.packageId,
      addOnIds: opts.addOnIds,
      cityId: opts.cityId,
      localityId: opts.localityId,
      addressLine: opts.addressLine,
      scheduledStart: opts.scheduledStart,
      expectedEnd: end,
      status: 'New',
      assignedProfessionalId: null,
      originalQuote: opts.quote.total,
      currentQuote: opts.quote.total,
      paymentStatus: 'Paid',
      paymentMethod: opts.paymentMethod,
      customerNotes: opts.customerNotes,
      createdAt: now,
      updatedAt: now,
      history: [{ from: null, to: 'New', changedAt: now, changedBy: 'Customer' }],
      emergency: opts.emergency,
      checklist: [],
      beforePhotos: [],
      afterPhotos: [],
      serviceReport: null,
      additionalQuote: null,
      additionalQuoteStatus: 'None',
      reviewId: null,
      disputeId: null,
    }
    const next = [booking, ...bookings]
    persist(BOOKINGS_KEY, next)
    setBookings(next)
    // Immediately attempt assignment (doc #125: do not leave bookings unassigned)
    setTimeout(() => attemptAssignment(booking.id), 300)
    return booking
  }

  function transitionBooking(bookingId: string, to: BookingStatus, changedBy: string, reason?: string): readonly Booking[] {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return bookings
    const now = new Date().toISOString()
    const updated: Booking = {
      ...booking,
      status: to,
      updatedAt: now,
      history: [...booking.history, { from: booking.status, to, changedAt: now, changedBy, reason }],
    }
    const next = bookings.map((b) => (b.id === bookingId ? updated : b))
    persist(BOOKINGS_KEY, next)
    setBookings(next)
    return next
  }

  function attemptAssignment(bookingId: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.status !== 'New') return
    const slotStart = booking.scheduledStart.slice(11, 16)
    const candidates = professionalsForSlot(booking.serviceId, booking.cityId, booking.localityId, booking.scheduledStart.slice(0, 10), slotStart)
    const now = new Date().toISOString()
    if (candidates.length === 0) {
      transitionBooking(bookingId, 'SearchingProvider', 'System', 'No provider available for slot')
      return
    }
    // Pick the highest-rated eligible professional
    const pick = [...candidates].sort((a, b) => b.rating - a.rating)[0]
    const next = transitionBooking(bookingId, 'AwaitingProvider', 'System', 'Professional matched')
    setBookings(next.map((b) => (b.id === bookingId ? { ...b, assignedProfessionalId: pick.id } : b)))
    const nextAssigned: AssignedProfessional = { professionalId: pick.id, bookingId, assignedAt: now, accepted: false, declined: false }
    const all = [...assigned, nextAssigned]
    persist(ASSIGNED_KEY, all)
    setAssigned(all)
  }

  function professionalAccept(bookingId: string, professionalId: string): boolean {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.assignedProfessionalId !== professionalId || booking.status !== 'AwaitingProvider') return false
    const nextAssigned = assigned.map((a) => (a.bookingId === bookingId && a.professionalId === professionalId ? { ...a, accepted: true } : a))
    persist(ASSIGNED_KEY, nextAssigned)
    setAssigned(nextAssigned)
    setBookings(transitionBooking(bookingId, 'Upcoming', 'Professional', 'Job accepted'))
    return true
  }

  function professionalDecline(bookingId: string, professionalId: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.assignedProfessionalId !== professionalId || booking.status !== 'AwaitingProvider') return
    const nextAssigned = assigned.map((a) => (a.bookingId === bookingId && a.professionalId === professionalId ? { ...a, declined: true } : a))
    persist(ASSIGNED_KEY, nextAssigned)
    setAssigned(nextAssigned)
    // Reassign to next best
    const remaining = professionalsForSlot(booking.serviceId, booking.cityId, booking.localityId, booking.scheduledStart.slice(0, 10), booking.scheduledStart.slice(11, 16)).filter((p) => p.id !== professionalId)
    if (remaining.length === 0) {
      setBookings(transitionBooking(bookingId, 'SearchingProvider', 'System', 'Provider declined; searching alternatives'))
    } else {
      const pick = [...remaining].sort((a, b) => b.rating - a.rating)[0]
      const now = new Date().toISOString()
      const next = transitionBooking(bookingId, 'AwaitingProvider', 'System', 'Reassigned after decline')
      setBookings(next.map((b) => (b.id === bookingId ? { ...b, assignedProfessionalId: pick.id, history: [...b.history, { from: b.status, to: 'AwaitingProvider', changedAt: now, changedBy: 'System', reason: 'Reassigned to ' + pick.name }] } : b)))
      const entry: AssignedProfessional = { professionalId: pick.id, bookingId, assignedAt: now, accepted: false, declined: false }
      const all = [...nextAssigned, entry]
      persist(ASSIGNED_KEY, all)
      setAssigned(all)
    }
  }

  function professionalTransition(bookingId: string, professionalId: string, to: BookingStatus, reason?: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.assignedProfessionalId !== professionalId) return
    transitionBooking(bookingId, to, 'Professional', reason)
  }

  function requestAdditionalQuote(bookingId: string, professionalId: string, amount: number) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.assignedProfessionalId !== professionalId || booking.status !== 'InService') return
    const next = bookings.map((b) => (b.id === bookingId ? { ...b, additionalQuote: amount, additionalQuoteStatus: 'Requested' as const, status: 'WaitingCustomerApproval' as const, updatedAt: new Date().toISOString() } : b))
    persist(BOOKINGS_KEY, next)
    setBookings(next)
  }

  function approveAdditionalQuote(bookingId: string, customerId: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.customerId !== customerId || booking.additionalQuoteStatus !== 'Requested') return
    const next = bookings.map((b) => (b.id === bookingId ? { ...b, additionalQuoteStatus: 'Approved' as const, currentQuote: b.currentQuote + (b.additionalQuote ?? 0), status: 'InService' as const, updatedAt: new Date().toISOString(), history: [...b.history, { from: b.status, to: 'InService' as const, changedAt: new Date().toISOString(), changedBy: 'Customer', reason: 'Additional work approved' }] } : b))
    persist(BOOKINGS_KEY, next)
    setBookings(next)
  }

  function declineAdditionalQuote(bookingId: string, customerId: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.customerId !== customerId || booking.additionalQuoteStatus !== 'Requested') return
    const next = bookings.map((b) => (b.id === bookingId ? { ...b, additionalQuoteStatus: 'Declined' as const, status: 'InService' as const, updatedAt: new Date().toISOString(), history: [...b.history, { from: b.status, to: 'InService' as const, changedAt: new Date().toISOString(), changedBy: 'Customer', reason: 'Additional work declined' }] } : b))
    persist(BOOKINGS_KEY, next)
    setBookings(next)
  }

  function completeBooking(bookingId: string, professionalId: string, serviceReport: string, afterPhotos: readonly string[]) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.assignedProfessionalId !== professionalId) return
    const base = transitionBooking(bookingId, 'PaymentPending', 'Professional')
    setBookings(base.map((b) => (b.id === bookingId ? { ...b, serviceReport, afterPhotos, updatedAt: new Date().toISOString() } : b)))
    // After payment settles, complete + generate earning
    setTimeout(() => {
      const b2 = bookings.find((x) => x.id === bookingId)
      if (!b2 || b2.status !== 'PaymentPending') return
      const settled = transitionBooking(bookingId, 'Completed', 'System', 'Payment settled')
      const commissionRule = COMMISSION_RULES.find((r) => r.categoryId === serviceById(b2.serviceId)?.categoryId) ?? COMMISSION_RULES[0]
      const commissionPct = commissionRule.commissionPct
      const commissionAmount = Math.round((b2.currentQuote * commissionPct) / 100)
      const earning: ProfessionalEarning = {
        id: `ern-${Date.now()}`,
        professionalId,
        bookingId,
        bookingNumber: b2.number,
        grossAmount: b2.currentQuote,
        commissionPct,
        commissionAmount,
        earningAmount: b2.currentQuote - commissionAmount,
        status: 'Eligible',
        createdAt: new Date().toISOString(),
      }
      const nextEarnings = [earning, ...earnings]
      persist(EARNINGS_KEY, nextEarnings)
      setEarnings(nextEarnings)
      setBookings(settled)
    }, 400)
  }

  function cancelBooking(bookingId: string, customerId: string, reason: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking || booking.customerId !== customerId) return
    if (booking.status === 'Completed' || booking.status === 'Cancelled') return
    const cancelled = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' as const, currentQuote: 0, paymentStatus: 'Refunded' as const, updatedAt: new Date().toISOString(), history: [...b.history, { from: b.status, to: 'Cancelled' as const, changedAt: new Date().toISOString(), changedBy: 'Customer', reason }] } : b))
    persist(BOOKINGS_KEY, cancelled)
    setBookings(cancelled)
  }

  function adminReassign(bookingId: string, professionalId?: string) {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return
    let targetId = professionalId
    if (!targetId) {
      const candidates = professionalsForSlot(booking.serviceId, booking.cityId, booking.localityId, booking.scheduledStart.slice(0, 10), booking.scheduledStart.slice(11, 16))
      const best = [...candidates].sort((a, b) => b.rating - a.rating)[0]
      targetId = best?.id
    }
    if (!targetId) return
    const next = bookings.map((b) => (b.id === bookingId ? { ...b, assignedProfessionalId: targetId, status: 'AwaitingProvider' as const, updatedAt: new Date().toISOString(), history: [...b.history, { from: b.status, to: 'AwaitingProvider' as const, changedAt: new Date().toISOString(), changedBy: 'Admin', reason: `Manual reassignment to ${professionalById(targetId!)?.name ?? 'professional'}` }] } : b))
    persist(BOOKINGS_KEY, next)
    setBookings(next)
  }

  function adminUpdateStatus(bookingId: string, to: BookingStatus, note?: string) {
    setBookings(transitionBooking(bookingId, to, 'Admin', note))
  }

  // -------------------------------------------------------------------------
  // Reviews (doc #66, #140)
  // -------------------------------------------------------------------------

  function addReview(opts: {
    bookingId: string
    customer: Customer
    professionalId: string
    rating: number
    comment: string
  }): boolean {
    const booking = bookings.find((b) => b.id === opts.bookingId)
    if (!booking || booking.status !== 'Completed' || booking.reviewId) return false
    const review: Review = {
      id: `rev-${Date.now()}`,
      bookingId: opts.bookingId,
      customerId: opts.customer.id,
      customerName: opts.customer.name,
      professionalId: opts.professionalId,
      rating: opts.rating,
      comment: opts.comment,
      createdAt: new Date().toISOString(),
    }
    const next = [review, ...reviews]
    persist(REVIEWS_KEY, next)
    setReviews(next)
    setBookings(bookings.map((b) => (b.id === opts.bookingId ? { ...b, reviewId: review.id } : b)))
    return true
  }

  // -------------------------------------------------------------------------
  // Payouts (doc #94-#95)
  // -------------------------------------------------------------------------

  function requestPayout(professionalId: string, amount: number) {
    const payout: Payout = {
      id: `pout-${Date.now()}`,
      professionalId,
      amount,
      status: 'Pending',
      method: 'Bank Transfer',
      reference: '',
      createdAt: new Date().toISOString(),
      paidAt: null,
    }
    const next = [payout, ...payouts]
    persist(PAYOUTS_KEY, next)
    setPayouts(next)
  }

  function adminProcessPayout(payoutId: string, status: Payout['status'] = 'Paid', reference = '') {
    const next = payouts.map((p) => (p.id === payoutId ? { ...p, status, reference, paidAt: status === 'Paid' ? new Date().toISOString() : p.paidAt } : p))
    persist(PAYOUTS_KEY, next)
    setPayouts(next)
  }

  function verifyProfessional(professionalId: string) {
    if (verifiedIds.includes(professionalId)) return
    const next = [...verifiedIds, professionalId]
    persist(VERIFIED_KEY, next)
    setVerifiedIds(next)
  }

  // -------------------------------------------------------------------------
  // Support + disputes (doc #85-#87)
  // -------------------------------------------------------------------------

  function addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) {
    const t: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketNumber: `SUP-${2000 + SUPPORT_TICKETS.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return t
  }

  function openDispute(opts: {
    bookingId: string
    customer: Customer
    professionalId: string
    reason: string
  }) {
    const d: Dispute = {
      id: `dsp-${Date.now()}`,
      disputeNumber: `DSP-${3000 + DISPUTES.length + 1}`,
      bookingId: opts.bookingId,
      customerId: opts.customer.id,
      customerName: opts.customer.name,
      professionalId: opts.professionalId,
      reason: opts.reason,
      status: 'Open',
      resolution: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return d
  }

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------

  function markNotifRead(id: string) {
    if (readNotifs.includes(id)) return
    const next = [...readNotifs, id]
    persist(NOTIF_READ_KEY, next)
    setReadNotifs(next)
  }

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------

  const activeCustomer = useMemo(() => CUSTOMERS[0], [])

  const availableCategories = SERVICE_CATEGORIES
  const availableServices = SERVICES
  const allCoupons = COUPONS.filter((c) => c.active)

  const professionals = useMemo(
    () => PROFESSIONALS.map((p) => (verifiedIds.includes(p.id) ? { ...p, verified: true, status: 'Active' as const } : p)),
    [verifiedIds],
  )

  const notificationsFor = useCallback(
    (userId: string) =>
      NOTIFICATIONS.filter((n) => n.userId === userId).map((n) => ({ ...n, read: n.read || readNotifs.includes(n.id) })),
    [readNotifs],
  )

  const unreadCountFor = useCallback((userId: string) => notificationsFor(userId).filter((n) => !n.read).length, [notificationsFor])

  const bookingsForCustomer = useCallback((customerId: string) => bookings.filter((b) => b.customerId === customerId), [bookings])
  const bookingsForProfessional = useCallback((professionalId: string) => bookings.filter((b) => b.assignedProfessionalId === professionalId), [bookings])
  const earningsFor = useCallback((professionalId: string) => earnings.filter((e) => e.professionalId === professionalId), [earnings])
  const payoutsFor = useCallback((professionalId: string) => payouts.filter((p) => p.professionalId === professionalId), [payouts])
  const reviewsForProfessional = useCallback((professionalId: string) => reviews.filter((r) => r.professionalId === professionalId), [reviews])
  const reviewForBooking = useCallback((bookingId: string) => reviews.find((r) => r.bookingId === bookingId) ?? null, [reviews])

  const serviceAvailability = useCallback(
    (serviceId: string, cityId: string, localityId: string) => professionalsForService(serviceId, cityId, localityId).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings],
  )

  return {
    // lookups
    serviceById, categoryById, packageById, professionalById, cityById, customerById, membershipById, couponByCode,
    // quote + availability
    computeQuote, professionalsForService, availableSlotsFor, professionalsForSlot, serviceAvailability,
    // data
    bookings, reviews, earnings, payouts, assigned,
    activeCustomer, availableCategories, availableServices, allCoupons,
    professionals, customers: CUSTOMERS, disputes: DISPUTES, tickets: SUPPORT_TICKETS,
    notificationsFor, unreadCountFor, markNotifRead,
    // actions
    createBooking, transitionBooking, professionalAccept, professionalDecline, professionalTransition,
    requestAdditionalQuote, approveAdditionalQuote, declineAdditionalQuote, completeBooking,
    cancelBooking, adminReassign, adminUpdateStatus, addReview, requestPayout, adminProcessPayout,
    verifyProfessional, addSupportTicket, openDispute,
    // derived
    bookingsForCustomer, bookingsForProfessional, earningsFor, payoutsFor, reviewsForProfessional, reviewForBooking,
  }
}

export type HomeServicesStore = ReturnType<typeof useHomeServicesStore>