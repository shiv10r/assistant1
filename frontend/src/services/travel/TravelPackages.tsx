import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { getPackages } from './travelApi'
import { TravelPackageCard } from './TravelPackageCard'
import TravelShell from './TravelShell'
import { useTravelWishlist } from './useTravelWishlist'
import type { TravelPackage } from './types'

export default function TravelPackages() {
  const initialQuery = new URLSearchParams(window.location.search).get('q') ?? ''
  const initialTheme = new URLSearchParams(window.location.search).get('theme') ?? 'all'
  const [query, setQuery] = useState(initialQuery)
  const [theme, setTheme] = useState(initialTheme)
  const [sort, setSort] = useState('recommended')
  const [packages, setPackages] = useState<TravelPackage[]>([])
  const { savedIds, toggleSaved } = useTravelWishlist()

  useEffect(() => {
    let active = true
    getPackages(initialQuery || undefined, initialTheme !== 'all' ? initialTheme : undefined, sort !== 'recommended' ? sort : undefined)
      .then((data) => {
        if (active) setPackages(data)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const list = packages.filter((item) => {
      const searchText = `${item.title} ${item.destination} ${item.route} ${item.theme}`.toLowerCase()
      return searchText.includes(query.toLowerCase()) && (theme === 'all' || item.theme === theme)
    })
    return [...list].sort((left, right) => {
      if (sort === 'price-low') return left.price - right.price
      if (sort === 'price-high') return right.price - left.price
      if (sort === 'rating') return right.rating - left.rating
      return right.travelers - left.travelers
    })
  }, [packages, query, sort, theme])

  return (
    <TravelShell>
      <div className="travel-main">
        <div className="travel-page-head"><h1>Holiday packages</h1><p>{filtered.length} curated trips with transparent inclusions and pricing.</p></div>
        <div className="travel-filters">
          <label><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destination or package..." /></label>
          <select value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Filter by theme"><option value="all">All themes</option><option value="Beach">Beach</option><option value="Culture">Culture</option><option value="Romantic">Romantic</option><option value="Family">Family</option><option value="Weekend">Weekend</option></select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort packages"><option value="recommended">Recommended</option><option value="price-low">Price low to high</option><option value="price-high">Price high to low</option><option value="rating">Highest rated</option></select>
        </div>
        {filtered.length > 0
          ? <div className="travel-cards">{filtered.map((item) => <TravelPackageCard key={item.id} packageItem={item} saved={savedIds.has(item.id)} onToggleSaved={toggleSaved} />)}</div>
          : <div className="travel-empty"><p className="font-semibold text-[var(--travel-ink)]">No trips match these filters</p><button type="button" onClick={() => { setQuery(''); setTheme('all') }}>Clear filters</button></div>}
      </div>
    </TravelShell>
  )
}