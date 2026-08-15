# Interior Design App — Frontend MVP Architecture

## 1. MVP Objective

Build a simple, professional interior-design web application where a user can:

```text
Login
  ↓
Create Project
  ↓
Add Room
  ↓
Upload Room Image
  ↓
Select Design Preferences
  ↓
Generate AI Design
  ↓
View Designs
  ↓
Select / Save Design
  ↓
View Products
  ↓
Generate Cost Estimate
```

---

# 2. Frontend Technology Stack

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
React Router
TanStack Query
Zustand
React Hook Form
Zod
Lucide Icons
```

---

# 3. Frontend Application Structure

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── cards/
│   ├── forms/
│   ├── modals/
│   └── loaders/
│
├── features/
│   │
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   └── components/
│   │
│   ├── projects/
│   │   ├── pages/
│   │   │   ├── Projects.tsx
│   │   │   ├── CreateProject.tsx
│   │   │   └── ProjectDetails.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── rooms/
│   │   ├── pages/
│   │   │   ├── RoomDetails.tsx
│   │   │   └── AddRoom.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── designs/
│   │   ├── pages/
│   │   │   ├── Designs.tsx
│   │   │   └── DesignDetails.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── ai/
│   │   ├── pages/
│   │   │   ├── GenerateDesign.tsx
│   │   │   └── AIResults.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── products/
│   │   ├── pages/
│   │   │   ├── Products.tsx
│   │   │   └── ProductDetails.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   └── quotations/
│       ├── pages/
│       │   └── Quotation.tsx
│       ├── components/
│       ├── services/
│       └── types.ts
│
├── layouts/
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
│
├── services/
│   ├── api.ts
│   ├── authApi.ts
│   ├── projectApi.ts
│   ├── roomApi.ts
│   ├── designApi.ts
│   ├── aiApi.ts
│   ├── productApi.ts
│   └── quotationApi.ts
│
├── store/
│   ├── authStore.ts
│   └── uiStore.ts
│
├── hooks/
│
├── types/
│
├── utils/
│
├── assets/
│
└── styles/
```

---

# 4. MVP Pages

## Authentication

```text
/login
/register
/forgot-password
```

### Login

Features:

* Email
* Password
* Remember me
* Login
* Forgot password
* Register

---

# 5. Dashboard

Route:

```text
/dashboard
```

Dashboard should show:

```text
Welcome back!

[ + Create New Project ]

----------------------------------------

Active Projects        AI Designs
       3                   12

----------------------------------------

Recent Projects

Living Room Renovation
Master Bedroom
Kitchen Design

----------------------------------------

Recent AI Designs

Design 1
Design 2
Design 3
```

---

# 6. Projects

Route:

```text
/projects
```

Features:

* View projects
* Search projects
* Filter projects
* Create project
* Open project
* Delete project

Project card:

```text
┌─────────────────────────────┐
│        Room Preview         │
│                             │
├─────────────────────────────┤
│ Living Room Renovation      │
│ Modern Interior             │
│ 3 Designs                   │
│                             │
│ [Open Project]              │
└─────────────────────────────┘
```

---

# 7. Create Project

Route:

```text
/projects/new
```

## Step 1 — Project Information

```text
Project Name
Property Type
Location
Total Area
Budget
```

Property types:

```text
Apartment
Villa
House
Office
Commercial
Other
```

## Step 2 — Add Rooms

```text
Living Room
Master Bedroom
Kitchen
Bathroom
Dining Room
Other
```

## Step 3 — Complete Project

Redirect to:

```text
/projects/{projectId}
```

---

# 8. Project Details

Route:

```text
/projects/:projectId
```

Layout:

```text
Project Name
Property Type
Budget
Status

------------------------------------

Rooms

[Living Room]
[Bedroom]
[Kitchen]

------------------------------------

Designs

[Design 1]
[Design 2]
[Design 3]

------------------------------------

[Generate New Design]
```

---

# 9. Room Management

Route:

```text
/projects/:projectId/rooms
/projects/:projectId/rooms/:roomId
```

Room information:

```text
Room Name
Room Type
Length
Width
Height
Notes
```

Example:

```text
Living Room

12 ft × 15 ft

Height: 10 ft

Budget: ₹2,00,000
```

---

# 10. Upload Room Image

The user should be able to:

```text
Upload Image
      ↓
Preview
      ↓
Remove / Replace
      ↓
Continue
```

Supported:

```text
JPG
PNG
WEBP
```

UI:

```text
┌───────────────────────────────┐
│                               │
│       Drag & Drop Image       │
│                               │
│       [ Browse Files ]        │
│                               │
└───────────────────────────────┘
```

---

# 11. AI Design Generation

Route:

```text
/projects/:projectId/rooms/:roomId/generate
```

## Design Preferences

### Style

```text
Modern
Minimal
Luxury
Scandinavian
Traditional
Industrial
Contemporary
```

### Color

```text
White
Beige
Grey
Wood
Blue
Green
Custom
```

### Budget

```text
₹50,000
₹1,00,000
₹2,00,000
₹5,00,000
Custom
```

### Requirements

Free-text input:

```text
Example:

I want an L-shaped sofa,
TV unit and warm lighting.
```

### Main CTA

```text
[ Generate Design ]
```

---

# 12. AI Generation State

Show proper progress instead of freezing the screen.

```text
Preparing room...
       ↓
Analyzing image...
       ↓
Creating design...
       ↓
Finalizing...
       ↓
Design Ready
```

Possible states:

```text
IDLE
UPLOADING
PROCESSING
GENERATING
COMPLETED
FAILED
```

---

# 13. AI Results

Route:

```text
/projects/:projectId/designs
```

Display multiple designs:

```text
AI Generated Designs

┌────────────┐ ┌────────────┐ ┌────────────┐
│            │ │            │ │            │
│ Design 01  │ │ Design 02  │ │ Design 03  │
│            │ │            │ │            │
├────────────┤ ├────────────┤ ├────────────┤
│ Modern     │ │ Luxury     │ │ Minimal    │
│ ₹2.1L      │ │ ₹2.8L      │ │ ₹1.9L      │
│ [View]     │ │ [View]     │ │ [View]     │
└────────────┘ └────────────┘ └────────────┘
```

Actions:

```text
View
Save
Favorite
Download
Share
Modify
```

---

# 14. Design Details

Route:

```text
/projects/:projectId/designs/:designId
```

Layout:

```text
┌─────────────────────────────────────────┐
│                                         │
│              DESIGN IMAGE               │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Modern Living Room

Style: Modern
Budget: ₹2,45,000

------------------------------------------

Products Used

Sofa                 ₹55,000
TV Unit              ₹30,000
Lighting             ₹15,000

------------------------------------------

[ Modify Design ]
[ Save Design ]
[ Download ]
[ Share ]
```

---

# 15. Modify Design

Allow simple text-based modification.

```text
┌─────────────────────────────────┐
│ What would you like to change?  │
│                                 │
│ Make the sofa blue and add      │
│ indoor plants.                  │
│                                 │
│ [ Modify Design ]               │
└─────────────────────────────────┘
```

Examples:

```text
Make it more luxurious.

Change the wall color to beige.

Add a study table.

Replace the sofa.

Add warm lighting.
```

---

# 16. Design History

Each AI modification creates a version.

```text
Design V1
   ↓
Design V2
   ↓
Design V3
   ↓
Design V4
```

UI:

```text
Version History

V4  Current
V3
V2
V1
```

Actions:

```text
View
Restore
Compare
```

---

# 17. Product Catalog

Route:

```text
/products
/products/:productId
```

Categories:

```text
Furniture
Lighting
Decor
Flooring
Wall
Kitchen
Bedroom
```

Product card:

```text
┌──────────────────────┐
│                      │
│    Product Image     │
│                      │
├──────────────────────┤
│ Modern Sofa          │
│ ₹45,000              │
│                      │
│ [View Product]       │
└──────────────────────┘
```

---

# 18. Product Details

Display:

```text
Product Image

Modern Sofa

₹45,000

Material: Fabric
Color: Beige
Width: 7 ft
Depth: 3 ft

[Add to Design]
```

---

# 19. Selected Products

Inside a design:

```text
Selected Products

Sofa              ₹45,000
TV Unit           ₹30,000
Lighting          ₹15,000
Curtains          ₹20,000

--------------------------------
Estimated Total   ₹1,10,000
```

---

# 20. Quotation / Cost Estimate

Route:

```text
/projects/:projectId/quotation
```

Display:

```text
Project Cost Estimate

Furniture             ₹1,20,000
Lighting                ₹30,000
Flooring                ₹50,000
Wall Treatment          ₹25,000
Decor                   ₹20,000
--------------------------------
Estimated Total       ₹2,45,000

[Download PDF]
[Share]
```

For MVP, this is an **estimate**, not a full accounting system.

---

# 21. Navigation

## Desktop

