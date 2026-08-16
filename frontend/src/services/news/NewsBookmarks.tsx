import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import NewsCard from './NewsCard'
import { NEWS_STORIES } from './newsData'
import NewsShell from './NewsShell'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsBookmarks() {
  const { bookmarks, toggleBookmark } = useNewsBookmarks()
  const savedStories = NEWS_STORIES.filter((story) => bookmarks.includes(story.slug))
  return (
    <NewsShell>
      <main className="news-main news-list-page">
        <header className="news-page-head"><span>Your reading list</span><h1>Saved stories</h1><p>Keep important reporting close and return whenever you are ready.</p></header>
        {savedStories.length > 0 ? (
          <div className="news-grid">{savedStories.map((story) => <NewsCard key={story.slug} story={story} saved onToggleBookmark={toggleBookmark} />)}</div>
        ) : (
          <section className="news-empty"><Bookmark aria-hidden="true" /><h2>No saved stories yet</h2><p>Use the bookmark button on any story to build your reading list.</p><Link to="/news/latest">Browse latest news</Link></section>
        )}
      </main>
    </NewsShell>
  )
}
