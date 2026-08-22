# HomeService - Complete Task List

> **Source of truth:** `docs/services/VSR_Home_Services_Full_Product_Architecture_Refactored.md`
> Implementation follows §158 order within Phase 1 (§155) scope. Backend module ~80% built already
> (catalog/bookings/payments/professionals/analytics/reviews/support controllers+repos+services exist).
> Gaps are tracked below.

## 🚨 EXECUTION PLAN (Refactored Architecture — In Progress)

| # | Task (§ref) | Layer | Status |
|---|-------------|-------|--------|
| 1 | JWT auth: `/api/auth/register`, `/login`, `/me`, roles customer/admin/professional (§120, §113) | Backend | ✅ Done |
| 2 | Verify auth locally (build + run + curl register/login/me) | Backend | ✅ Done |
| 3 | Push backend → Render deploy | Backend | ✅ Done (develop03) |
| 4 | Frontend: attach Bearer token in homeServicesApi request(); wire register/login flows (§165.2) | Frontend | ✅ Done |
| 5 | Replace static SERVICE_CATEGORIES on Home/Categories pages with API data + loading/error states (§0, §165.1-2) | Frontend | 🔴 In Progress |
| 6 | Verify frontend build locally, push → Netlify | Frontend | 🔴 Pending |
| 7 | Customer addresses API + UI (`/addresses`) (§46, §166.1) | Full-stack | ⏸️ Next batch |
| 8 | Booking wizard wired to real quote→booking→payment APIs end-to-end (§167.7) | Full-stack | ⏸️ Next batch |
| 9 | Pro onboarding/verification/availability screens wired (§168.1) | Full-stack | ⏸️ Next batch |
| 10 | Admin catalog CRUD UI (categories/services/packages/add-ons/problems) (§169.8) | Full-stack | ⏸️ Next batch |
| 11 | Razorpay real checkout + webhook verification (§171) | Backend+Frontend | ⏸️ Next batch |
| 12 | Admin analytics charts via recharts (§161) | Frontend | ⏸️ Backlog |
| 13 | Remaining admin control-plane screens (§169.12–169.23) | Full-stack | ⏸️ Backlog |

---

## 🚨 URGENT BUGFIXES (Cloud Deployment Broken) - Priority Order

**Diagnosed live against Render (2026-08-22):**
- ✅ CONFIRMED WORKING: Render ↔ Supabase connection (GET /categories returns data; test rows exist in DB)
- ✅ FIXED: JSON casing mismatch — backend serializes PascalCase (`{"Success":...}` due to `PropertyNamingPolicy = null` in Program.cs), frontend `homeServicesApi.ts` reads camelCase (`envelope.success`) → EVERY response failed client-side, real error messages hidden as generic "Request failed with status 400"
- ✅ FIXED: Swagger now enabled in all environments (`/swagger`)
- 🔴 BUG B: `/api/auth/register` returns **404** — no AuthController exists in .NET backend yet (Task #1 above fixes this)
- ⚪ NOTE: Duplicate-slug POSTs correctly return HTTP 400 from backend ("A category with slug 'plumbing' already exists") — not a bug

| Priority | Task | Status |
|----------|------|--------|
| P0 | Remove `PropertyNamingPolicy = null` in Program.cs so responses are camelCase | ✅ Done (commit c359d33) |
| P1 | Enable Swagger UI in all environments (test home-services API on Render too) | ✅ Done (commit c359d33) |
| P0 | Verify locally: build + run + curl GET/POST categories (camelCase envelope + proper error messages) | ✅ Verified — GET 200 camelCase, dup-slug 400 readable msg, create 201, /swagger 200 |
| P0 | Commit + push backend → Render auto-deploy → re-verify live | 🟡 Pushed to `develop03` (c359d33) — awaiting Render deploy + live check |
| P2 | Implement AuthController (`/api/auth/register`, `/api/auth/login`, JWT) — unblocks registration flow | ✅ Done (commit 499944b) |

---

## Phase 0: Quick Verification UI (IMMEDIATE - This Week)
- [x] Create "Database Check" page in frontend to verify Supabase connection and show table counts
- [x] Create "Add Category" form → POST /api/home-services/categories → verify in Supabase Table Editor
- [ ] Create "Add Service" form with category dropdown → POST /api/home-services/services
- [ ] Create "Add Professional" form with KYC fields → POST /api/home-services/professionals
- [ ] Create "Create Booking" wizard form → POST /api/home-services/bookings/price-quotes → /bookings
- [ ] Create "Admin Dashboard" page showing real-time table counts from Supabase

**Data Location:** All new data goes to **Supabase (PostgreSQL)** - connected via `db.qfgozadjsucuoxrxrknc.supabase.co`. No local database.

**Verify in:** Supabase Dashboard → Table Editor → See real-time row counts