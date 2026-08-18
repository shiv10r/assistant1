# VSR Systems — Work Backlog

> Concrete pending tasks. Every item names the files/entities/endpoints to build and what "done" looks like.
> Source of truth for section numbers: `docs/services/VSR_Home_Services_Full_Fledged_Product_Architecture.md`.

---

## 1. Home Services Marketplace (NEXT BIG MODULE)

Architecture doc: `docs/services/VSR_Home_Services_Full_Fledged_Product_Architecture.md` (4060 lines, sections 0–171).
Frontend UI already exists (static, fixture-driven) in `frontend/src/services/home-services/` — reuse it, no rewrite.

### 1a. Database (PostgreSQL) — "data base part"
- [ ] Create EF Core migration `AddHomeServicesModule` for all tables in §161a (column-level schemas already written).
  Tables to create (60+): `Users, Roles, UserRoles, Permissions, RolePermissions, Customers, CustomerAddresses,
  Professionals, ProfessionalDocuments, ProfessionalSkills, ProfessionalServiceAreas, ProfessionalAvailabilities,
  ProfessionalTimeOff, ProfessionalPerformance, ServiceCategories, Services, ServiceProblems, ServicePackages,
  ServiceAddOns, ServicePackageAddOns, ServiceWarranties, Cities, Zones, Localities, Pincodes, ServiceAreas,
  ServiceAreaServices, PriceRules, PriceQuotes, QuoteRevisions, Bookings, BookingItems, BookingAddOns,
  BookingMaterials, BookingAssignments, BookingStatusHistory, BookingNotes, RecurringBookings, AMCContracts,
  Payments, Refunds, CreditTransactions, CommissionRules, ProfessionalEarnings, Payouts, ProfessionalAdjustments,
  ProfessionalIncentives, Coupons, CouponRedemptions, Referrals, MembershipPlans, CustomerMemberships, Reviews,
  ReviewMedia, Conversations, Messages, SupportTickets, Disputes, Notifications, CMSPages, Banners, FAQs, AuditLogs`.
- [ ] §171 extras: `Payments` add `gateway_provider, gateway_order_id, gateway_payment_id, gateway_signature, webhook_verified`;
      new tables `PaymentGatewayWebhookEvents`, `PaymentGatewaySettings` (secrets stored in config, never plaintext DB).
- [ ] Money columns = `decimal(18,2)`; `BookingStatusHistory.metadata` + `AuditLogs.before/after` + `MembershipPlans.benefits`
      + `Notifications.payload` = `jsonb`; `id` = `uuid`; soft-delete `deleted_at` where entity can be archived (§161a note).
- [ ] Seed data per §152: 5 cities (Delhi/Gurugram/Noida/Ghaziabad/Faridabad §153), 30+ localities/city, 20+ categories,
      100+ services, 200+ packages, 80+ add-ons, 150 professionals, 500 customers, 500 bookings, 200 reviews,
      30 coupons, multiple membership plans.

### 1b. Backend (.NET — VSRSystemsBackend, branch develop03)
- [ ] Domain entities in `VSRSystemsBackend.Domain/HomeServices/` (§164 exact file list):
      `ServiceCategory, Service, ServiceProblem, ServicePackage, ServiceAddOn, ServiceWarranty, City, Zone, Locality,
      Pincode, ServiceArea, Professional, ProfessionalDocument, ProfessionalSkill, ProfessionalServiceArea,
      ProfessionalAvailability, ProfessionalTimeOff, ProfessionalPerformance, Booking, BookingItem, BookingAddOn,
      BookingMaterial, BookingAssignment, BookingStatusHistory, BookingNote, RecurringBooking, AmcContract,
      PriceRule, PriceQuote, QuoteRevision, Payment, Refund, CreditTransaction, CommissionRule, ProfessionalEarning,
      Payout, ProfessionalAdjustment, ProfessionalIncentive, Coupon, CouponRedemption, Referral, MembershipPlan,
      CustomerMembership, Review, ReviewMedia, SupportTicket, Dispute`.
- [ ] Application layer `VSRSystemsBackend.Application/HomeServices/`:
      DTOs (`ServiceCatalogDtos, ProfessionalDtos, BookingDtos, PriceQuoteDtos, PaymentDtos, EarningsDtos,
      AnalyticsDtos, ReviewDtos, SupportDtos`), interfaces `IHomeServicesRepository` + `IHomeServicesService`,
      services `ServiceCatalogService, BookingService, PriceQuoteService, AssignmentService, PaymentService,
      EarningsService, PayoutService, AnalyticsService, ReviewService`.
