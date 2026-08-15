# School Management System --- Full-Fledged Expansion

## Purpose

The existing V1 specification already covers the core school ERP:
students, parents, admissions, academics, attendance, exams, fees,
payroll, transport, library, inventory, assets, communication, reports,
permissions and audit.

For a genuinely full-fledged commercial school platform, add the
following modules and platform capabilities.

## 1. Parent Portal / Parent App

-   Child selector
-   Attendance and attendance percentage
-   Timetable
-   Homework and assignments
-   Exams and results
-   Fee balance, online payment and receipts
-   Notices and events
-   Transport status
-   Documents and certificates
-   Leave requests
-   PTM booking
-   Authorized teacher communication
-   Profile/document updates where permitted

Parent with multiple children must be able to switch between children.

## 2. Student Portal

-   Dashboard
-   Timetable
-   Attendance
-   Homework
-   Assignments
-   Exams
-   Results
-   Study material
-   Online tests
-   Certificates
-   Library
-   Events
-   Notices
-   Messages

## 3. Learning Management System

Create:

``` text
Course
 ├── Subject
 ├── Chapters
 ├── Lessons
 ├── Materials
 ├── Assignments
 ├── Tests
 └── Resources
```

Support PDF, PPT/PPTX, images, videos, links and worksheets.

Keep video conferencing as an integration rather than building it from
scratch.

## 4. Online Examination

Support MCQ, multiple-select, true/false, fill-in-the-blank, short
answer and long answer.

Features:

-   Question bank
-   Difficulty/topic tags
-   Negative marking
-   Random questions/options
-   Time limits
-   Attempt limits
-   Auto-save
-   Auto-submit
-   Automatic objective evaluation
-   Manual evaluation
-   Result publishing
-   Attempt/session tracking

Do not claim browser-based anti-cheating is complete security.

## 5. Question Bank

Reusable questions with:

``` text
Subject
Chapter
Topic
Question
Type
Difficulty
Marks
Answer
Explanation
Tags
Session
```

Add search, filters, bulk import, duplicate detection and exam reuse.

## 6. Communication Center

Unified channels:

``` text
In-App
Email
SMS
Push
WhatsApp
```

Use provider interfaces instead of hard-coding a vendor.

Add templates, scheduled messages, bulk messaging, audience
segmentation, delivery status, retry and history.

## 7. Notification Center

Central inbox:

``` text
All | Unread | Important
```

Notifications for fees, attendance, homework, exams, results, notices,
leave, transport and admissions.

Add per-user notification preferences.

## 8. School CRM

Expand admissions into CRM:

-   Leads
-   Follow-ups
-   Calls
-   Visits
-   Tasks
-   Counselling
-   Campaigns
-   Lead sources
-   Conversion tracking
-   Lost-lead reasons
-   Staff assignment
-   Source ROI

Pipeline:

``` text
Lead → Contacted → Visit → Application → Test → Approved → Paid → Enrolled
```

## 9. Public Website / Online Admissions

Optional public school website integration.

Admission flow:

``` text
Website
→ Enquiry
→ Application
→ Documents
→ Application fee
→ Appointment
→ Test/interview
→ Decision
```

Applications should enter the ERP directly.

## 10. Appointment + PTM

Appointments for admissions, counselling, principal meetings, document
verification and PTMs.

PTM features:

-   Slot configuration
-   Teacher availability
-   Parent booking
-   Meeting notes
-   Follow-up
-   Feedback
-   Attendance

## 11. HRMS Expansion

Add:

-   Recruitment
-   Job openings
-   Applicants
-   Interview stages
-   Employee onboarding
-   Contracts
-   Probation
-   Confirmation
-   Promotions
-   Transfers
-   Resignation
-   Exit process
-   Experience letters
-   Performance reviews
-   Training
-   Skills
-   Certifications

Employee lifecycle:

``` text
Applicant → Selected → Onboarding → Active → Probation → Confirmed
→ Promoted/Transferred → Exit
```

## 12. Advanced Payroll

Make earnings/deductions configurable.

Support:

-   Salary revisions
-   Arrears
-   Advances
-   Bonuses
-   Loans
-   Reimbursements
-   Loss of pay
-   Attendance adjustments
-   Payslips
-   Payroll approval
-   Payroll lock
-   Reversal
-   Audit history

For India, keep statutory deductions/compliance configurable and
maintainable rather than hard-coding assumptions.

## 13. Employee Self-Service

Staff can:

-   View profile
-   Download payslips
-   Apply leave
-   View attendance
-   Submit reimbursements
-   Upload documents
-   View timetable/classes
-   Request corrections
-   View announcements

## 14. Procurement

Full flow:

``` text
Purchase Request
→ Approval
→ RFQ
→ Vendor Quotes
→ Comparison
→ Purchase Order
→ Goods Receipt
→ Invoice
→ Payment
```

Add vendor management and purchase history.

## 15. Full Inventory / Stores

Support:

``` text
Purchase → Receive → Store → Issue → Return → Transfer → Adjust → Dispose
```

Add:

-   Multiple stores/warehouses
-   Locations/bins
-   Reorder levels
-   Stock valuation
-   Batch/serial numbers where applicable
-   Expiry tracking where applicable
-   Stock audits
-   Adjustment approvals

## 16. Hostel / Boarding

Optional module:

-   Hostels
-   Buildings/floors/rooms/beds
-   Wardens
-   Student allocation
-   Hostel fees
-   Attendance
-   Visitors
-   Leave/outpass
-   Mess
-   Complaints
-   Maintenance

## 17. Cafeteria

Optional:

-   Menus
-   Meal plans
-   Meal attendance
-   Food inventory consumption
-   Vendors
-   Food cost
-   Allergies/dietary requirements

## 18. Live Transport / GPS

Architecture:

``` text
GPS Device / Driver App
→ GPS Provider
→ Backend
→ WebSocket/Polling
→ Parent App
```

Features:

-   Live location
-   Route
-   Stops
-   ETA
-   Driver
-   Trip start/end
-   Geofencing
-   Pickup/drop status
-   Emergency alerts

Keep GPS hardware optional.

## 19. Driver App

``` text
Login
→ Assigned Trip
→ Start
→ Route
→ Mark Stops
→ Student Pickup
→ Student Drop
→ End
```

Optional GPS, emergency button, vehicle inspection and fuel logs.

