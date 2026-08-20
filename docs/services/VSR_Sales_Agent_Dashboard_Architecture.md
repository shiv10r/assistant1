# VSR Home Services — Sales / Field Agent Dashboard Architecture

> Companion document to `VSR_Home_Services_Full_Fledged_Product_Architecture.md`. Same technology
> constraints apply: **Frontend: React, Backend: .NET, Database: PostgreSQL**. This module plugs
> into the existing `home-services` product (same repos, same DB) as a new persona, not a new app.

---

# 1. Role & Workflows

A Sales/Field Agent generates leads on the ground (shop visits, cold walk-ins, referrals) and enrolls both **customers** and **professionals** onto the platform.

```text
Can:
  log in to a dedicated Sales dashboard
  create a lead (customer or professional/shop) with contact + location
  log a field visit against a lead (geo-tagged, with notes/photo)
  update lead status: new -> contacted -> interested -> enrolled -> rejected/lost
  convert a lead into a real Customer or Professional record (triggers onboarding)
  view own monthly targets (leads, enrollments) and progress
  view own commission/incentive ledger and payout status
  view leaderboard of own performance vs peers (read-only)
  raise support ticket for enrollment issues

Cannot:
  see other agents' raw lead contact lists (privacy) unless promoted to team-lead/admin
  change pricing, bookings, payouts of other roles
```

Optional hierarchy: `SalesTeamLead` (views team leads/enrollments/commissions for their assigned agents) — reuses the same tables with a `manager_agent_id` self-reference on `SalesAgents`.

---

# 2. Database Schema

```text
SalesAgents
  id, user_id fk, employee_code (unique), manager_agent_id fk (nullable, self-ref),
  region_city_id fk, target_monthly_leads, target_monthly_enrollments,
  commission_rate_percent, status (active/inactive/suspended), joined_at

Leads
  id, sales_agent_id fk, lead_type (customer/professional/shop_partner), full_name, phone, email,
  shop_name (nullable), address_line, city_id fk, zone_id fk (nullable),
  source (field_visit/referral/cold_call/walk_in/campaign),
  status (new/contacted/interested/enrolled/rejected/lost), notes, follow_up_at

LeadVisits
  id, lead_id fk, sales_agent_id fk, visited_at, location_lat, location_lng,
  outcome (interested/not_interested/reschedule/enrolled), notes, photo_url

Enrollments
  id, lead_id fk, sales_agent_id fk, enrolled_entity_type (customer/professional),
  enrolled_entity_id, enrolled_at, incentive_amount, incentive_status (pending/approved/paid)

SalesTargets
  id, sales_agent_id fk, period_start, period_end, target_leads, target_enrollments, target_revenue

SalesCommissions
  id, sales_agent_id fk, enrollment_id fk (nullable), amount, reason,
  status (accrued/approved/paid), period_start, period_end
```

Relations: `Enrollments.enrolled_entity_id` points to `Customers.id` or `Professionals.id` depending on `enrolled_entity_type` (polymorphic reference, resolved in the application layer — no DB-level FK across the two, same pattern EF Core uses elsewhere in the main schema for polymorphic links).

---

# 3. Frontend Architecture

New sibling module next to `pages/admin` and `pages/pro` in the existing `home-services` frontend, same shell/nav pattern — no new app or router is created.

```text
frontend/src/services/home-services/pages/sales/
  SalesDashboard.tsx     KPI cards: leads this month, enrollments this month, conversion rate,
                         commission earned (pending/paid), progress bars vs SalesTargets
  SalesLeads.tsx         lead list + filters (status/source/city), create/edit lead form
  SalesLeadDetail.tsx    lead profile, visit history timeline, log-a-visit form, convert-to-enrollment action
  SalesEnrollments.tsx   enrollment history + incentive status
  SalesCommissions.tsx   commission ledger + payout status (same visual pattern as ProEarnings.tsx)
  SalesLeaderboard.tsx   read-only ranked list of agents (own team if SalesTeamLead)

HomeServicesShell.tsx:  add SALES_NAV array (Dashboard/Leads/Enrollments/Commissions/Leaderboard),
                        persona detection extends to 'sales' alongside customer/professional/admin

App.tsx routes (new):
  /home-services/sales               -> SalesDashboard
  /home-services/sales/leads         -> SalesLeads
  /home-services/sales/leads/:leadId -> SalesLeadDetail
  /home-services/sales/enrollments   -> SalesEnrollments
  /home-services/sales/commissions   -> SalesCommissions
  /home-services/sales/leaderboard   -> SalesLeaderboard

Charts: reuse the `recharts` library (already specified for Admin Analytics) for the
        leads/enrollments trend line on SalesDashboard.tsx.
```

