import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SERVICES, getLastService, setLastService, type ServiceDef } from '../lib/services'
import { cn } from '../lib/utils'
import { ArrowRight } from 'lucide-react'
import './ServiceChooser.css'

export default function ServiceChooser() {
  const navigate = useNavigate()
  const last = getLastService()
  const [entering, setEntering] = useState<ServiceDef | null>(null)

  function enter(svc: ServiceDef) {
    setEntering(svc)
    setLastService(svc.id)
    // brief exit animation before navigating
    setTimeout(() => navigate(svc.home), 260)
  }

  return (
    <div className="chooser">

      <header className="chooser-head">
        <div className="chooser-brand">Lux<span>Infra</span></div>
        <p className="chooser-sub">Choose the workspace for this session</p>
      </header>

      <main className={cn('chooser-grid', entering && 'chooser-exiting')}>
        {SERVICES.map((svc, i) => (
          <button
            key={svc.id}
            className="chooser-workspace"
            style={{ animationDelay: `${i * 90}ms` }}
            onClick={() => enter(svc)}
            aria-label={`Enter ${svc.label}`}
          >
            <span className="chooser-icon">{svc.icon}</span>
            <span className="chooser-name">{svc.label}</span>
            <span className="chooser-tag">{svc.tagline}</span>
            <span className="chooser-enter">
              Open workspace <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        ))}
      </main>

      {last && (
        <footer className="chooser-foot">
          <button className="chooser-return" onClick={() => enter(last)}>
            Return to <b>{last.label}</b>
          </button>
        </footer>
      )}
    </div>
  )
}