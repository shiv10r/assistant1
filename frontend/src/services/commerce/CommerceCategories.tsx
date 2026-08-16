import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { COMMERCE_CATEGORIES } from './commerceData'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

export default function CommerceCategories() {
  const store = useCommerceStore()

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1><LayoutGrid aria-hidden="true" /> Categories</h1>
          <p>Browse the full catalogue by category.</p>
        </div>
        <div className="commerce-cards">
          {COMMERCE_CATEGORIES.map((category) => (
            <Link key={category.id} to={`/commerce/products?category=${category.id}`} className="commerce-category-card">
              <div className="commerce-category-media"><img src={category.image} alt="" width="640" height="480" loading="lazy" /></div>
              <div className="commerce-category-body">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="commerce-category-count">{category.productCount} products</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CommerceShell>
  )
}