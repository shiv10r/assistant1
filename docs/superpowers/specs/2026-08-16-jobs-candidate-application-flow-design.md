# VSR Jobs Candidate Application Flow Design

## Goal

Turn the current VSR Jobs `Apply now` placeholder into a complete candidate-side application workflow. Candidates can maintain a reusable profile, validate resume metadata, answer screening questions, submit an application, and track the resulting status without waiting for the planned backend.

This is a frontend-only vertical slice. Recruiter workflows, administration, authentication changes, actual document upload, the ASP.NET Core API, and SQL Server persistence remain outside this scope.

## Current Context

VSR Jobs already provides job discovery, search and work-mode filters, job details, locally saved jobs, company profiles, and a fixture-based Applications page. `JobDetail` currently keeps an `applied` flag in component state and displays a note that profile, resume, and screening support will arrive later.

The new flow will replace that temporary state with durable, typed candidate and application records. The storage boundary must be replaceable by the planned Jobs API without requiring page components to be rewritten.

## Architecture

All new domain and UI code remains under `frontend/src/services/jobs`.

A typed candidate application repository owns a single versioned local-storage namespace. Page and form components call repository functions or a focused React hook; they never read or write `localStorage` directly. The stored document contains:

- Candidate profile
- Active resume metadata
- Application drafts keyed by job slug
- Submitted candidate applications
- Schema version

The repository parses unknown stored values into the current domain shape. If the Jobs candidate payload is invalid, only that namespace is reset. Unrelated application storage remains untouched.

The repository interface is deliberately API-shaped: load candidate state, save profile, save resume metadata, save or discard a draft, submit a draft, and query an application by job slug. A future HTTP-backed implementation can replace local persistence behind that boundary.

## Candidate Profile

Add a candidate profile page reachable from Jobs navigation. It collects and persists:

- Full name
- Email address
- Phone number
- Location
- Professional headline
- Experience summary
- Skills

Name, email, phone, location, headline, experience summary, and at least one skill are required before application submission. The profile page may save incomplete data as a draft, but it must show clear field-level validation when the candidate attempts to complete or use it.

Skills use a simple normalized list. Empty entries and duplicate values are removed before persistence.

## Resume Metadata

The profile page includes one active resume control. The browser file picker accepts PDF, DOC, and DOCX files. Validation checks the extension or available MIME type and enforces a conservative maximum size defined once in the Jobs domain module.

The implementation stores only safe metadata:

- Display name
- File extension or MIME type
- Size in bytes
- Local selection timestamp

The file contents are not stored or uploaded. The UI must explicitly explain that secure document transfer will be connected with the backend. Selecting a new valid file replaces the active resume metadata.

## Application Flow

Add `/jobs/:slug/apply` as a four-step candidate flow:

1. **Profile:** Review and edit candidate details.
2. **Resume:** Select or confirm the active resume metadata.
3. **Questions:** Answer required screening questions.
4. **Review:** Confirm the job, profile, resume, and answers before submission.

Opening the route resolves the job and then creates or restores a draft keyed by job slug. Moving forward validates the current step. Moving backward never discards entered data. Every accepted step update is persisted so refresh or navigation does not lose progress.

Screening questions are defined per job where Jobs data supplies them. Jobs without custom questions use a small shared fallback set. Each question has a stable identifier, prompt, response type, and required flag. This slice supports concise text and yes/no answers only.

Submission performs one repository operation that:

- Revalidates the profile, resume, and required answers
- Prevents a second active submission for the same job
- Creates a submitted application record with a stable identifier, job slug, company name, submitted date, `Submitted` status, and answer snapshot
- Removes the corresponding draft
- Persists the updated state

After success, the candidate is redirected to `/jobs/applications`, where the new application is visible immediately.

## Existing Page Integration

`JobDetail` changes `Apply now` from component-local state to navigation into the application route. If an application already exists for that job, the panel displays its status and links to Applications instead of allowing duplicate submission. If a draft exists, the action communicates that it will resume the application.

`JobsApplications` reads locally submitted applications through the repository. Existing seeded examples remain visible as demo history, but local submissions are the source of truth when their job slug overlaps a fixture. Application cards continue to show the existing status progression.

Jobs navigation gains a Profile entry. The application wizard itself is reached through job details rather than permanent top-level navigation.

## Validation and Error Handling

Validation is implemented as pure typed functions and reused by the profile page, wizard steps, and final submission. Errors render inline beside their fields. On blocked progression or submission, an error summary links to invalid controls.

The UI handles these conditions explicitly:

- Unknown or closed job: render the existing Jobs not-found/empty-state pattern.
- Invalid resume type or oversized file: reject it without replacing the current valid resume.
- Missing required profile or screening data: preserve values and keep the candidate on the relevant step.
- Duplicate application: redirect or link to the existing application rather than creating another record.
- Invalid local Jobs candidate payload: reset only this feature namespace and start from an empty candidate state.
- Storage write failure: keep current form state in memory and show a non-destructive persistence error.

## Accessibility

- Every field has a visible label and stable identifier.
- Error messages are associated with controls and summarized for failed progression.
- Wizard progress uses an ordered semantic structure and identifies the current step.
- All actions are keyboard operable and retain visible focus treatment.
- Status and validation meaning is never communicated by color alone.
- New motion follows the existing reduced-motion behavior in Jobs styles.

## Testing and Verification

Where the repository test setup supports focused frontend tests, cover the pure candidate/application domain behavior:

- Candidate profile normalization and validation
- Resume type and size validation
- Stored payload parsing and feature-only reset behavior
- Draft creation and restoration
- Draft-to-submission conversion
- Duplicate-application prevention
- Local applications overriding matching seeded examples

Implement in small vertical chunks:

1. Typed domain, validation, and storage repository
2. Candidate profile and resume metadata UI
3. Four-step application flow
4. Job detail, Applications page, route, and navigation integration

Run TypeScript diagnostics after each chunk. Final verification consists of the production build, lint, route-chunk check, and legacy-UI check. Browser sessions, screenshots, and visual-QA tooling remain excluded unless explicitly requested.

## Success Criteria

- A candidate can create and refresh a reusable local profile.
- A candidate can select valid resume metadata and receives clear feedback for invalid files.
- A candidate can start, leave, resume, validate, review, and submit an application.
- A submitted application appears immediately in Applications and survives refresh.
- The same job cannot receive duplicate active submissions.
- Existing job discovery, saved jobs, companies, and seeded application history continue to work.
- UI components remain independent of direct browser-storage access so the planned API can replace the local repository.
