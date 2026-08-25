import type { Notification } from './types'

export const NOTIFICATION_SEED: Notification[] = [
  { id: 'wfn-1', title: 'New stock alert', body: 'Low inventory on widget A.', type: 'warning', audience: 'all', important: false, read: false, date: '2026-08-07' },
]