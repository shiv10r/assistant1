import NewsCard from './NewsCard'
import NewsShell from './NewsShell'
import { trendingStories } from './newsData'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsTrending() {
  const stories = trendingStories()
  const { bookmarks, toggleBookmark } = useNewsBookmarks()

  return (
    <NewsShell>
      <main className="news-main news-list-page">
        <header className="news-page-head"><span>What readers are following</span><h1>Trending now</h1><p>Breaking developments and widely followed stories across every VSR News desk.</p></header>
        <div className="news-grid">{stories.map((story) => <NewsCard key={story.slug} story={story} saved={bookmarks.includes(story.slug)} onToggleBookmark={toggleBookmark} />)}</div>
      </main>
    </NewsShell>
  )
}
