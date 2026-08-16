# VSR Travel — Full-Stack Travel Booking Platform Architecture

> **Coding-agent-ready product architecture**
>
> Build a polished, card-heavy travel marketplace inspired by the *type of experience* offered by modern travel platforms such as Tripgix, while keeping VSR Travel's brand, UI, code, copy, imagery, and component design original.
>
> **Fixed stack**
>
> - Frontend: React + TypeScript + Vite
> - Backend: ASP.NET Core Web API + C#
> - Database: Microsoft SQL Server
> - ORM: Entity Framework Core
> - Architecture: Modular Monolith + Clean Architecture principles
> - Target devices: Desktop, laptop, tablet, mobile browser, Android WebView, iOS WKWebView

---

# 1. Product Vision

Create a complete consumer travel booking platform where users can discover destinations, compare trips, book curated holiday packages, join group departures, request customized trips, and manage bookings.

The product should feel visually rich and discovery-first.

The homepage and listing pages should use **many reusable visual cards**, image-led sections, carousels, horizontal mobile scrollers, category chips, offer cards, itinerary cards, and trust cards instead of large text-heavy sections.

The core experience should support:

- Domestic holiday packages
- International holiday packages
- Group trips
- Customized trips
- Family trips
- Couple / honeymoon trips
- Corporate trips
- Weekend getaways
- Adventure / trekking trips
- Hotel discovery
- Activities / experiences
- Transfers / cabs
- Flight-ready architecture
- Visa assistance leads
- Travel insurance add-ons
- Offers / coupon codes
- Reviews
- Wishlist
- User account and My Trips
- Booking and payment
- Admin / operations portal
- Lead management for custom trips

The application should be commercially usable as an MVP while remaining extensible into a larger OTA platform.

---

# 2. Product Strategy

Do **not** start with microservices.

Recommended initial architecture:

```text
React SPA / PWA
      +
ASP.NET Core Modular Monolith
      +
SQL Server
```

This gives:

- Fast implementation
- Simple deployment
- Clear module boundaries
- Easy debugging
- Transactional booking workflows
- Lower infrastructure cost
- Straightforward future service extraction

Possible future microservices are described later, but they are **not** part of the first build.

---

# 3. High-Level System Architecture

```text
┌───────────────────────────────────────────────────────────────────────┐
│                              USERS                                    │
│                                                                       │
│ Desktop       Tablet       Mobile Browser       Android/iOS WebView   │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        REACT + TYPESCRIPT                              │
│                                                                       │
│ Public Travel Site                                                    │
│ Search / Discovery                                                    │
│ Package Booking                                                       │
│ User Account                                                          │
│ My Trips                                                              │
│ Wishlist                                                              │
│ Checkout                                                              │
│ Admin Portal                                                          │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │ REST / JSON
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                     ASP.NET CORE WEB API                               │
│                                                                       │
│ Authentication                                                        │
│ Travel Catalog                                                        │
│ Search                                                                │
│ Packages                                                              │
│ Departures                                                            │
│ Pricing                                                               │
│ Booking                                                               │
│ Payments                                                              │
│ Customers                                                             │
│ Reviews                                                               │
│ Leads                                                                 │
│ CMS                                                                   │
│ Admin                                                                 │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                            SQL SERVER                                  │
│                                                                       │
│ Travel inventory + pricing + bookings + customers + content           │
└───────────────────────────────────────────────────────────────────────┘

Future integrations:

Flights API ──────────────┐
Hotels API ───────────────┤
Payment Gateway ──────────┤
Email/SMS/WhatsApp ───────┤──► ASP.NET Core
Object Storage ───────────┤
Maps/Geocoding ───────────┤
Analytics ────────────────┘
```

---

# 4. Recommended Technology Stack

## Frontend

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
Framer Motion
Embla Carousel or Swiper
TanStack Table
Recharts
date-fns
Axios or fetch wrapper
Sonner
```

### Optional

```text
react-map-gl / Google Maps wrapper
react-day-picker
react-dropzone
DOMPurify for controlled rich CMS content
```

---

## Backend

```text
ASP.NET Core Web API
C#
Entity Framework Core
SQL Server provider
FluentValidation
JWT authentication
Refresh tokens
Policy/permission authorization
Swagger / OpenAPI
ProblemDetails
Structured logging
Rate limiting
Health checks
Background services
```

Optional later:

```text
SignalR
Redis
Hangfire / Quartz
Object/blob storage
```

---

# 5. Monorepo / Repository Layout

```text
VSR.Travel/
│
├── frontend/
│   └── vsr-travel-web/
│
├── backend/
│   ├── VSR.Travel.Api/
│   ├── VSR.Travel.Application/
│   ├── VSR.Travel.Domain/
│   ├── VSR.Travel.Infrastructure/
│   ├── VSR.Travel.Contracts/
│   └── VSR.Travel.Tests/
│
├── database/
│   ├── scripts/
│   ├── seed/
│   └── diagrams/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── product/
│   └── ux/
│
└── README.md
```

---

# 6. Product Areas

The application has three main product surfaces.

## A. Public Travel Marketplace

Used by travelers.

```text
Home
Destinations
Holiday Packages
Group Trips
International Trips
Domestic Trips
Honeymoon
Family
Adventure
Weekend Trips
Activities
Hotels
Offers
Blogs / Guides
About
Contact
```

## B. Customer Account

```text
Login
Profile
My Trips
Bookings
Payment History
Wishlist
Saved Travelers
Documents
Reviews
Support
```

## C. Admin / Operations Portal

```text
Admin Dashboard
Destinations
Packages
Departures
Hotels
Activities
Bookings
Payments
Customers
Leads
Coupons
Reviews
Content
Media
Vendors
Reports
Users / Roles
Settings
Audit Logs
```

---

# 7. Public Route Architecture

```text
/

/destinations
/destinations/:slug

/packages
/packages/:slug

/group-trips
/domestic
/international
/honeymoon
/family
/adventure
/weekend-getaways
/corporate

/hotels
/hotels/:slug

/activities
/activities/:slug

/offers
/offers/:slug

/customize-trip

/search

/checkout/:bookingSessionId
/booking/success/:bookingId
/booking/failure

/blog
/blog/:slug

/about
/contact
/faq

/login
/register
/forgot-password

/account
/account/profile
/account/trips
/account/bookings/:bookingId
/account/wishlist
/account/travelers
/account/documents
/account/payments
/account/support
```

---

# 8. Homepage — Card-Heavy UX

The homepage should be highly visual.

Avoid large empty hero areas.

The screen should give users something interactive or clickable every few hundred pixels.

---

# 9. Header

Desktop navigation:

```text
VSR Travel Logo

Destinations
Packages
Group Trips
International
Domestic
Honeymoon
More ▾

Search
Wishlist
Login / Profile
```

Secondary CTA:

```text
Plan My Trip
```

Mobile header:

```text
☰    VSR Travel    ♡   Profile
```

Keep the mobile header compact.

---

# 10. Hero Section

Hero should use either:

1. A high-quality destination image/video background, OR
2. A destination card collage / bento composition.

Recommended hero:

```text
Explore More. Plan Less.

Discover curated trips, group departures,
dream stays and custom holidays.

