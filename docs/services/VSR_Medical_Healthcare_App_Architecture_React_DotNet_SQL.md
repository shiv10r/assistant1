# VSR Health — Full-Stack Healthcare / Medical Platform Architecture

> Coding-agent-ready architecture for a healthcare management platform.
>
> **Fixed stack**
> - Frontend: React + TypeScript + Vite
> - Backend: ASP.NET Core Web API + C#
> - Database: Microsoft SQL Server
> - ORM: Entity Framework Core
> - Architecture: Modular Monolith + Clean Architecture principles
> - Authentication: JWT + Refresh Tokens
> - Authorization: Permission-based RBAC
> - Target: Desktop, tablet, mobile browser, Android WebView, iOS WKWebView
>
> **Important:** This document describes software architecture, not clinical practice. A real production healthcare product must be reviewed against applicable healthcare, privacy, consent, medical-device, data-retention, and security requirements in each jurisdiction.

---

# 1. Product Vision

Build a full healthcare platform for:

```text
Patients
Doctors
Nurses
Receptionists
Hospitals/Clinics
Labs
Pharmacies
Administrators
```

Core capabilities:

- Patient registration
- Doctor directory
- Appointment booking
- Clinic/hospital scheduling
- Patient profile
- Electronic medical record-ready architecture
- Encounter notes
- Vitals
- Diagnoses
- Allergies
- Medications
- Prescriptions
- Lab orders/results
- Radiology-ready architecture
- Pharmacy
- Billing
- Insurance-ready architecture
- Telemedicine-ready architecture
- Notifications
- Documents
- Consent
- Audit logs
- Admin operations

---

# 2. Product Surfaces

## Patient Portal

```text
Home
Find Doctor
Appointments
Medical Records
Prescriptions
Lab Results
Bills
Documents
Messages
Profile
Emergency Contacts
```

## Doctor/Clinical Portal

```text
Dashboard
Today's Appointments
Patients
Encounters
Clinical Notes
Vitals
Diagnoses
Prescriptions
Lab Orders
Reports
Schedule
Messages
```

## Reception / Operations

```text
Patient Registration
Appointments
Check-In
Queue
Billing
Insurance
Documents
Doctor Schedule
```

## Admin

```text
Facilities
Departments
Doctors
Staff
Patients
Appointments
Services
Labs
Pharmacy
Billing
Reports
Roles
Audit Logs
Settings
```

---

# 3. High-Level Architecture

```text
Patient / Doctor / Staff
          │
          ▼
React + TypeScript
          │ HTTPS
          ▼
ASP.NET Core Web API
          │
          ├── Identity
          ├── Patients
          ├── Providers
          ├── Scheduling
          ├── Encounters
          ├── Clinical Records
          ├── Prescriptions
          ├── Labs
          ├── Pharmacy
          ├── Billing
          ├── Documents
          ├── Consent
          ├── Notifications
          └── Admin
          │
          ▼
SQL Server
```

Future integrations:

```text
Lab Systems
Pharmacy Systems
Insurance
Payment Gateway
Video/Telemedicine
SMS/Email/WhatsApp
Object Storage
Medical Imaging/PACS
FHIR/HL7 interfaces
```

---

# 4. Frontend Structure

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── config/
│   └── store/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── cards/
│   ├── forms/
│   ├── tables/
│   ├── clinical/
│   └── shared/
├── features/
│   ├── auth/
│   ├── patients/
│   ├── doctors/
│   ├── appointments/
│   ├── encounters/
│   ├── vitals/
│   ├── diagnoses/
│   ├── medications/
│   ├── prescriptions/
│   ├── labs/
│   ├── pharmacy/
│   ├── billing/
│   ├── documents/
│   ├── telemedicine/
│   └── admin/
├── lib/
├── services/
├── hooks/
├── types/
└── main.tsx
```

---

# 5. Patient Routes

```text
/login
/register

/patient/dashboard
/patient/doctors
/patient/doctors/:doctorId

/patient/appointments
/patient/appointments/new
/patient/appointments/:id

/patient/records
/patient/prescriptions
/patient/labs
/patient/bills
/patient/documents
/patient/messages
/patient/profile
```

---

# 6. Clinical Routes

```text
/clinical/dashboard
/clinical/schedule

/clinical/patients
/clinical/patients/:patientId

/clinical/appointments/:appointmentId
/clinical/encounters/:encounterId

