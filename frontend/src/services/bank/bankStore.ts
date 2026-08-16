import { useState } from 'react'
import { bankCardById, bankFormatDateTime, BANK_NOTIFICATIONS } from './bankingData'

const UNREAD_BASE = BANK_NOTIFICATIONS.length

// VSR Bank — client-side demo state. Balances/limits stay backend-authoritative
// in production; here we only persist UI state: card status, read notifications,
// and a local transfer ledger used to render the confirmation receipt + history.

const CARD_STATUS_KEY = 'vsr-bank-card-status'
const NOTIFICATIONS_READ_KEY = 'vsr-bank-notifications-read'
const TRANSFER_HISTORY_KEY = 'vsr-bank-transfers'

export type BankTransferRecord = {
  readonly id: string
  readonly reference: string
  readonly fromAccountId: string
  readonly beneficiaryId: string
  readonly amount: number
  readonly purpose: string
  readonly status: 'Pending' | 'Processing' | 'Completed'
  readonly requestedAt: string
}

type CardStatusMap = Record<string, 'active' | 'frozen'>

function readCardStatus(): CardStatusMap {
  const raw = localStorage.getItem(CARD_STATUS_KEY)
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const map = parsed as Record<string, unknown>
    const result: CardStatusMap = {}
    for (const key of Object.keys(map)) {
      if (map[key] === 'active' || map[key] === 'frozen') result[key] = map[key]
    }
    return result
  } catch (error) {
    if (error instanceof SyntaxError) return {}
    throw error
  }
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

function readTransferHistory(): readonly BankTransferRecord[] {
  const raw = localStorage.getItem(TRANSFER_HISTORY_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is BankTransferRecord => {
      if (typeof item !== 'object' || item === null) return false
      const candidate = item as Record<string, unknown>
      return typeof candidate.id === 'string' && typeof candidate.reference === 'string' && typeof candidate.fromAccountId === 'string' && typeof candidate.beneficiaryId === 'string' && typeof candidate.amount === 'number' && typeof candidate.status === 'string'
    })
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

export function useBankStore() {
  const [cardStatus, setCardStatus] = useState<CardStatusMap>(readCardStatus)
  const [readNotifications, setReadNotifications] = useState<readonly string[]>(readReadNotifications)
  const [transfers, setTransfers] = useState<readonly BankTransferRecord[]>(readTransferHistory)

  /** Effective card status = persisted override (frozen/active) else fixture status. */
  function cardStatusOf(cardId: string): 'active' | 'frozen' | 'blocked' {
    const card = bankCardById(cardId)
    if (!card || card.status === 'blocked') return 'blocked'
    return cardStatus[cardId] ?? card.status
  }

  function freezeCard(cardId: string) {
    const next = { ...cardStatus, [cardId]: 'frozen' as const }
    localStorage.setItem(CARD_STATUS_KEY, JSON.stringify(next))
    setCardStatus(next)
  }

  function unfreezeCard(cardId: string) {
    const next = { ...cardStatus }
    delete next[cardId]
    localStorage.setItem(CARD_STATUS_KEY, JSON.stringify(next))
    setCardStatus(next)
  }

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

  function addTransfer(record: BankTransferRecord) {
    const next = [record, ...transfers]
    localStorage.setItem(TRANSFER_HISTORY_KEY, JSON.stringify(next))
    setTransfers(next)
  }

  function transferLabel(record: BankTransferRecord): string {
    return `${record.status} · ${bankFormatDateTime(record.requestedAt)}`
  }

  return {
    cardStatusOf,
    freezeCard,
    unfreezeCard,
    isNotificationRead: (id: string) => readNotifications.includes(id),
    unreadCount: UNREAD_BASE - readNotifications.length,
    markNotificationRead,
    markAllNotificationsRead,
    transfers,
    addTransfer,
    transferLabel,
  }
}