- [ ] Infrastructure: `Repositories/HomeServices/` one file per aggregate; grouped configs
      `HomeServicesCatalogConfiguration.cs / HomeServicesBookingConfiguration.cs / HomeServicesFinanceConfiguration.cs`
      (mirror Warehouse pattern); add one `DbSet<T>` per entity to `AppDbContext.cs`.
- [ ] Api controllers (§164): `HomeServiceCategoriesController, HomeServiceAreasController,
      HomeServiceProfessionalsController, HomeServiceBookingsController, HomeServicePaymentsController,
      HomeServiceEarningsController, HomeServiceAnalyticsController, HomeServiceReviewsController,
      HomeServiceSupportController`.
- [ ] Conventions (§163, match Warehouse exactly): FluentValidation on all Create/Update DTOs, AutoMapper profiles,
      uniform `ApiResponse<T>` envelope (success/data/error/pagination), role-based auth per action
      (customer/professional/ops/finance/admin), one migration per module, `AddScoped<,>()` registration block in Program.cs.
- [ ] Business rules enforced server-side (§123): unavailable-slot blocking, no overlapping provider bookings (§124),
      server-only price quotes (React never authoritative for pricing/availability/status/refund/commission/earnings/payout §159),
      full `BookingStatusHistory` + `AuditLogs` on every state change, no silently-unassigned bookings.
- [ ] Analytics endpoints (§161): `/admin/analytics/summary` + `bookings-trend, revenue-trend, top-categories,
      top-services, top-cities, assignment-success, cancellation-reasons, customer-repeat-rate, provider-performance,
      refund-dispute-rate` — all server-aggregated, never client-computed.
- [ ] Earnings & finance APIs (§162): customer `wallet, invoices/{bookingId}, refunds`; professional
      `earnings, earnings/summary, payouts, incentives`; admin `finance/commissions, payouts, payouts/{id}/mark-paid,
      refunds, revenue-report?from=&to= (CSV export)`.
- [ ] Razorpay payment gateway (§171): `POST /home-services/payments/create-order`, signature-verified webhook handler
      storing every payload in `PaymentGatewayWebhookEvents`, server-side payment status poll, refund via gateway API;
      never trust client-reported payment success.

### 1c. Frontend (React — VSRSystemsFrontend, branch develop01)
- [ ] New `frontend/src/services/home-services/homeServicesApi.ts` — fetch client for every endpoint in §120–§122/§161/§162.
- [ ] `homeServicesStore.ts`: keep as UI/cache state but hydrate from `homeServicesApi.ts` (localStorage only for UI prefs/persona).
- [ ] `homeServicesData.ts`: demote to typed fallback/seed used only on API failure (offline/dev mode).
- [ ] `HomeServicesShell.tsx`: add "Analytics" entry to `ADMIN_NAV` (icon `MdInsights`).
- [ ] New `pages/admin/AdminAnalytics.tsx` — full §161 chart suite (Bookings Trend, Revenue Trend, Top Categories/Services/
      Cities, Assignment Success, Cancellation Reasons, Repeat Rate, Provider Performance, Refund/Dispute Rate).
- [ ] `pages/admin/AdminDashboard.tsx` → bind KPI cards to `/admin/analytics/summary`.
- [ ] `pages/admin/AdminFinance.tsx` → bind commission rules + payouts + refunds + revenue CSV export to §162 endpoints;
      add gateway settings panel (write-only secrets).
- [ ] `pages/admin/AdminBookings.tsx` → `/admin/bookings`; `AdminProfessionals.tsx` → `/admin/professionals`;
      `AdminLiveOps.tsx` → `/admin/live` (column model §99).
- [ ] Pro pages → `/professional/*`: `ProEarnings.tsx` (§162 earnings/payouts + trend chart), `ProDashboard.tsx`
      (requests + performance mini-KPI), `ProJobs/ProJobDetail/ProRequests/ProProfile` (bookings, requests, profile, verification).
- [ ] Customer pages → `/categories, /services, /search, /serviceability`: `Home, Categories, CategoryDetail,
      ServiceDetail, Search`; `BookingFlow.tsx` → POST `/price-quotes` then `/bookings` (server price-authoritative);
      `Bookings/BookingDetail` (status history), `Offers` (coupons/memberships), `Account` (`/auth/me, /addresses, /customer/wallet`).
