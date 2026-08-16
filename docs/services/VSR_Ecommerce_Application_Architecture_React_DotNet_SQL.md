# VSR Commerce — Full-Stack E-Commerce Application Architecture

> **Coding-agent-ready architecture**
>
> **Fixed stack:** React + TypeScript + Vite → ASP.NET Core Web API + C# → Entity Framework Core → Microsoft SQL Server.
>
> **Architecture:** Modular Monolith with Clean Architecture principles.
>
> **Target:** Desktop, tablet, mobile browser, Android WebView, and iOS WKWebView.

---

# 1. Product Vision

Build a complete modern e-commerce platform covering the full customer lifecycle:

```text
DISCOVER
   ↓
SEARCH
   ↓
COMPARE
   ↓
ADD TO CART
   ↓
CHECKOUT
   ↓
PAY
   ↓
ORDER
   ↓
SHIP
   ↓
DELIVER
   ↓
RETURN / REVIEW / REORDER
```

The application should feel like a real commercial shopping product, not a generic CRUD system.

Primary characteristics:

- Card-heavy UI
- Product-image-first design
- Fast mobile experience
- Search- and filter-driven discovery
- Secure checkout
- Reliable inventory handling
- Modern customer account
- Powerful admin panel
- Multi-vendor-ready foundation for later expansion

---

# 2. Initial Product Model

For the first commercial version, build a **single-store/single-merchant** e-commerce platform.

Keep domain boundaries flexible enough for future multi-vendor support, but do not build marketplace complexity before the core store works.

Recommended:

```text
React Storefront
      +
ASP.NET Core Modular Monolith
      +
SQL Server
```

Avoid microservices in MVP.

---

# 3. Product Areas

## Public Storefront

```text
Home
Categories
Product Listing
Search
Product Detail
Brands
Collections
Offers
Wishlist
Cart
Checkout
Order Success
Content / Guides
```

## Customer Account

```text
Profile
Addresses
Orders
Order Tracking
Returns
Refunds
Wishlist
Reviews
Notifications
Support
```

## Admin Portal

```text
Dashboard
Products
Categories
Brands
Collections
Inventory
Pricing
Orders
Returns
Refunds
Customers
Coupons
Promotions
Reviews
CMS
Reports
Users
Roles
Settings
Audit Logs
```

## Future Seller Portal

```text
Seller Dashboard
Products
Inventory
Orders
Returns
Settlements
Reports
```

---

# 4. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                       CUSTOMERS                          │
│ Desktop / Tablet / Mobile / Android & iOS WebView       │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 REACT + TYPESCRIPT                       │
│ Storefront / Search / Cart / Checkout / Account / Admin │
└────────────────────────────┬─────────────────────────────┘
                             │ REST / JSON
                             ▼
┌──────────────────────────────────────────────────────────┐
│                ASP.NET CORE WEB API                      │
│ Identity / Catalog / Search / Pricing / Cart            │
│ Inventory / Checkout / Orders / Payments / Shipping     │
│ Promotions / Reviews / Admin                            │
└────────────────────────────┬─────────────────────────────┘
                             │ EF Core
                             ▼
┌──────────────────────────────────────────────────────────┐
│                       SQL SERVER                         │
└──────────────────────────────────────────────────────────┘
```

Future integrations:

```text
Payment Gateway
Shipping Provider
Email / SMS / WhatsApp
Object Storage / CDN
Redis
Search Engine
Tax Provider
Analytics
```

---

# 5. Technology Stack

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
TanStack Table
Embla Carousel / Swiper
Recharts
date-fns
Axios or Fetch wrapper
Sonner
Framer Motion
```

## Backend

```text
ASP.NET Core Web API
C#
Entity Framework Core
FluentValidation
JWT authentication
Refresh tokens
Permission-based authorization
Swagger / OpenAPI
ProblemDetails
Rate limiting
Structured logging
Health checks
Background services
```

Optional later:

```text
Redis
SignalR
Hangfire
Object Storage
```

---

# 6. Repository Structure

```text
VSR.Commerce/
│
├── frontend/
│   └── vsr-commerce-web/
│
├── backend/
│   ├── VSR.Commerce.Api/
│   ├── VSR.Commerce.Application/
│   ├── VSR.Commerce.Domain/
│   ├── VSR.Commerce.Infrastructure/
│   ├── VSR.Commerce.Contracts/
│   └── VSR.Commerce.Tests/
│
├── database/
│   ├── scripts/
│   ├── seed/
│   └── docs/
│
├── docs/
└── README.md
```

---

# 7. Public Routes

```text
/
/search
/search?q=
/categories
/category/:slug
/brand/:slug
/collection/:slug
/product/:slug
/offers
/cart
/checkout
/checkout/address
/checkout/shipping
/checkout/payment
/order/success/:orderId
/login
/register
/forgot-password
/account
/account/profile
/account/addresses
/account/orders
/account/orders/:orderId
/account/returns
/account/wishlist
/account/reviews
/account/notifications
/account/support
/about
/contact
/faq
/privacy
/terms
/return-policy
/shipping-policy
```

---

# 8. Admin Routes

```text
/admin
/admin/products
/admin/products/new
/admin/products/:id
/admin/categories
/admin/brands
/admin/collections
/admin/inventory
/admin/pricing
/admin/orders
/admin/orders/:id
/admin/returns
/admin/refunds
/admin/customers
/admin/coupons
/admin/promotions
/admin/reviews
/admin/content
/admin/media
/admin/reports
/admin/users
/admin/roles
/admin/settings
/admin/audit
```

---

# 9. Homepage Design

Use a visual, card-heavy structure:

