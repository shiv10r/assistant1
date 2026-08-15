import { useDeferredValue, useMemo, useState } from 'react'

type SearchText<T> = (item: T) => string

export function filterCollection<T>(
  items: readonly T[],
  query: string,
  searchText: SearchText<T>,
): T[] {
  const normalizedQuery = query.toLowerCase()
  return items.filter((item) => searchText(item).toLowerCase().includes(normalizedQuery))
}

export function useCollectionSearch<T>(items: readonly T[], searchText: SearchText<T>) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const filteredItems = useMemo(
    () => filterCollection(items, deferredQuery, searchText),
    [items, deferredQuery, searchText],
  )

  return { query, setQuery, filteredItems }
}
