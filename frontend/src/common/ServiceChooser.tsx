import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SERVICES, getLastService, setLastService, type ServiceDef } from '../lib/services'
import { cn } from '../lib/utils'
import { ArrowRight, ArrowLeft, BriefcaseBusiness, Building2, Warehouse, GraduationCap, Plane, Newspaper, ShieldCheck, Clock, Zap, Users, HelpCircle, ChevronDown } from 'lucide-react'
import './ServiceChooser.css'
import { VsrLogo } from '../components/VsrLogo'

const WORKSPACE_ICONS: Record<string, typeof Building2> = {
  interior: Building2,
  warehouse: Warehouse,
  school: GraduationCap,
  hotel: Building2,
  travel: Plane,
  news: Newspaper,
  jobs: BriefcaseBusiness,
}

const FEATURES = [
  { icon: ShieldCheck, title: 'Secure & Reliable', sub: 'Your data is protected' },
  { icon: Clock, title: 'Always Available', sub: '24/7 access from anywhere' },
  { icon: Zap, title: 'Fast & Efficient', sub: 'Built for your productivity' },
  { icon: Users, title: 'Role Based Access', sub: 'Right access, right people' },
]

export default function ServiceChooser() {
  const navigate = useNavigate()
  const last = getLastService()
  const [entering, setEntering] = useState<ServiceDef | null>(null)

  function enter(svc: ServiceDef) {
    setEntering(svc)
    setLastService(svc.id)
    setTimeout(() => navigate(svc.home), 260)
  }

  return (
    <div className="chooser">
      <header className="chooser-header">
        <div className="chooser-brand-row">
          <VsrLogo size={42} wordmark />
        </div>
        <div className="chooser-header-actions">
          <button className="chooser-help" type="button">
            <HelpCircle className="w-4 h-4" /> Help
          </button>
          <button className="chooser-admin" type="button">
            <span className="chooser-admin-avatar">A</span>
            Admin <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="chooser-main">
        <div className="chooser-heading">
          <h1 className="chooser-title">Welcome to VSR <span>Systems</span></h1>
          <p className="chooser-sub">Choose the workspace for this session</p>
          <span className="chooser-accent" aria-hidden="true" />
        </div>

        <div className={cn('chooser-grid', entering && 'chooser-exiting')}>
          {SERVICES.map((svc, i) => {
            const Icon = WORKSPACE_ICONS[svc.id] ?? Building2
            const active = svc.id === last?.id
            return (
              <button
                key={svc.id}
                type="button"
                className={cn('chooser-workspace', active && 'chooser-active')}
                style={{ animationDelay: `${200 + i * 120}ms` }}
                onClick={() => enter(svc)}
                aria-label={`Enter ${svc.label}`}
              >
                <span className="chooser-icon">
                  <Icon className="w-7 h-7" />
                </span>
                <span className="chooser-name">{svc.label}</span>
                <span className="chooser-tag">{svc.tagline}</span>
                <span className="chooser-enter">
                  Open workspace <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            )
          })}
        </div>

        {last && (
          <footer className="chooser-return">
            <span className="chooser-return-q">Want to switch back?</span>
            <button className="chooser-return-btn" onClick={() => enter(last)}>
              <ArrowLeft className="w-4 h-4" /> Return to <b>{last.label}</b>
            </button>
          </footer>
        )}
      </main>

      <footer className="chooser-features">
        {FEATURES.map((f) => (
          <div className="chooser-feature" key={f.title}>
            <f.icon className="chooser-feature-icon" />
            <div>
              <span className="chooser-feature-title">{f.title}</span>
              <span className="chooser-feature-sub">{f.sub}</span>
            </div>
          </div>
        ))}
      </footer>
    </div>
  )
}
