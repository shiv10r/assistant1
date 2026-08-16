# VSR Hotel Management System — Full Stack Architecture

## 1. Final Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- TanStack Table
- Recharts
- date-fns
- Axios or Fetch wrapper

### Backend
- ASP.NET Core Web API
- C#
- Clean Architecture
- Entity Framework Core
- FluentValidation
- JWT Authentication
- Role-Based Authorization
- AutoMapper or explicit mapping
- Swagger / OpenAPI
- Structured logging
- Global exception handling
- Background services where required

### Database
- Microsoft SQL Server
- Entity Framework Core migrations
- Stored procedures only where they provide a clear reporting/performance advantage
- Proper indexing, constraints, transactions, and audit columns

### Optional Infrastructure
- Redis for caching
- SignalR for real-time room/housekeeping updates
- Blob/Object storage for guest IDs, invoices, room images, maintenance images
- Email/SMS provider
- Payment gateway
- Background job processor

---

# 2. Architecture Overview

```text
┌───────────────────────────────────────────────────────────────┐
│                         CLIENTS                               │
│                                                               │
│  Desktop Browser   Tablet   Mobile Browser   Android/iOS      │
│                                           WebView             │
└──────────────────────────────┬────────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                       REACT FRONTEND                          │
│                                                               │
│  Pages                                                        │
│  Feature Modules                                              │
│  Components                                                   │
│  Forms                                                        │
│  State                                                        │
│  API Client                                                   │
│  Authentication                                               │
│  Route Guards                                                 │
└──────────────────────────────┬────────────────────────────────┘
                               │ REST API
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    ASP.NET CORE WEB API                       │
│                                                               │
│ Controllers / Endpoints                                       │
│ Authentication / Authorization                                │
│ Middleware                                                    │
│ Validation                                                    │
│ Application Services                                          │
│ Use Cases                                                     │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                         │
│                                                               │
│ Commands / Queries                                            │
│ DTOs                                                          │
│ Interfaces                                                    │
│ Business Rules                                                │
│ Transaction Boundaries                                        │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                            │
│                                                               │
│ Entities                                                      │
│ Value Objects                                                 │
│ Domain Rules                                                  │
│ Enums                                                         │
│ Domain Exceptions                                             │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                       │
│                                                               │
│ EF Core                                                       │
│ SQL Server                                                    │
│ Repository Implementations                                    │
│ Email                                                         │
│ File Storage                                                  │
│ Payment Integrations                                          │
│ Cache                                                         │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      SQL SERVER DB                            │
└───────────────────────────────────────────────────────────────┘
```

---

# 3. Recommended Solution Structure

```text
VSR.HotelManagement/
│
├── frontend/
│   └── vsr-hms-web/
│
├── backend/
│   ├── VSR.HMS.Api/
│   ├── VSR.HMS.Application/
│   ├── VSR.HMS.Domain/
│   ├── VSR.HMS.Infrastructure/
│   ├── VSR.HMS.Contracts/
│   └── VSR.HMS.Tests/
│
├── database/
│   ├── scripts/
│   ├── seed/
│   └── docs/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── database/
│
└── README.md
```

---

# 4. Frontend Architecture

## Frontend Folder Structure

```text
frontend/vsr-hms-web/
│
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── store/
│   │   └── config/
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── dialogs/
│   │   ├── charts/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── reservations/
│   │   ├── front-desk/
│   │   ├── guests/
│   │   ├── rooms/
│   │   ├── housekeeping/
│   │   ├── rates/
│   │   ├── billing/
│   │   ├── payments/
│   │   ├── maintenance/
│   │   ├── reports/
│   │   ├── staff/
│   │   └── settings/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── validation/
│   │   ├── formatting/
│   │   └── utils/
│   │
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── constants/
│   ├── main.tsx
│   └── App.tsx
│
├── public/
├── .env
├── package.json
└── vite.config.ts
```

---

# 5. Frontend Feature Structure

Each feature should be self-contained.

Example:

```text
features/reservations/
│
├── api/
│   ├── reservation.api.ts
│   └── reservation.queryKeys.ts
│
├── components/
│   ├── ReservationTable.tsx
│   ├── ReservationCard.tsx
│   ├── ReservationFilters.tsx
│   └── ReservationStatusBadge.tsx
│
├── pages/
│   ├── ReservationListPage.tsx
│   ├── ReservationDetailsPage.tsx
│   └── CreateReservationPage.tsx
│
├── hooks/
│   ├── useReservations.ts
│   └── useReservation.ts
│
├── schemas/
│   └── reservation.schema.ts
│
├── types/
│   └── reservation.types.ts
│
└── utils/
    └── reservation.utils.ts
```