- [ ] Add `recharts` to `frontend/package.json`; use `ResponsiveContainer` (mobile-card layout rules §147, breakpoints §147,
      WebView requirements §148, loading skeletons §149, empty states §150, error handling §151).
- [ ] Add single route in `App.tsx`: `/home-services/admin/analytics`.
- [ ] Follow existing data-fetching pattern (plain fetch + useState/useEffect — no react-query/SWR, matches other wired services).

### 1d. Home Services — verification
- [ ] End-to-end: customer create account → address → find service → package → slot → correct price → book → pay → get
      professional → track → start → approve extra work → finish → invoice → review → rebook (§160 Definition of Done).
- [ ] Professional: register → verified → configure services/areas/availability → receive request → accept → complete →
      earning → payout record (§160).
- [ ] Ops: live board, assign/reassign, no-show handling, disputes, refunds, provider availability, revenue/commission (§160).

---

## 2. Jobs Scraper — backend DONE, remaining follow-ups

Backend port complete on `origin/develop03` (commits `e614b6b`, `2bfbb5e`):
`JobsScraperService`, `JobsScraperSeedData`, `IJobsScraperService`, `JobsScraperController`, `JobsScraperScheduler` (30s),
8 repositories (persistence fixed), `AddHttpClient<IJobsScraperService, JobsScraperService>`, hosted service registered.
- [ ] EF migration instead of `EnsureCreatedAsync` so scraper tables/columns (`JobSources, RawExternalJobs, ScrapeRuns,
      JobSourceMappings`, etc.) appear on an existing database (today they only appear on a fresh DB).
- [ ] `JobsScraperService.ScheduleNextRun` is a documented no-op — add `NextRunAt` to `JobSource` (with migration) if
      real interval-based scheduling is wanted instead of interval evaluation.
- [ ] Verify scraper live: run scheduler, confirm sources seed, fetch + normalize works against real fixture/feed URLs,
      dedup by `CanonicalFingerprint`, stale-close, source auto-pause at 5 failures.
- [ ] Frontend: connect VSR Jobs app to the new scraper APIs (admin dashboard: runs, logs, duplicates, raw jobs) per
      `VSR_Jobs_AI_Job_Portal_Scraper_Architecture` (user instruction #3).

---

## 3. TODO.md carry-overs (backend connections for built frontend slices)

- [ ] VSR News → ASP.NET Core API + data model: auth, search, editorial workflow; replace `newsData.ts` fixtures with
      live RSS/API aggregation, attribution, duplicate detection, editorial review.
- [ ] VSR Jobs → ASP.NET Core API + data model: profiles, resumes, applications, recruiter workflows, administration.
- [ ] VSR Commerce → ASP.NET Core API + data model: catalog, cart, checkout, orders, payments, inventory.
- [ ] VSR Bank → ASP.NET Core API + data model: identity, KYC, accounts, ledger, transfers, cards, deposits, loans, audit.
- [ ] VSR Medical → ASP.NET Core API + data model: patients, doctors, appointments, encounters, prescriptions, labs,
      billing, audit.

---

## 4. Cross-cutting refactor (user-requested, from TODO.md)

- [ ] Remove duplicated/used-twice services across the three apps; put common services in a separate shared folder.
- [ ] Reduce total file count — consolidate what belongs in single files.
- [ ] Make app industry-grade + interview-ready (4-yr senior React): advanced patterns (memoization, custom hooks,
      code splitting, error boundaries, TypeScript strictness), standardize repeated UI (shared card components).
- [ ] Remove dashboard/analytics/activity from Assistant section; remove "insights" from Business, News, Hotel, Jobs,
      Travel apps (duplicate features across the three apps).
- [ ] Customize assistant context + suggested actions separately for Interiors, Warehouse, School (not identical prompts).
- [ ] Rearrange folders + docs/MD files like a real repository.

---

## 5. Housekeeping (always active)

- [ ] Frontend: push to `origin/develop01`, then auto-raise + squash-merge PR `develop01` → `luxinfra-frontend`
      (GitHub API via `git credential fill`; skip if "No commits between").
- [ ] Backend: push to `origin/develop03`.
- [ ] Commit both branches whenever the active todo/task list is done (or after ~2h major chunk) — no tiny-step commits.
- [ ] Never commit `.omo/run-continuation/*`; work only inside frontend/backend folders on D: drive.