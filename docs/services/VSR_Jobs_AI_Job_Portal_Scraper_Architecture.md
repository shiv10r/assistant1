# VSR Jobs — AI Job Portal + Job Aggregator + Scraper Architecture

> Coding-agent-ready system design for a production-grade job portal with job aggregation, permitted career-site/ATS ingestion, AI-assisted matching, resume scoring, recruiter tools, alerts, subscriptions, moderation, and admin monitoring.
>
tec hstack  as current app  - fe react  backend .ent and db  post gres sql 

> **Important compliance rule:** only ingest jobs from sources you are authorized or permitted to access, public ATS feeds/APIs, RSS/XML/JSON feeds, sitemaps, company career pages that permit automated access, or sources with written permission. Do not bypass CAPTCHA, authentication, anti-bot controls, paywalls, or technical restrictions.

---

# 1. Product Vision

Build **VSR Jobs** as a complete employment marketplace and job aggregation platform connecting:

```text
Job Seekers
Recruiters
Companies
Platform Admins
Job Source Providers
Automated Ingestion Workers
AI/Matching Services
```

The platform should support:

```text
Job search
Advanced filters
Job detail pages
Easy Apply
External Apply
Saved jobs
Job alerts
Recommended jobs
Resume upload
Resume parsing
Resume scoring
AI job matching
Application tracking
Company profiles
Recruiter dashboard
Job posting
Applicant pipeline
Candidate search
Recruiter subscriptions
Featured jobs
Resume-access credits
Admin moderation
Scraper/source administration
Job ingestion monitoring
Duplicate detection
Automatic job expiry
SEO pages
Mobile/WebView support
```

---

# 2. High-Level Architecture

```text
                        ┌─────────────────────────┐
                        │      Job Sources        │
                        │ Company Sites / ATS     │
                        │ APIs / RSS / XML / JSON │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │ Source Adapter Layer    │
                        │ API / Feed / HTML       │
                        │ Sitemap / ATS adapters  │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │ Scraper Scheduler       │
                        │ Hangfire / Quartz.NET   │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │ Fetch + Parse Workers   │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │ Normalize / Validate    │
                        │ Map skills/locations    │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │ Deduplication Engine    │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │ Job Ingestion Service   │
                        │ Create / Update / Close │
                        └────────────┬────────────┘
                                     │
                                     ▼
┌──────────────────┐     ┌─────────────────────────┐
│ React Web App    │────▶│ ASP.NET Core Web API    │
│ Job Seeker       │     │ Modular Monolith        │
│ Recruiter        │     └────────────┬────────────┘
│ Admin            │                  │
└──────────────────┘                  ▼
                             ┌─────────────────┐
                             │   SQL Server    │
                             └─────────────────┘
                                     │
             ┌───────────────────────┼────────────────────────┐
             ▼                       ▼                        ▼
         Redis Cache           Object Storage          Search Engine
          optional              resumes/logos           later phase
```

---

# 3. Recommended Solution Structure

```text
vsr-jobs/
├── frontend/
│   └── vsr-jobs-web/
│
├── backend/
│   ├── VSR.Jobs.Api/
│   ├── VSR.Jobs.Application/
│   ├── VSR.Jobs.Domain/
│   ├── VSR.Jobs.Infrastructure/
│   ├── VSR.Jobs.Contracts/
│   ├── VSR.Jobs.BackgroundJobs/
│   ├── VSR.Jobs.Scraper/
│   └── VSR.Jobs.Tests/
│
├── database/
│   ├── migrations/
│   ├── seed/
│   └── scripts/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── scraper/
│
├── docker/
│   ├── api.Dockerfile
│   ├── scraper.Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

---

# 4. Backend Modules

```text
Identity
JobSeekers
Recruiters
Companies
Jobs
JobSearch
Applications
Resumes
Skills
Locations
Industries
Recommendations
SavedJobs
JobAlerts
CandidateSearch
Subscriptions
Payments
Notifications
Content
Admin
Audit

JobSources
ScraperScheduling
ScraperExecution
SourceAdapters
RawJobIngestion
JobNormalization
JobDeduplication
JobEnrichment
JobPublishing
JobFreshness
SourceHealth
ScraperLogs
```

---

# 5. Scraper Design Principles

The scraper must **not** be a giant generic HTML parser.

Use a source-adapter pattern:

```text
IJobSourceAdapter
├── ApiJobSourceAdapter
├── JsonFeedAdapter
├── XmlFeedAdapter
├── RssFeedAdapter
├── SitemapJobAdapter
├── GreenhouseAdapter
├── LeverAdapter
├── WorkdayPublicAdapter
├── SmartRecruitersAdapter
├── CompanyCareerPageAdapter
└── CustomAuthorizedAdapter
```

Each source has its own configuration and parsing rules.

---

# 6. Source Types

```text
Api
JsonFeed
XmlFeed
Rss
Sitemap
AtsPublicEndpoint
HtmlCareerPage
ManualImport
CsvImport
RecruiterPosted
PartnerFeed
```

Prefer sources in this order:

```text
1. Official public API
2. Official ATS JSON endpoint/feed
3. RSS/XML/JSON feed
4. Sitemap + structured job pages
5. Authorized HTML parsing
6. Manual import
```

---

# 7. Job Source Entity

```text
JobSource
--------
Id
Name
Slug
CompanyId nullable
SourceType
BaseUrl
FeedUrl nullable
CareersUrl nullable
AdapterKey
IsEnabled
IsAuthorized
AuthorizationNotes
RequestIntervalMinutes
MaxRequestsPerMinute
DefaultCountry
DefaultCurrency
UserAgent
LastSuccessfulRunAt
LastFailedRunAt
ConsecutiveFailures
HealthStatus
CreatedAt
UpdatedAt
```

HealthStatus:

```text
Healthy
Warning
Failing
Paused
Disabled
```

---

# 8. Source Configuration

Do not hardcode selectors inside controllers.

```text
JobSourceConfig
---------------
Id
JobSourceId
ConfigJson
Version
IsActive
CreatedAt
CreatedBy
```

Example:

```json
{
  "listingUrl": "https://example.com/careers",
  "jobLinkSelector": "a.job-card",
  "paginationMode": "next-link",
  "nextPageSelector": "a.next",
  "fields": {
    "title": ".job-title",
    "location": ".job-location",
    "description": ".job-description",
    "postedDate": "time"
  }
}
```

For ATS/API adapters, config should contain endpoint templates instead of CSS selectors.

---

# 9. Scraper Execution Flow

```text
Scheduler
   ↓