---

# 6. Frontend State Strategy

Do not store everything globally.

## TanStack Query

Use for server data:

```text
Reservations
Guests
Rooms
Housekeeping
Rates
Invoices
Payments
Reports
Staff
Settings
```

## Zustand

Use for small client-side state:

```text
Authenticated user
Selected property
Sidebar state
Theme
Global filter state
Temporary booking wizard state
```

## React Hook Form

Use for form state.

---

# 7. React Routes

```text
/login

/dashboard

/reservations
/reservations/new
/reservations/:reservationId
/reservations/calendar

/front-desk
/front-desk/check-in/:reservationId
/front-desk/check-out/:reservationId

/guests
/guests/:guestId

/rooms
/rooms/:roomId
/room-types

/housekeeping
/housekeeping/tasks

/rates
/rates/calendar
/rate-plans

/billing
/folios/:folioId
/invoices
/payments

/maintenance
/maintenance/:ticketId

/reports

/staff
/roles

/settings
/settings/property
/settings/taxes
/settings/booking
/settings/payments
/settings/notifications

/audit-logs
```

---

# 8. Frontend API Layer

Create one configured API client.

```text
src/lib/api/apiClient.ts
```

Responsibilities:

- API base URL
- Access token
- Refresh token handling
- Request headers
- Response parsing
- Global 401 handling
- Global API error normalization

Example modules:

```text
src/services/
├── auth.service.ts
├── reservation.service.ts
├── guest.service.ts
├── room.service.ts
├── housekeeping.service.ts
├── billing.service.ts
├── payment.service.ts
├── maintenance.service.ts
├── report.service.ts
└── staff.service.ts
```

UI components should never contain raw API URLs.

---

# 9. Backend Clean Architecture

```text
VSR.HMS.Api
        │
        ▼
VSR.HMS.Application
        │
        ▼
VSR.HMS.Domain

VSR.HMS.Infrastructure
        │
        ├── references Application
        └── references Domain
```

## Dependency Rule

```text
Domain
  ↑
Application
  ↑
Infrastructure
  ↑
API
```

Domain must not depend on:

- EF Core
- SQL Server
- HTTP
- ASP.NET
- External APIs

---

# 10. Backend Project Responsibilities

## VSR.HMS.Domain

Contains:

```text
Entities
Enums
Value Objects
Domain rules
Domain exceptions
```

Example entities:

```text
Property
Room
RoomType
Guest
Reservation
ReservationRoom
Folio
FolioItem
Payment
Invoice
HousekeepingTask
MaintenanceTicket
Staff
Role
Permission
AuditLog
```

---

## VSR.HMS.Application

Contains:

```text
DTOs
Commands
Queries
Use cases
Interfaces
Validation
Business workflow orchestration
```

Example:

```text
Reservations/
├── Commands/
│   ├── CreateReservation/
│   ├── UpdateReservation/
│   ├── CancelReservation/
│   ├── CheckInGuest/
│   └── CheckOutGuest/
│
└── Queries/
    ├── GetReservations/
    ├── GetReservationById/
    └── GetAvailability/
```

---

## VSR.HMS.Infrastructure

Contains:

```text
Persistence
EF Core DbContext
Repositories
Migrations
Identity implementation
Email service
File storage
Payment gateway
Caching
External integrations
```

---

## VSR.HMS.Api

Contains:

```text
Controllers
Middleware
Authentication
Authorization
Dependency injection
Swagger
Filters
Health checks
API configuration
```

Controllers must remain thin.

Bad:

```text
Controller
→ 300 lines of business logic
```

Good:

```text
Controller
→ Application use case
→ Domain rules
→ Repository
```

---

# 11. Backend Folder Structure

