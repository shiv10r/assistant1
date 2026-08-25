import { useSyncExternalStore } from 'react'
import { getStorageKey } from '../../lib/localStore'

const EVENT_NAME = 'vsr:notifications-changed'

function readUnreadCount(moduleKey: string): number {
  if (!moduleKey) return 0
  try {
    const value = JSON.parse(localStorage.getItem(getStorageKey(`${moduleKey}:notifications`)) ?? '[]')
    return Array.isArray(value) ? value.filter((item) => item?.read !== true).length : 0
  } catch {
    return 0
  }
}

export function notifyUnreadChanged(moduleKey: string) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: moduleKey }))
}

export function useNotificationUnreadCount(moduleKey: string): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      const onNotificationChange = (event: Event) => {
        if ((event as CustomEvent<string>).detail === moduleKey) onStoreChange()
      }
      const onStorage = (event: StorageEvent) => {
        if (event.key === getStorageKey(`${moduleKey}:notifications`)) onStoreChange()
      }
      window.addEventListener(EVENT_NAME, onNotificationChange)
      window.addEventListener('storage', onStorage)
      return () => {
        window.removeEventListener(EVENT_NAME, onNotificationChange)
        window.removeEventListener('storage', onStorage)
      }
    },
    () => readUnreadCount(moduleKey),
    () => 0,
  )
}
