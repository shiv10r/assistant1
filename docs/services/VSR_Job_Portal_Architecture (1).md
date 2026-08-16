# VSR Jobs — Full-Stack Job Portal Architecture

> Coding-agent-ready architecture for a full job portal with feature depth similar to major portals such as Naukri, while keeping VSR Jobs original in UI, code, content, branding, and workflows.
>
> **Stack:** React + TypeScript + Vite | ASP.NET Core Web API + C# | Entity Framework Core | Microsoft SQL Server | Modular Monolith | Desktop + Mobile + Android/iOS WebView

---

## 1. Product Vision

Build a complete employment marketplace connecting:

```text
Job Seekers
Recruiters
Companies
Platform Admins
```

Core capabilities:

- Job search
- Advanced filters
- Job detail pages
- Easy Apply / External Apply
- Job seeker profile
- Resume upload
- Saved jobs
- Job alerts
- Recommended jobs
- Application tracking
- Company pages
- Recruiter dashboard
- Job posting
- Applicant pipeline
- Candidate search
- Saved candidates
- Recruiter team/permissions
- Subscription-ready architecture
- Admin moderation
- Fraud/reporting controls
- Career resources
- SEO
- Mobile/WebView support

---

## 2. Product Surfaces

### Job Seeker

```text
Home
Search Jobs
Job Detail
Companies
Freshers
Remote Jobs
Career Resources
Profile
Resume
Saved Jobs
Applications
Job Alerts
Recommended Jobs
Settings
```

### Recruiter

```text
Dashboard
Post Job
Manage Jobs
Applicants
Candidate Search
Saved Candidates
Company Profile
Recruiter Team
Plans/Billing
Reports
Settings
```

### Admin

```text
Dashboard
Users
Recruiters
Companies
Jobs
Applications
Moderation
Skills
Locations
Industries
Role Categories
Plans
Payments
Reports
Content
Audit Logs
Settings
```

---

## 3. High-Level Architecture

```text
Job Seeker / Recruiter / Admin
              │
              ▼
     React + TypeScript + Vite
              │ REST/JSON
              ▼
        ASP.NET Core Web API
              │
   ┌──────────┼─────────────┐
   │          │             │
 Jobs     Applications   Recruiting
   │          │             │
   └──────────┼─────────────┘
              ▼
          SQL Server
```

Optional later:

```text
Redis
Object Storage
Email/SMS/Push
Dedicated Search Engine
Background Jobs
Payment Gateway
AI Matching
```

---

## 4. User Roles

```text
JobSeeker
Recruiter
RecruiterAdmin
CompanyAdmin
Moderator
PlatformAdmin
SuperAdmin
```

Use permission policies rather than only hardcoded role checks.

---

## 5. React Frontend Structure

```text
frontend/vsr-jobs-web/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── config/
│   │   └── store/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── cards/
│   │   ├── forms/
│   │   ├── search/
│   │   ├── profile/
│   │   ├── recruiter/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── jobs/
│   │   ├── companies/
│   │   ├── profile/
│   │   ├── resumes/
│   │   ├── applications/
│   │   ├── saved-jobs/
│   │   ├── alerts/
│   │   ├── recommendations/
│   │   ├── recruiter/
│   │   └── admin/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── main.tsx
│   └── App.tsx
└── public/
```

Recommended packages:

```text
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
```

---

## 6. Public Routes

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
/career-resources
/career-resources/:slug
/login
/register
/forgot-password
```

---

## 7. Job Seeker Routes

```text
/profile
/profile/edit
/profile/resume
/applications
/applications/:id
/saved-jobs
/job-alerts
/recommended-jobs
/settings
/settings/privacy
/settings/notifications
```

---

## 8. Recruiter Routes

```text
/recruiter
/recruiter/jobs
/recruiter/jobs/new
/recruiter/jobs/:id
/recruiter/jobs/:id/edit
/recruiter/applicants
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

## 9. Homepage Design

Use professional, card-heavy sections:

```text
Header
Hero Job Search
Popular Searches
Featured Jobs
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

## 10. Header

Desktop:

```text
VSR Jobs
Jobs | Companies | Career Resources | For Employers
Search | Login | Register | Post a Job
```

Mobile:

```text
☰   VSR Jobs   Search   Profile
```

---

## 11. Hero Job Search

Desktop:

```text
┌───────────────────────────────────────────────────────────────────┐
│ Skills / Designation / Company │ Location │ Experience           │
│                                               [Search Jobs]        │
└───────────────────────────────────────────────────────────────────┘
```

Suggested searches:

```text
.NET Developer
React Developer
Java Developer
Data Analyst
DevOps Engineer
QA Engineer
Product Manager
```

---

## 12. Job Cards

Primary card:

```text
┌─────────────────────────────────────────────┐
│ Company Logo                      Save ♡    │
│                                             │
│ Senior .NET Developer                       │
│ Acme Technologies                           │
│                                             │
│ 4–7 Years   ₹18–25 LPA   Gurgaon           │
│ Hybrid                                      │
│                                             │
│ .NET • C# • SQL • Azure • React            │
│                                             │
│ Posted 2h ago                 [Apply]       │
└─────────────────────────────────────────────┘
```

Badges:

```text
Featured
Urgent
Walk-In
Remote
Hybrid
Easy Apply
Verified Employer
```

Do not fabricate urgency or applicant counts.

---

## 13. Reusable Card Library

```text
JobCard
CompactJobCard
FeaturedJobCard
CompanyCard
SkillCard
RoleCard
LocationCard
RecruiterCard
CandidateCard
ApplicationCard
JobAlertCard
SavedSearchCard
CareerArticleCard
SalaryInsightCard
ProfileCompletionCard
RecruiterMetricCard
PlanCard
```

---

## 14. Job Search Page

Desktop:

```text
Filter Sidebar │ Search Results
```

Mobile:

```text
Search
Sort | Filters
Job Cards
```

Filters:

```text
Experience
Salary
Location
Work Mode
Job Type
Company
Industry
Department
Role Category
Education
Skills
Posted Date
Company Type
```

---

## 15. Job Detail Page

Structure:

```text
Job Header Card
Key Details
Job Description
Responsibilities
Requirements
Skills
Benefits
About Company
Similar Jobs
```

Desktop apply panel:

```text
Apply
Save
Share
```

Mobile sticky bar:

```text
[Save] [Apply Now]
```

---

## 16. Apply Flow

Two modes:

```text
Easy Apply
External Apply
```

### Easy Apply

```text
Select Resume
Answer Screening Questions
Review Profile
Submit Application
```

### External Apply

Redirect to recruiter/employer URL after recording outbound click.

---

## 17. Application Statuses

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

Every status change should create history.

---

## 18. Job Seeker Profile

Sections:

```text
Basic Details
Profile Headline
Professional Summary
Experience
Education
Skills
Projects
Certifications
Preferred Locations
Preferred Roles
Salary
Notice Period
Work Preferences
Languages
Resume
Portfolio/Links
```

Profile completion card:

```text
78% Complete
[Complete Profile]
```

---

## 19. Resume Management

Support:

```text
PDF
DOC
DOCX
```

Files belong in object storage in production.

SQL metadata:

```text
Id
UserId
FileName
StoragePath
ContentType
Size
IsPrimary
UploadedAt
```

Future:

- resume parser
- AI resume assistant

---

## 20. Work Experience Model

```text
Company
Designation
Employment Type
Start Date
End Date
Currently Working
Location
Description
Skills
```

---

## 21. Education Model

```text
Qualification
Course
Specialization
Institute
Start Year
End Year
Grade
```

---

## 22. Skills Taxonomy

Examples:

```text
C#
.NET Core
ASP.NET Core
React
Angular
Java
Spring Boot
SQL Server
Azure
AWS
Docker
Kubernetes
Power BI
Python
```

Jobs should use normalized skills, not only free-text strings.

---

## 23. Recommended Jobs

MVP uses explainable rule-based matching:

```text
Skill overlap
Preferred roles
Location
Experience
Salary
Work mode
Freshness
```

Potential configurable score:

```text
Skills 35%
Role 20%
Location 15%
Experience 15%
Salary 5%
Work Mode 5%
Freshness 5%
```

Later add vector/AI matching.

---

## 24. Job Alerts

User defines:

```text
Keyword
Location
Experience
Salary
Work Mode
Frequency
```

Frequency:

```text
Instant
Daily
Weekly
```

Background worker sends new matching jobs without duplicates.

---

## 25. Saved Jobs

```text
/saved-jobs
```

Features:

- save/unsave
- apply from saved list
- show expiry
- show similar jobs

---

## 26. Applications Dashboard

Tabs:

```text
All
Applied
In Process
Interview
Offer
Rejected
```

Card:

```text
Senior .NET Developer
Acme Technologies
Applied: 10 Aug
Status: Shortlisted
[View Application]
```

---

## 27. Company Directory

```text
/companies
```

Company card:

```text
Logo
Company Name
Industry
Locations
Open Jobs
Verified badge if verified
```

Filters:

```text
Industry
Company Size
Location
Company Type
```

---

## 28. Company Detail Page

```text
Cover
Logo
About
Industry
Size
Locations
Website
Benefits
Photos
Open Jobs
Reviews later
```

Company-owned content should be moderated.

---

## 29. Fresher Portal

```text
/freshers
```

Sections:

```text
Fresher Jobs
Internships
Graduate Programs
Walk-Ins
Top Fresher Skills
Career Guides
```

---

## 30. Recruiter Dashboard

Metric cards:

```text
Active Jobs
Applications Today
Total Applicants
Shortlisted
Interviews
Offers
Job Views
Candidate Searches
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

