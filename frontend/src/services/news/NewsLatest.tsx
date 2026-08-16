import NewsCard from './NewsCard'
import { NEWS_STORIES } from './newsData'
import NewsShell from './NewsShell'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsLatest() {
  const { bookmarks, toggleBookmark } = useNewsBookmarks()
  return (
    <NewsShell>
      <main className="news-main news-list-page">
        <header className="news-page-head"><span>Updated throughout the day</span><h1>Latest news</h1><p>Current reporting across India, world affairs, business, technology, sport and culture.</p></header>
        <div className="news-grid">
          {NEWS_STORIES.map((story) => <NewsCard key={story.slug} story={story} saved={bookmarks.includes(story.slug)} onToggleBookmark={toggleBookmark} />)}
        </div>
      </main>
    </NewsShell>
  )
}
