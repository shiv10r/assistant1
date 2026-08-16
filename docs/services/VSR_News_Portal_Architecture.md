# VSR News — Full-Stack News Platform Architecture

> Coding-agent-ready architecture for a modern, card-heavy news application.
>
> **Stack:** React + TypeScript + Vite | ASP.NET Core Web API + C# | Entity Framework Core | Microsoft SQL Server | Modular Monolith | Desktop + Mobile + Android/iOS WebView

---

## 1. Product Vision

Build an original VSR News platform with the functional depth of a large digital news portal, without cloning another site's UI or content.

The platform should support:

- Breaking news
- Latest news
- Trending stories
- India / World / Business / Technology / Sports / Entertainment / Lifestyle / Health / Science / Education
- Local/city news
- Opinion/editorials
- Video stories
- Photo stories
- Live blogs
- Topic/tag pages
- Search
- Bookmarks
- Personalized feed
- User accounts
- Notifications-ready architecture
- Reporter/editor/admin CMS
- Homepage section management
- RSS/source aggregation-ready architecture
- SEO and social metadata
- Advertisement-slot-ready architecture
- Analytics-ready architecture

---

## 2. Product Surfaces

### Public Site

```text
Home
Latest
Trending
Categories
Topics
Article Detail
Live Blog
Videos
Photos
Search
Bookmarks
About
Contact
```

### Reader Account

```text
Login / Register
Profile
Bookmarks
Following
Notification Preferences
Reading History
```

### Editorial/Admin Portal

```text
Dashboard
Articles
Breaking News
Categories
Topics
Authors
Live Blogs
Videos
Photo Stories
Media Library
Homepage CMS
SEO
Source Feeds
Users/Roles
Analytics
Audit Logs
Settings
```

---

## 3. High-Level Architecture

```text
Desktop / Tablet / Mobile / WebView
                │
                ▼
      React + TypeScript + Vite
                │ REST/JSON
                ▼
         ASP.NET Core Web API
                │
     ┌──────────┼───────────┐
     │          │           │
 Articles    Search      Editorial
     │          │           │
     └──────────┼───────────┘
                ▼
            SQL Server
```

Optional later:

```text
Redis
SignalR
Object Storage + CDN
Push Notifications
Email
Dedicated Search Engine
RSS/Scraper Worker
```

---

## 4. React Frontend Structure

```text
frontend/vsr-news-web/
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
│   │   ├── media/
│   │   ├── ads/
│   │   ├── search/
│   │   └── shared/
│   ├── features/
│   │   ├── home/
│   │   ├── news/
│   │   ├── categories/
│   │   ├── topics/
│   │   ├── search/
│   │   ├── live/
│   │   ├── videos/
│   │   ├── photos/
│   │   ├── bookmarks/
│   │   ├── account/
│   │   └── admin/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── main.tsx
│   └── App.tsx
└── public/
```

Recommended frontend packages:

```text
React Router
TanStack Query
Zustand
React Hook Form
Zod
Tailwind CSS
shadcn/ui
Lucide React
Framer Motion
Embla Carousel / Swiper
Sonner
Recharts
```

---

## 5. Public Routes

```text
/
/latest
/trending
/category/:slug
/topic/:slug
/tag/:slug
/author/:slug
/news/:slug
/live/:slug
/videos
/videos/:slug
/photos
/photos/:slug
/search?q=
/bookmarks
/login
/register
/profile
/about
/contact
/privacy
/terms
```

---

## 6. Homepage UI — Card Heavy

Recommended order:

```text
Top Header
Breaking News Ticker
Primary Navigation
Lead Story Grid
Top Stories
Latest News
Trending Now
India
World
Business
Technology
Sports
Entertainment
Video Stories
Photo Stories
Opinion
Most Read
Newsletter CTA
Footer
```

### Lead Story Grid

Desktop:

```text
┌──────────────────────────────┬──────────────────┐
│                              │ Story Card 2     │
│       Main Lead Story        ├──────────────────┤
│                              │ Story Card 3     │
└──────────────────────────────┴──────────────────┘
```

Mobile:

```text
Lead Card
Story Card
Story Card
Horizontal Trending Rail
```

---

## 7. Reusable UI Cards

Create a dedicated news card library:

```text
LeadStoryCard
NewsCard
CompactNewsCard
HorizontalNewsCard
BreakingNewsCard
TrendingCard
MostReadCard
VideoNewsCard
PhotoStoryCard
OpinionCard
LiveBlogCard
TopicCard
CategoryCard
AuthorCard
NewsletterCard
AdSlotCard
```

Each normal story card should support:

```text
Image
Category badge
Headline
Optional summary
Published time
Read time
Author
Bookmark action
Optional live/breaking badge
```

---

## 8. Header and Navigation

Desktop:

```text
VSR News
Home | Latest | India | World | Business | Technology | Sports | Entertainment | More
Search | Saved | Login/Profile
```

Mobile:

```text
☰   VSR News   Search   Saved
```

Optional mobile bottom navigation:

```text
Home | Latest | Search | Saved | Menu
```

---

## 9. Breaking News Ticker

Features:

- Clickable breaking headlines
- Pause on hover/focus
- Accessible keyboard controls
- Reduced-motion-safe behavior
- Mobile horizontal scroll
- WebView-compatible implementation

Do not make the ticker essential for accessing a story.

---

## 10. Category Page

Example:

```text
/category/technology
```

Layout:

```text
Category Heading
Top Story Grid
Latest Stories
Trending in Technology
Videos
Most Read
Related Topics
```

Category tabs:

```text
Latest | Popular | Videos | Analysis
```

---

## 11. Article Detail Page

Structure:

```text
Breadcrumb
Category
Headline
Subheadline
Author
Published / Updated time
Share + Bookmark
Hero image/video
Article body
Related inline stories
Tags
Author bio
Recommended stories
More from category
```

Desktop right rail may contain:

```text
Most Read
Trending
Ad Slot
```

Mobile moves it below the article.

---

## 12. Structured Article Blocks

Do not save the complete story as unsafe arbitrary HTML only.

Support blocks:

```text
Paragraph
Heading
Quote
Image
Gallery
Video
Embed
Bullet List
Numbered List
Table
Fact Box
Timeline
Related Story
Poll
Ad Slot
```

Render through controlled React components.

---

## 13. Live Blog

```text
/live/:slug
```

Use for:

```text
Elections
Sports matches
Budget
Breaking events
Product launches
```

UI:

```text
LIVE badge
Headline
Last updated
Follow

10:42 PM
Update headline
Update body
Media
```

Future SignalR can push updates without refresh.

---

## 14. Videos and Photo Stories

### Video Card

```text
Poster
Play icon
Duration
Headline
Category
Published time
```

### Photo Story Card

```text
Cover image
Headline
Photo count
Category
```

Mobile video rules:

- `playsInline`
- poster required
- lazy load
- no forced autoplay
- pause when off-screen

---

## 15. Search

Search across:

```text
Headline
Summary
Body
Category
Topic
Tag
Author
```

MVP:

- SQL Server filtering/full-text-ready design
- indexed searchable fields

Later:

```text
Azure AI Search
Elasticsearch/OpenSearch
```

Search filters:

```text
All
News
Videos
Photos
Category
Author
Date
```

---

## 16. Reader Personalization

Phase 1 should stay rule-based.

Users can follow:

```text
Categories
Topics
Authors
```

“For You” ranking can use:

```text
Followed categories
Read history
Topic affinity
Freshness
Popularity
```

Do not add ML before the product needs it.

---

## 17. Bookmarks

```text
/bookmarks
```

Support:

- save/unsave
- filter by category
- sort by saved date
- anonymous localStorage option
- merge after login

---

## 18. Newsletter / Notifications

Newsletter card:

```text
Daily News Brief
Top stories in your inbox.

[email___________] [Subscribe]
```

Notification-ready events:

```text
Breaking story
Followed topic update
Live blog update
Daily digest
```

---

## 19. Advertisement-Ready Slots

Create generic components:

```text
TopBannerAd
InlineArticleAd
SidebarAd
FeedAd
StickyMobileAd
```

Keep the provider abstract. Ads must not break layout, obscure content, or create accidental taps.

---

## 20. Backend Solution Structure

```text
backend/
├── VSR.News.Api/
├── VSR.News.Application/
├── VSR.News.Domain/
├── VSR.News.Infrastructure/
├── VSR.News.Contracts/
└── VSR.News.Tests/
```

### Modules