## 31. Post Job Wizard

```text
1. Job Basics
2. Experience & Salary
3. Location & Work Mode
4. Skills
5. Description
6. Screening Questions
7. Company / Recruiter
8. Preview
9. Publish
```

---

## 32. Job Fields

```text
Title
Job Code
CompanyId
RecruiterId
Department
Role Category
Employment Type
Work Mode
Locations
Min Experience
Max Experience
Min Salary
Max Salary
Currency
Salary Visible
Openings
Description
Responsibilities
Requirements
Benefits
Education
Skills
Application Mode
External Apply URL
Deadline
Status
PublishedAt
ExpiresAt
```

---

## 33. Job Statuses

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

---

## 34. Screening Questions

Types:

```text
Yes/No
Single Select
Multi Select
Numeric
Short Text
```

Examples:

```text
Current CTC?
Expected CTC?
Notice period?
Willing to relocate?
Do you have 4+ years of .NET experience?
```

Recruiters can define knockout rules.

---

## 35. Applicant Pipeline

Kanban:

```text
New
Reviewed
Shortlisted
Assessment
Interview
Offer
Hired
Rejected
```

Candidate card:

```text
Candidate Name
4 Years
.NET • React • SQL • Azure
Gurgaon
30 Days
[View Profile]
```

Also provide a table view on desktop.

---

## 36. Candidate Search

Recruiters can search:

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

Search access can be controlled by recruiter plan/credits.

---

## 37. Candidate Privacy

Job seeker privacy settings:

```text
Profile searchable
Hide current employer
Hide salary
Hide phone/email
Block specific companies
```

Recruiters must not automatically receive private contact information.

---

## 38. Recruiter Team

Roles:

```text
RecruiterAdmin
Recruiter
HiringManager
Viewer
```

Permissions:

```text
job.create
job.publish
job.edit
candidate.search
candidate.contact
application.view
application.move
interview.manage
billing.view
team.manage
```

---

## 39. Recruiter Plans / Monetization Ready

Plan dimensions:

```text
Active job posts
Candidate searches
Resume views
Featured job credits
Recruiter seats
Validity
```

Tables:

```text
Plans
PlanFeatures
Subscriptions
UsageCounters
Invoices
Payments
```

Do not hardcode commercial pricing into components.

---

## 40. Backend Solution Structure

```text
backend/
├── VSR.Jobs.Api/
├── VSR.Jobs.Application/
├── VSR.Jobs.Domain/
├── VSR.Jobs.Infrastructure/
├── VSR.Jobs.Contracts/
└── VSR.Jobs.Tests/
```

Modules:

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
Recommendations
SavedJobs
JobAlerts
CandidateSearch
Subscriptions
Payments
Content
Notifications
Admin
Audit
```

---

## 41. Core Domain Entities

```text
User
Role
Permission
RefreshToken

JobSeekerProfile
WorkExperience
Education
UserSkill
Project
Certification
Resume
JobPreference

RecruiterProfile
Company
CompanyLocation
CompanyMedia

Job
JobLocation
JobSkill
JobEducation
ScreeningQuestion
JobView

Application
ApplicationAnswer
ApplicationStatusHistory
Interview

SavedJob
JobAlert
SavedCandidate
CandidateView

Plan
Subscription
UsageCounter
Payment
Invoice