Load enabled source
   ↓
Check source policy/rate limit
   ↓
Acquire distributed lock
   ↓
Create ScrapeRun
   ↓
Fetch listing/feed
   ↓
Discover job references
   ↓
Fetch detail pages if needed
   ↓
Parse raw fields
   ↓
Store raw source payload
   ↓
Normalize
   ↓
Validate
   ↓
Deduplicate
   ↓
Create or update canonical Job
   ↓
Mark seen external IDs
   ↓
Expire/close jobs no longer present
   ↓
Update source health
   ↓
Publish metrics/logs
```

---

# 10. Scheduler Architecture

Recommended:

```text
Hangfire
```

Alternative:

```text
Quartz.NET
```

Recurring examples:

```text
Source A: every 30 minutes
Source B: every 2 hours
Source C: every 6 hours
Daily stale-job cleanup
Hourly alert processing
Nightly source-health summary
```

Do not run the scraper from an HTTP request.

---

# 11. Scraper Worker Design

```text
Scraper Worker
├── SourceScheduler
├── SourceRunCoordinator
├── RateLimiter
├── HttpFetcher
├── BrowserFetcher optional
├── Parser
├── RawPayloadStore
├── Normalizer
├── Deduplicator
├── Enricher
├── JobUpsertService
├── StaleJobDetector
└── MetricsReporter
```

Prefer normal HTTP clients.

Use browser automation only when permitted and genuinely required.

Do not attempt anti-bot evasion.

---

# 12. HTTP Fetcher

Use:

```text
IHttpClientFactory
Polly retry policies
Timeouts
Circuit breaker
Per-source rate limiting
Conditional GET
ETag
If-Modified-Since
Gzip/Brotli
```

Example policies:

```text
Request timeout: 20 seconds
Retry: 2-3 transient retries
429: respect Retry-After
5xx: exponential backoff
403: stop/review source
Repeated failure: auto-pause source
```

---

# 13. Source Adapter Contract

```csharp
public interface IJobSourceAdapter
{
    string AdapterKey { get; }

    Task<JobDiscoveryResult> DiscoverAsync(
        JobSource source,
        CancellationToken cancellationToken);

    Task<RawExternalJob?> FetchJobAsync(
        JobSource source,
        ExternalJobReference reference,
        CancellationToken cancellationToken);
}
```

Output:

```text
RawExternalJob
--------------
ExternalJobId
SourceUrl
ApplyUrl
Title
CompanyName
DescriptionHtml
DescriptionText
LocationText
Department
EmploymentType
WorkMode
SalaryText
PostedDate
ExpiryDate
SkillsText
MetadataJson
RawPayload
FetchedAt
```

---

# 14. Raw Job Storage

Never directly write scraped fields into the production Jobs table.

First store a traceable raw representation.

```text
RawExternalJobs
---------------
Id
JobSourceId
ExternalJobId
SourceUrl
ApplyUrl
RawTitle
RawCompany
RawLocation
RawDescription
RawSalary
RawPostedDate
PayloadHash
RawPayload
FetchedAt
FirstSeenAt
LastSeenAt
ProcessingStatus
ProcessingError
```

ProcessingStatus:

```text
New
Normalized
Duplicate
Published
Rejected
Error
```

---

# 15. Normalization Pipeline

Normalize:

```text
Title
Company
Location
Country
State
City
Employment type
Work mode
Experience
Salary
Currency
Skills
Description
Posted date
Expiry date
Apply URL
```

Pipeline:

```text
RawExternalJob
   ↓
Clean HTML
   ↓
Normalize whitespace
   ↓
Normalize title
   ↓
Map company
   ↓
Parse location
   ↓
Map skills
   ↓
Parse employment type
   ↓
Parse experience
   ↓
Parse salary
   ↓
Validate URLs
   ↓
CanonicalExternalJob
```

---

# 16. Title Normalization

Examples:

```text
Sr. Software Engineer
Senior Software Engineer
S/W Engineer - Senior
```

Canonical title may become:

```text
Senior Software Engineer
```

Keep both:

```text
OriginalTitle
NormalizedTitle
```

Never overwrite the source title permanently.

---

# 17. Company Resolution

Strategy:

```text
Exact normalized company name
↓
Known alias lookup
↓
Website/domain match
↓
Company slug match
↓
Create Pending Company record
↓
Admin review if uncertain
```

Tables:

```text
Companies
CompanyAliases
CompanyDomains
```

---

# 18. Location Normalization

Parse:

```text
Gurugram
Gurgaon
Gurgaon, Haryana
Gurgaon / Hybrid
Bangalore
Bengaluru
Remote - India
```

Canonical:

```text
CityId
StateId
CountryId
WorkMode
RawLocationText
```

---

# 19. Skill Extraction

MVP:

```text
Dictionary/keyword based
```

Later:

```text
LLM-assisted extraction
Embedding similarity
Taxonomy mapping
```

Tables:

```text
Skills
SkillAliases
JobSkills
```

Example aliases:

```text
dotnet
.NET
.NET Core
ASP.NET Core
C Sharp
C#
ReactJS
React.js
React
```

---

# 20. Duplicate Detection

A single job may appear:

```text
on company career site
on ATS endpoint
in partner feed
on recruiter portal
```

Create one canonical job where possible.

Dedup signals:

```text
External source + ExternalJobId
Canonical Apply URL
Company + normalized title + location
Description fingerprint
Source URL hash
Posting date proximity
```

Suggested scoring:

```text
ExternalJobId exact                  100
Apply URL exact                       95
Company + title + location exact      85
Description hash exact                80
Company + title + location fuzzy      70
```

Threshold:

```text
>= 90 automatic merge
75-89 probable duplicate
< 75 separate record
```

---

# 21. Job Fingerprint

Create deterministic fingerprint:

```text
SHA256(
  NormalizedCompany
  + NormalizedTitle
  + NormalizedLocation
  + NormalizedDescriptionSnippet
)
```

Keep:

```text
CanonicalFingerprint
SourceFingerprint
```

---

# 22. Canonical Job Model

```text
Jobs
----
Id
Slug
JobCode
CompanyId
RecruiterId nullable

Title
OriginalTitle
NormalizedTitle

DepartmentId nullable
RoleCategoryId nullable

EmploymentType
WorkMode

MinExperience
MaxExperience

MinSalary
MaxSalary
Currency
SalaryVisible

Description
Responsibilities
Requirements
Benefits

ApplicationMode
ExternalApplyUrl

