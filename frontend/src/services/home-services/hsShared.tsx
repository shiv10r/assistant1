import { useSyncExternalStore, type ReactNode } from 'react'
import { MdStar, MdStarHalf } from 'react-icons/md'
import type { BookingStatus } from './homeServicesData'
import { cn } from '../../lib/utils'

// ---------------------------------------------------------------------------
// Persona state — lives outside React so it survives route changes.
// ---------------------------------------------------------------------------

export type HsPersona = 'customer' | 'professional' | 'admin'

const PERSONA_KEY = 'vsr-hs-persona'

const personaListeners = new Set<() => void>()
let currentPersona: HsPersona = (() => {
  const stored = localStorage.getItem(PERSONA_KEY)
  return stored === 'professional' || stored === 'admin' ? stored : 'customer'
})()

function emitPersona() {
  personaListeners.forEach((listener) => listener())
}

export function getPersona(): HsPersona {
  return currentPersona
}

export function setPersona(persona: HsPersona) {
  currentPersona = persona
  localStorage.setItem(PERSONA_KEY, persona)
  emitPersona()
}

export function usePersona(): HsPersona {
  return useSyncExternalStore(
    (listener) => {
      personaListeners.add(listener)
      return () => personaListeners.delete(listener)
    },
    getPersona,
  )
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export function money(amount: number): string {
  return inr.format(amount)
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

// ---------------------------------------------------------------------------
// Shared UI atoms
// ---------------------------------------------------------------------------

export function HsStars({ rating, showValue = true }: { rating: number; showValue?: boolean }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.4
  return (
    <span className="hs-rating" aria-label={`${rating} star rating`}>
      {Array.from({ length: full }, (_, i) => <MdStar key={i} aria-hidden="true" />)}
      {half ? <MdStarHalf aria-hidden="true" /> : null}
      {showValue ? <span>{rating.toFixed(1)}</span> : null}
    </span>
  )
}

export function HsStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={cn('hs-status', `hs-status--${status}`)}>{status.replace(/([A-Z])/g, ' $1').trim()}</span>
}

export function HsPaymentBadge({ status }: { status: 'Pending' | 'Paid' | 'Refunded' | 'Failed' }) {
  return <span className={cn('hs-payment-badge', `hs-payment-badge--${status}`)}>{status}</span>
}

export function HsSection({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="hs-section-head">
      <h2>{title}</h2>
      {action}
    </div>
  )
}

export function HsEmpty({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="hs-empty">
      {icon}
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  )
}

export function HsLevelBadge({ level }: { level: 'Standard' | 'Silver' | 'Gold' | 'Elite' }) {
  return <span className={cn('hs-level', `hs-level--${level}`)}>{level}</span>
}

export function HsVerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="hs-verify-chip hs-verify-chip--verified">Verified</span>
  ) : (
    <span className="hs-verify-chip hs-verify-chip--pending">Pending</span>
  )
}

export function hsNumber(): string {
  return `VSR-${1000 + Math.floor(Math.random() * 900)}`
}