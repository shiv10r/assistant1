import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingCart, Tag, Trash2 } from 'lucide-react'
import { money } from '../../lib/utils'
import { commerceProductById, type CommerceProduct } from './commerceData'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

function productName(product: CommerceProduct | null): string {
  return product?.name ?? 'Product'
}

export default function CommerceCart() {
  const store = useCommerceStore()
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const lines = store.cart.map((line) => {
    const product = commerceProductById(line.productId)
    const variant = product?.variants.find((item) => item.id === line.variantId)
    return { line, product, variant }
  })

  const subtotal = lines.reduce((total, { variant, line }) => {
    return total + (variant?.price ?? 0) * line.quantity
  }, 0)
  const discount = lines.reduce((total, { variant, line }) => {
    const compareAt = variant?.compareAtPrice ?? 0
    const price = variant?.price ?? 0
    return total + (compareAt > price ? (compareAt - price) * line.quantity : 0)
  }, 0)
  const couponDiscount = appliedCoupon ? Math.round(subtotal * 0.1) : 0
  const total = subtotal - discount - couponDiscount
  const savings = discount + couponDiscount

  function applyCoupon() {
    const code = coupon.trim().toUpperCase()
    if (code === 'WELCOME10') setAppliedCoupon(code)
    setCoupon('')
  }

  if (lines.length === 0) {
    return (
      <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
        <div className="commerce-main">
          <div className="commerce-empty">
            <ShoppingCart aria-hidden="true" />
            <h2>Your cart is empty</h2>
            <p>Add something you love and it will show up here.</p>
            <Link to="/commerce/products" style={{ padding: '12px 18px', borderRadius: 10, background: 'var(--commerce-brand)', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Continue shopping</Link>
          </div>
        </div>
      </CommerceShell>
    )
  }

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1>Your cart</h1>
          <p>{store.cartCount} {store.cartCount === 1 ? 'item' : 'items'} in your cart.</p>
        </div>

        <div className="commerce-cart">
          <div className="commerce-cart-items">
            {lines.map(({ line, product, variant }) => {
              if (!product || !variant) return null
              return (
                <article className="commerce-cart-item" key={`${line.productId}-${line.variantId}`}>
                  <Link to={`/commerce/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
                    <img src={product.images[0]} alt="" width="184" height="184" loading="lazy" />
                  </Link>
                  <div>
                    <h3><Link to={`/commerce/product/${product.slug}`}>{productName(product)}</Link></h3>
                    <p className="commerce-cart-variant">Variant: {variant.name} · {variant.sku}</p>
                    <p className="commerce-cart-unit">{money(variant.price)} each</p>
                    <div className="commerce-qty">
                      <button type="button" onClick={() => store.updateQuantity(product.id, variant.id, line.quantity - 1)} aria-label="Decrease quantity"><Minus aria-hidden="true" /></button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button type="button" onClick={() => store.updateQuantity(product.id, variant.id, line.quantity + 1)} aria-label="Increase quantity"><Plus aria-hidden="true" /></button>
                    </div>
                  </div>
                  <div className="commerce-cart-item-side">
                    <strong>{money(variant.price * line.quantity)}</strong>
                    <button type="button" className="commerce-cart-remove" onClick={() => store.removeLine(product.id, variant.id)}>
                      <Trash2 aria-hidden="true" /> Remove
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="commerce-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <div className="commerce-summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {discount > 0 && <div className="commerce-summary-row is-save"><span>Product discounts</span><span>-{money(discount)}</span></div>}
            {couponDiscount > 0 && <div className="commerce-summary-row is-save"><span>Coupon {appliedCoupon}</span><span>-{money(couponDiscount)}</span></div>}
            <div className="commerce-summary-row"><span>Delivery</span><span>Free</span></div>
            <div className="commerce-summary-row is-total"><span>Total</span><span>{money(total)}</span></div>
            {savings > 0 && <div className="commerce-summary-row is-save"><span>You save</span><span>{money(savings)}</span></div>}

            {appliedCoupon ? (
              <div className="commerce-coupon-applied">
                <span><Tag aria-hidden="true" /> {appliedCoupon} applied</span>
                <button type="button" onClick={() => setAppliedCoupon(null)}>Remove</button>
              </div>
            ) : (
              <div className="commerce-coupon">
                <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code" aria-label="Coupon code" />
                <button type="button" onClick={applyCoupon}>Apply</button>
              </div>
            )}

            <Link to="/commerce/checkout" className="commerce-checkout">
              Proceed to checkout <ArrowRight aria-hidden="true" />
            </Link>
            <p className="commerce-freetext">Prices are validated by the backend at checkout.</p>
          </aside>
        </div>
      </div>
    </CommerceShell>
  )
}