```text
Header
Hero / Campaign Banner
Quick Categories
Trending Products
Limited-Time Deals
Shop by Category
Featured Brands
New Arrivals
Best Sellers
Recommended For You
Collections
Offer Cards
Customer Reviews
Recently Viewed
Newsletter
Footer
```

Avoid large text-heavy empty sections.

---

# 10. Header

Desktop:

```text
VSR Commerce

Categories
New Arrivals
Best Sellers
Offers
Brands

[ Search products... ]

Wishlist
Cart
Login/Profile
```

Mobile:

```text
☰   VSR Commerce   🔍   🛒
```

Mobile can use a second full-width search row.

---

# 11. Hero

Support:

- Campaign image
- Promotional copy
- CTA
- Optional video background

Example:

```text
Summer Tech Sale
Up to 40% off selected electronics
[Shop Now]
```

Keep the hero conversion-focused.

---

# 12. Card Library

Create reusable components:

```text
ProductCard
CompactProductCard
HorizontalProductCard
DealProductCard
RecommendedProductCard
RecentlyViewedCard
WishlistProductCard
CartItemCard
OrderItemCard
ComparisonProductCard
CategoryCard
BrandCard
CollectionCard
OfferCard
CouponCard
ReviewCard
TrustCard
AddressCard
PaymentMethodCard
ShippingMethodCard
OrderCard
ReturnCard
RefundCard
SupportCard
AdminMetricCard
InventoryAlertCard
```

---

# 13. Product Card

Example:

```text
┌─────────────────────────────┐
│                    ♡        │
│        PRODUCT IMAGE        │
│                             │
├─────────────────────────────┤
│ BEST SELLER                 │
│ Product Name                │
│ ★ 4.6 (1,240)               │
│ ₹69,999                     │
│ ₹79,999   12% OFF           │
│ Free delivery               │
│ [Add to Cart]               │
└─────────────────────────────┘
```

Badges:

```text
Best Seller
New
Limited Deal
Top Rated
Low Stock
Exclusive
```

Do not fabricate scarcity.

---

# 14. Category Page

Desktop:

```text
Category Header
Subcategory Cards
Filters Sidebar │ Product Grid
```

Mobile:

```text
Category
Subcategory Rail
Sort | Filters
Product Grid
```

---

# 15. Dynamic Product Filters

Support attribute-driven filters:

```text
Category
Subcategory
Brand
Price
Rating
Availability
Discount
Color
Size
Storage
RAM
Material
Gender
Delivery availability
```

Category attributes control which filters appear.

---

# 16. Dynamic Product Attributes

Examples:

Electronics:

```text
RAM
Storage
Processor
Screen Size
Color
```

Fashion:

```text
Size
Color
Material
Fit
Gender
```

Home:

```text
Material
Dimensions
Color
Capacity
```

Each attribute should define:

```text
Name
DataType
Filterable
Searchable
VariantDefining
DisplayOrder
```

---

# 17. Search

Search suggestions:

```text
Products
Categories
Brands
Recent Searches
Trending Searches
```

MVP:

```text
SQL Server search/filtering
```

Future:

```text
Azure AI Search
Elasticsearch
OpenSearch
```

---

# 18. Search Result Page

Example:

```text
"iphone"
1,234 results

Sort:
Recommended
Price Low–High
Price High–Low
Newest
Rating
Discount
```

Show active filter chips.

---

# 19. Product Detail Page

Route:

```text
/product/:slug
```

Desktop:

```text
┌────────────────────────────┬──────────────────────────────┐
│ Product Gallery            │ Product Information          │
│                            │ Title                        │
│                            │ Rating                       │
│                            │ Price                        │
│                            │ Variant                      │
│                            │ Offers                       │
│                            │ Delivery                     │
│                            │ Cart / Buy Now               │
└────────────────────────────┴──────────────────────────────┘
```

Below:

```text
Highlights
Specifications
Description
Offers
Reviews
Questions future
Similar Products
Frequently Bought Together
Recently Viewed
```

---

# 20. Product Gallery

Support:

```text
Multiple images
Thumbnail rail
Zoom
Fullscreen gallery
Video
360-ready architecture
```

Mobile:

```text
Swipeable image carousel
```

---

# 21. Product Summary

Display:

```text
Title
Brand
Rating
Review count
SKU
Current price
MRP
Discount
Tax message
Stock
Variant selectors
Delivery estimate
Offers
Warranty
Return policy
```

---

# 22. Product Variants

Each valid combination maps to a ProductVariant.

Examples:

```text
Color: Black / Blue / Silver
Storage: 128GB / 256GB / 512GB
Size: S / M / L / XL
```

Variant owns:

```text
SKU
Barcode
Price
Stock
Weight
Dimensions
Images optional
```

---

# 23. Stock Statuses

```text
In Stock
Low Stock
Out of Stock
Preorder
Backorder
```

Backend is authoritative.

---

# 24. Add to Cart Flow

```text
Select variant
→ quantity
→ POST cart item
→ backend validates product
→ backend validates variant
→ backend validates stock
→ backend calculates price
→ cart updated
```

Never trust product price sent by React.

---

# 25. Buy Now

```text
Product Detail
→ Buy Now
→ Direct checkout cart/session
→ Checkout
```

Reuse the normal checkout pipeline.

---

# 26. Cart

Desktop:

```text
Cart Items                Order Summary
```

Mobile:

```text
Cart Item Cards
Coupon
Summary
Sticky Checkout CTA
```

Each cart item:

```text
Image
Product
Variant
Quantity
Price
Discount
Stock warning
Remove
Move to Wishlist
```

---

# 27. Cart Validation Rules

Backend validates:

```text
Product active?
Variant active?
Stock available?
Price changed?
Coupon valid?
Maximum quantity?
```