[ Search destination, trip, theme... ]
```

Below/inside hero provide category tabs:

```text
Holiday Packages
Group Trips
Hotels
Activities
Custom Trip
```

Do not attempt live flights in MVP unless a flight supplier API is available.

---

# 11. Hero Search Card

Large floating search card.

Desktop:

```text
┌───────────────────────────────────────────────────────────────────┐
│ Packages | Group Trips | Hotels | Activities                     │
├───────────────────────────────────────────────────────────────────┤
│ Destination │ Travel Date │ Travelers │ Budget │ [Search Trips]  │
└───────────────────────────────────────────────────────────────────┘
```

Mobile:

Each input stacks vertically inside a rounded sheet/card.

Provide suggested searches:

```text
Goa
Bali
Vietnam
Kashmir
Dubai
Thailand
Manali
Maldives
```

---

# 12. Homepage Card Sections

The homepage should contain many card modules.

Recommended sequence:

```text
Hero
↓
Quick Trip Categories
↓
Trending Destinations
↓
Limited-Time Offers
↓
Upcoming Group Departures
↓
International Favorites
↓
Explore India
↓
Travel by Theme
↓
Best for Couples
↓
Weekend Escapes
↓
Adventure & Treks
↓
Custom Trip CTA
↓
Why Travel With VSR
↓
Traveler Stories / Reels
↓
Reviews
↓
Blog / Travel Guides
↓
Newsletter / Lead CTA
↓
Footer
```

Sections may be reordered through CMS later.

---

# 13. Quick Category Cards

Use compact icon/image cards.

Examples:

```text
Group Trips
Honeymoon
Family
Adventure
Beach
Mountains
Weekend
International
Luxury
Budget
```

Desktop:

```text
5–8 visible cards
```

Mobile:

```text
horizontal snap scrolling
```

Each category card includes:

```text
Icon / image
Title
Optional count
```

---

# 14. Destination Cards

Card example:

```text
┌──────────────────────────────┐
│                              │
│       Destination Image      │
│                              │
│  TRENDING                    │
│  Bali, Indonesia             │
│  From ₹32,999                │
│  24 packages                 │
└──────────────────────────────┘
```

Hover/press:

- Subtle image zoom
- Save button
- Explore CTA

Use 16:10 / 4:5 imagery depending on section.

---

# 15. Package Cards

This is the primary reusable product card.

```text
┌────────────────────────────────────┐
│ Image                    ♡         │
│ GROUP TRIP                         │
│                                    │
│ Amazing Vietnam Escape             │
│ 6 Nights • 7 Days                  │
│ Hanoi • Da Nang • Ho Chi Minh      │
│                                    │
│ ★ 4.8   140 travelers              │
│                                    │
│ 4 departures available             │
│                                    │
│ From                               │
│ ₹42,999 / person                   │
│                                    │
│ [View Trip]                        │
└────────────────────────────────────┘
```

Possible badges:

```text
Trending
Best Seller
Early Bird
New
Almost Full
Couple Favorite
Limited Seats
```

---

# 16. Group Departure Cards

Show real date urgency clearly.

```text
Vietnam New Year Escape

28 Dec – 4 Jan
7D / 6N
Delhi Departure

12 seats left

₹54,999
₹49,999 Early Bird

[View Departure]
```

Optional visual progress:

```text
18 / 30 seats booked
```

Do not fabricate scarcity from client-side code in production.

---

# 17. Offer Cards

Use colorful promo cards.

Examples:

```text
Summer Escape
Up to ₹5,000 OFF
Code: SUMMER5K
```

```text
International Group Trips
Early-bird savings
Book before 30 Sep
```

Offer card fields:

- Campaign image/background
- Heading
- Description
- Code
- Expiry
- Terms link
- CTA

---

# 18. Bento Destination Section

Use a bento grid on desktop.

Example:

```text
┌───────────────────────┬───────────────┐
│                       │   Dubai       │
│      Bali             ├───────────────┤
│                       │   Vietnam     │
├───────────┬───────────┴───────────────┤
│ Kashmir   │       Maldives            │
└───────────┴───────────────────────────┘
```

On mobile convert this to normal image cards or horizontal scroll.

Do not force an oversized desktop bento grid into a mobile viewport.

---

# 19. Theme Cards

Travel theme section:

```text
Beaches
Mountains
Nightlife
Adventure
Culture
Luxury
Romantic
Family
Nature
Wildlife
Wellness
Food
```

Each theme can open filtered package listing.

---

# 20. Video / Reel Cards

Support short destination videos.

Card:

```text
[ Vertical Video Thumbnail ]

Bali in 30 seconds
Watch story
```

Requirements:

- Lazy load
- Poster image
- Muted autoplay only when appropriate
- `playsInline`
- Pause when out of viewport
- Respect reduced-motion preference
- Do not autoplay ten videos simultaneously
- WebView-safe fallbacks

Recommended implementation:

- Show thumbnail/poster by default
- Play after explicit tap on mobile
- Desktop may autoplay muted card on hover/viewport if performance permits

---

# 21. Trust Cards

Examples:

```text
24/7 Trip Support
Expert-curated itineraries
Secure Payments
Transparent Pricing
Verified Travel Partners
Customizable Packages
```

Compact icon cards, not long paragraphs.

---

# 22. Review Cards

```text
★★★★★

"Our Vietnam trip was beautifully planned..."

— Ananya
Vietnam • Apr 2026

[traveler image]
```

Optional:

- Photo/video reviews
- Verified booking badge
- Package link

---

# 23. Package Listing Page

Route:

```text
/packages
```

Desktop:

```text
Filters Sidebar │ Results
```

Mobile:

```text
Sticky Search
Sort | Filters
Package Card
Package Card
Package Card
```

---

# 24. Package Filters

Support:

```text
Destination
Country
Region
Budget
Duration
Travel month
Theme
Trip type
Group / private
Rating
Departure city
Inclusions
Hotel category
Activity level
```

Price slider:

```text
₹10,000 — ₹2,00,000+
```

Duration:

```text
1–3 days
4–6 days
7–9 days
10+ days
```

---

# 25. Package Listing Card — Desktop

Use horizontal card option:

```text
┌───────────────┬────────────────────────────────────────────┐
│               │ Vietnam Discovery                 ♡       │
│     IMAGE     │ 7D / 6N                                   │
│               │ Hanoi • Da Nang • Ho Chi Minh             │
│               │                                            │
│               │ ✓ Hotels ✓ Breakfast ✓ Transfers          │
│               │                                            │
│               │ ★ 4.8            From ₹42,999             │
│               │                    [View Details]          │
└───────────────┴────────────────────────────────────────────┘
```

Mobile switches to vertical card.

---

# 26. Search Results UX

Search header:

```text
Vietnam
12 Oct – 19 Oct
2 Travelers

[Edit Search]
```

Sorting:

```text
Recommended
Price Low–High
Price High–Low
Duration
Rating
Popular
```

Provide active filter chips.

---

# 27. Destination Detail Page

Route:

```text
/destinations/:slug
```

Structure:

```text
Hero Gallery
Destination Overview
Quick Facts
Best Time to Visit
Top Packages
Things To Do
Places To Visit
Popular Areas
Suggested Duration
Travel Themes
FAQ
Travel Guides
Similar Destinations
```

Use cards throughout.

---

# 28. Destination Hero

Use image collage:

```text
┌────────────────────────┬───────────┐
│                        │ Image 2   │
│       Main Image       ├───────────┤
│                        │ Image 3   │
└────────────────────────┴───────────┘
```

Overlay:

```text
Bali
Indonesia

Tropical beaches • Culture • Adventure
```

Mobile uses one large hero with gallery button.

---

# 29. Package Detail Page

Route:

```text
/packages/:slug
```

This is one of the most important pages.

---

# 30. Package Detail Layout

Desktop:

```text
┌───────────────────────────────────────────────┬───────────────┐
│ Package content                               │ Booking Card  │
│                                               │ Sticky        │
│ Hero                                          │               │
│ Highlights                                    │               │
│ Itinerary                                     │               │
│ Hotels                                        │               │
│ Inclusions                                    │               │
│ Exclusions                                    │               │
│ Policies                                      │               │
│ Reviews                                       │               │
└───────────────────────────────────────────────┴───────────────┘
```

Mobile:

Sticky bottom CTA:

```text
From ₹42,999        [Book / Enquire]
```

---

# 31. Package Detail Hero

Include:

```text
Image gallery
Package badge
Wishlist
Share
Title
Destination
Duration
Rating
Review count
Group/private type
Next departure
```

Example:

```text
Vietnam Discovery

7 Days / 6 Nights
Hanoi • Da Nang • Ho Chi Minh

