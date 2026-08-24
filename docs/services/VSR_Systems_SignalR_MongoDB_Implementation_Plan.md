# VSR Systems — SignalR + MongoDB Implementation Plan

> **Purpose:** Coding-agent-ready implementation plan to add **ASP.NET Core SignalR** and **MongoDB** to the existing VSR Systems platform while preserving the current React + .NET + PostgreSQL modular-monolith architecture.
>
> **Recommended design:** PostgreSQL remains the primary transactional database. MongoDB is introduced only for document-oriented workloads where it has a clear technical purpose.
>
> **Initial real-time use cases:**
> 1. Home Services booking-status updates using SignalR.
> 2. Real-time chat using SignalR + MongoDB.
> 3. Future AI conversation history / flexible event documents in MongoDB.
>
> **Important:** Do not migrate existing PostgreSQL business tables to MongoDB.

---

# 1. Current Architecture — Keep It

```text
Frontend       React + TypeScript + Vite
Hosting        Netlify

Backend        ASP.NET Core / .NET
Hosting        Render

Primary DB     PostgreSQL / Supabase

New DB         MongoDB
Realtime       ASP.NET Core SignalR
```

Deployment remains:

```text
ONE React frontend
ONE ASP.NET Core backend
ONE PostgreSQL database
ONE MongoDB database/cluster
ONE production branch
```

Do not introduce:

```text
Microservices
Separate SignalR service
Separate chat backend
Kafka
RabbitMQ
Kubernetes
Azure SignalR Service
Redis SignalR backplane
```

for the initial implementation.

---

# 2. Why Use Both PostgreSQL and MongoDB?

They solve different problems.

## PostgreSQL

Use for strongly relational and transactional business data:

```text
Users
Roles
Permissions
Customers
Students
Professionals
Bookings
Orders
Invoices
Payments
Refunds
Inventory
Fees
Hotel reservations
Job applications
Travel bookings
Audit/business transactions
```

Use PostgreSQL when:

```text
Foreign keys matter
Transactions matter
Financial accuracy matters
Relational joins matter
Data structure is stable
```

## MongoDB

Use for document-oriented or flexible data:

```text
Realtime chat messages
AI conversation history
Flexible message payloads
Message reactions
Message metadata
External raw API payloads
Scraper raw data
Future activity feed documents
Flexible AI/tool execution history
```

Use MongoDB when:

```text
Schema varies frequently
Nested JSON is natural
High-volume append-style documents are common
Data is read/written as complete documents
```

---

# 3. Recommended Polyglot Architecture

```text
                          REACT
                            │
                 ┌──────────┴──────────┐
                 │                     │
                REST                SignalR
                 │                     │
                 ▼                     ▼
                  ASP.NET CORE BACKEND
                           │
          ┌────────────────┼────────────────┐
          │                                 │
          ▼                                 ▼
     PostgreSQL                         MongoDB
   Transactional DB                  Document Store
          │                                 │
    Bookings                          Chat Messages
    Payments                          AI Conversations
    Customers                         Flexible Payloads
    Inventory                         Raw Documents
    Orders
```

Rule:

> **Do not choose MongoDB instead of PostgreSQL. Use MongoDB alongside PostgreSQL for the workloads it fits.**

---

# 4. Main Implementation Goals

Implement these incrementally:

```text
PHASE 1
SignalR platform foundation
+
Home Services booking live updates

PHASE 2
MongoDB platform foundation
+
health check / repository abstraction

PHASE 3
SignalR + MongoDB real-time chat

PHASE 4
AI conversation history in MongoDB

PHASE 5
Optional MongoDB use in Jobs scraper/raw external payloads
```

Do not implement all modules simultaneously.

---

# 5. Phase 1 — SignalR Platform Foundation

Implement:

```text
JWT-authenticated SignalR hub
One SignalR connection per browser session
Automatic reconnect
User-targeted events
Tenant-targeted events
Authorized context groups
Home Services booking-status live update
Structured logs
Tests
```

Initial hub:

```text
/hubs/realtime
```

SignalR runs inside the existing ASP.NET Core backend.

---

# 6. SignalR Responsibility

SignalR is used for:

```text
Live booking updates
Chat delivery
Live notifications
Admin dashboard refresh signals
Future tracking events
```

SignalR is **not** used as permanent storage.

Wrong:

```text
SignalR message
     ↓
nothing persisted
```

Correct for transactional state:

```text
PostgreSQL commit
     ↓
SignalR event
```

Correct for chat:

```text
MongoDB message insert
     ↓
SignalR event
```

---

# 7. SignalR Backend Structure

```text
VSRSystemsBackend.Application/
└── Platform/
    └── Realtime/
        ├── Contracts/
        │   ├── RealtimeEventEnvelope.cs
        │   └── RealtimeEventTypes.cs
        ├── Interfaces/
        │   ├── IRealtimePublisher.cs
        │   └── IRealtimeSubscriptionAuthorizer.cs
        └── Models/

VSRSystemsBackend.Infrastructure/
└── Platform/
    └── Realtime/
        └── SignalRRealtimePublisher.cs

VSRSystemsBackend.Api/
└── Platform/
    └── Realtime/
        ├── RealtimeHub.cs
        └── RealtimeHubRegistration.cs
```

Business-specific realtime rules stay inside their modules.

---

# 8. SignalR Frontend Structure

```text
frontend/src/platform/realtime/
├── signalrClient.ts
├── RealtimeProvider.tsx
├── realtime.types.ts
├── realtime.events.ts
├── realtime.config.ts
├── hooks/
│   ├── useRealtime.ts
│   └── useRealtimeEvent.ts
└── index.ts
```

Home Services-specific handlers:

```text
frontend/src/services/home-services/
└── features/
    └── realtime/
        ├── useBookingRealtime.ts
        └── bookingRealtime.types.ts
```

---

# 9. SignalR Package

Frontend:

```bash
npm install @microsoft/signalr
```

Backend:

```text
ASP.NET Core SignalR server support is available in ASP.NET Core.
```

---

# 10. SignalR Event Envelope

```csharp
public sealed record RealtimeEventEnvelope<T>(
    Guid EventId,
    string EventType,
    int Version,
    DateTimeOffset OccurredAt,
    string? CorrelationId,
    string? TenantId,
    T Payload
);
```

Naming:

```text
home-services.booking.status-changed
platform.notification.created
platform.chat.message-created
platform.chat.message-read
platform.chat.typing
```

---

# 11. IRealtimePublisher

Do not call `IHubContext` from business services directly.

```csharp
public interface IRealtimePublisher
{
    Task SendToUserAsync<T>(
        string userId,
        RealtimeEventEnvelope<T> message,
        CancellationToken cancellationToken = default);

    Task SendToTenantAsync<T>(
        string tenantId,
        RealtimeEventEnvelope<T> message,
        CancellationToken cancellationToken = default);

    Task SendToGroupAsync<T>(
        string groupName,
        RealtimeEventEnvelope<T> message,
        CancellationToken cancellationToken = default);
}
```

Implementation:

```text
SignalRRealtimePublisher
        ↓
IHubContext<RealtimeHub>
```

---

# 12. SignalR Groups

Use server-controlled groups:

```text
user:{userId}
tenant:{tenantId}
context:{contextType}:{contextId}
```

Examples:

```text
user:42

tenant:tenant-school-a

context:home-services.booking:booking-123

context:chat.conversation:conversation-456
```

Never allow the browser to join an arbitrary group without authorization.

---

# 13. SignalR Authentication

Hub:

```csharp
[Authorize]
public sealed class RealtimeHub : Hub
{
}
```

React:

```ts
accessTokenFactory: () => token
```

Reuse the existing JWT configuration.

Do not build separate authentication for SignalR.

---

# 14. SignalR Reconnect

React client:

```ts
new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, {
    accessTokenFactory: () => getAccessToken() ?? ""
  })
  .withAutomaticReconnect([0, 2000, 10000, 30000])
  .build();
```

After reconnect:

```text
Reconnect
   ↓
Rejoin authorized groups
   ↓
Refetch important REST state
```

SignalR can miss events while disconnected.

Therefore:

```text
SignalR = immediate delivery
REST/API = reconciliation
```

---

