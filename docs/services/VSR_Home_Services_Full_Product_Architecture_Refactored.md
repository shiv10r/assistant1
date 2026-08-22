# VSR Home Services Marketplace — Full-Fledged Product Architecture

> **Purpose:** Complete product architecture for a real working home-services marketplace.
>
> > ## Frontend Refactor Priority
> > This version contains a major **interactive frontend architecture refactor in §§165–170**.
> > Those sections supersede the earlier thin frontend file mapping and must be implemented as the primary
> > frontend source of truth. All original business/domain/backend requirements remain mandatory.
> >
>
> **Technology constraints**
> - Frontend: React
> - Backend: .NET
> - Database: PostgreSQL
>
> Do not assume or introduce any additional technology choices unless explicitly requested later.
>
> The coding agent should focus on **complete product functionality, workflows, screens, modules, roles, business rules, data models, APIs, and operational flows**.

---

# 0. Build Directive — Live Product, Not a Static Page

The current `home-services` module in the React frontend (`frontend/src/services/home-services`) is a **static/demo build**: all categories, bookings, professionals, earnings and reviews are hardcoded fixtures (`homeServicesData.ts`) driven by a client-only Zustand store (`homeServicesStore.ts`) with no backend calls. This document supersedes that state. The rebuild must:

- **Reuse and enhance the existing UI**, not discard it. Keep the current shell/routing/page structure (`HomeServicesShell`, `pages/`, `pages/pro/`, `pages/admin/`) and visual design language; extend it with real data, new screens, and missing states (loading/empty/error) instead of a ground-up rewrite.
- Cover **every service category** already listed in this document (sections 5–34), not just the initial launch subset — the catalog must be fully data-driven from the database so admins can add/edit/reorder categories, services, packages and add-ons without a code deploy.
- Replace every mocked read/write in the store with real HTTP calls to a **.NET backend** persisted in **PostgreSQL**, following the same layered pattern (Domain → Application → Infrastructure → Api) already used by the Warehouse module in `VSRSystemsBackend`.
- Add a dedicated **Admin KPI / Analytics screen** with real charts (see §161).
- Add **earnings/financial APIs for every role** — customer (wallet, refunds, invoices), professional (earnings, payouts), admin (commission, revenue, payouts) — see §162.
- Backend must be built to the same **industry/production standard** as the platform's other fully-built domains (validation, AutoMapper DTO mapping, repository + service layering, EF Core configurations, migrations, `ApiResponse<T>` envelopes, auth/role checks) — see §163.
- Ship **complete, column-level database schemas** for every entity needed by Phase 1 — see §161a (replaces the table-name-only list in §116).
- Sales / Field Agent role and dashboard is specified in a **separate document**: `VSR_Sales_Agent_Dashboard_Architecture.md` (same `docs/services` folder). Admin retains full visibility/control over that module too.
- Integrate a real **payment gateway** (not just an internal `Payments` table) for checkout, refunds and payouts, with Admin controlling gateway configuration — see §171.

---

# 1. Product Goal

Build a complete marketplace where customers can discover, book, track, pay for, and review home services, while service professionals can onboard, accept jobs, manage availability, complete work, and track earnings.

The platform must also provide a powerful operations/admin system for managing:

- customers
- professionals
- service catalog
- pricing
- bookings
- assignments
- payments
- refunds
- commissions
- payouts
- support
- disputes
- service quality
- memberships
- coupons
- cities
- zones
- reports
- content

This should feel like a real production marketplace.

---

# 2. Main User Types

## Customer

Can:

- register/login
- manage profile
- save multiple addresses
- search services
- browse categories
- view service packages
- select add-ons
- select date/time
- book service
- apply coupons
- make payment
- track professional assignment
- contact professional
- reschedule
- cancel
- raise support ticket
- raise dispute
- rate/review
- rebook
- purchase membership
- manage recurring services
- download invoice
- see service history

---

## Service Professional

Can:

- register
- complete onboarding
- submit verification documents
- choose service categories
- choose skills
- choose service areas
- define availability
- receive job requests
- accept/decline
- view today's jobs
- view upcoming jobs
- mark on-the-way
- mark arrived
- start service
- add service notes
- request extra work approval
- add parts/materials
- complete job
- upload before/after photos
- view earnings
- view commissions
- view payout history
- view ratings/reviews
- raise support tickets
- update profile
- block personal time
- manage vacation days
- see performance score

---

## Operations Agent

Can:

- monitor live bookings
- manually assign professionals
- reassign professionals
- call customer/professional
- resolve delayed bookings
- handle no-show cases
- escalate disputes
- approve extra charges
- cancel/reschedule bookings
- manage service failures
- monitor availability shortages

---

## Support Agent

Can:

- view customer tickets
- view professional tickets
- review booking timeline
- manage complaints
- communicate with both sides
- escalate refunds/disputes
- add internal notes
- close tickets

---

## Finance Agent

Can:

- view payments
- manage refund requests
- review commissions
- manage payout status
- reconcile payment records
- export financial reports
- view taxes/fees
- manage adjustments

---

## Admin

Can manage the whole platform.

---

# 3. Main Product Applications

The system should have three primary portals.

```text
Customer Application
Professional Application
Admin / Operations Application
```

Each must be responsive and usable independently.

---

# 4. Complete Service Category Structure

The platform should support a large, configurable category system.

Categories and services must be data-driven so admins can add/remove/reorder them without code changes.

---

# 5. Electrical Services

## Services

- Electrician Visit
- Electrical Inspection
- Switch Repair
- Socket Repair
- MCB Repair
- Fuse Repair
- Wiring Repair
- Complete House Wiring
- Fan Installation
- Fan Repair
- Exhaust Fan Installation
- Ceiling Fan Installation
- Decorative Light Installation
- Tube Light Installation
- LED Light Installation
- Chandelier Installation
- Doorbell Installation
- Inverter Installation
- Inverter Repair
- UPS Installation
- Power Backup Inspection
- Meter Board Work
- Earthing
- Short Circuit Repair
- Electrical Safety Inspection
- Smart Switch Installation
- Smart Home Electrical Setup

---

# 6. Plumbing Services

- Plumber Visit
- Tap Repair
- Tap Installation
- Basin Repair
- Sink Repair
- Water Leakage Repair
- Pipe Leakage
- Pipe Installation
- Flush Repair
- Toilet Repair
- Toilet Installation
- Shower Installation
- Shower Repair
- Water Tank Connection
- Drainage Blockage
- Kitchen Plumbing
- Bathroom Plumbing
- Water Pressure Issue
- Motor Pump Installation
- Water Pump Repair
- Complete Plumbing Inspection
- Underground Leakage Inspection

---

# 7. AC Services

- AC General Service
- AC Deep Cleaning
- AC Repair Visit
- AC Installation
- AC Uninstallation
- AC Gas Refill
- AC Gas Leak Repair
- AC Cooling Issue
- AC Water Leakage
- AC Noise Issue
- AC PCB Repair
- AC Compressor Inspection
- Split AC Service
- Window AC Service
- Cassette AC Service
- Commercial AC Service
- AC Annual Maintenance
- AC Pre-Summer Inspection

---

# 8. Refrigerator Services

- Refrigerator Repair
- Cooling Issue
- Gas Refill
- Compressor Inspection
- Water Leakage
- Thermostat Repair
- Door Seal Replacement
- Electrical Issue
- Deep Freezer Repair
- Double Door Refrigerator Repair
- Side-by-Side Refrigerator Repair

---

# 9. Washing Machine Services

- Washing Machine Repair
- Installation
- Uninstallation
- Drum Issue
- Drainage Issue
- Spin Issue
- Water Leakage
- Control Panel Repair
- Top Load Repair
- Front Load Repair
- Semi-Automatic Repair

---

# 10. Geyser / Water Heater Services

- Geyser Repair
- Installation
- Uninstallation
- Heating Issue
- Thermostat Issue
- Leakage Repair
- Electrical Repair
- Cleaning / Descaling
- Gas Geyser Service

---

# 11. Kitchen Appliance Services

- Microwave Repair
- Oven Repair
- Chimney Cleaning
- Chimney Repair
- Hob Repair
- Gas Stove Repair
- Mixer Grinder Repair
- Induction Cooktop Repair
- Dishwasher Repair
- Air Fryer Repair
- Kitchen Appliance Inspection

---

# 12. RO / Water Purifier

- RO General Service
- RO Installation
- RO Uninstallation
- Filter Replacement
- Membrane Replacement
- Water Quality Check
- Leakage Repair
- Low Water Flow
- UV Purifier Repair
- Annual RO Maintenance

---

# 13. Home Cleaning

- Full Home Deep Cleaning
- Apartment Cleaning
- Villa Cleaning
- Move-In Cleaning
- Move-Out Cleaning
- Post-Construction Cleaning
- Festival Cleaning
- One-Time Cleaning
- Weekly Cleaning
- Monthly Cleaning

---

# 14. Bathroom Cleaning

- Basic Bathroom Cleaning
- Deep Bathroom Cleaning
- Hard Water Stain Removal
- Tile Cleaning
- Toilet Deep Cleaning
- Shower Area Cleaning
- Bathroom Sanitization

---

# 15. Kitchen Cleaning

- Kitchen Deep Cleaning
- Chimney Cleaning
- Exhaust Cleaning
- Cabinet Exterior Cleaning
- Cabinet Interior Cleaning
- Grease Removal
- Sink Cleaning
- Appliance Exterior Cleaning

---

# 16. Sofa / Furniture Cleaning

- Sofa Cleaning
- Fabric Sofa Cleaning
- Leather Sofa Cleaning
- Dining Chair Cleaning
- Mattress Cleaning
- Carpet Cleaning
- Curtains Cleaning
- Office Chair Cleaning
- Upholstery Cleaning

---

# 17. Pest Control

- General Pest Control
- Cockroach Control
- Ant Control
- Mosquito Control
- Termite Control
- Bed Bug Control
- Rodent Control
- Lizard Control
- Commercial Pest Control
- Pre-Construction Termite Treatment

---

# 18. Carpenter Services

- Carpenter Visit
- Furniture Repair
- Bed Repair
- Sofa Repair
- Door Repair
- Door Installation
- Lock Installation
- Cabinet Repair
- Wardrobe Repair
- Drawer Repair
- Shelf Installation
- Curtain Rod Installation
- TV Unit Installation
- Modular Furniture Assembly
- Custom Woodwork
- Furniture Polishing

---

# 19. Painting Services

- Single Wall Painting
- Room Painting
- Full Home Painting
- Interior Painting
- Exterior Painting
- Texture Painting
- Waterproof Painting
- Rental Repainting
- Wall Touch-Up
- Wood Polishing
- Metal Painting
- Wallpaper Installation
- Wallpaper Removal

---

# 20. Waterproofing

- Terrace Waterproofing
- Bathroom Waterproofing
- Wall Seepage Repair
- Roof Leakage Repair
- Balcony Waterproofing
- Water Tank Waterproofing
- Basement Waterproofing
- Damp Wall Treatment

---

# 21. Home Renovation

- Kitchen Renovation
- Bathroom Renovation
- Bedroom Renovation
- Living Room Renovation
- Complete Home Renovation
- Flooring
- False Ceiling
- Modular Kitchen
- Wardrobe Installation
- Partition Work
- Tile Work
- Civil Repair
- Small Construction Work

---

# 22. Interior Services

- Interior Consultation
- Space Planning
- Modular Kitchen Design
- Wardrobe Design
- Living Room Design
- Bedroom Design
- Office Interior
- 2D Layout
- 3D Design
- Furniture Planning
- Lighting Planning
- Material Consultation

---

# 23. Home Security

- CCTV Installation
- CCTV Repair
- CCTV Maintenance
- Video Door Phone
- Smart Door Lock
- Digital Lock Installation
- Access Control
- Home Alarm
- Motion Sensor Setup
- Wi-Fi Camera Installation

---

# 24. Smart Home Services

- Smart Light Installation
- Smart Switch Setup
- Smart Plug Setup
- Voice Assistant Setup
- Home Automation Consultation
- Smart Doorbell
- Smart Lock
- Smart CCTV
- Automated Curtains
- Smart Appliance Integration

---

# 25. Internet / Network

- Wi-Fi Router Installation
- Wi-Fi Troubleshooting
- Wi-Fi Range Extension
- Mesh Wi-Fi Setup
- LAN Cabling
- Internet Setup
- Router Configuration
- Home Network Optimization

---

# 26. Computer Services

- Laptop Repair
- Desktop Repair
- OS Installation
- SSD Upgrade
- RAM Upgrade
- Virus Removal
- Data Backup
- Printer Setup
- Printer Repair
- Software Installation
- Home Computer Setup

---

# 27. Mobile / Gadget Services

- Smartphone Repair
- Screen Replacement
- Battery Replacement
- Charging Issue
- Software Issue
- Tablet Repair
- Smartwatch Setup
- Gadget Installation

---

# 28. Packers & Movers

- Local House Shifting
- Intercity Shifting
- Office Shifting
- Furniture Moving
- Vehicle Transportation
- Packing Only
- Unpacking
- Loading/Unloading
- Storage Service

---

# 29. Beauty at Home

Optional platform category.

- Haircut
- Hair Styling
- Facial
- Cleanup
- Waxing
- Manicure
- Pedicure
- Makeup
- Bridal Makeup
- Grooming
- Men's Grooming
- Massage / Spa services where legally/operationally appropriate

---

# 30. Gardening Services

- Gardener Visit
- Garden Maintenance
- Lawn Cutting
- Plant Care
- Planting
- Terrace Garden
- Balcony Garden
- Tree Trimming
- Landscaping Consultation
- Pest Treatment for Plants

---

# 31. Vehicle at Home

Optional category.

- Car Wash
- Bike Wash
- Car Interior Cleaning
- Car Detailing
- Battery Jump Start
- Basic Inspection
- Tyre Help
- Bike Basic Service

---

# 32. Home Assistance

- Furniture Assembly
- TV Wall Mount
- Curtain Installation
- Drill & Hang
- Picture Hanging
- Mirror Installation
- Baby Proofing
- Elder-Friendly Home Setup
- Minor Home Repairs

---

# 33. Emergency Services

Special urgent-booking category:

- Emergency Electrician
- Emergency Plumber
- Emergency AC Repair
- Lockout Help
- Water Leakage
- Power Failure Inspection
- Critical Appliance Repair

Emergency services can support:

```text
Immediate
Within 60 minutes
Within 2 hours
```

with separate pricing/availability.

---

# 34. Commercial / Small Business Services

The architecture should also support:

- Office Cleaning
- Office Electrical
- Office Plumbing
- Commercial AC
- CCTV
- Pest Control
- Office Furniture Repair
- Annual Maintenance Contracts
- Facility Maintenance

This creates a future B2B revenue path.

---

# 35. Customer Homepage

