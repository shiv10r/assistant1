import { Bookmark, BookmarkCheck, Briefcase, MapPin, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JobListing } from './jobsData'

type JobCardProps = {
  readonly job: JobListing
  readonly saved: boolean
  readonly onToggleSaved: (slug: string) => void
  readonly compact?: boolean
}

export default function JobCard({ job, saved, onToggleSaved, compact = false }: JobCardProps) {
  return (
    <article className={compact ? 'job-card is-compact' : 'job-card'}>
      <header className="job-card-head">
        <span className="job-company-logo" aria-hidden="true">{job.companyInitials}</span>
        <div><h2><Link to={`/jobs/${job.slug}`}>{job.title}</Link></h2><p>{job.company}{job.verified && <span className="job-verified">Verified</span>}</p></div>
        <button className="job-save" type="button" onClick={() => onToggleSaved(job.slug)} aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}>
          {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
        </button>
      </header>
      <div className="job-facts">
        <span><Briefcase aria-hidden="true" /> {job.experience}</span>
        <span><WalletCards aria-hidden="true" /> {job.salary}</span>
        <span><MapPin aria-hidden="true" /> {job.location}</span>
      </div>
      {!compact && <p className="job-summary">{job.summary}</p>}
      <div className="job-skills">{job.skills.slice(0, compact ? 3 : 5).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <footer className="job-card-footer">
        <div><span>{job.workMode}</span><span>{job.employmentType}</span>{job.easyApply && <span>Easy apply</span>}</div>
        <span>{job.posted}</span>
      </footer>
    </article>
  )
}