/clinical/prescriptions
/clinical/labs
/clinical/messages
```

---

# 7. Patient Dashboard

Cards:

```text
Next Appointment
Active Prescriptions
Recent Lab Result
Outstanding Bill
Recent Visit
Health Documents
```

Quick actions:

```text
Book Appointment
Upload Document
View Prescription
Message Clinic
```

---

# 8. Doctor Directory

Filters:

```text
Specialty
Facility
Location
Language
Availability
Consultation Type
```

Doctor card:

```text
Photo
Name
Specialty
Experience
Facility
Next available slot
Consultation type
[Book Appointment]
```

---

# 9. Appointment Flow

```text
Select Doctor
→ Select Facility
→ Select Date
→ Select Slot
→ Visit Type
→ Reason
→ Patient
→ Confirm
→ Appointment Created
→ Reminder Scheduled
```

Statuses:

```text
Requested
Confirmed
CheckedIn
InProgress
Completed
Cancelled
NoShow
Rescheduled
```

---

# 10. Scheduling Model

Entities:

```text
ProviderSchedule
ScheduleSlot
Appointment
AppointmentStatusHistory
```

Prevent double-booking using backend concurrency rules.

---

# 11. Check-In + Queue

Reception flow:

```text
Patient arrives
→ Verify registration
→ Check in
→ Queue token
→ Vitals
→ Doctor encounter
```

Queue statuses:

```text
Waiting
Called
InConsultation
Completed
Skipped
```

---

# 12. Patient Profile

Sections:

```text
Demographics
Contact
Emergency Contact
Insurance
Allergies
Chronic Conditions
Medications
Past Encounters
Lab Results
Documents
Consents
```

---

# 13. Clinical Encounter

Core workflow:

```text
Appointment
→ Encounter Created
→ Chief Complaint
→ Vitals
→ History
→ Examination
→ Assessment
→ Diagnoses
→ Orders
→ Prescription
→ Plan
→ Close Encounter
```

Clinical data must be permission-controlled and audited.

---

# 14. Encounter Sections

```text
Chief Complaint
History of Present Illness
Past Medical History
Allergies
Current Medications
Vitals
Examination
Assessment
Diagnosis
Plan
Orders
Prescription
Follow-Up
Clinical Notes
```

Use templates, but never force clinicians into unsafe defaults.

---

# 15. Vitals

Possible fields:

```text
Temperature
Pulse
Respiratory Rate
Blood Pressure
SpO2
Weight
Height
BMI
Pain Score
```

Units must be explicit.

---

# 16. Diagnoses

Entity:

```text
Diagnosis
```

Fields:

```text
EncounterId
CodeSystem
Code
Description
Type
RecordedBy
RecordedAt
```

Design should be terminology-system ready.

---

# 17. Allergies

Fields:

```text
Substance
Reaction
Severity
Status
RecordedAt
RecordedBy
```

Allergy information should be visible in clinical context.

---

# 18. Medications

Patient medication list:

```text
Medication
Dose
Route
Frequency
StartDate
EndDate
Status
Prescriber
```

---

# 19. Prescription Flow

```text
Doctor selects medication
→ dose
→ route
→ frequency
→ duration
→ instructions
→ interaction/allergy hook
→ sign/confirm
→ prescription created
```

Clinical decision support should be integration-ready, not invented by frontend.

---

# 20. Lab Orders

Doctor:

```text
Order Test
→ Specimen
→ Priority
→ Instructions
→ Lab Order Created
```

Statuses:

```text
Ordered
Collected
Processing
Completed
Cancelled
```

---

# 21. Lab Results

Fields:

```text
Test
Result
Unit
Reference Range
Flag
ObservedAt
VerifiedAt
VerifiedBy
```

Do not interpret abnormal results automatically unless a validated clinical rules engine is explicitly integrated.

---

# 22. Pharmacy Module

MVP:

```text
Prescription Queue
Dispense
Partial Dispense
Medication Inventory
Stock Alerts
```

Future:

```text
e-prescribing integration
drug database
interaction engine
```

---

# 23. Billing

Support:

```text
Consultation
Procedure
Lab
Medication
Room/Facility Charge
Discount
Tax
Insurance share
Patient share
```

Entities:

```text
Invoice
InvoiceItem
Payment
Adjustment
```

---

# 24. Insurance-Ready Architecture

Entities:

```text
InsurancePolicy
Coverage
Claim
ClaimItem
PreAuthorization
```

MVP may store policy details only.

---

# 25. Documents

Examples:

```text
ID
Insurance Card
Referral
Prescription
Lab Report
Discharge Summary
Consent
Clinical Upload
```

Production storage:

```text
Object Storage
```

SQL stores metadata.

---

# 26. Consent

Track consent separately.

Examples:

```text
Treatment consent
Data sharing
Telemedicine
Research optional
Communication preferences
```

Fields:

```text
ConsentType
Version
Status
GrantedAt
RevokedAt
CapturedBy
DocumentId
```

---

# 27. Telemedicine — Phase 2

Flow:

```text
Appointment
→ Virtual Visit
→ secure meeting link/token
→ waiting room
→ consultation
→ clinical note
→ prescription/order
```

Keep video provider abstract:

```csharp
ITelemedicineProvider
```

---

# 28. Backend Solution

```text
backend/
├── VSR.Health.Api/
├── VSR.Health.Application/
├── VSR.Health.Domain/
├── VSR.Health.Infrastructure/
├── VSR.Health.Contracts/
└── VSR.Health.Tests/
```

---

# 29. Main Backend Modules

```text
Identity
Facilities
Providers
Patients
Scheduling
Appointments
Encounters
ClinicalRecords
Vitals
Diagnoses
Allergies
Medications
Prescriptions
Labs
Pharmacy
Billing
Insurance
Documents
Consent
Notifications
Telemedicine
Admin
Audit
```

---

# 30. Core Entities

```text
User
Role
Permission
RefreshToken