Notification
SupportTicket
AuditLog
```

---

## 42. SQL Server Tables

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
UserSkills
Projects
Certifications
Resumes
JobPreferences

RecruiterProfiles
Companies
CompanyLocations
CompanyMedia
CompanyRecruiters

Jobs
JobLocations
JobSkills
JobEducations
ScreeningQuestions
JobViews

Applications
ApplicationAnswers
ApplicationStatusHistory
Interviews

SavedJobs
JobAlerts
SavedCandidates
CandidateViews

Plans
PlanFeatures
Subscriptions
UsageCounters
Payments
Invoices

Notifications
SupportTickets
AuditLogs

Locations
Industries
Departments
RoleCategories
```

---

## 43. Jobs Table

```text
Id
Slug
JobCode
CompanyId
RecruiterId
Title
DepartmentId
RoleCategoryId
EmploymentType
WorkMode
MinExperience
MaxExperience
MinSalary
MaxSalary
Currency
SalaryVisible
Openings
Description
Responsibilities
Requirements
Benefits
ApplicationMode
ExternalApplyUrl
Status
PublishedAt
ExpiresAt
CreatedAt
UpdatedAt
RowVersion
```

Use `decimal(18,2)` for monetary values.

---

## 44. Applications Table

```text
Id
JobId
JobSeekerId
ResumeId
Status
AppliedAt
UpdatedAt
Source
CoverNote
CurrentStage
RecruiterNotes
RowVersion
```

Default unique constraint:

```text
(JobId, JobSeekerId)
```

unless explicit reapplication policy exists.

---

## 45. Search Architecture

MVP:

```text
SQL Server filters + indexes + normalized skills/locations
```

Later:

```text
Azure AI Search
Elasticsearch
OpenSearch
```

Indexable/searchable fields:

```text
Title
Skills
Company
Location
Description
Role
Industry
```

---

## 46. API Design

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
```

Job seeker:

```text
GET  /me/profile
PUT  /me/profile
POST /me/resumes
GET  /me/resumes
DELETE /me/resumes/{id}
POST /jobs/{id}/apply
GET  /me/applications
POST   /me/saved-jobs/{jobId}
DELETE /me/saved-jobs/{jobId}
GET  /me/job-alerts
POST /me/job-alerts
GET  /me/recommended-jobs
```

Recruiter:

```text
GET  /recruiter/dashboard
GET  /recruiter/jobs
POST /recruiter/jobs
PUT  /recruiter/jobs/{id}
POST /recruiter/jobs/{id}/publish
POST /recruiter/jobs/{id}/close
GET  /recruiter/jobs/{id}/applications
GET  /recruiter/applications/{id}
PATCH /recruiter/applications/{id}/status
GET  /recruiter/candidates
POST /recruiter/saved-candidates/{candidateId}
GET  /recruiter/usage
```

---

## 47. Authentication

Support initially:

```text
Email + Password
JWT Access Token
Refresh Token
```

Later:

```text
Phone OTP
Google
Microsoft
```

Recruiter/admin endpoints require explicit permissions.

---

## 48. Resume Upload Architecture

Frontend uploads multipart form-data.

Backend validates:

```text
Extension
MIME type
File size
Malware-scanning hook
Ownership
```

Store binaries in object storage in production.

---

## 49. Resume Parsing — Future

Interface:

```text
IResumeParser
```

Extract:

```text
Name
Email
Phone
Skills
Experience
Education
Current Role
Companies
```

Always let the user review extracted data before profile update.

---

## 50. Application Flow

```text
Search Job
   ↓
Job Detail
   ↓
Apply
   ↓
Select Resume
   ↓
Screening Questions
   ↓
Backend Validation
   ↓
Application Created
   ↓
Recruiter Receives Candidate
```

---

## 51. Recruiter Hiring Flow

```text
Job Published
    ↓
Applications
    ↓
Review
    ↓
Shortlist
    ↓
Interview
    ↓
Offer
    ↓
