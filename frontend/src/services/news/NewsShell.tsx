import type { ReactNode } from 'react'
import { Bookmark, Clock3, Home, Newspaper } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './news.css'

type NewsShellProps = {
  readonly children: ReactNode
}

const NEWS_NAV = [
  { to: '/news', label: 'Home', icon: Home, end: true },
  { to: '/news/latest', label: 'Latest', icon: Clock3, end: false },
  { to: '/news/bookmarks', label: 'Saved', icon: Bookmark, end: false },
] as const

export default function NewsShell({ children }: NewsShellProps) {
  return (
    <div className="news-app">
      <header className="news-masthead">
        <div className="news-brand"><Newspaper aria-hidden="true" /> <span>VSR</span> News</div>
        <nav className="news-nav" aria-label="News navigation">
          {NEWS_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('news-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      {children}
    </div>
  )
}