Facility
Department
Provider
ProviderSchedule

Patient
PatientContact
EmergencyContact
InsurancePolicy

Appointment
AppointmentStatusHistory

Encounter
ClinicalNote
Vital
Diagnosis
Allergy
Medication
Prescription
PrescriptionItem

LabOrder
LabOrderItem
LabResult

PharmacyItem
DispenseRecord

Invoice
InvoiceItem
Payment

Document
Consent

Notification
AuditLog
```

---

# 31. SQL Tables

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens

Facilities
Departments
Providers
ProviderSchedules
ScheduleSlots

Patients
PatientContacts
EmergencyContacts
InsurancePolicies

Appointments
AppointmentStatusHistory

Encounters
ClinicalNotes
Vitals
Diagnoses
Allergies
Medications
Prescriptions
PrescriptionItems

LabOrders
LabOrderItems
LabResults

PharmacyItems
DispenseRecords

Invoices
InvoiceItems
Payments

Documents
Consents

Notifications
AuditLogs
```

---

# 32. Patient Table

```text
Id
MedicalRecordNumber
FirstName
LastName
DateOfBirth
Sex
Phone
Email
Address
Status
CreatedAt
UpdatedAt
RowVersion
```

Do not use one field for every demographic concept if localization requirements become broader.

---

# 33. Appointment Table

```text
Id
PatientId
ProviderId
FacilityId
AppointmentType
StartAt
EndAt
Status
Reason
CheckInAt
CompletedAt
CreatedAt
UpdatedAt
RowVersion
```

---

# 34. Encounter Table

```text
Id
PatientId
ProviderId
AppointmentId
FacilityId
EncounterType
StartedAt
EndedAt
Status
ChiefComplaint
Assessment
Plan
CreatedAt
UpdatedAt
RowVersion
```

---

# 35. API Examples

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh

GET  /api/v1/providers
GET  /api/v1/providers/{id}
GET  /api/v1/providers/{id}/availability

POST /api/v1/appointments
GET  /api/v1/me/appointments
POST /api/v1/appointments/{id}/cancel

GET  /api/v1/patients/{id}
GET  /api/v1/patients/{id}/encounters

POST /api/v1/encounters
PUT  /api/v1/encounters/{id}

POST /api/v1/encounters/{id}/vitals
POST /api/v1/encounters/{id}/diagnoses
POST /api/v1/encounters/{id}/prescriptions
POST /api/v1/encounters/{id}/lab-orders

GET  /api/v1/patients/{id}/lab-results
GET  /api/v1/patients/{id}/prescriptions

GET  /api/v1/invoices
POST /api/v1/payments
```

---

# 36. Authorization

Examples:

```text
patient.view_own
patient.edit_own

provider.patient.view
provider.encounter.create
provider.encounter.update
provider.prescription.create
provider.lab_order.create

nurse.vitals.create

reception.appointment.manage
reception.patient.register

billing.invoice.manage
pharmacy.dispense