Hired
```

Status history must be immutable/auditable.

---

## 52. Notifications

Job seeker:

```text
Application submitted
Application viewed
Shortlisted
Interview scheduled
Offer update
Job alert match
Saved job expiring
```

Recruiter:

```text
New applicant
Interview reminder
Job expiring
Plan usage warning
```

Channels later:

```text
In-app
Email
SMS
Push
WhatsApp
```

---

## 53. Background Workers

Use for:

```text
Job alert matching
Job expiry
Notification delivery
Digest emails
Usage reset
Search index synchronization later
```

Do not keep long-running work inside HTTP requests.

---

## 54. Featured Jobs

Fields:

```text
IsFeatured
FeaturedFrom
FeaturedUntil
```

Featured jobs must be clearly labeled to users.

---

## 55. Admin Dashboard

Cards:

```text
Active Jobs
Jobs Posted Today
Applications Today
Active Job Seekers
Recruiters
Companies
Pending Moderation
Reported Jobs
Revenue
Subscriptions
```

Charts:

```text
Jobs trend
Applications trend
Recruiter growth
Top skills
Top locations
Top industries
```

---

## 56. Admin Moderation

Moderate:

```text
Recruiters
Companies
Jobs
Reported jobs
Spam
Fraud
Misleading salary
Duplicate postings
```

Statuses:

```text
Pending
Approved
Rejected
Flagged
Suspended
```

---

## 57. Fraud and Safety

User can report:

```text
Job
Company
Recruiter
```

Reasons:

```text
Fake job
Payment demanded
Suspicious communication
Misleading description
Duplicate
Harassment
Other
```

Admin receives moderation queue.

---

## 58. Company Verification

Fields:

```text
VerificationStatus
VerifiedAt
VerifiedBy
VerificationNotes
```

Statuses:

```text
Unverified
Pending
Verified
Rejected
Suspended
```

Only display verified badge when actually approved.

---

## 59. Security and Privacy

Protect:

```text
Phone
Email
Resume
Salary
Current employer
Application history
```

Use:

```text
HTTPS
JWT + refresh token rotation
Permission authorization
Input validation
Secure file access
Rate limiting
Audit logging
Secrets outside source control
```

---

## 60. SQL Index Strategy

Examples:

```text
Jobs(Status, PublishedAt)
Jobs(CompanyId, Status)
Jobs(Title)
JobLocations(LocationId, JobId)
JobSkills(SkillId, JobId)
Applications(JobId, Status)
Applications(JobSeekerId, AppliedAt)
UserSkills(SkillId, UserId)
Companies(Slug) UNIQUE
Companies(VerificationStatus)
```

Tune based on actual query plans.

---

## 61. Pagination

Always server-side for large data.

```text
/jobs?page=1&pageSize=20
/recruiter/applications?page=1&pageSize=50
```

Do not load thousands of jobs/candidates into React.

---

## 62. Concurrency

Use `RowVersion` for:

```text
Jobs
Applications
Company profiles
Subscriptions
```

Return `409 Conflict` on stale updates.

---

## 63. Audit Logging

Track:

```text
Job created
Job published
Job changed
Job closed
Candidate viewed
Application status changed
Company verified
Recruiter suspended
Plan changed
Refund issued
```

---

## 64. Career Resources

Content categories:

```text
Resume Tips
Interview Preparation
Salary Guides
Career Advice
Tech Careers
Freshers
```

Use card-heavy article grids.

---

## 65. Mobile UX

Mobile search screen:

```text
Compact Header
Sticky Search
Filter | Sort
Job Card List
```

Job detail:

```text
Job Summary
Skills
Description
Company
Similar Jobs

