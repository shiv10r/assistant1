import { Card, CardContent, Badge, Button, PageHead, cn } from '../components/ui'
import { usePlan } from '../hooks/usePlan'

const PLANS = [
  { key: 'free', name: 'Starter', price: 0, period: 'forever', blurb: 'For single-site freelancers', highlight: false, features: ['1 active project', 'Unlimited expenses', 'Assistant chat', 'Excel / PDF / PNG reports'] },
  { key: 'pro', name: 'Pro', price: 1500, period: '/month', blurb: 'For growing interior firms', highlight: true, features: ['Unlimited projects', 'Billing (sales, purchases, parties)', 'Cloud backup & restore', 'Advanced analytics & charts', 'Low-stock alerts', 'Project site map & weather'] },
  { key: 'business', name: 'Business', price: 2500, period: '/month', blurb: 'For multi-branch studios', highlight: false, features: ['Everything in Pro', 'Multi-user access', 'Custom invoice templates', 'Priority support', 'API access', 'Global search'] },
]

export default function Plans() {
  const { plan, setPlan } = usePlan()

  return (
    <>
      <PageHead icon="👑" title="Plans &amp; Pricing" sub="Simple pricing that grows with your business" />

      <Card className="mb-6">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-text">Current plan: <Badge variant={plan === 'free' ? 'outline' : 'success'}>{plan === 'free' ? 'Starter (Free)' : `${plan} plan`}</Badge></p>
            <p className="text-sm text-muted mt-1">Switch plans instantly — this is a simulated toggle for this deployment. No payment required.</p>
          </div>
          {plan !== 'free' && (
            <Button variant="outline" onClick={() => setPlan('free')}>Switch to Free</Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = plan === p.key
          return (
            <Card key={p.key} className={cn(
              current ? 'border-primary ring-2 ring-primary/30' : '',
              p.highlight && !current ? 'relative border-primary/60' : ''
            )}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow-lg">Most Popular</span>
              )}
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-text">{p.name}</span>
                  {current && <Badge variant="success" size="sm">Current</Badge>}
                </div>
                <p className="text-sm text-muted">{p.blurb}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text">₹{p.price}</span>
                  <span className="text-sm text-muted">{p.period}</span>
                  {p.key === 'free' && <span className="text-xs text-muted ml-auto">No card needed</span>}
                </div>
                <ul className="space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={current ? 'outline' : p.highlight ? 'default' : 'outline'}
                  disabled={current}
                  onClick={() => setPlan(p.key as 'free' | 'pro' | 'business')}
                >
                  {current ? 'Current plan' : p.key === 'free' ? 'Switch to Free' : `Activate ${p.name}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <h2>Need something custom?</h2>
        <p className="muted">Contact the VSR Systems team for enterprise pricing, dedicated hosting or white-label versions.</p>
      </Card>
    </>
  )
}
