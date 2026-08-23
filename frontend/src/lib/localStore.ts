import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { api } from '../platform/api'

function readLocal<T>(storageKey: string, seed: T): T {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) as T : seed
  } catch {
    return seed
  }
}

export function usePersistedDocument<T>(key: string, seed: T): readonly [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `luxinfra:${key}`
  const [value, setValue] = useState<T>(() => readLocal(storageKey, seed))
  const [hydratedKey, setHydratedKey] = useState<string | null>(null)
  const changedLocally = useRef(false)
  const setPersistedValue: Dispatch<SetStateAction<T>> = useCallback((next) => {
    changedLocally.current = true
    setValue(next)
  }, [])

  useEffect(() => {
    changedLocally.current = false
    const separator = key.indexOf(':')
    if (separator < 1) {
      setHydratedKey(key)
      return
    }

    const controller = new AbortController()
    void api.moduleData.get<T>(key.slice(0, separator), key.slice(separator + 1), controller.signal)
      .then((remote) => {
        if (remote !== null && !changedLocally.current) setValue(remote)
        setHydratedKey(key)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [key])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // The backend remains authoritative when browser storage is unavailable.
    }

    if (hydratedKey !== key) return
    const separator = key.indexOf(':')
    if (separator < 1) return
    const timeout = window.setTimeout(() => {
      void api.moduleData.put(key.slice(0, separator), key.slice(separator + 1), value).catch(() => undefined)
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [hydratedKey, key, storageKey, value])

  return [value, setPersistedValue]
}

/** Backend-backed collection with local storage fallback for offline use. */
export function useLocalCollection<T extends { id: string }>(key: string, seed: T[]) {
  const [items, setItems] = usePersistedDocument<T[]>(key, seed)

  const add = useCallback((item: T) => setItems((prev) => [item, ...prev]), [setItems])
  const update = useCallback(
    (id: string, patch: Partial<T>) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it))),
    [setItems]
  )
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((it) => it.id !== id)), [setItems])

  return { items, setItems, add, update, remove }
}

export function genId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