## 20. Vehicle Maintenance

-   Service schedules
-   Insurance expiry
-   Fitness expiry
-   Pollution-certificate expiry
-   Fuel logs
-   Repairs
-   Maintenance costs
-   Service history
-   Automated expiry reminders

## 21. Smart Attendance

Support adapters for:

``` text
Manual
QR
RFID
Biometric
Mobile
External API
```

Hardware must remain optional.

## 22. ID Cards

Bulk printable ID cards with:

-   Photo
-   Name
-   Admission/employee ID
-   Class/designation
-   House
-   Emergency contact
-   School branding
-   QR code

## 23. Digital Documents

Central document center with:

-   Upload
-   Preview
-   Versioning
-   Expiry
-   Approval
-   Permission control
-   Digital-signature integration
-   Secure download

## 24. Digital Certificates

Templates for certificates with:

-   Certificate number
-   QR verification
-   Issue history
-   Revocation
-   Public verification page

## 25. Alumni

-   Alumni profiles
-   Graduation year
-   Education
-   Employer
-   Achievements
-   Events
-   Donations
-   Mentorship

## 26. Helpdesk / Ticketing

Categories:

``` text
IT
Fees
Transport
Academic
Admission
Facilities
Other
```

Workflow:

``` text
Open → Assigned → In Progress → Waiting → Resolved → Closed
```

Add priority, SLA, attachments, internal notes and escalation.

## 27. Grievance Management

Separate sensitive workflow:

-   Complaint
-   Category
-   Anonymous option where appropriate
-   Assigned officer
-   Investigation
-   Action
-   Resolution
-   Closure

Strict permissions and audit trail.

## 28. Emergency / Incident Management

Track:

-   Student accidents
-   Medical emergencies
-   Bus incidents
-   Security issues
-   Fire
-   Facility incidents

Include severity, people, location, actions, notifications and
follow-up.

## 29. Emergency Broadcast

Admin can select an audience and send an emergency message through
configured push/SMS/email/WhatsApp channels with delivery tracking.

## 30. Resource Booking

Book:

-   Classrooms
-   Labs
-   Auditorium
-   Sports grounds
-   Conference rooms
-   Library
-   Computer labs

Prevent double booking.

## 31. Sports

-   Sports
-   Teams
-   Coaches
-   Players
-   Trials
-   Events
-   Fixtures
-   Results
-   Achievements
-   Certificates

## 32. Clubs and Activities

Support clubs, coordinators, student enrollment, attendance, events,
achievements and certificates.

Examples:

``` text
Music
Dance
Robotics
Debate
Coding
Art
Sports
Literary
```

## 33. House System

``` text
House
→ Students
→ Teachers
→ Points
→ Events
→ Achievements
```

Add configurable point rules and leaderboards.

## 34. Student Behaviour / Merit

Track positive and negative events:

``` text
Achievement
Award
Merit
Behaviour Incident
Warning
Counselling
```

Avoid a system focused only on punishment.

## 35. Counselling

Restricted module:

-   Counsellor
-   Appointment
-   Session
-   Notes
-   Follow-up
-   Referral
-   Status

Sensitive notes must not be visible to ordinary teachers.

## 36. Learning Support

Optional:

-   Learning support plans
-   Accessibility needs
-   Individual goals
-   Support teacher
-   Progress
-   Parent communication
-   Review dates

## 37. Surveys / Feedback

Configurable forms for parent, student, teacher and event feedback.

Support anonymous responses, ratings, MCQs, comments, analytics and
export.

## 38. Custom Forms Builder

Reusable no-code forms with:

``` text
Text
Number
Date
Dropdown
Multi-select
Radio
Checkbox
File
Signature
Paragraph
Rating
```

Use for admission, consent, surveys, leave, events and feedback.

## 39. Workflow Engine

For sensitive processes:

``` text
Trigger
→ Conditions
→ Approvers
→ Notifications
→ Action
→ Audit
```

Examples:

-   Fee refund
-   Discount
-   Expense
-   Payroll change
-   Marks correction
-   Inventory adjustment

Start with predefined workflows; add drag-and-drop workflow design
later.

## 40. Automation Engine

Automate:

-   Fee reminders
-   Attendance alerts
-   Birthday notifications
-   Certificate expiry
-   Vehicle document expiry
-   Staff document expiry
-   Library overdue
-   Low inventory
-   Exam reminders
-   Admission follow-ups
-   Leave reminders

Architecture:

``` text
Event → Rule → Job → Action → Notification → Audit
```

## 41. AI Assistant

Permission-filtered natural-language queries:

``` text
Show students below 75% attendance.
How much fee is outstanding?
Which class has the highest absence?
Show pending admissions.
Draft a notice for tomorrow's holiday.
```

For actions:

``` text
AI suggestion
→ Human review
→ Confirmation
→ Execute
```

AI must never bypass authorization or autonomously alter finance,
payroll, marks or student records.

## 42. AI Academic Tools

Optional:

-   Quiz drafts
-   Homework drafts
-   Question-paper drafts
-   Lesson-plan drafts
-   Performance summaries
-   Teacher feedback drafts

Teacher must review AI-generated content.

## 43. Advanced BI

Create a dedicated analytics layer.

KPIs:

``` text
Enrollment
Attendance
Academic performance
Fee collection
Outstanding
Admissions conversion
Staff utilization
Transport
Library
Inventory
```

Support drill-down, date/session comparison, filters and exports.

## 44. Scheduled Reports

Allow daily/weekly/monthly/quarterly reports delivered by email or
in-app.

Example:

``` text
Every Monday 8 AM
→ Principal
→ Weekly Attendance Report
```

## 45. Accounting Expansion

If the product becomes a complete ERP, add a separate accounting domain:

-   Chart of accounts
-   Journal entries
-   Ledger
-   Receivables
-   Payables
-   Bank accounts
-   Reconciliation
-   Income
-   Expenses
-   Budgets
-   Financial reports

Keep fee-management and accounting models connected but separate.

## 46. SaaS / Multi-Tenant Platform

If selling to multiple schools:

``` text
Platform
 ├── School A
 ├── School B
 ├── School C
 └── School D
```

Add:

-   School onboarding
-   Subscription plans
-   Trials
-   Feature flags
-   Usage limits
-   Billing
-   Invoices
-   Tenant isolation
-   Add-ons
-   Tenant admin

