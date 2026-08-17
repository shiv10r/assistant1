# VSR Home Services Marketplace — Full-Fledged Product Architecture

> **Purpose:** Complete product architecture for a real working home-services marketplace.
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
