import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { money } from '../../lib/utils'
import { commerceProductById } from './commerceData'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

export default function CommerceCheckout() {
  const navigate = useNavigate()
  const store = useCommerceStore()
  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'done'>('address')
  const [address, setAddress] = useState({ name: '', phone: '', line: '', city: '', postal: '' })

  const lines = store.cart.map((line) => {
    const product = commerceProductById(line.productId)
    const variant = product?.variants.find((item) => item.id === line.variantId)
    return { line, product, variant }
  })
  const subtotal = lines.reduce((total, { variant, line }) => total + (variant?.price ?? 0) * line.quantity, 0)
  const discount = lines.reduce((total, { variant, line }) => {
    const compareAt = variant?.compareAtPrice ?? 0
    const price = variant?.price ?? 0
    return total + (compareAt > price ? (compareAt - price) * line.quantity : 0)
  }, 0)
  const shipping = subtotal - discount > 499 ? 0 : 49
  const total = subtotal - discount + shipping
  const addressValid = address.name.trim() !== '' && address.phone.trim() !== '' && address.line.trim() !== '' && address.city.trim() !== '' && address.postal.trim() !== ''

  function placeOrder() {
    store.clearCart()
    setStep('done')
  }

  if (lines.length === 0 && step !== 'done') {
    return (
      <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
        <div className="commerce-main">
          <div className="commerce-empty">
            <PackageCheck aria-hidden="true" />
            <h2>Nothing to check out</h2>
            <p>Your cart is empty. Add a product before checking out.</p>
            <Link to="/commerce/products" style={{ padding: '12px 18px', borderRadius: 10, background: 'var(--commerce-brand)', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Continue shopping</Link>
          </div>
        </div>
      </CommerceShell>
    )
  }

  if (step === 'done') {
    const orderNumber = `VSR-EC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`
    return (
      <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
        <div className="commerce-main">
          <div className="commerce-empty" style={{ padding: '80px 24px' }}>
            <CheckCircle2 aria-hidden="true" style={{ width: 54, height: 54, color: 'var(--commerce-good)' }} />
            <h2>Order confirmed</h2>
            <p>Order <strong style={{ color: 'var(--commerce-ink)' }}>{orderNumber}</strong> has been placed. A confirmation is on its way to your email and phone.</p>
            <p style={{ color: 'var(--commerce-muted)' }}>You can track this order under My Orders once customer accounts arrive.</p>
            <Link to="/commerce/products" style={{ padding: '12px 18px', borderRadius: 10, background: 'var(--commerce-brand)', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Continue shopping</Link>
          </div>
        </div>
      </CommerceShell>
    )
  }

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <button type="button" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0, border: 0, background: 'none', color: 'var(--commerce-brand)', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          <ArrowLeft aria-hidden="true" style={{ width: 16 }} /> Back
        </button>

        <div className="commerce-page-head" style={{ marginTop: 12 }}>
          <h1>Checkout</h1>
          <p>Step {step === 'address' ? '1 of 3' : step === 'shipping' ? '2 of 3' : '3 of 3'} — delivery details, then payment.</p>
        </div>

        <div className="commerce-cart">
          <div className="commerce-cart-items">
            {step === 'address' && (
              <section className="commerce-checkout-step" aria-label="Delivery address">
                <h2><MapPin aria-hidden="true" /> Delivery address</h2>
                <div className="commerce-checkout-fields">
                  <label htmlFor="co-name">Full name<input id="co-name" value={address.name} onChange={(event) => setAddress({ ...address, name: event.target.value })} placeholder="Your full name" /></label>
                  <label htmlFor="co-phone">Phone<input id="co-phone" value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} placeholder="10-digit mobile number" inputMode="tel" /></label>
                  <label htmlFor="co-line">Address line<input id="co-line" value={address.line} onChange={(event) => setAddress({ ...address, line: event.target.value })} placeholder="House, street, area" /></label>
                  <div className="commerce-checkout-row">
                    <label htmlFor="co-city">City<input id="co-city" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} placeholder="City" /></label>
                    <label htmlFor="co-postal">Postal code<input id="co-postal" value={address.postal} onChange={(event) => setAddress({ ...address, postal: event.target.value })} placeholder="6-digit PIN" inputMode="numeric" /></label>
                  </div>
                </div>
                <button type="button" className="commerce-checkout" disabled={!addressValid} onClick={() => setStep('shipping')} style={{ opacity: addressValid ? 1 : 0.5, cursor: addressValid ? 'pointer' : 'not-allowed' }}>Continue to shipping</button>
              </section>
            )}

            {step === 'shipping' && (
              <section className="commerce-checkout-step" aria-label="Shipping method">
                <h2><Truck aria-hidden="true" /> Shipping method</h2>
                <div className="commerce-shipping-options">
                  <label className="commerce-shipping-option is-active">
                    <span><strong>Standard</strong><small>Estimated 3-5 business days</small></span>
                    <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
                  </label>
                  <label className="commerce-shipping-option">
                    <span><strong>Express</strong><small>Estimated 1-2 business days</small></span>
                    <span>₹149</span>
                  </label>
                </div>
                <button type="button" className="commerce-checkout" onClick={() => setStep('payment')}>Continue to payment</button>
              </section>
            )}

            {step === 'payment' && (
              <section className="commerce-checkout-step" aria-label="Payment">
                <h2><CreditCard aria-hidden="true" /> Payment</h2>
                <p style={{ margin: '0 0 16px', color: 'var(--commerce-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Development payment simulator — choose an outcome. In production, payment is created and verified by the backend only.
                </p>
                <div className="commerce-shipping-options">
                  <label className="commerce-shipping-option is-active">
                    <span><strong>UPI</strong><small>Pay using any UPI app</small></span>
                  </label>
                  <label className="commerce-shipping-option">
                    <span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span>
                  </label>
                </div>
                <button type="button" className="commerce-checkout" onClick={placeOrder}>Pay {money(total)} and place order</button>
                <p className="commerce-freetext" style={{ marginTop: 12 }}><ShieldCheck aria-hidden="true" style={{ width: 13, verticalAlign: -2 }} /> Secure, backend-verified payment. We never store raw card details.</p>
              </section>
            )}
          </div>

          <aside className="commerce-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <div className="commerce-cart-mini">
              {lines.map(({ line, product, variant }) => {
                if (!product || !variant) return null
                return (
                  <div key={`${line.productId}-${line.variantId}`} className="commerce-summary-line">
                    <img src={product.images[0]} alt="" width="40" height="40" loading="lazy" />
                    <span>{product.name} × {line.quantity}</span>
                    <strong>{money(variant.price * line.quantity)}</strong>
                  </div>
                )
              })}
            </div>
            <div className="commerce-summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {discount > 0 && <div className="commerce-summary-row is-save"><span>Discounts</span><span>-{money(discount)}</span></div>}
            <div className="commerce-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span></div>
            <div className="commerce-summary-row is-total"><span>Total</span><span>{money(total)}</span></div>
          </aside>
        </div>
      </div>
    </CommerceShell>
  )
}