Recommended sections:

```text
Location Selector
Search
Emergency Services
Popular Categories
Recommended Services
Most Booked Near You
Today's Offers
Cleaning Services
Repair Services
Appliance Services
Home Improvement
Professional Services
Recurring Services
Membership
Top Rated Professionals
Recent Reviews
How It Works
Safety & Trust
Rebook Previous Service
Recently Viewed
Footer
```

---

# 36. Search

Customers should search with natural service keywords.

Examples:

```text
"AC not cooling"
"tap leaking"
"fan installation"
"sofa cleaning"
"fridge repair"
```

Search result should map query to relevant:

- categories
- services
- packages
- common problems

---

# 37. Service Problem Selection

Many customers do not know the exact service.

Allow:

```text
What problem are you facing?
```

Example AC:

```text
Not Cooling
Water Leakage
Noise
Not Starting
Bad Smell
Need Service
Need Installation
Not Sure
```

This can route to appropriate packages.

---

# 38. Service Package Model

Every service can have multiple packages.

Fields:

```text
Name
Short Description
Detailed Description
Price
Duration
What's Included
What's Excluded
Warranty
Inspection Required?
Parts Included?
Minimum Charge
Cancellation Rule
IsPopular
IsEmergencyEligible
```

---

# 39. Add-Ons

Services support optional add-ons.

Examples:

```text
Extra AC Unit
Gas Refill
Additional Bathroom
Sofa Seat
Extra Fan Installation
Replacement Part
Cleaning Material Upgrade
```

---

# 40. Inspection-Based Services

Some services cannot be fixed-price initially.

Support:

```text
Inspection Booking
```

Flow:

```text
Customer books inspection
→ professional visits
→ diagnoses problem
→ creates quotation
→ customer accepts/rejects
→ work proceeds
```

Useful for:

- appliance repair
- major electrical work
- plumbing
- renovation
- painting
- waterproofing

---

# 41. Customer Quotation Approval

Quotation includes:

```text
Labor
Parts
Materials
Additional Services
Tax
Discount
Total
Validity
Notes
```

Customer can:

```text
Accept
Reject
Request Clarification
```

---

# 42. Spare Parts / Materials

Professional can add materials/parts to job.

Fields:

```text
Part Name
Quantity
Unit Price
Warranty
Photo
Customer Approval
```

No extra charge should be finalized without customer approval where required.

---

# 43. Booking Types

Support:

```text
Instant Booking
Scheduled Booking
Emergency Booking
Inspection Booking
Recurring Booking
AMC Booking
Corporate Booking
```

---

# 44. Booking Wizard

Standard booking:

```text
Service
→ Package
→ Add-ons
→ Address
→ Date/Time
→ Instructions
→ Quote
→ Payment
→ Confirm
```

---

# 45. Customer Instructions

Allow:

```text
Text note
Problem description
Photo upload
Video upload
Voice-note-ready architecture
```

Useful before provider arrival.

---

# 46. Address Management

Customer can:

- use current location
- search location
- drop map pin
- save home
- save office
- save other addresses

Fields:

```text
Label
Flat/House
Building
Street
Landmark
Pincode
City
State
Latitude
Longitude
Contact Person
Contact Phone
Access Instructions
```

---

# 47. Serviceability

Backend checks:

```text
City
Pincode
Service Area
Category Availability
Professional Availability
Emergency Availability
```

---

# 48. Slot Management

Support:

```text
Today
Tomorrow
Custom Date
```

Slots can be configurable:

```text
8–10 AM
10–12 PM
12–2 PM
2–4 PM
4–6 PM
6–8 PM
```

or precise times.

---

# 49. Capacity Management

Availability should consider:

```text
Provider working hours
Provider skills
Provider service areas
Existing bookings
Travel buffer
Service duration
Time off
Maximum jobs/day
Emergency capacity
```

---

# 50. Booking Status Model

```text
Draft
AwaitingPayment
Confirmed
SearchingProfessional
Assigned
ProviderAccepted
ProviderOnTheWay
ProviderArrived
AwaitingStartVerification
ServiceInProgress
AwaitingCustomerApproval
AwaitingAdditionalPayment
ServiceCompleted
Completed
Cancelled
RefundPending
Refunded
Disputed
Closed
```

---

# 51. Booking Timeline

Every booking detail page displays:

```text
Booking created
Payment confirmed
Provider assigned
Provider accepted
Provider on the way
Provider arrived
Service started
Additional quotation approved
Service completed
Payment completed
Review submitted
```

---

# 52. Professional Assignment

Provider eligibility:

```text
Active
Verified
Approved for service
Works in service area
Available
No overlapping booking
Accepts booking type
Not blocked
```

Ranking can consider:

```text
Distance
Rating
Completion rate
Acceptance rate
Skills
Experience
Current load
Last assignment
```

---

# 53. Assignment Strategies

Support:

## Auto Assignment

Highest ranked professional receives job.

## Broadcast

Multiple suitable professionals receive lead.

First eligible acceptance wins.

## Operations Assignment

Admin manually chooses provider.

## Preferred Provider

Returning customer can optionally request previous professional.

---

# 54. Assignment Failure

If no professional accepts:

```text
Retry
Expand radius
Try nearby zone
Notify operations
Offer customer alternate time
Offer customer reschedule/cancel
```

Never leave booking silently unassigned.

---

# 55. Professional Onboarding

```text
Account
→ Profile
→ Identity documents
→ Address
→ Service skills
→ Experience
→ Service areas
→ Working hours
→ Payout details
→ Background/verification
→ Admin approval
→ Active
```

---

# 56. Professional Verification

Track:

```text
Identity Verification
Address Verification
Skill Verification
Document Verification
Bank Verification
Background Verification
Training Completion
```

Statuses:

```text
Pending
Verified
Rejected
Expired
ResubmissionRequired
```

---

# 57. Professional Skill Levels

```text
Trainee
Standard
Experienced
Expert
Specialist
```

Optional.

Can affect:

- assignment
- pricing
- premium service eligibility

---

# 58. Professional Service Area

Support:

```text
Cities
Zones
Pincodes
Radius
```

Professional can enable/disable areas.

---

# 59. Availability

Professional sets weekly schedule.

Example:

```text
Mon 09:00–19:00
Tue 09:00–19:00
Wed Off
```

Also support:

```text
Breaks
Vacation
Personal time
Blocked slot
Temporary unavailable
```

---

# 60. Professional Dashboard

Show:

```text
Today's Jobs
Upcoming Jobs
New Requests
Jobs Completed
Today's Earnings
Weekly Earnings
Pending Payout
Rating
Acceptance %
Completion %
Cancellation %
Response Time
```

---

# 61. Professional Booking Screen

Professional sees:

```text
Booking number
Service
Package
Customer area
Scheduled time
Customer notes
Photos
Expected duration
Estimated earning
Navigation
Status actions
Support
```

---

# 62. On-the-Way Status

Provider taps:

```text
Start Travel
```

Customer gets:

```text
Professional is on the way
```

Estimated arrival can be added later.

---

# 63. Arrival Verification

Professional taps:

```text
Arrived
```

Customer sees arrival status.

---

# 64. Service Start Verification

Use a service-start verification flow.

Example:

```text
Customer receives code
→ professional enters code
→ backend validates
→ ServiceInProgress
```

The exact verification mechanism can be finalized during implementation.

---

# 65. Before-Service Evidence

Optional/required by category:

```text
Before photo
Equipment condition
Problem photo
Customer confirmation
```

Useful for disputes.

---

# 66. Additional Work Request

During service:

```text
Professional detects extra work
→ adds item/part
→ sends additional quote
→ customer approves
→ booking total updated
```

Statuses:

```text
PendingCustomerApproval
Approved
Rejected
```

---

# 67. Service Completion

Professional submits:

```text
Completion notes
Work performed
Parts used
After photos
Warranty details
Recommended future work
```

Customer confirms completion.

---

# 68. Service Warranty

Services can define:

```text
No Warranty
7 Days
15 Days
30 Days
90 Days
Custom
```

Warranty claims should link back to original booking.

---

# 69. Rework / Warranty Booking

Customer can select:

```text
Issue with previous service
```

Flow:

```text
Previous booking
→ warranty eligibility
→ rework request
→ same or alternate provider
→ zero/discounted price based on policy
```

---

# 70. Recurring Services

Support:

```text
Weekly Cleaning
Biweekly Cleaning
Monthly Cleaning
Monthly Pest Treatment
Quarterly AC Service
Annual Maintenance
```

Customer configures:

```text
Frequency
Day
Preferred time
Preferred professional
Start date
End date
```

---

# 71. Subscription / Membership

Example:

```text
VSR Plus
```

Benefits:

- lower platform fee
- free cancellation window
- priority booking
- member-only prices
- recurring service discount
- annual inspection
- priority support

---

# 72. Annual Maintenance Contracts

Support AMC products:

```text
AC AMC
Electrical AMC
Plumbing AMC
Appliance AMC
Full Home Maintenance Plan
```

Fields:

```text
Validity
Included visits
Covered services
Excluded parts
Emergency calls
Renewal
```

---

# 73. Customer Booking Detail

Show:

```text
Status
Timeline
Professional
Professional rating
Scheduled time
Address
Service details
Items/add-ons
Price
Payments
Invoice
Warranty
Chat
Support
Reschedule
Cancel
Rebook
Review
```

---

# 74. Rebooking

One tap:

```text
Book Again
```

Pre-fill:

- service
- package
- address
- preferred provider
- previous add-ons

---

# 75. Saved / Favorite Professionals

Customer can favorite a professional.

Future booking can show:

```text
Book with Same Professional
```

subject to availability.

---

# 76. Ratings & Reviews

Customer rates:

```text
Overall
Quality
Professionalism
Punctuality
Cleanliness
Communication
Value
```

Can add:

- text
- photos
- tags

---

# 77. Review Tags

Examples:

```text
On Time
Professional
Good Quality
Polite
Clean Work
Good Value
Fast Service
```

Negative:

```text
Late
Poor Communication
Incomplete Work
Unexpected Charges
```

---

# 78. Professional Quality Score

Internal score may include:

```text
Average Rating
Completion Rate
Repeat Rate
Complaint Rate
Rework Rate
Acceptance Rate
Cancellation Rate
On-Time Rate
```

Used by operations and assignment.

---

# 79. Customer Support

Customer support modules:

```text
FAQ
Booking Help
Payment Help
Refund Help
Professional Issue
Warranty/Rework
Safety
Account
Other
```

---

# 80. Support Tickets

Fields:

```text
Ticket Number
Customer/Professional
Booking
Category
Priority
Subject
Description
Attachments
Status
Assigned Agent
Internal Notes
Resolution
```

Statuses:

```text
Open
InProgress
WaitingCustomer
WaitingProfessional
Escalated
Resolved
Closed
```

---

# 81. Disputes

Separate from normal support.

Types:

```text
Service Quality
Property Damage
Professional No-Show
Customer No-Show
Pricing Disagreement
Unauthorized Extra Charge
Payment
Safety
Refund
Warranty
```

---

# 82. Dispute Resolution

Admin can:

```text
Review timeline
Review messages
Review photos
Review payment
Contact both sides
Approve refund
Approve partial refund
Issue professional adjustment
Issue customer credit
Suspend provider
Close dispute
```

---

# 83. Emergency Support

High priority action on active bookings.

Customer/professional can select:

```text
Safety Issue
Emergency
Unable to Reach Other Party
```

This creates a critical operations alert.

---

# 84. In-App Communication

Booking-specific communication.

Allow:

- text
- predefined quick messages
- image
- location-ready
- support escalation

Examples:

```text
"I have arrived."
"Please share landmark."
"I will be 10 minutes late."
```

---

# 85. Notifications

Customer:

```text
Booking confirmed
Provider assigned
Provider accepted
Provider on way
Provider arrived
Service started
Quote awaiting approval
Service completed
Payment successful
Refund updated
Warranty reminder
Review reminder
Recurring visit reminder
```

Professional:

```text
New lead
Booking assigned
Acceptance deadline
Upcoming booking
Customer rescheduled
Customer cancelled
Quote approved
Payout processed
New review
```

Admin:

```text
Unassigned booking
Provider declined
Provider late
Customer complaint
Critical support
Refund waiting
Payout failure
Low provider availability
```

---

# 86. Payments

Support the business flow for:

```text
Prepaid
Pay after service
Partial advance
Remaining payment after service
Cash
Online
```

Payment capability should be configurable per service/category.

---

# 87. Payment Lifecycle

```text
Created
Pending
Successful
Failed
Cancelled
RefundPending
PartiallyRefunded
Refunded
```

---

# 88. Price Model

Price components:

```text
Base Package
Add-ons
Parts
Travel Charge
Urgent Charge
Platform Fee
Discount
Membership Discount
Coupon
Tax
Final Total
```

All final pricing logic belongs to backend.

---

# 89. Price Change

If price changes after inspection:

```text
Original quote
+ additional items
→ revised quote
→ customer approval
→ updated amount
```

Keep both original and revised quote history.

---

# 90. Coupons

Types:

```text
Flat
Percentage
First Booking
Category
Service
City
Minimum Amount
Membership
Referral
Professional-specific promotional campaign
```

---

# 91. Referral Program

Customer:

```text
Invite friend
→ referral code
→ friend gets discount
→ referrer gets reward after qualifying booking
```

Professional referral can also be supported.

---

# 92. Wallet / Credits

Optional:

```text
VSR Credits
```

Uses:

- refunds
- promotions
- referral rewards
- support goodwill credits

Track full ledger.

---

# 93. Commission

Commission can be based on:

```text
Category
Service
City
Professional tier
Booking amount
Membership
Campaign
```

---

# 94. Professional Earnings

Each booking shows:

```text
Gross service value
Parts excluded/included
Platform commission
Adjustments
Tax/withholding
Net earning
```

---

# 95. Payouts

Professional can view:

```text
Available Balance
Pending Balance
Next Payout
Paid History
Failed Payouts
Adjustments
```

---

# 96. Professional Incentives

Optional:

```text
Complete 10 jobs → bonus
High rating bonus
Weekend bonus
Emergency response bonus
New category incentive
```

---

# 97. Professional Penalties

Configurable operations rules:

```text
Late cancellation
No show
Confirmed then declined
Repeated customer complaints
Fraud
```

Admin-controlled.

---

# 98. Admin Dashboard

Top cards:

```text
Bookings Today
Bookings In Progress
Completed Today
Cancelled Today
Unassigned
Customers
Active Professionals
New Professionals
Pending Verification
Revenue
Commission Revenue
Refunds
Pending Payouts
Open Tickets
Critical Disputes
```

---

# 99. Live Operations Dashboard

Critical screen.

Columns:

```text
New
Searching Provider
Awaiting Provider
Upcoming
On The Way
Arrived
In Service
Waiting Customer Approval
Payment Pending
Problem
Completed
```