```text
backend/
│
├── VSR.HMS.Api/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Extensions/
│   ├── Filters/
│   ├── Authorization/
│   ├── Program.cs
│   └── appsettings.json
│
├── VSR.HMS.Application/
│   ├── Common/
│   │   ├── Interfaces/
│   │   ├── Exceptions/
│   │   ├── Behaviors/
│   │   └── Models/
│   │
│   ├── Auth/
│   ├── Reservations/
│   ├── Guests/
│   ├── Rooms/
│   ├── Housekeeping/
│   ├── Billing/
│   ├── Payments/
│   ├── Maintenance/
│   ├── Reports/
│   └── Staff/
│
├── VSR.HMS.Domain/
│   ├── Entities/
│   ├── Enums/
│   ├── ValueObjects/
│   ├── Events/
│   └── Exceptions/
│
├── VSR.HMS.Infrastructure/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   ├── Migrations/
│   │   ├── Repositories/
│   │   └── HotelDbContext.cs
│   │
│   ├── Authentication/
│   ├── Email/
│   ├── Storage/
│   ├── Payments/
│   └── Caching/
│
└── VSR.HMS.Tests/
```

---

# 12. Main Backend Modules

Build modules around hotel business capabilities.

```text
Authentication
Properties
Reservations
Availability
Front Desk
Guests
Rooms
Room Types
Housekeeping
Rates
Rate Plans
Folios
Payments
Invoices
Maintenance
Reports
Staff
Roles & Permissions
Notifications
Audit Logs
Settings
```

---

# 13. Core Database Design

## Main Tables

```text
Organizations
Properties

Users
Roles
Permissions
UserRoles
RolePermissions

Guests

RoomTypes
Rooms
RoomAmenities
RoomTypeAmenities

Reservations
ReservationRooms
ReservationGuests

RatePlans
RoomRates
Availability

Folios
FolioItems
Payments
Invoices

HousekeepingTasks

MaintenanceTickets

GuestPreferences
GuestDocuments

Services
ReservationServices

Notifications

AuditLogs

PropertySettings
Taxes
```

---

# 14. Database Relationship Model

```text
Organization
    │
    └── Properties
            │
            ├── Rooms
            │    └── RoomType
            │
            ├── Reservations
            │       ├── Guest
            │       ├── ReservationRooms
            │       └── Folio
            │              ├── FolioItems
            │              └── Payments
            │
            ├── HousekeepingTasks
            │
            ├── MaintenanceTickets
            │
            ├── RatePlans
            │
            └── Staff
```

---

# 15. Recommended Database Tables

## Properties

```text
Id
OrganizationId
Name
Code
AddressLine1
AddressLine2
City
State
Country
PostalCode
Phone
Email
Currency
TimeZone
CheckInTime
CheckOutTime
IsActive
CreatedAt
UpdatedAt
```

---

## Guests

```text
Id
FirstName
LastName
Email
Phone
DateOfBirth
Nationality
Country
Address
IdType
IdNumber
VipLevel
IsBlacklisted
CreatedAt
UpdatedAt
```

---

## RoomTypes

```text
Id
PropertyId
Name
Code
Description
BaseOccupancy
MaxOccupancy
BedType
BasePrice
ExtraAdultPrice
ExtraChildPrice
IsActive
CreatedAt
UpdatedAt
```

---

## Rooms

```text
Id
PropertyId
RoomTypeId
RoomNumber
Floor
Status
HousekeepingStatus
IsSmoking
IsAccessible
Notes
CreatedAt
UpdatedAt
RowVersion
```

Use `RowVersion` for optimistic concurrency.

---

## Reservations

```text
Id
PropertyId
ConfirmationNumber
PrimaryGuestId
CheckInDate
CheckOutDate
Adults
Children
Status
BookingSource
RatePlanId
Subtotal
TaxAmount
DiscountAmount
TotalAmount
PaidAmount
BalanceAmount
SpecialRequests
CreatedBy
CreatedAt
UpdatedAt
RowVersion
```

---

## ReservationRooms

```text
Id
ReservationId
RoomTypeId
RoomId
RatePerNight
Adults
Children
Status
```

---

## Folios

```text
Id
ReservationId
GuestId
Status
Subtotal
TaxAmount
DiscountAmount
TotalAmount
PaidAmount
BalanceAmount
CreatedAt
UpdatedAt
```

---

## FolioItems

```text
Id
FolioId
ServiceId
Description
Quantity
UnitPrice
TaxAmount
DiscountAmount
TotalAmount
PostedAt
PostedBy
IsVoided
```

---

## Payments

```text
Id
FolioId
ReservationId
Amount
PaymentMethod
PaymentStatus
TransactionReference
PaymentDate
ReceivedBy
CreatedAt
```