## 47. Feature Flags

Enable modules per school:

``` text
Transport
Library
Payroll
Hostel
LMS
AI
Online Exams
Accounting
```

Frontend visibility must never replace backend authorization.

## 48. API / Integrations

Create integration interfaces for:

-   Payment gateways
-   SMS
-   Email
-   WhatsApp
-   GPS
-   Biometric
-   Accounting
-   LMS
-   Identity providers
-   Education/government systems where applicable
-   Public school website

Add secure API keys/OAuth as appropriate.

## 49. Webhooks

Events such as:

``` text
student.created
student.promoted
fee.paid
fee.overdue
attendance.marked
exam.published
admission.approved
leave.approved
ticket.created
```

Allow external systems to subscribe securely.

## 50. SSO + MFA

Support:

-   Google sign-in
-   Microsoft sign-in
-   SAML/OIDC for larger organizations
-   Authenticator-app MFA
-   Recovery codes

Require stronger authentication for Super Admin, Finance, Payroll and
sensitive areas.

## 51. Security Center

Show:

-   Active sessions
-   Login history
-   Failed logins
-   Password resets
-   Suspicious activity
-   API access
-   Audit events
-   Permission changes

Allow force logout, account disable and session revocation.

## 52. Backup / Disaster Recovery

Implement:

-   Automated DB backups
-   File backup strategy
-   Retention
-   Restore procedures
-   Backup health monitoring

Do not claim backups exist unless infrastructure actually performs them.

## 53. Data Retention / Archiving

Archive rather than destroy historical records:

``` text
Graduated students
Old sessions
Old payroll
Old admissions
Old audit logs
```

Provide controlled restore.

## 54. Data Export / Portability

Allow schools to export:

-   Students
-   Parents
-   Academics
-   Attendance
-   Fees
-   Documents
-   Reports

For SaaS, provide structured tenant export.

## 55. Accessibility

Support:

-   Keyboard navigation
-   Screen readers
-   Focus states
-   Contrast
-   Reduced motion
-   Accessible tables
-   Accessible dialogs
-   Text alternatives for charts
-   Status indicators that do not rely on color alone

## 56. Localization

Prepare for:

``` text
English
Hindi
Regional languages
```

Also support currency, date, number and timezone configuration.

## 57. PWA / Offline Teacher Workflows

Prioritize offline support for:

``` text
Attendance
Timetable
Homework drafts
```

Architecture:

``` text
Online
→ Local cache
→ Offline operation
→ Sync queue
→ Conflict resolution
```

Do not make every module offline.

## 58. Real-Time Updates

Use real-time technology only where valuable:

-   Notifications
-   Transport location
-   Ticket assignment
-   Admission updates
-   Emergency broadcasts
-   Live attendance

## 59. Global Search

Search permitted data across:

``` text
Students
Parents
Staff
Admissions
Receipts
Books
Assets
Tickets
```

Search must enforce tenant and role permissions.

## 60. File Storage

Use object storage for large files.

``` text
Application
→ Secure File Service
→ Object Storage
```

Database stores metadata, not large file binaries.

Use authorized/signed downloads.

## 61. Observability

Production platform should have:

-   Structured logging
-   Error tracking
-   Request tracing
-   Performance monitoring
-   Health checks
-   DB monitoring
-   Background-job monitoring
-   API metrics

## 62. Background Jobs

Use jobs for:

-   Notifications
-   Scheduled reports
-   PDF generation
-   Imports/exports
-   Fee reminders
-   Payroll
-   Certificates
-   Synchronization

Do not block HTTP requests for long-running jobs.

## 63. Performance

Require:

-   Server-side pagination
-   Filtering/sorting
-   Proper indexes
-   Query projection
-   Caching where justified
-   Background processing
-   Avoid N+1 queries
-   Aggregated dashboard APIs
-   Lazy loading of heavy data

## 64. Data Integrity

Use transactions for:

``` text
Fee payment
Fee refund
Student promotion
Payroll finalization
Marks publication
Inventory adjustment
Purchase receipt
```

Use idempotency for payment/webhook processing so retries cannot create
duplicate payments.

## 65. Maker / Checker

Use approval for:

-   Fee refunds
-   Large discounts
-   Payroll changes
-   Marks corrections
-   Inventory adjustments
-   Expenses
-   Student deactivation
-   Sensitive exports

## 66. Premium Command Center

Create an executive dashboard:

``` text
Students              2,486
Present               2,318
Absent                  168
Fees Collected       ₹4.8L
Outstanding          ₹21.4L
Admissions Pending       42
Staff Absent             17
Buses Active              18
Critical Alerts            3
```

Below:

``` text
Attendance
Finance
Admissions
Academic Performance
Operations
Alerts
```

## 67. Alert Center

Centralize exceptions:

``` text
Critical
Warning
Information
```

Examples:

-   Low attendance
-   Fee overdue
-   Vehicle document expiry
-   Low inventory
-   Missing exam marks
-   Maintenance overdue
-   Admission follow-up overdue

Every alert should link directly to the relevant action.

## 68. Task Management

Users can assign tasks:

-   Title
-   Description
-   Assignee
-   Due date
-   Priority
-   Related module/record
-   Status

## 69. Unified Calendar

Aggregate:

``` text
Academic Events
Exams
PTMs
Admissions
Tasks
Leave
Meetings
Transport
Maintenance
```

Allow module filters.

## 70. Advanced Report Builder

Allow admins to create reports from datasets:

``` text
Dataset
→ Columns
→ Filters
→ Grouping
→ Sorting
→ Chart
→ Save
```

Example saved reports:

``` text
Attendance below 75%
Fee dues above ₹20,000
Students missing documents
Staff on leave
Library overdue books
```

## 71. Custom Fields

Allow school-specific custom fields for:

``` text
Student
Parent
Staff
Admission
Book
Asset
Vendor
```

No code deployment should be required to add a custom field.

## 72. Import Center

Central import history:

``` text
Upload
→ Validate
→ Preview
→ Process
→ Complete
```

Show success/failure counts and downloadable error details.

## 73. Export Center

Large exports run as background jobs:

``` text
Request
→ Processing
→ Ready
→ Download
→ Expire
```

## 74. Data Correction Center

Controlled correction requests for:

-   DOB
-   Class
-   Parent
-   Attendance
-   Fees
-   Marks

