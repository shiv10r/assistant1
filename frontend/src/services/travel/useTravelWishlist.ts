import { useCallback, useState } from 'react'

const WISHLIST_KEY = 'luxinfra:travel:wishlist'

function readWishlist(): ReadonlySet<string> {
  const value = localStorage.getItem(WISHLIST_KEY)
  return new Set(value ? value.split(',').filter(Boolean) : [])
}

export function useTravelWishlist() {
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(readWishlist)

  const toggleSaved = useCallback((packageId: string) => {
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(packageId)) next.delete(packageId)
      else next.add(packageId)
      localStorage.setItem(WISHLIST_KEY, [...next].join(','))
      return next
    })
  }, [])

  return { savedIds, toggleSaved }
}
