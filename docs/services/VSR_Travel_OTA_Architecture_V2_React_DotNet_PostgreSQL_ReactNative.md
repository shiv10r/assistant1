# VSR Travel — OTA-Scale Architecture V2

> **Coding-agent-ready master architecture**
>
> **Goal:** Build a complete, commercially usable, multi-product Online Travel Agency platform with the breadth and operational depth expected from a modern Indian travel marketplace, while keeping VSR Travel's brand, code, UI, content, supplier contracts and infrastructure original.
>
> **Fixed application stack**
>
> - Web frontend: React
> - Mobile application: React Native
> - Backend: .NET / ASP.NET Core Web API
> - Primary relational database: PostgreSQL
> - ORM: Entity Framework Core with PostgreSQL provider
>
> **Important**
>
> - This is an original VSR Travel architecture. It is not a claim about ixigo's private/internal implementation.
> - Do not copy another travel company's source code, visual identity, text, algorithms or proprietary integrations.
> - Do not fabricate live inventory.
> - Flights, trains, buses, hotels, cabs and other supplier-backed products must use provider adapters and approved supplier/partner integrations.
> - Final pricing, inventory, booking state, payment state, cancellation and refund state are always backend-authoritative.

---

# 0. Architecture Reset

This document **replaces the previous VSR Travel architecture** as the implementation source of truth.

The previous application architecture was centered on:

```text
React Web
+
.NET Modular Monolith
+
SQL Server
+
Mobile Browser / WebView
```

The new architecture is:

```text
React Web
+
React Native Mobile
+
.NET Domain Services
+
PostgreSQL
+
Supplier Integration Layer
+
Event-Driven Workflows
+
Shared Booking / Payment / Customer Platform
```

The product must support growth from an MVP into a serious OTA without a ground-up rewrite.

---

# 1. Product Vision

VSR Travel should become a unified travel platform where a customer can:

- search and book flights
- search and book trains through authorized/approved integrations
- search and book buses
- search and book hotels
- browse and book curated holiday packages
- book group departures
- request customized trips
- book cabs/transfers where integrations exist
- book activities/experiences
- purchase supported add-ons such as insurance or visa assistance
- manage travelers
- manage all bookings in one account
- view booking status
- download invoices/vouchers/tickets where permitted
- cancel/reschedule where supplier rules allow
- track refund status
- receive alerts
- save searches/favorites
- use wallet/credits if enabled
- contact support
- receive offers and personalized recommendations

The operational system must support:

- inventory/supplier connectivity
- bookings
- payments
- refunds
- reconciliation
- pricing
- promotions
- support
- fraud/risk review
- content
- analytics
- operations dashboards
- supplier configuration
- role-based administration
- audit history

---

# 2. Main Product Surfaces

```text
A. Public React Web Application
B. Customer React Native Mobile Application
C. Customer Account / My Trips
D. Admin / Operations React Web Portal
E. Supplier Integration Platform
F. Backend Domain Services
G. Analytics / Reporting Platform
```

Admin/operations stays web-first.

The React Native application is customer-first. A separate internal operations mobile app is not required for Phase 1.

---

# 3. Travel Products

The architecture must support these product domains independently.

```text
Flights
Trains
Buses
Hotels
Holiday Packages
Group Trips
Customized Trips
Cabs / Transfers
Activities / Experiences
Travel Insurance Add-ons
Visa Assistance
Other Travel Add-ons
```

Each product can be independently enabled by:

- feature flag
- market
- supplier availability
- environment
- business launch phase

---

# 4. Core Platform Capabilities

Shared across travel products:

```text
Identity
Customer Profile
Traveler Profiles
Search
Recent Searches
Favorites / Wishlist
Recommendations
Pricing
Promotions
Coupons
Booking Orchestration
Payment
Refund
Cancellation
Documents
Notifications
Support
Wallet / Credits
Loyalty
Reviews
CMS
Admin
Audit
Analytics
Fraud / Risk Flags
Supplier Configuration
Reconciliation
```

---

# 5. Architecture Principles

## 5.1 API First

Both:

```text
React Web
React Native
```

consume the same backend platform through versioned APIs.

Do not create separate business logic in mobile and web.

---

## 5.2 Backend Authority

Frontend must never be authoritative for:

```text
Price
Taxes
Fees
Discount eligibility
Seat/room availability
Booking status
Supplier confirmation
Payment success
Refund amount
Cancellation charge
Wallet balance
Loyalty balance
PNR / ticket state
```

---

## 5.3 Supplier Abstraction

All external inventory is behind provider adapters.

Example:

```text
Flight Search
    ↓
Flight Domain
    ↓
IFlightSearchProvider
    ↓
Configured Supplier Adapter
    ↓
Supplier API
```

No React component talks directly to a supplier.

---

## 5.4 Product Isolation

A failure in hotel search should not make train booking unusable.

Each major product domain has:

- independent APIs
- independent business logic
- independent supplier adapters
- independent caching rules
- independent monitoring
- separate logical PostgreSQL schema ownership

---

## 5.5 Shared Transaction Platform

Cross-product capabilities should not be duplicated.

Use shared platform domains for:

```text
Identity
Customer
Booking
Payment
Refund
Promotion
Notification
Support
Wallet
Audit
```

---

## 5.6 Idempotent Critical Operations

Critical commands must support duplicate-safe execution.

Examples:

```text
Create booking
Confirm booking
Capture payment
Process webhook
Cancel booking
Create refund
Apply wallet debit
Supplier confirmation callback
```

---

## 5.7 Immutable Booking Snapshot

A booking must retain the exact commercial data agreed at purchase time.

Do not rebuild an old booking from today's inventory/pricing configuration.

---

# 6. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTS                                    │
│                                                                             │
│   React Web                React Native Mobile              Admin React     │
│   Public + Account         Android + iOS                    Operations      │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ HTTPS / JSON
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDGE / API ENTRY LAYER                              │
│                                                                             │
│  CDN / WAF / TLS / Rate Limits / API Gateway / Authentication Context      │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPERIENCE / BFF LAYER                             │
│                                                                             │
│ Public Web API     Mobile API     Account API     Admin / Ops API           │
└───────────────┬─────────────┬─────────────┬─────────────────────────────────┘
                │             │             │
                ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           .NET DOMAIN SERVICES                              │
│                                                                             │
│ Identity    Customer      Search       Flights       Trains                 │
│ Buses       Hotels        Holidays     Activities    Cabs                   │
│ Pricing     Inventory     Booking      Payment       Refund                 │
│ Promo       Wallet        Loyalty      Notification  Support                │
│ Content     Review        Documents    Risk          Reconciliation         │
│ Analytics Read APIs       Admin / Configuration                             │
└───────────────┬─────────────────────────────────────────────────────────────┘
                │
        ┌───────┴───────────────────────────────────────────────┐
        │                                                       │
        ▼                                                       ▼
┌──────────────────────────────┐                ┌─────────────────────────────┐
│       POSTGRESQL             │                │   EXTERNAL INTEGRATIONS     │
│                              │                │                             │
│ Domain-owned schemas         │                │ Rail partner / IRCTC path  │
│ Booking snapshots            │                │ Airline / GDS / NDC APIs   │
│ Transactions                 │                │ Bus aggregators/operators   │
│ Audit / operational data     │                │ Hotel suppliers            │
└──────────────┬───────────────┘                │ Payment gateways            │
               │                                │ Maps / geo providers        │
               │                                │ SMS / Email / Messaging     │
               ▼                                │ Insurance / Visa partners   │
┌──────────────────────────────┐                └─────────────────────────────┘
│ ASYNC / PLATFORM SERVICES    │
│                              │
│ Event Bus                    │
│ Background Workers           │
│ Distributed Cache            │
│ Search Index (when needed)   │
│ Object / Document Storage    │
│ Observability                │
└──────────────────────────────┘
```

---

# 7. Recommended Delivery Architecture

Do not create 30 independently deployed services on day one.

Use **domain-aligned service boundaries from day one**, but deploy them in practical groups initially.

## Initial deployable groups

```text
1. Identity / Customer Platform
2. Discovery / Search / Content
3. Travel Product Platform
   - Flights
   - Trains
   - Buses
   - Hotels
   - Holidays
4. Commerce Platform
   - Pricing
   - Inventory
   - Booking
   - Payments
   - Refunds
   - Promotions
5. Engagement Platform
   - Notifications
   - Support
   - Reviews
   - Wallet / Loyalty