```text
┌─────────────────────────────────────────────┐
│ Logo                              Profile   │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Dashboard    │                              │
│ Projects     │        Main Content          │
│ Designs      │                              │
│ Products     │                              │
│ Quotations   │                              │
│              │                              │
│ Settings     │                              │
└──────────────┴──────────────────────────────┘
```

## Mobile

```text
Home
Projects
Designs
Products
Profile
```

---

# 22. Design System

Create a consistent design system from the beginning.

## Components

```text
Button
Input
Select
Checkbox
Radio
Dropdown
Modal
Drawer
Card
Badge
Tabs
Table
Pagination
Toast
Tooltip
Dialog
FileUpload
ImageGallery
Skeleton
Loader
```

## Interior-specific components

```text
ProjectCard
RoomCard
DesignCard
DesignGallery
DesignComparison
RoomImageUploader
AIGenerationProgress
ProductCard
ProductSelector
BudgetCard
CostBreakdown
VersionTimeline
```

---

# 23. Responsive Design

Support:

```text
Desktop
Tablet
Mobile
```

Priority:

```text
Desktop → Primary
Tablet  → Supported
Mobile  → Responsive MVP
```

---

# 24. Frontend State

Use **TanStack Query** for server state:

```text
Projects
Rooms
Designs
Products
Quotations
AI Jobs
```

Use **Zustand** for local/global UI state:

```text
Authentication
Selected Project
UI preferences
Modal state
Sidebar state
```

---

# 25. Forms

Use:

```text
React Hook Form
+
Zod
```

Validate:

```text
Project Name
Budget
Room Dimensions
Image Upload
Design Preferences
Product Selection
```

---

# 26. API Integration Layer

Keep API calls separate from components.

```text
services/
│
├── api.ts
├── authApi.ts
├── projectApi.ts
├── roomApi.ts
├── designApi.ts
├── aiApi.ts
├── productApi.ts
└── quotationApi.ts
```

Example:

```text
Component
   ↓
React Query Hook
   ↓
API Service
   ↓
Backend API
```

Do not put API calls directly inside UI components.

---

# 27. Loading & Error States

Every API-driven page should have:

```text
Loading
Success
Empty
Error
Retry
```

Example:

```text
Loading designs...

No designs yet.

[ Generate Your First Design ]

Unable to load designs.

[ Retry ]
```

---

# 28. MVP Route Map

```text
/auth
  /login
  /register
  /forgot-password

/dashboard

/projects
/projects/new
/projects/:projectId

/projects/:projectId/rooms
/projects/:projectId/rooms/new
/projects/:projectId/rooms/:roomId

/projects/:projectId/generate

/projects/:projectId/designs
/projects/:projectId/designs/:designId

/products
/products/:productId

/projects/:projectId/quotation

/profile
/settings
```

---

# 29. MVP Frontend Feature Priority

## P0 — Must Have

```text
✓ Login/Register
✓ Dashboard
✓ Create Project
✓ Add Room
✓ Upload Room Image
✓ Design Preferences
✓ AI Design Generation UI
✓ AI Results
✓ Design Details
✓ Save Design
✓ Design History
✓ Product Catalog
✓ Cost Estimate
```

## P1 — Should Have

```text
✓ Modify Design
✓ Favorites
✓ Design Sharing
✓ Download Design
✓ PDF Quotation
✓ Search Products
✓ Product Filters
✓ Responsive Mobile UI
```

## P2 — Later

```text
✗ 3D Editor
✗ AR
✗ Advanced Floor Planner
✗ Real-time Collaboration
✗ Designer Marketplace
✗ Vendor Portal
✗ Full Project Management
✗ Inventory
✗ Advanced Analytics
```

---

# 30. Final MVP Frontend

The complete MVP frontend should revolve around these **7 screens/modules**:

```text
                 INTERIOR DESIGN MVP
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   Dashboard          Projects          Products
       │                 │
       │                 ▼
       │               Rooms
       │                 │
       │                 ▼
       │             AI Design
       │                 │
       │                 ▼
       │              Designs
       │                 │
       └─────────────────┼─────────────────┘
                         ▼
                    Cost Estimate
```

### Core product experience

```text
Dashboard
    ↓
Project
    ↓
Room
    ↓
Upload Image
    ↓
Choose Style + Budget
    ↓
Generate AI Design
    ↓
Compare Designs
    ↓
Customize / Save
    ↓
Select Products
    ↓
View Cost Estimate
```

**This is the frontend MVP.** Build this flow extremely well before adding 3D, AR, marketplace, designer management, or other enterprise features.
