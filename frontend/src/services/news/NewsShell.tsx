import type { ReactNode } from 'react'
import { Bookmark, Clock3, Flame, Home, Newspaper, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { NEWS_CATEGORIES } from './newsData'
import './news.css'

type NewsShellProps = {
  readonly children: ReactNode
}

const NEWS_NAV = [
  { to: '/news', label: 'Home', icon: Home, end: true },
  { to: '/news/latest', label: 'Latest', icon: Clock3, end: false },
  { to: '/news/trending', label: 'Trending', icon: Flame, end: false },
  { to: '/news/search', label: 'Search', icon: Search, end: false },
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
      <nav className="news-category-nav" aria-label="News categories">
        {NEWS_CATEGORIES.map((category) => <NavLink key={category} to={`/news/category/${category.toLowerCase()}`} className={({ isActive }) => isActive ? 'is-active' : undefined}>{category}</NavLink>)}
      </nav>
      {children}
    </div>
  )
}