```text
Identity
Articles
Categories
Topics
Authors
Media
LiveBlogs
Videos
PhotoStories
Search
Bookmarks
Personalization
Notifications
Newsletter
Cms
Aggregation
Analytics
Admin
Audit
```

---

## 21. Core Domain Entities

```text
User
Role
Permission
RefreshToken

Article
ArticleRevision
ArticleContentBlock
Category
Topic
Tag
ArticleTopic
ArticleTag
Author
MediaAsset

LiveBlog
LiveBlogEntry
VideoStory
PhotoStory
PhotoStoryImage

Bookmark
Follow
Notification
NewsletterSubscriber

SourceFeed
ImportedStory

SiteSection
SiteBanner
AuditLog
```

---

## 22. SQL Server Tables

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens

Articles
ArticleRevisions
ArticleContentBlocks
Categories
Topics
Tags
ArticleTopics
ArticleTags
Authors
MediaAssets

LiveBlogs
LiveBlogEntries
VideoStories
PhotoStories
PhotoStoryImages

Bookmarks
Follows
Notifications
NewsletterSubscribers

SourceFeeds
ImportedStories

SiteSections
SiteBanners
SiteSettings
AuditLogs
```

---

## 23. Articles Table

```text
Id
Slug
Headline
Subheadline
Summary
CategoryId
AuthorId
Status
StoryType
HeroMediaId
PublishedAt
UpdatedAt
IsBreaking
IsFeatured
IsTrending
ReadTimeMinutes
ViewCount
SeoTitle
SeoDescription
CanonicalUrl
CreatedAt
CreatedBy
RowVersion
```

Statuses:

```text
Draft
InReview
Approved
Scheduled
Published
Unpublished
Archived
```

---

## 24. Editorial Workflow

```text
Reporter creates Draft
        ↓
Submit for Review
        ↓
Editor Reviews
        ↓
Changes Requested OR Approved
        ↓
Schedule / Publish
        ↓
Public Site
```

Permissions:

```text
article.create
article.edit_own
article.edit_all
article.review
article.approve
article.publish
article.unpublish
category.manage
media.manage
homepage.manage
user.manage
```

---

## 25. Revision History

Every important update creates an article revision.

```text
ArticleId
RevisionNumber
SnapshotJson
ChangedBy
ChangedAt
ChangeNote
```

Admin should be able to compare and restore revisions.

---

## 26. API Design

Base:

```text
/api/v1
```

Public:

```text
GET /home
GET /latest
GET /trending
GET /categories
GET /categories/{slug}
GET /topics/{slug}
GET /articles/{slug}
GET /live/{slug}
GET /videos
GET /photos
GET /search?q=
```

Auth/User:

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /me/bookmarks
POST /me/bookmarks
DELETE /me/bookmarks/{articleId}
GET /me/follows
POST /me/follows
```

Admin:

```text
GET  /admin/articles
POST /admin/articles
PUT  /admin/articles/{id}
POST /admin/articles/{id}/submit
POST /admin/articles/{id}/approve
POST /admin/articles/{id}/publish
POST /admin/live-blogs
POST /admin/live-blogs/{id}/entries
POST /admin/media
GET  /admin/audit
```

---

## 27. RSS / Source Aggregation Architecture

Optional ingestion pipeline:

```text
Source Feed
   ↓
Background Worker
   ↓
Fetch permitted RSS/API/public source
   ↓
Parse + Normalize
   ↓
Duplicate Detection
   ↓
Imported Story
   ↓
Editor Review
   ↓
Publish as Article
```

Rules:

- Respect source terms and automated-access restrictions
- Keep source URL and attribution
- Do not copy full copyrighted stories without rights
- Prefer metadata, summaries, licensed feeds, or original reporting

---

## 28. Duplicate Detection

Use:

```text
Normalized URL
External source ID
Headline similarity
Content hash
Publication timestamp
```

---

## 29. Media Architecture

Development:

```text
/public/images
/public/videos
```

Production:

```text
Object Storage + CDN
```

SQL stores:

```text
MediaAssetId
StorageKey
Url
Type
AltText
Width
Height
Duration
CreatedAt
```

---

## 30. Admin Dashboard

Metric cards:

```text
Published Today
Drafts
Pending Review
Scheduled
Breaking Stories
Live Blogs
Views Today
Top Article
Top Category
```

Charts:

```text
Views trend
Articles published
Category performance
Top authors
```

---

