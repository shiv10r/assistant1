import { useMemo, useState, useCallback } from 'react'
import { useLocalCollection } from './localStore'

export type ServiceListConfig<T> = {
  storageKey: string
  seedData: readonly T[]
  searchKeys: (keyof T)[]
  filterKey?: keyof T
  filterOptions?: readonly string[]
  sortKey?: keyof T
  sortDirection?: 'asc' | 'desc'
}

export type ServiceListReturn<T> = {
  items: T[]
  filteredItems: T[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterValue: string | 'all'
  setFilterValue: (value: string | 'all') => void
  sortConfig: { key: keyof T | null; direction: 'asc' | 'desc' }
  setSortConfig: (key: keyof T) => void
  updateItem: (id: string, updates: Partial<T>) => void
  addItem: (item: T) => void
  deleteItem: (id: string) => void
}

export function useServiceList<T extends { id: string }>(
  config: ServiceListConfig<T>
): ServiceListReturn<T> {
  const { items, update, add, remove } = useLocalCollection<T>(
    config.storageKey,
    [...config.seedData] as T[]
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [filterValue, setFilterValue] = useState<string | 'all'>('all')
  const [sortConfig, setSortConfigState] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({
    key: config.sortKey ?? null,
    direction: config.sortDirection ?? 'asc'
  })

  const filteredItems = useMemo(() => {
    let result = items

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) =>
        config.searchKeys.some((key) =>
          String(item[key]).toLowerCase().includes(query)
        )
      )
    }

    if (filterValue !== 'all' && config.filterKey) {
      result = result.filter((item) => String(item[config.filterKey!]) === filterValue)
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key!]
        const bVal = b[sortConfig.key!]
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [items, searchQuery, filterValue, sortConfig, config.searchKeys, config.filterKey])

  const setSortConfig = useCallback((key: keyof T) => {
    setSortConfigState((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  return {
    items,
    filteredItems,
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    sortConfig,
    setSortConfig,
    updateItem: update,
    addItem: add,
    deleteItem: remove
  }
}

export type ServiceStats = {
  total: number
  byFilter?: Record<string, number>
}

export function useServiceStats<T extends { id: string }>(
  items: readonly T[],
  filterKey?: keyof T,
  filterOptions?: readonly string[]
): ServiceStats {
  const stats = useMemo(() => {
    const total = items.length
    const byFilter: Record<string, number> = {}

    if (filterKey && filterOptions) {
      filterOptions.forEach((option) => {
        byFilter[option] = items.filter((item) => String(item[filterKey as keyof T]) === option).length
      })
    }

    return { total, byFilter }
  }, [items, filterKey, filterOptions])

  return stats
}