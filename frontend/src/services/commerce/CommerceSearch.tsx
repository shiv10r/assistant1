import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

export default function CommerceSearch() {
  const navigate = useNavigate()
  const store = useCommerceStore()
  const [query, setQuery] = useState('')

  function searchProducts() {
    const search = query.trim()
    navigate(search ? `/commerce/products?q=${encodeURIComponent(search)}` : '/commerce/products')
  }

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1>Search</h1>
          <p>Find products, brands and categories by keyword.</p>
        </div>
        <div className="commerce-filters" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
          <label htmlFor="commerce-search-page"><Search aria-hidden="true" /><input id="commerce-search-page" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchProducts() }} placeholder="e.g. wireless earbuds, laptops, running shoes" /></label>
          <button type="button" style={{ minHeight: 42, padding: '0 22px', border: 0, borderRadius: 9, background: 'var(--commerce-brand)', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={searchProducts}>Search</button>
        </div>
      </div>
    </CommerceShell>
  )
}