★ 4.8 (128 reviews)

Next departure:
12 October 2026
```

---

# 32. Package Summary Cards

Compact cards:

```text
Duration
7D / 6N

Group Size
Up to 24

Hotels
4 Star

Meals
6 Breakfasts

Transfers
Included

Activities
8 Included
```

---

# 33. Highlights Card Row

Examples:

```text
Ha Long Bay Cruise
Ba Na Hills
Hoi An Old Town
Cu Chi Tunnels
Mekong Delta
```

Each should be image + title card.

---

# 34. Itinerary UI

Use day-by-day expandable cards.

```text
Day 1
Arrival in Hanoi

Airport pickup
Hotel check-in
Old Quarter evening walk
Welcome dinner
```

Collapsed:

```text
DAY 1 • Hanoi Arrival
▾
```

Expanded:

- Timeline
- Activities
- Meals
- Hotel
- Transfers
- Optional extras

---

# 35. Hotel Cards Inside Package

```text
Hotel Example
★★★★

Hanoi
2 Nights

Deluxe Room
Breakfast included

[View Hotel]
```

Provide fallback:

```text
or similar category hotel
```

when exact inventory is not guaranteed.

---

# 36. Inclusion / Exclusion Cards

Use icons.

Included:

```text
Hotels
Breakfast
Airport transfers
Sightseeing
Tour coordinator
Selected entry tickets
```

Excluded:

```text
Flights unless stated
Visa
Personal expenses
Tips
Optional activities
```

---

# 37. Departure Calendar

For group trips.

```text
October 2026

12 Oct
₹42,999
14 seats

26 Oct
₹44,999
8 seats

November 2026

09 Nov
₹41,999
Available
```

Selecting a departure updates the booking card.

---

# 38. Sticky Booking Card

Desktop:

```text
From ₹42,999 / person

Departure
[12 Oct 2026 ▾]

Travelers
[2 Adults ▾]

Package Option
[Standard ▾]

Subtotal   ₹85,998
Taxes       ₹4,300

[Continue Booking]

or

[Customize This Trip]
```

All final prices must be recalculated on the server.

---

# 39. Customize Trip Flow

Route:

```text
/customize-trip
```

Multi-step card wizard.

## Step 1

```text
Where do you want to go?
```

## Step 2

```text
Travel dates
Flexible dates?
Duration
```

## Step 3

```text
Travelers
Adults
Children
Infants
```

## Step 4

```text
Approximate budget per person
```

## Step 5

```text
Trip style

Relaxed
Balanced
Packed
Luxury
Adventure
Romantic
Family
```

## Step 6

```text
Hotel category
3★
4★
5★
Luxury
```

## Step 7

```text
Contact information
```

Submit creates a **Travel Lead**.

---

# 40. Lead Funnel

States:

```text
New
Contacted
RequirementsCollected
QuotePreparing
QuoteSent
Negotiation
Converted
Lost
```

Admin can assign lead to travel consultant.

Store:

- Source
- Destination
- Dates
- Budget
- Travelers
- Notes
- Assigned consultant
- Follow-up date

---

# 41. Group Trips

Route:

```text
/group-trips
```

Dedicated visual page.

Sections:

```text
Upcoming Departures
International Groups
India Groups
Weekend Groups
Adventure Groups
Young Travelers
Festive Trips
```

Use date-led cards.

---

# 42. Hotels Module

MVP can use manually curated hotel inventory attached to packages.

Future version supports supplier APIs.

Routes:

```text
/hotels
/hotels/:slug
```

Hotel card:

```text
[image]

The Lagoon Resort
★★★★

Bali • Seminyak
8.7 Excellent

Pool • Breakfast • Wi‑Fi

₹8,200 / night
[View Stay]
```

---

# 43. Standalone Hotel Search — Phase 2

Fields:

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
Star category
Guest rating
Amenities
Property type
Meal plan
Cancellation
Area
```

If no live supplier integration exists, keep standalone hotel booking behind a feature flag.

Do not pretend curated/static hotel content is live global hotel inventory.

---

# 44. Activities / Experiences

Routes:

```text
/activities
/activities/:slug
```

Cards:

```text
Desert Safari
Dubai

4 hours
Pickup included
★ 4.9

₹3,499 / person
```

Categories:

```text
Adventure
Sightseeing
Water Sports
Culture
Food
Nightlife
Wellness
Theme Parks
Cruises
```

---

# 45. Cabs / Transfers

Architecture-ready module:

```text
Airport Transfer
Private Cab
Intercity Transfer
Local Sightseeing
```

For MVP these can be package add-ons.

Standalone booking can be Phase 2.

---

# 46. Flights — Integration-Ready Module

Do not build a fake flight inventory engine and call it live booking.

Create abstraction:

```text
IFlightSearchProvider
IFlightBookingProvider
IFlightOrderProvider
```

Possible future flow:

```text
React Search
   ↓
.NET Flights Module
   ↓
Supplier Adapter
   ↓
Flight Supplier API
```

Store booking snapshot and provider references in SQL Server.

Flight module should be switchable via feature flag.

---

# 47. Booking Checkout

Route:

```text
/checkout/:bookingSessionId
```

Checkout steps:

```text
1. Review Trip
2. Travelers
3. Add-ons
4. Contact Details
5. Coupon
6. Payment
7. Confirmation
```

Use stepper on desktop.

Use compact progress indicator on mobile.

---

# 48. Booking Review Card

Display:

```text
Package
Destination
Departure
Duration
Travelers
Room choice
Add-ons
Cancellation terms
Price
Taxes
Discount
Total
```

Final totals come from backend.

---

# 49. Traveler Details

Fields:

```text
Title
First name
Last name
Gender
Date of birth
Nationality
Passport number
Passport expiry
```

Passport fields only when relevant.

Allow:

```text
Save traveler for future trips
```

---

# 50. Add-on Cards

Examples:

```text
Travel Insurance
Airport Pickup
Visa Assistance
Extra Activities
Room Upgrade
Private Transfer
Meal Upgrade
```

Each add-on must clearly show:

```text
Price
Per person / per booking
Included details
```

---

# 51. Coupon UI

```text
Have a coupon?

[VSR500________] [Apply]
```

Offer eligible coupons as mini cards.

Backend validates:

- Active
- Start/end dates
- Product eligibility
- Minimum spend
- Per-user limit
- Global limit
- Discount cap

---

# 52. Payment Architecture

Frontend never decides final booking success.

Flow:

```text
Create booking session
      ↓
Backend recalculates amount
      ↓
Create payment order
      ↓
Payment gateway
      ↓
Gateway confirmation/webhook
      ↓
Backend verifies
      ↓
Confirm booking
```

Support payment states:

```text
Created
Pending
Authorized
Paid
Failed
Cancelled
RefundPending
Refunded
PartiallyRefunded
```

Payment endpoints must be idempotent.

---

# 53. Booking Statuses

```text
Draft
Held
PendingPayment
Confirmed
PartiallyConfirmed
Cancelled
Completed
RefundPending
Refunded
```

Group trip seat holds should expire.

Example:

```text
Held
→ Payment within 15 minutes
→ Confirmed

or

Held
→ Timeout
→ Released
```

Hold period should be configurable.

---

# 54. Pricing Snapshot

Never derive historical booking price from today's package configuration.

At booking time store a snapshot:

```text
BasePrice
TravelerCount
RoomSupplement
AddOns
Taxes
Fees
Discount
Coupon
Total
Currency
PricingVersion
```

This keeps old bookings financially auditable.

---

# 55. My Trips

Route:

```text
/account/trips
```

Cards:

```text
Upcoming
Completed
Cancelled
```

Trip card:

```text
Vietnam Discovery
12–18 Oct 2026

CONFIRMED

2 Travelers
Booking VSR-TR-10429

₹89,500

[View Trip]
```

---

# 56. Booking Detail / Trip Hub

Route:

```text
/account/bookings/:bookingId
```

Tabs/cards:

```text
Overview
Itinerary
Travelers
Payments
Documents
Support
Policies
```

Quick cards:

```text
Booking Status
Amount Paid
Balance Due
Next Payment
Trip Coordinator
Emergency Support
```

---

# 57. Wishlist

Users can save:

```text
Packages
Destinations
Hotels
Activities
```

Use heart buttons on cards.

For anonymous users optionally persist IDs in local storage and merge after login.

---

# 58. Authentication

Routes:

```text
/login
/register
/forgot-password
```

Support:

```text
Email + Password
Phone OTP later
Google login later
```

Backend:

```text
JWT access token
Refresh token
```

Admin and customer authorization must be separate by permissions.

---

# 59. Customer Profile

Store:

```text
Name
Email
Phone
Country
Date of birth
Preferred departure city
Travel preferences
Saved travelers
Emergency contact
```

Do not require unnecessary personal data before booking.

---

# 60. Support Experience

Public floating help button.

Options:

```text
Plan My Trip
Existing Booking
Payment Help
Visa Help
General Question
```

User-account support:

```text
Create ticket
Chat/WhatsApp link if configured
Call request
Email
```

---

# 61. Blog / Travel Guides

Routes:

```text
/blog
/blog/:slug
```

Card-heavy blog grid.

Categories:

```text
Destination Guides
Visa
Budget Tips
Honeymoon
Adventure
Food
Travel Planning
```

Use CMS-managed content.

---

# 62. SEO Architecture

Each public destination/package/blog page must support:

```text
Slug
Meta title
Meta description
Canonical URL
Open Graph image
Structured metadata
Index/noindex control
```

Use proper semantic HTML.

Generate sitemap through backend/build pipeline as appropriate.

---

# 63. React Frontend Folder Structure

```text
frontend/vsr-travel-web/
│
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── config/
│   │   └── store/
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── videos/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── cards/
│   │   ├── carousel/
│   │   ├── forms/
│   │   ├── search/
│   │   ├── media/
│   │   ├── checkout/
│   │   ├── feedback/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── destinations/
│   │   ├── packages/
│   │   ├── departures/
│   │   ├── hotels/
│   │   ├── activities/
│   │   ├── search/
│   │   ├── booking/
│   │   ├── payments/
│   │   ├── wishlist/
│   │   ├── account/
│   │   ├── reviews/
│   │   ├── leads/
│   │   ├── blog/
│   │   └── admin/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── money/
│   │   ├── dates/
│   │   ├── analytics/
│   │   └── utils/
│   │
│   ├── services/
│   ├── types/
│   ├── constants/
│   ├── main.tsx
│   └── App.tsx
│
├── public/
│   ├── images/
│   └── videos/
│
├── package.json
└── vite.config.ts
```

---

# 64. Frontend Feature Structure

Example:

```text
features/packages/
│
├── api/
│   ├── package.api.ts
│   └── package.keys.ts
│
├── components/
│   ├── PackageCard.tsx
│   ├── PackageHorizontalCard.tsx
│   ├── PackageFilters.tsx
│   ├── PackageHero.tsx
│   ├── PackageGallery.tsx
│   ├── ItineraryDayCard.tsx
│   ├── DepartureCard.tsx
│   └── BookingSummaryCard.tsx
│
├── pages/
│   ├── PackageListPage.tsx
│   └── PackageDetailsPage.tsx
│
├── hooks/
├── schemas/
├── types/
└── utils/
```

---

# 65. Reusable Card Library

Because this product must use **more UI cards**, create a dedicated card component family.

```text
DestinationCard
DestinationMiniCard
PackageCard
PackageHorizontalCard
GroupDepartureCard
HotelCard
ActivityCard
OfferCard
ThemeCard
CategoryCard
TrustCard
ReviewCard
VideoStoryCard
BlogCard
GuideCard
AddOnCard
TravelerCard
BookingCard
TripCard
PaymentCard
PriceBreakdownCard
StatCard
AdminMetricCard
LeadCard
ItineraryDayCard
InclusionCard
PolicyCard
SupportCard
```

Do not build each card from scratch on every page.

---

# 66. Card Design Rules

Common card properties:

```text
rounded-xl / rounded-2xl
clean border
subtle shadow
image first
clear badges
strong hierarchy
minimal text
touch-friendly CTA
```

Desktop hover:

```text
slight lift
image scale 1.02–1.05
shadow change
```

Mobile:

- No hover dependency
- Active/tap feedback
- No tiny action icons

---

# 67. Responsive Card Grids

Desktop:

```text
grid-cols-4
```

Medium desktop:

```text
grid-cols-3
```

Tablet:

```text
grid-cols-2
```

Mobile:

```text
grid-cols-1
```

For discovery sections, prefer:

```text
horizontal overflow
scroll snap
```

to show part of the next card and encourage exploration.

---

# 68. Backend Solution Structure

```text
backend/
│
├── VSR.Travel.Api/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Authorization/
│   ├── Extensions/
│   ├── Filters/
│   ├── Program.cs
│   └── appsettings.json
│
├── VSR.Travel.Application/
│   ├── Common/
│   ├── Auth/
│   ├── Destinations/
│   ├── Packages/
│   ├── Departures/
│   ├── Hotels/
│   ├── Activities/
│   ├── Search/
│   ├── Pricing/
│   ├── Bookings/
│   ├── Payments/
│   ├── Customers/
│   ├── Reviews/
│   ├── Leads/
│   ├── Cms/
│   ├── Reports/
│   └── Admin/
│
├── VSR.Travel.Domain/
│   ├── Entities/
│   ├── Enums/
│   ├── ValueObjects/
│   ├── Events/
│   └── Exceptions/
│
├── VSR.Travel.Infrastructure/
│   ├── Persistence/
│   ├── Authentication/
│   ├── Payments/
│   ├── Storage/
│   ├── Email/
│   ├── Messaging/
│   ├── Suppliers/
│   ├── Search/
│   └── Caching/
│
└── VSR.Travel.Tests/
```

---

# 69. Backend Module Boundaries

```text
Identity
Customers
Travel Catalog
Destinations
Packages
Departures
Inventory
Hotels
Activities
Search
Pricing
Bookings
Payments
Coupons
Reviews
Wishlist
Leads
Content
Notifications
Support
Admin
Reports
Audit
```

Keep these as modules inside one API/database first.

---

# 70. Core Domain Entities

```text
User
Role
Permission
RefreshToken

Customer
Traveler
CustomerPreference

Destination
DestinationImage
DestinationTag

TravelPackage
PackageImage
PackageDestination
PackageTheme
PackageHighlight
PackageInclusion
PackageExclusion
PackagePolicy

PackageItineraryDay
ItineraryActivity

Departure
DepartureInventory
PackagePriceOption

Hotel
HotelImage
HotelAmenity

Activity
ActivityImage

Booking
BookingTraveler
BookingItem
BookingPriceSnapshot
BookingAddOn

Payment
Refund

Coupon
CouponRedemption

WishlistItem

Review
ReviewMedia

TravelLead
LeadActivity

BlogPost
BlogCategory

SupportTicket

MediaAsset

Notification

AuditLog
```

---

# 71. SQL Server Database Tables

Recommended core tables:

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens

Customers
Travelers
CustomerPreferences

Destinations
DestinationImages
DestinationTags

Packages
PackageImages
PackageDestinations
PackageThemes
PackageHighlights
PackageInclusions
PackageExclusions
PackagePolicies

PackageItineraryDays
ItineraryActivities

Departures
DepartureInventory
PackagePriceOptions

Hotels
HotelImages
HotelAmenities
HotelAmenityLinks

Activities
ActivityImages

Bookings
BookingTravelers
BookingItems
BookingPriceSnapshots
BookingAddOns

Payments
Refunds

Coupons
CouponProductRules
CouponRedemptions

WishlistItems

Reviews
ReviewMedia

TravelLeads
LeadActivities

BlogPosts
BlogCategories

