import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'
import { COMMERCE_BRANDS } from './commerceData'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

export default function CommerceBrands() {
  const store = useCommerceStore()

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1><Store aria-hidden="true" /> Brands</h1>
          <p>Shop products from the brands we stock direct.</p>
        </div>
        <div className="commerce-brand-rail">
          {COMMERCE_BRANDS.map((brand) => (
            <Link key={brand.id} to={`/commerce/products?brand=${brand.id}`} className="commerce-brand-tile">
              <img src={brand.image} alt="" width="300" height="300" loading="lazy" />
              <span>{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </CommerceShell>
  )
}