Each card:

```text
Booking #
Service
Customer area
Time
Professional
Status
Payment
Alert
```

---

# 100. Booking Admin

Filters:

```text
Booking number
Customer
Professional
Service
City
Area
Status
Payment
Date
Emergency
Dispute
```

Actions:

```text
Open
Assign
Reassign
Reschedule
Cancel
Add Note
Escalate
Refund
Contact Customer
Contact Professional
```

---

# 101. Professional Admin

Tabs:

```text
Overview
Verification
Documents
Services
Skills
Areas
Schedule
Bookings
Earnings
Payouts
Reviews
Complaints
Performance
Internal Notes
Audit
```

---

# 102. Customer Admin

Tabs:

```text
Profile
Addresses
Bookings
Payments
Refunds
Membership
Support
Reviews
Credits
Internal Notes
Audit
```

---

# 103. Service Catalog Admin

Manage:

```text
Categories
Subcategories
Services
Packages
Add-ons
Problems
Service descriptions
Images
Durations
Inclusions
Exclusions
Warranty
Booking rules
```

---

# 104. Pricing Admin

Configure:

```text
Base price
City price
Area price
Emergency fee
Weekend fee
Time fee
Platform fee
Tax
Professional payout rule
```

Keep pricing version history.

---

# 105. Service Area Admin

Hierarchy:

```text
Country
State
City
Zone
Locality
Pincode
```

Admin can enable/disable:

- category
- service
- package
- emergency service

per area.

---

# 106. Provider Availability Heatmap

Admin sees:

```text
City
Area
Category
Date
Time
Available Professionals
Upcoming Demand
Shortage
```

Useful for operations.

---

# 107. Demand Management

Track:

```text
Searches
Service page visits
Unfulfilled bookings
No-provider availability
Bookings
Repeat demand
```

This helps determine where to onboard professionals.

---

# 108. CMS

Admin should manage customer-facing content:

```text
Homepage banners
Category banners
Offers
FAQs
How It Works
Trust & Safety
Terms
Privacy
Cancellation Policy
Refund Policy
Professional Onboarding Content
City landing pages
```

---

# 109. Marketing Pages

Support:

```text
/services-in/:city
/electrician/:city
/plumber/:city
/ac-service/:city
/home-cleaning/:city
```

Useful for city/service discovery and SEO.

---

# 110. Customer Membership Admin

Admin manages:

```text
Plan
Price
Validity
Benefits
Service discount
Platform fee waiver
Cancellation benefits
Priority support
```

---

# 111. Corporate / B2B Accounts

Future-ready but useful.

Company can have:

```text
Company Account
Multiple Locations
Authorized Employees
Monthly Billing
Service Limits
Approval Workflow
AMC
Reports
```

---

# 112. Property Management Accounts

Future feature.

Apartment/PG/property managers can:

- register properties
- request maintenance
- schedule recurring services
- manage multiple units
- central billing

---

# 113. Roles

Recommended business roles:

```text
Customer
Professional
OperationsAgent
SupportAgent
FinanceAgent
VerificationAgent
CatalogManager
CityManager
Admin
SuperAdmin
```

---

# 114. Permission Areas

Permissions should cover:

```text
Customers
Professionals
Verification
Catalog
Pricing
Bookings
Assignment
Payments
Refunds
Commissions
Payouts
Reviews
Support
Disputes
Membership
Reports
CMS
Users
Settings
Audit
```

---

# 115. Core Data Entities

```text
User
Role
Permission

Customer
CustomerAddress

Professional
ProfessionalDocument
ProfessionalSkill
ProfessionalService
ProfessionalServiceArea
ProfessionalAvailability
ProfessionalTimeOff
ProfessionalPerformance

ServiceCategory
Service
ServiceProblem
ServicePackage
ServiceAddOn
ServiceWarranty

City
Zone
Locality
Pincode
ServiceArea

PriceRule
PriceQuote
QuoteRevision

Booking
BookingItem
BookingAddOn
BookingMaterial
BookingAssignment
BookingStatusHistory
BookingNote

RecurringBooking
AMCContract

Payment
Refund
CreditTransaction

CommissionRule
ProfessionalEarning
Payout
ProfessionalAdjustment
Incentive

Coupon
CouponRedemption
Referral

MembershipPlan
CustomerMembership

Review
ReviewMedia

Conversation
Message

SupportTicket
Dispute

Notification

CMSPage
Banner
FAQ

AuditLog
```

---

# 116. Core Database Tables

```text
Users
Roles
Permissions
UserRoles
RolePermissions

Customers
CustomerAddresses

Professionals
ProfessionalDocuments
ProfessionalSkills
ProfessionalServices
ProfessionalServiceAreas
ProfessionalAvailabilities
ProfessionalTimeOff
ProfessionalPerformance

ServiceCategories
Services
ServiceProblems
ServicePackages
ServiceAddOns
ServicePackageAddOns
ServiceWarranties

Cities
Zones
Localities
Pincodes
ServiceAreas
ServiceAreaServices

PriceRules
PriceQuotes
QuoteRevisions

Bookings
BookingItems
BookingAddOns
BookingMaterials
BookingAssignments
BookingStatusHistory
BookingNotes

RecurringBookings
AMCContracts

Payments
Refunds
CreditTransactions

CommissionRules
ProfessionalEarnings
Payouts
ProfessionalAdjustments
ProfessionalIncentives

Coupons
CouponRedemptions
Referrals

MembershipPlans
CustomerMemberships

Reviews
ReviewMedia

Conversations
Messages

SupportTickets
Disputes

Notifications

CMSPages
Banners
FAQs

AuditLogs
```

---

# 117. Booking Data

Booking should contain:

```text
Booking Id
Booking Number
Customer
Address
Service
Package
Booking Type
Scheduled Start
Expected End
Current Status
Assigned Professional
Original Quote
Current Quote
Payment Status
Customer Notes
Operations Notes
Created Time
Updated Time
```

---

# 118. Booking History

Never overwrite important booking events.

Maintain a full history:

```text
Status
Previous Status
New Status
Changed By
Changed At
Reason
Metadata
```

---

# 119. Price Quote Data

```text
Quote Number
Booking/Temporary Booking
Base Price
Add-ons
Materials
Fees
Discount
Coupon
Membership Discount
Tax
Total
Expiry
Version
```

---

# 120. APIs — Customer

Example endpoint groups:

```text
/auth
/home
/categories
/services
/search
/serviceability
/availability
/price-quotes
/bookings
/payments
/addresses
/reviews
/memberships
/support
/notifications
```

---

# 121. APIs — Professional

```text
/professional/profile
/professional/verification
/professional/services
/professional/areas
/professional/availability
/professional/requests
/professional/bookings
/professional/earnings
/professional/payouts
/professional/reviews
/professional/support
```

---

# 122. APIs — Admin

```text
/admin/dashboard
/admin/live
/admin/bookings
/admin/customers
/admin/professionals
/admin/verification
/admin/categories
/admin/services
/admin/packages
/admin/pricing
/admin/areas
/admin/assignments
/admin/payments
/admin/refunds
/admin/commissions
/admin/payouts
/admin/memberships
/admin/coupons
/admin/reviews
/admin/disputes
/admin/support
/admin/reports
/admin/cms
/admin/users
/admin/audit
/admin/settings
```

---

# 123. Business Rules

The backend should enforce all important rules.

Examples:

```text
Customer cannot book unavailable slot.
Professional cannot accept overlapping jobs.
Professional cannot receive unsupported service.
Professional cannot receive booking outside coverage area.
Final booking price must come from server quote.
Additional work requires approval.
Cancelled booking follows cancellation rules.
Completed booking alone can be reviewed.
Warranty claim must reference eligible booking.
Provider earning generated only after eligible completion.
Payout cannot exceed eligible earnings.
```

---

# 124. Booking Collision Rules

Prevent:

```text
Same professional
overlapping booking time
```

Use backend transaction/concurrency handling.

---

# 125. Professional No-Show

Flow:

```text
Customer reports no-show
→ operations alert
→ contact professional
→ reassign if possible
→ customer offered delay/reschedule/refund
→ professional performance updated
```

---

# 126. Customer No-Show / No Access

Flow:

```text
Provider arrives
→ cannot contact customer
→ waits configured duration
→ uploads evidence/status
→ operations verifies
→ booking closed/cancelled according to policy
```

---

# 127. Late Professional

Track expected arrival.

Operations can see:

```text
Provider Late
```

Customer can receive delay message.

---

# 128. Service Delay

Professional may request additional time.

Store:

```text
Reason
Expected completion
```

---

# 129. Replacement Professional

If provider cannot continue:

```text
Operations reassignment
```

Preserve original assignment history.

---

# 130. Service Quality Control

Admin can define:

```text
Required before photo
Required after photo
Required checklist
Customer completion confirmation
Warranty
```

per category/package.

---

# 131. Service Checklist

Example AC cleaning:

```text
Filter cleaned
Cooling checked
Drain checked
Unit cleaned
Power checked
Customer informed
```

Professional completes checklist.

---

# 132. Digital Service Report

After completion generate:

```text
Booking
Service
Professional
Work performed
Checklist
Parts used
Before/after photos
Warranty
Amount
Date
```

Customer can view/download.

---

# 133. Invoice

Customer invoice includes:

```text
Platform
Booking Number
Customer
Service
Professional where applicable
Items
Add-ons
Materials
Fees
Discount
Tax
Total
Payment
```

---

# 134. Search & Recommendations

Homepage recommendations may use:

```text
Location
Previous bookings
Recently viewed
Season
Popular services
Frequency
Membership
```

---

# 135. Seasonal Services

Examples:

```text
Summer → AC
Monsoon → Waterproofing/Pest Control
Festival → Deep Cleaning/Painting
Winter → Geyser
```

Admin can configure campaigns.

---

# 136. Offers

Offer cards:

```text
20% Off AC Service
₹200 Off First Cleaning
Weekend Electrical Offer
Free Inspection with Repair
```

---

# 137. Referral

Customer can:

```text
Share code
View referrals
View rewards
```

---

# 138. Loyalty

Optional:

```text
Points per booking
Tier
Rewards
```

Can be Phase 2.

---

# 139. Professional Levels

Optional:

```text
Standard
Silver
Gold
Elite
```

Based on performance.

Benefits:

- more leads
- reduced commission
- priority payout
- badge

---

# 140. Trust & Safety

Customer sees:

```text
Verified Professional
Rating
Completed Jobs
Years Experience
Background Check if applicable
Service Warranty
Support
```

---

# 141. Fraud/Abuse Flags

Internal rules should flag:

```text
Repeated cancellations
Suspicious coupons
Fake bookings
Provider/customer collusion
Unusual refunds
Multiple duplicate accounts
Review manipulation
Location anomalies
```

Admin can review flags.

---

# 142. Audit Logging

Track important actions:

```text
Professional approved
Professional suspended
Booking reassigned
Price manually changed
Refund approved
Commission changed
Payout updated
Dispute resolved
Sensitive document viewed
Role changed
```

---

# 143. Reports

## Booking Reports

- bookings by day
- bookings by category
- bookings by city
- cancellations
- completion rate
- reschedules
- emergency bookings

## Revenue Reports

- gross booking value
- platform fee
- commission revenue
- discounts
- refunds
- net platform revenue

## Professional Reports

- active providers
- job acceptance
- completion
- rating
- cancellations
- earnings
- payouts

## Customer Reports

- new customers
- repeat customers
- customer lifetime value
- booking frequency
- membership

## Operations Reports

- time to assign
- provider shortage
- late jobs
- disputes
- rework
- warranty claims

---

# 144. Admin Analytics Dashboard

Charts:

```text
Bookings Trend
Revenue Trend
Top Categories
Top Services
Top Cities
Assignment Success
Cancellation Reasons
Customer Repeat Rate
Provider Performance
Refund Rate
Dispute Rate
```

---

# 145. Mobile Customer Navigation

Recommended:

```text
Home
Services
Bookings
Offers
Account
```

---

# 146. Mobile Professional Navigation

```text
Home
Requests
Jobs
Earnings
Account
```

---

# 147. Mobile UI Rules

All important user flows must work smoothly at:

```text
320px
360px
375px
390px
430px
Tablet
Desktop
```

Use:

```text
cards
drawers
bottom sheets
compact forms
sticky CTA
touch-friendly selectors
```

Do not use desktop tables on customer/professional mobile screens.

---

# 148. WebView Requirements

Must work properly in:

```text
Android WebView
iOS WKWebView
```

Important flows:

- login
- address
- location
- booking
- date/time
- payment
- uploads
- chat
- booking status
- professional requests
- service completion

No hover-only interactions.

---

# 149. Loading States

Create skeletons for:

```text
Homepage
Categories
Services
Service Detail
Available Slots
Booking
Professional Cards
Provider Requests
Admin Metrics
```

---

# 150. Empty States

Examples:

```text
No services available in this area.
No providers available for selected slot.
No upcoming bookings.
No new professional requests.
No payouts yet.
```

Every empty state should provide next action.

---

# 151. Error Handling

User-friendly error examples:

```text
This slot was just booked. Choose another time.
No professionals are currently available.
Your quote has expired. Please refresh the price.
The provider is no longer available; we are finding another professional.
Payment could not be confirmed.
```

---

# 152. Seed Data

For development/demo:

```text
5 cities
30+ localities per city
20+ categories
100+ services
200+ packages
80+ add-ons
150 professionals
500 customers
500 bookings
200 reviews
30 coupons
multiple membership plans
```

---

# 153. Recommended Initial Cities

For development:

```text
Delhi
Gurugram
Noida
Ghaziabad
Faridabad
```

The actual business launch can begin with only one city.

---

# 154. Initial Production Launch Scope

Even though the software supports all categories, operational launch can start with:

```text
Electrician
Plumber
AC
Appliance Repair
Cleaning
```

This reduces operational complexity.

---

# 155. Phase 1 — Must Be Fully Working

Customer:

```text
Account
Address
Service discovery
Package selection
Availability
Quote
Booking
Payment
Assignment
Tracking
Cancel/reschedule
Review
Support
```

Professional:

```text
Onboarding
Verification
Services
Areas
Availability
Requests
Accept/decline
Travel status
Arrival
Start verification
Completion
Earnings
Payouts
Reviews
Support
```

Admin:

```text
Dashboard
Live operations
Customers
Professionals
Verification
Catalog
Pricing
Bookings
Assignment
Payments
Refunds
Commission
Payouts
Reviews
Support
Disputes
Reports
CMS
Roles
Audit
```

---

# 156. Phase 2

Add:

```text
Membership
Recurring services
AMC
Warranty claims
Provider levels
Referral
Credits/wallet
Masked communication
Advanced operations analytics
Corporate accounts
More cities
```

---

# 157. Phase 3