SourceType
PrimaryJobSourceId nullable
IsAggregated
ExternalJobId nullable
OriginalSourceUrl nullable

Status
PublishedAt
PostedAtSource
ExpiresAt
LastSeenAtSource

IsFeatured
FeaturedFrom
FeaturedUntil

CreatedAt
UpdatedAt
RowVersion
```

---

# 23. Job Source Mapping

```text
JobSourceMappings
-----------------
Id
JobId
JobSourceId
ExternalJobId
SourceUrl
ApplyUrl
FirstSeenAt
LastSeenAt
IsPrimary
IsActive
PayloadHash
```

This allows one canonical job to map to multiple external sources.

---

# 24. Job Freshness

Every ingestion run updates:

```text
LastSeenAt
```

Stale policy:

```text
Not seen for 24h → still active
Not seen for 3 runs → warning
Not seen for 48-72h → recheck
Source confirms 404/closed → close
Expiry date passed → expire
```

Do not instantly remove jobs after one failed scrape.

---

# 25. Job Statuses

```text
Draft
PendingReview
Published
Paused
Closed
Expired
Rejected
Archived
```

For aggregated jobs:

```text
PendingNormalization
PendingModeration
Published
Stale
ClosedAtSource
Rejected
```

---

# 26. Scrape Run Entity

```text
ScrapeRuns
----------
Id
JobSourceId
StartedAt
CompletedAt
Status
TriggeredBy
JobsDiscovered
JobsFetched
JobsCreated
JobsUpdated
JobsUnchanged
JobsDuplicate
JobsRejected
JobsClosed
HttpRequests
HttpErrors
ParseErrors
DurationMs
ErrorSummary
CorrelationId
```

Statuses:

```text
Queued
Running
Succeeded
PartiallySucceeded
Failed
Cancelled
```

---

# 27. Scraper Logs

```text
ScrapeLogs
----------
Id
ScrapeRunId
Level
EventType
Message
Url
ExternalJobId
HttpStatusCode
ExceptionType
MetadataJson
CreatedAt
```

Do not store secrets or private tokens in logs.

---

# 28. Source Health Dashboard

Admin should see:

```text
Source Name
Adapter
Status
Last Successful Run
Last Failed Run
Jobs Last Run
New Jobs
Updated Jobs
Closed Jobs
Error Rate
Average Duration
Consecutive Failures
Next Run
```

Actions:

```text
Run now
Pause source
Enable source
Edit interval
Edit configuration
View logs
Test parser
View raw sample
Reprocess failed jobs
```

---

# 29. Admin Source Management UI

Routes:

```text
/admin/job-sources
/admin/job-sources/new
/admin/job-sources/:id
/admin/job-sources/:id/edit
/admin/job-sources/:id/runs
/admin/job-sources/:id/logs
/admin/job-sources/:id/raw-jobs
/admin/scraper-dashboard
/admin/ingestion-queue
/admin/duplicates
```

---

# 30. Scraper Dashboard UI

Cards:

```text
Enabled Sources
Healthy Sources
Failing Sources
Jobs Imported Today
Jobs Updated Today
Jobs Closed Today
Duplicates Detected
Parse Errors
HTTP Errors
Average Run Time
```

Charts:

```text
Imported jobs over time
Source success rate
Errors by source
Jobs by source
Duplicate rate
Stale jobs
```

---

# 31. Job Seeker Frontend

Routes:

```text
/
/jobs
/jobs/:slug
/companies
/companies/:slug
/jobs-by-skill/:slug
/jobs-by-location/:slug
/jobs-by-category/:slug
/freshers
/remote-jobs
/walk-in-jobs
/login
/register
/profile
/profile/edit
/profile/resume
/applications
/saved-jobs
/job-alerts
/recommended-jobs
/settings
```

---

# 32. Home Page

```text
Header
Hero Search
Popular Searches
Recommended Jobs
Latest Jobs
Jobs by Role
Jobs by Skill
Jobs by Location
Top Companies
Remote Jobs
Fresher Jobs
Featured Employers
Career Resources
Recruiter CTA
Footer
```

---

# 33. Search Page

Desktop:

```text
┌──────────────────────┬────────────────────────────────┐
│ Filters              │ Results                        │
│                      │                                │
│ Experience           │ Job Card                       │
│ Salary               │ Job Card                       │
│ Location             │ Job Card                       │
│ Work Mode            │ Job Card                       │
│ Job Type             │ Job Card                       │
│ Company              │ Job Card                       │
│ Industry             │ Job Card                       │
│ Skills               │                                │
│ Posted Date          │ Pagination                     │
└──────────────────────┴────────────────────────────────┘
```

Mobile:

```text
Search Bar
[Filters] [Sort]
Job Cards
Pagination / Infinite Load
```

Use server-side pagination.

---

# 34. Aggregated Job Card

Display:

```text
Company Logo
Job Title
Company Name
Experience
Salary if available
Location
Work mode
Skills
Posted date
Save
Apply
```

Optional source information:

```text
Listed from company career site
External Apply
```

Do not clutter the card with scraper technical details.

---

# 35. Job Detail Page

```text
Job Header
Company
Experience
Salary
Location
Work Mode
Posted Date
Skills
Description
Responsibilities
Requirements
Benefits
About Company
Similar Jobs
Apply Panel
```

For external jobs:

```text
[Apply on Company Website]
```

Record outbound click before redirect.

---

# 36. External Apply Tracking

```text
ExternalApplyClicks
-------------------
Id
JobId
UserId nullable
SessionId
SourceId nullable
ClickedAt
Referrer
DeviceType
```

Flow:

```text
User clicks Apply
↓
POST /api/v1/jobs/{id}/external-click
↓
Backend validates URL
↓
Record event
↓
Return safe redirect URL
↓
Frontend redirects
```

Never redirect to arbitrary unvalidated user input.

---

# 37. Job Alerts

Alert criteria:

```text
Keyword
Skills
Location
Experience
Salary
WorkMode
EmploymentType
PostedWithin
Frequency
```

Frequency:

```text
Instant
Daily
Weekly
```

Job Alert Worker:

```text
Load active alerts
↓
Find new matching jobs
↓
Exclude previously sent jobs
↓
Create notification
↓
Send email/push
↓
Store delivery history
```

---

# 38. Alert Delivery Tables

```text
JobAlerts
JobAlertMatches
NotificationDeliveries
```

Unique rule:

```text
(JobAlertId, JobId)
```

prevents duplicate alerts.

---

# 39. AI Job Matching

MVP scoring:

```text
Skills             35%
Role/title          20%
Location            15%
Experience          15%
Salary               5%
Work mode            5%
Freshness            5%
```

Return explainable result:

```text
87% Match

