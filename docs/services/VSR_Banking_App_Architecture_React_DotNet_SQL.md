# VSR Bank — Full-Stack Digital Banking Application Architecture

> Coding-agent-ready architecture for a modern digital banking platform.
>
> **Fixed stack**
> - Frontend: React + TypeScript + Vite
> - Backend: ASP.NET Core Web API + C#
> - Database: Microsoft SQL Server
> - ORM: Entity Framework Core
> - Architecture: Modular Monolith + Clean Architecture principles
> - Authentication: JWT + Refresh Tokens + MFA-ready
> - Target: Desktop, tablet, mobile browser, Android WebView, iOS WKWebView
>
> **Important:** This architecture is for product development. Real banking production systems require jurisdiction-specific regulatory, security, audit, fraud, privacy, KYC/AML, payments-network, and operational controls beyond this document.

---

# 1. Product Vision

Build a secure digital banking application that supports:

- Customer onboarding
- KYC workflow
- Login + MFA
- Account dashboard
- Savings/current accounts
- Account balances
- Transaction history
- Internal transfers
- Beneficiary management
- External bank transfer-ready architecture
- Scheduled payments
- Bill payments
- Debit/credit card management
- Statements
- Fixed/term deposits
- Loans overview
- Service requests
- Notifications
- Secure document center
- Support
- Admin/operations portal
- Audit and fraud-monitoring-ready architecture

Primary customer journey:

```text
REGISTER
→ VERIFY IDENTITY
→ LOGIN
→ VIEW ACCOUNTS
→ TRANSFER / PAY
→ VERIFY TRANSACTION
→ CONFIRM
→ TRACK HISTORY
```

---

# 2. High-Level Architecture

```text
Customer Web / Mobile WebView
          │
          ▼
React + TypeScript
          │ HTTPS
          ▼
ASP.NET Core Web API
          │
          ├── Identity
          ├── Customers
          ├── Accounts
          ├── Transfers
          ├── Beneficiaries
          ├── Cards
          ├── Deposits
          ├── Loans
          ├── Statements
          ├── Notifications
          ├── Service Requests
          ├── Fraud/Risk Hooks
          └── Admin
          │
          ▼
SQL Server
```

Optional integrations:

```text
KYC Provider
Payments Network / Bank Switch
OTP / SMS / Email
Card Processor
Credit Bureau
Fraud Engine
Document Storage
Audit SIEM
```

---

# 3. Product Surfaces

## Customer Portal

```text
Login
Dashboard
Accounts
Transactions
Transfer Money
Beneficiaries
Cards
Deposits
Loans
Statements
Bills
Notifications
Documents
Support
Profile
Security Settings
```

## Operations/Admin Portal

```text
Customer Search
KYC Review
Account Operations
Transaction Monitoring
Transfer Review
Card Operations
Service Requests
Fraud Alerts
Limits
Reports
Users / Roles
Audit Logs
System Settings
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
│   ├── security/
│   └── shared/
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/
│   ├── accounts/
│   ├── transactions/
│   ├── transfers/
│   ├── beneficiaries/
│   ├── cards/
│   ├── deposits/
│   ├── loans/
│   ├── statements/
│   ├── bills/
│   ├── notifications/
│   ├── support/
│   └── admin/
├── lib/
├── services/
├── hooks/
├── types/
└── main.tsx
```

---

# 5. Customer Routes

```text
/login
/register
/verify
/forgot-password

/dashboard

/accounts
/accounts/:accountId
/accounts/:accountId/transactions

/transfers
/transfers/new
/transfers/history

/beneficiaries

/cards
/cards/:cardId

/deposits
/loans

/statements
/bills

/notifications
/documents
/support

/profile
/security
```

---

# 6. Dashboard

Use secure summary cards:

```text
Total Balance
Savings Account
Current Account
Credit Card Due
Fixed Deposits
Loan Outstanding
```

Quick actions:

```text
Transfer
Pay Bill
Add Beneficiary
Download Statement
Freeze Card
```

Recent activity:

```text
Last 5–10 transactions
Pending transfers
Security alerts
Service requests
```

Never expose full account/card numbers by default.

---

# 7. Account Cards

Example:

```text
Savings Account
•••• 4821

Available Balance
₹1,42,350.50

[View Transactions]
[Transfer]
```

Mask sensitive values.

---

# 8. Transaction History

Filters:

```text
Date range
Amount
Credit/Debit
Category
Reference
Status
```

Transaction fields:

```text
TransactionId
AccountId
Type
Direction
Amount
Currency
Description
Reference
Counterparty
Status
BookedAt
ValueDate
BalanceAfter
```