Return user-friendly adjustments.

---

# 28. Wishlist

Anonymous users:

```text
localStorage
```

After login:

```text
merge local wishlist → customer wishlist
```

---

# 29. Checkout Flow

Recommended:

```text
1. Login / Guest identity
2. Delivery Address
3. Shipping Method
4. Review Items
5. Coupon / Offers
6. Payment
7. Confirmation
```

Desktop uses a stepper.

Mobile uses compact progress.

---

# 30. Guest Checkout

Optional but recommended.

Collect:

```text
Name
Email
Phone
Address
```

After purchase:

```text
Create account to track orders
```

---

# 31. Address Management

Fields:

```text
Full Name
Phone
Address Line 1
Address Line 2
Landmark
City
State
Postal Code
Country
Address Type
Default
```

Types:

```text
Home
Work
Other
```

---

# 32. Delivery Serviceability

Before checkout:

```text
Postal code
→ backend serviceability check
```

Backend returns:

```text
serviceable
estimated delivery
shipping methods
shipping cost
COD availability
```

---

# 33. Shipping Methods

```text
Standard
Express
Same Day
Store Pickup future
```

Each includes:

```text
Name
Price
Estimated Date
Provider
```

---

# 34. Backend Pricing

Final pricing formula:

```text
Product subtotal
+ variant adjustments
+ shipping
+ tax
+ fees
- item discounts
- promotion discounts
- coupon discounts
- credits
= final total
```

React only displays the backend quote.

---

# 35. Immutable Pricing Snapshot

At order creation store:

```text
Product Name
SKU
Variant
Unit Price
MRP
Discount
Quantity
Tax
Shipping Share
Final Line Amount
Currency
```

Historical orders must not depend on current product prices.

---

# 36. Coupons

Types:

```text
Percentage
Fixed Amount
Free Shipping
Category Discount
Brand Discount
Product Discount
First Order
Minimum Cart
```

Validation:

```text
Active
Start/end dates
Usage limit
Per-user limit
Minimum value
Eligibility
Maximum discount
Payment method constraints
```

---

# 37. Promotions

Support automatic promotions separately from coupons.

Examples:

```text
Buy 2 Get 1
10% off category
Flat ₹500 above ₹5,000
Bundle Discount
Weekend Sale
```

MVP can start with basic promotion rules.

---

# 38. Payment Architecture

Frontend never marks payment successful.

```text
Checkout Quote
      ↓
Create Pending Order
      ↓
Create Payment Order
      ↓
Payment Gateway
      ↓
Callback / Webhook
      ↓
Backend Verification
      ↓
Payment = Paid
      ↓
Order = Confirmed
```

---

# 39. Payment Methods

Architecture-ready:

```text
UPI
Credit Card
Debit Card
Net Banking
Wallet
Cash on Delivery
Store Credit future
```

---

# 40. Payment Statuses

```text
Created
Pending
Authorized
Paid
Failed
Cancelled
RefundPending
PartiallyRefunded
Refunded
```

Webhook and verification must be idempotent.

---

# 41. Development Payment Simulator

Create:

```text
DevelopmentPaymentGateway
```

Options:

```text
Simulate Success
Simulate Failure
```

Development/test only.

---

# 42. Order Statuses

```text
PendingPayment
Confirmed
Processing
Packed
Shipped
OutForDelivery
Delivered
Cancelled
PartiallyCancelled
ReturnRequested
Returned
RefundPending
Refunded
PartiallyRefunded
```

---

# 43. Order Number

Example:

```text
VSR-EC-2026-001492
```

Use human-friendly order numbers.

---

# 44. Order Creation Transaction

Within a SQL transaction:

```text
Validate cart
Validate inventory
Calculate final price
Reserve/reduce inventory
Create order
Create order items
Create pricing snapshot
Create payment record
Create audit event
Commit
```

Failure:

```text
Rollback
```

---

# 45. Inventory Model

Create:

```text
ProductVariant
Inventory
InventoryTransaction
InventoryReservation
```

Inventory:

```text
OnHand
Reserved
Available
ReorderLevel
```

Formula:

```text
Available = OnHand - Reserved
```

---

# 46. Inventory Reservation

Recommended:

```text
Checkout starts
→ reserve inventory
→ reservation expiry e.g. 15 min
```

Then:

```text
Payment success → convert reservation to sale
Payment expiry → release stock
```

---

# 47. Inventory Transactions

Track every stock movement:

```text
StockIn
Reservation
ReservationRelease
Sale
Cancellation
Return
Damage
ManualAdjustment
```

Never silently modify inventory.

---

# 48. Inventory Concurrency

Multiple users may buy the last unit.

Use:

```text
SQL transaction
atomic update
RowVersion / optimistic concurrency
```

Return:

```text
409 Conflict
```

when stock changes.

---

# 49. Customer Order Detail

Route:

```text
/account/orders/:orderId
```

Show:

```text
Order Status
Items
Payment
Shipping Address
Tracking
Price Breakdown
Invoice-ready link
Support
Return Eligibility
```

---

# 50. Tracking Timeline

```text
Order Confirmed ✓
Packed          ✓
Shipped         ✓
Out for Delivery ○
Delivered        ○
```

---

# 51. Shipping Integration

Interface:

```csharp
IShippingProvider
```

Responsibilities:

```text
Get Rates
Create Shipment
Cancel Shipment
Track Shipment
Generate Label
```

MVP can use manual/internal shipment status.

---

# 52. Shipment Entity

```text
Id
OrderId
Provider
TrackingNumber
Status
ShippingMethod
EstimatedDeliveryAt
ShippedAt
DeliveredAt
TrackingUrl
CreatedAt
UpdatedAt
```