Matched:
.NET
React
SQL Server
Azure
Gurgaon

Difference:
Role asks 5+ years
Your profile has 4 years
```

Never present AI scoring as a guarantee of selection.

---

# 40. Resume Architecture

Uploads:

```text
PDF
DOC
DOCX
```

Store:

```text
Object Storage
```

Metadata:

```text
Resumes
-------
Id
UserId
FileName
StoragePath
ContentType
Size
IsPrimary
UploadedAt
ParsedAt
ParseStatus
```

---

# 41. Resume Parsing Pipeline

```text
Upload
↓
Malware scan hook
↓
Text extraction
↓
Section detection
↓
Skill extraction
↓
Experience extraction
↓
Education extraction
↓
Profile suggestions
↓
User review
↓
Save approved changes
```

Do not auto-modify the user's profile without review.

---

# 42. Resume Score

Score categories:

```text
Profile completeness
Contact information
Summary
Skills coverage
Experience details
Education
Projects
Formatting quality
Keyword coverage for selected job
```

Example:

```text
Overall Resume Score: 78/100

Profile Completeness       90
Skills Coverage            82
Experience Detail          75
Job Keyword Match          71
Formatting                 80
```

---

# 43. Recruiter Frontend

Routes:

```text
/recruiter
/recruiter/jobs
/recruiter/jobs/new
/recruiter/jobs/:id
/recruiter/jobs/:id/edit
/recruiter/jobs/:id/applicants
/recruiter/applicants/:applicationId
/recruiter/candidates
/recruiter/saved-candidates
/recruiter/company
/recruiter/team
/recruiter/plans
/recruiter/billing
/recruiter/reports
/recruiter/settings
```

---

# 44. Recruiter Dashboard

Metrics:

```text
Active Jobs
Applications Today
Total Applicants
Shortlisted
Interviews
Offers
Hires
Job Views
Candidate Searches
Resume Views
Plan Usage
```

Charts:

```text
Applications trend
Hiring funnel
Top jobs
Applicant sources
```

---

# 45. Recruiter Job Posting

Wizard:

```text
1. Job Basics
2. Experience & Salary
3. Location & Work Mode
4. Skills
5. Description
6. Screening Questions
7. Company
8. Preview
9. Publish
```

Recruiter jobs should have:

```text
SourceType = RecruiterPosted
IsAggregated = false
```

---

# 46. Recruiter Subscription Model

Possible plan dimensions:

```text
Active job posts
Job post credits
Featured job credits
Candidate searches
Resume views
Candidate contact unlocks
Recruiter seats
Validity
```

Tables:

```text
Plans
PlanFeatures
Subscriptions
UsageCounters
Payments
Invoices
```

Do not hardcode pricing in React.

---

# 47. Candidate Search

Recruiter filters:

```text
Skills
Designation
Experience
Location
Current Company
Education
Salary
Notice Period
Last Active
Profile Freshness
```

Privacy rules apply before returning results.

---

# 48. Candidate Privacy

Settings:

```text
Profile searchable
Hide current employer
Hide salary
Hide phone/email
Block specific companies
Hide from all recruiters
```

Contact details require permission/plan entitlement.

---

# 49. Application Flow

Easy Apply:

```text
Job Detail
↓
Select Resume
↓
Answer Screening Questions
↓
Review
↓
Submit
↓
Application Created
↓
Recruiter Notification
```

External Apply:

```text
Job Detail
↓
Record External Apply Click
↓
Redirect to Company/ATS
```

---

# 50. Application Statuses

```text
Submitted
Viewed
Shortlisted
Assessment
Interview
Offer
Hired
Rejected
Withdrawn
```

Every status change creates immutable history.

---

# 51. Main Database Tables

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens

JobSeekerProfiles
WorkExperiences
Educations
Skills
SkillAliases
UserSkills
Projects
Certifications
Resumes
JobPreferences

RecruiterProfiles
Companies
CompanyAliases
CompanyDomains
CompanyLocations
CompanyMedia
CompanyRecruiters

Jobs
JobLocations
JobSkills
JobEducations
ScreeningQuestions
JobViews
ExternalApplyClicks

Applications
ApplicationAnswers
ApplicationStatusHistory
Interviews

SavedJobs
JobAlerts
JobAlertMatches
SavedCandidates
CandidateViews

Plans
PlanFeatures
Subscriptions
UsageCounters
Payments
Invoices

Notifications
NotificationDeliveries
SupportTickets
AuditLogs

Locations
Industries
Departments
RoleCategories

JobSources
JobSourceConfigs
ScrapeRuns
ScrapeLogs
RawExternalJobs
JobSourceMappings
DuplicateCandidates
IngestionErrors
```

---

# 52. Scraper-Specific Indexes

```text
JobSources(IsEnabled, HealthStatus)
ScrapeRuns(JobSourceId, StartedAt DESC)
RawExternalJobs(JobSourceId, ExternalJobId)
RawExternalJobs(PayloadHash)
RawExternalJobs(ProcessingStatus, FetchedAt)
JobSourceMappings(JobSourceId, ExternalJobId) UNIQUE
JobSourceMappings(JobId, IsActive)
Jobs(Status, PublishedAt DESC)
Jobs(PrimaryJobSourceId, LastSeenAtSource)
Jobs(CanonicalFingerprint)
```

---

# 53. Public API

Base:

```text
/api/v1
```

Public:

```text
GET /jobs
GET /jobs/{slug}
GET /companies
GET /companies/{slug}
GET /skills
GET /locations
GET /industries
GET /job-categories
```

---

# 54. Job Seeker API

```text
GET    /me/profile
PUT    /me/profile
POST   /me/resumes
GET    /me/resumes
DELETE /me/resumes/{id}

POST   /jobs/{id}/apply
POST   /jobs/{id}/external-click

GET    /me/applications
GET    /me/applications/{id}

POST   /me/saved-jobs/{jobId}
DELETE /me/saved-jobs/{jobId}
GET    /me/saved-jobs

GET    /me/job-alerts
POST   /me/job-alerts
PUT    /me/job-alerts/{id}
DELETE /me/job-alerts/{id}

GET    /me/recommended-jobs
POST   /me/resume-score
POST   /me/job-match/{jobId}
```

---

# 55. Recruiter API

