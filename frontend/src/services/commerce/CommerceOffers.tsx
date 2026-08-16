import { Link } from 'react-router-dom'
import { BadgePercent, Tag } from 'lucide-react'
import { COMMERCE_OFFERS } from './commerceData'
import CommerceShell from './CommerceShell'
import { useCommerceStore } from './commerceStore'

export default function CommerceOffers() {
  const store = useCommerceStore()

  return (
    <CommerceShell cartCount={store.cartCount} wishlistCount={store.wishlistCount}>
      <div className="commerce-main">
        <div className="commerce-page-head">
          <h1><BadgePercent aria-hidden="true" /> Offers & coupons</h1>
          <p>Active promotions you can use right now. Discounts are always validated at checkout.</p>
        </div>

        <div className="commerce-offer-cards">
          {COMMERCE_OFFERS.map((offer) => (
            <Link key={offer.id} to="/commerce/products" className="commerce-offer" style={{ background: offer.gradient }}>
              <div>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <span className="commerce-offer-code">{offer.code}</span>
              </div>
              <span className="commerce-offer-ends">{offer.endsIn}</span>
            </Link>
          ))}
        </div>

        <div className="commerce-cta-note" style={{ marginTop: 26, padding: '18px 20px', border: '1px solid var(--commerce-line)', borderRadius: 14, background: '#fff', fontSize: 13, lineHeight: 1.7, color: 'var(--commerce-muted)' }}>
          <Tag aria-hidden="true" style={{ width: 16, color: 'var(--commerce-brand)', marginRight: 8 }} />
          Coupons are applied at checkout. Enter the code shown on an offer card in the order summary and the discount is recalculated before you pay.
        </div>
      </div>
    </CommerceShell>
  )
}