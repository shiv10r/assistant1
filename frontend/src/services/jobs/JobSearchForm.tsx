import { BriefcaseBusiness, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { WorkMode } from './jobsData'

type JobSearchFormProps = {
  readonly initialQuery?: string
  readonly initialLocation?: string
  readonly initialMode?: WorkMode | 'All'
  readonly onSearch: (query: string, location: string, mode: WorkMode | 'All') => void
  readonly compact?: boolean
}

export default function JobSearchForm({ initialQuery = '', initialLocation = '', initialMode = 'All', onSearch, compact = false }: JobSearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [mode, setMode] = useState<WorkMode | 'All'>(initialMode)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(query, location, mode)
  }

  return (
    <form className={compact ? 'job-search-form is-compact' : 'job-search-form'} onSubmit={submit}>
      <label className="job-search-field">
        <BriefcaseBusiness aria-hidden="true" />
        <span className="sr-only">Role, skill or company</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Role, skill or company" />
      </label>
      <label className="job-search-field">
        <MapPin aria-hidden="true" />
        <span className="sr-only">Location</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
      </label>
      <label className="job-search-field">
        <span className="sr-only">Work mode</span>
        <select value={mode} onChange={(event) => setMode(event.target.value as WorkMode | 'All')}>
          <option value="All">Any work mode</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
      </label>
      <button type="submit"><Search aria-hidden="true" /> Search jobs</button>
    </form>
  )
}
