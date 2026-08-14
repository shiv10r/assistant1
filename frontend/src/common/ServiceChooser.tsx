import { useRef, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SERVICES, getLastService, setLastService, type ServiceDef } from '../lib/services'
import { cn } from '../lib/utils'
import { ArrowRight } from 'lucide-react'
import './ServiceChooser.css'

export default function ServiceChooser() {
  const navigate = useNavigate()
  const last = getLastService()
  const [entering, setEntering] = useState<ServiceDef | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  function enter(svc: ServiceDef) {
    setEntering(svc)
    setLastService(svc.id)
    // brief exit animation before navigating
    setTimeout(() => navigate(svc.home), 260)
  }

  function onSpotlightMove(e: MouseEvent<HTMLDivElement>) {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  function onCardMove(e: MouseEvent<HTMLButtonElement>) {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`)
    card.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`)
  }

  function onCardLeave(e: MouseEvent<HTMLButtonElement>) {
    const card = e.currentTarget
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="chooser" ref={rootRef} onMouseMove={onSpotlightMove}>
      <div className="chooser-spotlight" aria-hidden="true" />
      <div className="chooser-aurora" aria-hidden="true">
        <span className="chooser-blob c1" /><span className="chooser-blob c2" /><span className="chooser-blob c3" />
      </div>
      <div className="chooser-grain" aria-hidden="true" />

      <header className="chooser-head">
        <div className="chooser-brand">Lux<span>Infra</span></div>
        <p className="chooser-sub">Pick a workspace to get started</p>
      </header>

      <main className={cn('chooser-grid', entering && 'chooser-exiting')}>
        {SERVICES.map((svc, i) => (
          <button
            key={svc.id}
            className="chooser-card"
            style={{ animationDelay: `${i * 90}ms`, ['--card-grad' as string]: svc.gradient }}
            onClick={() => enter(svc)}
            onMouseMove={onCardMove}
            onMouseLeave={onCardLeave}
            aria-label={`Enter ${svc.label}`}
          >
            <span className="chooser-icon">{svc.icon}</span>
            <span className="chooser-name">{svc.label}</span>
            <span className="chooser-tag">{svc.tagline}</span>
            <span className="chooser-enter">
              Enter <ArrowRight className="w-4 h-4" />
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