# 15. Home Services Booking Workflow

```text
Professional changes booking status
        ↓
PUT /api/home-services/bookings/{id}/status
        ↓
Authorization
        ↓
Booking application service
        ↓
PostgreSQL update
        ↓
Commit succeeds
        ↓
BookingStatusChanged event
        ↓
IRealtimePublisher
        ↓
Customer / Professional / Booking group
        ↓
React receives event
        ↓
TanStack Query invalidation/update
        ↓
UI changes immediately
```

PostgreSQL remains authoritative.

MongoDB is not required for booking state.

---

# 16. Phase 2 — MongoDB Foundation

Add MongoDB without modifying the current EF Core/PostgreSQL configuration.

Recommended backend structure:

```text
VSRSystemsBackend.Application/
└── Platform/
    └── Documents/
        ├── Interfaces/
        │   └── IDocumentStore.cs
        └── Models/

VSRSystemsBackend.Infrastructure/
└── Persistence/
    └── Mongo/
        ├── MongoDbOptions.cs
        ├── MongoDbContext.cs
        ├── MongoCollectionNames.cs
        ├── Repositories/
        └── Configurations/
```

Feature-specific Mongo repositories remain with their feature where practical:

```text
Infrastructure/
└── Modules/
    └── Communication/
        └── Mongo/
            ├── MongoChatMessageRepository.cs
            └── MongoConversationHistoryRepository.cs
```

---

# 17. MongoDB .NET Package

Backend:

```bash
dotnet add package MongoDB.Driver
```

Do not replace:

```text
Npgsql
EF Core
PostgreSQL migrations
DbContext
```

MongoDB is additional persistence.

---

# 18. MongoDB Configuration

Use environment variables / configuration.

Example:

```json
{
  "MongoDb": {
    "ConnectionString": "",
    "DatabaseName": "vsr_systems"
  }
}
```

Production secrets:

```text
MONGODB_CONNECTION_STRING
MONGODB_DATABASE_NAME
```

Do not commit MongoDB credentials.

---

# 19. MongoDbOptions

```csharp
public sealed class MongoDbOptions
{
    public const string SectionName = "MongoDb";

    public string ConnectionString { get; init; } = string.Empty;
    public string DatabaseName { get; init; } = "vsr_systems";
}
```

Register via configuration/options pattern.

---

# 20. MongoDbContext

Keep Mongo access centralized.

Concept:

```csharp
public sealed class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbOptions> options)
    {
        var client = new MongoClient(options.Value.ConnectionString);
        _database = client.GetDatabase(options.Value.DatabaseName);
    }

    public IMongoCollection<T> GetCollection<T>(string name)
        => _database.GetCollection<T>(name);
}
```

Do not create `MongoClient` repeatedly per request.

Register singleton/client appropriately.

---

# 21. MongoDB Collections

Start with only:

```text
chat_messages
ai_conversations
```

Future optional:

```text
external_payloads
job_scraper_raw_documents
activity_documents
```

Do not mirror every PostgreSQL table into MongoDB.

---

# 22. Phase 3 — SignalR + MongoDB Chat

This is the main feature where both technologies work together.

Architecture:

```text
React Chat UI
      │
      │ POST /api/chat/conversations/{id}/messages
      ▼
ASP.NET Core
      │
      ├── Validate JWT
      ├── Validate conversation access
      ├── Validate booking/user relationship
      │
      ▼
MongoDB
Insert chat message
      │
      ▼
Insert success
      │
      ▼
IRealtimePublisher
      │
      ▼
SignalR conversation group
      │
      ▼
Connected participants receive message
```

Important:

> **MongoDB stores the message. SignalR delivers the message.**

---

# 23. Chat Metadata Ownership

Recommended split:

## PostgreSQL

Keep relational conversation metadata:

```text
Conversation
ConversationParticipant
BookingConversationLink
ConversationStatus
CreatedBy
TenantId
BusinessContextType
BusinessContextId
```

Why?

```text
Participants link to existing Users
Booking link is relational
Authorization depends on existing platform data
Tenant rules are relational
```

## MongoDB

Store message documents:

```text
ChatMessage
MessageReaction
Flexible metadata
System message payloads
AI-assisted message metadata later
```

This is a defensible polyglot-persistence design.

---

# 24. PostgreSQL Conversation Tables

Example:

```text
Conversations
-------------
Id
TenantId
ContextType
ContextId
Status
CreatedByUserId
CreatedAt
UpdatedAt

ConversationParticipants
------------------------
Id
ConversationId
UserId
ParticipantType
JoinedAt
LeftAt
IsActive
```

Examples:

```text
ContextType = HomeServiceBooking
ContextId   = BookingId

ContextType = SupportTicket
ContextId   = TicketId
```

Do not put every message in these PostgreSQL tables if MongoDB is selected for chat storage.

---

# 25. MongoDB ChatMessage Document

```csharp
public sealed class ChatMessageDocument
{
    public ObjectId Id { get; set; }

    public Guid MessageId { get; set; }

    public Guid ConversationId { get; set; }

    public string TenantId { get; set; } = default!;

    public string SenderUserId { get; set; } = default!;

    public string MessageType { get; set; } = "text";

    public string? Text { get; set; }

    public List<ChatAttachmentDocument> Attachments { get; set; } = [];

    public Dictionary<string, object>? Metadata { get; set; }

    public DateTimeOffset SentAt { get; set; }

    public DateTimeOffset? EditedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}
```

Possible message types:

```text
text
image
file
system
booking_update
location
ai
```

---

# 26. Chat Attachment Document

Store file binaries in object storage.

MongoDB stores only metadata:

```text
StorageKey
FileName
ContentType
Size
ThumbnailUrl
Width
Height
```

Do not store large files directly inside MongoDB for this implementation.

---

# 27. Chat Indexes

Create indexes for:

```text
ConversationId + SentAt
MessageId unique
TenantId + ConversationId + SentAt
SenderUserId + SentAt
```

Primary query:

```text
Get messages for conversation ordered by SentAt descending
```

Use cursor-based pagination.

Avoid offset pagination for large message histories.

---

# 28. Chat Repository

Create:

```csharp
public interface IChatMessageRepository
{
    Task<ChatMessageDocument> InsertAsync(
        ChatMessageDocument message,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ChatMessageDocument>> GetMessagesAsync(
        Guid conversationId,
        DateTimeOffset? before,
        int limit,
        CancellationToken cancellationToken);

    Task<ChatMessageDocument?> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken);
}
```

Mongo implementation:

```text
MongoChatMessageRepository
```

Business/application layer must depend on the interface, not MongoDB.Driver directly.

---

# 29. Chat Send Flow

Endpoint:

```text
POST /api/v1/chat/conversations/{conversationId}/messages
```

Flow:

```text
1. Validate authenticated user
2. Load Conversation from PostgreSQL
3. Verify current user is an active participant
4. Validate message
5. Create application MessageId
6. Insert ChatMessageDocument into MongoDB
7. Publish realtime event
8. Return saved message DTO
```

Do not allow SignalR Hub method to bypass steps 1–6.

---

# 30. Why Send Through REST Instead of Hub?

Recommended:

```text
REST command -> persistence -> SignalR delivery
```

rather than:

```text
Hub method -> persistence
```

Benefits:

```text
Clear API contracts
Easier validation
Easier testing
Better HTTP observability
Idempotency support
Consistent authorization
SignalR remains a transport
```

The Hub may later be used for transient events:

```text
typing
presence
read-position signal
```

but persistent chat messages should use the normal application command path.

---

# 31. Chat Realtime Event

```text
platform.chat.message-created
```

Payload:

```json
{
  "messageId": "guid",
  "conversationId": "guid",
  "senderUserId": "user-id",
  "messageType": "text",
  "text": "I am on the way",
  "sentAt": "2026-08-24T18:30:00Z"
}
```

Send to:

```text
context:chat.conversation:{conversationId}
```

Server verifies subscription permission first.

---

# 32. Chat History API

```text
GET /api/v1/chat/conversations/{id}/messages
```

Query:

```text
before
limit
```

Example:

```text
GET /api/v1/chat/conversations/123/messages?limit=30

GET /api/v1/chat/conversations/123/messages?
    before=2026-08-24T18:30:00Z&
    limit=30
```