SupportTickets
SupportMessages

MediaAssets
Notifications
AuditLogs

SiteSections
SiteBanners
SiteSettings
```

---

# 72. Destination Table

```text
Id
Name
Slug
Country
Region
ShortDescription
Description
HeroImageUrl
Latitude
Longitude
BestTimeToVisit
RecommendedDays
IsFeatured
IsActive
SeoTitle
SeoDescription
CreatedAt
UpdatedAt
```

Index:

```text
Slug UNIQUE
Country
IsFeatured
IsActive
```

---

# 73. Packages Table

```text
Id
Code
Name
Slug
ShortDescription
Description
TripType
DurationDays
DurationNights
MinTravelers
MaxTravelers
BasePrice
Currency
HotelCategory
DifficultyLevel
IsCustomizable
IsGroupTrip
IsFeatured
Status
SeoTitle
SeoDescription
CreatedAt
UpdatedAt
RowVersion
```

Use:

```text
decimal(18,2)
```

for money.

---

# 74. Departures Table

```text
Id
PackageId
DepartureCode
StartDate
EndDate
DepartureCity
Capacity
SeatsHeld
SeatsConfirmed
BasePrice
SalePrice
Status
BookingCutoff
CreatedAt
UpdatedAt
RowVersion
```

Statuses:

```text
Draft
Open
AlmostFull
SoldOut
Closed
Cancelled
Completed
```

---

# 75. Booking Table

```text
Id
BookingNumber
CustomerId
PackageId
DepartureId
Status
BookingChannel
Currency
Subtotal
TaxAmount
DiscountAmount
TotalAmount
PaidAmount
BalanceAmount
CouponId
HoldExpiresAt
SpecialRequests
CreatedAt
UpdatedAt
RowVersion
```

Booking number example:

```text
VSR-TR-2026-001429
```

---

# 76. Booking Price Snapshot

```text
Id
BookingId
BasePrice
TravelerCount
RoomSupplement
AddOnAmount
TaxAmount
FeeAmount
DiscountAmount
CouponDiscount
TotalAmount
Currency
PricingJson
CreatedAt
```

This is intentionally immutable after booking confirmation except via controlled adjustment records.

---

# 77. Travel Lead Table

```text
Id
CustomerId
Name
Email
Phone
DestinationText
StartDate
EndDate
FlexibleDates
Adults
Children
BudgetMin
BudgetMax
TripStyle
HotelCategory
Status
AssignedToUserId
Source
Notes
NextFollowUpAt
CreatedAt
UpdatedAt
```

---

# 78. Database Relationship Overview

```text
Destination
    └── Packages
          ├── Package Images
          ├── Itinerary Days
          ├── Inclusions
          ├── Exclusions
          ├── Policies
          ├── Price Options
          └── Departures
                │
                └── Booking
                      ├── Travelers
                      ├── Add-ons
                      ├── Price Snapshot
                      ├── Payments
                      └── Refunds
```

---

# 79. Booking Concurrency

Two users may attempt to book the last seats simultaneously.

Do not rely on:

```text
React shows "2 seats left"
```

as authoritative.

Backend transaction:

```text
Begin transaction

Read departure with concurrency control
Check remaining seats
Create seat hold
Update held seat count
Create booking

Commit
```

Use optimistic concurrency or an appropriate atomic update strategy.

Return:

```text
409 Conflict
```

if capacity changed.

---

# 80. Seat Inventory Formula

Conceptually:

```text
AvailableSeats =
Capacity
- ConfirmedSeats
- ActiveHeldSeats
```

Expired holds must be released.

This can be:

- Background job
- Lazy cleanup during inventory query
- Both

---

# 81. Package Pricing

Backend calculates:

```text
Base package
× traveler count
+ room supplements
+ child/infant pricing
+ departure surcharge
+ add-ons
+ taxes
+ service fees
- campaign discount
- coupon discount
= total
```

React displays server pricing.

Do not trust totals posted from the browser.

---

# 82. API Base

```text
/api/v1
```

---

# 83. Public API Endpoints

```text
GET  /api/v1/home
GET  /api/v1/search
GET  /api/v1/destinations
GET  /api/v1/destinations/{slug}

GET  /api/v1/packages
GET  /api/v1/packages/{slug}
GET  /api/v1/packages/{id}/departures
GET  /api/v1/packages/{id}/pricing

GET  /api/v1/group-trips
GET  /api/v1/offers

GET  /api/v1/hotels
GET  /api/v1/hotels/{slug}

GET  /api/v1/activities
GET  /api/v1/activities/{slug}

GET  /api/v1/blog
GET  /api/v1/blog/{slug}

GET  /api/v1/reviews
```

---

# 84. Authentication APIs

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

---

# 85. Booking APIs

```text
POST /api/v1/booking-sessions
GET  /api/v1/booking-sessions/{id}
PUT  /api/v1/booking-sessions/{id}/travelers
PUT  /api/v1/booking-sessions/{id}/addons
POST /api/v1/booking-sessions/{id}/coupon
DELETE /api/v1/booking-sessions/{id}/coupon

POST /api/v1/bookings
GET  /api/v1/bookings/{id}
POST /api/v1/bookings/{id}/cancel
```

---

# 86. Payment APIs

```text
POST /api/v1/bookings/{id}/payment-order
POST /api/v1/payments/verify
POST /api/v1/payments/webhook
GET  /api/v1/bookings/{id}/payments
POST /api/v1/payments/{id}/refund
```

Webhook endpoints require provider-specific verification.

---

# 87. Account APIs

```text
GET  /api/v1/me
PUT  /api/v1/me

GET  /api/v1/me/bookings
GET  /api/v1/me/wishlist

POST   /api/v1/me/wishlist
DELETE /api/v1/me/wishlist/{id}

GET  /api/v1/me/travelers
POST /api/v1/me/travelers
PUT  /api/v1/me/travelers/{id}
```

---

# 88. Lead API

```text
POST /api/v1/leads
GET  /api/v1/admin/leads
GET  /api/v1/admin/leads/{id}
PATCH /api/v1/admin/leads/{id}/status
POST /api/v1/admin/leads/{id}/activities
```

---

# 89. Admin Routes

```text
/admin

/admin/destinations
/admin/destinations/new
/admin/destinations/:id

/admin/packages
/admin/packages/new
/admin/packages/:id

/admin/departures
/admin/bookings
/admin/payments
/admin/customers
/admin/leads
/admin/coupons
/admin/reviews
/admin/content
/admin/media
/admin/blog
/admin/users
/admin/roles
/admin/reports
/admin/settings
/admin/audit
```

---

# 90. Admin Dashboard

Metric cards:

```text
Bookings Today
Revenue Today
Upcoming Travelers
Pending Payments
New Leads
Lead Conversion
Active Departures
Low Seat Inventory
Refund Requests
```

Charts:

```text
Booking trend
Revenue trend
Booking source
Top destinations
Top packages
Lead funnel
```

---

# 91. Package Admin Builder

Use tabbed/cards-based editor.

```text
Basic Info
Destinations
Media
Pricing
Departures
Itinerary
Hotels
Inclusions
Exclusions
Policies
SEO
Publishing
```

Allow draft preview.

---

# 92. Itinerary Admin Builder

Drag-and-drop day order optional.

Each day card:

```text
Day Number
Title
Description
City
Hotel
Meals
Activities
Transfer
Media
```

---

# 93. CMS / Homepage Management

Do not hardcode all homepage content forever.

Create CMS-ready configuration:

```text
SiteSections
SiteBanners
```

Homepage section types:

```text
Hero
CategoryCarousel
DestinationGrid
PackageCarousel
DepartureCarousel
OfferCarousel
ThemeGrid
VideoStories
Reviews
Blog
CTA
```

Admin can later:

```text
Enable/disable
Change order
Edit heading
Choose linked items
```

---

# 94. Media Architecture

Development:

```text
/public/images
/public/videos
```

Production:

Use object storage/CDN.

Database stores metadata:

```text
Id
StorageKey
Url
MediaType
AltText
Width
Height
Duration
CreatedAt
```

---

# 95. Image Sources for Development

Use royalty-free development/placeholder assets from reputable stock libraries and verify license terms before production use.

Useful discovery pages:

```text
https://www.pexels.com/search/travel/
https://www.pexels.com/search/bali/
https://www.pexels.com/search/maldives/
https://www.pexels.com/search/mountains/
https://www.pexels.com/search/hotel/
https://unsplash.com/s/photos/travel
https://unsplash.com/s/photos/bali
https://unsplash.com/s/photos/vietnam
https://unsplash.com/s/photos/kashmir
```

Recommended:

1. Download the selected files.
2. Rename them predictably.
3. Commit only optimized demo images.
4. Later upload production assets to object storage/CDN.

Example:

```text
/public/images/destinations/bali-hero.webp
/public/images/destinations/vietnam-card.webp
/public/images/packages/vietnam-group-01.webp
/public/images/packages/kashmir-escape.webp
```

Do not hotlink every production image from external stock sites.

---

# 96. Video Sources / Handling

For demo destination videos, source appropriately licensed footage and host compressed versions locally or via CDN.

Example development folders:

```text
/public/videos/bali-hero.mp4
/public/videos/vietnam-story.mp4
```

Use:

```html
<video
  muted
  playsInline
  loop
  preload="metadata"
  poster="/images/video-posters/bali.webp"