```text
GET    /recruiter/dashboard

GET    /recruiter/jobs
POST   /recruiter/jobs
GET    /recruiter/jobs/{id}
PUT    /recruiter/jobs/{id}
POST   /recruiter/jobs/{id}/publish
POST   /recruiter/jobs/{id}/close

GET    /recruiter/jobs/{id}/applications
GET    /recruiter/applications/{id}
PATCH  /recruiter/applications/{id}/status

GET    /recruiter/candidates
POST   /recruiter/saved-candidates/{candidateId}
DELETE /recruiter/saved-candidates/{candidateId}

GET    /recruiter/usage
GET    /recruiter/subscription
```

---

# 56. Admin Scraper API

```text
GET    /admin/job-sources
POST   /admin/job-sources
GET    /admin/job-sources/{id}
PUT    /admin/job-sources/{id}
POST   /admin/job-sources/{id}/enable
POST   /admin/job-sources/{id}/pause
POST   /admin/job-sources/{id}/run-now

GET    /admin/job-sources/{id}/runs
GET    /admin/scrape-runs/{runId}
GET    /admin/scrape-runs/{runId}/logs

GET    /admin/raw-jobs
GET    /admin/raw-jobs/{id}
POST   /admin/raw-jobs/{id}/reprocess

GET    /admin/duplicates
POST   /admin/duplicates/{id}/merge
POST   /admin/duplicates/{id}/keep-separate

GET    /admin/scraper-dashboard
GET    /admin/source-health
```

---

# 57. Admin Permissions

```text
source.view
source.create
source.edit
source.enable
source.pause
source.run

scraper.logs.view
scraper.raw.view
scraper.reprocess

duplicate.view
duplicate.merge

job.moderate
job.publish
job.reject

company.verify
recruiter.suspend

audit.view
```

---

# 58. Authentication

Initial:

```text
Email + Password
JWT Access Token
Refresh Token Rotation
```

Later:

```text
Google
Microsoft
Phone OTP
```

Scraper workers use service credentials, not human JWTs.

---

# 59. Rate Limiting

Application API:

```text
Public search
Login
Registration
Resume upload
Candidate search
External apply tracking
```

Scraper:

```text
Per-source request rate
Global worker concurrency
Per-domain concurrency
429 backoff
```

Never use aggressive concurrency against a source.

---

# 60. Scraper Concurrency

Suggested defaults:

```text
Global workers: 5
Per-domain concurrency: 1-2
Per-source concurrency: configurable
```

Use a distributed lock:

```text
scraper:source:{sourceId}
```

to prevent duplicate runs.

---

# 61. Caching

Redis optional.

Cache:

```text
Popular jobs
Popular companies
Skill lists
Location lists
Search facets
Source rate-limit counters
Distributed locks
```

Do not use cache as the system of record.

---

# 62. Search Architecture

MVP:

```text
SQL Server
Normalized skills
Normalized locations
Indexed filters
Full-text search optional
```

Later:

```text
Azure AI Search
Elasticsearch
OpenSearch
```

Searchable:

```text
Title
Description
Skills
Company
Location
Role
Industry
```

---

# 63. AI/Embedding Upgrade

Later architecture:

```text
Canonical Job
↓
Job Embedding Worker
↓
Vector Store

Resume/Profile
↓
Candidate Embedding Worker
↓
Vector Store

Query:
Candidate Embedding
↓
Vector Similarity
↓
Rule-based filters
↓
Reranking
↓
Explanation
```

Keep deterministic filters for:

```text
Location
Experience
Salary
Work authorization
Employment type
```

---

# 64. Notification Architecture

Channels:

```text
In-app
Email
Push
SMS later
WhatsApp later
```

Events:

```text
JobAlertMatched
ApplicationSubmitted
ApplicationViewed
CandidateShortlisted
InterviewScheduled
OfferUpdated
JobExpiring
SourceFailed
SourceRecovered
SubscriptionUsageWarning
```

---

# 65. Background Jobs

```text
ScrapeSourceJob
NormalizeRawJobsJob
DeduplicateJobsJob
ReprocessFailedJobsJob
StaleJobCleanupJob
JobExpiryJob
JobAlertMatchingJob
NotificationDeliveryJob
ResumeParsingJob
ResumeScoringJob
SearchIndexSyncJob
SourceHealthCheckJob
UsageResetJob
```

---

# 66. Queue Design

MVP can run through Hangfire queues:

```text
critical
scraper
normalization
notifications
ai
maintenance
```

Example:

```text
scraper:      Fetch source jobs
normalization: Parse/normalize
ai:           Resume/job matching
notifications: Send alerts
maintenance:  Cleanup/expiry
```

---

# 67. Reliability

Every scraper stage should be idempotent.

If the same job is processed twice:

```text
do not create duplicate Jobs
do not duplicate alerts
do not duplicate source mappings
```

Use unique constraints.

---

# 68. Error Handling

Categories:

```text
NetworkError
Timeout
RateLimited
Forbidden
ParserError
ValidationError
NormalizationError
DuplicateError
DatabaseError
UnknownError
```

Store recoverable ingestion failures.

```text
IngestionErrors
---------------
Id
RawExternalJobId
JobSourceId
ErrorCode
Message
RetryCount
NextRetryAt
ResolvedAt
CreatedAt
```

---

# 69. Source Failure Policy

```text
1 failure    → log
2 failures   → warning
3 failures   → health = Failing
5 failures   → auto-pause optional
403/401      → immediate review
429          → reduce frequency
parser zero jobs unexpectedly → warning
```

Admin gets notification.

---

# 70. Parser Regression Detection

Detect suspicious changes:

```text
Source usually returns 300 jobs
Current run returns 0 jobs
```

Do not immediately close 300 jobs.

Mark run:

```text
Suspicious
```

Require:

```text
second successful empty run
or manual confirmation
```

before mass closure.

---

# 71. Scraper Test Harness

Create:

```text
VSR.Jobs.Scraper.Tests
```

Tests:

```text
adapter discovery
detail parsing
date parsing
salary parsing
location parsing
skill normalization
duplicate detection
HTML fixture parsing
JSON feed parsing
404/429 handling
zero-job regression
```

Store sanitized source fixtures.

---

# 72. Frontend Folder Structure