Default:

```text
limit = 30
maximum = 100
```

Use cursor-based pagination.

---

# 33. React Chat Structure

```text
frontend/src/platform/chat/
├── api/
│   └── chat.api.ts
├── components/
│   ├── ChatWindow.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── MessageComposer.tsx
│   └── ChatHeader.tsx
├── hooks/
│   ├── useConversation.ts
│   ├── useChatMessages.ts
│   └── useChatRealtime.ts
├── types/
└── index.ts
```

The feature module decides where to embed chat.

Example Home Services:

```text
Booking Detail
   ↓
Contact Professional
   ↓
Chat Drawer/Page
```

---

# 34. Chat Client Flow

Initial load:

```text
React
 ↓
GET recent messages from REST
 ↓
MongoDB-backed API
 ↓
Display history
 ↓
Subscribe SignalR conversation group
```

New message:

```text
User sends
 ↓
POST API
 ↓
MongoDB insert
 ↓
SignalR event
 ↓
All currently connected participants receive it
```

Reconnect:

```text
SignalR reconnect
 ↓
rejoin group
 ↓
refetch recent messages
```

This prevents message loss in the UI.

---

# 35. Typing Indicator

Typing is transient.

Do not store typing events in MongoDB.

Flow:

```text
User types
 ↓
SignalR Hub
 ↓
conversation group
 ↓
Other participant sees "typing..."
```

Event:

```text
platform.chat.typing
```

Rate limit/debounce typing events.

Implement after persistent chat is working.

---

# 36. Read Receipts

Recommended design:

Store durable read position separately.

For MVP:

```text
PostgreSQL ConversationParticipant.LastReadMessageId
or
LastReadAt
```

SignalR can immediately push:

```text
platform.chat.read-position-changed
```

Do not store one MongoDB document for every individual "seen" event unless a real need exists.

---

# 37. MongoDB AI Conversation History

After chat is stable, reuse MongoDB for AI.

Collection:

```text
ai_conversations
```

Document example:

```json
{
  "_id": "...",
  "conversationId": "guid",
  "tenantId": "tenant",
  "userId": "user",
  "module": "warehouse",
  "title": "Stock analysis",
  "messages": [
    {
      "role": "user",
      "content": "Which items are below reorder level?",
      "createdAt": "..."
    },
    {
      "role": "assistant",
      "content": "...",
      "createdAt": "..."
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

For very long conversations, use one document per message instead of unbounded arrays.

---

# 38. Future Job Scraper Use

VSR Jobs may use MongoDB for:

```text
Raw fetched external job payload
Provider-specific JSON
Parsing/debug payload
Scrape snapshot
AI enrichment result
```

Final normalized searchable business job record can remain in PostgreSQL.

Pattern:

```text
External Source
      ↓
MongoDB Raw Payload
      ↓
Normalizer
      ↓
PostgreSQL Canonical Job
```

This is a strong real-world MongoDB use case.

---

# 39. MongoDB Health Check

Expose Mongo connectivity through the existing health-check infrastructure.

Example concept:

```text
/health
```

Checks:

```text
PostgreSQL
MongoDB
```

Do not expose Mongo credentials or cluster internals publicly.

---

# 40. MongoDB Failure Strategy

The application must degrade safely.

## MongoDB unavailable

Transactional modules continue:

```text
Bookings
Payments
School
Warehouse
Hotel
Travel
```

because they use PostgreSQL.

Chat can show:

```text
Messaging temporarily unavailable.
```

Do not make MongoDB availability a dependency for unrelated modules.

---

# 41. SignalR Failure Strategy

If SignalR disconnects:

```text
REST application still works.
Chat history still loads from MongoDB.
Booking state still loads from PostgreSQL.
```

UI shows reconnecting state if needed.

---

# 42. Security

Mandatory:

```text
JWT authentication
Server-side authorization
Tenant validation
Conversation participant validation
No arbitrary group joins
No MongoDB connection string in React
No direct browser -> MongoDB connection
No direct browser -> database access
DTO filtering
Input validation
Rate limiting
Attachment validation
Audit sensitive admin operations
```

MongoDB connection:

```text
React
  X
