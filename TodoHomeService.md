# HomeService - Complete Task List

## Phase 0: Quick Verification UI (IMMEDIATE - This Week)
- [ ] Create "Database Check" page in frontend to verify Supabase connection and show table counts
- [ ] Create "Add Category" form → POST /api/home-services/categories → verify in Supabase Table Editor
- [ ] Create "Add Service" form with category dropdown → POST /api/home-services/services
- [ ] Create "Add Professional" form with KYC fields → POST /api/home-services/professionals
- [ ] Create "Create Booking" wizard form → POST /api/home-services/bookings/price-quotes → /bookings
- [ ] Create "Admin Dashboard" page showing real-time table counts from Supabase

**Data Location:** All new data goes to **Supabase (PostgreSQL)** - connected via `db.qfgozadjsucuoxrxrknc.supabase.co`. No local database.

---

## Phase 1: Authentication & Authorization (Critical)
- [ ] JWT Auth Middleware - Add `AddAuthentication` + `AddJwtBearer` in Program.cs
- [ ] Role-based policies - `Customer`, `Professional`, `Admin` policies
- [ ] Current user accessor - `ICurrentUserService` with userId, roles, claims
- [ ] Authorize attributes on all controllers (`[Authorize]`, `[Authorize(Roles="Professional")]`)
- [ ] Frontend auth - Login/register pages, token storage, auto-refresh, protected routes

---

## Phase 2: Remove Static/Seeded Data - Real Data Only
- [ ] Remove HomeServicesSeedData.cs from production (only run in Development)
- [ ] Customer profiles - Real registration, profile management, addresses
- [ ] Professional onboarding - KYC verification flow (Aadhaar/PAN upload, bank details)
- [ ] Service catalog - Admin CRUD for categories, services, packages, add-ons, problems
- [ ] Location management - Admin CRUD for cities, zones, localities, pincodes, service areas
- [ ] Professional verification - KYC status, document review, approval/rejection workflow

---

## Phase 3: Booking Flow - End-to-End Real
- [ ] Price quote - Real pricing engine (base + add-ons + platform fee + tax + discounts)
- [ ] Booking creation - Real-time availability check, professional assignment logic
- [ ] Assignment engine - Auto-assign based on location, skills, rating, workload
- [ ] Status workflow - `Created → Confirmed → Assigned → OnTheWay → InService → Completed`
- [ ] Reschedule/cancel - With reason tracking, refund rules
- [ ] Customer notifications - Real-time status updates (SignalR)

---

## Phase 4: Real-time & Communication
- [ ] SignalR hub - Booking status, chat, notifications
- [ ] Customer-Pro chat - In-app messaging for booking coordination
- [ ] Push notifications - Firebase/OneSignal for mobile/web
- [ ] Email/SMS - Booking confirmations, reminders, OTP

---

## Phase 5: Payments - Real Integration
- [ ] Razorpay/Stripe integration - Real payment gateway
- [ ] Payment webhooks - Handle success/failure/refund callbacks
- [ ] Wallet system - Customer wallet, professional earnings, platform commission
- [ ] Payouts - Auto/Manual payout to professional bank accounts
- [ ] Invoices/Receipts - PDF generation, GST compliance

---

## Phase 6: Reviews, Disputes, Support
- [ ] Review system - Post-completion rating + comment, professional response
- [ ] Dispute workflow - Customer raises → Admin mediates → Resolution
- [ ] Support tickets - Customer/Pro can raise, Admin assigns/responds
- [ ] Admin dashboard - Live board, analytics, user management, verification queue

---

## Phase 7: Frontend - Replace Mock Data
- [ ] Replace homeServicesData.ts static data with API calls
- [ ] React Query/TanStack Query - Caching, invalidation, optimistic updates
- [ ] Auth context - Login state, role-based UI
- [ ] Real-time UI - SignalR integration for live booking status
- [ ] Professional dashboard - Earnings, schedule, availability management
- [ ] Admin panel - User management, verification, analytics, live board

---

## Phase 8: Professional Features
- [ ] Availability calendar - Weekly recurring + date overrides
- [ ] Earnings dashboard - Daily/weekly/monthly, payout history
- [ ] Job management - Accept/reject, start/complete, navigation
- [ ] Profile management - Skills, service areas, documents, bank details
- [ ] Verification status - KYC progress, document upload

---

## Phase 9: Admin Panel
- [ ] User management - Customers, Professionals, Admins
- [ ] Verification queue - KYC review, approve/reject
- [ ] Live board - Real-time booking map, professional tracking
- [ ] Analytics - Revenue, bookings, ratings, assignments, cancellations
- [ ] Content management - Categories, services, locations, banners, FAQs

---

## Phase 10: Infrastructure & Deployment
- [ ] File storage - Supabase Storage / S3 for documents, images
- [ ] Background jobs - Hangfire for payouts, reminders, cleanup
- [ ] Caching - Redis for sessions, catalog, availability
- [ ] Logging/Monitoring - Serilog + Seq/Datadog, health checks
- [ ] CI/CD - GitHub Actions for build, test, deploy to Render

---

## 🎯 **Immediate Next Steps (This Week - Priority Order)**

| Priority | Task | Effort | Status |
|----------|------|--------|--------|
| 1 | Add JWT Auth + Role policies | 4h | 🔴 Not Started |
| 2 | Create "Database Check" UI page | 2h | 🔴 Not Started |
| 3 | Create "Add Category" form (POST /categories) | 2h | 🔴 Not Started |
| 4 | Create "Add Service" form | 2h | 🔴 Not Started |
| 5 | Create "Add Professional" form with KYC | 4h | 🔴 Not Started |
| 6 | Add SignalR hub + Frontend connection | 6h | 🔴 Not Started |
| 7 | Professional KYC/Verification API | 8h | 🔴 Not Started |
| 8 | Real payment webhook (Razorpay test) | 6h | 🔴 Not Started |
| 9 | Frontend: Replace mock data with React Query | 8h | 🔴 Not Started |
| 10 | Professional KYC/Verification API | 8h | 🔴 Not Started |

---

## 📍 **Data Location Clarification**
- **All new data → Supabase (PostgreSQL)**
- **Host:** `db.qfgozadjsucuoxrxrknc.supabase.co`
- **Database:** `postgres`
- **Tables:** 200+ tables already created via migrations
- **No local database** - everything goes to Supabase cloud
- **Verify in:** Supabase Dashboard → Table Editor → See real-time row counts