Add:

```text
B2B facility management
Property manager accounts
Multi-city/franchise operations
Dynamic pricing
AI service recommendation
AI support assistant
AI provider matching assistance
Predictive demand
Native mobile apps
```

---

# 158. Implementation Order for Coding Agent

```text
1. Core project setup
2. User/role model
3. Customer/profile/address
4. Location/service areas
5. Service catalog
6. Service packages/add-ons
7. Professional onboarding
8. Professional skills/areas/availability
9. Availability calculation
10. Price quotes
11. Booking creation
12. Booking state machine
13. Assignment engine
14. Professional accept/decline
15. Payment lifecycle
16. Live booking status
17. Start verification
18. Completion
19. Additional quotation
20. Commission/earnings
21. Payout records
22. Reviews
23. Support
24. Disputes
25. Admin live operations
26. Reports
27. CMS
28. Recurring/AMC foundation
29. Mobile/WebView polish
30. Full end-to-end testing
```

---

# 159. Coding Agent Master Instruction

Use this document as the source of truth.

```text
Build the complete VSR Home Services marketplace described in this file.

Technology constraints:

Frontend: React
Backend: .NET
Database: PostgreSQL

Do not introduce additional technology decisions unless required by the existing project or explicitly approved.

This must be a full working marketplace, not static UI.

Build three complete product areas:

1. Customer application
2. Service professional application
3. Admin/operations application

Implement all categories, service catalog capabilities, packages, add-ons, inspection-based jobs, quotations, emergency services, recurring services and future-ready AMC workflows described here.

The main end-to-end workflow must work:

Customer
→ service
→ package/problem
→ address
→ serviceability
→ slot
→ server-side price quote
→ booking
→ payment
→ professional assignment
→ acceptance
→ on-the-way
→ arrival
→ service-start verification
→ service
→ additional work approval if needed
→ completion
→ commission/earning
→ review.

Professional workflow must work:

register
→ verification
→ services
→ service areas
→ availability
→ receive booking
→ accept
→ travel
→ arrive
→ start
→ add work/parts
→ complete
→ earnings
→ payouts
→ reviews.

Admin must support:

live operations
customers
professionals
verification
categories
services
packages
add-ons
pricing
cities
areas
bookings
assignment
payments
refunds
commissions
payouts
memberships
coupons
reviews
support
disputes
reports
CMS
users/roles
audit.

Important business rules must be enforced in the backend.

React must never be authoritative for:
pricing
availability
booking status
assignment
refund amount
commission
provider earnings
payout totals.

Keep complete booking history.

Prevent overlapping provider assignments.

Do not silently leave bookings unassigned.

All screens must work properly on desktop, tablet, mobile browser, Android WebView and iOS WKWebView.

Use mobile cards, drawers and bottom sheets instead of forcing desktop tables onto small screens.

The app must contain realistic development seed data.

Do not stop after scaffolding.

At completion verify:
- customer booking
- unavailable slot handling
- professional assignment
- professional decline
- assignment fallback
- start verification
- additional quotation approval
- service completion
- customer cancellation
- professional no-show
- refund workflow
- commission calculation
- professional earning
- payout record
- review eligibility
- warranty/rework path
- support ticket
- dispute
- admin manual reassignment
- live operations
- responsive mobile/WebView flows

Run the project builds and fix all frontend, backend, database, runtime and responsive errors before declaring completion.
```

---

# 160. Definition of Done

The application is ready only when a real user can perform this without administrator database intervention:

```text
Create account
→ add address
→ find service
→ choose package
→ choose time
→ get correct price
→ book
→ pay
→ get professional
→ track professional
→ start service
→ approve any extra work
→ finish service
→ receive invoice
→ review professional
→ rebook later
```

And a real professional can:

```text
Register
→ get verified
→ configure services
→ configure area
→ set availability
→ receive request
→ accept job
→ complete service
→ see earning
→ receive payout record
```

And operations can:

```text
See every active booking
→ detect problems
→ assign/reassign
→ handle no-shows
→ resolve disputes
→ process refunds
→ monitor provider availability
→ monitor quality
→ monitor revenue/commission
```

This is the baseline for a **full-fledged VSR Home Services marketplace**.

---

# 161a. Complete Database Schemas (Column-Level)

Supersedes the table-name-only list in §116. Types are provider-neutral (PostgreSQL); `id` columns are `uuid` unless noted. All tables include `created_at`, `updated_at` (omitted below for brevity) plus soft-delete via `deleted_at` where the entity can be archived.

```text
Users
  id, email (unique), phone (unique), password_hash, full_name,
  status (active/suspended/blocked), last_login_at

Roles
  id, name (customer/professional/ops_agent/support_agent/finance_agent/admin), description
UserRoles
  id, user_id fk, role_id fk
Permissions
  id, code, area, description
RolePermissions
  id, role_id fk, permission_id fk

Customers
  id, user_id fk, display_name, default_address_id fk, wallet_balance,
  membership_plan_id fk (nullable), referral_code, referred_by_customer_id fk (nullable)
CustomerAddresses
  id, customer_id fk, label, line1, line2, city_id fk, zone_id fk, locality_id fk,
  pincode, lat, lng, is_default

Professionals
  id, user_id fk, display_name, gender, dob, onboarding_status (draft/submitted/verified/rejected/suspended),
  quality_score, tier (bronze/silver/gold/platinum), joined_at
ProfessionalDocuments
  id, professional_id fk, doc_type (id_proof/address_proof/police_verification/certification),
  file_url, status (pending/approved/rejected), reviewed_by fk (nullable), reviewed_at
ProfessionalSkills
  id, professional_id fk, service_id fk, skill_level (trainee/standard/expert)
ProfessionalServiceAreas
  id, professional_id fk, city_id fk, zone_id fk
ProfessionalAvailabilities
  id, professional_id fk, day_of_week, start_time, end_time, is_recurring
ProfessionalTimeOff
  id, professional_id fk, start_at, end_at, reason
ProfessionalPerformance
  id, professional_id fk, period_start, period_end, jobs_completed, jobs_cancelled,
  avg_rating, on_time_rate, acceptance_rate

ServiceCategories
  id, name, slug (unique), tagline, image_url, sort_order, is_active
Services
  id, category_id fk, name, slug (unique), short_description, long_description, image_url,
  is_emergency, needs_inspection, inspection_fee, is_active
ServiceProblems
  id, service_id fk, name, description, sort_order
ServicePackages
  id, service_id fk, name (Basic/Standard/Premium), base_price, duration_mins, is_active
ServiceAddOns
  id, service_id fk, name, price, duration_mins
ServicePackageAddOns
  id, package_id fk, addon_id fk
ServiceWarranties
  id, service_id fk, warranty_days, terms

Cities
  id, name, is_active, launched_at
Zones
  id, city_id fk, name
Localities
  id, zone_id fk, name, pincode
Pincodes
  id, pincode (unique), city_id fk, is_serviceable
ServiceAreas
  id, city_id fk, zone_id fk, is_active
ServiceAreaServices
  id, service_area_id fk, service_id fk, is_active

PriceRules
  id, service_id fk, package_id fk (nullable), city_id fk (nullable), rule_type
  (surge/discount/seasonal), value, valid_from, valid_to, is_active
PriceQuotes
  id, quote_number (unique), customer_id fk, service_id fk, package_id fk,
  address_id fk, base_price, addons_total, materials_total, fees_total,
  discount_total, tax_total, grand_total, coupon_id fk (nullable), expires_at, version
QuoteRevisions
  id, price_quote_id fk, revision_number, reason, previous_total, new_total, created_by

Bookings
  id, booking_number (unique), customer_id fk, address_id fk, service_id fk, package_id fk,
  booking_type (instant/scheduled/emergency/recurring/amc), scheduled_start, expected_end,
  status (new/searching_provider/awaiting_provider/upcoming/on_the_way/arrived/in_service/
  waiting_customer_approval/payment_pending/problem/completed/cancelled),
  assigned_professional_id fk (nullable), price_quote_id fk, current_quote_id fk,
  payment_status (pending/paid/partial_refund/refunded/failed), customer_notes, ops_notes
BookingItems
  id, booking_id fk, description, quantity, unit_price, line_total
BookingAddOns
  id, booking_id fk, addon_id fk, price
BookingMaterials
  id, booking_id fk, name, quantity, unit_price, approved_by_customer, approved_at
BookingAssignments
  id, booking_id fk, professional_id fk, offered_at, responded_at,
  response (accepted/declined/expired/reassigned), decline_reason
BookingStatusHistory
  id, booking_id fk, previous_status, new_status, changed_by fk, changed_at, reason, metadata (jsonb)
BookingNotes
  id, booking_id fk, author_id fk, note, visibility (internal/customer)

RecurringBookings
  id, customer_id fk, service_id fk, package_id fk, address_id fk, frequency (weekly/biweekly/monthly),
  next_run_at, is_active
AMCContracts
  id, customer_id fk, service_id fk, address_id fk, visits_per_year, start_date, end_date,
  price, status (active/expired/cancelled)

Payments
  id, booking_id fk, payment_number (unique), amount, method (upi/card/netbanking/wallet/cod),
  status (initiated/authorized/captured/failed/refunded), gateway_ref, paid_at
Refunds
  id, payment_id fk, booking_id fk, amount, reason, status (requested/approved/processed/rejected),
  processed_by fk (nullable), processed_at
CreditTransactions
  id, customer_id fk, amount, type (credit/debit), reason, reference_booking_id fk (nullable), balance_after

CommissionRules
  id, category_id fk (nullable), service_id fk (nullable), city_id fk (nullable),
  professional_tier (nullable), rate_percent, flat_fee, valid_from, valid_to, is_active
ProfessionalEarnings
  id, professional_id fk, booking_id fk, gross_amount, materials_excluded_amount,
  commission_amount, adjustment_amount, tax_withheld_amount, net_amount, status (pending/settled), settled_at
Payouts
  id, professional_id fk, period_start, period_end, total_amount, status (pending/processing/paid/failed),
  paid_at, failure_reason
ProfessionalAdjustments
  id, professional_id fk, booking_id fk (nullable), amount, reason, created_by fk
ProfessionalIncentives
  id, professional_id fk, incentive_type, amount, period_start, period_end, status (accrued/paid)

Coupons
  id, code (unique), discount_type (flat/percent), value, max_discount, min_order_value,
  valid_from, valid_to, usage_limit, per_customer_limit, is_active
CouponRedemptions
  id, coupon_id fk, customer_id fk, booking_id fk, discount_applied
Referrals
  id, referrer_customer_id fk, referee_customer_id fk, reward_amount, status (pending/rewarded)

MembershipPlans
  id, name, price, duration_days, benefits (jsonb), is_active
CustomerMemberships
  id, customer_id fk, plan_id fk, started_at, expires_at, status (active/expired/cancelled)

Reviews
  id, booking_id fk, customer_id fk, professional_id fk, rating (1-5), comment, tags (jsonb), created_at
ReviewMedia
  id, review_id fk, media_url, media_type (image/video)

Conversations
  id, booking_id fk, customer_id fk, professional_id fk, is_masked
Messages
  id, conversation_id fk, sender_id fk, body, sent_at, read_at

SupportTickets
  id, ticket_number (unique), raised_by fk, role (customer/professional), booking_id fk (nullable),
  category, subject, status (open/in_progress/escalated/closed), priority, assigned_to fk (nullable)
Disputes
  id, ticket_id fk (nullable), booking_id fk, raised_by fk, reason, status (open/investigating/resolved/rejected),
  resolution, resolved_by fk (nullable), resolved_at

Notifications
  id, user_id fk, channel (push/sms/email/in_app), template, payload (jsonb), sent_at, read_at

CMSPages
  id, slug (unique), title, body (jsonb/markdown), is_published
Banners
  id, title, image_url, link_url, sort_order, is_active
FAQs
  id, category, question, answer, sort_order

AuditLogs
  id, actor_id fk, action, entity_type, entity_id, before (jsonb), after (jsonb), created_at
```

---

# 161. Admin KPI & Analytics — Concrete Chart Specification

Replaces the free-text list in §144. Every chart is backed by a real aggregation API (`GET /admin/analytics/...`), never client-computed from raw lists.

```text
Chart: Bookings Trend
  Type: line (dual series)
  Series: bookings_created, bookings_completed
  Grouping: by day, selectable range (7/30/90 days)
  Endpoint: /admin/analytics/bookings-trend?from=&to=

Chart: Revenue Trend
  Type: area/line (stacked)
  Series: gross_booking_value, commission_revenue, net_platform_revenue
  Endpoint: /admin/analytics/revenue-trend?from=&to=

Chart: Top Categories / Top Services
  Type: horizontal bar
  Metric: booking_count, revenue
  Endpoint: /admin/analytics/top-categories, /admin/analytics/top-services

Chart: Top Cities
  Type: bar or map choropleth
  Metric: booking_count, revenue, active_professionals
  Endpoint: /admin/analytics/top-cities

Chart: Assignment Success Rate
  Type: gauge/donut
  Metric: accepted / (accepted + declined + expired)
  Endpoint: /admin/analytics/assignment-success

Chart: Cancellation Reasons
  Type: donut/pie
  Metric: count by reason (customer/professional/ops/no-show)
  Endpoint: /admin/analytics/cancellation-reasons

Chart: Customer Repeat Rate
  Type: line + KPI card
  Metric: repeat_customers / total_customers per period
  Endpoint: /admin/analytics/customer-repeat-rate

Chart: Provider Performance Distribution
  Type: histogram
  Metric: professionals bucketed by quality_score / rating
  Endpoint: /admin/analytics/provider-performance

Chart: Refund Rate & Dispute Rate
  Type: line (dual axis)
  Metric: refunds/bookings, disputes/bookings per period
  Endpoint: /admin/analytics/refund-dispute-rate

KPI Summary Cards (single aggregate endpoint /admin/analytics/summary):
  bookings_today, revenue_today, active_professionals, pending_verifications,
  open_tickets, critical_disputes, avg_rating_7d, commission_revenue_mtd
```

Frontend: introduce a chart library (`recharts`) in `frontend/package.json` and a new `pages/admin/Analytics.tsx` screen inside the existing `home-services` admin section, reusing the current admin shell/layout.

---

# 162. Earnings & Financial APIs (All Roles)

Every figure below is server-computed and authoritative; the client only renders it.