---

## HousekeepingTasks

```text
Id
PropertyId
RoomId
AssignedToUserId
TaskType
Priority
Status
Notes
ScheduledAt
StartedAt
CompletedAt
InspectedByUserId
CreatedAt
UpdatedAt
```

---

## MaintenanceTickets

```text
Id
PropertyId
RoomId
Category
Priority
Description
Status
ReportedByUserId
AssignedToUserId
CreatedAt
CompletedAt
```

---

# 16. Database Standards

Every business table should normally include:

```text
Id
CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

Where concurrency matters:

```text
RowVersion
```

Use:

- Foreign keys
- Unique constraints
- NOT NULL constraints
- Check constraints where useful
- Decimal types for money
- Proper date/time types
- UTC timestamps for system events
- Property timezone for operational display

Never store monetary values in float/double.

Recommended:

```text
decimal(18,2)
```

---

# 17. SQL Server Indexing Strategy

Important indexes:

```text
Reservations(PropertyId, CheckInDate)
Reservations(PropertyId, CheckOutDate)
Reservations(PropertyId, Status)
Reservations(ConfirmationNumber)

Guests(Email)
Guests(Phone)

Rooms(PropertyId, Status)
Rooms(PropertyId, RoomTypeId)

Payments(ReservationId)
Payments(FolioId)

HousekeepingTasks(PropertyId, Status)
HousekeepingTasks(RoomId, Status)

MaintenanceTickets(PropertyId, Status)
```

Do not create indexes blindly.

Validate indexes against real queries.

---

# 18. Authentication Architecture

Use JWT authentication.

Flow:

```text
React
  │
  ├── POST /api/auth/login
  │
.NET API
  │
  ├── Validate credentials
  ├── Generate access token
  └── Generate refresh token
```

Access token should contain claims such as:

```text
UserId
OrganizationId
PropertyId
Role
Permissions
```

Prefer short-lived access tokens plus refresh tokens.

---

# 19. Authorization

Do not use only:

```text
if role == "Admin"
```

Use permission-based authorization.

Examples:

```text
reservation.view
reservation.create
reservation.update
reservation.cancel

guest.view
guest.edit

room.view
room.manage

checkin.perform
checkout.perform

billing.view
billing.post
billing.refund

housekeeping.assign
housekeeping.update

reports.view

staff.manage
settings.manage
```

React hides unavailable actions.

.NET API always performs final authorization.

Frontend security is not backend security.

---

# 20. Reservation Workflow

```text
React Reservation Form
        │
        ▼
POST /api/reservations
        │
        ▼
CreateReservation Use Case
        │
        ├── Validate dates
        ├── Validate guest
        ├── Check availability
        ├── Calculate rate
        ├── Calculate tax
        ├── Create reservation
        └── Save transaction
        │
        ▼
SQL Server
```

---

# 21. Check-In Workflow

```text
Reservation
   │
   ▼
Validate reservation status
   │
   ▼
Validate room availability
   │
   ▼
Assign room
   │
   ▼
Record ID / deposit
   │
   ▼
Reservation.Status = CheckedIn
   │
   ▼
Room.Status = Occupied
   │
   ▼
Create / activate Folio
   │
   ▼
Audit Log
```

All important status changes should occur inside one DB transaction.

---

# 22. Check-Out Workflow

```text
Get active folio
      │
      ▼
Calculate outstanding balance
      │
      ▼
Collect / validate payment
      │
      ▼
Generate invoice
      │
      ▼
Reservation = CheckedOut
      │
      ▼
Room = VacantDirty
      │
      ▼
Create Housekeeping Task
      │
      ▼
Audit Log
```

This should be transactional.

---

# 23. Room State Machine

Recommended state progression:

```text
VacantClean
    │
    ▼
Reserved
    │
    ▼
Occupied
    │
    ▼
VacantDirty
    │
    ▼
Cleaning
    │
    ▼
Inspection
    │
    ▼
VacantClean
```

Exceptional states:

```text
OutOfOrder
OutOfService
```

Do not allow arbitrary invalid transitions.

---

# 24. Reservation State Machine

```text
Pending
   │
   ▼
Confirmed
   │
   ├────────────► Cancelled
   │
   ├────────────► NoShow
   │
   ▼
CheckedIn
   │
   ▼