Every correction stores:

``` text
Requested by
Reason
Old value
New value
Approved by
Timestamp
```

## 75. Product Support

Add:

-   Help center
-   Support tickets
-   System status
-   Release notes
-   Onboarding checklist
-   Product tours

## 76. New-School Onboarding Wizard

``` text
Create School
→ Branding
→ Academic Session
→ Classes
→ Sections
→ Subjects
→ Teachers
→ Fee Structure
→ Import Students
→ Roles
→ Ready
```

Show setup completion percentage.

## 77. Demo / Sandbox

For sales demos:

-   Sample school
-   Sample students
-   Sample teachers
-   Sample fees
-   Sample reports
-   Reset demo data
-   Read-only demo account

Keep demo data isolated from production.

# Full-Fledged Navigation

``` text
COMMAND CENTER
  Dashboard
  Alerts
  Tasks
  Calendar

PEOPLE
  Students
  Parents
  Teachers
  Staff
  Directory

ADMISSIONS & CRM
  Enquiries
  Leads
  Applications
  Interviews
  Follow-ups
  Admission Analytics

ACADEMICS
  Sessions
  Classes
  Sections
  Subjects
  Teacher Assignments
  Timetable
  Calendar
  Homework
  Assignments
  LMS
  Question Bank
  Online Exams

ATTENDANCE
  Student Attendance
  Staff Attendance
  Leave
  QR Attendance
  Attendance Analytics

EXAMINATION
  Exams
  Schedules
  Marks
  Results
  Report Cards
  Certificates

FINANCE
  Fee Structure
  Collections
  Receipts
  Dues
  Discounts
  Refunds
  Expenses
  Payroll
  Reimbursements
  Accounting
  Budgets
  Bank Reconciliation

HR
  Employees
  Recruitment
  Onboarding
  Leave
  Attendance
  Performance
  Training
  Payroll
  Exit

OPERATIONS
  Transport
  Live GPS
  Library
  Inventory
  Procurement
  Assets
  Maintenance
  Visitors
  Hostel
  Cafeteria
  Facilities

STUDENT LIFE
  Clubs
  Sports
  Houses
  Activities
  Achievements
  Discipline
  Counselling
  Health
  Learning Support

COMMUNICATION
  Notices
  Messaging
  Notifications
  Events
  PTM
  Surveys

DOCUMENTS
  Document Center
  Certificates
  Templates
  Verification

REPORTS & ANALYTICS
  Dashboards
  Reports
  Analytics
  Scheduled Reports
  Exports

SERVICE
  Helpdesk
  Complaints
  Tasks

SYSTEM
  Users
  Roles
  Permissions
  Workflows
  Automations
  Audit Logs
  Integrations
  API
  Webhooks
  Settings

PLATFORM — SaaS ADMIN ONLY
  Schools
  Plans
  Subscriptions
  Feature Flags
  Usage
  System Health
  Support
```

# What Not to Build From Scratch

Use integrations instead of reinventing infrastructure for:

-   Video conferencing
-   Payment processing
-   SMS delivery
-   WhatsApp infrastructure
-   GPS hardware
-   Biometric hardware
-   Cloud storage
-   Identity providers

Build clean provider interfaces so vendors can be changed later.

# Product Strategy

Do not build every module at once.

### Foundation

``` text
Auth
Users
Roles
School
Academic Session
Students
Parents
Staff
```

### Core ERP

``` text
Admissions
Academics
Attendance
Exams
Fees
Payroll
Communication
Reports
```

### Operations

``` text
Transport
Library
Inventory
Assets
Maintenance
```

### Engagement

``` text
Parent App
Student App
LMS
PTM
Events
Activities
```

### Enterprise

``` text
HRMS
Accounting
Procurement
Workflow
Automation
Advanced Analytics
Integrations
SaaS Management
```

### Premium

``` text
AI Assistant
AI Academic Tools
Live GPS
Online Exams
Advanced BI
Custom Forms
Custom Workflows
```

# Final Architecture Principle

The platform should be:

``` text
Modular
Permission-driven
API-first
Integration-ready
Multi-tenant-ready
Audit-friendly
Mobile-friendly
Configurable
Observable
Secure
```

The real product journey should be:

``` text
Admission enquiry
→ Application
→ Enrollment
→ Student lifecycle
→ Academics
→ Attendance
→ Homework/LMS
→ Exams
→ Results
→ Fees
→ Communication
→ Activities
→ Transport/Library/Operations
→ Graduation
→ Alumni
```

Every module must reuse the shared Student, Parent, Staff, Academic
Session, Finance, Tenant and Permission models instead of creating
isolated duplicate data.

# UI/UX DESIGN SYSTEM --- IMPORTANT FOR THE CODING AGENT

## 1. Overall Product Design Direction

Build the school management system as a **premium modern SaaS product**,
not as an old-style ERP/admin panel.

The interface should feel:

-   Clean
-   Professional
-   Calm
-   Premium
-   Fast
-   Spacious
-   Easy for non-technical school staff
-   Data-rich without feeling crowded
-   Consistent across every module

Use the visual quality of modern products such as Linear, Notion,
Stripe, Vercel and modern banking dashboards as inspiration --- **do not
copy their branding or layouts**.

The product must feel suitable for:

``` text
Principal
School Admin
Teacher
Accountant
HR
Librarian
Transport Manager
Parent
Student
Super Admin
```

Do not make every role see the same complicated interface.

------------------------------------------------------------------------

# 2. Design Philosophy

### Primary rule

> Show the user what they need to act on, not everything the system
> knows.

Avoid:

-   Huge forms
-   Dense tables everywhere
-   Too many cards
-   Excessive borders
-   Random colors
-   Huge headings
-   Tiny text
-   Too many dropdowns
-   Nested modal dialogs
-   Unnecessary animations

Prefer:

``` text
Summary
→ Important information
→ Actions
→ Detailed data
```

------------------------------------------------------------------------

# 3. App Shell

Use a consistent application shell.