```text
Customer
  GET  /home-services/customer/wallet                 -> balance, credit history
  GET  /home-services/customer/invoices/{bookingId}    -> invoice PDF/data
  GET  /home-services/customer/refunds                 -> refund status list
  POST /home-services/customer/refunds/{bookingId}     -> raise refund request

Professional
  GET  /home-services/professional/earnings            -> per-booking gross/commission/net breakdown
  GET  /home-services/professional/earnings/summary     -> today/week/month totals, pending vs settled
  GET  /home-services/professional/payouts              -> payout history + next payout date
  GET  /home-services/professional/incentives            -> accrued/paid incentive list

Admin / Finance
  GET  /admin/finance/commissions                       -> commission rules + realized commission per period
  GET  /admin/finance/payouts                            -> all professional payouts, filter by status
  POST /admin/finance/payouts/{id}/mark-paid              -> settle a payout batch
  GET  /admin/finance/refunds                            -> all refund requests, approve/reject
  GET  /admin/finance/revenue-report?from=&to=            -> gross/commission/net/tax export (CSV)
```

Backing entities: `ProfessionalEarnings`, `Payouts`, `ProfessionalAdjustments`, `ProfessionalIncentives`, `CommissionRules`, `Payments`, `Refunds`, `CreditTransactions` (see §161a).

---

# 163. Industry-Level Backend Standard

The Home Services backend must match the same production conventions already used by the platform's other complete domains (e.g. Warehouse in `VSRSystemsBackend`):

```text
Layering: Domain entities -> Application (DTOs + repository/service interfaces) ->
          Infrastructure (EF repositories + IEntityTypeConfiguration<T>) -> Api controllers
Validation: FluentValidation on all Create/Update DTOs
Mapping: AutoMapper profiles for entity <-> DTO
Responses: uniform ApiResponse<T> envelope (success, data, error, pagination)
Auth: role-based authorization per controller/action (customer/professional/ops/finance/admin)
Persistence: PostgreSQL via EF Core migrations, one migration per module addition
Money: store money as decimal(18,2); never compute price/commission/refund/payout in the frontend
Consistency: full BookingStatusHistory + AuditLogs for every state-changing action
```

---

# 164. Backend Architecture (Exact Project Mapping)

New module added to the existing `VSRSystemsBackend` solution, mirroring the Warehouse module layout 1:1.

```text
VSRSystemsBackend.Domain/HomeServices/
  ServiceCategory.cs, Service.cs, ServiceProblem.cs, ServicePackage.cs, ServiceAddOn.cs, ServiceWarranty.cs
  City.cs, Zone.cs, Locality.cs, Pincode.cs, ServiceArea.cs
  Professional.cs, ProfessionalDocument.cs, ProfessionalSkill.cs, ProfessionalServiceArea.cs,
    ProfessionalAvailability.cs, ProfessionalTimeOff.cs, ProfessionalPerformance.cs
  Booking.cs, BookingItem.cs, BookingAddOn.cs, BookingMaterial.cs, BookingAssignment.cs,
    BookingStatusHistory.cs, BookingNote.cs, RecurringBooking.cs, AmcContract.cs
  PriceRule.cs, PriceQuote.cs, QuoteRevision.cs
  Payment.cs, Refund.cs, CreditTransaction.cs
  CommissionRule.cs, ProfessionalEarning.cs, Payout.cs, ProfessionalAdjustment.cs, ProfessionalIncentive.cs
  Coupon.cs, CouponRedemption.cs, Referral.cs, MembershipPlan.cs, CustomerMembership.cs
  Review.cs, ReviewMedia.cs, SupportTicket.cs, Dispute.cs

VSRSystemsBackend.Application/HomeServices/
  DTOs/            ServiceCatalogDtos.cs, ProfessionalDtos.cs, BookingDtos.cs, PriceQuoteDtos.cs,
                   PaymentDtos.cs, EarningsDtos.cs, AnalyticsDtos.cs, ReviewDtos.cs, SupportDtos.cs
  Interfaces/      IHomeServicesRepository.cs (catalog/booking/professional/payment repo contracts)
                   IHomeServicesService.cs (catalog/booking/pricing/assignment/earnings/analytics contracts)
  Services/        ServiceCatalogService.cs, BookingService.cs, PriceQuoteService.cs, AssignmentService.cs,
                   PaymentService.cs, EarningsService.cs, PayoutService.cs, AnalyticsService.cs, ReviewService.cs

VSRSystemsBackend.Infrastructure/
  Repositories/HomeServices/   one file per aggregate (BookingRepository.cs, ProfessionalRepository.cs,
                               ServiceCatalogRepository.cs, PaymentRepository.cs, EarningsRepository.cs, ...)
  Data/Configurations/         HomeServicesCatalogConfiguration.cs, HomeServicesBookingConfiguration.cs,
                               HomeServicesFinanceConfiguration.cs (grouped like WarehouseConfiguration.cs)
  Data/DbContext/AppDbContext.cs   add one DbSet<T> per entity above

VSRSystemsBackend.Api/Controllers/
  HomeServiceCategoriesController.cs   /api/home-services/categories, /services, /packages, /add-ons
  HomeServiceAreasController.cs        /api/home-services/cities, /zones, /service-areas
  HomeServiceProfessionalsController.cs /api/home-services/professionals (onboarding, skills, areas, availability)
  HomeServiceBookingsController.cs     /api/home-services/bookings (quote, create, status, assignment)
  HomeServicePaymentsController.cs     /api/home-services/payments, /refunds
  HomeServiceEarningsController.cs     /api/home-services/professional/earnings, /payouts  (see §162)
  HomeServiceAnalyticsController.cs    /api/home-services/admin/analytics/*                (see §161)
  HomeServiceReviewsController.cs      /api/home-services/reviews
  HomeServiceSupportController.cs      /api/home-services/support, /disputes

Program.cs:  register every I*Repository/I*Service pair with builder.Services.AddScoped<,>(),
             same block style already used for the Warehouse module.
Migration:   dotnet ef migrations add AddHomeServicesModule -p VSRSystemsBackend.Infrastructure -s VSRSystemsBackend.Api
```

---

# 165. Frontend Architecture V2 — Interactive Product, Not Decorative UI

> **This section supersedes the old §165 frontend mapping.**
>
> The existing business rules, data model, backend rules, APIs, payment lifecycle, professional workflows,
> administration requirements and Definition of Done in the rest of this document remain mandatory.
>
> The frontend must now be treated as a **complete product application**. A screen is not complete because it
> renders cards or tables. It is complete only when a user can view data, enter data, submit it, receive useful
> validation, recover from errors, perform allowed actions, and see the resulting server state reflected back in
> the interface.

## 165.1 Non-Negotiable Frontend Build Rules

The coding agent MUST follow all of these rules.

1. **No dead UI**
   - Every visible primary button must perform a real action.
   - Every icon button must have a real purpose, accessible label and working handler.
   - Every filter must change the visible result.
   - Every sort must actually sort.
   - Every tab must expose meaningful content.
   - Every form must submit to a backend endpoint or clearly save local draft state where specified.
   - Every editable admin field must persist.
   - Every customer/professional action must re-fetch or reconcile with server state after success.
   - Placeholder buttons such as `Book Now`, `Pay`, `Save`, `Accept`, `Complete`, `Refund`, `Approve`,
     `Assign`, `Add Service`, `Edit`, `Delete`, `Upload`, `Apply Coupon`, `Raise Ticket` are forbidden.

2. **No hardcoded product data in normal application execution**
   - Categories, services, packages, add-ons, prices, bookings, professionals, reviews, earnings, payouts,
     offers, membership plans, slots, notifications and analytics come from APIs.
   - `homeServicesData.ts` must not silently replace a failed API response.
   - API failure must show an error/retry state.
   - Development/demo data must be created through backend seed data so the UI exercises the real application.

3. **Server authority**
   - React is never authoritative for price, availability, eligibility, booking status, assignment, refunds,
     commissions, professional earnings, payout totals or payment success.
   - The UI may calculate presentation-only subtotals for preview, but the server quote is always displayed as
     the final source of truth.
   - After critical mutations, the frontend must render the state returned by the backend.

4. **Forms are a first-class product feature**
   - Login/account flows.
   - Customer profile.
   - Address management.
   - Service issue description.
   - Booking instructions.
   - Coupon application.
   - Cancellation/reschedule.
   - Review.
   - Support ticket.
   - Dispute.
   - Professional onboarding.
   - Professional verification.
   - Skills/services.
   - Service areas.
   - Availability/time off.
   - Job notes.
   - Before/after evidence.
   - Additional quotation.
   - Parts/materials.
   - Completion report.
   - Admin create/edit forms for every managed entity.
   - Finance/refund/payout operations.
   - CMS forms.
   - Role/permission forms.

5. **Every async screen has five explicit states**
   - loading
   - loaded
   - empty
   - error
   - refreshing/mutating

6. **Every destructive or financially meaningful action requires confirmation**
   - cancel booking
   - reject quotation
   - process refund
   - suspend professional
   - delete/deactivate catalog data
   - change commission/pricing rules
   - payout adjustment
   - permission/role changes

7. **Mobile is not a shrunk desktop**
   - Customer and professional flows use cards, bottom sheets, drawers, sticky action areas and large touch targets.
   - Complex admin tables may become horizontally scrollable only where necessary, but important mobile admin
     actions should still have card/detail alternatives.
   - No hover-only interaction.
   - No action hidden behind an unlabeled icon without an accessible label.

8. **Do not create new technology decisions**
   - Frontend remains React.
   - Backend remains .NET.
   - Database remains PostgreSQL.
   - Reuse the existing application's patterns and already-installed capabilities.
   - Do not add a new state/data/form/UI framework merely to implement this section unless separately approved.

---

## 165.2 Existing Module — Refactor In Place

Keep and expand:

```text
frontend/src/services/home-services/
  HomeServicesShell.tsx
  homeServicesApi.ts
  homeServicesStore.ts

  components/
  hooks/
  pages/
  pages/pro/
  pages/admin/
```

The existing visual language should be upgraded, not thrown away.

### Refactor responsibilities

```text
homeServicesApi.ts
  - contains all Home Services HTTP calls
  - typed request/response contracts
  - one consistent error normalization strategy
  - no UI rendering logic
  - no hardcoded successful response fallback

homeServicesStore.ts
  - UI/session convenience state only
  - selected location
  - booking draft identifiers
  - temporary filters
  - drawer/sheet state if useful
  - recently viewed IDs if not server-persisted
  - never becomes the authoritative booking/payment/pricing database

HomeServicesShell.tsx
  - persona-aware navigation
  - route-aware active state
  - responsive top navigation
  - customer/professional mobile bottom navigation
  - notification indicator
  - account switch/actions
  - meaningful breadcrumb/header region where appropriate
```

---

# 166. Product Information Architecture & Route Contract

The coding agent should implement a complete route tree rather than concentrating functionality into a few oversized pages.

## 166.1 Customer Routes

```text
/home-services
/home-services/search
/home-services/categories
/home-services/categories/:categorySlug
/home-services/services/:serviceSlug
/home-services/book/:serviceId
/home-services/bookings
/home-services/bookings/:bookingId
/home-services/addresses
/home-services/offers
/home-services/membership
/home-services/recurring
/home-services/warranty
/home-services/favorites
/home-services/wallet
/home-services/invoices
/home-services/invoices/:bookingId
/home-services/notifications
/home-services/support
/home-services/support/new
/home-services/support/:ticketId
/home-services/disputes/new
/home-services/account
/home-services/account/profile
/home-services/account/security
```

If the main application already has authentication routes, reuse them. Do not create a conflicting auth system.

## 166.2 Professional Routes

```text
/home-services/pro
/home-services/pro/onboarding
/home-services/pro/verification
/home-services/pro/requests
/home-services/pro/jobs
/home-services/pro/jobs/:bookingId
/home-services/pro/calendar
/home-services/pro/availability
/home-services/pro/services
/home-services/pro/areas
/home-services/pro/earnings
/home-services/pro/payouts
/home-services/pro/reviews
/home-services/pro/performance
/home-services/pro/notifications
/home-services/pro/support
/home-services/pro/support/new
/home-services/pro/profile
```

## 166.3 Admin / Operations Routes

```text
/home-services/admin
/home-services/admin/analytics
/home-services/admin/live
/home-services/admin/bookings
/home-services/admin/bookings/:bookingId
/home-services/admin/customers
/home-services/admin/customers/:customerId
/home-services/admin/professionals
/home-services/admin/professionals/:professionalId
/home-services/admin/verification
/home-services/admin/catalog
/home-services/admin/catalog/categories
/home-services/admin/catalog/services
/home-services/admin/catalog/packages
/home-services/admin/catalog/add-ons
/home-services/admin/catalog/problems
/home-services/admin/pricing
/home-services/admin/areas
/home-services/admin/availability
/home-services/admin/payments
/home-services/admin/refunds
/home-services/admin/commissions
/home-services/admin/payouts
/home-services/admin/coupons
/home-services/admin/memberships
/home-services/admin/reviews
/home-services/admin/support
/home-services/admin/support/:ticketId
/home-services/admin/disputes
/home-services/admin/disputes/:disputeId
/home-services/admin/reports
/home-services/admin/cms
/home-services/admin/users
/home-services/admin/roles
/home-services/admin/audit
/home-services/admin/settings
```

Routes must be permission-aware. An authenticated user must never gain functionality merely by manually typing an admin/professional URL.

---

# 167. Customer Application — Feature-Rich Experience

## 167.1 Customer Home — Make It Feel Alive

The home page must be a working discovery and conversion surface.

### Header / top region

- service location selector
- current address summary
- search field with real suggestions
- notification entry
- customer account entry
- active booking indicator when a booking is in progress

### Hero/search interaction

The main search must support problem-first intent.

Examples:

```text
AC not cooling
tap leaking
need fan installed
deep clean 2BHK
washing machine not spinning
```

While typing, show grouped suggestions:

```text
Problems
Services
Categories
Popular searches
Recent searches
```

Selecting a suggestion routes to the appropriate result/service screen.

### Quick problem chips

Examples:

```text
AC not cooling
Water leakage
Power issue
Deep cleaning
Appliance repair
Need installation
Emergency help
```

They must be functional shortcuts.

### Dynamic home modules

Render from APIs/configuration:

- continue unfinished booking
- active booking
- rebook last service
- recently viewed
- popular near selected location
- recommended for customer
- categories
- emergency services
- seasonal services
- offers
- recurring service suggestion
- membership promotion
- top-rated professionals
- recent verified reviews
- trust and safety
- support shortcut

### "Wow" interaction rule

If a customer has an active booking, the home page should stop behaving like a generic marketing page and surface
the active job prominently with:

- current status
- scheduled time
- professional assignment state
- next expected milestone
- one-tap open booking
- contextual help

---

## 167.2 Location Selector

Open as responsive modal/drawer/bottom sheet.

### Actions

- use current location
- choose saved address
- add new address
- change city/locality
- search location
- select recent location

### Result

After location change:

- refresh serviceability
- refresh categories/services relevant to location
- refresh homepage recommendations
- refresh available emergency services
- preserve current navigation where sensible

Show an explicit message when a service is unavailable in the newly selected location.

---

## 167.3 Search Results

### Controls

