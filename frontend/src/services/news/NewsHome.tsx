import { ArrowRight, Bookmark, BookmarkCheck, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import NewsCard from './NewsCard'
import { NEWS_STORIES } from './newsData'
import NewsShell from './NewsShell'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsHome() {
  const { bookmarks, toggleBookmark } = useNewsBookmarks()
  const lead = NEWS_STORIES[0]
  const sideStories = NEWS_STORIES.slice(1, 3)
  const latest = NEWS_STORIES.slice(3, 7)

  return (
    <NewsShell>
      <section className="news-breaking" aria-label="Breaking news">
        <strong>Breaking</strong>
        <div className="news-breaking-track">
          {NEWS_STORIES.filter((story) => story.breaking || story.trending).map((story) => <Link key={story.slug} to={`/news/${story.slug}`}>{story.headline}</Link>)}
        </div>
      </section>

      <main className="news-main">
        <section className="news-lead-grid" aria-label="Top stories">
          <article className="news-lead">
            <img src={lead.imageUrl} alt={lead.imageAlt} width="1200" height="760" />
            <div className="news-lead-overlay">
              <span className="news-category">{lead.category}</span>
              <h1><Link to={`/news/${lead.slug}`}>{lead.headline}</Link></h1>
              <p>{lead.summary}</p>
              <div className="news-lead-meta">
                <span><Clock3 aria-hidden="true" /> {lead.published} · {lead.readMinutes} min read</span>
                <button type="button" onClick={() => toggleBookmark(lead.slug)} aria-label={bookmarks.includes(lead.slug) ? 'Remove lead story from saved stories' : 'Save lead story'}>
                  {bookmarks.includes(lead.slug) ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
                </button>
              </div>
            </div>
          </article>
          <div className="news-lead-side">
            {sideStories.map((story) => <NewsCard key={story.slug} story={story} compact saved={bookmarks.includes(story.slug)} onToggleBookmark={toggleBookmark} />)}
          </div>
        </section>

        <section className="news-section">
          <header className="news-section-head"><div><span>Fresh reporting</span><h2>Latest news</h2></div><Link to="/news/latest">View all <ArrowRight aria-hidden="true" /></Link></header>
          <div className="news-grid">
            {latest.map((story) => <NewsCard key={story.slug} story={story} saved={bookmarks.includes(story.slug)} onToggleBookmark={toggleBookmark} />)}
          </div>
        </section>
      </main>
    </NewsShell>
  )
}