6. Admin / Operations
7. Background Workers
```

As traffic grows, hot domains can become independently deployed services without changing their API contracts.

---

# 8. Repository Architecture

```text
VSR.Travel/
│
├── apps/
│   ├── web/
│   │   └── vsr-travel-web/
│   │
│   ├── mobile/
│   │   └── vsr-travel-mobile/
│   │
│   └── admin/
│       └── vsr-travel-admin/
│
├── backend/
│   ├── Gateway/
│   ├── BuildingBlocks/
│   ├── Services/
│   │   ├── Identity/
│   │   ├── Customer/
│   │   ├── Discovery/
│   │   ├── Flights/
│   │   ├── Trains/
│   │   ├── Buses/
│   │   ├── Hotels/
│   │   ├── Holidays/
│   │   ├── Activities/
│   │   ├── Cabs/
│   │   ├── Pricing/
│   │   ├── Inventory/
│   │   ├── Booking/
│   │   ├── Payment/
│   │   ├── Refund/
│   │   ├── Promotion/
│   │   ├── Wallet/
│   │   ├── Loyalty/
│   │   ├── Notification/
│   │   ├── Support/
│   │   ├── Review/
│   │   ├── Content/
│   │   ├── Documents/
│   │   ├── Risk/
│   │   ├── Reconciliation/
│   │   └── Admin/
│   │
│   └── Workers/
│
├── database/
│   ├── migrations/
│   ├── seed/
│   ├── diagrams/
│   └── scripts/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── product/
│   ├── operations/
│   └── integrations/
│
└── README.md
```

---

# 9. Standard .NET Service Structure

Every domain service follows the same layered structure.

```text
VSR.Travel.<Domain>/
│
├── Api/
│   ├── Controllers/
│   ├── Endpoints/
│   ├── Middleware/
│   ├── Authorization/
│   └── Program.cs
│
├── Application/
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   ├── Validators/
│   ├── Interfaces/
│   └── Services/
│
├── Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   ├── Events/
│   ├── Rules/
│   └── Exceptions/
│
├── Infrastructure/
│   ├── Persistence/
│   ├── Integrations/
│   ├── Repositories/
│   ├── Caching/
│   └── Messaging/
│
└── Tests/
```

Keep controllers/endpoints thin.

Business rules belong in Application/Domain.

---

# 10. Building Blocks

Shared backend building blocks can include:

```text
ApiResponse / ProblemDetails conventions
Authentication context
Authorization
Correlation IDs
Request IDs
Idempotency
Domain events
Integration events
Outbox
Transactions
Money / Currency value objects
Date/time abstractions
Pagination
Audit helpers
Supplier adapter contracts
Resilience wrappers
Logging conventions
Feature flags
```

Do not share product-specific entity models across domain boundaries.

---

# 11. Web Application — React

Main React web product surfaces:

```text
Home
Flights
Trains
Buses
Hotels
Holidays
Activities
Cabs
Offers
Trip Planner
Search
Login
Account
My Trips
Wishlist
Wallet
Support
```

The website should be discovery-heavy and card-driven, but every card/CTA must perform a real action.

---

# 12. React Web Route Architecture

```text
/

/flights
/flights/search
/flights/results
/flights/review

/trains
/trains/search
/trains/results
/trains/:trainNumber
/trains/pnr
/trains/live-status

/buses
/buses/search
/buses/results
/buses/:tripId

/hotels
/hotels/search
/hotels/results
/hotels/:slug

/holidays
/holidays/:slug
/group-trips
/customize-trip

/activities
/activities/:slug

/cabs
/cabs/search

/offers
/trip-planner
/search

/checkout/:sessionId
/booking/success/:bookingId
/booking/failure

/account
/account/profile
/account/travelers
/account/trips
/account/bookings/:bookingId
/account/payments
/account/refunds
/account/wishlist
/account/wallet
/account/alerts
/account/support
/account/documents
```

---

# 13. React Frontend Feature Structure

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── config/
│   └── auth/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── cards/
│   ├── forms/
│   ├── filters/
│   ├── search/
│   ├── checkout/
│   ├── booking/
│   └── feedback/
│
├── features/
│   ├── home/
│   ├── flights/
│   ├── trains/
│   ├── buses/
│   ├── hotels/
│   ├── holidays/
│   ├── activities/
│   ├── cabs/
│   ├── search/
│   ├── booking/
│   ├── payment/
│   ├── account/
│   ├── wallet/
│   ├── offers/
│   ├── notifications/
│   └── support/
│
├── api/
├── hooks/
├── types/
├── constants/
└── utils/
```

---

# 14. Reusable Web Card Library

```text
FlightResultCard
FareOptionCard
TrainResultCard
TrainAvailabilityCard
BusResultCard
BusSeatCard
HotelCard
HotelRoomCard
HolidayPackageCard
DepartureCard
ActivityCard
CabCard
OfferCard
WalletCard
BookingCard
TripCard
RefundCard
SupportCard
ReviewCard
DestinationCard
RecommendationCard
AlertCard
PriceBreakdownCard
```

Do not rebuild equivalent cards independently on every page.

---

# 15. React Native Mobile Application

The mobile application is **not a WebView wrapper**.

Main bottom navigation:

```text
Home
Bookings
Trips
Offers
Account
```

Home product selector:

```text
Flights
Trains
Buses
Hotels
Holidays
Cabs
```

Contextual:

```text
Search
Alerts
Notifications
Support
Wallet
```

---

# 16. React Native Mobile Structure

```text
mobile/
├── src/
│   ├── app/
│   │   ├── navigation/
│   │   ├── providers/
│   │   ├── config/
│   │   └── session/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── forms/
│   │   ├── sheets/
│   │   ├── feedback/
│   │   └── utilities/
│   │
│   ├── features/
│   │   ├── home/
│   │   ├── flights/
│   │   ├── trains/
│   │   ├── buses/
│   │   ├── hotels/
│   │   ├── holidays/
│   │   ├── cabs/
│   │   ├── booking/
│   │   ├── payments/
│   │   ├── trips/
│   │   ├── wallet/
│   │   ├── alerts/
│   │   ├── notifications/
│   │   ├── account/
│   │   └── support/
│   │
│   ├── api/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
└── assets/
```

---

# 17. Mobile UX Rules

Mobile must use:

- bottom sheets
- sticky bottom CTAs
- large touch targets
- list virtualization for long result sets
- pull-to-refresh where appropriate
- safe area support
- keyboard-safe forms
- camera/file upload support where relevant
- deep-link-ready booking screens
- offline-safe saved trip utility screens where allowed

No hover-only interaction.

No desktop sidebars shrunk into a phone.

---

# 18. Mobile Offline Utility

Some travel utility screens can safely show previously synchronized data offline.

Examples:

```text
Saved booking summary
Previously downloaded itinerary
Previously downloaded voucher/ticket document
Saved traveler details where securely permitted
Last synchronized trip detail
```

Never fake current:

```text
Seat availability
Live train status
Flight status
Fare
Hotel room availability
Payment state
Refund state
```

Clearly label stale/offline data.

---

# 19. BFF / Experience APIs

Use thin experience-oriented APIs to avoid requiring clients to orchestrate many backend calls.

Examples:

```text
GET /api/v1/web/home
GET /api/v1/mobile/home

GET /api/v1/account/dashboard
GET /api/v1/account/trips

GET /api/v1/admin/dashboard
GET /api/v1/admin/operations
```

BFF endpoints aggregate data only.

Business rules remain in domain services.

---

# 20. Identity Service

Responsibilities:

- register
- login
- logout
- token/session lifecycle
- refresh token
- password reset
- email/phone verification readiness
- roles
- permissions
- device/session management
- security events

Core entities:

```text
User
Role
Permission
UserRole
RolePermission
RefreshToken
UserSession
SecurityEvent
```

---

# 21. Customer Service

Responsibilities:

- customer profile
- traveler profiles
- travel preferences
- emergency contacts
- saved departure city
- recently used travelers
- customer settings

Entities:

```text
Customer
Traveler
CustomerPreference
EmergencyContact
CustomerSetting
```

Do not force passport data until a travel product actually needs it.

---

# 22. Discovery Service

Responsibilities:

- home feed
- global search
- autocomplete
- trending routes
- recent searches
- destination discovery
- cross-product discovery
- recommendations interface
- SEO/public content read model

Search can start with PostgreSQL-backed indexed search.

Introduce a dedicated search index only when real query volume/latency justifies it.

