import { ArrowLeft, Bookmark, BookmarkCheck, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import NewsCard from './NewsCard'
import { NEWS_STORIES, storyBySlug } from './newsData'
import NewsShell from './NewsShell'
import { useNewsBookmarks } from './useNewsBookmarks'

export default function NewsArticle() {
  const { slug } = useParams()
  const story = storyBySlug(slug)
  const { bookmarks, toggleBookmark } = useNewsBookmarks()

  if (!story) {
    return <NewsShell><main className="news-main"><section className="news-empty"><h1>Story not found</h1><p>This article may have moved or is no longer available.</p><Link to="/news">Return to VSR News</Link></section></main></NewsShell>
  }

  const related = NEWS_STORIES.filter((item) => item.category === story.category && item.slug !== story.slug).slice(0, 2)
  const saved = bookmarks.includes(story.slug)
  return (
    <NewsShell>
      <main className="news-main">
        <article className="news-article">
          <Link className="news-back" to="/news"><ArrowLeft aria-hidden="true" /> Back to news</Link>
          <span className="news-category">{story.category}</span>
          <h1>{story.headline}</h1>
          <p className="news-article-deck">{story.summary}</p>
          <div className="news-article-byline"><span>By <strong>{story.author}</strong></span><span><Clock3 aria-hidden="true" /> {story.published} · {story.readMinutes} min read</span><button type="button" onClick={() => toggleBookmark(story.slug)}>{saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}{saved ? 'Saved' : 'Save story'}</button></div>
          <img className="news-article-hero" src={story.imageUrl} alt={story.imageAlt} width="1200" height="760" />
          <div className="news-article-body">{story.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </article>
        {related.length > 0 && <section className="news-section"><header className="news-section-head"><div><span>Continue reading</span><h2>More in {story.category}</h2></div></header><div className="news-grid">{related.map((item) => <NewsCard key={item.slug} story={item} saved={bookmarks.includes(item.slug)} onToggleBookmark={toggleBookmark} />)}</div></section>}
      </main>
    </NewsShell>
  )
}
