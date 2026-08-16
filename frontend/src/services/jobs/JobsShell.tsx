import type { ReactNode } from 'react'
import { Bookmark, BriefcaseBusiness, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './jobs.css'

type JobsShellProps = {
  readonly children: ReactNode
}

const JOBS_NAV = [
  { to: '/jobs', label: 'Discover', icon: BriefcaseBusiness, end: true },
  { to: '/jobs/search', label: 'Search jobs', icon: Search, end: false },
  { to: '/jobs/saved', label: 'Saved', icon: Bookmark, end: false },
] as const

export default function JobsShell({ children }: JobsShellProps) {
  return (
    <div className="jobs-app">
      <header className="jobs-header">
        <NavLink className="jobs-brand" to="/jobs"><span>VSR</span> Jobs</NavLink>
        <nav className="jobs-nav" aria-label="Jobs navigation">
          {JOBS_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('jobs-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink className="jobs-employer-link" to="/jobs/search">Find talent</NavLink>
      </header>
      {children}
    </div>
  )
}