---

# 23. Flight Service

Responsibilities:

```text
Airport / city autocomplete
One-way search
Round-trip search
Multi-city-ready architecture
Fare families
Cabin classes
Special fares
Baggage
Fare rules
Flight status utility
Fare alerts
Order creation
Supplier booking
Supplier cancellation
Supplier reschedule support where available
```

Provider contracts:

```text
IFlightSearchProvider
IFlightFareProvider
IFlightBookingProvider
IFlightOrderProvider
IFlightStatusProvider
IFlightCancellationProvider
IFlightRefundProvider
```

Never persist a supplier fare as permanently available inventory.

---

# 24. Flight Search Request

```text
Origin
Destination
DepartureDate
ReturnDate
TripType
Adults
Children
Infants
CabinClass
SpecialFare
PreferredAirlines
DirectOnly
```

---

# 25. Flight Search Result Snapshot

Normalize supplier response into a platform model.

```text
SearchId
ResultId
Supplier
Segments
Airline
FlightNumbers
Departure
Arrival
Duration
Stops
Cabin
Baggage
FareFamily
BaseFare
Taxes
Fees
Total
Currency
Refundability
Changeability
FareRulesSummary
ExpiresAt
```

Before booking, re-price/revalidate with supplier.

---

# 26. Train Service

Train functionality must be implemented only through authorized/approved railway integration paths.

Responsibilities:

```text
Station search
Train search
Schedule
Seat/class availability
Fare
Booking integration
PNR lookup
Booking status
Cancellation
Refund status
Train running status where integration allows
Platform/status utilities where reliable data exists
Alerts
```

Provider contracts:

```text
ITrainSearchProvider
ITrainAvailabilityProvider
ITrainBookingProvider
IPnrProvider
ITrainStatusProvider
ITrainCancellationProvider
```

Do not simulate an IRCTC booking connection.

---

# 27. Bus Service

Responsibilities:

```text
City search
Bus search
Operator
Bus type
Boarding/drop points
Seat layout
Seat hold
Passenger details
Booking
Ticket/voucher
Cancellation
Refund
Bus tracking where supplier supports it
```

Provider contracts:

```text
IBusSearchProvider
IBusSeatProvider
IBusBookingProvider
IBusCancellationProvider
IBusTrackingProvider
```

---

# 28. Hotel Service

Responsibilities:

```text
Destination/property search
Date/guest search
Property content
Images
Amenities
Room types
Meal plans
Cancellation policies
Availability
Rate plans
Pay-now / pay-at-property state where supplier supports
Booking
Voucher
Cancellation
Refund
```

Provider contracts:

```text
IHotelSearchProvider
IHotelAvailabilityProvider
IHotelRateProvider
IHotelBookingProvider
IHotelCancellationProvider
IHotelContentProvider
```

Always re-check selected room/rate before final booking.

---

# 29. Holiday Service

Supports VSR-owned/curated products.

```text
Destinations
Packages
Themes
Itineraries
Hotels
Activities
Inclusions
Exclusions
Policies
Departures
Group inventory
Package price options
Custom trip leads
```

Unlike supplier search results, curated packages can be stored as platform catalog entities.

---

# 30. Activities Service

Responsibilities:

- activity catalog
- availability
- time slots
- participant pricing
- booking
- voucher
- cancellation

Can use curated inventory or supplier adapters.

---

# 31. Cab / Transfer Service

Supports:

```text
Airport Transfer
Local Cab
Intercity Transfer
Package Transfer
```

Provider contracts:

```text
ICabQuoteProvider
ICabBookingProvider
ICabCancellationProvider
```

---

# 32. Inventory Service

Inventory is product-specific.

Examples:

```text
Holiday departure seats
Bus seats
Hotel rooms/rates
Activity slots
Supplier search-result validity
Temporary holds
```

The service provides normalized reservation/hold semantics.

---

# 33. Pricing Service

Responsibilities:

- platform fees
- convenience fees
- product service fees
- taxes passed from/derived according to product rules
- discounts
- coupons
- membership/loyalty benefits
- wallet credits
- markup rules
- commission inputs
- final platform quote

Pricing must create a **quote snapshot**.

---

# 34. Price Quote

Common fields:

```text
QuoteId
ProductType
Search/Offer Reference
Supplier Reference
BaseAmount
Taxes
SupplierFees
PlatformFees
ConvenienceFee
Insurance
AddOns
Discount
CouponDiscount
WalletApplied
FinalAmount
Currency
ExpiresAt
PricingVersion
```

Supplier-backed products may require a final revalidation before booking.

---

# 35. Booking Orchestrator

Booking Service is the cross-product system of record for customer orders.

Responsibilities:

```text
Booking session
Traveler/passenger data
Quote snapshot
Payment state
Supplier confirmation state
Booking lifecycle
Cancellation request
Refund linkage
Documents
Timeline
Audit references
```

Product services own supplier-specific commands.

Booking Service owns the unified customer booking view.

---

# 36. Unified Booking Model

```text
Booking
BookingItem
BookingTraveler
BookingContact
BookingPriceSnapshot
BookingPaymentLink
BookingDocument
BookingStatusHistory
BookingSupplierReference
BookingCancellation
BookingRefundLink
BookingNote
```

A booking may contain one or more items where business rules allow.

---

# 37. Booking Status Model

Common states:

```text
Draft
Quoted
HoldPending
Held
PaymentPending
PaymentReceived
SupplierConfirmationPending
Confirmed
PartiallyConfirmed
ConfirmationFailed
CancellationRequested
CancellationPending
Cancelled
RefundPending
PartiallyRefunded
Refunded
Completed
Closed
```

Not every product uses every state.

---

# 38. Flight Booking Flow

```text
Search
→ Select Fare
→ Revalidate Fare
→ Create Booking Session
→ Enter Travelers
→ Create Final Quote
→ Payment Order
→ Payment Verification
→ Supplier Booking Request
→ Supplier Confirmation
→ Booking Confirmed
→ Ticket / PNR / Order Reference
```

If supplier confirmation fails after payment:

```text
Payment Successful
→ Supplier Confirmation Failed
→ Booking enters exception workflow
→ Automatic/manual refund handling
→ Customer receives truthful status
```

Never show "Confirmed" before supplier confirmation.

---

# 39. Train Booking Flow

```text
Search Train
→ Select Class
→ Check Availability
→ Authorized Booking Flow
→ Passenger Details
→ Fare Revalidation
→ Payment
→ Partner/Supplier Confirmation
→ PNR / Booking Reference
→ Unified Booking Confirmed
```

Any authentication/partner-specific steps required by the approved rail integration must be modeled explicitly.

---

# 40. Bus Booking Flow

```text
Search
→ Choose Bus
→ Load Seat Layout
→ Select Seats
→ Hold Seats
→ Passenger Details
→ Revalidate Price
→ Payment
→ Supplier Confirm
→ Ticket
```

Seat hold expiration must be handled safely.

---

# 41. Hotel Booking Flow

```text
Search
→ Filter
→ Hotel Detail
→ Select Room / Rate
→ Revalidate Rate
→ Guest Details
→ Final Quote
→ Payment or Pay-at-Property Path
→ Supplier Confirm
→ Voucher
```

---

# 42. Holiday Booking Flow

```text
Discover Package
→ Select Departure
→ Select Travelers
→ Check Platform Inventory
→ Hold Seats
→ Select Add-ons
→ Final Quote
→ Payment
→ Confirm Departure Inventory
→ Booking Confirmed
→ My Trips
```

---

# 43. Payment Service

Responsibilities:

```text
Payment order
Payment attempt
Gateway callback
Webhook
Verification
Capture
Failure
Refund initiation
Refund tracking
Reconciliation
Payment audit
```

Provider contract:

```text
IPaymentGateway
```

The gateway is configuration-driven.

---

# 44. Payment States

```text
Created
Pending
Authorized
Captured
Successful
Failed
Cancelled
VerificationPending
RefundPending
PartiallyRefunded
Refunded
Chargeback / Dispute if supported
```

Webhooks must be verified and idempotent.

---

# 45. Refund Service

Responsibilities:

- calculate/refetch supplier cancellation outcome
- platform refund rules
- supplier refund reference
- payment gateway refund
- partial refund
- refund timeline
- customer status
- operations exception queue

Refund must not be calculated only in React/React Native.

---

# 46. Promotion Service

Supports:

```text
Coupons
Campaigns
Bank Offers
First Booking
Route Offers
Product Offers
User Segments
App-only Offers
Referral Offers
Membership Benefits
```

Backend validates eligibility.

---

# 47. Wallet / Credits

Optional but architecture-ready.

Ledger-based.

```text
Wallet
WalletTransaction
WalletHold
WalletAdjustment
```

Never update balance without a ledger entry.

---

# 48. Loyalty

Optional.

```text
LoyaltyAccount
LoyaltyTransaction
RewardRule
Tier
Redemption
```

Loyalty must be independent of payment ledger.

---

# 49. Notification Service

Channels may include:

```text
In-App
Push
Email
SMS
Approved messaging channel
```

Events:

```text
Booking confirmed
Payment failed
Ticket issued
PNR changed
Train delayed
Flight changed
Bus changed
Hotel confirmation
Cancellation
Refund
Upcoming trip
Fare alert
Price drop
Support update
Offer
```

---

# 50. Alert Service

Customer-created alerts:

```text
Fare Alert
Seat Availability Alert
PNR Status Alert
Flight Status Alert
Train Status Alert
Price Drop Alert
```

Each alert has:

```text
User
Type
Criteria
Frequency
Status
LastCheckedAt
LastTriggeredAt
```

---

# 51. Support Service

Support categories:

```text
Booking
Payment
Cancellation
Refund
Flight
Train
Bus
Hotel
Holiday
Cab
Account
Wallet
Fraud / Safety
Other
```

Entities:

```text
SupportTicket
SupportMessage
SupportAttachment
SupportAssignment
SupportStatusHistory
InternalNote
```

---

# 52. Support Operations Workspace

Admin/support sees:

- customer
- booking
- product
- supplier references
- payment timeline
- cancellation
- refund
- documents
- customer messages
- internal notes
- escalation state

Support should not need direct database access.

---

# 53. Review Service

Supports reviews for:

```text
Hotels
Holiday Packages
Activities
Platform Experience
```

Only verified/eligible bookings should receive verified-booking status.

---

# 54. Content / CMS Service

Manages:

```text
Homepage
Banners
Destination Pages
Route Pages
Travel Guides
Blogs
FAQs
Offers
Policy Content
SEO Metadata
App Promotional Content
```

Content publishing must not require a code deployment.

---

# 55. Document Service

Documents can include:

```text
Invoice
Ticket
Voucher
Itinerary PDF
Insurance Document
Visa Assistance Document
Cancellation Receipt
Refund Receipt
```

Store metadata in PostgreSQL and file content in approved object/document storage.

Do not store large binaries directly in main relational tables unless explicitly required.

---

# 56. Risk / Fraud Service

Internal flags:

```text
Repeated payment failures
High refund frequency
Suspicious coupon use
Duplicate accounts
Abnormal booking velocity
Payment mismatch
Chargeback risk
Supplier anomaly
Account takeover signal
```

Risk system starts rule-based.

ML can be introduced later.

---

# 57. Reconciliation Service

Required for a real OTA.

Reconcile:

```text
Booking vs Supplier Order
Payment vs Gateway Settlement
Refund vs Gateway Refund
Supplier Payable
Platform Revenue
Convenience Fee
Commission
Wallet Adjustment
```

Operations queues:

```text
Payment mismatch
Booking paid but supplier unconfirmed
Supplier confirmed but local booking pending
Refund mismatch
Settlement mismatch
```

---

# 58. Supplier Integration Layer

Structure:

```text
Infrastructure/Integrations/
│
├── Flights/
│   ├── ProviderA/
│   └── ProviderB/
├── Trains/
├── Buses/
├── Hotels/
├── Cabs/
├── Activities/
├── Payments/
└── Communications/
```

Adapters translate supplier contracts into stable VSR domain contracts.

---

# 59. Supplier Adapter Rules

Each adapter must implement:

- request mapping
- response normalization
- timeout
- retry policy for safe operations
- correlation ID
- supplier request ID
- logging
- error normalization
- metrics
- feature enable/disable
- credentials from secure configuration
- supplier health state

Do not blindly retry non-idempotent booking requests.

---

# 60. Supplier Error Standard

Normalize supplier errors.

Examples:

```text
supplier_timeout
fare_changed
inventory_changed
seat_unavailable
room_unavailable
supplier_rejected_booking
supplier_confirmation_delayed
supplier_cancel_failed
supplier_refund_pending
```

Frontend sees customer-safe messages.

Raw supplier exceptions remain internal.

---

# 61. Event-Driven Architecture

Use integration events for cross-domain side effects.

Examples:

```text
BookingCreated
PaymentSuccessful
PaymentFailed
SupplierBookingConfirmed
SupplierBookingFailed
BookingConfirmed
BookingCancelled
RefundInitiated
RefundCompleted
TicketIssued
TripStartingSoon
SupportTicketCreated
WalletCredited
```

---

# 62. Outbox Pattern

Critical domain changes and integration events must not be separated by unreliable dual writes.

Example:

```text
DB Transaction
  - update booking
  - insert status history
  - insert outbox event
COMMIT

Worker
  - publishes outbox event
  - marks event published
```

---

# 63. Background Workers

Workers handle:

```text
Outbox publishing
Expired seat/booking holds
Payment verification retry
Supplier confirmation polling
Refund polling
Alert checks
Upcoming trip notifications
Document generation
Reconciliation jobs
Content/search indexing
Stale booking recovery
```

---

# 64. PostgreSQL Strategy

PostgreSQL is the primary relational system of record.

Use logical schemas for bounded contexts.

```text
identity.*
customer.*
discovery.*
flights.*
trains.*
buses.*
hotels.*
holidays.*
activities.*
cabs.*
pricing.*
inventory.*
booking.*
payment.*
refund.*
promotion.*
wallet.*
loyalty.*
notification.*
support.*
review.*
content.*
documents.*
risk.*
reconciliation.*
audit.*
```

This provides domain ownership while keeping operational simplicity.

---

# 65. PostgreSQL Rules

- UUID identifiers where appropriate
- `numeric(18,2)` or an approved higher precision for money
- explicit currency field
- UTC timestamps
- unique constraints for business keys
- foreign keys inside a domain where safe
- avoid cross-domain write coupling
- JSONB only for genuinely flexible snapshots/metadata
- indexes derived from query patterns
- optimistic concurrency/version column where required
- transaction isolation chosen per workflow
- migrations owned by domain

---

# 66. Core Identity Tables

```text
identity.users
identity.roles
identity.permissions
identity.user_roles
identity.role_permissions
identity.refresh_tokens
identity.user_sessions
identity.security_events
```

---

# 67. Customer Tables

```text
customer.customers
customer.travelers
customer.preferences
customer.emergency_contacts
customer.saved_searches
customer.favorite_items
```

---

# 68. Booking Tables

```text
booking.bookings
booking.booking_items
booking.booking_travelers
booking.booking_contacts
booking.price_snapshots
booking.supplier_references
booking.documents
booking.status_history
booking.cancellations
booking.notes
booking.idempotency_records
```

---

# 69. Payment / Refund Tables

```text
payment.payments
payment.payment_attempts
payment.gateway_events
payment.reconciliation_records

refund.refunds
refund.refund_attempts
refund.refund_status_history
```

---

# 70. Flight Tables

Persist operational/snapshot data, not the entire live supplier universe.

```text
flights.airports
flights.airlines
flights.search_sessions
flights.fare_snapshots
flights.orders
flights.segments
flights.passenger_references
flights.status_subscriptions
```

---

# 71. Train Tables

```text
trains.stations
trains.saved_queries
trains.search_sessions
trains.availability_snapshots
trains.orders
trains.pnr_references
trains.status_subscriptions
```

Avoid storing/claiming authoritative railway master data unless obtained through an approved source.

---

# 72. Bus Tables

```text
buses.cities
buses.operators
buses.search_sessions
buses.trip_snapshots
buses.seat_holds
buses.orders
buses.ticket_references
```

---

# 73. Hotel Tables

```text
hotels.properties
hotels.property_content
hotels.property_images
hotels.amenities
hotels.search_sessions
hotels.rate_snapshots
hotels.orders
hotels.voucher_references
```

Supplier-owned content must respect supplier licensing/usage rules.

---

# 74. Holiday Tables

```text
holidays.destinations
holidays.packages
holidays.package_images
holidays.package_destinations
holidays.package_themes
holidays.package_highlights
holidays.package_inclusions
holidays.package_exclusions
holidays.package_policies
holidays.itinerary_days
holidays.itinerary_activities
holidays.departures
holidays.departure_inventory
holidays.price_options
holidays.custom_trip_leads
holidays.lead_activities
```