---

# 53. Return Flow

```text
Order Detail
→ Select Item
→ Return
→ Reason
→ Quantity
→ Images optional
→ Pickup method
→ Submit
```

Statuses:

```text
Requested
Approved
Rejected
PickupScheduled
Received
Inspection
RefundApproved
Completed
```

---

# 54. Return Reasons

```text
Damaged
Wrong Item
Defective
Size/Fit
Not as Described
Changed Mind
Missing Parts
Other
```

Backend determines eligibility.

---

# 55. Refund Flow

```text
Return Approved
→ Item Received
→ Refund Calculated
→ Gateway Refund
→ Webhook / Status Check
→ Refund Complete
```

Support full and partial refunds.

---

# 56. Cancellation

Backend-controlled eligibility.

Example:

```text
Confirmed / Processing → cancellable
Shipped → no cancellation; return after delivery
```

---

# 57. Reviews

Fields:

```text
Rating
Title
Body
Images
Video future
CreatedAt
```

Only actual purchasers receive:

```text
Verified Purchase
```

Moderation:

```text
Pending
Approved
Rejected
Flagged
```

---

# 58. Product Comparison — Phase 2

Compare:

```text
Image
Price
Rating
Attributes
Availability
Warranty
```

Useful mainly for electronics/appliances.

---

# 59. Recently Viewed

Track locally for anonymous users and optionally sync after login.

---

# 60. Recommendation Engine — MVP

Rules:

```text
Same category
Same brand
Similar price
Best sellers
Recently viewed
Wishlist
Purchase history
```

No machine learning required initially.

---

# 61. Backend Solution Structure

```text
backend/
├── VSR.Commerce.Api/
├── VSR.Commerce.Application/
│   ├── Common/
│   ├── Auth/
│   ├── Catalog/
│   ├── Products/
│   ├── Categories/
│   ├── Search/
│   ├── Pricing/
│   ├── Cart/
│   ├── Checkout/
│   ├── Orders/
│   ├── Inventory/
│   ├── Payments/
│   ├── Shipping/
│   ├── Returns/
│   ├── Reviews/
│   ├── Promotions/
│   ├── Customers/
│   ├── Reports/
│   └── Admin/
├── VSR.Commerce.Domain/
├── VSR.Commerce.Infrastructure/
└── VSR.Commerce.Tests/
```

---

# 62. React Folder Structure

```text
frontend/vsr-commerce-web/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── config/
│   │   └── store/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── cards/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── forms/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── catalog/
│   │   ├── products/
│   │   ├── search/
│   │   ├── wishlist/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── returns/
│   │   ├── reviews/
│   │   ├── account/
│   │   └── admin/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── constants/
│   ├── main.tsx
│   └── App.tsx
└── public/
```

---

# 63. Core Domain Entities

```text
User
Role
Permission
RefreshToken
Customer
CustomerAddress
Category
CategoryAttribute
Brand
Collection
Product
ProductVariant
ProductImage
ProductAttributeValue
Inventory
InventoryTransaction
InventoryReservation
Cart
CartItem
Coupon
Promotion
PromotionRule
CouponRedemption
Order
OrderItem
OrderPriceSnapshot
Payment
Refund
Shipment
ReturnRequest
ReturnItem
Review
ReviewMedia
WishlistItem
Notification
ContentPage
Banner
AuditLog
```

---

# 64. SQL Tables

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens
Customers
CustomerAddresses
Categories
CategoryAttributes
Brands
Collections
CollectionProducts
Products
ProductVariants
ProductImages
ProductAttributeValues
Inventories
InventoryTransactions
InventoryReservations
Carts
CartItems
Coupons
CouponRedemptions
Promotions
PromotionRules
Orders
OrderItems
OrderPriceSnapshots
Payments
Refunds
Shipments
ReturnRequests
ReturnItems
Reviews
ReviewMedia
WishlistItems
Notifications
ContentPages
SiteBanners
SiteSettings
AuditLogs
```

---

# 65. Products Table

```text
Id
Name
Slug
BrandId
CategoryId
ShortDescription
Description
Status
TaxCategory
IsFeatured
IsNewArrival
SeoTitle
SeoDescription
CreatedAt
UpdatedAt
RowVersion
```

Statuses:

```text
Draft
Active
Inactive
Archived
```

---

# 66. ProductVariants Table

```text
Id
ProductId
Sku
Barcode
Name
Price
CompareAtPrice
CostPrice
Currency
Weight
Length
Width
Height
IsActive
CreatedAt
UpdatedAt
RowVersion
```

SKU must be unique.

---

# 67. Product Images

```text
Id
ProductId
ProductVariantId NULL
Url
AltText
SortOrder
IsPrimary
CreatedAt
```

Production media should live in object storage/CDN.

---

# 68. Category Hierarchy

Use:

```text
ParentCategoryId
```

Example:

```text
Electronics
├── Mobiles
├── Laptops
└── Accessories
```

---

# 69. Carts Table

```text
Id
CustomerId NULL
SessionId NULL
Currency
CreatedAt
UpdatedAt
ExpiresAt
```

Supports both authenticated and anonymous carts.

---

# 70. CartItems Table

```text
Id
CartId
ProductVariantId
Quantity
AddedAt
UpdatedAt
```

Price remains server-calculated.

---

# 71. Orders Table

```text
Id
OrderNumber
CustomerId NULL
CustomerEmail
CustomerPhone
Status
PaymentStatus
FulfillmentStatus
Currency
Subtotal
DiscountAmount
TaxAmount
ShippingAmount
FeeAmount
TotalAmount
PaidAmount
RefundedAmount
ShippingAddressJson
BillingAddressJson
CouponCode NULL
CreatedAt
UpdatedAt
RowVersion
```

---

# 72. OrderItems Table

```text
Id
OrderId
ProductId
ProductVariantId
Sku
ProductName
VariantName
Quantity
UnitPrice
CompareAtPrice
DiscountAmount
TaxAmount
TotalAmount
ImageUrl
FulfillmentStatus
ReturnStatus
```

---

# 73. Payments Table

```text
Id
OrderId
Provider
ProviderPaymentId
ProviderOrderId
Method
Amount
Currency
Status
IdempotencyKey
CreatedAt
UpdatedAt
PaidAt
```

---

# 74. Inventory Table

```text
Id
ProductVariantId
WarehouseId NULL
OnHand
Reserved
ReorderLevel
UpdatedAt
RowVersion
```

MVP can use one default warehouse.

---

# 75. Returns Tables

```text
ReturnRequests
Id
ReturnNumber
OrderId
CustomerId
Status
ReasonSummary
RequestedAt
ApprovedAt
CompletedAt

