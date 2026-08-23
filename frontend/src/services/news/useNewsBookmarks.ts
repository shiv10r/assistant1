import { usePersistedDocument } from '../../lib/localStore'

const BOOKMARK_KEY = 'vsr-news-bookmarks'

function readBookmarks(): readonly string[] {
  const raw = localStorage.getItem(BOOKMARK_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

export function useNewsBookmarks() {
  const [bookmarks, setBookmarks] = usePersistedDocument<readonly string[]>('news:bookmarks', readBookmarks())

  function toggleBookmark(slug: string) {
    setBookmarks((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next))
      return next
    })
  }

  return { bookmarks, toggleBookmark }
}