/>
```

Mobile/WebView:

- Prefer click-to-play cards
- Use poster images
- Do not rely on autoplay
- Pause when not visible
- Keep clips short and compressed

---

# 97. Responsive UI

Support:

```text
320px → 2560px
```

Breakpoints should be content-driven.

Test at minimum:

```text
320
360
375
390
412
430
768
1024
1280
1440
1920
```

---

# 98. Mobile/WebView Requirements

Mandatory:

- Android WebView
- iOS WKWebView
- Chrome Android
- Safari iOS
- Samsung Internet

Rules:

- No hover-only controls
- 44×44 px minimum important targets
- Safe-area support
- Keyboard-aware forms
- Avoid fixed CTA overlap
- Use `100dvh` / `100svh` carefully
- Fallback for viewport quirks
- `playsInline` for videos
- Limit blur/backdrop effects
- Do not use massive DOM carousels
- Avoid layout shifts
- Make forms easy to complete one-handed

Safe-area example:

```css
padding-bottom: env(safe-area-inset-bottom);
```

---

# 99. Mobile Bottom Navigation

For app-like logged-in experience:

```text
Home
Explore
Trips
Wishlist
Account
```

For pure public website mode, bottom navigation may be hidden until PWA/WebView mode.

Design it so it can be feature-flagged.

---

# 100. Mobile Filter UX

Never show a 300px desktop sidebar on mobile.

Use bottom sheet:

```text
[Filters]

Destination
Budget
Duration
Theme
Date
Trip Type

[Clear]        [Show 42 Trips]
```

Sort is a separate sheet.

---

# 101. Mobile Package Detail

Recommended order:

```text
Hero
Title
Rating
Price
Quick Facts
Highlights
Departure picker
Itinerary
Hotels
Inclusions
Policies
Reviews
Related Trips
```

Sticky bottom bar:

```text
₹42,999 / person     [Book Now]
```

Account for:

```text
safe-area-inset-bottom
```

---

# 102. Loading States

Every section should have skeletons.

Examples:

```text
DestinationCardSkeleton
PackageCardSkeleton
DepartureCardSkeleton
ReviewCardSkeleton
BookingSummarySkeleton
```

Do not show blank sections.

---

# 103. Empty States

Examples:

```text
No trips match these filters.
[Clear Filters]
```

```text
Your wishlist is empty.
[Explore Trips]
```

```text
No upcoming trips yet.
[Plan a Trip]
```

---

# 104. Error UX

Normalize backend errors.

Use:

- Inline errors for forms
- Toast for simple action failures
- Error state for full pages
- Retry buttons

Do not expose raw backend exception text.

---

# 105. API Error Standard

Use RFC-style Problem Details / consistent structure.

Example:

```json
{
  "type": "booking_inventory_conflict",
  "title": "Seats are no longer available",
  "status": 409,
  "detail": "The selected departure has only 1 seat remaining."
}
```

---

# 106. Authentication Security

Use:

```text
HTTPS
Short-lived access token
Refresh token rotation
Secure token storage strategy
Password hashing
Permission authorization
Login throttling
Email verification-ready architecture
```

In WebView, evaluate secure cookie/native token bridge strategy based on final host application.

Do not store sensitive secrets in frontend.

---

# 107. Authorization

Customer permissions:

```text
booking.view_own
booking.cancel_own
review.create
wishlist.manage
profile.manage
```

Admin permissions:

```text
package.view
package.create
package.update
package.publish

departure.manage

booking.view
booking.update
booking.cancel

payment.view
payment.refund

lead.view
lead.assign
lead.update

customer.view

content.manage
coupon.manage
review.moderate

report.view
user.manage
settings.manage
```

Backend is authoritative.

---

# 108. Search Architecture

MVP:

SQL Server-based filtering/search.

Use indexed fields and normalized tags.

Searchable:

```text
Destination
Country
Package name
Theme
Trip type
Departure city
```

Later, if scale requires:

```text
Azure AI Search / Elasticsearch / OpenSearch
```

Do not add a search cluster before needed.

---

# 109. SQL Index Strategy

Examples:

```text
Destinations(Slug) UNIQUE
Destinations(Country, IsActive)

Packages(Slug) UNIQUE
Packages(Status, IsFeatured)
Packages(IsGroupTrip, Status)

PackageDestinations(DestinationId, PackageId)

Departures(PackageId, StartDate, Status)
Departures(StartDate, Status)

Bookings(CustomerId, CreatedAt)
Bookings(BookingNumber) UNIQUE
Bookings(DepartureId, Status)

Payments(BookingId, Status)

TravelLeads(Status, AssignedToUserId)
TravelLeads(NextFollowUpAt)

Reviews(PackageId, Status)
```

Tune indexes against actual queries.

---

# 110. Transactions

Use SQL transactions for:

```text
Seat hold
Booking creation
Payment confirmation
Booking confirmation
Cancellation
Refund initiation record
Inventory release
```

Example:

```text
BEGIN

Validate departure
Reserve seats
Create booking
Create price snapshot
Create audit entry

COMMIT
```

---

# 111. Idempotency

Required for:

```text
Create payment order
Confirm payment
Webhook handling
Booking confirmation
Refund requests
```

Avoid duplicate bookings/payments caused by retries.

---

# 112. Audit Logging

Track administrative/financial actions.

```text
Package published
Price changed
Departure capacity changed
Booking cancelled
Payment verified
Refund requested
Coupon changed
Lead reassigned
User permission changed
```

Fields:

```text
UserId
Action
EntityType
EntityId
OldValues
NewValues
Timestamp
RequestId
```

---

# 113. Notifications

Customer:

```text
Booking confirmation
Payment confirmation
Upcoming payment
Trip reminder
Document reminder
Departure update
Cancellation/refund update
```

Admin:

```text
New booking
New custom-trip lead
Payment failure
Low departure inventory
New review
Refund request
```

Phase 1 may use email only.

Architecture should support:

```text
Email
SMS
WhatsApp
Push
In-app
```

---

# 114. Background Jobs

Useful jobs:

```text
Release expired seat holds
Send trip reminders
Send payment reminders
Recalculate cached metrics
Process notification outbox
Generate reports
Retry provider synchronization
```

Do not put long-running work inside HTTP requests.

---

# 115. External Supplier Abstractions

Keep interfaces behind Infrastructure.

```csharp
IHotelSupplier
IFlightSupplier
IActivitySupplier
ITransferSupplier
IPaymentGateway
IEmailSender
ISmsSender
IWhatsAppSender
IFileStorage
```

Application/domain code must not know provider-specific details.

---

# 116. Admin Booking Operations

Admins should be able to:

```text
View booking
Update traveler details
Add internal notes
Record offline payment
Apply authorized adjustment
Cancel booking
Request refund
Resend confirmation
Upload documents
Assign consultant/coordinator
View audit trail
```

High-risk actions require confirmation.

---

# 117. Lead Management UI

Kanban option:

```text
New
Contacted
Quote
Negotiation
Converted
Lost
```

Lead card:

```text
Ananya Sharma

