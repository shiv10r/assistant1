import { useCallback, useEffect, useState } from 'react'

/** Generic localStorage-backed collection store for frontend-only modules that don't have a backend yet. */
export function useLocalCollection<T extends { id: string }>(key: string, seed: T[]) {
  const storageKey = `luxinfra:${key}`
  const [items, setItems] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T[]) : seed
    } catch {
      return seed
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      /* ignore quota errors */
    }
  }, [storageKey, items])

  const add = useCallback((item: T) => setItems((prev) => [item, ...prev]), [])
  const update = useCallback(
    (id: string, patch: Partial<T>) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it))),
    []
  )
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((it) => it.id !== id)), [])

  return { items, setItems, add, update, remove }
}

export function genId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