Sticky [Save] [Apply]
```

Recruiter mobile:

- drawer navigation
- applicant cards instead of huge tables
- bottom sheets for filters
- compact metric cards

---

## 66. WebView Requirements

Mandatory:

```text
Android WebView
iOS WKWebView
Chrome Android
Safari iOS
320px+
```

Rules:

- no hover-only actions
- 44px+ touch targets
- safe-area padding
- keyboard-safe forms
- resume upload works
- apply flow works
- login works
- no horizontal page overflow

---

## 67. Performance

Use:

```text
Route lazy loading
TanStack Query caching
Debounced job/candidate search
Server pagination
Image lazy loading
Virtualization only when needed
```

---

## 68. SEO

Public job/company pages:

```text
Meta title
Meta description
Canonical
JobPosting structured data
Organization structured data
Breadcrumb structured data
```

Expired jobs should be removed from active search and handled with configurable noindex/redirect policy.

---

## 69. Seed Data

Create realistic development data:

```text
50 companies
200 jobs
100 skills
30 locations
15 industries
20 role categories
100 job seekers
20 recruiters
300 applications
```

Do not use lorem ipsum.

---

## 70. MVP Scope

### Job Seeker

- [ ] Register/login
- [ ] Job search
- [ ] Filters
- [ ] Job detail
- [ ] Profile
- [ ] Resume upload
- [ ] Apply
- [ ] Saved jobs
- [ ] Application tracking
- [ ] Job alerts
- [ ] Recommended jobs

### Recruiter

- [ ] Recruiter login
- [ ] Company profile
- [ ] Post/edit/publish job
- [ ] Manage jobs
- [ ] Applicants
- [ ] Applicant pipeline
- [ ] Candidate search basic
- [ ] Saved candidates
- [ ] Dashboard

### Admin

- [ ] Users
- [ ] Recruiters
- [ ] Companies
- [ ] Jobs
- [ ] Moderation
- [ ] Skills/locations/industries
- [ ] Reports
- [ ] Audit logs

---

## 71. Phase 2

```text
Messaging
Interview scheduling
Assessment integration
Resume parsing
Recruiter subscriptions
Payments
Company reviews
Salary insights
Push notifications
AI matching
AI resume assistant
```

---

## 72. Critical End-to-End Flow A — Job Seeker

```text
Register
→ Build Profile
→ Upload Resume
→ Search
→ View Job
→ Apply
→ Application Created
→ Recruiter Reviews
→ Status Changes
→ Job Seeker Tracks Status
```

---

## 73. Critical Flow B — Recruiter

```text
Recruiter Login
→ Create/Join Company
→ Post Job
→ Publish
→ Receive Applicants
→ Review
→ Shortlist
→ Interview
→ Offer
→ Hired
```

---

## 74. Coding Agent Build Order

```text
1. React shell
2. ASP.NET Core solution
3. SQL Server + EF Core
4. Auth + permissions
5. Skills/locations/industries
6. Job seeker profile/resume
7. Companies/recruiters
8. Job CRUD
9. Public job search
10. Job detail
11. Apply flow
12. Applications
13. Recruiter pipeline
14. Saved jobs
15. Job alerts
16. Recommendations
17. Admin moderation
18. Mobile/WebView polish
19. Build/test/fix
```

---

## 75. Coding Agent Master Prompt

```text
Build the complete VSR Jobs platform described in this document.

Fixed stack:
Frontend: React + TypeScript + Vite + React Router + Tailwind + shadcn/ui + TanStack Query + React Hook Form + Zod + Zustand.
Backend: ASP.NET Core Web API + C# + Entity Framework Core.
Database: Microsoft SQL Server.
Architecture: modular monolith using Clean Architecture principles.

Do not clone Naukri.com's exact UI, branding, text or source code. Build an original VSR Jobs experience with comparable product depth.

Implement real end-to-end flows:

Job seeker:
Register → Profile → Resume → Search → Job Detail → Apply → Application Tracking.

Recruiter:
Login → Company → Post Job → Publish → Applicants → Shortlist → Interview → Offer/Hired.

Admin:
Company/recruiter verification → Job moderation → Reports → Audit.

Frontend must connect to real .NET APIs and SQL Server.
Use EF Core migrations and realistic seed data.
Use server-side search filters and pagination.
Use permission checks in backend.
Protect candidate privacy.
Store resume files outside SQL binary tables in production.
Support desktop, tablet, mobile browser, Android WebView and iOS WKWebView.

At the end:
1. npm production build
2. dotnet build
3. tests
4. migrations
5. seed development data
6. fix TypeScript/C#/runtime errors
7. verify job seeker and recruiter end-to-end flows
```

---

## 76. Definition of Done

### Job Seeker

- [ ] Search jobs
- [ ] Filters
- [ ] Job detail
- [ ] Register/login
- [ ] Profile
- [ ] Resume
- [ ] Apply
- [ ] Saved jobs
- [ ] Applications
- [ ] Alerts
- [ ] Recommendations

### Recruiter

- [ ] Dashboard
- [ ] Company profile
- [ ] Post/edit/publish/close jobs
- [ ] Applicants
- [ ] Pipeline
- [ ] Candidate search
- [ ] Saved candidates
- [ ] Usage view

### Admin

- [ ] User management
- [ ] Recruiter management
- [ ] Company moderation
- [ ] Job moderation
- [ ] Skills
- [ ] Locations
- [ ] Industries
- [ ] Reports
- [ ] Audit logs

### Engineering

- [ ] React build succeeds
- [ ] .NET build succeeds
- [ ] EF migrations succeed
- [ ] SQL seed succeeds
- [ ] Search/pagination server-side
- [ ] Candidate privacy enforced
- [ ] No mobile overflow
- [ ] Android/iOS WebView safe
