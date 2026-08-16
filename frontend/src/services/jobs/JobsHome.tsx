import { ArrowRight, BarChart3, Building2, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import JobCard from './JobCard'
import JobSearchForm from './JobSearchForm'
import { JOB_LISTINGS } from './jobsData'
import JobsShell from './JobsShell'
import { useSavedJobs } from './useSavedJobs'

const POPULAR_SEARCHES = ['React Developer', '.NET Developer', 'Data Analyst', 'DevOps Engineer'] as const

export default function JobsHome() {
  const navigate = useNavigate()
  const { savedJobs, toggleSavedJob } = useSavedJobs()
  const featuredJobs = JOB_LISTINGS.filter((job) => job.featured || job.verified).slice(0, 4)
  const remoteJobs = JOB_LISTINGS.filter((job) => job.workMode === 'Remote').slice(0, 2)

  function search(query: string, location: string, mode: 'All' | 'Remote' | 'Hybrid' | 'On-site') {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    if (mode !== 'All') params.set('mode', mode)
    navigate(`/jobs/search?${params.toString()}`)
  }

  return (
    <JobsShell>
      <section className="jobs-hero">
        <div className="jobs-hero-content">
          <p className="jobs-eyebrow">Work that moves you forward</p>
          <h1>Find the right role, not just another listing.</h1>
          <p className="jobs-hero-copy">Explore verified opportunities from product teams, growing businesses and established employers across India.</p>
          <JobSearchForm onSearch={search} />
          <div className="jobs-suggestions"><span>Popular:</span>{POPULAR_SEARCHES.map((item) => <Link key={item} to={`/jobs/search?q=${encodeURIComponent(item)}`}>{item}</Link>)}</div>
        </div>
      </section>

      <main className="jobs-main">
        <section className="jobs-trust-grid" aria-label="Portal highlights">
          <div><ShieldCheck aria-hidden="true" /><strong>Verified employers</strong><span>Clear trust signals on reviewed companies</span></div>
          <div><BarChart3 aria-hidden="true" /><strong>Useful job details</strong><span>Salary, experience and work mode upfront</span></div>
          <div><MapPin aria-hidden="true" /><strong>India-wide search</strong><span>On-site, hybrid and remote opportunities</span></div>
          <div><Building2 aria-hidden="true" /><strong>Real teams</strong><span>Original roles across diverse industries</span></div>
        </section>

        <section className="jobs-section">
          <header className="jobs-section-head"><div><h2>Featured opportunities</h2><p>Selected roles from active employers.</p></div><Link to="/jobs/search">View all jobs <ArrowRight aria-hidden="true" /></Link></header>
          <div className="jobs-grid">{featuredJobs.map((job) => <JobCard key={job.slug} job={job} saved={savedJobs.includes(job.slug)} onToggleSaved={toggleSavedJob} />)}</div>
        </section>

        <section className="jobs-section jobs-remote-section">
          <header className="jobs-section-head"><div><h2>Work from anywhere</h2><p>Remote roles open to professionals across India.</p></div><Link to="/jobs/search?mode=Remote">Browse remote jobs <ArrowRight aria-hidden="true" /></Link></header>
          <div className="jobs-grid">{remoteJobs.map((job) => <JobCard key={job.slug} job={job} saved={savedJobs.includes(job.slug)} onToggleSaved={toggleSavedJob} compact />)}</div>
        </section>
      </main>
    </JobsShell>
  )
}