- search input
- problem/category chips
- category filter
- price range where supported by server data
- service type
- emergency eligibility
- rating where professional/service results use it
- sort
- clear all filters

### Result cards

Each service card should include the useful subset of:

- image/icon
- service name
- category
- starting price or inspection label
- expected duration
- rating/review count where applicable
- warranty
- service badge
- short inclusion summary
- `View details`
- `Book`

No fake star ratings or price labels.

### Empty result

Provide:

- corrected search suggestions
- nearby related categories
- "not sure what service I need" flow
- support/contact option when appropriate

---

## 167.4 Category Detail

The category page is not just a grid.

Include:

- category overview
- common problems
- service groups/subcategories
- packages/services
- emergency option if supported
- recommended combinations
- FAQ
- recent category reviews
- trust/warranty content
- related categories

Clicking a common problem should pre-filter the service list.

---

## 167.5 Service Detail

This is a conversion page.

### Main content

- service title
- category
- problem(s) solved
- service description
- package selector
- inclusions
- exclusions
- duration
- warranty
- price/inspection explanation
- add-ons
- rating/reviews
- service checklist preview where configured
- what the customer should prepare
- cancellation rule
- FAQ
- support link

### Package comparison

When multiple packages exist, allow customers to compare meaningful attributes:

```text
Price
Duration
Included work
Included units
Warranty
Parts/material policy
Recommended for
```

### Sticky action

Desktop:
- sticky booking summary/CTA panel

Mobile:
- sticky bottom bar showing selected package + server-displayed starting/quoted price + continue/book CTA

---

## 167.6 "Help Me Choose" Problem Wizard

This is important for customers who do not know the correct service.

### Flow

```text
Choose category or describe issue
→ select symptoms/problem chips
→ answer category-specific questions
→ optionally upload evidence
→ show recommended service/package(s)
→ customer chooses
→ start booking
```

### Generic fields

- free-text issue description
- urgency
- when problem started
- property type
- optional images/video
- "not sure" choice

### Category-specific question examples

AC:

```text
AC type
Approximate age
Problem
How many units
Any error code
```

Cleaning:

```text
Home size
Number of bedrooms
Number of bathrooms
Furnished/unfurnished
Occupied/vacant
Heavy stains?
```

Electrical:

```text
Problem type
Number of points/items
Whole-house issue?
Burning smell/sparking?
Emergency?
```

Do not invent price from these responses; use them to request the server-side eligible service/quote.

---

## 167.7 Booking Wizard — Full Interactive Contract

The booking flow is a real multi-step form with draft preservation.

### Persistent booking summary

At all steps show an editable summary containing:

- selected service
- package
- quantity/units
- add-ons
- selected address
- selected slot
- instructions
- latest server quote
- discount
- taxes/fees
- final amount

Customer can jump back to completed steps without losing valid selections.

### Step 1 — Package / Service Configuration

Inputs can include:

- package radio/card selection
- quantity/unit stepper
- property/home attributes required by that service
- service problem selection
- optional preferred professional
- "inspection required" acknowledgement

Validation:

- package required
- quantity in allowed range
- service-specific required fields

### Step 2 — Add-ons

- selectable add-on cards
- quantity where allowed
- description
- price impact from server quote refresh
- clear selected state
- no preselected paid add-on without customer action

### Step 3 — Address

Show saved addresses as selectable cards.

Actions:

- select
- add address
- edit address
- delete address
- set default
- use current location

#### Address form fields

```text
Label
Flat/House
Building
Street
Landmark
Pincode
City
State
Latitude
Longitude
Contact Person
Contact Phone
Access Instructions
```

After selection call serviceability. If not serviceable, block continuation with a clear reason and alternatives.

### Step 4 — Date & Time

- Today / Tomorrow / Pick date
- available slot cards
- unavailable slots disabled
- emergency booking option where allowed
- selected date summary
- provider availability message
- refresh availability action

If the selected slot becomes unavailable before booking:
- show conflict message
- preserve all other draft data
- return user to slot selection
- refresh slots automatically

### Step 5 — Instructions & Evidence

Form:

```text
Problem description
Access instructions
Special instructions
Contact preference
Photo upload
Video upload
```

Uploads show:
- progress
- preview
- remove
- retry
- failure reason

### Step 6 — Server Quote

Call price quote API.

Show itemized breakdown:

```text
Base package
Add-ons
Inspection
Travel/urgent fee
Platform fee
Discount
Membership discount
Coupon
Tax
Final total
Quote expiry
```

Actions:

- apply coupon
- remove coupon
- choose membership benefit if applicable
- refresh expired quote
- go back and edit booking

Coupon field must show:
- applying state
- invalid code
- not eligible reason
- successful discount
- removed state

### Step 7 — Payment

Show only payment options allowed for the booking.

States:

```text
ready
creating payment
payment UI open
processing
success awaiting verification
verified success
failed
cancelled
verification delayed
```

Never mark booking paid only from a client callback.

### Step 8 — Confirmation

Show:

- booking number
- service
- date/time
- address
- payment status
- assignment state
- next step
- open booking
- add reminder/calendar only if existing app supports it
- support shortcut

---

## 167.8 Booking List

Tabs/filters:

```text
Active
Upcoming
Completed
Cancelled
Warranty/Rework
```

Each card:

- booking number
- service
- scheduled date/time
- address/locality
- status
- professional if assigned
- amount/payment status
- context-aware action

Context-aware actions:

```text
Track
Pay
Approve quote
Reschedule
Cancel
Review
Rebook
Download invoice
Get support
Raise warranty request
```

---

## 167.9 Booking Detail — Customer Mission Control

The booking detail screen should be one of the richest pages in the customer product.

### Header

- service
- booking number
- current status badge
- scheduled time
- amount/payment state
- context-aware primary CTA

### Timeline

Display real booking status history, not a hardcoded checklist.

### Professional card

When assigned:

- name
- profile image
- verified badge
- rating
- completed jobs
- years experience where available
- service skill
- contact/chat
- favorite professional
- report/support

Before assignment:
- searching state
- expected next action
- fallback/reschedule support if assignment is delayed

### Live action panel

Change by booking status.

Examples:

`Confirmed / SearchingProfessional`
- searching animation/state
- support
- cancel/reschedule if policy allows

`ProviderAccepted`
- professional details
- scheduled timing

`ProviderOnTheWay`
- "professional is on the way"
- contact
- booking instructions
- estimated arrival if backend supports it

`ProviderArrived / AwaitingStartVerification`
- show service start verification code/mechanism
- safety reminder
- do not display code indefinitely after it is consumed

`ServiceInProgress`
- current service
- started at
- contact/support
- pending additional quote if created

`AwaitingCustomerApproval`
- prominent quote approval card

`ServiceCompleted`
- work summary
- before/after gallery
- completion confirmation where required
- remaining payment if any

`Completed`
- invoice
- service report
- warranty
- review
- rebook

### Booking details sections

- package
- add-ons
- instructions
- evidence
- address
- quote history
- payment history
- cancellation/refund information
- warranty
- service report
- invoice
- support/dispute links

---

## 167.10 Reschedule Flow

Open from booking detail.

Show:

- current appointment
- policy/fee
- new available dates
- new available slots
- reason field
- updated quote/fee if server determines one
- confirm

On success:
- update booking detail
- append timeline event
- show confirmation

---

## 167.11 Cancellation Flow

Do not use a one-click destructive button.

Form:

```text
Reason
Optional notes
Refund/fee summary from server
Acknowledgement
```

Show:
- cancellation policy
- estimated refund
- refund destination where relevant

Confirmation requires explicit customer action.

---

## 167.12 Additional Quote Approval

When professional requests extra work, customer gets a blocking/prominent card and notification.

Show:

- reason
- labor
- parts/materials
- quantity
- images
- warranty
- old total
- added amount
- revised total
- notes

Actions:

```text
Approve
Reject
Request clarification
```

Approval may trigger additional payment if required.

---

## 167.13 Review Form

Only eligible completed bookings.

Fields:

```text
Overall rating
Quality
Professionalism
Punctuality
Cleanliness
Communication
Value
Tags
Comment
Photo upload
```

UX:

- rating required
- optional detailed categories
- positive/negative tag suggestions based on rating
- preview uploaded media
- prevent duplicate review
- show submitted review state

---

## 167.14 Warranty / Rework

Customer can start from an eligible completed booking.

Flow:

```text
Choose previous booking
→ show warranty validity
→ choose issue
→ describe problem
→ upload evidence
→ choose preferred resolution
→ submit
→ track request
```

If outside warranty:
- explain why
- offer regular rebooking

---

## 167.15 Support Center

Home:

- search FAQ
- active tickets
- recent bookings needing help
- support categories
- emergency/safety entry

### New ticket form

```text
Booking (optional/required depending category)
Category
Subject
Description
Priority indication
Attachments
Preferred response method if supported
```

### Ticket detail

- ticket number
- current status
- conversation/messages
- attachments
- resolution
- reopen action if policy allows

---

## 167.16 Dispute Form

Use for serious booking-specific disputes.

Inputs:

```text
Booking
Dispute type
Detailed description
Requested resolution
Evidence uploads
Affected amount if relevant
```

Show:
- what happens next
- current investigation status
- admin resolution
- financial outcome when applicable

---

## 167.17 Customer Account

Sections:

- profile
- saved addresses
- membership
- wallet/credits
- favorites
- recurring services
- notification preferences if supported by backend
- invoices
- support history
- legal/policy links
- logout

Profile form must be editable and persist changes.

---

## 167.18 Wallet / Credits

Show:

- available credit
- ledger
- source/reason
- booking reference
- credit/debit
- running balance

Do not show a fake balance.

---

## 167.19 Notifications

Filters:

```text
All
Bookings
Payments
Offers
Support
```

Actions:

- open target entity
- mark read
- mark all read

Unread counter must reconcile with backend.

---

# 168. Professional Application — Job Execution Product

The professional portal must feel like a field-work application, not an analytics dashboard with cards.

## 168.1 Professional Onboarding Wizard

Persist progress.

Progress steps:

```text
Account/Profile
Identity
Address
Experience
Services
Skills
Service Areas
Availability
Payout Details
Verification Documents
Training/Declarations
Review & Submit
```

Each step includes:
- completion indicator
- save & continue
- back
- validation
- upload status where relevant
- server save
- resume later

### Profile form

```text
Name
Photo
Contact details allowed by platform profile
Date of birth if business process requires it
Address
Experience summary
Years of experience
Languages
Emergency service availability
```

Do not collect fields that are not actually required by the existing product/business process.

### Documents

For every document:
- document type
- file upload
- identifier/metadata if backend requires it
- expiry if applicable
- upload progress
- verification status
- rejection reason
- resubmit

### Service/skills selection

- searchable categories
- selectable services
- skill level where enabled
- years/experience per skill if supported
- requested approval state

### Area selection

- city
- zone/locality/pincode
- enable/disable
- radius where backend supports it

### Availability

Weekly editor:
- working day toggle
- start/end
- breaks
- maximum jobs/day if professional-controlled
- save

Time off:
- date/date range
- full day / time range
- reason
- save/delete

### Payout details

Use only the fields required by the backend/payment process.
Mask sensitive values after save.

---

## 168.2 Professional Dashboard

Prioritize actions over vanity metrics.

Top action area:

- online/availability status if supported
- onboarding/verification warning if incomplete
- new job request count
- next job
- active job
- payout issue warning
- support alert

Metrics:

- today's jobs
- upcoming jobs
- today's earnings
- weekly earnings
- rating
- acceptance rate
- completion rate
- on-time rate

Dashboard sections:

- urgent/new requests
- next job
- today's route/job list
- earnings snapshot
- performance tips from real metrics
- recent reviews

---

## 168.3 Job Requests

Each request card:

- service/package
- area/locality
- scheduled time
- booking type
- estimated duration
- estimated earning
- important customer instructions
- emergency badge
- acceptance deadline
- accept
- decline

### Decline interaction

Require reason when business rules require it.

Examples:
- too far
- unavailable
- service mismatch
- personal emergency
- other

After decline:
- card leaves actionable queue
- server state shown
- do not allow repeated accept after another professional has won the booking

### Accept conflict

If another professional accepted first:
- show clear "job no longer available"
- remove from queue
- refresh requests

---

## 168.4 Professional Jobs List

Tabs:

```text
Today
Upcoming
In Progress
Completed
Cancelled
```

Filters:
- date
- service
- status
- area

Cards include:
- booking number
- service
- customer area
- time
- status
- expected earning
- context action

---

## 168.5 Professional Job Detail — Field Mission Mode

This screen changes its primary action based on booking state.

### Fixed job header

- booking number
- service
- date/time
- customer area
- status
- expected earning
- support

### Customer/service information

- address
- landmark
- access instructions
- issue description
- photos/video
- package
- add-ons
- service checklist
- expected duration
- materials rule

### Action state machine

Example:

```text
Assigned
  -> Accept / Decline

ProviderAccepted
  -> Start Travel

ProviderOnTheWay
  -> Arrived

ProviderArrived
  -> Enter/confirm service start verification

ServiceInProgress
  -> Update checklist
  -> Add notes
  -> Add evidence
  -> Request additional work
  -> Add approved materials
  -> Complete service

AwaitingCustomerApproval
  -> Show pending approval; prevent unapproved charge finalization

ServiceCompleted
  -> Show completion submitted state

Completed
  -> Show service report + earning
```

Buttons must be disabled while mutation is in progress.

---

## 168.6 Start Travel

Confirmation can show:
- address
- scheduled time
- safety reminder
- start travel

After success:
- status updates
- primary action becomes `Arrived`

---

## 168.7 Arrived

Action:
- mark arrived

After success:
- store/display arrival state
- show service start verification input when required

---

## 168.8 Service Start Verification

UI:

```text
Enter customer verification code
[code input]
Verify & Start
```

States:
- ready
- verifying
- invalid
- expired
- too many attempts if backend reports it
- verified

Never allow client-only transition to `ServiceInProgress`.

---

## 168.9 Before-Service Evidence

If package/category requires it, block completion until required evidence exists.

Inputs:

- before photos
- condition notes
- problem evidence
- checklist items

Upload component:
- camera/file picker friendly
- preview
- retry
- remove before submission where allowed

---

## 168.10 Service Checklist

Checklist is data-driven.

Each item can support:
- checkbox
- required flag
- note
- photo-required flag

The professional should see progress such as:

```text
4 of 6 required checks completed
```

---

## 168.11 Additional Work / Quote Builder

This must be a proper line-item form.

Fields:

```text
Reason
Labor item(s)
Part/material item(s)
Additional service item(s)
Quantity
Unit price
Warranty
Photo
Notes
```

Actions:

```text
Add line
Remove line
Preview
Send for customer approval
```

After sending:
- lock submitted revision from casual editing
- show pending customer approval
- show customer decision when received

