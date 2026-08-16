import { Link, useParams } from 'react-router-dom'
import NewsCard from './NewsCard'
import NewsShell from './NewsShell'
import { categoryFromSlug, storiesByCategory } from './newsData'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsCategory() {
  const { categorySlug } = useParams()
  const category = categoryFromSlug(categorySlug)
  const { bookmarks, toggleBookmark } = useNewsBookmarks()

  if (!category) return <NewsShell><main className="news-main"><section className="news-empty"><h1>Category not found</h1><p>This news desk is not available.</p><Link to="/news">Return to VSR News</Link></section></main></NewsShell>

  const stories = storiesByCategory(category)
  return (
    <NewsShell>
      <main className="news-main news-list-page">
        <header className="news-page-head"><span>VSR News desk</span><h1>{category}</h1><p>Latest reporting, analysis and developments from the {category.toLowerCase()} desk.</p></header>
        <div className="news-grid">{stories.map((story) => <NewsCard key={story.slug} story={story} saved={bookmarks.includes(story.slug)} onToggleBookmark={toggleBookmark} />)}</div>
      </main>
    </NewsShell>
  )
}