---

# 9. Transfer Flow

```text
Select Source Account
→ Select Beneficiary
→ Enter Amount
→ Purpose / Remark
→ Backend validates limits/balance
→ Risk checks
→ OTP/MFA challenge if required
→ Confirm
→ Create transaction
→ Update ledger
→ Show receipt
```

Important:

- Balance and limits are backend-authoritative
- Use idempotency keys
- Use transactions
- Never trust client-side totals/status
- High-risk actions require step-up authentication

---

# 10. Beneficiary Management

Fields:

```text
Name
Bank
Account Number
IFSC/SWIFT/Branch Code
Nickname
Status
CreatedAt
CoolingPeriodEndsAt
```

Statuses:

```text
PendingVerification
CoolingPeriod
Active
Blocked
Deleted
```

---

# 11. Cards Module

Features:

```text
Masked card
Current status
Available limit
Outstanding amount
Transactions
Freeze/unfreeze
Set usage limits
International toggle
Online transactions toggle
ATM toggle
Replace card request
Report lost/stolen
```

Never store or expose CVV.

---

# 12. Deposits

Support:

```text
Fixed Deposit
Recurring Deposit
```

Fields:

```text
Principal
InterestRate
StartDate
MaturityDate
MaturityAmount
Nominee
Status
```

Interest and maturity calculations must be server-side.

---

# 13. Loans

Customer view:

```text
Loan Type
Original Amount
Outstanding
EMI
Next Due Date
Interest Rate
Tenure
Repayment Schedule
Documents
```

MVP can be overview-only.

---

# 14. Statements

Generate/download:

```text
Monthly
Quarterly
Custom Date Range
```

Formats:

```text
PDF
CSV
```

Statement generation should happen server-side.

---

# 15. Bill Payments

Architecture-ready categories:

```text
Electricity
Mobile
Broadband
Gas
Water
Credit Card
DTH
Insurance
```

Provider integrations can be added later.

---

# 16. Authentication

Use:

```text
JWT Access Token
Refresh Token
MFA / OTP-ready
Device/session tracking
Login throttling
```

Security events:

```text
New device
Password changed
MFA changed
Suspicious login
Beneficiary added
Large transfer
Card frozen/unfrozen
```

---

# 17. Backend Solution

```text
backend/
├── VSR.Bank.Api/
├── VSR.Bank.Application/
├── VSR.Bank.Domain/
├── VSR.Bank.Infrastructure/
├── VSR.Bank.Contracts/
└── VSR.Bank.Tests/
```

---

# 18. Main Backend Modules

```text
Identity
Customers
Kyc
Accounts
Ledger
Transactions
Transfers
Beneficiaries
Cards
Deposits
Loans
Bills
Statements
Notifications
Documents
ServiceRequests
Risk
Admin
Audit
```

---

# 19. Core Entities

```text
User
Role
Permission
RefreshToken
TrustedDevice

Customer
CustomerProfile
KycCase
KycDocument

Account
AccountBalance
LedgerEntry
Transaction

Beneficiary
Transfer
TransferAuthorization

Card
CardControl
CardTransaction

Deposit
Loan
LoanInstallment

BillPayment

Statement

Notification
ServiceRequest
AuditLog
RiskEvent
```

---

# 20. SQL Tables

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens
TrustedDevices

Customers
CustomerProfiles
KycCases
KycDocuments

Accounts
AccountBalances
LedgerEntries
Transactions

Beneficiaries
Transfers
TransferAuthorizations

Cards
CardControls
CardTransactions

Deposits
Loans
LoanInstallments

BillPayments

Statements
Notifications
ServiceRequests
RiskEvents
AuditLogs
```

---

# 21. Account Table

```text
Id
CustomerId
AccountNumberEncryptedOrTokenized
AccountNumberLast4
AccountType
Currency
Status
OpenedAt
ClosedAt
CreatedAt
UpdatedAt
RowVersion
```

---

# 22. Ledger Architecture

Use double-entry accounting principles for financial posting.

Each financial transfer should create balanced entries:

```text
Debit Account A
Credit Settlement/Account B
```

Do not update account balance using ad hoc arithmetic in multiple places.

Use a central ledger posting service.

---

# 23. Transfer Table

```text
Id
TransferReference
FromAccountId
BeneficiaryId
Amount
Currency
Purpose
Status
RiskStatus
RequestedAt
AuthorizedAt
CompletedAt
FailedAt
IdempotencyKey
CreatedByUserId
RowVersion
```

Statuses:

```text
Draft
PendingAuthorization
Pending
Processing
Completed
Failed
Cancelled
Rejected
```

---

# 24. API Examples

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/mfa/verify

GET  /api/v1/dashboard

GET  /api/v1/accounts
GET  /api/v1/accounts/{id}
GET  /api/v1/accounts/{id}/transactions

GET  /api/v1/beneficiaries
POST /api/v1/beneficiaries

POST /api/v1/transfers/quote
POST /api/v1/transfers
POST /api/v1/transfers/{id}/authorize
GET  /api/v1/transfers

GET  /api/v1/cards
POST /api/v1/cards/{id}/freeze
POST /api/v1/cards/{id}/unfreeze

GET  /api/v1/statements
POST /api/v1/statements

GET  /api/v1/notifications
```