Bali
4 Travelers
₹40k–₹60k pp

Travel: Nov 2026

Follow-up today
Assigned: Rahul
```

Also provide table view.

---

# 118. Analytics / Reports

Admin reports:

```text
Bookings
Revenue
Payments
Refunds
Lead conversion
Package performance
Destination performance
Departure occupancy
Coupon performance
Customer repeat rate
Booking source
```

Dashboard filters:

```text
Today
7 Days
30 Days
Quarter
Year
Custom
```

---

# 119. Recommended Seed Data

Seed enough content so the site looks genuinely full.

Destinations:

```text
Goa
Kashmir
Manali
Ladakh
Kerala
Meghalaya
Rajasthan
Andaman

Bali
Vietnam
Thailand
Dubai
Maldives
Sri Lanka
Singapore
Japan
Georgia
Kazakhstan
```

Themes:

```text
Group Trip
Honeymoon
Family
Adventure
Beach
Mountains
Culture
Luxury
Budget
Weekend
```

Create at least:

```text
18 destinations
36 packages
24 upcoming departures
12 hotels
20 activities
12 offers
20 reviews
8 blog posts
```

Do not use lorem ipsum.

---

# 120. Demo Package Examples

```text
Vietnam Discovery
7D / 6N
From ₹42,999

Bali Island Escape
6D / 5N
From ₹37,999

Kashmir Valley Getaway
5D / 4N
From ₹24,999

Ladakh Road Adventure
7D / 6N
From ₹29,999

Dubai City & Desert
5D / 4N
From ₹44,999

Thailand Full Moon Escape
6D / 5N
From ₹39,999

Maldives Couple Retreat
5D / 4N
From ₹64,999
```

These are UI seed examples, not live market prices.

Mark demo data appropriately in non-production environments.

---

# 121. Design Direction

Visual identity should be:

```text
Energetic
Premium
Young
Trustworthy
Image-led
Modern
Fast
Card-heavy
Conversion-focused
```

Avoid:

```text
generic corporate dashboard look
huge blocks of text
too much blank space
tiny typography
overly dark pages everywhere
duplicating another site's exact visual identity
```

---

# 122. Suggested Color Approach

Create a unique VSR Travel palette.

Example strategy:

```text
Primary: vibrant travel blue / indigo
Accent: coral / orange
Success: green
Surface: warm white
Text: deep navy
```

Do not copy Tripgix colors exactly.

Use design tokens:

```text
--primary
--secondary
--accent
--surface
--surface-muted
--text
--text-muted
--success
--warning
--danger
```

---

# 123. Typography

Use one modern, highly readable family.

Examples:

```text
Inter
Manrope
Plus Jakarta Sans
DM Sans
```

Keep card titles strongly legible.

Avoid excessive font variation.

---

# 124. Animation

Use Framer Motion sparingly.

Good:

```text
section reveal
card hover
carousel transitions
modal/sheet
wishlist feedback
filter chip transition
```

Avoid:

```text
long page intro
forced scroll animation
constant floating elements
heavy parallax on mobile
```

Respect:

```text
prefers-reduced-motion
```

---

# 125. Performance

Targets:

```text
Fast first paint
No major layout shift
Responsive interactions
Optimized images
Lazy-loaded video
Paginated results
Code-split routes
```

Use:

```text
WebP / AVIF
responsive image sizes
lazy loading below fold
dynamic imports
query caching
prefetch package detail where useful
```

Avoid rendering 100 package cards at once.

---

# 126. Accessibility

Minimum:

```text
Semantic elements
Keyboard navigation
Visible focus
Accessible dialogs
Alt text
Form labels
Error associations
Sufficient contrast
Touch targets
Reduced motion
```

Carousels must remain usable without mouse hover.

---

# 127. Environment Variables

Frontend:

```text
VITE_API_BASE_URL
VITE_APP_ENV
VITE_MAPS_KEY
VITE_ANALYTICS_ID
```

Backend:

```text
ConnectionStrings__TravelDb
Jwt__Key
Jwt__Issuer
Jwt__Audience
Storage__Connection
Payment__Key
Payment__Secret
Email__ApiKey
Sms__ApiKey
```

Do not commit production secrets.

---

# 128. Local Development

Suggested:

```text
React
http://localhost:5173

ASP.NET Core
https://localhost:7001