---

# 75. Promotion Tables

```text
promotion.campaigns
promotion.coupons
promotion.eligibility_rules
promotion.redemptions
promotion.bank_offers
promotion.referrals
```

---

# 76. Wallet / Loyalty Tables

```text
wallet.wallets
wallet.transactions
wallet.holds
wallet.adjustments

loyalty.accounts
loyalty.transactions
loyalty.rules
loyalty.tiers
loyalty.redemptions
```

---

# 77. Support Tables

```text
support.tickets
support.messages
support.attachments
support.assignments
support.status_history
support.internal_notes
```

---

# 78. Content Tables

```text
content.pages
content.sections
content.banners
content.blog_posts
content.blog_categories
content.faqs
content.seo_metadata
content.media_assets
content.site_settings
```

---

# 79. Audit Tables

```text
audit.audit_logs
audit.admin_actions
audit.sensitive_access_logs
```

Important actions must be append-only from normal business workflows.

---

# 80. Booking Table — Core Fields

```text
Id
BookingNumber
CustomerId
ProductType
Status
Currency
QuotedAmount
FinalAmount
PaidAmount
RefundedAmount
SupplierStatus
PaymentStatus
CreatedAt
UpdatedAt
ExpiresAt
Version
```

---

# 81. Booking Price Snapshot

```text
Id
BookingId
QuoteId
BaseAmount
TaxAmount
SupplierFee
PlatformFee
ConvenienceFee
AddOnAmount
DiscountAmount
CouponDiscount
WalletAmount
FinalAmount
Currency
PricingVersion
SupplierPricingReference
SnapshotJson
CreatedAt
```

Immutable after confirmation except through explicit adjustment records.

---

# 82. Idempotency

Create an idempotency record for critical external commands.

Fields:

```text
Key
Operation
Customer/User
RequestHash
ResponseSnapshot
Status
CreatedAt
ExpiresAt
```

Use for:

```text
Booking create
Payment order
Payment verify
Refund create
Supplier booking command
Cancellation command
```

---

# 83. Concurrency

Important concurrency scenarios:

```text
Last bus seat
Last holiday departure seat
Hotel room/rate changed
Duplicate payment callback
Duplicate supplier callback
Two cancellation attempts
Wallet spend race
Coupon usage limit race
```

Handle with:

- atomic database updates
- unique constraints
- version checking
- transactions
- supplier revalidation
- idempotency keys

---

# 84. Cache Strategy

Use distributed caching only for appropriate read-heavy data.

Suitable:

```text
Airport/station/city autocomplete
Public CMS
Popular routes
Destination content
Supplier token metadata
Short-lived search response fragments
Feature configuration
```

Do not cache sensitive/rapidly changing inventory without an explicit expiry/revalidation rule.

---

# 85. Search Strategy

Phase 1:

```text
PostgreSQL indexed search
PostgreSQL full-text capabilities where suitable
Normalized autocomplete tables
```

At scale:

```text
Dedicated search index
```

Possible index documents:

```text
Airports
Stations
Cities
Hotels
Destinations
Holiday Packages
Routes
Content
```

Search engine technology remains an infrastructure decision.

---

# 86. Global Search

One search bar can search:

```text
Flights to Dubai
Delhi to Mumbai trains
Delhi to Jaipur bus
Hotels in Goa
Bali holiday
Kashmir package
```

Return grouped results.

```text
Flights
Trains
Buses
Hotels
Destinations
Packages
Content
```

---

# 87. Recommendation Architecture

Start rule-based.

Inputs:

```text
Recent searches
Favorites
Booking history
Departure city
Season
Popular routes
Price bands
Product preference
```

Outputs:

```text
Recommended destinations
Hotels
Holiday packages
Route suggestions
Offers
```

AI/ML can be introduced later.

Never allow recommendation logic to invent price/availability.

---

# 88. API Base

```text
/api/v1
```

Version externally consumed APIs.

---

# 89. Authentication APIs

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/me
PUT  /api/v1/me
```

---

# 90. Global Discovery APIs

```text
GET /api/v1/home
GET /api/v1/search
GET /api/v1/autocomplete
GET /api/v1/offers
GET /api/v1/recommendations
```

---

# 91. Flight APIs

```text
POST /api/v1/flights/search
GET  /api/v1/flights/search/{searchId}
GET  /api/v1/flights/results/{resultId}
POST /api/v1/flights/revalidate
GET  /api/v1/flights/status
POST /api/v1/flights/alerts
```

---

# 92. Train APIs

```text
POST /api/v1/trains/search
GET  /api/v1/trains/{trainNumber}
POST /api/v1/trains/availability
POST /api/v1/trains/fare
GET  /api/v1/trains/pnr/{pnr}
GET  /api/v1/trains/status
POST /api/v1/trains/alerts
```

Actual booking endpoints depend on approved partner requirements.

---

# 93. Bus APIs

```text
POST /api/v1/buses/search
GET  /api/v1/buses/trips/{tripId}
GET  /api/v1/buses/trips/{tripId}/seats
POST /api/v1/buses/holds
DELETE /api/v1/buses/holds/{id}
```

---

# 94. Hotel APIs

```text
POST /api/v1/hotels/search
GET  /api/v1/hotels/search/{searchId}
GET  /api/v1/hotels/{propertyId}
POST /api/v1/hotels/rates/revalidate
```

---

# 95. Holiday APIs

```text
GET  /api/v1/holidays
GET  /api/v1/holidays/{slug}
GET  /api/v1/holidays/{id}/departures
POST /api/v1/holidays/quote
POST /api/v1/custom-trips
```

---

# 96. Booking APIs

```text
POST /api/v1/booking-sessions
GET  /api/v1/booking-sessions/{id}
PUT  /api/v1/booking-sessions/{id}/travelers
PUT  /api/v1/booking-sessions/{id}/contact
PUT  /api/v1/booking-sessions/{id}/addons
POST /api/v1/booking-sessions/{id}/quote
POST /api/v1/booking-sessions/{id}/coupon
DELETE /api/v1/booking-sessions/{id}/coupon

POST /api/v1/bookings
GET  /api/v1/bookings/{id}
GET  /api/v1/me/bookings
POST /api/v1/bookings/{id}/cancel
GET  /api/v1/bookings/{id}/timeline
GET  /api/v1/bookings/{id}/documents
```

---

# 97. Payment APIs

```text
POST /api/v1/bookings/{id}/payments/order
POST /api/v1/payments/verify
POST /api/v1/payments/webhooks/{provider}
GET  /api/v1/bookings/{id}/payments
```

Webhook route must verify provider authenticity.

---

# 98. Refund APIs

```text
POST /api/v1/bookings/{id}/refunds
GET  /api/v1/bookings/{id}/refunds
GET  /api/v1/refunds/{id}
```

---

# 99. Account APIs

```text
GET    /api/v1/me/travelers
POST   /api/v1/me/travelers
PUT    /api/v1/me/travelers/{id}
DELETE /api/v1/me/travelers/{id}

GET    /api/v1/me/wishlist
POST   /api/v1/me/wishlist
DELETE /api/v1/me/wishlist/{id}