``` text
┌──────────────────────────────────────────────────────────────┐
│ Logo   Global Search       School / Session    🔔   Help  👤 │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ Dashboard    │             PAGE CONTENT                      │
│ Students     │                                               │
│ Admissions   │                                               │
│ Academics    │                                               │
│ Attendance   │                                               │
│ Finance      │                                               │
│ Operations   │                                               │
│ Reports      │                                               │
│              │                                               │
│ Settings     │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### Sidebar

-   Collapsible
-   Icons + labels when expanded
-   Icons only when collapsed
-   Active module clearly highlighted
-   Section headings for major groups
-   Favorites/pinned pages if practical
-   Remember collapsed/expanded state

Do not make the sidebar excessively wide.

Recommended desktop width:

``` text
Expanded: 240–260px
Collapsed: 68–76px
```

------------------------------------------------------------------------

# 4. Header

Header should contain:

### Left

-   Page title
-   Optional breadcrumb

### Center

Global search.

Placeholder:

``` text
Search students, staff, fees, books...
```

### Right

-   Academic session selector
-   School selector if multi-school
-   Notifications
-   Help
-   User profile

Avoid putting 10+ controls into the header.

------------------------------------------------------------------------

# 5. Global Search

Make global search a premium feature.

When clicked:

``` text
┌─────────────────────────────────────────────┐
│ 🔍 Search students, staff, fees...           │
├─────────────────────────────────────────────┤
│ Students                                    │
│   Rahul Sharma — Class 8A                   │
│   Ananya Singh — Class 10B                  │
│                                             │
│ Staff                                       │
│   Priya Verma — Mathematics                 │
│                                             │
│ Quick Actions                               │
│   Add Student                               │
│   Record Fee                                │
└─────────────────────────────────────────────┘
```

Support keyboard shortcut:

``` text
Ctrl/Cmd + K
```

Search results must respect permissions.

------------------------------------------------------------------------

# 6. Dashboard UX

Do not build a dashboard containing 20 random cards.

The dashboard should answer:

``` text
What is happening?
What needs attention?
What should I do next?
```

### Premium dashboard structure

``` text
Welcome / Context

[ Students ] [ Attendance ] [ Fees ] [ Admissions ]

-------------------------------------------------

Attention Required
[ overdue fees ] [ low attendance ] [ pending approvals ]

-------------------------------------------------

Attendance Trend        Fee Collection
        Chart                Chart

-------------------------------------------------

Admissions Funnel       Academic Performance

-------------------------------------------------

Upcoming Events         Recent Activity
```

Cards should be meaningful and clickable.

------------------------------------------------------------------------

# 7. KPI Cards

Use cards sparingly.

Example:

``` text
STUDENTS
2,486
+4.2% this session

View students →
```

Use:

-   Clear title
-   Large value
-   Small contextual information
-   Optional trend
-   Clickable action

Do not use 10 different colors for 10 cards.

------------------------------------------------------------------------

# 8. Color System

Use a restrained design system.

Recommended semantic palette:

``` text
Primary      → brand/action
Success      → completed/healthy
Warning      → attention
Danger       → destructive/critical
Info         → informational
Neutral      → normal UI
```

Do not use color as the only indicator.

For example:

``` text
● Paid
● Pending
● Overdue
```

should also have text labels.

Use CSS variables/design tokens rather than hard-coded colors throughout
React.

------------------------------------------------------------------------

# 9. Typography

Use one professional UI font family consistently.

Suggested hierarchy:

``` text
Page title       28–32px
Section title    20–24px
Card title       16–18px
Body             14–16px
Secondary        12–14px
```

Avoid extremely small text.

Use font weight to create hierarchy instead of excessive font sizes.

------------------------------------------------------------------------

# 10. Spacing

Use a consistent spacing scale.

Example:

``` text
4
8
12
16
20
24
32
40
48
```

Do not randomly use different margins on every page.

------------------------------------------------------------------------

# 11. Border Radius

Use a consistent radius system.

Example:

``` text
Small controls: 8px
Cards:          12–16px
Large panels:   16–20px
Pills:          999px
```

Avoid making every element excessively rounded.

------------------------------------------------------------------------

# 12. Shadows

Use subtle shadows.

Prefer:

``` text
border + very light shadow
```

instead of heavy floating shadows.

The UI should feel sophisticated, not like a collection of floating
boxes.

------------------------------------------------------------------------

# 13. Tables

Tables will be heavily used in a school ERP.

Do not create ugly spreadsheet-style tables.

### Recommended table

``` text
Students

[Search...] [Class ▼] [Section ▼] [Status ▼] [+ Add Student]

┌────┬──────────────┬───────┬────────┬──────────┬─────────┐
│ □  │ Student      │ Class │ Status │ Fees     │ Actions │
├────┼──────────────┼───────┼────────┼──────────┼─────────┤
│ □  │ Rahul Sharma │ 8-A   │ Active │ ₹12,500  │ •••     │
│ □  │ Ananya Singh │ 8-A   │ Active │ ₹0       │ •••     │
└────┴──────────────┴───────┴────────┴──────────┴─────────┘

Showing 1–25 of 2,486                  < 1 2 3 ... >
```

Features:

-   Server-side pagination
-   Search
-   Filters
-   Sorting
-   Column visibility
-   Row selection
-   Bulk actions
-   Export
-   Sticky table header where useful
-   Responsive behavior

------------------------------------------------------------------------

# 14. Never Put Everything in a Modal

Use a dedicated page for complex operations.

### Good

``` text
Students
→ Student Details
→ Edit Student
```

### Bad

``` text
Students
→ Giant modal containing 40 fields
```

Use modals for:

-   Confirmation
-   Quick add
-   Small edits
-   Short forms

Use full pages/drawers for complex workflows.

------------------------------------------------------------------------

# 15. Detail Pages

Every important entity should have a consistent detail page.

Example:

``` text
Rahul Sharma
Class 8-A · Student ID STU-1024

[Overview] [Academics] [Attendance] [Fees]
[Documents] [Transport] [Activity] [Timeline]

------------------------------------------------

Overview

Personal Information
Parent Information
Emergency Contact
Academic Information

------------------------------------------------

Recent Activity
...
```

Use tabs instead of a giant vertically scrolling page.

------------------------------------------------------------------------

# 16. Student Profile UX

Make the student profile one of the best screens in the product.

Header:

``` text
┌─────────────────────────────────────────────────┐
│ [Photo] Rahul Sharma                            │
│ Class 8-A • STU-1024                            │
│ ● Active                                        │
│                                                 │
│ [Edit] [Documents] [More]                      │
└─────────────────────────────────────────────────┘
```

Below:

``` text
Attendance     94%
Fees           ₹0 Due
Average        82%
Library        2 Books
```

Then tabs.

------------------------------------------------------------------------

# 17. Forms

Forms should be structured into logical sections.

Bad:

``` text
40 fields in one vertical list
```

Good:

``` text
Personal Information
─────────────────────
Name
DOB
Gender
Photo