ReturnItems
Id
ReturnRequestId
OrderItemId
Quantity
Reason
Condition
RefundAmount
```

---

# 76. API Base

```text
/api/v1
```

---

# 77. Public Catalog APIs

```text
GET /api/v1/home
GET /api/v1/categories
GET /api/v1/categories/{slug}
GET /api/v1/brands
GET /api/v1/brands/{slug}
GET /api/v1/products
GET /api/v1/products/{slug}
GET /api/v1/search
GET /api/v1/offers
```

---

# 78. Authentication APIs

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

---

# 79. Cart APIs

```text
GET    /api/v1/cart
POST   /api/v1/cart/items
PUT    /api/v1/cart/items/{itemId}
DELETE /api/v1/cart/items/{itemId}
POST   /api/v1/cart/apply-coupon
DELETE /api/v1/cart/coupon
```

---

# 80. Checkout APIs

```text
POST /api/v1/checkout/quote
POST /api/v1/checkout/validate-address
GET  /api/v1/checkout/shipping-methods
POST /api/v1/orders
```

---

# 81. Payment APIs

```text
POST /api/v1/orders/{orderId}/payment-order
POST /api/v1/payments/verify
POST /api/v1/payments/webhook
GET  /api/v1/orders/{orderId}/payments
POST /api/v1/admin/payments/{paymentId}/refund
```

---

# 82. Customer APIs

```text
GET /api/v1/me
PUT /api/v1/me
GET    /api/v1/me/addresses
POST   /api/v1/me/addresses
PUT    /api/v1/me/addresses/{id}
DELETE /api/v1/me/addresses/{id}
GET /api/v1/me/orders
GET /api/v1/me/orders/{id}
GET  /api/v1/me/wishlist
POST /api/v1/me/wishlist/{productId}
DELETE /api/v1/me/wishlist/{productId}
POST /api/v1/me/orders/{id}/cancel
POST /api/v1/me/orders/{id}/return
```

---

# 83. Review APIs

```text
GET  /api/v1/products/{productId}/reviews
POST /api/v1/products/{productId}/reviews
GET  /api/v1/me/reviews
```

---

# 84. Admin APIs

```text
GET /api/v1/admin/dashboard
GET    /api/v1/admin/products
POST   /api/v1/admin/products
PUT    /api/v1/admin/products/{id}
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
GET    /api/v1/admin/inventory
POST   /api/v1/admin/inventory/adjust
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/{id}
PATCH  /api/v1/admin/orders/{id}/status
GET /api/v1/admin/returns
POST /api/v1/admin/returns/{id}/approve
POST /api/v1/admin/returns/{id}/reject
GET    /api/v1/admin/coupons
POST   /api/v1/admin/coupons
PUT    /api/v1/admin/coupons/{id}
GET /api/v1/admin/reviews
POST /api/v1/admin/reviews/{id}/approve
POST /api/v1/admin/reviews/{id}/reject
GET /api/v1/admin/reports
```

---

# 85. Authentication and Authorization

Use:

```text
JWT Access Token
Refresh Token
Permission Policies
```

Backend always enforces security.

Admin permissions:

```text
product.view
product.create
product.update
product.publish
category.manage
brand.manage
inventory.view
inventory.adjust
order.view
order.update
order.cancel
payment.view
payment.refund
return.view
return.approve
coupon.manage
promotion.manage
review.moderate
customer.view
report.view
user.manage
settings.manage
```

---

# 86. Admin Dashboard

Metric cards:

```text
Revenue Today
Orders Today
Average Order Value
Pending Orders
Low Stock
Returns Pending
Refunds Pending
New Customers
Cart Abandonment
Top Product
```

Charts:

```text
Revenue
Orders
Category Sales
Payment Methods
Top Products
Customer Growth
Return Rate
```

---

# 87. Product Admin

Tabbed editor:

```text
Basic Info
Images
Variants
Pricing
Inventory
Attributes
Shipping
SEO
Related Products
Publishing
```

---

# 88. Variant Builder

Example:

```text
Color = Black, Blue
Storage = 128GB, 256GB
```

Generate:

```text
Black / 128GB
Black / 256GB
Blue / 128GB
Blue / 256GB
```

Each has independent SKU, price, and inventory.

---

# 89. Inventory Admin

Views:

```text
All Inventory
Low Stock
Out of Stock
Adjustments
Transactions
Reservations
```

---

# 90. Order Admin

Filters:

```text
Status
Payment
Fulfillment
Date
Customer
Order Number
Payment Method
```

Order detail:

```text
Customer
Items
Payments
Shipping
Timeline
Internal Notes
Refunds
Returns
Audit
```

---

# 91. Promotions Admin

Manage:

```text
Coupons
Automatic Discounts
Campaigns
Homepage Offers
```

Campaign fields:

```text
Name
Start
End
Audience
Products/Categories
Discount
Usage
```

---

# 92. Homepage CMS

Create configurable sections:

```text
Hero
CategoryRail
ProductCarousel
ProductGrid
BrandRail
OfferBanner
CollectionGrid
ReviewCarousel
Newsletter
```

Admin can:

```text
Enable/disable
Reorder
Change heading
Choose data source/filter
Select products manually
```

---

# 93. Media Architecture

Development:

```text
/public/images
```

Production:

```text
Object Storage + CDN
```

Store metadata only in SQL Server.

---

# 94. Product Image Rules

Recommended ratios:

```text
Product Card: 1:1
Fashion: 4:5 allowed
Hero: 16:6 or 16:7
Category: 1:1 or 4:3
```

Use:

```text
WebP / AVIF
Responsive image sizing
Lazy loading
```

---

# 95. Mobile Navigation

Option A:

```text
Home
Categories
Search
Wishlist
Account
```

Option B:

```text
Home
Explore
Cart
Orders
Account
```

Cart badge should always remain easy to reach.

---

# 96. Mobile Product Grid

Use 2 columns for normal compact product cards where readable.

Use 1 column for large promotional/product cards.

Avoid unreadably tiny typography.

---

# 97. Mobile Filters

Use bottom sheet:

```text
Filters
Category
Brand
Price
Rating
Attributes

