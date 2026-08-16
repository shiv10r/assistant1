import type { FormEvent } from 'react'
import { useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import NewsCard from './NewsCard'
import NewsShell from './NewsShell'
import { searchStories } from './newsData'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsSearch() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [draft, setDraft] = useState(query)
  const stories = searchStories(query)
  const { bookmarks, toggleBookmark } = useNewsBookmarks()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = new URLSearchParams()
    if (draft.trim()) next.set('q', draft.trim())
    setParams(next)
  }

  return (
    <NewsShell>
      <main className="news-main news-list-page">
        <header className="news-page-head"><span>Search the newsroom</span><h1>Find a story</h1><p>Search headlines, summaries, categories and authors.</p></header>
        <form className="news-search-form" onSubmit={submit} role="search"><Search aria-hidden="true" /><label className="sr-only" htmlFor="news-search">Search VSR News</label><input id="news-search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search news" /><button type="submit">Search</button></form>
        <div className="news-search-meta" aria-live="polite"><strong>{stories.length} stories</strong>{query && <span>Results for “{query}”</span>}</div>
        {stories.length > 0 ? <div className="news-grid">{stories.map((story) => <NewsCard key={story.slug} story={story} saved={bookmarks.includes(story.slug)} onToggleBookmark={toggleBookmark} />)}</div> : <section className="news-empty"><SearchX aria-hidden="true" /><h2>No stories found</h2><p>Try another topic, category or author.</p></section>}
      </main>
    </NewsShell>
  )
}