MongoDB
```

Correct:

```text
React
  ↓
.NET API
  ↓
MongoDB
```

---

# 43. Tenant Isolation in MongoDB

Every multi-tenant document must include:

```text
TenantId
```

Every repository query must include tenant scope when appropriate.

Example:

```text
TenantId == currentTenant
AND
ConversationId == requestedConversation
```

Do not query by `ConversationId` alone in multi-tenant flows unless IDs are globally unique and authorization has already been proven.

Defense in depth is preferred.

---

# 44. MongoDB Local Development

Option A:

```text
Local MongoDB
```

Option B:

```text
Docker MongoDB
```

Example:

```bash
docker run -d \
  --name vsr-mongodb \
  -p 27017:27017 \
  mongo:8
```

Use local environment secrets.

---

# 45. MongoDB Cloud Development

Recommended for the current low-cost/free-development stage:

```text
MongoDB Atlas Free cluster
```

Keep deployment provider abstract through the standard MongoDB connection string.

Production configuration remains:

```text
MONGODB_CONNECTION_STRING
MONGODB_DATABASE_NAME
```

Do not hardcode Atlas-specific logic in business code.

---

# 46. Render Configuration

Add environment variables:

```text
MongoDb__ConnectionString=<secret>
MongoDb__DatabaseName=vsr_systems
```

or use the project's existing environment-variable naming convention.

Keep secrets only in Render environment configuration.

---

# 47. Connection Management

Register one `MongoClient` for the application.

Do not:

```text
new MongoClient(...)
```

inside every repository method/request.

Use DI.

Concept:

```csharp
builder.Services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(mongoOptions.ConnectionString));
```

Then obtain the database/collections from the shared client.

---

# 48. Observability

Log:

```text
Mongo operation failures
Mongo latency for critical repository calls
SignalR connection lifecycle
SignalR publish failures
Chat send failures
Authorization failures
```

Do not log:

```text
JWT
password
Mongo connection string
private message contents by default
payment data
sensitive healthcare data
```

Reuse current OpenTelemetry/correlation ID infrastructure where present.

---

# 49. Testing — MongoDB

Unit tests:

```text
Chat service validation
Conversation authorization
DTO mapping
Repository abstraction
```

Integration tests:

```text
Insert chat message
Read conversation history
Tenant isolation
Pagination
Index-supported query behavior
Mongo unavailable behavior
```

Use:

```text
test MongoDB instance/container
```

where practical.

Do not run destructive tests against production Atlas data.

---

# 50. Testing — SignalR + MongoDB

End-to-end scenario:

```text
Browser A = customer
Browser B = professional

A opens booking conversation
B opens booking conversation

A sends message
 ↓
.NET API
 ↓
MongoDB
 ↓
SignalR
 ↓
B receives instantly

Refresh both browsers
 ↓
Messages load from MongoDB
```

Then:

```text
Disconnect B
A sends message
Reconnect B
 ↓
B refetches history
 ↓