GET    /api/v1/me/wallet
GET    /api/v1/me/alerts
GET    /api/v1/me/notifications
```

---

# 100. Support APIs

```text
GET  /api/v1/support/tickets
POST /api/v1/support/tickets
GET  /api/v1/support/tickets/{id}
POST /api/v1/support/tickets/{id}/messages
```

---

# 101. API Error Standard

Use consistent Problem Details.

Example:

```json
{
  "type": "fare_changed",
  "title": "The fare has changed",
  "status": 409,
  "detail": "The selected fare is no longer available at the previous amount.",
  "correlationId": "..."
}
```

Common conflict codes:

```text
fare_changed
inventory_changed
seat_unavailable
room_unavailable
quote_expired
payment_not_verified
booking_already_confirmed
booking_not_cancellable
supplier_confirmation_pending
refund_pending
```

---

# 102. React / Mobile Form Standard

Every form must define:

- fields
- required state
- inline validation
- backend validation
- submitting state
- success state
- error state
- retry
- draft behavior
- unsaved-change behavior

Examples:

```text
Flight search
Train search
Bus search
Hotel search
Traveler details
Passenger details
Coupon
Payment
Cancellation
Support
Custom trip
Profile
Saved traveler
```

---

# 103. Search UX — Flights

Inputs:

```text
One Way / Round Trip
From
To
Departure
Return
Travelers
Cabin
Special Fare
```

Results:

- airline
- times
- duration
- stops
- baggage
- fare type
- refund/change summary
- price
- Select

Filters:

```text
Stops
Airlines
Departure Time
Arrival Time
Price
Duration
Refundability
Baggage
```

---

# 104. Search UX — Trains

Inputs:

```text
From Station
To Station
Date
```

Results:

- train number/name
- departure
- arrival
- duration
- running days
- classes
- availability
- fare

Utilities:

```text
PNR Status
Live Train Status
Seat Availability
```

---

# 105. Search UX — Buses

Inputs:

```text
From
To
Date
```

Filters:

```text
Bus Type
Departure Time
Arrival Time
Operator
Boarding Point
Dropping Point
Amenities
Price
Rating
```

Seat selection uses a touch-friendly seat map.

---

# 106. Search UX — Hotels

Inputs:

```text
Destination
Check-in
Check-out
Rooms
Guests
```

Filters:

```text
Price
Star Rating
Guest Rating
Amenities
Property Type
Area
Meal Plan
Cancellation
Pay at Property
```

Hotel detail:

- gallery
- room types
- rates
- amenities
- policies
- location
- reviews
- sticky booking CTA

---

# 107. Home Experience

Home should support:

```text
Unified product switcher
Recent searches
Upcoming trip
Popular routes
Fare alerts
Trending destinations
Hotel deals
Holiday packages
Offers
Trip planner
Travel utilities
Support
```

If customer has an upcoming trip, surface it prominently.

---

# 108. My Trips

Unified booking list.

Tabs:

```text
Upcoming
Completed
Cancelled
Refunds
```

Booking cards vary by product but share:

```text
Product
Route / Property / Package
Date
Booking Number
Status
Payment
Primary Next Action
```

---

# 109. Trip Hub

Unified booking detail tabs:

```text
Overview
Travelers
Tickets / Vouchers
Payments
Cancellation
Refund
Support
Timeline
```

Product-specific modules can add:

```text
Flight Status
PNR
Train Status
Bus Boarding
Hotel Voucher
Holiday Itinerary
```

---

# 110. Cancellation Flow

Never one-tap cancel.

Flow:

```text
Open Booking
→ Check Supplier Cancellation Rules
→ Calculate Penalty / Refund
→ Show Customer
→ Select Reason
→ Confirm
→ Supplier Cancellation
→ Local Status Update
→ Refund Workflow
```

If supplier response is delayed, show `CancellationPending`.

---

# 111. Refund Flow

Show:

```text
Requested Amount
Supplier Deduction
Platform Deduction
Refund Amount
Refund Destination
Expected Status
Gateway Reference where appropriate
Timeline
```

Do not promise a completion date unless backed by actual process data.

---

# 112. Admin / Operations Application

Admin areas:

```text
Dashboard
Live Operations
Bookings
Payments
Refunds
Customers
Flights
Trains
Buses
Hotels
Holidays
Suppliers
Pricing
Promotions
Wallet
Loyalty
Support
Reconciliation
Risk
Content
Reports
Users
Roles
Audit
Settings
```

---

# 113. Admin Route Architecture

```text
/admin
/admin/operations
/admin/bookings
/admin/bookings/:id
/admin/payments
/admin/refunds
/admin/customers
/admin/customers/:id

/admin/flights
/admin/trains
/admin/buses
/admin/hotels
/admin/holidays

/admin/suppliers
/admin/suppliers/:id

/admin/pricing
/admin/promotions
/admin/wallet
/admin/loyalty
/admin/support
/admin/support/:id
/admin/reconciliation
/admin/risk
/admin/content
/admin/reports
/admin/users
/admin/roles
/admin/audit
/admin/settings
```

---

# 114. Admin Dashboard

KPIs:

```text
Bookings Today
Gross Booking Value
Net Revenue
Payment Success Rate
Supplier Confirmation Rate
Pending Confirmations
Cancellation Rate
Refund Pending
Support Open
Reconciliation Exceptions
```

Product cards:

```text
Flight Bookings
Train Bookings
Bus Bookings
Hotel Bookings
Holiday Bookings
```

All KPIs must drill into filtered operational screens.

---

# 115. Live Operations

Exception-first operational board:

```text
Payment Successful / Supplier Pending
Supplier Booking Failed
Confirmation Delayed
Ticket / Voucher Missing
Cancellation Pending
Refund Pending
Refund Failed
Reconciliation Mismatch
High Priority Support
```

This is more valuable than a generic list of all successful bookings.

---

# 116. Booking Admin Detail

Tabs:

```text
Overview
Customer
Travelers
Product Data
Supplier
Price Snapshot
Payments
Cancellation
Refund
Documents
Support
Timeline
Audit
```

Actions must be permission-controlled.

---

# 117. Supplier Admin

Manage:

```text
Provider
Product
Enabled
Market
Credentials Reference
Timeout
Priority
Fallback Order
Rate Limit
Health
Last Success
Last Error
Maintenance State
```

Never expose secrets in normal admin responses.

---

# 118. Supplier Routing

Routing rules can consider:

```text
Product
Market
Supplier health
Commercial priority
Supported route/property
Latency
Failure rate
Feature flag
```

Do not switch suppliers mid-booking without preserving references and audit.

---

# 119. Payment Admin

Show:

```text
Payment
Booking
Customer
Provider
Amount
Status
Attempts
Gateway Reference
Webhook State
Refunds
Reconciliation
Audit
```

---

# 120. Refund Admin

Queue:

```text
Requested
Supplier Pending
Approved
Gateway Processing
Completed
Failed
Manual Review
```

Actions depend on permission and actual backend state.

---

# 121. Reconciliation Admin

Dashboards:

```text
Payment Mismatch
Supplier Booking Mismatch
Refund Mismatch
Settlement Mismatch
Unmatched Gateway Event
Unmatched Supplier Event
```

Support export/reporting.

---

# 122. Support Admin

Support agent gets:

- customer
- booking
- supplier
- payment
- refund
- ticket/voucher
- timeline
- customer conversation
- internal notes

No database access should be required to resolve ordinary support cases.

---

# 123. CMS Admin

CRUD:

```text
Homepage Sections
Banners
Destination Content
Travel Guides
Blogs
FAQs
Offers
SEO Metadata
Policy Pages
Mobile Promotional Content
```

---

# 124. Roles

Recommended:

```text
Customer
SupportAgent
OperationsAgent
FinanceAgent
ReconciliationAgent
ContentManager
MarketingManager
SupplierManager
RiskAgent
Admin
SuperAdmin
```

---

# 125. Permission Areas

```text
Customers
Bookings
Flights
Trains
Buses
Hotels
Holidays
Suppliers
Pricing
Payments
Refunds
Reconciliation
Promotions
Wallet
Loyalty
Support
Risk
Content
Reports
Users
Roles
Settings
Audit
```

Backend remains authoritative.

---

# 126. Security

Required:

```text
HTTPS
Short-lived access token
Refresh token rotation
Secure password hashing
Rate limiting
Login throttling
Permission authorization
Secure secret storage
WAF at edge
Input validation
File upload validation
Supplier webhook verification
Payment webhook verification
Audit logging
Sensitive data masking
```

---

# 127. Sensitive Data

Minimize storage of:

```text
Passport data
Government identifiers
Payment-related information
Supplier credentials
```

Store only what business/legal flow requires.

Restrict access by permission and log sensitive reads where necessary.

---

# 128. Observability

Every request should support:

```text
Correlation ID
Trace ID
Service
Route
Duration
Status
Customer/Booking reference where safe
Supplier
Supplier latency
Supplier result
```

Monitor:

```text
API latency
Error rate
Search latency
Supplier latency
Supplier success
Booking conversion
Payment success
Confirmation success
Cancellation success
Refund success
Queue lag
Background job failures
Database saturation
Cache hit rate
```

---

# 129. Structured Logging

Never log:

- passwords
- refresh tokens
- payment secrets
- supplier secrets
- full sensitive traveler documents

Mask:

- email where appropriate
- phone
- passport
- payment identifiers

---

# 130. Health Checks

Health endpoints:

```text
Liveness
Readiness
PostgreSQL
Event bus
Distributed cache
Critical supplier dependencies
Payment gateway dependency
```

Supplier failures should not necessarily make the whole application "down."

---

# 131. Resilience

For external calls use:

```text
Timeout
Circuit breaker
Safe retry
Bulkhead/isolation
Fallback only where business-correct
```

Do not retry a booking request blindly.

Search/read requests may be safer to retry than purchase commands.

---

# 132. Performance Targets

Targets should be measured and tuned.

Suggested product expectations:

```text
Cached public/home reads: fast
Search response: optimized for perceived speed
Result lists: stream/paginate
Booking commands: correctness over raw speed
Admin large lists: server-side pagination/filtering
Mobile: skeletons, incremental rendering, image optimization
```

Do not set fake SLA claims before load testing.

---

# 133. PostgreSQL Index Strategy

Examples:

```text
booking.bookings(booking_number) UNIQUE
booking.bookings(customer_id, created_at DESC)
booking.bookings(product_type, status, created_at DESC)