No unapproved charge may be silently added to final payable amount.

---

## 168.12 Parts / Materials

Line item editor:

```text
Part Name
Quantity
Unit Price
Warranty
Photo
Customer Approval Status
```

Show whether each line is:
- pending
- approved
- rejected

---

## 168.13 Completion Form

Completion should be intentionally structured.

Required/optional based on service configuration:

```text
Work performed
Completion notes
Checklist
Parts used
After photos
Warranty
Recommended future work
Customer-facing summary
```

Before submission:
- show completion review
- confirm required evidence
- warn about missing required checklist/evidence

After success:
- show submitted report
- reflect server booking status
- show resulting earning state when available

---

## 168.14 Professional Earnings

Summary cards:
- today
- this week
- this month
- pending
- available/settled where supported

List rows:
- booking
- gross value
- commission
- adjustment
- tax/withholding
- net earning
- status

Filters:
- date
- status
- service

Every row can open earning details.

---

## 168.15 Payouts

Show:
- next payout
- pending balance
- paid history
- failed payouts
- adjustment history

Failed payout:
- failure reason
- next action
- support shortcut

---

## 168.16 Professional Performance

Show real metrics:
- rating
- completion rate
- acceptance rate
- cancellation rate
- on-time rate
- complaint rate
- rework rate
- recent review trend where backend supports it

Use explanations, not only numbers.

---

## 168.17 Professional Reviews

List:
- customer review
- service
- booking date
- category ratings
- tags
- response/moderation state if product supports it

---

## 168.18 Professional Support

Allow:
- new ticket
- booking-linked help
- payout help
- account/verification help
- safety/emergency help
- ticket history

---

# 169. Admin / Operations Application — Full Control Plane

The admin portal must not be a read-only set of tables. It is the operational control plane for the business.

## 169.1 Admin Dashboard

Summary cards must be clickable and route to filtered operational views.

Examples:

```text
Bookings Today -> /admin/bookings?date=today
Unassigned -> /admin/live?status=unassigned
Pending Verification -> /admin/verification
Refunds -> /admin/refunds
Pending Payouts -> /admin/payouts
Open Tickets -> /admin/support?status=open
Critical Disputes -> /admin/disputes?priority=critical
```

Include:
- booking snapshot
- professional availability risk
- finance snapshot
- support/dispute snapshot
- live alerts
- quick actions

No decorative KPI that cannot be investigated.

---

## 169.2 Admin Analytics

Every chart:
- real aggregation API
- date range
- location filter where supported
- category/service filter where supported
- loading/empty/error
- tooltip/legend
- downloadable/exportable report only where backend endpoint exists

Analytics should link to underlying operational view when practical.

---

## 169.3 Live Operations Board

This is a high-value operational screen.

Columns/status groups:

```text
New
Searching Provider
Awaiting Provider
Upcoming
On The Way
Arrived
In Service
Waiting Customer Approval
Payment Pending
Problem
Completed
```

Card:
- booking #
- service
- customer area
- scheduled time
- professional
- payment
- elapsed/late indicator
- alert indicator

Actions from card/detail drawer:
- open booking
- assign
- reassign
- contact customer
- contact professional
- reschedule
- cancel
- add internal note
- escalate
- open support/dispute context

Live board needs:
- search
- city
- zone
- service
- booking type
- status
- professional
- late-only
- emergency-only
- problem-only
- auto/manual refresh indicator

---

## 169.4 Admin Booking Detail

Tabs/sections:

```text
Overview
Timeline
Assignment
Customer
Professional
Quote
Payments
Refunds
Service Evidence
Messages
Support
Disputes
Internal Notes
Audit
```

Actions permission-controlled:
- assign
- reassign
- reschedule
- cancel
- approve special operational action
- initiate/refund according to role
- escalate
- add note
- contact parties

Every admin mutation must record/display meaningful resulting state.

---

## 169.5 Manual Assignment Drawer

Inputs:
- booking summary
- search professional
- filter by eligibility
- distance/area
- skills
- availability
- rating/performance
- current workload
- reason for manual assignment

Only eligible professionals should be selectable unless a privileged override exists in backend rules.

Confirm before assignment.

---

## 169.6 Professional Admin

List filters:
- name/id
- city
- service
- verification
- active/suspended
- rating
- performance level
- onboarding status

Row actions:
- open
- verify/review
- activate/suspend as permitted
- inspect bookings
- inspect earnings/payouts
- add internal note

Professional detail tabs:

```text
Overview
Verification
Documents
Services
Skills
Areas
Schedule
Bookings
Earnings
Payouts
Reviews
Complaints
Performance
Internal Notes
Audit
```

### Verification review interaction

For each item:
- view submitted data/file
- status
- approve
- reject
- rejection reason
- request resubmission
- audit metadata

Bulk approval should be used only where business-safe.

---

## 169.7 Customer Admin

List:
- search
- city
- booking count
- membership
- account state
- support/dispute indicators

Customer detail:

```text
Profile
Addresses
Bookings
Payments
Refunds
Membership
Support
Reviews
Credits
Internal Notes
Audit
```

Actions are permission-controlled.

---

## 169.8 Catalog Admin — Real CRUD

This must be fully editable from UI.

### Categories

List:
- name
- parent/subcategory relationship where applicable
- status
- sort order
- service count
- emergency eligibility

Create/edit form:

```text
Name
Slug
Short Description
Detailed Description
Image/Icon reference
Sort Order
Active
Emergency Eligible
SEO/display metadata already supported by backend
```

Actions:
- create
- edit
- activate/deactivate
- reorder
- open services
- delete only if backend business rules allow it

### Services

Form:

```text
Category
Name
Slug
Short Description
Detailed Description
Problems solved
Default duration
Inspection required?
Emergency eligible?
Recurring eligible?
Active
Display order
```

### Service Problems

Form:
- service/category
- label
- description
- sort order
- active
- recommended service/package mapping where backend supports it

### Packages

Form:

```text
Service
Name
Short Description
Detailed Description
Price/base pricing reference
Duration
What's Included
What's Excluded
Warranty
Inspection Required?
Parts Included?
Minimum Charge
Cancellation Rule
Popular?
Emergency Eligible?
Active?
```

### Add-ons

Form:
- service/package
- name
- description
- price rule/reference
- quantity rules
- active
- display order

Admin changes must appear in customer discovery without code deployment.

---

## 169.9 Pricing Admin

Filters:
- city
- area
- category
- service
- package
- active date

Create/edit price rule:
- scope
- base price
- fee/adjustment
- valid from/to
- emergency/weekend/time rules where supported
- professional payout rule reference if applicable
- active

Show price version/history.

A pricing change must require:
- confirmation
- effective date
- audit entry

---

## 169.10 Service Area Admin

Hierarchy browser:
- country
- state
- city
- zone
- locality
- pincode

Forms:
- create/edit area nodes
- activate/deactivate
- enable category/service/package per area
- emergency availability
- operational notes if supported

Show service coverage clearly.

---

## 169.11 Availability / Capacity Admin

Filters:
- date
- city
- zone
- category
- service
- time

Show:
- available professionals
- scheduled demand
- unassigned demand
- shortage state

Allow drilldown to professional availability and affected bookings.

---

## 169.12 Payments Admin

List:
- payment id
- booking
- customer
- amount
- method/provider
- status
- gateway reference
- date

Filters:
- status
- provider
- date
- booking/customer
- amount

Detail:
- payment timeline
- gateway references
- verification/webhook state
- associated refunds
- audit

No fake "Mark paid" action unless a legitimate backend operation explicitly supports it.

---

## 169.13 Refund Admin

Refund queue:
- requested
- awaiting review
- approved
- processing
- processed
- rejected/failed as supported

Refund detail:
- booking
- payment
- reason
- policy result
- requested amount
- allowed amount from backend
- evidence/support context
- customer communication
- audit

Actions:
- approve
- reject with reason
- process
- retry failed process if supported

Every money action requires explicit confirmation.

---

## 169.14 Commission Admin

List and edit commission rules.

Inputs:
- category
- service
- city
- professional tier
- percentage
- flat fee
- effective dates
- active

Show:
- rule history
- affected scope
- sample server-generated calculation only if endpoint supports it

---

## 169.15 Payout Admin

List:
- professional
- period
- amount
- status
- paid date
- failure

Detail:
- included earnings
- adjustments
- taxes/withholding
- final payout
- gateway/reference
- audit

Actions:
- inspect
- process/retry if backend permits
- add adjustment through proper form
- support/escalate

---

## 169.16 Coupons Admin

Form:

```text
Code
Discount Type
Value
Max Discount
Minimum Order Value
Validity
Usage Limit
Per-Customer Limit
Eligibility scope
Active
```

Eligibility scope can include configured:
- category
- service
- city
- first booking
- membership
- referral/campaign

Show redemption count and usage detail.

---

## 169.17 Membership Admin

CRUD:
- name
- price
- validity
- benefits
- discount rules
- fee waiver
- cancellation benefit
- priority support
- active

Show active customer count if aggregation is available.

---

## 169.18 Support Agent Workspace

Ticket list:
- ticket number
- customer/professional
- booking
- category
- priority
- status
- assigned agent
- age

Filters:
- priority
- status
- category
- agent
- booking
- customer/professional

Ticket detail:
- conversation
- booking timeline
- payment context
- attachments
- internal notes
- assigned agent
- resolution

Actions:
- assign to self/agent
- reply
- internal note
- change status
- escalate
- link/create dispute
- request refund review
- close

---

## 169.19 Dispute Workspace

List:
- booking
- dispute type
- amount at risk
- priority
- opened date
- status
- assigned owner

Detail:
- customer statement
- professional statement
- booking timeline
- communication
- photos/evidence
- before/after evidence
- quotes
- payment/refund data
- prior support tickets
- internal notes
- audit

Resolution form:
- decision
- customer outcome
- professional outcome
- refund/credit/adjustment
- suspension/action where permitted
- explanation
- confirm

---

## 169.20 Review Moderation

Admin can:
- search/filter reviews
- inspect booking link
- inspect media
- flag suspected abuse
- moderate according to product policy
- inspect rating trends

Do not allow arbitrary silent editing of customer review text unless the business explicitly defines such a policy.

---

## 169.21 CMS Admin

Editable content:
- homepage banners
- offers
- FAQs
- how it works
- trust & safety
- policy pages
- category banners
- city landing content
- professional onboarding content

Editor requirements:
- create
- edit
- preview where possible
- publish/unpublish
- display/sort order where applicable
- validation
- audit

---

## 169.22 Roles & Permissions

Admin role detail:
- role name
- permission matrix
- users assigned
- save changes

Permission groups reflect §114.

Changing high-impact roles/permissions requires confirmation and must be audited.

---

## 169.23 Audit

Searchable list:
- actor
- action
- entity
- date/time
- before/after availability
- related booking/professional/customer where applicable

Audit screen is read-only for normal administrators.

---

# 170. Forms, Interaction, State and UX Standard

## 170.1 Standard Form Anatomy

Every major form uses:

```text
Title
Short contextual explanation
Field labels
Required markers
Inline help where needed
Inline validation
Server validation
Primary action
Secondary/back action
Submitting state
Success state
Failure state
Unsaved change protection where appropriate
```

Do not rely only on toast messages for validation.

### Validation timing

- obvious local format validation can appear after blur or submit
- server/business validation appears inline at the relevant field/section
- do not block typing with aggressive validation
- preserve user inputs after server failure

---

## 170.2 Button States

Every mutation button supports:

```text
idle
hover/focus where applicable
disabled
submitting
success feedback
failure/retry
```

Prevent duplicate submission.

Examples:

```text
Save -> Saving...
Book -> Creating booking...
Accept -> Accepting...
Approve -> Approving...
Pay -> Processing...
Upload -> Uploading 46%...
Refund -> Processing refund...
```

---

## 170.3 Mutation Feedback

Use the right feedback location:

- inline for field/business validation
- within card for card-level action failure
- page banner for page-level failure
- toast only for short-lived confirmation
- modal/dialog for confirmations
- dedicated success screen for major completion such as booking/payment/onboarding submission

Critical errors must not disappear automatically before the user can understand them.

---

## 170.4 Loading

Use meaningful skeletons that resemble final layout.

Required at minimum:
- home
- category
- service
- search results
- slots
- quote
- booking list/detail
- professional requests/jobs
- professional dashboard
- earnings
- admin dashboard
- admin tables
- analytics
- finance
- support/dispute

Do not replace the entire application with a single centered spinner unless only a tiny isolated action is loading.

---

## 170.5 Empty States

Every empty state must contain:
- clear explanation
- useful next action

Examples:

```text
No bookings yet -> Explore services
No saved addresses -> Add address
No professional requests -> View upcoming jobs
No payouts yet -> View earnings
No open tickets -> Create support ticket
No services in area -> Change location
No search results -> Clear filters / describe your problem
```

---

## 170.6 Error Recovery

The UI must specifically handle:

- authentication expired
- forbidden action
- server unavailable
- network loss
- validation error
- booking slot conflict
- quote expired
- professional no longer available
- payment failure
- payment verification delay
- upload failure
- stale booking state
- already accepted request
- duplicate review
- coupon ineligible
- refund not permitted
- concurrent admin edit when backend reports it

Where a recovery action exists, show it:

```text
Retry
Refresh quote
Choose another slot
Re-open booking
Upload again
Sign in again
Contact support
```

---

## 170.7 Offline / Network Loss

Do not fake successful transactions.

Allowed:
- preserve unsent form draft locally where reasonable
- show offline banner
- retry safe reads
- let customer copy entered text

Forbidden:
- pretend booking/payment/refund/assignment succeeded offline

---

## 170.8 Confirmation Dialog Standard

For high-impact action show:
- action being taken
- affected entity
- financial/policy effect
- reason field when required
- confirm/cancel

Avoid generic "Are you sure?" without context.

---

## 170.9 Drawers, Modals and Bottom Sheets

Use:
- full page for long/high-complexity forms
- modal/dialog for confirmation
- drawer for desktop contextual edit/detail
- bottom sheet for compact mobile selectors/actions
- full-screen mobile sheet/page for long forms

Do not place a 20-field admin form in a tiny modal.

---

## 170.10 Sticky Actions

Appropriate screens should keep the most important action visible.

Examples:
- service detail -> Book
- booking wizard -> Continue
- quote approval -> Approve/Reject
- professional active job -> next status action
- completion form -> Review & Complete
- admin review form -> Save/Approve/Reject

Sticky bars must not cover content or mobile safe areas.

---

## 170.11 Search, Filter and Sort Standard

For list pages:
- search
- clear filters
- visible active filter chips/count
- result count
- pagination or incremental loading according to existing backend contract
- empty filtered state distinct from globally empty state

Admin filters should be encoded in URL query parameters where practical so views can be shared/reopened.

---

