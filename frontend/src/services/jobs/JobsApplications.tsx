import { BriefcaseBusiness, CalendarDays, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import JobsShell from './JobsShell'
import { jobBySlug } from './jobsData'
import { JOB_APPLICATIONS } from './jobsPortalData'

const APPLICATION_STEPS = ['Submitted', 'Viewed', 'Shortlisted', 'Interview'] as const

export default function JobsApplications() {
  return (
    <JobsShell>
      <main className="jobs-main">
        <header className="jobs-page-head"><p className="jobs-eyebrow">Your progress</p><h1>Applications</h1><p>Follow each application from submission through the next hiring step.</p></header>
        <div className="application-list">
          {JOB_APPLICATIONS.map((application) => {
            const job = jobBySlug(application.jobSlug)
            const activeIndex = APPLICATION_STEPS.indexOf(application.status)
            return (
              <article className="application-card" key={application.id}>
                <header><div><span>{application.company}</span><h2>{job ? <Link to={`/jobs/${job.slug}`}>{job.title}</Link> : 'Position unavailable'}</h2></div><strong>{application.status}</strong></header>
                <div className="application-meta"><span><CalendarDays aria-hidden="true" /> Applied {application.appliedDate}</span><span><BriefcaseBusiness aria-hidden="true" /> {application.id}</span></div>
                <ol className="application-progress" aria-label={`Application status: ${application.status}`}>{APPLICATION_STEPS.map((step, index) => <li className={index <= activeIndex ? 'is-complete' : ''} key={step}><span>{index <= activeIndex ? <CheckCircle2 aria-hidden="true" /> : index + 1}</span>{step}</li>)}</ol>
                <p className="application-next"><strong>Next:</strong> {application.nextStep}</p>
              </article>
            )
          })}
        </div>
      </main>
    </JobsShell>
  )
}
