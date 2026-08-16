export type WorkMode = 'Remote' | 'Hybrid' | 'On-site'
export type EmploymentType = 'Full-time' | 'Internship'

export type JobListing = {
  readonly slug: string
  readonly title: string
  readonly company: string
  readonly companyInitials: string
  readonly industry: string
  readonly location: string
  readonly experience: string
  readonly salary: string
  readonly workMode: WorkMode
  readonly employmentType: EmploymentType
  readonly skills: readonly string[]
  readonly posted: string
  readonly summary: string
  readonly responsibilities: readonly string[]
  readonly requirements: readonly string[]
  readonly benefits: readonly string[]
  readonly featured?: boolean
  readonly verified?: boolean
  readonly easyApply?: boolean
}

export const JOB_LISTINGS: readonly JobListing[] = [
  {
    slug: 'senior-dotnet-developer-northstar', title: 'Senior .NET Developer', company: 'Northstar Digital', companyInitials: 'ND', industry: 'Software Products',
    location: 'Gurugram', experience: '4-7 years', salary: '18-25 LPA', workMode: 'Hybrid', employmentType: 'Full-time',
    skills: ['C#', 'ASP.NET Core', 'SQL Server', 'Azure', 'React'], posted: '2 hours ago', featured: true, verified: true, easyApply: true,
    summary: 'Build secure, high-volume business platforms with a product engineering team focused on measurable customer outcomes.',
    responsibilities: ['Design and ship ASP.NET Core services', 'Review architecture and production performance', 'Mentor engineers through delivery'],
    requirements: ['Strong C# and .NET experience', 'Production SQL Server knowledge', 'Experience with cloud delivery and automated testing'],
    benefits: ['Flexible hybrid schedule', 'Learning budget', 'Comprehensive health cover'],
  },
  {
    slug: 'frontend-engineer-atlas', title: 'Frontend Engineer - React', company: 'Atlas Commerce', companyInitials: 'AC', industry: 'Retail Technology',
    location: 'Bengaluru', experience: '3-6 years', salary: '16-22 LPA', workMode: 'Hybrid', employmentType: 'Full-time',
    skills: ['React', 'TypeScript', 'Vite', 'Accessibility', 'Testing'], posted: '4 hours ago', verified: true, easyApply: true,
    summary: 'Create fast, accessible merchant experiences used by growing retail teams across India.',
    responsibilities: ['Own React features from discovery to release', 'Improve design-system primitives', 'Measure and improve runtime performance'],
    requirements: ['Advanced React and TypeScript', 'Strong CSS and accessibility fundamentals', 'Experience testing user-facing applications'],
    benefits: ['Flexible hours', 'Home-office allowance', 'Quarterly learning days'],
  },
  {
    slug: 'data-analyst-saarthi', title: 'Data Analyst', company: 'Saarthi Mobility', companyInitials: 'SM', industry: 'Mobility',
    location: 'Pune', experience: '2-4 years', salary: '10-15 LPA', workMode: 'On-site', employmentType: 'Full-time',
    skills: ['SQL', 'Power BI', 'Python', 'Statistics'], posted: 'Today', easyApply: true,
    summary: 'Turn operational and customer data into clear decisions for a rapidly expanding mobility network.',
    responsibilities: ['Build decision-ready dashboards', 'Investigate performance trends', 'Partner with operations leaders'],
    requirements: ['Strong SQL and Power BI', 'Clear analytical communication', 'Working knowledge of Python'],
    benefits: ['Performance bonus', 'Commuter support', 'Health insurance'],
  },
  {
    slug: 'devops-engineer-cloudcraft', title: 'DevOps Engineer', company: 'CloudCraft Systems', companyInitials: 'CS', industry: 'Cloud Services',
    location: 'Hyderabad', experience: '4-8 years', salary: '20-28 LPA', workMode: 'Remote', employmentType: 'Full-time',
    skills: ['Azure', 'Kubernetes', 'Terraform', 'Docker', 'GitHub Actions'], posted: 'Today', featured: true, verified: true,
    summary: 'Improve platform reliability and developer velocity across multi-region cloud environments.',
    responsibilities: ['Operate Kubernetes platforms', 'Automate infrastructure delivery', 'Lead reliability reviews'],
    requirements: ['Production Kubernetes experience', 'Infrastructure-as-code expertise', 'Strong incident response practice'],
    benefits: ['Remote-first team', 'Certification support', 'On-call allowance'],
  },
  {
    slug: 'product-manager-ledgerlane', title: 'Product Manager - Fintech', company: 'LedgerLane', companyInitials: 'LL', industry: 'Financial Technology',
    location: 'Mumbai', experience: '5-8 years', salary: '24-32 LPA', workMode: 'Hybrid', employmentType: 'Full-time',
    skills: ['Product Strategy', 'Payments', 'Analytics', 'B2B SaaS'], posted: '1 day ago', verified: true,
    summary: 'Lead payment and reconciliation workflows for finance teams managing complex business operations.',
    responsibilities: ['Set measurable product outcomes', 'Prioritise customer and compliance needs', 'Coordinate design and engineering delivery'],
    requirements: ['B2B product management experience', 'Understanding of payment systems', 'Strong written product communication'],
    benefits: ['Employee stock options', 'Flexible leave', 'Wellness allowance'],
  },
  {
    slug: 'qa-automation-engineer-veridian', title: 'QA Automation Engineer', company: 'Veridian Health', companyInitials: 'VH', industry: 'Health Technology',
    location: 'Chennai', experience: '3-5 years', salary: '12-18 LPA', workMode: 'Hybrid', employmentType: 'Full-time',
    skills: ['Playwright', 'TypeScript', 'API Testing', 'CI/CD'], posted: '1 day ago', easyApply: true,
    summary: 'Build reliable automated quality gates for patient and clinician applications.',
    responsibilities: ['Develop browser and API test suites', 'Improve release confidence metrics', 'Partner with engineers on testability'],
    requirements: ['Hands-on Playwright experience', 'Strong API testing fundamentals', 'Comfort with CI pipelines'],
    benefits: ['Medical cover', 'Flexible work week', 'Conference allowance'],
  },
  {
    slug: 'graduate-software-engineer-kite', title: 'Graduate Software Engineer', company: 'Kite Labs', companyInitials: 'KL', industry: 'Developer Tools',
    location: 'Noida', experience: '0-1 years', salary: '6-9 LPA', workMode: 'On-site', employmentType: 'Full-time',
    skills: ['JavaScript', 'TypeScript', 'Git', 'Problem Solving'], posted: '2 days ago', verified: true, easyApply: true,
    summary: 'Join a structured engineering programme covering frontend, backend and cloud delivery fundamentals.',
    responsibilities: ['Ship scoped product improvements', 'Participate in code reviews', 'Learn production support practices'],
    requirements: ['Computer science fundamentals', 'One completed software project', 'Clear learning mindset'],
    benefits: ['Six-month mentorship', 'Certification budget', 'Relocation support'],
  },
  {
    slug: 'ux-design-intern-studiofield', title: 'Product Design Intern', company: 'StudioField', companyInitials: 'SF', industry: 'Design Services',
    location: 'Remote - India', experience: '0 years', salary: '30,000/month', workMode: 'Remote', employmentType: 'Internship',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], posted: '2 days ago', easyApply: true,
    summary: 'Support research, interaction design and prototyping for practical business software.',
    responsibilities: ['Prepare prototypes and user flows', 'Document research findings', 'Contribute to shared design components'],
    requirements: ['A focused design portfolio', 'Strong visual hierarchy', 'Comfort receiving detailed critique'],
    benefits: ['Remote schedule', 'Senior designer mentorship', 'Completion certificate'],
  },
] as const

export function jobBySlug(slug: string | undefined): JobListing | null {
  return JOB_LISTINGS.find((job) => job.slug === slug) ?? null
}

export function filterJobs(query: string, location: string, mode: WorkMode | 'All'): readonly JobListing[] {
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedLocation = location.trim().toLowerCase()
  return JOB_LISTINGS.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.skills.join(' ')}`.toLowerCase()
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesLocation = !normalizedLocation || job.location.toLowerCase().includes(normalizedLocation)
    const matchesMode = mode === 'All' || job.workMode === mode
    return matchesQuery && matchesLocation && matchesMode
  })
}