payment.payments(booking_id, status)
payment.gateway_events(provider, external_event_id) UNIQUE

refund.refunds(booking_id, status)

holidays.packages(slug) UNIQUE
holidays.departures(package_id, start_date, status)

support.tickets(status, priority, created_at)
support.tickets(booking_id)

audit.audit_logs(entity_type, entity_id, created_at)
```

Tune against actual query plans.

---

# 134. PostgreSQL Scaling Path

Stage 1:

```text
Single primary PostgreSQL cluster
Domain schemas
Connection pooling
Strong indexes
Backups
```

Stage 2:

```text
Read replicas for heavy reads/reports
Partition high-volume history/event tables
Archive old audit/log-like operational records
```

Stage 3:

```text
Independent PostgreSQL databases for the highest-scale domains
```

The application contracts should allow this without client changes.

---

# 135. Data Retention

Define retention for:

```text
Search sessions
Supplier raw responses
Logs
Audit
Payment events
Booking snapshots
Traveler documents
Support attachments
Notifications
```

Bookings/payment/audit often require longer retention than transient searches.

Exact retention is a legal/business policy decision.

---

# 136. Reporting

Operational reporting:

```text
Bookings by product
Revenue
Payment success
Supplier conversion
Cancellation
Refund
Support
Promotion
Wallet
Customer repeat rate
Top routes
Top hotels
Top destinations
```

Financial reporting:

```text
Gross booking value
Platform revenue
Supplier payable
Gateway fees
Refunds
Wallet liability
Promotion cost
Settlement mismatch
```

---

# 137. Analytics Events

Track product events:

```text
home_view
search_started
search_completed
result_selected
fare_revalidated
booking_started
traveler_added
coupon_applied
payment_started
payment_success
supplier_confirmation
booking_confirmed
booking_failed
cancel_started
refund_completed
support_created
```

Analytics must not become the authoritative source for booking state.

---

# 138. CI / CD

Pipeline:

```text
Pull Request
→ Restore Dependencies
→ Lint / Format
→ Unit Tests
→ React Build
→ React Native Checks
→ .NET Build
→ Backend Tests
→ Migration Validation
→ Security Checks
→ Container Build
→ Deploy Non-Prod
→ Integration Tests
→ E2E Tests
→ Promote
```

Production migration must be controlled.

---

# 139. Deployment Topology

Cloud/provider neutral:

```text
Internet
   │
CDN / WAF
   │
API Gateway / Load Balancer
   │
Container / App Runtime
   ├── Web API/BFF
   ├── Domain Services
   ├── Admin API
   └── Workers
   │
   ├── PostgreSQL
   ├── Distributed Cache
   ├── Event Bus
   ├── Object Storage
   └── Observability