```text
frontend/vsr-jobs-web/src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── config/
│   └── store/
├── assets/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── cards/
│   ├── forms/
│   ├── search/
│   ├── recruiter/
│   ├── admin/
│   └── shared/
├── features/
│   ├── auth/
│   ├── home/
│   ├── jobs/
│   ├── companies/
│   ├── profile/
│   ├── resumes/
│   ├── applications/
│   ├── saved-jobs/
│   ├── alerts/
│   ├── recommendations/
│   ├── recruiter/
│   ├── subscriptions/
│   ├── admin/
│   ├── job-sources/
│   ├── scraper-dashboard/
│   ├── scrape-runs/
│   └── duplicates/
├── services/
├── hooks/
├── lib/
├── types/
├── main.tsx
└── App.tsx
```

---

# 73. Recommended Frontend Packages

```text
React
TypeScript
Vite
React Router
TanStack Query
Zustand
React Hook Form
Zod
Tailwind CSS
shadcn/ui
Lucide React
Recharts
Sonner
date-fns
```

---

# 74. Backend Solution Structure

```text
backend/
├── VSR.Jobs.Api/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Filters/
│   ├── Authorization/
│   └── Program.cs
│
├── VSR.Jobs.Application/
│   ├── Abstractions/
│   ├── Features/
│   ├── Jobs/
│   ├── JobSources/
│   ├── Scraper/
│   ├── Applications/
│   ├── Recruiters/
│   ├── Notifications/
│   └── Common/
│
├── VSR.Jobs.Domain/
│   ├── Entities/
│   ├── Enums/
│   ├── ValueObjects/
│   └── Events/
│
├── VSR.Jobs.Infrastructure/
│   ├── Persistence/
│   ├── Storage/
│   ├── Email/
│   ├── Search/
│   ├── Caching/
│   └── Security/
│
├── VSR.Jobs.Scraper/
│   ├── Adapters/
│   ├── Fetching/
│   ├── Parsing/
│   ├── Normalization/
│   ├── Deduplication/
│   ├── Scheduling/
│   └── Workers/
│
├── VSR.Jobs.BackgroundJobs/
│   ├── Jobs/
│   ├── Queues/
│   └── Configuration/
│
├── VSR.Jobs.Contracts/
└── VSR.Jobs.Tests/
```

---

# 75. Infrastructure Interfaces

```text
IJobSourceAdapter
IJobSourceRepository
IScrapeRunRepository
IRawExternalJobRepository
IJobNormalizer
IJobDeduplicator
IJobIngestionService
IJobFreshnessService
ISourceHealthService
IResumeParser
IResumeScorer
IJobMatcher
INotificationSender
IFileStorage
ISearchService
ICacheService
IAuditService
```

---

# 76. Job Ingestion Service

Pseudo flow:

```csharp
public async Task<IngestionResult> IngestAsync(
    RawExternalJob raw,
    CancellationToken ct)
{
    var normalized = await normalizer.NormalizeAsync(raw, ct);

    var validation = validator.Validate(normalized);
    if (!validation.IsValid)
        return IngestionResult.Rejected(validation.Errors);

    var duplicate = await deduplicator.FindMatchAsync(normalized, ct);

    if (duplicate.IsMatch)
        return await updater.UpdateExistingAsync(duplicate.JobId, normalized, ct);

    return await creator.CreateCanonicalJobAsync(normalized, ct);
}
```

---

# 77. Moderation Rules

Automatically flag:

```text
payment demanded
suspicious contact details
very short description
invalid apply URL
adult/illegal content
duplicate job
unverified source
misleading salary text
source mismatch
```

Do not automatically publish questionable records.

---

# 78. Security

Use:

```text
HTTPS
JWT
Refresh token rotation
Permission authorization
Input validation
Output encoding
CORS configuration
Rate limiting
Secure file access
Malware scan hook
Secret manager
Audit logging
Signed storage URLs
SQL parameterization through EF Core
```

Scraper-specific:

```text
Allowlisted source domains
Block internal IP ranges
Prevent SSRF
Validate redirects
Limit download size
Disallow file:// URLs
Disallow localhost/private networks
```

---

# 79. SSRF Protection

Before fetching any configured URL:

```text
Require http/https
Resolve DNS
Reject loopback
Reject private IPs
Reject metadata endpoints
Reject local network ranges
Restrict redirects
Validate final host
```

This is mandatory for any admin-configurable scraper URL.

---

# 80. Compliance & Source Governance

Per source store:

```text
Authorization status
Authorization note
Source owner
Allowed frequency
Allowed paths
Contact
Terms review date
Robots review date
Last compliance review
```

Do not build features intended to bypass access controls.

---

# 81. SEO

Public job pages should support:

```text
Meta title
Meta description
Canonical
JobPosting structured data
Organization structured data
Breadcrumb structured data
```

For aggregated jobs:

```text
Use canonical VSR URL
Show original source/company apply link
Expire stale jobs
Avoid indexing duplicate source variants
```

---

# 82. Observability

Track:

```text
API latency
Search latency
Scraper success rate
Requests per source
429 counts
403 counts
Parser errors
Jobs discovered
Jobs created
Jobs updated
Jobs closed
Duplicate percentage
Alert delivery rate
Resume parsing failures
Background queue latency
Database slow queries
```

Use:

```text
Serilog
Application Insights / OpenTelemetry
Structured logs
Correlation IDs
```

---

# 83. Audit Logging

Track:

```text
source created
source edited
source enabled
source paused
manual scraper run
source config changed
duplicate manually merged
job moderated
job published
job closed
company verified
candidate viewed
subscription changed
refund issued
```

---

# 84. Performance

Frontend:

```text
Route lazy loading
TanStack Query caching
Debounced search
Server pagination
Image lazy loading
Virtualization when necessary
```

Backend:

```text
Async APIs
No N+1 queries
AsNoTracking for reads
Compiled queries where useful
Database indexes
Batch inserts/updates
Background processing
Cache static taxonomies
```

Scraper:

```text
HTTP connection pooling
Conditional requests
Payload hash checks
Avoid refetching unchanged details
Batch normalization
Configurable concurrency
```

---

# 85. Development Seed Data

Create:

```text
50 companies
200 recruiter-posted jobs
300 aggregated jobs
10 sample job sources
100 skills
30 locations
15 industries
20 role categories
100 job seekers
20 recruiters
300 applications
20 job alerts
50 scrape runs
```

Sample scraper sources must be mock/local fixtures unless permission exists for real sources.

---

# 86. Local Development

Docker Compose:

```text
SQL Server
Redis optional
API
Background Worker
Scraper Worker
Frontend
```

Example environment variables:

```text
ConnectionStrings__Default
Jwt__Key
Storage__ConnectionString
Redis__ConnectionString
Hangfire__ConnectionString
App__FrontendUrl
Scraper__MaxConcurrency
```

