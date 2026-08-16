import { ArrowLeft, Bookmark, BookmarkCheck, Briefcase, CheckCircle2, MapPin, WalletCards } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import JobCard from './JobCard'
import { JOB_LISTINGS, jobBySlug } from './jobsData'
import { findApplicationDraft, findCandidateApplication } from './candidateStore'
import JobsShell from './JobsShell'
import { useCandidateApplications } from './useCandidateApplications'
import { useSavedJobs } from './useSavedJobs'

export default function JobDetail() {
  const { slug } = useParams()
  const job = jobBySlug(slug)
  const { savedJobs, toggleSavedJob } = useSavedJobs()
  const { state } = useCandidateApplications()

  if (!job) return <JobsShell><main className="jobs-main"><section className="jobs-empty"><h1>Job not found</h1><p>This role may have closed or moved.</p><Link to="/jobs/search">Browse current jobs</Link></section></main></JobsShell>

  const saved = savedJobs.includes(job.slug)
  const application = findCandidateApplication(state, job.slug)
  const draft = findApplicationDraft(state, job.slug)
  const similar = JOB_LISTINGS.filter((item) => item.slug !== job.slug && (item.industry === job.industry || item.workMode === job.workMode)).slice(0, 2)

  return (
    <JobsShell>
      <main className="jobs-main">
        <Link className="job-detail-back" to="/jobs/search"><ArrowLeft aria-hidden="true" /> Back to search</Link>
        <div className="job-detail-layout">
          <article className="job-detail">
            <header className="job-detail-head"><span className="job-company-logo" aria-hidden="true">{job.companyInitials}</span><div><p>{job.company}{job.verified && <span className="job-verified">Verified</span>}</p><h1>{job.title}</h1><span>{job.industry}</span></div></header>
            <div className="job-detail-facts"><span><Briefcase aria-hidden="true" /> {job.experience}</span><span><WalletCards aria-hidden="true" /> {job.salary}</span><span><MapPin aria-hidden="true" /> {job.location}</span></div>
            <p className="job-detail-summary">{job.summary}</p>
            <DetailSection title="What you will do" items={job.responsibilities} />
            <DetailSection title="What you bring" items={job.requirements} />
            <DetailSection title="Benefits" items={job.benefits} />
            <section className="job-detail-section"><h2>Skills</h2><div className="job-skills">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
          </article>
          <aside className="job-apply-panel">
            <p>Posted {job.posted}</p>
            {application ? (
              <>
                <Link className="job-apply-button job-apply-button-link" to="/jobs/applications"><CheckCircle2 aria-hidden="true" /> {application.status}</Link>
                <p className="job-apply-note">You applied on {application.appliedDate}. Track the next hiring step in Applications.</p>
              </>
            ) : (
              <>
                <Link className="job-apply-button job-apply-button-link" to={`/jobs/${job.slug}/apply`}>{draft ? 'Resume application' : 'Apply now'}</Link>
                {draft && <p className="job-apply-note">You have a saved draft for this role. Resume where you left off.</p>}
              </>
            )}
            <button className="job-detail-save" type="button" onClick={() => toggleSavedJob(job.slug)}>{saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}{saved ? 'Saved' : 'Save job'}</button>
          </aside>
        </div>
        {similar.length > 0 && <section className="jobs-section"><header className="jobs-section-head"><div><h2>Similar jobs</h2><p>Related roles worth comparing.</p></div></header><div className="jobs-grid">{similar.map((item) => <JobCard key={item.slug} job={item} saved={savedJobs.includes(item.slug)} onToggleSaved={toggleSavedJob} compact />)}</div></section>}
      </main>
    </JobsShell>
  )
}

function DetailSection({ title, items }: { readonly title: string; readonly items: readonly string[] }) {
  return <section className="job-detail-section"><h2>{title}</h2><ul>{items.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" /> {item}</li>)}</ul></section>
}