Parent Information
───────────────────
Father
Mother
Phone
Email

Academic Information
─────────────────────
Class
Section
Admission Number
```

Use:

-   Inline validation
-   Clear labels
-   Helpful placeholders
-   Required indicators
-   Error messages beside fields
-   Save/Cancel actions
-   Unsaved changes warning

------------------------------------------------------------------------

# 18. Multi-Step Forms

Use a stepper for long workflows.

Example admission:

``` text
01 Student
   ↓
02 Parent
   ↓
03 Documents
   ↓
04 Application
   ↓
05 Payment
   ↓
06 Review
   ↓
07 Submit
```

Allow users to go backward without losing entered data.

------------------------------------------------------------------------

# 19. Wizard Design

Show progress clearly.

``` text
Step 3 of 6
━━━━━━━━━━━━━━○──────

Documents
Upload required documents.

[Back]                    [Continue]
```

Do not make users wonder how many steps remain.

------------------------------------------------------------------------

# 20. Empty States

Never show a blank page.

Bad:

``` text
No data.
```

Good:

``` text
          📚

No books found

Your library does not have any books matching
the current filters.

[Clear filters]     [+ Add Book]
```

Every empty state should explain:

1.  What happened
2.  Why
3.  What the user can do

------------------------------------------------------------------------

# 21. Loading States

Avoid flashing blank pages.

Use:

-   Skeleton loaders
-   Button loading states
-   Table skeletons
-   Chart skeletons

Example:

``` text
┌──────────────────────────────┐
│ ███████████                  │
│ ████████                     │
│ ███████████████              │
└──────────────────────────────┘
```

Do not show a giant spinner for every small request.

------------------------------------------------------------------------

# 22. Error States

Errors must be useful.

Bad:

``` text
Something went wrong.
```

Better:

``` text
Unable to load attendance

We couldn't retrieve today's attendance.
Please try again.

[Try again]
```

For validation:

``` text
Fee amount must be greater than ₹0.
```

Never expose raw backend exceptions to users.

------------------------------------------------------------------------

# 23. Toasts

Use toast notifications for lightweight feedback:

``` text
✓ Student added successfully
✓ Fee receipt generated
✓ Attendance saved
⚠ 3 records require attention
```

Do not use toasts for information users need to read for a long time.

------------------------------------------------------------------------

# 24. Confirmation Dialogs

Destructive actions require confirmation.

Example:

``` text
Deactivate Student?

This will prevent the student from appearing
in active student lists.

[Cancel] [Deactivate]
```

For destructive actions, explain the consequence.

------------------------------------------------------------------------

# 25. Command Center

The principal/admin dashboard should feel like a command center.

Top:

``` text
Good morning, Principal

Monday, 15 August

[Academic Session 2026–27 ▼]
```

Then:

``` text
Students
Attendance
Fees
Admissions
Staff
Transport
Alerts
```

The most important section should be:

``` text
Needs Attention
```

This is more useful than showing only statistics.

------------------------------------------------------------------------

# 26. Finance UI

Finance needs a clean professional interface.

Example:

``` text
Finance

₹48.6L
Collected this month

₹21.4L
Outstanding

₹3.2L
Overdue

[Record Payment] [Create Invoice] [Export]
```

Use:

-   Collection trend
-   Outstanding trend
-   Payment method breakdown
-   Due-date buckets
-   Recent transactions

Avoid overly colorful finance dashboards.

------------------------------------------------------------------------

# 27. Attendance UI

Teacher attendance must be extremely fast.

Example:

``` text
8-A Mathematics
15 August

Present: 38
Absent: 2
Late: 1

[Mark All Present]

──────────────────────────

☑ Rahul Sharma       Present
☑ Ananya Singh       Present
☐ Amit Kumar         Absent
☑ Priya Singh        Late

[Save Attendance]
```

Optimize for minimum clicks.

------------------------------------------------------------------------

# 28. Timetable UI

Use a visual grid.

``` text
        Mon      Tue      Wed      Thu      Fri

8:00    Math     English  Science  Math     Hindi

9:00    Physics  Math     English  Science  Math

10:00   Break    Break    Break    Break    Break
```

Allow:

-   Day/week view
-   Teacher view
-   Class view
-   Room view
-   Conflict indicators
-   Drag/drop only if reliable

------------------------------------------------------------------------

# 29. Exam UI

Show exam progress.

``` text
Mid-Term Examination

Mathematics
12 / 40 marks entered

[Pending]
```

Teachers should quickly identify missing marks.

Use status:

``` text
Draft
In Progress
Submitted
Verified
Published
```

------------------------------------------------------------------------

# 30. Parent Dashboard

The parent experience should be simpler than the admin experience.

Example:

``` text
Good morning, Shivanshu

Rahul Sharma
Class 8-A

Attendance       94%
Fees Due         ₹4,500
Next Class       Mathematics
Next Exam        Science — Friday

────────────────────────

Today's Updates

• Homework assigned
• PTM available
• Bus arriving in 12 min
```

Prioritize mobile-first design.

------------------------------------------------------------------------

# 31. Student Dashboard

Student UI should be engaging but not childish.

Use:

``` text
Today's Classes
Assignments
Upcoming Exams
Attendance
Achievements
Notifications
```

Avoid excessive cartoon graphics.

------------------------------------------------------------------------

# 32. Teacher Dashboard

Teacher dashboard should prioritize:

``` text
Today's Classes
Attendance Pending
Assignments to Review
Marks Pending
Messages
Tasks
```

Example:

``` text
Today's Schedule

08:00  8-A Mathematics
09:00  9-B Mathematics
10:30  7-C Mathematics

Needs Attention

12 assignments awaiting review
2 attendance records incomplete
```

------------------------------------------------------------------------

# 33. Mobile UX

The application must work properly at:

``` text
320px
375px
390px
414px
768px
1024px
1440px+
```

On mobile:

-   Sidebar becomes drawer
-   Tables become cards or horizontal scroll
-   Filters become bottom sheet/drawer
-   Actions remain accessible
-   Avoid tiny buttons
-   Use sticky primary actions where helpful

Minimum touch target:

``` text
~44px
```

------------------------------------------------------------------------

# 34. Responsive Tables

Do not squeeze 12 columns into a mobile screen.

Desktop:

``` text
Full table
```

Mobile:

``` text
Student Card

