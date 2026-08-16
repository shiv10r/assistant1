import { Heart, ShoppingCart, Star, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, money } from '../../lib/utils'
import {
  commerceAvailability, commerceBestCompareAt, commerceBestPrice, commerceBrandById, commerceDiscountPercent,
  type CommerceProduct,
} from './commerceData'

type CommerceProductCardProps = {
  readonly product: CommerceProduct
  readonly wishlisted: boolean
  readonly onToggleWishlist: (productId: string) => void
  readonly onAddToCart: (productId: string, variantId: string) => void
}

export default function CommerceProductCard({ product, wishlisted, onToggleWishlist, onAddToCart }: CommerceProductCardProps) {
  const brand = commerceBrandById(product.brandId)
  const price = commerceBestPrice(product)
  const compareAt = commerceBestCompareAt(product)
  const discount = commerceDiscountPercent(product)
  const availability = commerceAvailability(product)
  const firstVariantId = product.variants[0]?.id ?? ''

  return (
    <article className="commerce-card">
      <div className="commerce-card-media">
        {product.badge && <span className={cn('commerce-tag', product.badge === 'Limited Deal' && 'is-deal', product.badge === 'New' && 'is-new')}>{product.badge}</span>}
        <button
          type="button"
          className={cn('commerce-wish', wishlisted && 'is-saved')}
          onClick={() => onToggleWishlist(product.id)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart aria-hidden="true" />
        </button>
        <Link to={`/commerce/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <img src={product.images[0]} alt="" width="600" height="600" loading="lazy" />
        </Link>
      </div>
      <div className="commerce-card-body">
        <p className="commerce-card-brand">{brand?.name ?? 'VSR Commerce'}</p>
        <h3><Link to={`/commerce/product/${product.slug}`}>{product.name}</Link></h3>
        <div className="commerce-rating"><Star aria-hidden="true" /> {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString('en-IN')})</div>
        <div className="commerce-price-row">
          <span className="commerce-price">{money(price)}</span>
          {compareAt > price && <span className="commerce-price-strike">{money(compareAt)}</span>}
          {discount > 0 && <span className="commerce-price-off">{discount}% off</span>}
        </div>
        {product.freeDelivery && <span className="commerce-delivery"><Truck aria-hidden="true" />Free delivery</span>}
        <div className="commerce-card-footer">
          <button
            type="button"
            className={cn('commerce-card-cta', availability === 'Out of Stock' && 'is-out')}
            disabled={availability === 'Out of Stock'}
            onClick={() => onAddToCart(product.id, firstVariantId)}
          >
            {availability === 'Out of Stock' ? 'Out of stock' : <><ShoppingCart aria-hidden="true" />Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  )
}