message still exists
```

This proves:

```text
MongoDB = persistence
SignalR = realtime delivery
```

---

# 51. Interview Story

After implementation, you should be able to explain:

> "VSR uses polyglot persistence. PostgreSQL remains our transactional database for strongly relational modules such as bookings, payments, users and inventory. We introduced MongoDB for document-oriented workloads such as real-time chat messages and AI conversation history. Persistent commands go through ASP.NET Core APIs, MongoDB stores the chat document, and SignalR broadcasts the saved message to authorized conversation groups. We intentionally kept SignalR as a delivery layer rather than a database, and we kept MongoDB isolated so an outage does not affect core transactional modules."

This demonstrates:

```text
.NET
SignalR
WebSockets
MongoDB
PostgreSQL
Polyglot persistence
JWT
Authorization
Repository pattern
Realtime architecture
Failure isolation
React integration
```

---

# 52. Key Interview Questions to Prepare

## SignalR

```text
What is SignalR?
SignalR vs WebSocket?
SignalR vs polling?
What is a Hub?
How do groups work?
How do you authenticate SignalR?
How do you reconnect?
How do you scale SignalR?
What is a Redis backplane?
```

## MongoDB

```text
MongoDB vs PostgreSQL?
Document vs relational database?
What is BSON?
Collection vs table?
Document vs row?
How do indexes work?
Embedded vs referenced documents?
What is ObjectId?
How do you paginate efficiently?
What is a replica set?
What is sharding?
When should MongoDB not be used?
```

## Architecture

```text
Why use both PostgreSQL and MongoDB?
Why not migrate everything to MongoDB?
Why store chat in MongoDB?
Why send chat through REST before SignalR?
How do you handle missed SignalR events?
How do you guarantee chat persists?
What happens if MongoDB is down?
What happens if SignalR is down?
How is tenant isolation enforced?
```

---

# 53. Phase-by-Phase Coding Agent Plan

## Phase 1 — SignalR Foundation

```text
1. Inspect current JWT/auth/CORS setup.
2. Add Platform/Realtime abstractions.
3. Add RealtimeHub.
4. Add SignalRRealtimePublisher.
5. Add authorized group subscriptions.
6. Add React @microsoft/signalr client.
7. Add one connection per session.
8. Add reconnect/resubscribe.
9. Implement Home Services booking status event.
10. Build/test.
11. STOP.
```

## Phase 2 — MongoDB Foundation

```text
1. Add MongoDB.Driver.
2. Add MongoDbOptions.
3. Add singleton MongoClient.
4. Add MongoDbContext/collection access.
5. Add health check.
6. Add dev configuration.
7. Add Render environment-variable documentation.
8. Verify existing PostgreSQL behavior is unchanged.
9. Build/test.
10. STOP.
```

## Phase 3 — Real-Time Chat

```text
1. Create PostgreSQL Conversation metadata tables if not already present.
2. Create MongoDB ChatMessageDocument.
3. Create Mongo chat message repository.
4. Create conversation authorization service.
5. Create chat history API.
6. Create send-message API.
7. Persist MongoDB first.
8. Publish SignalR event after Mongo insert succeeds.
9. Add React chat UI.
10. Add conversation SignalR subscription.
11. Add cursor pagination.
12. Add reconnect history refresh.
13. Test with two browsers.
14. STOP.
```

## Phase 4 — AI Conversation Documents

```text
1. Add AI conversation collection.
2. Persist non-sensitive AI history.
3. Add module/tenant/user indexes.
4. Add retention/delete support.
5. Do not migrate business data.
6. STOP.
```

## Phase 5 — Optional Jobs Raw Payloads

```text
1. Store permitted raw source payload in MongoDB.
2. Normalize to canonical PostgreSQL Job entities.
3. Add retention policy.
4. Keep final job search/application data in PostgreSQL.
5. STOP.
```

---

# 54. Definition of Done

SignalR:

```text
[ ] Authenticated /hubs/realtime
[ ] One browser-session connection
[ ] Automatic reconnect
[ ] Authorized groups
[ ] Home Services booking live update
[ ] REST fallback
```

MongoDB:

```text
[ ] MongoDB.Driver installed
[ ] MongoClient registered once through DI
[ ] Secrets environment-based
[ ] Health check available
[ ] Existing PostgreSQL remains unchanged
[ ] Mongo outage does not break unrelated modules
```

Chat:

```text
[ ] PostgreSQL conversation metadata
[ ] MongoDB chat message persistence
[ ] Authorized history endpoint
[ ] Authorized send endpoint
[ ] SignalR delivery after persistence
[ ] Reconnect refetch
[ ] Cursor pagination
[ ] Tenant isolation
[ ] Two-browser E2E passes
```

Build:

```text
[ ] Backend build passes
[ ] Frontend build passes
[ ] Existing tests pass
[ ] New tests pass
[ ] No unrelated module rewrite
```

---

# 55. Guardrails

```text
Do not replace PostgreSQL with MongoDB.
Do not copy PostgreSQL tables into MongoDB.
Do not use MongoDB for payments or financial ledger data.
Do not connect React directly to MongoDB.
Do not store MongoDB credentials in frontend code.
Do not use SignalR as permanent storage.
Do not send a persistent chat message before MongoDB insert succeeds.
Do not allow arbitrary SignalR group joins.
Do not create microservices for this implementation.
Do not add Redis SignalR scale-out now.
Do not add Azure SignalR now.
Do not rewrite unrelated modules.
```

---

# 56. Final Coding-Agent Master Prompt

```text
Implement SignalR + MongoDB in the existing VSR Systems codebase using this document as the source of truth.