CheckedOut
```

Implement transition validation in the backend.

---

# 25. API Design

Base URL:

```text
/api/v1
```

Example endpoints:

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

GET    /api/v1/dashboard

GET    /api/v1/reservations
POST   /api/v1/reservations
GET    /api/v1/reservations/{id}
PUT    /api/v1/reservations/{id}
POST   /api/v1/reservations/{id}/cancel
POST   /api/v1/reservations/{id}/check-in
POST   /api/v1/reservations/{id}/check-out

GET    /api/v1/availability

GET    /api/v1/guests
POST   /api/v1/guests
GET    /api/v1/guests/{id}
PUT    /api/v1/guests/{id}

GET    /api/v1/rooms
GET    /api/v1/rooms/{id}
PATCH  /api/v1/rooms/{id}/status

GET    /api/v1/housekeeping/tasks
POST   /api/v1/housekeeping/tasks
PATCH  /api/v1/housekeeping/tasks/{id}

GET    /api/v1/folios/{id}
POST   /api/v1/folios/{id}/items
POST   /api/v1/folios/{id}/payments

GET    /api/v1/invoices/{id}

GET    /api/v1/maintenance
POST   /api/v1/maintenance

GET    /api/v1/reports/occupancy
GET    /api/v1/reports/revenue
GET    /api/v1/reports/payments
```

---

# 26. Standard API Response

Successful list:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

Validation error:

```json
{
  "type": "validation_error",
  "title": "Validation failed",
  "errors": {
    "checkOutDate": [
      "Check-out date must be after check-in date."
    ]
  }
}
```

Use one consistent error format across the application.

---

# 27. Pagination

Do pagination on the server.

Bad:

```text
Load 50,000 reservations
→ filter in React
```

Good:

```text
GET /reservations?page=1&pageSize=25&status=confirmed
```

---

# 28. Search Architecture

For reservation and guest search:

```text
Search by
- Confirmation Number
- Guest Name
- Phone
- Email
- Room Number
```

API:

```text
GET /api/v1/search?q=rahul
```

or module-specific queries.

Debounce frontend search.

---

# 29. Validation

## Frontend

Use:

```text
React Hook Form
+
Zod
```

for instant UX validation.

## Backend

Perform validation again in .NET.

Never trust frontend validation.

Backend validates:

- Business rules
- Authorization
- Dates
- Room availability
- Rate integrity
- Financial totals
- Allowed status transitions

---

# 30. Transactions

Use SQL transactions for operations such as:

```text
Check-in
Check-out
Reservation cancellation with refund
Room assignment
Payment posting
Invoice creation
Room move
```

Example check-out transaction:

```text
BEGIN

Add payment
Close folio
Generate invoice
Update reservation
Update room
Create housekeeping task
Create audit log

COMMIT
```

If anything fails:

```text
ROLLBACK
```

---

# 31. Concurrency

Hotel staff may update the same reservation or room from multiple devices.

Use optimistic concurrency.

Examples:

```text
Room.RowVersion
Reservation.RowVersion
Folio.RowVersion
```

Return HTTP:

```text
409 Conflict
```

when another user has already updated the record.

React should show:

```text
"This reservation was updated by another user. Refresh to see the latest version."
```

---

# 32. Real-Time Updates

Phase 1 can work with normal REST refresh.

Later add SignalR for:

```text
Room status changes
Housekeeping status changes
New reservations
Front desk alerts
Maintenance status
```

Example:

```text
Housekeeper marks Room 304 Clean
        │
        ▼
.NET API
        │
        ▼
SQL Server
        │
        ▼
SignalR Event
        │
        ▼
Front Desk React App updates Room 304 immediately
```

---

# 33. Caching

Do not cache frequently changing operational data aggressively.

Good cache candidates:

```text
Room types
Amenities
Tax configuration
Rate-plan metadata
Property configuration
Role permissions
```

Avoid stale caching for:

```text
Current room availability
Outstanding balances
Live reservations
Room status
```

Redis can be introduced later.

---

# 34. File Storage

Do not save uploaded images directly as giant binary columns unless there is a specific reason.

Store files in object/blob storage.

SQL stores:

```text
FileId
FileName
ContentType
StoragePath
UploadedAt
```

Possible documents:

```text
Guest IDs
Signed registration cards
Room photos
Maintenance photos
Invoices
Property logo
```

---

# 35. Logging

Backend should produce structured logs.

Log:

