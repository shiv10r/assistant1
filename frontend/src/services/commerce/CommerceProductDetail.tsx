import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgePercent, CheckCircle2, ChevronRight, Heart, PackageSearch, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react'
import { money } from '../../lib/utils'
import { cn } from '../../lib/utils'
import {
  commerceBrandById, commerceCategoryById, commerceProductBySlug, commerceReviewsFor, commerceSearchProducts,
} from './commerceData'
import CommerceProductCard from './CommerceProductCard'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

type DetailTab = 'Highlights' | 'Specifications' | 'Reviews'

export default function CommerceProductDetail() {
  const { slug } = useParams()
  const store = useCommerceStore()
  const product = commerceProductBySlug(slug)
  const [activeVariantId, setActiveVariantId] = useState<string>(product?.variants[0]?.id ?? '')
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState<DetailTab>('Highlights')

  if (!product) {
    return (
      <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
        <div className="commerce-main">
          <div className="commerce-empty">
            <PackageSearch aria-hidden="true" />
            <h2>Product not found</h2>
            <p>The product you are looking for does not exist or has been removed.</p>
            <Link to="/commerce/products" style={{ padding: '12px 18px', borderRadius: 10, background: 'var(--commerce-brand)', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Browse products</Link>
          </div>
        </div>
      </CommerceShell>
    )
  }

  const brand = commerceBrandById(product.brandId)
  const category = commerceCategoryById(product.categoryId)
  const reviews = commerceReviewsFor(product.id)
  const activeVariant = product.variants.find((variant) => variant.id === activeVariantId) ?? product.variants[0]
  const inStock = activeVariant?.stock !== 'Out of Stock'
  const similar = commerceSearchProducts('', product.categoryId, null, null).filter((item) => item.id !== product.id).slice(0, 4)
  const wishlisted = store.wishlist.includes(product.id)
  const compareAt = activeVariant ? activeVariant.compareAtPrice : 0
  const discount = activeVariant && compareAt > activeVariant.price ? Math.round(((compareAt - activeVariant.price) / compareAt) * 100) : 0

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <nav className="commerce-breadcrumbs" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, color: 'var(--commerce-muted)', fontSize: 12 }}>
          <Link to="/commerce" style={{ color: 'var(--commerce-brand)', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          <ChevronRight aria-hidden="true" style={{ width: 14 }} />
          <Link to={`/commerce/products?category=${product.categoryId}`} style={{ color: 'var(--commerce-brand)', textDecoration: 'none', fontWeight: 700 }}>{category?.name ?? 'Products'}</Link>
          <ChevronRight aria-hidden="true" style={{ width: 14 }} />
          <span>{product.name}</span>
        </nav>

        <div className="commerce-product">
          <div className="commerce-gallery">
            <div className="commerce-gallery-main">
              <img src={product.images[activeImage]} alt={`${product.name} product image`} width="800" height="800" />
            </div>
            {product.images.length > 1 && (
              <div className="commerce-gallery-thumbs">
                {product.images.map((image, index) => (
                  <button key={image} type="button" className={cn(index === activeImage && 'is-active')} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`}>
                    <img src={image} alt="" width="148" height="148" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="commerce-info">
            <p className="commerce-info-brand">{brand?.name}</p>
            <h1>{product.name}</h1>
            <div className="commerce-info-rating">
              <span className="commerce-rating"><Star aria-hidden="true" /> {product.rating.toFixed(1)}</span>
              <span>{product.reviewCount.toLocaleString('en-IN')} ratings</span>
              <span>·</span>
              <span>SKU {activeVariant?.sku}</span>
            </div>

            <div className="commerce-info-price">
              <span className="commerce-price">{money(activeVariant?.price ?? 0)}</span>
              {compareAt > (activeVariant?.price ?? 0) && <span className="commerce-price-strike">{money(compareAt)}</span>}
              {discount > 0 && <span className="commerce-price-off">{discount}% off</span>}
            </div>
            <p className="commerce-info-tax">Inclusive of all taxes. Backend-validated pricing.</p>

            <span className={cn('commerce-stock', activeVariant?.stock === 'Low Stock' && 'is-low', activeVariant?.stock === 'Out of Stock' && 'is-out')}>
              {activeVariant?.stock}
            </span>

            {product.variants.length > 1 && (
              <div className="commerce-variants">
                <h3>Select variant</h3>
                <div className="commerce-variant-row" role="radiogroup" aria-label="Product variants">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      role="radio"
                      aria-checked={variant.id === activeVariant?.id}
                      className={cn('commerce-variant', variant.id === activeVariant?.id && 'is-active', variant.stock === 'Out of Stock' && 'is-disabled')}
                      onClick={() => setActiveVariantId(variant.id)}
                      disabled={variant.stock === 'Out of Stock'}
                    >
                      {variant.name} <small>{money(variant.price)}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="commerce-delivery-box">
              <Truck aria-hidden="true" />
              <span>{product.freeDelivery ? 'Free delivery' : 'Delivery charges apply'} · Estimated 3-5 business days · Cash on delivery available</span>
            </div>

            <div className="commerce-offer-list">
              <div className="commerce-offer-row"><BadgePercent aria-hidden="true" /><span><strong>Bank offer:</strong> 10% instant discount up to ₹1,500 on credit cards</span></div>
              <div className="commerce-offer-row"><Zap aria-hidden="true" /><span><strong>Coupon:</strong> Use <strong>WELCOME10</strong> for extra 10% off on first order above ₹1,499</span></div>
            </div>

            <div className="commerce-buy-row">
              <button
                type="button"
                className={cn('commerce-buy', 'commerce-buy-add', !inStock && 'is-out')}
                disabled={!inStock}
                onClick={() => activeVariant && store.addToCart(product.id, activeVariant.id, 1)}
              >
                <ShoppingCart aria-hidden="true" /> Add to cart
              </button>
              <button type="button" className={cn('commerce-buy', 'commerce-buy-now', !inStock && 'is-out')} disabled={!inStock} onClick={() => activeVariant && store.addToCart(product.id, activeVariant.id, 1)}>
                <Zap aria-hidden="true" /> Buy now
              </button>
            </div>
            <p className="commerce-freetext">Buy now adds this item to your cart so you can review it before checkout.</p>

            <div className="commerce-trust-row">
              <div className="commerce-trust"><ShieldCheck aria-hidden="true" /> 7-day replacement</div>
              <div className="commerce-trust"><CheckCircle2 aria-hidden="true" /> Verified stock</div>
              <div className="commerce-trust"><Heart aria-hidden="true" /> {wishlisted ? 'In wishlist' : 'Save for later'}</div>
            </div>
          </div>
        </div>

        <div className="commerce-detail-tabs">
          <div className="commerce-tabs" role="tablist" aria-label="Product details">
            {(['Highlights', 'Specifications', 'Reviews'] as const).map((item) => (
              <button key={item} type="button" role="tab" aria-selected={tab === item} className={cn('commerce-tab', tab === item && 'is-active')} onClick={() => setTab(item)}>
                {item === 'Reviews' ? `Reviews (${reviews.length})` : item}
              </button>
            ))}
          </div>
          <div className="commerce-panel" role="tabpanel">
            {tab === 'Highlights' && (
              <>
                <h3>Highlights</h3>
                <ul className="commerce-highlights">
                  {product.highlights.map((highlight) => <li key={highlight}><CheckCircle2 aria-hidden="true" />{highlight}</li>)}
                </ul>
                <h3 style={{ marginTop: 20 }}>About this product</h3>
                <p style={{ margin: 0, color: 'var(--commerce-muted)', fontSize: 14, lineHeight: 1.7 }}>{product.description}</p>
              </>
            )}
            {tab === 'Specifications' && (
              <>
                <h3>Specifications</h3>
                <table className="commerce-specs">
                  <tbody>
                    {product.specs.map((spec) => <tr key={spec.key}><td>{spec.key}</td><td>{spec.value}</td></tr>)}
                  </tbody>
                </table>
              </>
            )}
            {tab === 'Reviews' && (
              <div className="commerce-reviews">
                {reviews.length === 0 && <p style={{ color: 'var(--commerce-muted)' }}>No reviews yet. Be the first to review this product.</p>}
                {reviews.map((review) => (
                  <article className="commerce-review" key={review.id}>
                    <div className="commerce-review-head">
                      <span className="commerce-review-avatar">{review.author.slice(0, 1)}</span>
                      <strong>{review.author}</strong>
                      <span className="commerce-rating"><Star aria-hidden="true" /> {review.rating.toFixed(1)}</span>
                    </div>
                    <h4>{review.title}</h4>
                    <p>{review.body}</p>
                    {review.verified && <span className="commerce-verified"><CheckCircle2 aria-hidden="true" />Verified purchase</span>}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <section className="commerce-section" aria-labelledby="commerce-similar">
            <div className="commerce-section-head">
              <div><h2 id="commerce-similar">Similar products</h2><p>More from {category?.name ?? 'this category'}.</p></div>
            </div>
            <div className="commerce-cards">
              {similar.map((item) => (
                <CommerceProductCard
                  key={item.id}
                  product={item}
                  wishlisted={store.wishlist.includes(item.id)}
                  onToggleWishlist={store.toggleWishlist}
                  onAddToCart={(productId, variantId) => store.addToCart(productId, variantId, 1)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </CommerceShell>
  )
}