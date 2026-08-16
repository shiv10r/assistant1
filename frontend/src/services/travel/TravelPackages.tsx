import { useMemo, useState } from 'react'
import { Compass, Search } from 'lucide-react'
import { Input, PageHead, Select } from '../../components/ui'
import { PACKAGE_SEED } from './seed'
import { TravelPackageCard } from './TravelPackageCard'
import { useTravelWishlist } from './useTravelWishlist'

export default function TravelPackages() {
  const initialQuery = new URLSearchParams(window.location.search).get('q') ?? ''
  const initialTheme = new URLSearchParams(window.location.search).get('theme') ?? 'all'
  const [query, setQuery] = useState(initialQuery)
  const [theme, setTheme] = useState(initialTheme)
  const [sort, setSort] = useState('recommended')
  const { savedIds, toggleSaved } = useTravelWishlist()
  const packages = useMemo(() => {
    const filtered = PACKAGE_SEED.filter((item) => {
      const searchText = `${item.title} ${item.destination} ${item.route} ${item.theme}`.toLowerCase()
      return searchText.includes(query.toLowerCase()) && (theme === 'all' || item.theme === theme)
    })
    return [...filtered].sort((left, right) => {
      if (sort === 'price-low') return left.price - right.price
      if (sort === 'price-high') return right.price - left.price
      if (sort === 'rating') return right.rating - left.rating
      return right.travelers - left.travelers
    })
  }, [query, sort, theme])

  return (
    <div className="space-y-6">
      <PageHead icon={<Compass className="h-6 w-6" />} title="Holiday packages" sub={`${packages.length} curated trips with transparent inclusions and pricing.`} />
      <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[1fr_190px_190px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destination or package..." className="pl-9" /></div>
        <Select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="all">All themes</option><option value="Beach">Beach</option><option value="Culture">Culture</option><option value="Romantic">Romantic</option><option value="Family">Family</option><option value="Weekend">Weekend</option></Select>
        <Select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price low to high</option><option value="price-high">Price high to low</option><option value="rating">Highest rated</option></Select>
      </div>
      {packages.length > 0 ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{packages.map((item) => <TravelPackageCard key={item.id} packageItem={item} saved={savedIds.has(item.id)} onToggleSaved={toggleSaved} />)}</div> : <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center"><p className="font-semibold text-text">No trips match these filters</p><button type="button" onClick={() => { setQuery(''); setTheme('all') }} className="mt-2 text-sm font-semibold text-primary hover:underline">Clear filters</button></div>}
    </div>
  )
}
