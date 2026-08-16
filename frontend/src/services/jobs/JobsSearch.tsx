import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import JobCard from './JobCard'
import JobSearchForm from './JobSearchForm'
import { filterJobs } from './jobsData'
import type { WorkMode } from './jobsData'
import JobsShell from './JobsShell'
import { useSavedJobs } from './useSavedJobs'

function parseWorkMode(value: string | null): WorkMode | 'All' {
  if (value === 'Remote' || value === 'Hybrid' || value === 'On-site') return value
  return 'All'
}

export default function JobsSearch() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const location = params.get('location') ?? ''
  const mode = parseWorkMode(params.get('mode'))
  const results = filterJobs(query, location, mode)
  const { savedJobs, toggleSavedJob } = useSavedJobs()

  function search(nextQuery: string, nextLocation: string, nextMode: WorkMode | 'All') {
    const next = new URLSearchParams()
    if (nextQuery) next.set('q', nextQuery)
    if (nextLocation) next.set('location', nextLocation)
    if (nextMode !== 'All') next.set('mode', nextMode)
    setParams(next)
  }

  return (
    <JobsShell>
      <main className="jobs-main">
        <header className="jobs-page-head"><p className="jobs-eyebrow">Search opportunities</p><h1>Jobs for your next move</h1><p>Filter by role, company, location or work mode.</p></header>
        <JobSearchForm key={params.toString()} initialQuery={query} initialLocation={location} initialMode={mode} onSearch={search} compact />
        <div className="jobs-result-layout">
          <aside className="jobs-filter-panel"><h2>Active filters</h2><dl><div><dt>Keywords</dt><dd>{query || 'Any role or skill'}</dd></div><div><dt>Location</dt><dd>{location || 'All locations'}</dd></div><div><dt>Work mode</dt><dd>{mode}</dd></div></dl></aside>
          <section aria-live="polite">
            <div className="jobs-results-meta"><strong>{results.length} jobs found</strong><span>Most relevant</span></div>
            {results.length > 0 ? <div className="jobs-results-list">{results.map((job) => <JobCard key={job.slug} job={job} saved={savedJobs.includes(job.slug)} onToggleSaved={toggleSavedJob} />)}</div> : <div className="jobs-empty"><SearchX aria-hidden="true" /><h2>No matching jobs</h2><p>Try a broader role, another location or any work mode.</p></div>}
          </section>
        </div>
      </main>
    </JobsShell>
  )
}