```

React web is served through static hosting/CDN.

React Native calls the same protected APIs.

---

# 140. Environment Model

```text
Local
Development
Test
Staging
Production
```

Each environment has:

- separate PostgreSQL
- separate supplier credentials
- separate payment credentials
- separate callback URLs
- separate feature flags

Development simulator integrations must never be active in Production.

---

# 141. Feature Flags

Useful flags:

```text
FlightsEnabled
TrainsEnabled
BusesEnabled
HotelsEnabled
HolidaysEnabled
CabsEnabled
ActivitiesEnabled
WalletEnabled
LoyaltyEnabled
SupplierXEnabled
PayAtHotelEnabled
```

Feature flag cannot bypass authorization/business validation.

---

# 142. Development Simulators

When supplier credentials are unavailable, development/test may provide simulators.

Examples:

```text
DevelopmentFlightProvider
DevelopmentHotelProvider
DevelopmentBusProvider
DevelopmentPaymentGateway
```

Every simulator must:

- be environment-restricted
- be clearly labeled
- never be enabled in production
- return realistic success/failure/conflict cases

Do not call simulated inventory live inventory.

---

# 143. Testing Strategy

## Unit

Test:

```text
Pricing
Cancellation calculations
Quote expiry
Booking state transitions
Coupon eligibility
Wallet ledger
Supplier normalization
Refund rules
```

## Integration

Test:

```text
PostgreSQL repositories
Transactions
Outbox
Idempotency
Supplier adapter contracts
Payment webhook verification
```

## E2E

Test:

```text
Flight search → booking
Bus seat hold → booking
Hotel search → revalidate → booking
Holiday departure → hold → payment
Cancellation → refund
Support
Admin exception handling
```

---

# 144. Contract Tests

Supplier adapters require contract tests for:

- mapping
- error translation
- missing fields
- price changes
- timeout
- duplicate response
- delayed confirmation

Never assume every supplier has identical semantics.

---

# 145. Load Tests

Key scenarios:

```text
Autocomplete burst
Flight search burst
Train status burst
Hotel search
Offer campaign traffic
Payment callback burst
Booking confirmation burst
Notification batch
```

Test PostgreSQL and supplier rate-limit behavior.

---

# 146. Failure Scenarios

Must be explicitly tested:

```text
Search supplier timeout
Fare changes during checkout
Last seat disappears
Hotel rate disappears
Payment succeeds / supplier fails
Supplier succeeds / callback delayed
Duplicate webhook
Cancellation supplier timeout
Refund gateway timeout
Customer closes app during payment
Network lost after payment
Worker restart during outbox processing
```

---

# 147. Customer Error UX

Messages must be actionable.

Examples:

```text
The fare changed. Review the updated price.
This seat is no longer available. Choose another seat.
The selected room is no longer available.
Payment is being verified. Do not pay again.
Your booking is awaiting supplier confirmation.
Cancellation is being processed.
Refund is in progress.
```

Do not expose raw supplier/database exceptions.

---

# 148. Loading / Empty / Error States

Every web/mobile screen supports:

```text
Loading
Loaded
Empty
Error
Refreshing
Mutating
```

No blank sections.

No fake fallback data after a failed API.

---

# 149. Mobile Deep Links

Examples:

```text
vsrtravel://booking/:id
vsrtravel://flight/:bookingId
vsrtravel://train/:bookingId
vsrtravel://hotel/:bookingId
vsrtravel://support/:ticketId
vsrtravel://offer/:id
```

Protected deep links must authenticate before rendering sensitive data.

---

# 150. Mobile Notifications

Push notifications may open:

- booking
- payment
- ticket/voucher
- flight status
- PNR
- train status
- bus boarding
- hotel booking
- refund
- support
- offer

Notification delivery is not the source of truth; screen refreshes backend state.

---

# 151. Phase 1 Launch Scope

Build the full platform foundation but launch a manageable subset.

Recommended:

```text
Holiday Packages
Group Departures
Hotels (curated or one approved supplier)
Flights (one approved supplier if available)
Account / My Trips
Payments
Refund foundation
Support
Admin
React Native mobile shell + launched products
```

Train/bus launch depends on approved integrations.

---

# 152. Phase 2

```text
Train integration
Bus integration
Additional hotel suppliers
Additional flight supplier
Cabs
Activities
Fare alerts
PNR / status utilities
Wallet / Credits
Loyalty
Advanced reconciliation
Supplier routing
Push notifications
```

---

# 153. Phase 3

```text
Dynamic supplier routing
Advanced personalization
AI Trip Planner
AI Support Assistant
Price / fare prediction
Recommendation models
B2B Agent Portal
Supplier Portal
Corporate Travel
Multi-currency
International market expansion
```

AI never invents live inventory or final price.

---

# 154. Build Order for Coding Agent

```text
1. Repository structure
2. Shared .NET building blocks
3. PostgreSQL domain schemas
4. Identity / Customer
5. React web shell
6. React Native shell
7. Admin shell
8. Discovery / CMS
9. Holiday product
10. Pricing
11. Inventory / holds
12. Booking
13. Payment
14. Account / My Trips
15. Support
16. Supplier abstraction
17. First supplier-backed product
18. Refund / cancellation
19. Notifications
20. Reconciliation
21. Remaining travel products
22. Wallet / loyalty
23. Risk
24. Analytics / reports
25. Mobile product polish
26. Full E2E and failure testing
```

---

# 155. Critical End-to-End Flow A — Flight

```text
Search
→ Results
→ Select Fare
→ Revalidate
→ Travelers
→ Quote
→ Payment
→ Supplier Booking
→ Confirmation
→ Ticket / Booking Reference
→ My Trips
```

---

# 156. Critical End-to-End Flow B — Holiday

```text
Discover
→ Package
→ Departure
→ Travelers
→ Inventory Hold
→ Quote
→ Add-ons
→ Coupon
→ Payment
→ Confirm
→ My Trips
```

---

# 157. Critical End-to-End Flow C — Bus

```text
Search
→ Bus
→ Seat Layout
→ Hold Seat
→ Passenger
→ Quote
→ Payment
→ Supplier Confirm
→ Ticket
```

---

# 158. Critical End-to-End Flow D — Hotel

```text
Search
→ Results
→ Hotel
→ Room
→ Revalidate
→ Guest
→ Quote
→ Payment / Pay-at-Property
→ Supplier Confirm
→ Voucher
```

---

# 159. Critical End-to-End Flow E — Cancellation / Refund

```text
My Trips
→ Booking
→ Cancel
→ Supplier Rules
→ Refund Preview
→ Confirm
→ Supplier Cancel
→ Refund Create
→ Gateway Refund
→ Status Timeline
```

---

# 160. Critical End-to-End Flow F — Payment Success / Supplier Failure

```text
Payment Successful
→ Supplier Booking Request
→ Supplier Failure
→ Booking NOT marked confirmed
→ Exception workflow
→ Retry only if business-safe
→ Refund if booking cannot complete
→ Customer informed
→ Operations alerted
```

This scenario is mandatory.

---

# 161. Definition of Done — Web

- [ ] Home works with real APIs
- [ ] Product search forms work
- [ ] Results filters work
- [ ] Product detail works
- [ ] Checkout works
- [ ] Account works
- [ ] My Trips works
- [ ] Cancellation/refund status works
- [ ] Support works
- [ ] Loading/empty/error states work
- [ ] No dead primary CTA
- [ ] No fake live inventory

---

# 162. Definition of Done — React Native

- [ ] Native navigation works
- [ ] Authentication/session works
- [ ] Product search works
- [ ] Booking flow works
- [ ] Payment flow works
- [ ] My Trips works
- [ ] Booking detail works
- [ ] Notifications/deep-link routing works
- [ ] Safe offline behavior works
- [ ] Small-screen forms are keyboard safe
- [ ] No WebView dependency for core product
- [ ] No dead primary CTA

---

# 163. Definition of Done — Backend

- [ ] .NET builds
- [ ] PostgreSQL migrations work
- [ ] Domain boundaries enforced
- [ ] Supplier adapters isolated
- [ ] Server pricing authoritative
- [ ] Inventory concurrency handled
- [ ] Booking state machine enforced
- [ ] Payment idempotency works
- [ ] Supplier confirmation state works
- [ ] Cancellation/refund workflow works
- [ ] Outbox works
- [ ] Background workers recover safely
- [ ] ProblemDetails normalized
- [ ] Authorization enforced
- [ ] Audit added to critical admin operations

---

# 164. Definition of Done — PostgreSQL

- [ ] Domain schemas created
- [ ] Correct money types
- [ ] Currency stored
- [ ] Unique business keys
- [ ] Query indexes
- [ ] Concurrency/version strategy
- [ ] Booking snapshot immutable
- [ ] Payment webhook uniqueness
- [ ] Idempotency table
- [ ] Backups configured
- [ ] Migrations tested

---

# 165. Definition of Done — Operations

- [ ] Admin dashboard
- [ ] Booking detail
- [ ] Payment detail
- [ ] Refund queue
- [ ] Supplier status/configuration
- [ ] Reconciliation queue
- [ ] Support workspace
- [ ] Risk flags
- [ ] CMS
- [ ] Roles/permissions
- [ ] Audit
- [ ] Exception-first live operations

---

# 166. Definition of Done — Reliability

Mandatory test outcomes:

- [ ] Duplicate payment callback does not double-confirm
- [ ] Duplicate refund callback does not double-credit
- [ ] Fare change handled
- [ ] Last-seat conflict handled
- [ ] Supplier timeout handled
- [ ] Supplier confirmation delayed handled
- [ ] Payment success + supplier failure handled
- [ ] Network loss during payment handled
- [ ] Worker restart does not lose outbox event
- [ ] Cancellation retry safe
- [ ] Customer never sees false confirmed state

---

# 167. Architecture Decision Summary

```text
WEB
React

MOBILE
React Native

BACKEND
.NET / ASP.NET Core

PRIMARY DATABASE
PostgreSQL

ARCHITECTURE
Domain-aligned service architecture
Practical grouped deployment initially
Independent service extraction at scale

INTEGRATIONS
Provider adapter pattern

ASYNC
Event-driven workflows + Outbox + Workers

SEARCH
PostgreSQL first
Dedicated index when justified

CACHE
Distributed cache abstraction where appropriate

ADMIN
React web

SOURCE OF TRUTH
Backend + PostgreSQL + supplier confirmation
```

---

# 168. Coding-Agent Master Prompt

Copy this document to the project root as:

```text
TRAVEL_ARCHITECTURE_V2.md
```

Then instruct the coding agent:

```text
Build the complete VSR Travel OTA platform described in TRAVEL_ARCHITECTURE_V2.md.

The fixed application stack is:

Web:
- React

Mobile:
- React Native

Backend:
- .NET / ASP.NET Core

Database:
- PostgreSQL
- Entity Framework Core PostgreSQL provider

Do not switch these technologies.

Build an original VSR Travel experience. Do not copy another travel company's private implementation, source code, UI, branding, text, imagery or proprietary algorithms.

The platform must be architected for:
Flights
Trains
Buses
Hotels
Holiday Packages
Group Trips
Custom Trips
Cabs
Activities
Payments
Refunds
Wallet / Loyalty readiness
Support
Admin / Operations
Supplier integrations
Reconciliation.

Do not fabricate supplier inventory.

All supplier-backed travel products must use provider interfaces/adapters.

The backend is authoritative for:
price
availability
booking status
supplier confirmation
payment
cancellation
refund
wallet
loyalty.

Use domain-aligned PostgreSQL schemas.

Implement immutable booking price snapshots.

Implement idempotency for critical commands.

Use transactions and concurrency protection.

Use an Outbox for reliable integration events.

Build an exception-safe booking state machine.

The following failure flow must work correctly:
Payment Successful
→ Supplier Booking Failed
→ Booking remains unconfirmed
→ Operations/refund workflow starts
→ Customer sees truthful pending/failed state.

React web and React Native must consume the real backend.
Do not leave UI screens as static mocks.

Do not create a WebView wrapper as the mobile product.

Build complete:
forms
validation
loading
empty states
errors
retries
server pagination
mobile-safe interaction
permission checks
admin operations
support workflows
supplier exception workflows.

Run:
web production build
mobile checks
.NET build
tests
PostgreSQL migrations
seed
integration tests
end-to-end tests.

Do not declare the application complete until at least one full supplier-backed booking flow and the full curated holiday booking flow work against the real backend, including payment and failure recovery.
```

---

# 169. Final Product Benchmark

The finished product should feel like:

```text
A real multi-product OTA,
not a travel-themed CRUD application.
```

The customer journey should be:

```text
DISCOVER
   ↓
SEARCH
   ↓
COMPARE
   ↓
REVALIDATE
   ↓
BOOK
   ↓
PAY
   ↓
CONFIRM
   ↓
TRAVEL
   ↓
SUPPORT
```

The operational journey should be:

```text
MONITOR
   ↓
DETECT EXCEPTION
   ↓
RESOLVE
   ↓
RECONCILE
   ↓
AUDIT
```

The most important quality is not visual complexity.

It is **truthful inventory, reliable booking state, correct money movement, excellent mobile/web UX, strong failure recovery and operational visibility**.