## 31. Homepage CMS

Admin can configure:

```text
Hero
Breaking
TopStories
Latest
Trending
CategoryGrid
VideoRail
PhotoRail
Opinion
MostRead
Newsletter
```

Per section:

```text
Heading
Enabled
Display order
Layout
Manual story selection
Automatic rule
```

---

## 32. Security

Use:

```text
HTTPS
JWT + refresh tokens
Permission-based authorization
Rate limiting
Input validation
HTML sanitization
Safe media upload validation
Audit logs
Secrets outside source control
```

Prevent:

- XSS
- unsafe embeds
- arbitrary script injection
- privilege escalation

---

## 33. Mobile and WebView Requirements

Mandatory:

```text
Android WebView
iOS WKWebView
Chrome Android
Safari iOS
320px+ screens
```

Rules:

- no hover-only interaction
- 44px+ important touch targets
- safe-area support
- keyboard-safe login/search forms
- lazy-load images
- poster fallback for videos
- no page-level horizontal overflow
- reduced-motion support

---

## 34. Performance

Use:

```text
Route-level code splitting
TanStack Query caching
Lazy images/video
Pagination or cursor feeds
Debounced search
CDN for media
Skeleton states
```

Do not load hundreds of articles on first render.

---

## 35. SEO

Article pages support:

```text
Meta title
Meta description
Canonical URL
OpenGraph
Twitter cards
Article structured data
Breadcrumb structured data
Author metadata
Published/updated timestamps
```

Design for normal sitemap + news sitemap generation.

---

## 36. Seed Data

Development seed:

```text
12 categories
20 topics
8 authors
80 articles
10 trending/breaking stories
10 videos
6 photo stories
4 opinion pieces
3 live blogs
```

Use realistic demo content, not lorem ipsum.

---

## 37. MVP Build Order

```text
1. React shell
2. ASP.NET Core solution
3. SQL Server + EF Core migrations
4. Auth and permissions
5. Categories/topics/authors
6. Article CRUD
7. Homepage
8. Article detail
9. Search
10. Bookmarks
11. Editorial workflow
12. Admin CMS
13. Live blogs
14. Videos/photos
15. Aggregation-ready module
16. Mobile/WebView polish
17. Build/test/fix
```

---

## 38. Coding Agent Master Prompt

```text
Build the complete VSR News platform described in this document.

Fixed stack:
React + TypeScript + Vite + Tailwind + shadcn/ui + React Router + TanStack Query.
ASP.NET Core Web API + C# + Entity Framework Core.
Microsoft SQL Server.

Use a modular monolith with Clean Architecture principles.

The UI must be modern, image-led and card-heavy.
Implement a real frontend-to-backend system, not static mock pages.

Required:
- homepage
- breaking ticker
- latest/trending
- category/topic pages
- article detail
- structured article blocks
- videos
- photo stories
- live blogs
- search
- bookmarks
- authentication
- reporter/editor/admin CMS
- editorial approval workflow
- homepage section management
- media library
- audit logs

Keep controllers thin.
Use permission-based authorization.
Sanitize article rendering.
Use EF Core migrations and realistic seed data.
Support desktop, tablet, mobile browser, Android WebView and iOS WKWebView.

At the end:
1. npm production build
2. dotnet build
3. tests
4. migrations
5. seed database
6. fix all frontend/backend/runtime errors
```

---

## 39. Definition of Done

### Public

- [ ] Card-heavy homepage
- [ ] Breaking ticker
- [ ] Latest/trending
- [ ] Categories
- [ ] Topics
- [ ] Article detail
- [ ] Videos
- [ ] Photo stories
- [ ] Live blogs
- [ ] Search
- [ ] Bookmarks
- [ ] Responsive mobile UI

### Admin

- [ ] Dashboard
- [ ] Article CRUD
- [ ] Draft/review/approve/publish workflow
- [ ] Categories/topics/authors
- [ ] Media library
- [ ] Live blog management
- [ ] Homepage CMS
- [ ] SEO fields
- [ ] Audit logs

### Engineering

- [ ] React build succeeds
- [ ] .NET build succeeds
- [ ] EF migrations succeed
- [ ] SQL seed succeeds
- [ ] No TypeScript errors
- [ ] No unhandled API errors
- [ ] No mobile horizontal overflow
- [ ] Android/iOS WebView safe