Never commit production secrets.

---

# 87. Production Deployment

Recommended split:

```text
Frontend
  → Azure Static Web Apps / App Service / CDN

ASP.NET API
  → Azure App Service / Container App

Scraper Worker
  → Azure Container Apps / WebJob / Worker Service

Background Worker
  → Azure Container Apps / Worker Service

SQL Server
  → Azure SQL

Resumes
  → Azure Blob Storage

Redis
  → Azure Cache for Redis

Monitoring
  → Application Insights
```

---

# 88. Scraper Deployment Strategy

Do not run the scraper inside the frontend.

Preferred:

```text
VSR.Jobs.Api
VSR.Jobs.BackgroundJobs
VSR.Jobs.Scraper.Worker
```

Deploy separately so scraper failures do not crash the user-facing API.

---

# 89. CI/CD

Pipeline:

```text
1. Restore frontend
2. npm lint
3. npm test
4. npm build

5. dotnet restore
6. dotnet build
7. dotnet test

8. build Docker images
9. security scan
10. deploy API
11. deploy workers
12. run migrations
13. smoke tests
```

Scraper tests should run using local fixtures, not live sites.

---

# 90. MVP Scope

## Job Seeker

- [ ] Register/login
- [ ] Profile
- [ ] Resume upload
- [ ] Job search
- [ ] Filters
- [ ] Job detail
- [ ] Easy Apply
- [ ] External Apply
- [ ] Saved jobs
- [ ] Applications
- [ ] Job alerts
- [ ] Recommended jobs

## Recruiter

- [ ] Recruiter login
- [ ] Company profile
- [ ] Post/edit/publish job
- [ ] Manage jobs
- [ ] Applicants
- [ ] Applicant pipeline
- [ ] Candidate search
- [ ] Saved candidates
- [ ] Dashboard
- [ ] Subscription usage

## Scraper/Aggregator

- [ ] JobSource management
- [ ] Scheduler
- [ ] Source adapters
- [ ] API/feed adapter
- [ ] Authorized HTML adapter
- [ ] Raw job storage
- [ ] Normalization
- [ ] Deduplication
- [ ] Canonical job upsert
- [ ] Freshness tracking
- [ ] Job expiry/closure
- [ ] Scrape runs/logs
- [ ] Source health
- [ ] Admin scraper dashboard
- [ ] Manual run/reprocess

## Admin

- [ ] Users
- [ ] Recruiters
- [ ] Companies
- [ ] Jobs
- [ ] Moderation
- [ ] Scraper sources
- [ ] Scrape runs/logs
- [ ] Duplicate review
- [ ] Skills/locations/industries
- [ ] Audit logs
- [ ] Reports

---

# 91. Phase 2

```text
AI resume parsing
AI resume scoring
Embedding-based job matching
Recruiter subscriptions/payments
Company reviews
Salary insights
Interview scheduling
Assessments
Messaging
Push notifications
Partner feed API
Advanced search engine
Source auto-discovery
Admin parser builder
```

---

# 92. Coding Agent Build Order

```text
1. Create monorepo structure
2. Create React app shell
3. Create ASP.NET Core solution
4. Configure SQL Server + EF Core
5. Implement auth + permissions
6. Implement reference data
7. Implement companies
8. Implement recruiter profiles
9. Implement job seeker profile/resume
10. Implement canonical Jobs domain
11. Implement public job search
12. Implement job detail
13. Implement recruiter Job CRUD
14. Implement Easy Apply
15. Implement External Apply tracking
16. Implement applications
17. Implement recruiter pipeline
18. Implement saved jobs
19. Implement job alerts
20. Implement recommendation engine
21. Implement JobSource domain
22. Implement source configuration
23. Implement scraper scheduler
24. Implement HTTP fetcher
25. Implement adapter framework
26. Implement API/JSON/XML/RSS adapters
27. Implement authorized HTML adapter
28. Implement RawExternalJobs
29. Implement normalization
30. Implement location/title/skill mappings
31. Implement deduplication
32. Implement canonical job upsert
33. Implement source mappings
34. Implement freshness/stale job handling
35. Implement scraper runs/logs
36. Implement source-health dashboard
37. Implement duplicate-review UI
38. Implement admin moderation
39. Add resume score
40. Add AI job-match interface
41. Add notifications
42. Add Redis optional
43. Add Docker
44. Add CI/CD
45. Build/test/fix
46. Verify end-to-end flows
```

---

# 93. Coding Agent Rules

The coding agent must:

```text
Never return fake static data when an API exists.
Connect React screens to real ASP.NET Core APIs.
Use EF Core migrations.
Use server-side pagination.
Use DTOs, not EF entities directly in API contracts.
Use validation on every write endpoint.
Use permission checks in backend.
Keep scraper logic out of controllers.
Keep source-specific parsing inside adapters.
Store raw external job data before canonical publishing.
Make ingestion idempotent.
Use unique constraints to prevent duplicates.
Do not silently swallow scraper errors.
Do not mass-close jobs after one suspicious run.
Do not bypass access controls or anti-bot restrictions.
Do not expose recruiter-only/private candidate data.
Do not hardcode secrets.
Do not hardcode subscription prices in frontend.
Add tests for adapters, normalization, deduplication, and status changes.
```

---

# 94. Coding Agent Master Prompt