CURRENT ARCHITECTURE MUST REMAIN:
- React + TypeScript frontend
- ASP.NET Core/.NET backend
- PostgreSQL/Supabase as primary transactional database
- Netlify frontend deployment
- Render backend deployment
- module-isolated modular monolith

ARCHITECTURE DECISIONS:
- PostgreSQL remains authoritative for users, bookings, payments, inventory and other relational/transactional business data.
- MongoDB is an additional document database.
- Do not migrate existing PostgreSQL entities to MongoDB.
- SignalR is the realtime transport, not permanent storage.

IMPLEMENT IN PHASES.

PHASE 1 — SIGNALR:
1. Add a reusable Platform/Realtime capability.
2. Add one authenticated RealtimeHub at /hubs/realtime.
3. Reuse existing JWT authentication.
4. Add IRealtimePublisher.
5. Add user, tenant and authorized context groups.
6. Add React @microsoft/signalr client.
7. Use one connection per logged-in browser session.
8. Add automatic reconnect and resubscription.
9. Implement Home Services booking-status realtime updates after PostgreSQL commit.
10. Preserve REST fallback.

STOP AND BUILD/TEST.

PHASE 2 — MONGODB:
1. Add MongoDB.Driver.
2. Add MongoDbOptions and environment-based configuration.
3. Register one MongoClient through DI.
4. Add Mongo persistence infrastructure without modifying EF Core/PostgreSQL.
5. Add Mongo health check.
6. Configure development and Render environment variables.

STOP AND BUILD/TEST.

PHASE 3 — REAL-TIME CHAT:
1. Keep conversation/participant/business-context metadata in PostgreSQL.
2. Store chat messages in MongoDB.
3. Add ChatMessageDocument and indexes.
4. Add IChatMessageRepository with Mongo implementation.
5. Add authorized GET conversation messages endpoint with cursor pagination.
6. Add authorized POST send-message endpoint.
7. Validate conversation membership using PostgreSQL.
8. Insert message into MongoDB.
9. Only after insert succeeds, publish platform.chat.message-created through SignalR.
10. Send only to the authorized conversation group.
11. Add React chat UI and SignalR subscription.
12. On reconnect, rejoin group and refetch message history.
13. Test two browser sessions.
14. Confirm offline/reconnect does not lose persisted messages.

DO NOT:
- replace PostgreSQL
- add microservices
- add Azure SignalR
- add Redis backplane
- connect React directly to MongoDB
- store secrets in frontend
- send persistent messages through SignalR without persistence
- rewrite unrelated business modules

AT THE END OF EACH PHASE REPORT:
- files changed
- package changes
- configuration changes
- migrations
- Mongo collections/indexes created
- hub/API routes
- tests run
- frontend build result
- backend build result
- deployment configuration required

Stop after each phase and do not continue automatically.
```

---

# 57. Final Target Architecture

```text
                         VSR SYSTEMS
                              │
                 ┌────────────┴─────────────┐
                 │                          │
              React                     .NET API
                                            │
                           ┌────────────────┼─────────────────┐
                           │                │                 │
                        SignalR         PostgreSQL          MongoDB
                           │                │                 │
                       Realtime         Business          Documents
                           │           Transactions          │
                    ┌──────┼──────┐     │              ┌────┼────────┐
                    │      │      │     │              │    │        │
                 Chat   Alerts  Live   Bookings       Chat  AI   Raw Data
                                UI      Payments       Msgs  History
                                        Orders
                                        Users
```

Recommended implementation order:

```text
SignalR booking update
        ↓
MongoDB foundation
        ↓
SignalR + MongoDB chat
        ↓
AI conversation history
        ↓
Optional Jobs raw payload store
```

This adds both **visible product capability** and **strong interview-ready architecture** without destabilizing the existing VSR transactional system.