Rahul Sharma
8-A · STU-1024
Attendance 94%
Fees ₹4,500

[View]
```

Allow users to open full details.

------------------------------------------------------------------------

# 35. Charts

Charts must answer questions.

Good:

``` text
Attendance Trend — Last 6 Months
```

Bad:

``` text
Beautiful random pie chart
```

Use:

-   Line chart for trends
-   Bar chart for comparisons
-   Donut/pie only for simple proportions
-   Tables alongside important financial/academic figures

Every chart should have:

-   Title
-   Date range
-   Filter
-   Empty state
-   Tooltip
-   Accessible text alternative

------------------------------------------------------------------------

# 36. Filters

Use a consistent filter bar.

``` text
[Search...] [Class ▼] [Section ▼] [Status ▼] [Date ▼] [More]
```

Show active filters as chips:

``` text
Class: 8-A ×
Status: Active ×
```

Include:

``` text
Clear all
```

------------------------------------------------------------------------

# 37. Bulk Actions

For large datasets:

``` text
☑ 25 selected

[Send Message]
[Export]
[Assign]
[Mark Status]
[More]
```

Do not hide important bulk actions deep inside menus.

------------------------------------------------------------------------

# 38. Notification Center

Use:

``` text
All | Unread | Important
```

Each notification should contain:

``` text
● Fee payment received
Rahul Sharma's fee payment was successful.

10 minutes ago
```

Clicking it should navigate to the related record.

------------------------------------------------------------------------

# 39. Activity Timeline

For students, admissions, employees, tickets and important financial
records.

Example:

``` text
15 Aug
Fee payment recorded
₹15,000

14 Aug
Document uploaded
Birth Certificate

12 Aug
Class changed
8-B → 8-A

10 Aug
Parent profile updated
```

This gives the system a professional audit feel.

------------------------------------------------------------------------

# 40. Status System

Create reusable status badges.

Examples:

``` text
Active
Inactive
Pending
Approved
Rejected
Draft
Submitted
Verified
Published
Paid
Partially Paid
Overdue
Cancelled
```

Do not create a different visual style for every module.

------------------------------------------------------------------------

# 41. Role-Based UX

Different roles should get different navigation and dashboards.

### Principal

``` text
Command Center
Students
Academics
Finance
Staff
Reports
Alerts
```

### Teacher

``` text
My Classes
Attendance
Homework
Assignments
Exams
Students
Messages
```

### Accountant

``` text
Finance
Payments
Receipts
Dues
Expenses
Reports
```

### Parent

``` text
Children
Attendance
Homework
Fees
Results
Transport
Messages
```

Do not expose irrelevant modules.

------------------------------------------------------------------------

# 42. Permissions UX

Hide actions the user cannot perform.

But remember:

> UI hiding is not security.

Backend authorization must always enforce permissions.

If a user can view but not edit:

``` text
View ✓
Edit ✕
Delete ✕
```

------------------------------------------------------------------------

# 43. Accessibility

Build accessibility into the UI from day one.

Requirements:

-   Keyboard navigation
-   Visible focus states
-   Proper labels
-   ARIA where needed
-   Screen-reader-friendly dialogs
-   Accessible tables
-   Accessible form errors
-   Color contrast
-   Do not rely on color alone
-   Reduced-motion preference

------------------------------------------------------------------------

# 44. Dark Mode

Support dark mode only if the design system can support it properly.

Do not simply invert colors.

Create separate semantic tokens:

``` text
--background
--surface
--surface-elevated
--text-primary
--text-secondary
--border
--primary
--success
--warning
--danger
```

------------------------------------------------------------------------

# 45. Theme / Branding

For SaaS schools, allow:

-   Logo
-   School name
-   Primary brand color
-   Secondary color
-   Login background
-   Favicon
-   Report-card branding

Do not allow arbitrary colors to destroy accessibility.

Validate contrast.

------------------------------------------------------------------------

# 46. Login Page

Premium but simple.

``` text
┌─────────────────────────────────────────────┐
│                                             │
│              SCHOOL LOGO                    │
│                                             │
│          Welcome back                       │
│          Sign in to continue                │
│                                             │
│ Email                                       │
│ [____________________________]              │
│                                             │
│ Password                                    │
│ [____________________________]              │
│                                             │
│ [ ] Remember me        Forgot password?     │
│                                             │
│ [          Sign In          ]               │
│                                             │
└─────────────────────────────────────────────┘
```

Avoid excessive marketing content on the actual ERP login screen.

------------------------------------------------------------------------

# 47. Onboarding UX

Use a polished setup wizard.

``` text
Welcome
   ↓
School Profile
   ↓
Academic Session
   ↓
Classes
   ↓
Subjects
   ↓
Teachers
   ↓
Fees
   ↓
Import Students
   ↓
Finish
```

Show:

``` text
Setup 72% complete
```

Provide "Skip for now" where safe.

------------------------------------------------------------------------

# 48. Design Consistency Rules

Every page should reuse:

``` text
AppShell
PageHeader
Breadcrumb
SearchBar
FilterBar
KpiCard
DataTable
StatusBadge
Tabs
Drawer
Modal
FormSection
EmptyState
LoadingState
ErrorState
Pagination
Toast
ConfirmDialog
```

Build these as reusable React components.

Do not create separate versions of the same component for every module.

------------------------------------------------------------------------

# 49. React Frontend Architecture

Recommended structure:

``` text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── students/
│   ├── admissions/
│   ├── academics/
│   ├── attendance/
│   ├── exams/
│   ├── finance/
│   ├── hr/
│   ├── transport/
│   ├── library/
│   ├── inventory/
│   ├── communication/
│   └── reports/
│
├── hooks/
├── services/
├── api/
├── routes/
├── utils/
├── types/
├── constants/
└── styles/
```

Keep module-specific components inside the feature where possible.

------------------------------------------------------------------------

# 50. Reusable Design Tokens

Create a centralized design token system.

Example categories:

``` text
Colors
Typography
Spacing
Radius
Shadows
Breakpoints
Transitions
Z-index
```

Do not scatter design values throughout components.

------------------------------------------------------------------------

# 51. Animation

Use subtle animations only.

Good:

-   Drawer transition
-   Modal transition
-   Toast entrance
-   Button loading
-   Page skeleton
-   Small hover effects

Avoid:

-   Constant floating animations
-   Excessive bouncing
-   Long transitions
-   Animation on every card

Recommended interaction duration:

``` text
120–250ms
```

------------------------------------------------------------------------

# 52. Premium Details

Add polish through small details:

-   Hover states
-   Focus states
-   Smooth dropdowns
-   Skeleton loaders
-   Smart empty states
-   Keyboard shortcuts
-   Recent searches
-   Recently viewed students
-   Breadcrumbs
-   Sticky actions
-   Undo where safe
-   Clear success feedback
-   Contextual quick actions

These details make the product feel expensive without making it
complicated.

------------------------------------------------------------------------

# 53. Quick Actions

Dashboard should provide contextual actions.

Examples:

``` text
+ Add Student
+ Record Payment
+ Mark Attendance
+ Create Assignment
+ Schedule Exam
+ Send Notice
```

Do not make users navigate through 4 screens for common actions.

------------------------------------------------------------------------

# 54. Command Palette

Premium feature:

``` text
Ctrl + K

