import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgePercent, Headphones, RotateCcw, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { COMMERCE_BRANDS, COMMERCE_CATEGORIES, COMMERCE_OFFERS, COMMERCE_PRODUCTS } from './commerceData'
import CommerceProductCard from './CommerceProductCard'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

const CATEGORY_CHIPS = [
  { label: 'Mobiles', to: '/commerce/products?category=cat-mobiles' },
  { label: 'Laptops', to: '/commerce/products?category=cat-laptops' },
  { label: 'Electronics', to: '/commerce/products?category=cat-electronics' },
  { label: 'Fashion', to: '/commerce/products?category=cat-fashion' },
  { label: 'Home & Kitchen', to: '/commerce/products?category=cat-home' },
  { label: 'Offers', to: '/commerce/offers' },
] as const

const PERKS = [
  { icon: Truck, title: 'Free delivery', sub: 'On eligible orders' },
  { icon: RotateCcw, title: 'Easy returns', sub: '7-day replacement' },
  { icon: ShieldCheck, title: 'Secure checkout', sub: 'Protected payments' },
  { icon: Headphones, title: 'Real support', sub: 'We reply fast' },
] as const

export default function CommerceHome() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const store = useCommerceStore()

  function searchProducts() {
    const search = query.trim()
    navigate(search ? `/commerce/products?q=${encodeURIComponent(search)}` : '/commerce/products')
  }

  const trending = COMMERCE_PRODUCTS.filter((product) => product.isTrending).slice(0, 4)
  const deals = COMMERCE_PRODUCTS.filter((product) => product.badge === 'Limited Deal').slice(0, 4)
  const newArrivals = COMMERCE_PRODUCTS.filter((product) => product.isNewArrival).slice(0, 4)
  const featured = COMMERCE_PRODUCTS.filter((product) => product.isFeatured).slice(0, 4)

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <section className="commerce-hero" aria-label="Store search">
        <div className="commerce-hero-content">
          <p className="commerce-eyebrow">Discover. Compare. Shop.</p>
          <h1>Quality products,<br />honest prices.</h1>
          <p className="commerce-hero-copy">Curated electronics, fashion, home essentials and more — with clear prices, real stock and fast delivery.</p>
          <div className="commerce-search-bar">
            <label htmlFor="commerce-search"><Search aria-hidden="true" /><input id="commerce-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchProducts() }} placeholder="Search for products, brands and more" /></label>
            <button type="button" onClick={searchProducts}>Search</button>
          </div>
          <div className="commerce-chips">
            {CATEGORY_CHIPS.map((category) => <Link key={category.label} to={category.to} className="commerce-chip"><Sparkles aria-hidden="true" />{category.label}</Link>)}
          </div>
        </div>
      </section>

      <div className="commerce-main">
        <section className="commerce-section" aria-labelledby="commerce-trending">
          <div className="commerce-section-head">
            <div><h2 id="commerce-trending">Trending now</h2><p>What shoppers are adding to cart this week.</p></div>
            <Link to="/commerce/products">Shop all</Link>
          </div>
          <div className="commerce-cards">
            {trending.map((product) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                wishlisted={store.wishlist.includes(product.id)}
                onToggleWishlist={store.toggleWishlist}
                onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
              />
            ))}
          </div>
        </section>

        <section className="commerce-section" aria-labelledby="commerce-categories">
          <div className="commerce-section-head">
            <div><h2 id="commerce-categories">Shop by category</h2><p>Everything, organised the way you shop.</p></div>
            <Link to="/commerce/categories">All categories</Link>
          </div>
          <div className="commerce-cards">
            {COMMERCE_CATEGORIES.slice(0, 8).map((category) => (
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
        </section>

        <section className="commerce-section" aria-labelledby="commerce-deals">
          <div className="commerce-section-head">
            <div><h2 id="commerce-deals">Limited-time deals</h2><p>Real discounts, honest stock — no fake urgency.</p></div>
            <Link to="/commerce/offers">View all offers</Link>
          </div>
          <div className="commerce-cards">
            {deals.map((product) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                wishlisted={store.wishlist.includes(product.id)}
                onToggleWishlist={store.toggleWishlist}
                onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
              />
            ))}
          </div>
        </section>

        <section className="commerce-section" aria-labelledby="commerce-offers">
          <div className="commerce-section-head">
            <div><h2 id="commerce-offers">Offers & coupons</h2><p>Active promos you can use right now.</p></div>
          </div>
          <div className="commerce-offer-cards">
            {COMMERCE_OFFERS.slice(0, 4).map((offer) => (
              <Link key={offer.id} to="/commerce/products" className="commerce-offer" style={{ background: offer.gradient }}>
                <div>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <span className="commerce-offer-code">{offer.code}</span>
                </div>
                <span className="commerce-offer-ends"><BadgePercent aria-hidden="true" /> {offer.endsIn}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="commerce-section" aria-labelledby="commerce-new">
          <div className="commerce-section-head">
            <div><h2 id="commerce-new">New arrivals</h2><p>Fresh on the shelf this season.</p></div>
            <Link to="/commerce/products">Shop all</Link>
          </div>
          <div className="commerce-cards">
            {newArrivals.map((product) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                wishlisted={store.wishlist.includes(product.id)}
                onToggleWishlist={store.toggleWishlist}
                onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
              />
            ))}
          </div>
        </section>

        <section className="commerce-section" aria-labelledby="commerce-featured">
          <div className="commerce-section-head">
            <div><h2 id="commerce-featured">Featured picks</h2><p>Hand-picked favourites across categories.</p></div>
          </div>
          <div className="commerce-cards">
            {featured.map((product) => (
              <CommerceProductCard
                key={product.id}
                product={product}
                wishlisted={store.wishlist.includes(product.id)}
                onToggleWishlist={store.toggleWishlist}
                onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
              />
            ))}
          </div>
        </section>

        <section className="commerce-section" aria-labelledby="commerce-brands">
          <div className="commerce-section-head">
            <div><h2 id="commerce-brands">Featured brands</h2><p>Trusted names, stocked direct.</p></div>
            <Link to="/commerce/brands">All brands</Link>
          </div>
          <div className="commerce-brand-rail">
            {COMMERCE_BRANDS.slice(0, 5).map((brand) => (
              <Link key={brand.id} to={`/commerce/products?brand=${brand.id}`} className="commerce-brand-tile">
                <img src={brand.image} alt="" width="300" height="300" loading="lazy" />
                <span>{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="commerce-banner-band" aria-labelledby="commerce-banner">
          <div>
            <h2 id="commerce-banner">Something for every cart.</h2>
            <p>From daily essentials to serious upgrades — browse the full catalogue and check out in minutes.</p>
            <Link to="/commerce/products">Start shopping</Link>
          </div>
          <div className="commerce-perks">
            {PERKS.map((perk) => (
              <div className="commerce-perk" key={perk.title}>
                <perk.icon aria-hidden="true" />
                <p>{perk.title}</p>
                <p style={{ fontWeight: 500, opacity: 0.85, marginTop: 2 }}>{perk.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CommerceShell>
  )
}