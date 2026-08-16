import { Bookmark, BookmarkCheck, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NewsStory } from './newsData'

type NewsCardProps = {
  readonly story: NewsStory
  readonly saved: boolean
  readonly onToggleBookmark: (slug: string) => void
  readonly compact?: boolean
}

export default function NewsCard({ story, saved, onToggleBookmark, compact = false }: NewsCardProps) {
  return (
    <article className={compact ? 'news-card is-compact' : 'news-card'}>
      <Link className="news-card-image" to={`/news/${story.slug}`} aria-label={story.headline}>
        <img src={story.imageUrl} alt={story.imageAlt} width="800" height="500" loading="lazy" />
      </Link>
      <div className="news-card-body">
        <div className="news-card-kicker"><span>{story.category}</span>{story.breaking && <strong>Breaking</strong>}</div>
        <h2><Link to={`/news/${story.slug}`}>{story.headline}</Link></h2>
        {!compact && <p>{story.summary}</p>}
        <footer className="news-card-meta">
          <span><Clock3 aria-hidden="true" /> {story.published} · {story.readMinutes} min</span>
          <button type="button" onClick={() => onToggleBookmark(story.slug)} aria-label={saved ? `Remove ${story.headline} from saved stories` : `Save ${story.headline}`}>
            {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
          </button>
        </footer>
      </div>
    </article>
  )
}