[Clear] [Show 124 Products]
```

Sort is a separate sheet.

---

# 98. Mobile Product Detail

Order:

```text
Gallery
Title
Rating
Price
Offers
Variants
Delivery
Highlights
Specifications
Reviews
Related Products
```

Sticky bottom:

```text
[Add to Cart] [Buy Now]
```

Respect safe area.

---

# 99. Mobile Cart

Do not use tables.

Use cards and sticky bottom summary:

```text
Total ₹12,499
[Checkout]
```

---

# 100. Mobile Checkout

Use one main section at a time.

Ensure the virtual keyboard never covers:

```text
Continue
Pay
Place Order
```

---

# 101. WebView Requirements

Mandatory:

```text
Android WebView
iOS WKWebView
Chrome Android
Safari iOS
Samsung Internet
```

Rules:

- No hover-only interactions
- 44px+ important touch targets
- Safe-area support
- Keyboard-aware checkout
- No page-level horizontal overflow
- Touch-friendly carousels
- Return/review media upload works
- Payment redirects/deep links supported
- Avoid excessive blur/heavy animation

---

# 102. Payment in WebView

Architecture should support:

```text
Deep Link
External Browser Redirect
Return URL
Callback
Backend Webhook Verification
```

Backend remains authoritative.

---

# 103. Loading States

Create:

```text
ProductCardSkeleton
CategoryCardSkeleton
ProductDetailSkeleton
CartSkeleton
OrderSkeleton
AdminTableSkeleton
```

---

# 104. Empty States

Examples:

```text
Your cart is empty.
[Continue Shopping]
```

```text
No products match these filters.
[Clear Filters]
```

```text
No orders yet.
[Start Shopping]
```

---

# 105. Error Handling

Use consistent ProblemDetails.

Example:

```json
{
  "type": "inventory_conflict",
  "title": "Product is no longer available",
  "status": 409,
  "detail": "Only 1 unit remains in stock."
}
```

Handle:

```text
400
401
403
404
409
422
500
```

---

# 106. Concurrency

Use RowVersion / atomic operations for:

```text
ProductVariant
Inventory
Order
Coupon
```

---

# 107. Transactions

Use SQL transactions for:

```text
Order creation
Inventory reservation
Cancellation
Inventory adjustment
Return approval with stock changes
Refund records
```

Do not hold DB transactions while waiting for external payment/shipping APIs.

---

# 108. Idempotency

Required for:

```text
Order submission
Payment order creation
Payment verification
Payment webhook
Refund request
Shipping creation
```

---

# 109. Security

Minimum:

```text
HTTPS
JWT + refresh tokens
RBAC/permissions
Rate limiting
Input validation
Secure headers
CORS
Audit logging
Secure file upload
Secrets outside source control
```

Do not store raw payment-card data.

Prefer payment gateway tokenization/hosted methods.

---

# 110. Audit Logs

Track:

```text
Product created
Product price changed
Inventory adjusted
Order cancelled
Payment verified
Refund initiated
Coupon changed
Return approved
Permission changed
```

---

# 111. Notifications

Customer:

```text
Order Confirmed
Payment Successful
Packed
Shipped
Out for Delivery
Delivered
Return Update
Refund Update
```

Admin:

```text
New Order
Payment Failure
Low Stock
Return Request
Refund Issue
```

Future channels:

```text
In-app
Email
SMS
WhatsApp
Push
```

---

# 112. Background Jobs

Useful:

```text
Release expired inventory reservations
Send order updates
Process notifications
Abandoned cart reminders
Generate reports
Retry provider synchronization
```

---

# 113. SEO

Public SEO pages:

```text
Products
Categories
Brands
Collections
Content Pages
```

Support:

```text
Meta Title
Meta Description
Canonical
OpenGraph
Product Schema
Offer/Availability Schema
Breadcrumb Schema
```

---

# 114. Performance

Use:

```text
Route code splitting
TanStack Query caching
Lazy-loaded images
Image optimization
Server pagination
Debounced search
Dynamic imports
```

Avoid loading thousands of products at once.

---

# 115. Accessibility

Minimum:

```text
Semantic HTML
Keyboard navigation
Visible focus
Proper form labels
Accessible dialogs
Alt text
Color contrast
Reduced motion
44px touch targets
```

---

# 116. SQL Index Strategy

Examples:

```text
Products(Slug) UNIQUE
Products(CategoryId, Status)
Products(BrandId, Status)
ProductVariants(Sku) UNIQUE
ProductVariants(ProductId, IsActive)
Inventories(ProductVariantId)
Orders(OrderNumber) UNIQUE
Orders(CustomerId, CreatedAt)
Orders(Status, CreatedAt)
OrderItems(OrderId)
Payments(OrderId, Status)
Reviews(ProductId, Status)
WishlistItems(CustomerId, ProductId) UNIQUE
Coupons(Code) UNIQUE
```

---

# 117. Reports

Admin reports:

```text
Sales
Revenue
Orders
Average Order Value
Products
Categories
Brands
Inventory
Low Stock
Customers
Repeat Customers
Coupons
Discounts
Returns
Refunds
Payments
Shipping
```

Filters:

```text
Today
Yesterday
7 Days
30 Days
Quarter
Year
Custom
```

---

# 118. Seed Data

Seed realistic development data.

Categories:

```text
Electronics
Mobiles
Laptops
Fashion
Home & Kitchen
Beauty
Sports
Books
Accessories
Appliances
```

At least:

```text
10 categories
20 subcategories
25 brands
100 products
250 variants
400 images
30 coupons/offers
100 reviews
50 customers
80 orders
```

Avoid lorem ipsum.

---

# 119. MVP Scope

## Storefront

- [ ] Home
- [ ] Categories
- [ ] Search
- [ ] Product Listing
- [ ] Filters
- [ ] Product Detail
- [ ] Variants
- [ ] Wishlist
- [ ] Cart
- [ ] Coupon
- [ ] Checkout
- [ ] Payment Simulator
- [ ] Order Confirmation

## Customer

- [ ] Register/Login
- [ ] Profile
- [ ] Addresses
- [ ] Orders
- [ ] Order Detail
- [ ] Cancellation
- [ ] Return Request
- [ ] Wishlist
- [ ] Reviews

## Admin

- [ ] Dashboard
- [ ] Categories
- [ ] Brands
- [ ] Products
- [ ] Variants
- [ ] Images
- [ ] Inventory
- [ ] Orders
- [ ] Returns
- [ ] Coupons
- [ ] Reviews
- [ ] Customers
- [ ] Reports
- [ ] Settings

---

# 120. Phase 2

```text
Real Payment Gateway
Shipping Aggregator
Invoice PDF
Email/SMS
Advanced Promotions
Product Comparison
Questions & Answers
Back-in-Stock Alerts
Abandoned Cart Recovery
Advanced Recommendations
Search Engine
```

---

# 121. Phase 3

```text
Multi-Vendor Marketplace
Seller Portal
Seller Payouts
Commissions
Multiple Warehouses
Multi-Currency
Multi-Language
Loyalty
Gift Cards
Subscriptions
B2B Pricing
Native Mobile Apps
AI Shopping Assistant
```

---

# 122. Future Multi-Vendor Entities

```text
Seller
SellerUser
SellerProduct
SellerOffer
SellerInventory
CommissionRule
Settlement
Payout
```

Do not implement until core commerce is stable.

---

# 123. Future AI Features

Possible:

```text
Natural Language Product Search
Shopping Assistant
Recommendations
Review Summaries
Product Description Generator
Support Assistant
Image Tagging
```

AI must never invent authoritative:

```text
Price
Stock
Discount
Delivery Date
```

---

# 124. Critical Flow A — Purchase

```text
Home
→ Search/Product List
→ Product Detail
→ Select Variant
→ Add to Cart
→ Cart
→ Address
→ Shipping
→ Backend Checkout Quote
→ Payment
→ Payment Verification
→ Order Confirmation
→ Inventory Update
→ My Orders
```

This is the highest-priority workflow.

---

# 125. Critical Flow B — Return

```text
Delivered Order
→ Select Item
→ Request Return
→ Admin Approves
→ Pickup/Return
→ Item Received
→ Refund Approved
→ Gateway Refund
→ Refund Complete
```

---

# 126. Critical Flow C — Admin Product

```text
Admin Login
→ Create Category
→ Create Product
→ Add Variants
→ Set Price
→ Upload Images
→ Add Stock
→ Publish
→ Product Appears on Storefront
```

---

# 127. Critical Flow D — Last Unit

```text
Stock = 1