## 170.12 Table Standard — Admin

Tables support as appropriate:
- loading skeleton rows
- sortable columns
- filters
- pagination
- row click/detail
- explicit action menu
- selected row state
- bulk actions only where safe
- empty/error
- responsive fallback

Do not put every possible field into one unreadable table.

---

## 170.13 Card Standard — Customer/Professional

Cards should answer:
1. what is this?
2. what state is it in?
3. what matters now?
4. what can I do next?

Avoid cards that exist only for decoration.

---

## 170.14 Upload Standard

All upload surfaces:
- allowed file types/size guidance based on backend rules
- progress
- preview where safe
- retry
- remove
- failed state
- uploaded state
- accessible file picker
- mobile camera compatibility where browser permits

Do not mark form complete before required upload has actually succeeded.

---

## 170.15 Notification / Real-Time Refresh Behavior

Without introducing a new technology choice, the UI must at minimum support reliable server refresh for time-sensitive state.

Pages that need refresh behavior:
- active customer booking
- professional requests
- professional active job
- admin live operations
- payment verification
- quote approval
- support conversation if current backend supports refresh

Show:
- last updated / refreshing where useful
- manual refresh
- stale state handling

Do not imply live state when the screen is actually stale.

---

## 170.16 Unsaved Drafts

Preserve appropriate drafts:
- booking wizard
- support ticket
- professional onboarding
- admin long-form edits where practical

On navigation away:
- save draft if designed to persist
- otherwise warn about unsaved changes

Never persist raw payment secrets or sensitive verification material unnecessarily in browser storage.

---

## 170.17 Accessibility

Minimum:
- keyboard access for desktop
- focus-visible states
- semantic labels
- form error association
- screen-reader labels for icon buttons
- sufficient contrast
- logical heading order
- status not communicated by color alone
- dialogs trap/focus correctly
- touch targets large enough for mobile
- image uploads have meaningful accessible names

---

## 170.18 Responsive Experience

### Customer bottom navigation

```text
Home
Services
Bookings
Offers
Account
```

When a critical active booking exists, the product may surface it prominently without breaking the base navigation.

### Professional bottom navigation

```text
Home
Requests
Jobs
Earnings
Account
```

### Mobile patterns

- horizontal service chips
- 2-column category cards where width allows
- single-column detailed cards
- full-width form fields
- sticky bottom CTA
- bottom sheet selectors
- condensed timeline
- expandable price breakdown
- no forced desktop data grid for customer/professional views

---

## 170.19 Visual / Interaction Quality Bar — "Wow" Without Gimmicks

The desired quality should come from usefulness and polish, not decorative animation.

Use:
- strong hierarchy
- meaningful whitespace
- rich service cards
- clear status chips
- polished skeletons
- persistent booking summary
- progressive disclosure
- smart defaults
- problem-first discovery
- clear trust indicators
- contextual next actions
- before/after evidence gallery
- quote comparison
- elegant empty states
- purposeful transitions for drawers/sheets/status changes
- consistent icons already available in the project

Avoid:
- excessive gradients
- random animations
- fake counters
- fake live maps
- fake professional availability
- fake ratings
- fake "X people booked this today"
- auto-rotating content that interferes with interaction
- hidden interactions users must guess

---

## 170.20 High-Impact Product Enhancements Required

These additions make the frontend feel materially more complete.

### A. Resume Booking Draft

If a customer exits mid-booking:
- home can show `Continue booking`
- validate draft against fresh serviceability/availability/quote when resumed

### B. Recently Viewed

Track service IDs and show:
- recent services
- quick re-open
- do not use it as authoritative business data

### C. One-Tap Rebook

From completed booking:
- prefill service
- package
- prior add-ons
- address
- preferred professional when allowed
- force fresh availability and quote

### D. Compare Packages

Allow selecting 2-3 packages for side-by-side meaningful comparison on service detail.

### E. Contextual Support

Opening support from a booking should preselect that booking and show relevant help categories.

### F. Active Job Mode

Customer and professional active booking/job screens should prioritize current operational action over generic navigation content.

### G. Professional Trust Profile

Customer can open assigned professional detail containing only server-backed:
- verification state
- rating
- completed jobs
- experience
- service skills
- badges
- reviews

### H. Quote History

Customer/admin can see original and revised quote versions.

### I. Actionable Admin KPIs

Every dashboard KPI drills into the filtered operational list.

### J. Provider Shortage Awareness

Admin capacity/operations screens clearly surface:
- no-provider bookings
- low supply by category/zone/time
- affected upcoming bookings

### K. Booking Draft Step Validation

Each step must be individually valid before proceeding, but previous valid data remains editable.

### L. Smart Next Action

Booking/job cards calculate the next **allowed** action from server status rather than showing every possible button.

---

## 170.21 Exact Component Families

Use existing project conventions, but organize Home Services into reusable component families.

```text
components/
  common/
    AsyncState
    EmptyState
    ErrorState
    ConfirmDialog
    StatusBadge
    MoneyBreakdown
    SearchInput
    FilterBar
    FilterChip
    Pagination
    UploadField
    MediaPreview
    Timeline
    DetailSection
    StickyActionBar

  customer/
    LocationSelector
    AddressCard
    AddressForm
    CategoryCard
    ServiceCard
    PackageCard
    PackageComparison
    AddOnSelector
    ProblemSelector
    BookingDraftSummary
    SlotPicker
    QuoteBreakdown
    CouponForm
    PaymentPanel
    BookingCard
    BookingTimeline
    ProfessionalTrustCard
    AdditionalQuoteCard
    ReviewForm
    SupportTicketForm

  professional/
    OnboardingStepper
    VerificationItem
    ServiceSkillSelector
    ServiceAreaSelector
    WeeklyAvailabilityEditor
    TimeOffForm
    JobRequestCard
    JobCard
    JobActionPanel
    StartVerificationForm
    ServiceChecklist
    EvidenceUploader
    AdditionalQuoteBuilder
    MaterialLineEditor
    CompletionForm
    EarningsBreakdown

  admin/
    AdminMetricCard
    AdminFilterBar
    AdminDataTable
    AdminDetailDrawer
    LiveBookingCard
    AssignmentDrawer
    VerificationReview
    CatalogEntityForm
    PricingRuleForm
    ServiceAreaForm
    RefundReview
    CommissionRuleForm
    PayoutDetail
    SupportWorkspace
    DisputeResolutionForm
    PermissionMatrix
    AuditViewer
```

Names can be adapted to existing conventions, but equivalent reusable capabilities must exist.

---

## 170.22 Exact Page Mapping

Recommended expansion of the existing module:

```text
pages/
  Home.tsx
  Search.tsx
  Categories.tsx
  CategoryDetail.tsx
  ServiceDetail.tsx
  ProblemWizard.tsx
  BookingFlow.tsx
  Bookings.tsx
  BookingDetail.tsx
  Addresses.tsx
  Offers.tsx
  Membership.tsx
  RecurringServices.tsx
  Warranty.tsx
  Favorites.tsx
  Wallet.tsx
  Invoices.tsx
  InvoiceDetail.tsx
  Notifications.tsx
  Support.tsx
  SupportNew.tsx
  SupportDetail.tsx
  DisputeNew.tsx
  Account.tsx
  Profile.tsx

pages/pro/
  ProDashboard.tsx
  ProOnboarding.tsx
  ProVerification.tsx
  ProRequests.tsx
  ProJobs.tsx
  ProJobDetail.tsx
  ProCalendar.tsx
  ProAvailability.tsx
  ProServices.tsx
  ProAreas.tsx
  ProEarnings.tsx
  ProPayouts.tsx
  ProReviews.tsx
  ProPerformance.tsx
  ProNotifications.tsx
  ProSupport.tsx
  ProSupportNew.tsx
  ProProfile.tsx

pages/admin/
  AdminDashboard.tsx
  AdminAnalytics.tsx
  AdminLiveOps.tsx
  AdminBookings.tsx
  AdminBookingDetail.tsx
  AdminCustomers.tsx
  AdminCustomerDetail.tsx
  AdminProfessionals.tsx
  AdminProfessionalDetail.tsx
  AdminVerification.tsx
  AdminCatalog.tsx
  AdminCategories.tsx
  AdminServices.tsx
  AdminPackages.tsx
  AdminAddOns.tsx
  AdminProblems.tsx
  AdminPricing.tsx
  AdminAreas.tsx
  AdminAvailability.tsx
  AdminPayments.tsx
  AdminRefunds.tsx
  AdminCommissions.tsx
  AdminPayouts.tsx
  AdminCoupons.tsx
  AdminMemberships.tsx
  AdminReviews.tsx
  AdminSupport.tsx
  AdminSupportDetail.tsx
  AdminDisputes.tsx
  AdminDisputeDetail.tsx
  AdminReports.tsx
  AdminCms.tsx
  AdminUsers.tsx
  AdminRoles.tsx
  AdminAudit.tsx
  AdminSettings.tsx
```

Do not create all pages as empty shells. A route is complete only when its required interactions are wired.

---

## 170.23 API Binding Expectations

The frontend should have explicit API methods rather than ad-hoc fetch calls scattered across pages.

Examples of method groups:

```text
auth/account
location/address
catalog/search
serviceability
availability
quotes
bookings
booking actions
payments
refunds
reviews
favorites
membership
recurring
wallet
notifications
support
disputes

professional profile
professional onboarding
professional verification
professional services
professional areas
professional availability
professional requests
professional jobs
professional job actions
professional earnings
professional payouts
professional reviews
professional support

admin dashboard
admin analytics
admin live operations
admin bookings
admin assignment
admin customers
admin professionals
admin verification
admin catalog
admin pricing
admin areas
admin finance
admin coupons
admin memberships
admin reviews
admin support
admin disputes
admin reports
admin cms
admin users/roles
admin audit
admin settings
```

If an endpoint required by these screens does not exist yet, implement the corresponding backend endpoint according to the
business rules in this document rather than replacing the interaction with mock data.

---

## 170.24 Frontend Acceptance Scenarios

The frontend is not considered complete until all of these can be demonstrated against the real backend.

### Customer

1. create/sign in to account using existing platform auth
2. edit profile
3. add, edit and remove address
4. change service location
5. search by service
6. search by problem phrase
7. browse category
8. open service
9. compare/select package
10. select add-ons
11. enter service-specific information
12. choose address
13. fail serviceability and recover
14. choose available slot
15. experience slot conflict and recover without losing draft
16. add instructions and upload evidence
17. get server quote
18. apply valid coupon
19. see invalid/ineligible coupon
20. complete payment
21. experience payment failure and retry
22. see booking confirmation
23. track assignment
24. open assigned professional profile
25. reschedule
26. cancel and view refund effect
27. use service start verification flow
28. receive and approve/reject additional quote
29. see completion evidence
30. pay remaining amount if required
31. receive invoice/service report
32. leave review
33. rebook
34. create support ticket
35. raise dispute
36. submit warranty/rework request
37. view wallet/credits
38. mark notification read

### Professional

1. complete onboarding
2. upload verification documents
3. respond to rejection/resubmission
4. select services/skills
5. select service areas
6. configure availability
7. block time off
8. receive request
9. accept request
10. handle already-taken request
11. decline with reason
12. start travel
13. mark arrived
14. enter start verification
15. upload before evidence
16. complete checklist
17. create additional quote
18. add parts/materials
19. wait for approval
20. complete service
21. upload after evidence
22. see earning
23. see commission deductions
24. see payout
25. see review
26. create support ticket

### Admin / Operations

1. open dashboard KPI and drill into filtered data
2. operate live board
3. manually assign booking
4. reassign booking
5. handle unassigned booking
6. inspect customer
7. inspect professional
8. approve/reject verification
9. create category
10. create service
11. create package
12. create add-on
13. create problem mapping
14. change ordering/status
15. create pricing rule
16. configure service area
17. view availability shortage
18. inspect payment
19. process refund workflow
20. create/update commission rule
21. inspect payout
22. create coupon
23. create membership plan
24. work support ticket
25. resolve dispute
26. moderate review according to policy
27. publish CMS content
28. modify role/permissions
29. inspect audit trail
30. use analytics filters

---

## 170.25 UI Definition of Done

A frontend feature is done only if:

```text
route works
API request works
loading works
success works
empty works
error works
validation works
permission works
mobile works
desktop works
back/retry works
mutation is protected from double-submit
server state is reflected after mutation
no placeholder data is displayed as real data
no primary CTA is dead
```

The goal is not merely a beautiful UI.

The goal is a customer opening the application and feeling that **every screen is alive, every action has depth,
every important state is handled, and the product can actually run a home-services business.**

---

---

# 171. Payment Gateway Integration

> Admin retains full, unrestricted visibility/control over payment gateway configuration and every transaction/webhook log, same as every other module in this document (see also the Sales module's admin-oversight rules in `VSR_Sales_Agent_Dashboard_Architecture.md`).

The internal `Payments`/`Refunds` tables (§161a) record platform state; the actual money movement goes through a real gateway.

**Chosen provider:** Razorpay (primary — UPI/cards/netbanking/wallets, matches the launch cities in §33/§152 which are all in India). Stripe can be added later as a secondary provider behind the same interface if the platform expands internationally — no other tech choice is introduced now.

```text
DB additions (extends §161a):
  Payments: add gateway_provider (razorpay/stripe), gateway_order_id, gateway_payment_id,
            gateway_signature, webhook_verified (bool)
  PaymentGatewayWebhookEvents
    id, provider, event_type, payload (jsonb), signature_valid, processed_at, booking_id fk (nullable)
  PaymentGatewaySettings   (admin-configurable, secrets stored in server config/secret store, never in plain DB text)
    id, provider, is_active, mode (test/live), key_id, webhook_secret_ref

Backend flow:
  POST /home-services/payments/create-order   -> creates PriceQuote-bound gateway order, returns order_id + key_id
  Client completes payment via gateway SDK/checkout widget (React) using the returned order_id
  POST /home-services/payments/webhook        -> gateway webhook (signature-verified server-side),
                                                  marks Payments.status = captured/failed, updates Booking.payment_status
  POST /admin/finance/refunds/{id}/process    -> calls gateway refund API, then updates Refunds.status

Frontend:
  homeServicesApi.ts: createPaymentOrder(), confirmPayment() wrapping the gateway's JS checkout
  pages/BookingFlow.tsx: final step invokes the gateway checkout widget instead of a mocked "Pay" button
  pages/admin/AdminFinance.tsx: gateway settings panel (key id / mode / webhook status) — admin-only,
                                secret values write-only (never rendered back after save)

Rules:
  never trust client-reported payment success — Booking.payment_status only changes from a verified
  webhook or a server-side payment-status poll against the gateway API
  every webhook payload is stored in PaymentGatewayWebhookEvents for audit/replay
  admin has full visibility into every transaction, webhook event and refund, per §170
```