---

# 4. Backend Architecture & APIs

```text
VSRSystemsBackend.Domain/HomeServices/       SalesAgent.cs, Lead.cs, LeadVisit.cs, Enrollment.cs,
                                              SalesTarget.cs, SalesCommission.cs
VSRSystemsBackend.Application/HomeServices/
  DTOs/            SalesAgentDtos.cs, LeadDtos.cs, EnrollmentDtos.cs, SalesCommissionDtos.cs
  Interfaces/       ISalesRepository.cs, ISalesService.cs
  Services/         SalesService.cs (lead CRUD, visit logging, conversion, targets, commission calc)
VSRSystemsBackend.Infrastructure/
  Repositories/HomeServices/   SalesAgentRepository.cs, LeadRepository.cs, EnrollmentRepository.cs
  Data/Configurations/         HomeServicesSalesConfiguration.cs
  Data/DbContext/AppDbContext.cs   add DbSet<T> for all 6 entities above
VSRSystemsBackend.Api/Controllers/
  HomeServiceSalesController.cs

Endpoints:
  GET  /home-services/sales/dashboard-summary        -> leads/enrollments/conversion/commission KPIs
  GET  /home-services/sales/leads                    -> own leads (scoped by sales_agent_id from auth)
  POST /home-services/sales/leads                    -> create lead
  PUT  /home-services/sales/leads/{id}                -> update lead status/notes
  POST /home-services/sales/leads/{id}/visits          -> log a field visit
  POST /home-services/sales/leads/{id}/convert          -> create Customer or Professional + Enrollment record
  GET  /home-services/sales/commissions                -> own commission ledger
  GET  /home-services/sales/leaderboard                 -> own team ranking

Admin-only:
  GET  /admin/sales/agents                             -> full agent list, targets, performance
  GET  /admin/sales/leads                               -> every lead across every agent
  GET  /admin/sales/commissions                          -> every commission record, approve/reject/mark-paid
  POST /admin/sales/agents/{id}/targets                   -> set/update an agent's SalesTargets
```

Authorization: `sales_agent` role scopes all `/home-services/sales/*` reads/writes to `sales_agent_id = current user`; `/admin/sales/*` requires `admin` (or `finance_agent` for commission approval).

---

# 5. Admin Oversight of the Sales Module

Admin has unrestricted read+write visibility into everything in this document — consistent with the "Admin sees/controls everything" rule in the main architecture doc.

```text
Admin Dashboard (AdminDashboard.tsx) — add cards:
  Leads Today, Enrollments Today, Active Sales Agents, Pending Commission Payouts

Admin Analytics (AdminAnalytics.tsx) — add charts:
  Leads Trend, Enrollment Conversion Rate, Top Sales Agents (by enrollments/revenue), Sales-Sourced Revenue

New Admin page pages/admin/AdminSales.tsx:
  agent list + performance, lead pipeline (kanban by status), commission approval queue

Admin can, without restriction:
  view/edit/deactivate any Sales Agent, Lead, Enrollment, Commission record
  set/override any agent's SalesTargets
  approve, reject or mark-paid any SalesCommission record
  view full AuditLogs of every Sales module change (who changed what, when)
```

Enforced in the backend via an `admin` role bypass on every authorization policy (`RequireRole("admin")` OR resource-owner check), not merely hidden/shown in the UI.
