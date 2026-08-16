import { Building2, MapPin, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import JobsShell from './JobsShell'
import { COMPANY_PROFILES } from './jobsPortalData'

export default function JobsCompanies() {
  return (
    <JobsShell>
      <main className="jobs-main">
        <header className="jobs-page-head"><p className="jobs-eyebrow">Know where you apply</p><h1>Explore companies</h1><p>Compare industries, locations, team size and open roles before making your move.</p></header>
        <div className="company-grid">
          {COMPANY_PROFILES.map((company) => (
            <article className="company-card" key={company.slug}>
              <header><span className="job-company-logo" aria-hidden="true">{company.initials}</span><div><h2><Link to={`/jobs/companies/${company.slug}`}>{company.name}</Link></h2><p>{company.industry}</p></div>{company.verified && <ShieldCheck aria-label="Verified employer" />}</header>
              <p>{company.about}</p>
              <div className="company-facts"><span><Users aria-hidden="true" /> {company.size}</span><span><MapPin aria-hidden="true" /> {company.locations.join(', ')}</span></div>
              <Link className="company-open-link" to={`/jobs/companies/${company.slug}`}><Building2 aria-hidden="true" /> {company.openJobSlugs.length} open role{company.openJobSlugs.length === 1 ? '' : 's'}</Link>
            </article>
          ))}
        </div>
      </main>
    </JobsShell>
  )
}
