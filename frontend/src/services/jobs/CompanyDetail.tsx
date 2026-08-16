import { ArrowLeft, MapPin, ShieldCheck, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import JobCard from './JobCard'
import JobsShell from './JobsShell'
import { JOB_LISTINGS } from './jobsData'
import { companyBySlug } from './jobsPortalData'
import { useSavedJobs } from './useSavedJobs'

export default function CompanyDetail() {
  const { companySlug } = useParams()
  const company = companyBySlug(companySlug)
  const { savedJobs, toggleSavedJob } = useSavedJobs()

  if (!company) return <JobsShell><main className="jobs-main"><section className="jobs-empty"><h1>Company not found</h1><p>This employer profile is not available.</p><Link to="/jobs/companies">Browse companies</Link></section></main></JobsShell>

  const jobs = JOB_LISTINGS.filter((job) => company.openJobSlugs.includes(job.slug))
  return (
    <JobsShell>
      <main className="jobs-main">
        <Link className="job-detail-back" to="/jobs/companies"><ArrowLeft aria-hidden="true" /> Back to companies</Link>
        <section className="company-profile">
          <header><span className="job-company-logo" aria-hidden="true">{company.initials}</span><div><p>{company.industry}{company.verified && <span className="job-verified"><ShieldCheck aria-hidden="true" /> Verified</span>}</p><h1>{company.name}</h1></div></header>
          <div className="company-profile-facts"><span><Users aria-hidden="true" /> {company.size}</span><span><MapPin aria-hidden="true" /> {company.locations.join(', ')}</span></div>
          <p className="company-about">{company.about}</p>
          <h2>Why people join</h2><ul>{company.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        </section>
        <section className="jobs-section"><header className="jobs-section-head"><div><h2>Open roles</h2><p>Current opportunities at {company.name}.</p></div></header><div className="jobs-grid">{jobs.map((job) => <JobCard key={job.slug} job={job} saved={savedJobs.includes(job.slug)} onToggleSaved={toggleSavedJob} />)}</div></section>
      </main>
    </JobsShell>
  )
}