Customer A Checkout
Customer B Checkout

Backend performs atomic inventory validation.

Only one order succeeds.
Other request receives 409 Conflict.
```

---

# 128. Coding Agent Build Order

## Stage 1

```text
React Vite
.NET Solution
SQL Server
EF Core
Auth
Permissions
API Client
Design System
```

## Stage 2

```text
Categories
Brands
Products
Variants
Images
Attributes
```

## Stage 3

```text
Homepage
Listings
Search
Filters
Product Detail
```

## Stage 4

```text
Anonymous Cart
Authenticated Cart
Cart Merge
Pricing Validation
```

## Stage 5

```text
Addresses
Shipping Methods
Checkout Quote
Coupons
```

## Stage 6

```text
Inventory
Inventory Reservation
Order Transaction
Price Snapshot
```

## Stage 7

```text
Payment Abstraction
Development Gateway
Verification
Idempotency
```

## Stage 8

```text
Customer Account
Orders
Wishlist
Profile
Addresses
```

## Stage 9

```text
Returns
Refund Records
Reviews
```

## Stage 10

```text
Admin Dashboard
Catalog
Inventory
Orders
Returns
Coupons
Reviews
Reports
```

## Stage 11

```text
Mobile/WebView Adaptation
```

## Stage 12

```text
Build
Tests
Migrations
Seed
End-to-End Verification
```

---

# 129. Coding Agent Master Prompt

Copy this file to the project root as:

```text
ECOMMERCE_ARCHITECTURE.md
```

Then give the coding agent:

```text
Build the complete VSR Commerce application described in ECOMMERCE_ARCHITECTURE.md.

