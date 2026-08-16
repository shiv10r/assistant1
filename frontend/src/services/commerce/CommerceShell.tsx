import type { ReactNode } from 'react'
import { BadgePercent, Heart, Home, LayoutGrid, Package, Search, ShoppingCart, Store } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './commerce.css'

type CommerceShellProps = {
  readonly children: ReactNode
  readonly cartCount: number
  readonly wishlistCount: number
}

const COMMERCE_NAV = [
  { to: '/commerce', label: 'Home', icon: Home, end: true },
  { to: '/commerce/categories', label: 'Categories', icon: LayoutGrid, end: false },
  { to: '/commerce/products', label: 'Products', icon: Package, end: false },
  { to: '/commerce/offers', label: 'Offers', icon: BadgePercent, end: false },
  { to: '/commerce/brands', label: 'Brands', icon: Store, end: false },
] as const

export default function CommerceShell({ children, cartCount, wishlistCount }: CommerceShellProps) {
  return (
    <div className="commerce-app">
      <header className="commerce-header">
        <NavLink className="commerce-brand" to="/commerce"><ShoppingCart aria-hidden="true" /> <span>VSR</span> Commerce</NavLink>
        <nav className="commerce-nav" aria-label="Store navigation">
          {COMMERCE_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('commerce-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="commerce-actions">
          <Link to="/commerce/search" className="commerce-icon-btn" aria-label="Search products" title="Search products">
            <Search aria-hidden="true" />
          </Link>
          <Link to="/commerce/wishlist" className="commerce-icon-btn" aria-label={`Wishlist, ${wishlistCount} saved`} title="Wishlist">
            <Heart aria-hidden="true" />
            {wishlistCount > 0 && <span className="commerce-badge">{wishlistCount}</span>}
          </Link>
          <Link to="/commerce/cart" className="commerce-icon-btn" aria-label={`Cart, ${cartCount} items`} title="Cart">
            <ShoppingCart aria-hidden="true" />
            {cartCount > 0 && <span className="commerce-badge">{cartCount}</span>}
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}