admin.user.manage
admin.settings.manage
```

Backend must always enforce access.

---

# 37. Clinical Data Access

Access should consider:

```text
Role
Facility
Treatment relationship
Explicit assignment
Emergency access policy
Consent
```

Do not rely only on global role names.

---

# 38. Audit Logging

Mandatory for sensitive data access and changes.

Track:

```text
Patient record viewed
Clinical note created/edited
Prescription created
Lab result viewed
Document downloaded
Consent changed
User permission changed
Emergency access used
```

Fields:

```text
UserId
PatientId
Action
EntityType
EntityId
Timestamp
Reason
RequestId
```

---

# 39. Security

Minimum:

```text
HTTPS
JWT + refresh tokens
MFA-ready
RBAC/permissions
Field masking
Strong audit
Encryption
Secure file storage
Rate limiting
Input validation
Secure headers
Secrets outside repo
```

Sensitive health data must not be logged casually.

---

# 40. Data Segmentation

Support:

```text
OrganizationId
FacilityId
```

on relevant records.

This makes the system hospital/clinic-group ready.

---

# 41. Concurrency

Use `RowVersion` on:

```text
Appointments
Encounters
Prescriptions
LabOrders
Invoices
```

Prevent double-booking and stale edits.

---

# 42. Scheduling Concurrency

When booking:

```text
check provider slot
→ acquire/validate availability
→ create appointment
→ commit
```

If another user took the slot:

```text
409 Conflict
```

Frontend shows:

```text
This slot was just booked. Please choose another time.
```

---

# 43. Notifications

Patient:

```text
Appointment confirmation
Appointment reminder
Prescription available
Lab result available
Bill generated
Payment received
```

Staff:

```text
New appointment
Cancelled appointment
Lab result ready
Urgent task
```

Channels later:

```text
In-app
Email
SMS
WhatsApp
Push
```

---

# 44. Admin Dashboard

Cards:

```text
Appointments Today
Patients Today
Doctors On Duty
Pending Lab Results
Pending Bills
Pharmacy Low Stock
Cancelled Appointments
No Shows
```

Charts:

```text
Appointments trend
Department load
Revenue
No-show rate
Patient volume
```

---

# 45. Mobile/WebView

Mandatory:

- 320px+
- Safe-area support
- Appointment cards
- Patient cards
- No desktop-only grids
- Touch-friendly date/slot selection
- Keyboard-safe forms
- Document upload from mobile
- WebView-safe auth
- No page-level horizontal overflow

---

# 46. MVP Scope

## Patient

```text
Login/register
Doctor search
Book appointment
Appointments
Profile
Prescriptions
Lab results
Bills
Documents
```

## Clinical

```text
Dashboard
Schedule
Patient list
Encounter
Vitals
Diagnosis
Prescription
Lab order
```

## Reception/Admin

```text
Patient registration
Appointment management
Queue/check-in
Doctor schedule
Billing basics
Users/roles
Audit logs
```

---

# 47. Phase 2

```text
Telemedicine
Pharmacy inventory
Insurance
Claims
Radiology
FHIR/HL7 integration
External lab integration
Payment gateway
Patient messaging
```

---

# 48. Phase 3

```text
Multi-hospital deployment
Advanced care pathways
Clinical decision support integrations
PACS
Medical device integrations
Home health
Remote monitoring
AI documentation assistant
```

---

# 49. Coding Agent Master Prompt

```text
Build the VSR Health healthcare platform described in this architecture.

Fixed stack:
React + TypeScript + Vite
ASP.NET Core Web API + C#
Entity Framework Core
Microsoft SQL Server

Use a modular monolith with Clean Architecture principles.

Implement real workflows:

Patient:
Find Doctor
→ Choose Slot
→ Book Appointment
→ Check In
→ Consultation
→ Prescription/Lab Orders
→ Results/Documents.

Clinical:
Appointment
→ Encounter
→ Vitals
→ Notes
→ Diagnosis
→ Prescription
→ Lab Order
→ Complete Encounter.

All clinical and billing records must be backend-authoritative.

Use permission-based authorization and audit sensitive record access.

Use OrganizationId/FacilityId-ready design.

Use optimistic concurrency for appointments and clinical records.

Do not invent clinical interpretations, diagnosis logic, medication interaction logic, or abnormal-result advice in the frontend.

Keep such functionality behind validated clinical/integration services.

Use object-storage-ready document architecture.

Support desktop, tablet, mobile browser, Android WebView and iOS WKWebView.

At the end:
1. run frontend build
2. run dotnet build
3. run tests
4. apply/check migrations
5. seed demo facilities/doctors/patients
6. verify appointment collision handling
7. verify encounter flow
8. verify permission checks
9. verify audit logs
10. fix all errors
```

---

# 50. Definition of Done

- [ ] Patient login
- [ ] Doctor directory
- [ ] Appointment booking
- [ ] Appointment management
- [ ] Patient profile
- [ ] Clinical encounter
- [ ] Vitals
- [ ] Diagnoses
- [ ] Prescriptions
- [ ] Lab orders/results
- [ ] Billing basics
- [ ] Documents
- [ ] Consent-ready design
- [ ] Admin
- [ ] Audit logs
- [ ] React build succeeds
- [ ] .NET build succeeds
- [ ] EF migrations succeed
- [ ] Mobile/WebView works
