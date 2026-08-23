import { useCallback } from 'react'
import { usePersistedDocument } from '../../lib/localStore'

const WISHLIST_KEY = 'luxinfra:travel:wishlist'

function readWishlist(): ReadonlySet<string> {
  const value = localStorage.getItem(WISHLIST_KEY)
  return new Set(value ? value.split(',').filter(Boolean) : [])
}

export function useTravelWishlist() {
  const [saved, setSaved] = usePersistedDocument<readonly string[]>('travel:wishlist', [...readWishlist()])
  const savedIds = new Set(saved)

  const toggleSaved = useCallback((packageId: string) => {
    setSaved((current) => {
      const next = current.includes(packageId) ? current.filter((id) => id !== packageId) : [...current, packageId]
      localStorage.setItem(WISHLIST_KEY, next.join(','))
      return next
    })
  }, [setSaved])

  return { savedIds, toggleSaved }
}
