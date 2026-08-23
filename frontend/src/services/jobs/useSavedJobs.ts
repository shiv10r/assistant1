import { usePersistedDocument } from '../../lib/localStore'

const SAVED_JOBS_KEY = 'vsr-jobs-saved'

function readSavedJobs(): readonly string[] {
  const raw = localStorage.getItem(SAVED_JOBS_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = usePersistedDocument<readonly string[]>('jobs:saved', readSavedJobs())

  function toggleSavedJob(slug: string) {
    setSavedJobs((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next))
      return next
    })
  }

  return { savedJobs, toggleSavedJob }
}
