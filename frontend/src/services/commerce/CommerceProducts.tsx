import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, Search, SlidersHorizontal } from 'lucide-react'
import { COMMERCE_BRANDS, COMMERCE_CATEGORIES, commerceSearchProducts } from './commerceData'
import CommerceProductCard from './CommerceProductCard'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

const MAX_PRICES = [
  { label: 'Any price', value: null },
  { label: 'Under ₹2,000', value: 2000 },
  { label: 'Under ₹5,000', value: 5000 },
  { label: 'Under ₹15,000', value: 15000 },
  { label: 'Under ₹50,000', value: 50000 },
] as const

export default function CommerceProducts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useCommerceStore()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const categoryId = searchParams.get('category')
  const brandId = searchParams.get('brand')
  const maxPriceParam = searchParams.get('maxPrice')

  const maxPrice = useMemo(() => {
    const parsed = maxPriceParam ? Number(maxPriceParam) : null
    return parsed && Number.isFinite(parsed) ? parsed : null
  }, [maxPriceParam])

  const results = useMemo(
    () => commerceSearchProducts(query, categoryId, brandId, maxPrice),
    [query, categoryId, brandId, maxPrice],
  )

  const activeCategory = COMMERCE_CATEGORIES.find((category) => category.id === categoryId)
  const activeBrand = COMMERCE_BRANDS.find((brand) => brand.id === brandId)

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams())
    setQuery('')
  }

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1>Products</h1>
          <p>
            {results.length} {results.length === 1 ? 'product' : 'products'}
            {activeCategory ? ` in ${activeCategory.name}` : ''}
            {activeBrand ? ` from ${activeBrand.name}` : ''}
          </p>
        </div>

        <div className="commerce-filters">
          <label htmlFor="commerce-filter-q"><Search aria-hidden="true" /><input id="commerce-filter-q" value={query} onChange={(event) => { setQuery(event.target.value); updateParam('q', event.target.value || null) }} placeholder="Search products" /></label>
          <label htmlFor="commerce-filter-category"><SlidersHorizontal aria-hidden="true" />
            <select id="commerce-filter-category" value={categoryId ?? ''} onChange={(event) => updateParam('category', event.target.value || null)}>
              <option value="">All categories</option>
              {COMMERCE_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label htmlFor="commerce-filter-brand">
            <select id="commerce-filter-brand" value={brandId ?? ''} onChange={(event) => updateParam('brand', event.target.value || null)}>
              <option value="">All brands</option>
              {COMMERCE_BRANDS.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </label>
          <label htmlFor="commerce-filter-price">
            <select id="commerce-filter-price" value={maxPriceParam ?? ''} onChange={(event) => updateParam('maxPrice', event.target.value || null)}>
              {MAX_PRICES.map((price) => <option key={price.label} value={price.value ?? ''}>{price.label}</option>)}
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div className="commerce-empty">
            <PackageSearch aria-hidden="true" />
            <h2>No products match these filters</h2>
            <p>Try a different search term or clear the filters.</p>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="commerce-cards">
            {results.map((product) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                wishlisted={store.wishlist.includes(product.id)}
                onToggleWishlist={store.toggleWishlist}
                onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
              />
            ))}
          </div>
        )}
      </div>
    </CommerceShell>
  )
}