import { useState } from 'react'
import { MEDICAL_NOTIFICATIONS } from './medicalData'

// VSR Health — client-side demo state. Clinical and billing records stay
// backend-authoritative in production; here we only persist UI state:
// read notifications and appointments the user books in this session.

const NOTIFICATIONS_READ_KEY = 'vsr-medical-notifications-read'
const BOOKED_APPOINTMENTS_KEY = 'vsr-medical-booked-appointments'

export type BookedAppointment = {
  readonly id: string
  readonly doctorId: string
  readonly patientName: string
  readonly date: string
  readonly time: string
  readonly type: 'In-clinic' | 'Video'
  readonly reason: string
  readonly status: 'Confirmed'
  readonly facility: string
}

function readReadNotifications(): readonly string[] {
  const raw = localStorage.getItem(NOTIFICATIONS_READ_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

function readBookedAppointments(): readonly BookedAppointment[] {
  const raw = localStorage.getItem(BOOKED_APPOINTMENTS_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is BookedAppointment => {
      if (typeof item !== 'object' || item === null) return false
      const candidate = item as Record<string, unknown>
      return typeof candidate.id === 'string' && typeof candidate.doctorId === 'string' && typeof candidate.patientName === 'string' && typeof candidate.date === 'string' && typeof candidate.time === 'string' && typeof candidate.status === 'string'
    })
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

export function useMedicalStore() {
  const [readNotifications, setReadNotifications] = useState<readonly string[]>(readReadNotifications)
  const [booked, setBooked] = useState<readonly BookedAppointment[]>(readBookedAppointments)

  function markNotificationRead(notificationId: string) {
    if (readNotifications.includes(notificationId)) return
    const next = [...readNotifications, notificationId]
    localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(next))
    setReadNotifications(next)
  }

  function markAllNotificationsRead(ids: readonly string[]) {
    const next = Array.from(new Set([...readNotifications, ...ids]))
    localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(next))
    setReadNotifications(next)
  }

  function bookAppointment(appointment: BookedAppointment) {
    const next = [appointment, ...booked]
    localStorage.setItem(BOOKED_APPOINTMENTS_KEY, JSON.stringify(next))
    setBooked(next)
  }

  return {
    isNotificationRead: (id: string) => readNotifications.includes(id),
    unreadCount: MEDICAL_NOTIFICATIONS.length - readNotifications.length,
    markNotificationRead,
    markAllNotificationsRead,
    bookedAppointments: booked,
    bookAppointment,
  }
}