```text
Request ID
User ID
Property ID
Endpoint
HTTP status
Duration
Exception
Business event
```

Do not log:

```text
Passwords
Card numbers
Access tokens
Sensitive ID contents
```

---

# 36. Audit Logging

Business audit log:

```text
AuditLogs
```

Fields:

```text
Id
PropertyId
UserId
Action
EntityType
EntityId
OldValues
NewValues
Timestamp
```

Important actions:

```text
Reservation created
Reservation cancelled
Guest checked in
Guest checked out
Room moved
Room blocked
Rate changed
Payment posted
Payment refunded
Folio charge voided
User role changed
```

---

# 37. Global Exception Handling

Use middleware.

```text
Exception
   │
   ▼
GlobalExceptionMiddleware
   │
   ├── Validation → 400
   ├── Unauthorized → 401
   ├── Forbidden → 403
   ├── Not Found → 404
   ├── Conflict → 409
   └── Unknown → 500
```

Never return raw stack traces to production clients.

---

# 38. Security

Minimum:

```text
HTTPS
JWT
Refresh tokens
Password hashing
Role/permission authorization
Rate limiting
CORS configuration
Input validation
SQL injection protection via parameterized EF queries
Secure headers
Audit logs
Secrets outside source control
```

Avoid placing secrets in:

```text
appsettings.json committed to Git
React .env committed publicly
source code
```

---

# 39. Mobile + WebView Architecture

The React app must support:

```text
Desktop browser
Tablet
Mobile browser
Android WebView
iOS WKWebView
```

Mandatory:

- Responsive layouts
- Touch-friendly controls
- No hover-only actions
- 44px+ primary touch targets
- Mobile card view instead of huge tables
- `100dvh` / safe viewport handling
- `env(safe-area-inset-*)`
- Mobile keyboard-aware forms
- Fixed bottom buttons must not be hidden by keyboard
- Avoid heavy animations
- Avoid giant DOM tables
- No horizontal page overflow

---

# 40. Mobile UI Strategy

Desktop:

```text
Sidebar
+
Header
+
Large content area
```

Mobile:

```text
Top Header
+
Page
+
Bottom Navigation
```

Primary mobile tabs:

```text
Dashboard
Front Desk
Reservations
Rooms
More
```

---

# 41. Booking Availability Query

Availability must be calculated in backend.

Input:

```text
Property
CheckInDate
CheckOutDate
RoomType
Adults
Children
```

Backend should exclude rooms with overlapping active reservations.

Concept:

```text
ExistingCheckIn < RequestedCheckOut
AND
ExistingCheckOut > RequestedCheckIn
```

for active reservation statuses.

Do not calculate authoritative availability only in React.

---

# 42. Money Calculation

All financial calculations belong to backend.

Backend calculates:

```text
Room subtotal
Add-ons
Discount
Tax
Service charge
Deposit
Paid amount
Outstanding balance
Refund
```

React displays results.

Never trust total values sent by browser without recalculation.

---

# 43. Reports Architecture

Reports should query efficiently.

Operational reports:

```text
Arrivals
Departures
Occupancy
In-house
No-show
Housekeeping
```

Finance:

```text
Revenue
Payments
Outstanding
Refunds
Taxes
ADR
RevPAR
```

For heavy reporting later:

```text
Stored procedures
Read models
Reporting tables
Materialized summaries
```

can be introduced.

Do not over-engineer them for MVP.

---

# 44. Dashboard Architecture

React requests:

```text
GET /api/v1/dashboard?date=2026-08-16
```

Backend returns one optimized dashboard DTO.

Example:

```json
{
  "occupancy": {
    "percentage": 78,
    "occupiedRooms": 78,
    "availableRooms": 22
  },
  "arrivals": 14,
  "departures": 11,
  "inHouseGuests": 96,
  "revenue": {
    "today": 420000,
    "adr": 5200,
    "revPar": 4056
  },
  "housekeeping": {
    "dirty": 12,
    "cleaning": 8,
    "inspection": 5,
    "clean": 75
  }
}
```

Avoid React making 15 separate API calls to render one dashboard.

---

# 45. Multi-Property Ready

Include:

```text
OrganizationId
PropertyId
```

in relevant tables.

Backend authorization must ensure a user can only access allowed properties.

Do not trust:

```text
propertyId
```

from frontend without validating user access.

---

# 46. Deployment Architecture

