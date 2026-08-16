export type CompanyProfile = {
  readonly slug: string
  readonly name: string
  readonly initials: string
  readonly industry: string
  readonly size: string
  readonly locations: readonly string[]
  readonly about: string
  readonly benefits: readonly string[]
  readonly openJobSlugs: readonly string[]
  readonly verified: boolean
}

export type ApplicationStatus = 'Submitted' | 'Viewed' | 'Shortlisted' | 'Interview'

export type JobApplication = {
  readonly id: string
  readonly jobSlug: string
  readonly company: string
  readonly appliedDate: string
  readonly status: ApplicationStatus
  readonly nextStep: string
}

export const COMPANY_PROFILES: readonly CompanyProfile[] = [
  { slug: 'northstar-digital', name: 'Northstar Digital', initials: 'ND', industry: 'Software Products', size: '501-1,000 employees', locations: ['Gurugram', 'Bengaluru'], about: 'Northstar Digital builds secure workflow platforms for finance, retail and logistics teams operating at national scale.', benefits: ['Flexible hybrid schedule', 'Learning budget', 'Comprehensive health cover'], openJobSlugs: ['senior-dotnet-developer-northstar'], verified: true },
  { slug: 'atlas-commerce', name: 'Atlas Commerce', initials: 'AC', industry: 'Retail Technology', size: '201-500 employees', locations: ['Bengaluru', 'Remote - India'], about: 'Atlas Commerce gives growing retailers practical tools for storefronts, inventory, payments and customer operations.', benefits: ['Flexible hours', 'Home-office allowance', 'Quarterly learning days'], openJobSlugs: ['frontend-engineer-atlas'], verified: true },
  { slug: 'cloudcraft-systems', name: 'CloudCraft Systems', initials: 'CS', industry: 'Cloud Services', size: '201-500 employees', locations: ['Hyderabad', 'Remote - India'], about: 'CloudCraft helps engineering organisations run dependable cloud platforms with strong automation and observability.', benefits: ['Remote-first team', 'Certification support', 'On-call allowance'], openJobSlugs: ['devops-engineer-cloudcraft'], verified: true },
  { slug: 'saarthi-mobility', name: 'Saarthi Mobility', initials: 'SM', industry: 'Mobility', size: '1,001-5,000 employees', locations: ['Pune', 'Mumbai'], about: 'Saarthi Mobility operates connected transport networks and builds data products for safer, more predictable journeys.', benefits: ['Performance bonus', 'Commuter support', 'Health insurance'], openJobSlugs: ['data-analyst-saarthi'], verified: false },
  { slug: 'ledgerlane', name: 'LedgerLane', initials: 'LL', industry: 'Financial Technology', size: '51-200 employees', locations: ['Mumbai'], about: 'LedgerLane simplifies payment reconciliation and cash visibility for growing finance teams.', benefits: ['Employee stock options', 'Flexible leave', 'Wellness allowance'], openJobSlugs: ['product-manager-ledgerlane'], verified: true },
  { slug: 'veridian-health', name: 'Veridian Health', initials: 'VH', industry: 'Health Technology', size: '501-1,000 employees', locations: ['Chennai', 'Hyderabad'], about: 'Veridian Health creates dependable digital tools for clinicians, care teams and patients.', benefits: ['Medical cover', 'Flexible work week', 'Conference allowance'], openJobSlugs: ['qa-automation-engineer-veridian'], verified: true },
] as const

export const JOB_APPLICATIONS: readonly JobApplication[] = [
  { id: 'app-1042', jobSlug: 'frontend-engineer-atlas', company: 'Atlas Commerce', appliedDate: '14 Aug 2026', status: 'Interview', nextStep: 'Technical interview on 19 Aug' },
  { id: 'app-1038', jobSlug: 'senior-dotnet-developer-northstar', company: 'Northstar Digital', appliedDate: '12 Aug 2026', status: 'Shortlisted', nextStep: 'Recruiter will confirm interview availability' },
  { id: 'app-1029', jobSlug: 'product-manager-ledgerlane', company: 'LedgerLane', appliedDate: '8 Aug 2026', status: 'Viewed', nextStep: 'Application is under review' },
  { id: 'app-1017', jobSlug: 'devops-engineer-cloudcraft', company: 'CloudCraft Systems', appliedDate: '3 Aug 2026', status: 'Submitted', nextStep: 'Profile and resume submitted' },
] as const

export function companyBySlug(slug: string | undefined): CompanyProfile | null {
  return COMPANY_PROFILES.find((company) => company.slug === slug) ?? null
}
