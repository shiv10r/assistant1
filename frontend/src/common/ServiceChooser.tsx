import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SERVICES, getLastService, setLastService, type ServiceDef } from '../lib/services'
import { cn } from '../lib/utils'
import { FiArrowRight, FiBriefcase, FiChevronDown, FiChevronLeft, FiChevronRight, FiLogOut, FiShoppingBag, FiUser } from 'react-icons/fi'
import { MdAccountBalance, MdApartment, MdFlight, MdLocalHospital, MdNewspaper, MdSchool, MdTrain, MdWarehouse, MdWorkspacePremium } from 'react-icons/md'
import { getEdition, getEmail, getRole, getUsername, getUserProfile, logout } from '../platform/auth'
import './ServiceChooser.css'
import { VsrLogo } from '../components/VsrLogo'

type Category = ServiceDef['category']
type Filter = 'all' | Category

const WORKSPACE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  interior: MdApartment,
  warehouse: MdWarehouse,
  school: MdSchool,
  railway: MdTrain,
  hotel: MdApartment,
  travel: MdFlight,
  news: MdNewspaper,
  jobs: FiBriefcase,
  commerce: FiShoppingBag,
  bank: MdAccountBalance,
  medical: MdLocalHospital,
}

const CATEGORIES: { id: Category; label: string; description: string }[] = [
  { id: 'operations', label: 'Business operations', description: 'Run teams, assets and daily delivery' },
  { id: 'travel', label: 'Travel and stays', description: 'Plan journeys and guest experiences' },
  { id: 'marketplace', label: 'Marketplace', description: 'Products and trusted home services' },
  { id: 'personal', label: 'Personal services', description: 'Career, finance, health and news' },
]

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  accountant: 'Accountant',
  supervisor: 'Site supervisor',
}

export default function ServiceChooser() {
  const navigate = useNavigate()
  const last = getLastService()
  const username = getUsername() || 'User'
  const role = getRole()
  const profile = getUserProfile(username)
  const edition = getEdition()
  const rails = useRef<Partial<Record<Category, HTMLDivElement | null>>>({})
  const [filter, setFilter] = useState<Filter>('all')
  const [entering, setEntering] = useState<ServiceDef | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  function enter(service: ServiceDef) {
    setEntering(service)
    setLastService(service.id)
    window.setTimeout(() => navigate(service.home), 180)
  }

  function scroll(category: Category, direction: -1 | 1) {
    rails.current[category]?.scrollBy({ left: direction * Math.min(760, window.innerWidth * .72), behavior: 'smooth' })
  }

  function signOut() {
    logout()
    window.location.href = '/'
  }

  const visibleCategories = filter === 'all' ? CATEGORIES : CATEGORIES.filter((category) => category.id === filter)
  const displayName = profile.displayName || username

  return (
    <div className={cn('chooser', entering && 'chooser-exiting')}>
      <header className="chooser-header">
        <div className="chooser-brand-row"><VsrLogo size={40} wordmark /></div>
        <div className="chooser-session">
          <span className={cn('chooser-edition', edition === 'gold' && 'gold')}><MdWorkspacePremium /> {edition === 'gold' ? 'Gold' : 'Standard'}</span>
          <div className="chooser-profile-wrap">
            <button className="chooser-profile" type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} aria-haspopup="menu">
              <span className="chooser-avatar">{profile.avatar ? <img src={profile.avatar} alt="" /> : displayName.slice(0, 1).toUpperCase()}</span>
              <span><strong>{displayName}</strong><small>{ROLE_LABELS[role] || role}</small></span>
              <FiChevronDown />
            </button>
            {profileOpen && (
              <div className="chooser-profile-menu" role="menu">
                <div><strong>{displayName}</strong><span>{profile.email || getEmail() || username}</span></div>
                <button role="menuitem" onClick={() => navigate('/account')}><FiUser /> Profile and account</button>
                <button role="menuitem" onClick={signOut}><FiLogOut /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="chooser-main">
        <section className="chooser-hero">
          <span className="chooser-kicker">Workspace library</span>
          <h1>What will you run today?</h1>
          <p>Move between every VSR service from one secure session.</p>
          {last && <button type="button" className="chooser-resume" onClick={() => enter(last)}><span>Continue in</span><strong>{last.label}</strong><FiArrowRight /></button>}
        </section>

        <div className="chooser-filters" role="toolbar" aria-label="Filter services">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All services <span>{SERVICES.length}</span></button>
          {CATEGORIES.map((category) => (
            <button key={category.id} className={filter === category.id ? 'active' : ''} onClick={() => setFilter(category.id)}>{category.label} <span>{SERVICES.filter((service) => service.category === category.id).length}</span></button>
          ))}
        </div>

        <div className="chooser-rails">
          {visibleCategories.map((category) => {
            const services = SERVICES.filter((service) => service.category === category.id)
            return (
              <section className="chooser-rail-section" key={category.id}>
                <div className="chooser-rail-head">
                  <div><h2>{category.label}</h2><p>{category.description}</p></div>
                  <div className="chooser-rail-controls">
                    <button type="button" onClick={() => scroll(category.id, -1)} aria-label={`Scroll ${category.label} left`}><FiChevronLeft /></button>
                    <button type="button" onClick={() => scroll(category.id, 1)} aria-label={`Scroll ${category.label} right`}><FiChevronRight /></button>
                  </div>
                </div>
                <div className="chooser-rail" ref={(node) => { rails.current[category.id] = node }}>
                  {services.map((service, index) => {
                    const Icon = WORKSPACE_ICONS[service.id] ?? MdApartment
                    const active = service.id === last?.id
                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={cn('chooser-workspace', active && 'chooser-active')}
                        style={{ '--service-gradient': service.gradient, '--chooser-delay': `${index * 55}ms` } as React.CSSProperties}
                        onClick={() => enter(service)}
                        aria-label={`Open ${service.label}`}
                      >
                        <span className="chooser-card-art" aria-hidden="true"><Icon /><b>{String(index + 1).padStart(2, '0')}</b></span>
                        <span className="chooser-card-body">
                          <span className="chooser-name">{service.label}</span>
                          <span className="chooser-tag">{service.tagline}</span>
                          <span className="chooser-enter">Open service <FiArrowRight /></span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