The stack is fixed.

Frontend:
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Framer Motion

Backend:
- ASP.NET Core Web API
- C#
- Entity Framework Core
- JWT authentication
- refresh tokens
- permission-based authorization
- Clean Architecture principles

Database:
- Microsoft SQL Server

Build it as a modular monolith.
Do not introduce microservices for the initial release.

The UI must be modern, card-heavy and mobile-first.

Implement real end-to-end frontend/backend/database flows.
Do not stop at static mock screens.

Critical purchase flow:
Home
→ Product Search/List
→ Product Detail
→ Variant Selection
→ Add to Cart
→ Cart
→ Address
→ Shipping
→ Backend Checkout Quote
→ Payment
→ Verification
→ Order Confirmation
→ Inventory Update
→ My Orders.

All authoritative pricing, discounts, coupons, inventory, tax, shipping and totals must be calculated or validated in the backend.

Never trust price or stock sent by React.

Implement atomic/optimistic inventory concurrency so the final unit cannot be oversold.

Store immutable order and product pricing snapshots.

Implement:
- categories
- brands
- products
- product variants
- dynamic attributes
- images
- search
- filters
- wishlist
- cart
- checkout
- coupons
- promotions basic
- orders
- payments
- inventory
- shipping abstraction
- customer profile
- addresses
- cancellation
- returns
- refunds
- reviews
- admin portal
- reports
- audit logs

Use a development-only payment simulator until a real provider is configured.

Payment verification and webhooks must be idempotent.

Do not store raw payment card details.

Use object-storage-ready architecture for media.

The application must work smoothly on:
- desktop
- laptop
- tablet
- Android mobile browsers
- iPhone Safari
- Android WebView
- iOS WKWebView

Do not force desktop tables into mobile screens.
Use product/order cards and bottom sheets.

Checkout must be keyboard-safe and safe-area aware.

At completion:
1. run frontend production build
2. run dotnet build
3. run tests
4. apply/check EF Core migrations
5. seed realistic development catalog
6. verify cart
7. verify coupons
8. verify checkout quote
9. verify payment simulator success/failure
10. verify inventory concurrency
11. verify order confirmation
12. verify cancellation
13. verify return request
14. verify admin product creation
15. fix all TypeScript, C#, SQL, runtime, responsive and WebView issues
```

---

# 130. Definition of Done — Storefront

- [ ] Homepage
- [ ] Category Cards
- [ ] Product Cards
- [ ] Search
- [ ] Filters
- [ ] Product Listing
- [ ] Product Detail
- [ ] Variant Selection
- [ ] Stock Status
- [ ] Wishlist
- [ ] Add to Cart
- [ ] Cart Update/Remove
- [ ] Coupon
- [ ] Checkout
- [ ] Payment
- [ ] Order Success

---

# 131. Definition of Done — Customer

- [ ] Register/Login
- [ ] Profile
- [ ] Addresses
- [ ] My Orders
- [ ] Order Details
- [ ] Tracking
- [ ] Cancellation
- [ ] Return Request
- [ ] Refund Status
- [ ] Wishlist
- [ ] Reviews
- [ ] Notifications Basic

---

# 132. Definition of Done — Admin

- [ ] Dashboard
- [ ] Category CRUD
- [ ] Brand CRUD
- [ ] Product CRUD
- [ ] Variant Management
- [ ] Image Management
- [ ] Dynamic Attributes
- [ ] Pricing
- [ ] Inventory
- [ ] Order Management
- [ ] Return Management
- [ ] Refund-Ready Flow
- [ ] Coupon Management
- [ ] Promotions Basic
- [ ] Review Moderation
- [ ] Customer View
- [ ] Reports
- [ ] Audit Logs

---

# 133. Definition of Done — Engineering

- [ ] React build succeeds
- [ ] .NET build succeeds
- [ ] EF migrations work
- [ ] SQL seed works
- [ ] No TypeScript errors
- [ ] No C# errors
- [ ] No unhandled runtime errors
- [ ] Server-side pagination
- [ ] Money uses decimal
- [ ] Inventory concurrency handled
- [ ] Order transactions are safe
- [ ] Payment operations idempotent
- [ ] Pricing snapshots stored
- [ ] Secrets outside repository
- [ ] Uploads validated

---

# 134. Definition of Done — Mobile/WebView

- [ ] 320px works
- [ ] 360px works
- [ ] 375px works
- [ ] 390px works
- [ ] 430px works
- [ ] Tablet works
- [ ] No page-level horizontal overflow
- [ ] Product grid readable
- [ ] Filter sheet works
- [ ] Sticky cart/checkout CTA respects safe area
- [ ] Keyboard does not cover checkout actions
- [ ] Payment flow works in WebView
- [ ] Product carousel works with touch
- [ ] No hover-only actions

---

# 135. Final Product Benchmark

The final VSR Commerce product should feel like:

```text
A real modern shopping application,
not a generic CRUD project.
```

Main benchmark:

```text
FAST DISCOVERY
     ↓
CLEAR PRODUCT INFO
     ↓
EASY CART
     ↓
TRUSTED CHECKOUT
     ↓
RELIABLE PAYMENT
     ↓
ORDER VISIBILITY
     ↓
EASY RETURNS
```

Keep the implementation simple enough for a coding agent to build quickly while preserving strong foundations for a commercial product.