SQL Server
localhost
```

Frontend:

```text
VITE_API_BASE_URL=https://localhost:7001/api/v1
```

Configure CORS for development only.

---

# 129. Deployment

Simple production:

```text
                 Internet
                    │
                   HTTPS
                    │
          ┌─────────┴──────────┐
          │                    │
      React Static          /api/*
      Hosting                 │
                              ▼
                        ASP.NET Core
                              │
                              ▼
                          SQL Server
```

Preferred single domain:

```text
https://travel.vsrsystems.com
https://travel.vsrsystems.com/api
```

Later add:

```text
CDN
WAF
Object storage
Redis
Background worker
```

---

# 130. MVP Scope

Build this first:

## Public

- Home
- Search
- Destinations
- Package listing
- Package details
- Group departures
- Customize-trip form
- Offers
- Reviews
- Blog basic
- Contact

## User

- Register/login
- Wishlist
- Booking checkout
- Payment-ready abstraction
- Booking confirmation
- My Trips
- Booking detail

## Admin

- Dashboard
- Destinations CRUD
- Packages CRUD
- Departures CRUD
- Bookings
- Customers
- Leads
- Coupons
- Reviews
- Basic CMS
- Reports

## Backend

- Auth
- Catalog
- Pricing
- Seat inventory
- Bookings
- Payments abstraction
- Leads
- Admin
- Audit

---

# 131. Phase 2

```text
Live hotels API
Live flight API
Standalone activities booking
Standalone transfers
Visa workflows
Insurance integration
WhatsApp automation
Refund automation
PWA offline shell
Real-time notifications
Advanced CRM
Recommendation engine
Dynamic packaging
```

---

# 132. Phase 3

```text
B2B travel-agent portal
Supplier portal
Multi-currency settlement
Wallet/credits
Loyalty
Dynamic pricing
Travel memberships
Affiliate system
Mobile native apps
AI trip planner
```

---

# 133. AI Features — Future

Keep AI isolated.

Possible:

```text
"Plan a 6-day Vietnam trip under ₹50,000"
```

AI can help:

- Destination recommendation
- Package recommendation
- Itinerary drafts
- Travel FAQ
- Lead qualification
- Customer support summaries

AI must not silently invent live availability or prices.

Final availability and price come from platform/provider data.

---

# 134. Critical End-to-End Flow A — Curated Package

```text
Home
→ Destination Search
→ Package Listing
→ Package Detail
→ Select Departure
→ Travelers
→ Backend Price Quote
→ Seat Hold
→ Checkout
→ Payment
→ Payment Verification
→ Booking Confirmed
→ My Trips
```

This is the most important workflow.

---

# 135. Critical Flow B — Custom Trip

```text
Home
→ Plan My Trip
→ Destination
→ Dates
→ Travelers
→ Budget
→ Preferences
→ Contact
→ Lead Created
→ Admin Lead Queue
→ Consultant Assigned
→ Quote
→ Convert to Booking
```

---

# 136. Critical Flow C — Group Departure Inventory

```text
Admin creates departure
→ Capacity = 24

Customer selects 4 seats
→ Temporary hold
→ Available seats reduce

Payment succeeds
→ Hold becomes confirmed

Payment expires
→ Hold releases
→ Seats return
```

---

# 137. Critical Flow D — Admin Content

```text
Admin creates destination
→ uploads images
→ creates package
→ builds itinerary
→ creates departures
→ publishes package
→ package appears on public site
```

---

# 138. Coding Agent Build Order

Do not generate every file randomly.

## Step 1 — Foundation

```text
Create React Vite app
Create .NET solution
Configure SQL Server
Configure EF Core
Configure API client
Configure shared error shape
```

## Step 2 — Design System

```text
Header
Footer
Buttons
Inputs
Sheets
Dialogs
Cards
Badges
Carousel
Skeleton
Toast
```

## Step 3 — Public Home

Build card-heavy homepage using seeded API data.

## Step 4 — Catalog

```text
Destinations
Packages
Search
Filters
Detail pages
```

## Step 5 — Departures & Pricing

```text
Departure selector
Server pricing
Seat availability
```

## Step 6 — Authentication

```text
Register
Login
JWT
Refresh token
Route protection
```

## Step 7 — Booking

```text
Booking session
Travelers
Add-ons
Coupon
Seat hold
Price snapshot
```

## Step 8 — Payment Abstraction

Use development payment simulator if a real provider is not configured.

Clearly label it as development-only.

## Step 9 — Account

```text
My Trips
Booking details
Wishlist
Profile
```

## Step 10 — Leads

```text
Custom trip form
Lead admin
```

## Step 11 — Admin

```text
Destination CRUD
Package CRUD
Departure CRUD
Bookings
Coupons
Reviews
CMS
```

## Step 12 — Mobile/WebView

Complete all small-screen adaptations.

## Step 13 — Quality

```text
frontend build
backend build
tests
EF migrations
seed
mobile checks
```

---

# 139. Development Payment Simulator

If no payment gateway is configured, create:

```text
DevelopmentPaymentGateway
```

Options:

```text
Simulate Success
Simulate Failure
```

This must be available only in development/test environment.

Never deploy a fake payment success path as production payment logic.

---

# 140. Coding Agent Master Prompt

Copy this file into the project root as:

```text
TRAVEL_ARCHITECTURE.md
```

Then send the coding agent:

```text
Build the complete VSR Travel booking platform described in TRAVEL_ARCHITECTURE.md.

The stack is fixed:

Frontend:
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Zustand
- Framer Motion

Backend:
- ASP.NET Core Web API
- C#
- Entity Framework Core
- Clean Architecture principles
- Modular monolith
- JWT + refresh tokens
- Permission-based authorization

Database:
- Microsoft SQL Server

The UX must be highly visual and card-heavy. Use reusable DestinationCard, PackageCard, GroupDepartureCard, OfferCard, ThemeCard, ReviewCard, VideoStoryCard, HotelCard, ActivityCard, TripCard and other card components described in the architecture.

Do not copy Tripgix or another travel company's exact UI, branding, text, images, logo, CSS or source code. Create an original VSR Travel UI using modern travel marketplace UX patterns.

Implement real frontend-to-backend flows. Do not leave the application as static mock screens.

The first critical end-to-end flow is:

Home
→ Search
→ Package Listing
→ Package Detail
→ Select Departure
→ Server Pricing
→ Seat Hold
→ Checkout
→ Traveler Details
→ Payment
→ Booking Confirmation
→ My Trips.

Also implement:

Custom Trip
→ Lead Creation
→ Admin Lead Management.

All authoritative pricing, coupon validation, seat availability and booking state changes must happen in the .NET backend.

Use SQL Server through EF Core migrations.

Implement package and departure inventory with concurrency protection.

Store immutable booking price snapshots.

Payment confirmation must be idempotent.

Use a development-only payment simulator until a real payment provider is configured.

Create realistic seeded travel data so the UI looks complete.

Build a responsive design that works smoothly on:
- desktop
- laptop
- tablet
- mobile browsers
- Android WebView
- iOS WKWebView

Use mobile cards and sheets instead of forcing desktop tables/sidebars into small screens.

Videos must use posters, playsInline, lazy loading and mobile-safe behavior.

Do not stop after scaffolding.

At the end:
1. Run the frontend production build.
2. Run the ASP.NET Core build.
3. Run tests.
4. Apply/check EF Core migrations.
5. Seed the development database.
6. Fix TypeScript errors.
7. Fix C# errors.
8. Fix hydration/runtime errors.
9. Fix mobile overflow.
10. Verify the complete package booking flow.
```

---

# 141. Definition of Done — Public Site

- [ ] Card-heavy homepage completed
- [ ] Hero search works
- [ ] Destination cards work
- [ ] Package cards work
- [ ] Offer cards work
- [ ] Group departure cards work
- [ ] Theme cards work
- [ ] Review cards work
- [ ] Video story cards work
- [ ] Destination listing works
- [ ] Destination detail works
- [ ] Package listing works
- [ ] Package filters work
- [ ] Package detail works
- [ ] Departure selection works
- [ ] Itinerary cards work
- [ ] Custom trip form works
- [ ] Blog basic experience works

---

# 142. Definition of Done — Booking

- [ ] Backend creates price quote
- [ ] Backend validates departure inventory
- [ ] Seat hold works
- [ ] Expired hold can release
- [ ] Traveler form works
- [ ] Add-ons work
- [ ] Coupon validation works
- [ ] Final price calculated server-side
- [ ] Payment order flow exists
- [ ] Development payment simulator works only outside production
- [ ] Payment verification is idempotent
- [ ] Booking confirmation works
- [ ] Price snapshot is stored
- [ ] My Trips shows booking
- [ ] Booking detail works

---

# 143. Definition of Done — Admin

- [ ] Admin authentication
- [ ] Admin dashboard
- [ ] Destination CRUD
- [ ] Package CRUD
- [ ] Package media
- [ ] Itinerary editor
- [ ] Departure CRUD
- [ ] Seat inventory view
- [ ] Booking management
- [ ] Customer view
- [ ] Lead management
- [ ] Coupon CRUD
- [ ] Review moderation
- [ ] Basic homepage CMS
- [ ] Reports overview
- [ ] Audit logs

---

# 144. Definition of Done — Engineering

- [ ] React production build succeeds
- [ ] .NET build succeeds
- [ ] EF migrations work
- [ ] SQL seed works
- [ ] No TypeScript errors
- [ ] No unhandled API errors
- [ ] No console-breaking browser errors
- [ ] Controllers remain thin
- [ ] Domain/application business rules are backend-side
- [ ] Money uses decimal
- [ ] Booking concurrency handled
- [ ] Payment endpoints idempotent
- [ ] Critical operations transactional
- [ ] Secrets excluded from repository

---

# 145. Definition of Done — Mobile/WebView

- [ ] 320px works
- [ ] 360px works
- [ ] 375px works
- [ ] 390px works
- [ ] 430px works
- [ ] Tablet works
- [ ] No page-level horizontal overflow
- [ ] Desktop filters become mobile sheets
- [ ] Card carousels are touch-friendly
- [ ] Booking bottom CTA respects safe area
- [ ] Virtual keyboard does not hide required inputs/actions
- [ ] Video cards work with posters
- [ ] No hover-only interaction
- [ ] Modals/sheets fit small screens
- [ ] Checkout works in WebView
- [ ] Login works in WebView

---

# 146. Final Product Benchmark

The completed application should feel like:

```text
A real consumer travel marketplace,
not a generic CRUD application.
```

The product should emphasize:

```text
Beautiful discovery
Lots of high-quality cards
Easy exploration
Clear package details
Trust
Fast mobile interaction
Simple booking
Strong visual hierarchy
Reliable backend pricing/inventory
Easy administration
```

The main implementation priority is:

```text
DISCOVER
   ↓
COMPARE
   ↓
SELECT
   ↓
BOOK
   ↓
PAY
   ↓
TRAVEL
```

while keeping VSR Travel's UI, brand, code and content original.
