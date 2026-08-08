import { PageHead } from '../ui'

const PLANS = [
  { name: 'Starter', price: 0, period: 'forever', blurb: 'For single-site freelancers', features: ['1 active project', 'Unlimited expenses', 'Assistant chat', 'Excel / PDF / PNG reports'], cta: 'Current plan' },
  { name: 'Pro', price: 499, period: '/month', blurb: 'For growing interior firms', features: ['Unlimited projects', 'Billing (sales, purchases, parties)', 'Cloud backup & restore', 'Advanced analytics', 'Low-stock alerts'], cta: 'Upgrade to Pro' },
  { name: 'Business', price: 999, period: '/month', blurb: 'For multi-branch studios', features: ['Everything in Pro', 'Multi-user access', 'Custom invoice templates', 'Priority support', 'API access'], cta: 'Upgrade to Business' },
]

export default function Plans() {
  return (
    <>
      <PageHead icon="👑" title="Plans &amp; Pricing" sub="Simple pricing that grows with your business" />

      <div className="plans-grid">
        {PLANS.map((p) => (
          <div className="plan-card" key={p.name}>
            <div className="plan-name">{p.name}</div>
            <div className="plan-blurb muted">{p.blurb}</div>
            <div className="plan-price">
              ₹{p.price}
              <span className="muted">{p.period}</span>
            </div>
            <ul className="plan-features">
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <button className="btn" disabled={p.price === 0}>{p.cta}</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Need something custom?</h2>
        <p className="muted">Contact the LuxInfra team for enterprise pricing, dedicated hosting or white-label versions.</p>
      </div>
    </>
  )
}