Simple production setup:

```text
React App
   │
   └── Static Hosting / Web Server

ASP.NET Core API
   │
   └── Application Server / Cloud App Service

SQL Server
   │
   └── Managed SQL / SQL Server Instance
```

Production:

```text
Internet
   │
   ▼
HTTPS
   │
   ├─────────────► React
   │
   └─────────────► /api → ASP.NET Core
                           │
                           ▼
                       SQL Server
```

Frontend and API can also be served behind one domain:

```text
https://hotel.vsrsystems.com
https://hotel.vsrsystems.com/api
```

This simplifies CORS and deployment.

---

# 47. Environment Configuration

Frontend:

```text
VITE_API_BASE_URL
```

Backend:

```text
ConnectionStrings__HotelDb
Jwt__Key
Jwt__Issuer
Jwt__Audience
Storage__Connection
Email__ApiKey
Payment__Secret
```

Use environment secrets in production.

---

# 48. Development Environment

Recommended local ports:

```text
React:
http://localhost:5173

ASP.NET Core:
https://localhost:7001

SQL Server:
localhost
```

React environment:

```text
VITE_API_BASE_URL=https://localhost:7001/api/v1
```

.NET CORS permits the React development origin.

---

# 49. Testing Architecture

## React

Test important:

```text
Forms
Validation
Room-state components
Reservation workflow
Permission-based UI
API hooks
```

## .NET

Unit tests:

```text
Reservation business rules
Check-in logic
Check-out logic
Availability
Money calculations
Room state transitions
```

Integration tests:

```text
Controllers
EF Core
SQL queries
Authentication
Authorization
Transactions
```

Highest-value automated scenarios:

```text
Reservation → Check-in → Post charges → Payment → Check-out
```

---

# 50. MVP Delivery Order

Do not build everything simultaneously.

## Phase 1 — Foundation

```text
React shell
.NET solution
SQL connection
Authentication
Role authorization
Shared UI
Global error handling
```

## Phase 2 — Hotel Inventory

```text
Property
Room Types
Rooms
Room Status
```

## Phase 3 — Guests + Reservations

```text
Guests
Availability
Create reservation
Reservation list
Reservation details
Calendar
```

## Phase 4 — Front Desk

```text
Arrivals
Departures
Room assignment
Check-in
In-house
Check-out
```

## Phase 5 — Housekeeping

```text
Dirty rooms
Assignments
Cleaning workflow
Inspection
```

## Phase 6 — Billing

```text
Folios
Charges
Payments
Invoices
Refund-ready architecture
```

## Phase 7 — Reporting

```text
Dashboard
Occupancy
Revenue
Payments
Operational reports
```

## Phase 8 — Advanced

```text
Maintenance
Notifications
SignalR
Redis
Payment gateway
Email
Multi-property enhancements
```

---

# 51. Important End-to-End Use Case

The first complete workflow should be:

```text
1. Receptionist logs in

2. Searches dates

3. Backend checks SQL availability

4. Receptionist selects room type

5. Guest is created/selected

6. Reservation is created

7. Reservation appears in arrivals

8. Receptionist assigns a clean room

9. Guest checks in

10. Room becomes Occupied

11. Folio is opened

12. Charges can be added

13. Payment is collected

14. Guest checks out

15. Invoice is generated

16. Room becomes VacantDirty

17. Housekeeping task is automatically created

18. Housekeeper marks cleaning started

19. Housekeeper marks room ready for inspection

20. Inspector marks room clean

21. Room becomes VacantClean again
```

If this workflow is solid, the HMS foundation is correct.

---

# 52. What NOT to Build Initially

Avoid wasting MVP time on:

```text
Microservices
Kubernetes
Event bus
Complex CQRS everywhere
20 separate backend projects
AI features
Full OTA integration
Complex revenue-management engine
Enterprise data warehouse
```

Start as a modular monolith.

Recommended:

```text
React frontend
+
One ASP.NET Core API
+
One SQL Server database
```

This is easier to build, deploy, debug, and scale for the first commercial product.

---

# 53. Future Microservice Boundaries

If the product becomes large, possible extraction areas are:

```text
Identity Service
Reservation Service
Inventory Service
Billing Service
Notification Service
Reporting Service
Integration Service
```

Do not create them before operational scale requires them.

---

# 54. Final Architecture