---

# 25. Security Requirements

Mandatory design principles:

```text
HTTPS everywhere
Strong password hashing
MFA-ready
Token/session revocation
Permission-based authorization
Rate limiting
Audit logs
Sensitive field masking
Encryption at rest/in transit
Secret vault
No raw card secrets
No raw passwords
No direct SQL from frontend
No client-authoritative financial state
```

Also support:

```text
CSRF strategy if cookie auth used
CSP
XSS protection
secure headers
device/session management
IP/user-agent event logging
```

---

# 26. Fraud/Risk Hooks

Before sensitive transaction completion:

```text
Transfer amount
Velocity
New beneficiary
New device
Location anomaly
Failed OTP attempts
Account status
Daily limit
```

Risk result:

```text
Allow
StepUpAuth
ManualReview
Block
```

Keep this behind:

```csharp
IRiskDecisionService
```

---

# 27. Concurrency + Idempotency

Use `RowVersion` on:

```text
Accounts
Transfers
Beneficiaries
Cards
```

Idempotency required for:

```text
Transfer submit
Transfer authorization
Bill payment
Card operations
Statement generation request
```

---

# 28. Admin Dashboard

Cards:

```text
Active Customers
New KYC Cases
Transfers Today
Failed Transfers
High-Risk Events
Blocked Accounts
Open Service Requests
```

---

# 29. Mobile/WebView

Mandatory:

- 320px+
- Safe-area support
- No hover-only actions
- 44px touch targets
- Keyboard-safe MFA/forms
- Sensitive information masked
- No horizontal overflow
- Transfer confirmation optimized for one-handed use
- External KYC/payment flows WebView-safe

---

# 30. MVP Scope

```text
Login + MFA-ready flow
Dashboard
Accounts
Transactions
Beneficiaries
Internal transfers
Transfer confirmation
Cards overview + freeze
Statements
Notifications
Profile
Admin customer search
Admin transfer monitoring
Audit logs
```

---

# 31. Phase 2

```text
External bank transfers
Bill payments
Deposits
Loans
Card processor integration
KYC provider integration
Fraud engine
SMS/Email
Document center
```

---

# 32. Coding Agent Master Prompt

```text
Build the VSR Bank digital banking application described in this architecture.

Stack:
React + TypeScript + Vite
ASP.NET Core Web API + C#
Entity Framework Core
Microsoft SQL Server

Use a modular monolith with Clean Architecture principles.

Implement real end-to-end flows:
Login
→ Dashboard
→ Accounts
→ Transactions
→ Beneficiary
→ Transfer Quote
→ Authorization
→ Transfer Posting
→ Receipt.

All financial calculations, limits, balances, ledger posting, and transaction states must be backend-authoritative.

Use double-entry ledger principles.

Use idempotency keys for money-moving requests.

Use SQL transactions for financial posting.

Never store CVV or raw passwords.

Mask sensitive customer/account/card data.

Implement permission-based authorization, audit logs, MFA-ready architecture, risk hooks, and mobile/WebView support.

At the end:
1. run frontend build
2. run dotnet build
3. run tests
4. apply/check migrations
5. seed demo customers/accounts
6. verify transfer idempotency
7. verify ledger balances
8. fix all errors
```

---

# 33. Definition of Done

- [ ] Secure login
- [ ] Dashboard
- [ ] Accounts
- [ ] Transactions
- [ ] Beneficiaries
- [ ] Transfer flow
- [ ] Idempotency
- [ ] Ledger
- [ ] Cards overview
- [ ] Freeze/unfreeze
- [ ] Statements
- [ ] Notifications
- [ ] Admin monitoring
- [ ] Audit logs
- [ ] React build succeeds
- [ ] .NET build succeeds
- [ ] EF migrations succeed
- [ ] Mobile/WebView works
