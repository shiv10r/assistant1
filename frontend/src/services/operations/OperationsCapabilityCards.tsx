import { ArrowRight, CheckCircle2, Database, Flag, MessageSquareText, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { OperationsConfig } from './config'

export default function OperationsCapabilityCards({ config, counts }: { config: OperationsConfig; counts: { discussions: number; checkpoints: number; library: number; team: number } }) {
  const navigate = useNavigate()
  const base = `/${config.id}/operations`
  const cards = [
    { view: 'visits', icon: MessageSquareText, eyebrow: 'Scheduled coordination', title: capitalize(config.channelLabel), detail: `${counts.discussions} updates · mentions, hurdles and meetings`, status: 'Interactive' },
    { view: 'tracking', icon: Flag, eyebrow: 'Global control', title: capitalize(config.timelineLabel), detail: `${counts.checkpoints} ${config.checkpoint}s across all ${config.items}`, status: 'Tracked' },
    { view: 'team', icon: UsersRound, eyebrow: 'Role clarity', title: `${capitalize(config.people)} roster`, detail: `${counts.team} participants with service-specific roles`, status: 'Ready' },
    { view: 'library', icon: Database, eyebrow: 'PostgreSQL metadata', title: capitalize(config.libraryLabel), detail: `${counts.library} reusable records with photos and file details`, status: 'Synced' },
  ]
  return <section className="ops-capability-section"><div className="ops-section-title"><div><span>Workspace capabilities</span><h2>Move the work forward</h2></div><CheckCircle2 className="w-5 h-5" /></div><div className="ops-capability-grid">{cards.map((card) => { const Icon = card.icon; return <button key={card.view} onClick={() => navigate(`${base}/${card.view}`)}><div className="ops-capability-icon"><Icon /></div><div><span>{card.eyebrow}</span><h3>{card.title}</h3><p>{card.detail}</p></div><footer><b>{card.status}</b><span>Open <ArrowRight /></span></footer></button> })}</div></section>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