```text
Build the complete VSR Jobs platform described in this document.

Fixed stack:

Frontend:
React + TypeScript + Vite
React Router
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Zustand
Recharts

Backend:
ASP.NET Core Web API
C#
Entity Framework Core
Microsoft SQL Server
Clean Architecture principles
Modular monolith

Background processing:
Hangfire or Quartz.NET
Dedicated scraper/worker process

Storage:
SQL Server for relational data
Object storage for resumes/files

Primary product surfaces:
1. Job seeker portal
2. Recruiter portal
3. Admin portal
4. Job aggregation/scraper system

Implement real end-to-end flows.

JOB SEEKER:
Register
→ Profile
→ Resume
→ Search
→ Job Detail
→ Easy Apply / External Apply
→ Saved Jobs
→ Applications
→ Alerts
→ Recommendations

RECRUITER:
Login
→ Company
→ Post Job
→ Publish
→ Receive Applicants
→ Shortlist
→ Interview
→ Offer
→ Hired
→ Subscription Usage

SCRAPER:
Configured permitted source
→ Scheduler
→ Source Adapter
→ Fetch
→ Raw Job
→ Normalize
→ Validate
→ Deduplicate
→ Canonical Job
→ Publish
→ Track freshness
→ Update/close when source changes

ADMIN:
Manage sources
→ Monitor scraper runs
→ Review errors
→ Review duplicates
→ Moderate jobs
→ Verify companies
→ View audit logs

Scraper requirements:

- Implement IJobSourceAdapter.
- Prefer API/JSON/XML/RSS/ATS feeds over HTML scraping.
- HTML adapters may be used only for authorized/permitted public sources.
- Do not implement CAPTCHA bypass, login bypass, anti-bot evasion, proxy rotation for bypassing restrictions, or other circumvention.
- Add per-source rate limits.
- Respect 429 Retry-After.
- Auto-pause repeatedly failing sources.
- Store every fetched job first as RawExternalJob.
- Normalize into canonical fields.
- Keep OriginalTitle and RawLocation.
- Implement company/location/skill mapping.
- Implement deterministic deduplication.
- Store JobSourceMappings.
- Make processing idempotent.
- Track FirstSeenAt, LastSeenAt, source posted date, and expiry.
- Do not expire hundreds of jobs after a single suspicious zero-result run.
- Implement ScrapeRuns, ScrapeLogs, source health, errors, and admin dashboard.
- Implement manual run and reprocess actions.
- Protect against SSRF for configurable source URLs.
- Validate redirect URLs before external apply.
- Add structured logs and correlation IDs.

Frontend requirements:

- Fully responsive.
- Desktop, tablet, mobile.
- Android WebView and iOS WKWebView compatible.
- Original VSR Jobs branding/UI.
- Card-heavy professional job portal design.
- Recruiter dashboard.
- Admin scraper dashboard.
- Source configuration screens.
- Scrape run/log screens.
- Duplicate review screen.
- No horizontal overflow.
- Loading, empty, success, and error states.
- Skeletons where appropriate.
- Toasts for mutations.
- Accessible forms and buttons.

Backend requirements:

- API versioning under /api/v1.
- JWT + refresh tokens.
- Permission policies.
- EF Core migrations.
- SQL indexes.
- RowVersion on important mutable entities.
- 409 for stale concurrent updates.
- Server-side pagination.
- Input validation.
- Rate limiting.
- Audit logs.
- Background workers for long-running tasks.
- Unit/integration tests.

At the end:

1. npm install
2. npm lint
3. npm test
4. npm production build
5. dotnet restore
6. dotnet build
7. dotnet test
8. apply EF Core migrations
9. seed development data
10. start API + workers
11. verify scraper fixture source end-to-end
12. verify canonical job creation
13. verify deduplication
14. verify stale job handling
15. verify public job search
16. verify job detail
17. verify Easy Apply
18. verify External Apply
19. verify recruiter pipeline
20. verify admin scraper dashboard
21. fix TypeScript/C#/runtime errors
22. document local setup in README

Do not stop at mock UI.
The final application must contain working frontend/backend integration.
```

---

# 95. Definition of Done

## Engineering

- [ ] React build succeeds
- [ ] .NET build succeeds
- [ ] Tests pass
- [ ] EF migrations succeed
- [ ] SQL seed succeeds
- [ ] Docker local setup works
- [ ] No hardcoded secrets
- [ ] Server pagination works
- [ ] Role/permission checks work

## Scraper

- [ ] Source adapter framework works
- [ ] Sample permitted/mock source ingests successfully
- [ ] RawExternalJob saved
- [ ] Normalization works
- [ ] Deduplication works
- [ ] Canonical Job created
- [ ] Existing Job updates idempotently
- [ ] Job source mapping created
- [ ] LastSeenAt updates
- [ ] Stale detection works
- [ ] Suspicious zero-result protection works
- [ ] Source health updates
- [ ] Runs/logs visible to admin
- [ ] Reprocess action works
- [ ] Per-source rate limit works
- [ ] SSRF protection exists

## Job Seeker

- [ ] Search jobs
- [ ] Filters
- [ ] Job detail
- [ ] Register/login
- [ ] Profile
- [ ] Resume
- [ ] Easy Apply
- [ ] External Apply
- [ ] Saved jobs
- [ ] Applications
- [ ] Alerts
- [ ] Recommendations

## Recruiter

- [ ] Dashboard
- [ ] Company profile
- [ ] Post/edit/publish/close jobs
- [ ] Applicants
- [ ] Pipeline
- [ ] Candidate search
- [ ] Saved candidates
- [ ] Usage/subscription view

## Admin

- [ ] User management
- [ ] Recruiter management
- [ ] Company moderation
- [ ] Job moderation
- [ ] Source management
- [ ] Scraper monitoring
- [ ] Duplicate review
- [ ] Audit logs
- [ ] Reports

---

# 96. Final End-to-End Scraper Example

```text
Admin creates source:
"Example Technologies Careers"

Source type:
AuthorizedHtml

Schedule:
Every 60 minutes

Adapter:
ExampleTechCareerAdapter

RUN 1:
120 jobs discovered
120 raw jobs stored
118 canonical jobs created
2 duplicates merged

RUN 2:
122 jobs discovered
3 new
5 changed
114 unchanged
0 mass closure

RUN 3:
Source returns 0 unexpectedly
System marks run suspicious
No existing jobs closed

RUN 4:
Source healthy again
121 jobs returned
Source status returns Healthy

Later:
A job is removed from source
It is absent across configured verification runs
System marks canonical job Closed/Expired
Search no longer returns it
Existing application history remains intact
```

---

# 97. Final Architecture Summary

```text
React Web App
    │
    ▼
ASP.NET Core API
    │
    ├── Job Seeker Module
    ├── Recruiter Module
    ├── Admin Module
    ├── Search Module
    ├── Application Module
    ├── Subscription Module
    └── Scraper Management Module
            │
            ▼
      Background Job Queue
            │
            ▼
      Scraper Worker
            │
            ├── Source Adapters
            ├── HTTP Fetching
            ├── Raw Storage
            ├── Normalization
            ├── Deduplication
            ├── Job Upsert
            └── Freshness
                    │
                    ▼
                SQL Server

External permitted job source
            │
            ▼
       Source Adapter
            │
            ▼
      RawExternalJob
            │
            ▼
       Canonical Job
            │
            ▼
       Job Search UI
```

This design lets VSR Jobs operate as both:

```text
1. A recruiter-driven job portal
2. A permitted job aggregation platform
3. An AI-assisted candidate/job matching product
4. A subscription-based recruiter marketplace
```