Search or run a command...

→ Add Student
→ Record Fee
→ Mark Attendance
→ Create Notice
→ Open Reports
→ Search Student
```

Permission-aware.

------------------------------------------------------------------------

# 55. Recent Items

Useful for admin users.

``` text
Recently Viewed

Rahul Sharma
Fee Receipt #FR-1024
Admission #ADM-501
Class 8-A
```

This reduces navigation time.

------------------------------------------------------------------------

# 56. User Experience Rule for Every Module

Every module should answer these five questions:

``` text
1. What is this?
2. What is the current status?
3. What needs attention?
4. What can I do?
5. Where can I see history?
```

If a page cannot answer these quickly, redesign it.

------------------------------------------------------------------------

# 57. Dashboard Personalization

Allow users to configure dashboard widgets where practical.

Example:

``` text
My Dashboard

[Attendance] [Fees] [Admissions]
[Upcoming Events] [Tasks]

Customize Dashboard
```

Store layout per user.

Do not make personalization mandatory.

------------------------------------------------------------------------

# 58. Premium Data Visualization

For principal/admin users, add drill-down:

``` text
School Attendance 91%
        ↓
Class 8 — 94%
        ↓
8-A — 96%
        ↓
Students below 75%
        ↓
Student Profile
```

Every important chart should lead to actionable data.

------------------------------------------------------------------------

# 59. Finance Drill-Down

Example:

``` text
₹48.6L Collected
       ↓
Class-wise
       ↓
Section-wise
       ↓
Student-wise
       ↓
Receipt
```

Avoid dashboards that show numbers with no path to the underlying
records.

------------------------------------------------------------------------

# 60. UI Performance

The interface should remain fast with thousands of students.

Use:

-   Server-side pagination
-   Virtualized long lists where necessary
-   Lazy-loaded routes
-   Code splitting
-   Debounced search
-   Cached reference data
-   Optimistic UI only where safe
-   Background exports
-   Avoid rendering thousands of DOM nodes

------------------------------------------------------------------------

# 61. Final UI Quality Checklist

Before considering any page complete:

### Visual

``` text
[ ] Consistent spacing
[ ] Consistent typography
[ ] Consistent buttons
[ ] Consistent colors
[ ] Consistent status badges
[ ] No unnecessary borders
[ ] No visual clutter
```

### UX

``` text
[ ] Clear primary action
[ ] Search available where useful
[ ] Filters available where useful
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success feedback
[ ] Confirmation for destructive actions
```

### Responsive

``` text
[ ] Desktop
[ ] Tablet
[ ] Mobile
[ ] No horizontal overflow except intentional tables
```

### Accessibility

``` text
[ ] Keyboard navigation
[ ] Focus state
[ ] Labels
[ ] Contrast
[ ] Screen reader support
```

### Performance

``` text
[ ] No unnecessary API calls
[ ] Pagination
[ ] Lazy loading
[ ] Debounced search
[ ] Optimized images
```

------------------------------------------------------------------------

# 62. Agent Instruction --- Most Important

The coding agent must **not treat this document as a request to generate
hundreds of disconnected pages**.

Build a coherent product.

Before creating a new component, check whether an existing reusable
component can be used.

Before creating a new UI pattern, check whether the same pattern already
exists elsewhere.

Before creating a new database entity, check whether an existing shared
entity should be reused.

Before adding a feature, consider:

``` text
Permissions
Loading
Empty state
Error state
Mobile
Accessibility
Audit
Performance
```

The agent should preserve a consistent design system across the entire
application.

------------------------------------------------------------------------

# 63. Implementation Order

Recommended implementation order:

## Phase 1 --- Design Foundation

``` text
Design tokens
App shell
Sidebar
Header
Buttons
Inputs
Forms
Tables
Cards
Tabs
Modals
Drawers
Toasts
Loading states
Empty states
Error states
Responsive system
```

## Phase 2 --- Core ERP

``` text
Authentication
Users
Roles
Students
Parents
Staff
Academic Sessions
Classes
Sections
Subjects
```

## Phase 3 --- Daily School Operations

``` text
Attendance
Timetable
Homework
Exams
Results
Fees
Communication
```

## Phase 4 --- Operations

``` text
Transport
Library
Inventory
Assets
Maintenance
```

## Phase 5 --- Engagement

``` text
Parent Portal
Student Portal
LMS
PTM
Activities
Sports
Clubs
```

## Phase 6 --- Enterprise

``` text
HRMS
Payroll
Procurement
Accounting
Workflow
Automation
Advanced Reports
```

## Phase 7 --- Premium

``` text
AI
Live GPS
Advanced BI
Custom Forms
Custom Workflows
SaaS Management
```

------------------------------------------------------------------------

# 64. Final Product Experience

The finished application should feel like:

``` text
Modern SaaS
      +
School ERP
      +
Parent/Student Platform
      +
Operations Management
      +
Analytics
      +
Automation
```

Not:

``` text
Old ERP
+
hundreds of menus
+
random CRUD screens
```

The goal is to make the user feel that the system is **simple on the
surface and powerful underneath**.
