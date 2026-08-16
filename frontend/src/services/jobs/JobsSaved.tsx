import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import JobCard from './JobCard'
import { JOB_LISTINGS } from './jobsData'
import JobsShell from './JobsShell'
import { useSavedJobs } from './useSavedJobs'

export default function JobsSaved() {
  const { savedJobs, toggleSavedJob } = useSavedJobs()
  const listings = JOB_LISTINGS.filter((job) => savedJobs.includes(job.slug))

  return (
    <JobsShell>
      <main className="jobs-main">
        <header className="jobs-page-head"><p className="jobs-eyebrow">Your shortlist</p><h1>Saved jobs</h1><p>Keep strong opportunities together while you compare your next move.</p></header>
        {listings.length > 0 ? <div className="jobs-grid">{listings.map((job) => <JobCard key={job.slug} job={job} saved onToggleSaved={toggleSavedJob} />)}</div> : <section className="jobs-empty"><Bookmark aria-hidden="true" /><h2>No saved jobs yet</h2><p>Save roles from search results to build a focused shortlist.</p><Link to="/jobs/search">Search jobs</Link></section>}
      </main>
    </JobsShell>
  )
}