```text
                   ┌────────────────────┐
                   │   React Frontend   │
                   │ Web + Mobile View  │
                   └──────────┬─────────┘
                              │
                          HTTPS REST
                              │
                   ┌──────────▼─────────┐
                   │ ASP.NET Core API   │
                   │ Modular Monolith   │
                   ├────────────────────┤
                   │ Auth               │
                   │ Reservation        │
                   │ Guest              │
                   │ Room               │
                   │ Front Desk         │
                   │ Housekeeping       │
                   │ Billing            │
                   │ Payment            │
                   │ Reports            │
                   └──────────┬─────────┘
                              │
                         EF Core
                              │
                   ┌──────────▼─────────┐
                   │    SQL Server      │
                   └────────────────────┘

Future optional:

        Redis ─────────────┐
        SignalR ───────────┤
        Blob Storage ──────┤── ASP.NET Core
        Payment Gateway ───┤
        Email/SMS ─────────┘
```

---

# 55. Coding Agent Master Instruction

Give this entire file to the coding agent and then use:

```text
Build this Hotel Management System using the exact architecture in this document.

Technology constraints are fixed:

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query

Backend:
- ASP.NET Core Web API
- C#
- Clean Architecture
- Entity Framework Core
- JWT authentication
- Permission-based authorization

Database:
- Microsoft SQL Server

Build the system as a modular monolith. Do not introduce microservices.

Implement an actual end-to-end working workflow instead of static screens:

Reservation
→ room assignment
→ check-in
→ folio
→ payment
→ check-out
→ dirty room
→ housekeeping
→ clean room.

Frontend and backend must be connected through real REST APIs.

Use SQL Server through EF Core and migrations.

Keep Controllers thin and business logic inside the Application/Domain layers.

Use transactions for check-in, check-out, room movement, financial actions and other multi-step operations.

Use optimistic concurrency for Reservations, Rooms and Folios.

All authoritative availability and money calculations must happen in the backend.

The React application must work smoothly on desktop, tablet, mobile browser, Android WebView and iOS WKWebView.

Do not create desktop-only tables that become unusable on mobile.

Create the project in vertical stages and keep the solution compiling after each stage.

Do not stop after scaffolding.

At the end:
1. Run frontend build.
2. Run backend build.
3. Run tests.
4. Apply/check EF Core migrations.
5. Fix all TypeScript, C#, build, runtime and database errors.
```

---

# 56. Definition of Done

## Frontend

- [ ] React application builds
- [ ] Responsive desktop UI
- [ ] Responsive mobile UI
- [ ] WebView-friendly screens
- [ ] Authentication flow
- [ ] Route guards
- [ ] Dashboard
- [ ] Reservations
- [ ] Availability search
- [ ] Guests
- [ ] Rooms
- [ ] Front desk
- [ ] Check-in
- [ ] Check-out
- [ ] Housekeeping
- [ ] Folios
- [ ] Payments
- [ ] Reports
- [ ] Settings
- [ ] Loading states
- [ ] Empty states
- [ ] Validation
- [ ] API errors handled

## Backend

- [ ] ASP.NET Core API builds
- [ ] Clean Architecture followed
- [ ] Authentication
- [ ] Refresh-token-ready flow
- [ ] Permission authorization
- [ ] Global exception middleware
- [ ] Validation
- [ ] EF Core
- [ ] SQL Server
- [ ] Reservations API
- [ ] Guests API
- [ ] Rooms API
- [ ] Check-in
- [ ] Check-out
- [ ] Housekeeping
- [ ] Billing
- [ ] Payments
- [ ] Reports
- [ ] Audit logging

## Database

- [ ] Migrations execute successfully
- [ ] Foreign keys configured
- [ ] Important unique constraints configured
- [ ] Indexes exist for common searches
- [ ] Decimal money columns
- [ ] Concurrency tokens
- [ ] Seed property
- [ ] Seed rooms
- [ ] Seed room types
- [ ] Seed users and roles
- [ ] Seed demo reservations

## End-to-End

- [ ] User logs in
- [ ] Reservation can be created
- [ ] Availability is calculated by backend
- [ ] Guest can be checked in
- [ ] Room becomes occupied
- [ ] Charges can be posted
- [ ] Payment can be recorded
- [ ] Guest can be checked out
- [ ] Invoice can be generated
- [ ] Room becomes dirty
- [ ] Housekeeping task appears
- [ ] Room can return to clean status
