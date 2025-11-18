# Engify AI - System Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [Authentication & Authorization Flow](#authentication--authorization-flow)
5. [Component Architecture](#component-architecture)
6. [AI Provider Integration](#ai-provider-integration)
7. [Database Architecture](#database-architecture)
8. [API Architecture](#api-architecture)
9. [Security Architecture](#security-architecture)
10. [Scalability & Performance](#scalability--performance)

---

## Overview

Engify AI is a comprehensive prompt engineering platform built on **Next.js 14** (App Router), **MongoDB**, and a multi-provider AI integration system. The architecture follows **SOLID principles**, implements the **Repository Pattern**, and uses a **layered architecture** for maintainability and scalability.

### Technology Stack

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 14 App Router]
        B[React Server Components]
        C[Tailwind CSS + shadcn/ui]
        D[TanStack Query]
    end

    subgraph "API Layer"
        E[Next.js API Routes]
        F[tRPC]
        G[REST APIs]
    end

    subgraph "Business Logic Layer"
        H[Services]
        I[Repositories]
        J[Providers]
    end

    subgraph "Data Layer"
        K[MongoDB]
        L[Redis Cache]
        M[Upstash]
    end

    subgraph "External Services"
        N[OpenAI]
        O[Anthropic Claude]
        P[Google Gemini]
        Q[Groq]
        R[SendGrid]
        S[Twilio]
    end

    A --> E
    B --> E
    D --> F
    E --> H
    F --> H
    G --> H
    H --> I
    I --> K
    H --> J
    J --> L
    J --> M
    H --> N
    H --> O
    H --> P
    H --> Q
    H --> R
    H --> S
```

### Key Features

- **Multi-Provider AI Integration**: OpenAI, Anthropic, Google, Groq, and more
- **RBAC (Role-Based Access Control)**: Enterprise-grade permissions system
- **Repository Pattern**: Clean data access layer with type safety
- **Service Layer**: Business logic encapsulation
- **Provider Pattern**: Singleton resources (Auth, Database, Cache, Logging)
- **API Middleware**: Unified route wrapper with auth, RBAC, rate limiting, validation
- **Real-time Caching**: Multi-tier caching strategy with Redis/Upstash
- **Audit Logging**: Comprehensive security and compliance logging
- **MFA Support**: SMS-based multi-factor authentication
- **Multi-tenancy Ready**: Organization-based isolation

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Client[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "CDN Layer"
        Vercel[Vercel Edge Network]
    end

    subgraph "Application Layer"
        subgraph "Next.js Application"
            Pages[Pages/Routes]
            API[API Routes]
            Middleware[Middleware]
        end
    end

    subgraph "Service Layer"
        subgraph "Unified API Wrapper"
            Auth[Authentication]
            RBAC[Authorization RBAC]
            RateLimit[Rate Limiting]
            Validation[Input Validation]
            Audit[Audit Logging]
        end

        subgraph "Business Services"
            UserService[User Service]
            PromptService[Prompt Service]
            AIService[AI Execution Service]
            ContentService[Content Service]
        end
    end

    subgraph "Data Access Layer"
        subgraph "Repositories"
            UserRepo[User Repository]
            PromptRepo[Prompt Repository]
            APIKeyRepo[API Key Repository]
        end

        subgraph "Providers"
            AuthProvider[Auth Provider]
            DBProvider[Database Provider]
            CacheProvider[Cache Provider]
            LogProvider[Logging Provider]
        end
    end

    subgraph "Data Storage"
        MongoDB[(MongoDB)]
        Redis[(Redis/Upstash)]
        FileStorage[File Storage]
    end

    subgraph "External Services"
        AIProviders[AI Providers<br/>OpenAI, Claude, Gemini, Groq]
        Email[SendGrid Email]
        SMS[Twilio SMS/MFA]
        Monitoring[Sentry Monitoring]
    end

    Client --> Vercel
    Mobile --> Vercel
    Vercel --> Pages
    Vercel --> API
    Pages --> Middleware
    API --> Auth
    Auth --> RBAC
    RBAC --> RateLimit
    RateLimit --> Validation
    Validation --> Audit
    Audit --> UserService
    Audit --> PromptService
    Audit --> AIService
    Audit --> ContentService

    UserService --> UserRepo
    PromptService --> PromptRepo
    AIService --> APIKeyRepo

    UserRepo --> DBProvider
    PromptRepo --> DBProvider
    APIKeyRepo --> DBProvider

    UserRepo --> AuthProvider
    PromptRepo --> CacheProvider
    AIService --> LogProvider

    DBProvider --> MongoDB
    CacheProvider --> Redis
    LogProvider --> Monitoring

    AIService --> AIProviders
    UserService --> Email
    UserService --> SMS
```

### Layered Architecture

The application follows a strict layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│              (Next.js Pages & Components)               │
├─────────────────────────────────────────────────────────┤
│                     API Layer                           │
│        (Next.js API Routes + tRPC Routers)              │
├─────────────────────────────────────────────────────────┤
│                   Middleware Layer                      │
│   (withAPI: Auth, RBAC, Rate Limit, Validation)        │
├─────────────────────────────────────────────────────────┤
│                  Business Logic Layer                   │
│         (Services: User, Prompt, AI, Content)           │
├─────────────────────────────────────────────────────────┤
│                 Data Access Layer                       │
│      (Repositories: BaseRepository, Specialized)        │
├─────────────────────────────────────────────────────────┤
│                   Provider Layer                        │
│   (Singletons: Auth, Database, Cache, Logging)         │
├─────────────────────────────────────────────────────────┤
│                   Data Layer                            │
│          (MongoDB, Redis, File Storage)                 │
└─────────────────────────────────────────────────────────┘
```

**Layer Responsibilities:**

1. **Presentation Layer**: UI components, pages, client-side logic
2. **API Layer**: HTTP endpoints, route handlers, request/response formatting
3. **Middleware Layer**: Cross-cutting concerns (auth, validation, logging)
4. **Business Logic Layer**: Domain logic, business rules, orchestration
5. **Data Access Layer**: Database operations, query abstraction
6. **Provider Layer**: Singleton resources, dependency injection
7. **Data Layer**: Persistent storage, caching

---

## Data Flow

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant API as API Route
    participant Middleware as withAPI Middleware
    participant Service as Business Service
    participant Repo as Repository
    participant DB as MongoDB
    participant Cache as Redis Cache
    participant AI as AI Provider

    Client->>API: HTTP Request
    API->>Middleware: withAPI wrapper

    rect rgb(240, 248, 255)
        Note over Middleware: Middleware Processing
        Middleware->>Middleware: 1. Authentication Check
        Middleware->>Middleware: 2. RBAC Authorization
        Middleware->>Middleware: 3. Rate Limiting
        Middleware->>Middleware: 4. Input Validation
        Middleware->>Cache: 5. Cache Check (GET only)
    end

    Middleware->>Service: Execute Handler

    rect rgb(255, 248, 240)
        Note over Service,AI: Business Logic
        Service->>Repo: Data Operation
        Repo->>DB: Query/Update
        DB-->>Repo: Result
        Repo-->>Service: Domain Object

        alt AI Execution Required
            Service->>AI: Execute Prompt
            AI-->>Service: AI Response
        end
    end

    Service-->>Middleware: Return Result

    rect rgb(240, 255, 240)
        Note over Middleware: Post-Processing
        Middleware->>Cache: Cache Result (if enabled)
        Middleware->>Middleware: Audit Logging
        Middleware->>Middleware: Performance Tracking
    end

    Middleware-->>API: Formatted Response
    API-->>Client: HTTP Response
```

### Data Write Flow

```mermaid
graph LR
    A[Client Request] --> B{withAPI Middleware}
    B -->|Auth| C{Authenticated?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E{RBAC Check}
    E -->|Denied| F[403 Forbidden]
    E -->|Allowed| G{Rate Limit}
    G -->|Exceeded| H[429 Too Many Requests]
    G -->|OK| I{Validate Input}
    I -->|Invalid| J[400 Bad Request]
    I -->|Valid| K[Business Service]
    K --> L[Repository]
    L --> M{Transaction?}
    M -->|Yes| N[Begin Transaction]
    M -->|No| O[Direct Write]
    N --> P[Write to MongoDB]
    O --> P
    P --> Q{Success?}
    Q -->|No| R[Rollback/Error]
    Q -->|Yes| S[Commit]
    S --> T[Audit Log]
    T --> U[Clear Cache]
    U --> V[Return Success]
    R --> W[Return Error]
```

### Data Read Flow with Caching

```mermaid
graph TB
    A[GET Request] --> B[withAPI Middleware]
    B --> C{Check Cache}
    C -->|Hit| D[Return Cached Data]
    C -->|Miss| E[Business Service]
    E --> F[Repository]
    F --> G[Query MongoDB]
    G --> H[Transform Data]
    H --> I[Store in Cache]
    I --> J[Return Data]
```

---

## Authentication & Authorization Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant API as /api/auth
    participant AuthProvider
    participant DB as MongoDB
    participant Session as Session Store
    participant MFA as Twilio MFA

    User->>Browser: Login Credentials
    Browser->>API: POST /api/auth/signin
    API->>DB: Verify Credentials
    DB-->>API: User Found

    alt MFA Required for Admin
        API->>MFA: Send Verification Code
        MFA-->>User: SMS Code
        User->>Browser: Enter Code
        Browser->>API: Verify MFA Code
        API->>MFA: Validate Code
        MFA-->>API: Code Valid
    end

    API->>Session: Create Session
    Session-->>API: Session Token
    API->>AuthProvider: Store Auth Context
    API-->>Browser: Set Cookie
    Browser-->>User: Logged In
```

### RBAC Authorization Flow

```mermaid
graph TB
    A[API Request] --> B[withAPI Middleware]
    B --> C[AuthProvider.getAuthContext]
    C --> D{Session Valid?}
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F[Extract User Role]
    F --> G{RBAC Config Type}

    G -->|Role Array| H[Check if role in array]
    G -->|Permission| I[RBACService.hasPermission]
    G -->|Resource+Action| J[RBACService.canAccess]

    H --> K{Authorized?}
    I --> K
    J --> K

    K -->|No| L[403 Forbidden]
    K -->|Yes| M[Proceed to Handler]
```

### Role-Permission Matrix

```mermaid
graph LR
    subgraph "Roles"
        SA[super_admin]
        OA[org_admin]
        OM[org_manager]
        OMem[org_member]
        U[user]
        F[free]
        P[pro]
        E[enterprise]
    end

    subgraph "Permissions"
        SYS[system:*]
        BILL[billing:*]
        ORG[org:*]
        USER[users:*]
        PROMPT[prompts:*]
        WB[workbench:*]
        ANA[analytics:*]
    end

    SA --> SYS
    SA --> BILL
    SA --> ORG
    SA --> USER
    SA --> PROMPT
    SA --> WB
    SA --> ANA

    OA --> ORG
    OA --> USER
    OA --> PROMPT
    OA --> WB
    OA --> ANA
    OA --> BILL

    OM --> USER
    OM --> PROMPT
    OM --> WB
    OM --> ANA

    OMem --> PROMPT
    OMem --> WB

    U --> PROMPT
    U --> WB

    F --> PROMPT

    P --> PROMPT
    P --> WB
    P --> ANA

    E --> PROMPT
    E --> WB
    E --> ANA
```

---

## Component Architecture

### Repository Pattern Implementation

The repository pattern provides a clean abstraction over data access:

```mermaid
classDiagram
    class BaseRepository {
        <<abstract>>
        #collectionName: string
        #schema: ZodSchema
        #softDelete: boolean
        +findById(id): Promise~T~
        +findOne(filter): Promise~T~
        +find(filter, options): Promise~T[]~
        +findPaginated(filter, options): Promise~PaginatedResult~
        +insertOne(data): Promise~T~
        +updateOne(id, update): Promise~T~
        +deleteOne(id): Promise~boolean~
        +count(filter): Promise~number~
        +withTransaction(operation): Promise~Result~
    }

    class EnhancedUserRepository {
        +findByEmail(email): Promise~User~
        +findByRole(role): Promise~User[]~
        +findByOrganization(orgId): Promise~User[]~
        +updateLastLogin(userId): Promise~void~
        +isEmailTaken(email): Promise~boolean~
        +getStats(): Promise~UserStats~
        +search(query): Promise~User[]~
    }

    class APIKeyRepository {
        +findByHash(keyHash): Promise~APIKey~
        +findByUserId(userId): Promise~APIKey[]~
        +findActiveByUserId(userId): Promise~APIKey[]~
        +revoke(id, revokedBy): Promise~void~
        +recordUsage(id): Promise~void~
        +deactivateExpired(): Promise~number~
        +getUserKeyStats(userId): Promise~Stats~
    }

    class PromptRepository {
        +findByCategory(category): Promise~Prompt[]~
        +findByRole(role): Promise~Prompt[]~
        +search(query): Promise~Prompt[]~
        +incrementViews(id): Promise~void~
        +updateRating(id, rating): Promise~void~
    }

    BaseRepository <|-- EnhancedUserRepository
    BaseRepository <|-- APIKeyRepository
    BaseRepository <|-- PromptRepository
```

**BaseRepository Features:**
- Type-safe CRUD operations
- Pagination support
- Soft delete support
- Transaction support
- Error handling with logging
- Zod schema validation

### Service Layer Architecture

```mermaid
classDiagram
    class BaseService {
        <<abstract>>
        #collectionName: string
        #schema: ZodSchema
        #getCollection(): Promise~Collection~
        +findById(id): Promise~T~
        +create(data): Promise~T~
        +updateOne(id, update): Promise~T~
        +deleteOne(id): Promise~boolean~
    }

    class EnhancedUserService {
        -repository: EnhancedUserRepository
        +createUser(data, createdBy): Promise~User~
        +updateUser(id, data, updatedBy): Promise~User~
        +deleteUser(id, deletedBy): Promise~void~
        +getUserStats(): Promise~Stats~
        +searchUsers(query): Promise~User[]~
    }

    class UserAPIKeyService {
        -repository: APIKeyRepository
        +createKey(userId, options): Promise~APIKey~
        +rotateKey(userId, keyId, oldKey): Promise~APIKey~
        +revokeKey(userId, keyId, revokedBy): Promise~void~
        +verifyKey(plainKey): Promise~APIKey~
        +getActiveKeys(userId): Promise~APIKey[]~
    }

    class PromptService {
        -repository: PromptRepository
        +createPrompt(data): Promise~Prompt~
        +updatePrompt(id, data): Promise~Prompt~
        +searchPrompts(query): Promise~Prompt[]~
        +incrementViews(id): Promise~void~
        +getFeatured(): Promise~Prompt[]~
    }

    class AIExecutionService {
        -providers: AIProvider[]
        +execute(prompt, provider, options): Promise~Response~
        +selectProvider(requirements): AIProvider
        +trackUsage(execution): Promise~void~
    }

    BaseService <|-- EnhancedUserService
    BaseService <|-- UserAPIKeyService
    BaseService <|-- PromptService
    EnhancedUserService --> EnhancedUserRepository
    UserAPIKeyService --> APIKeyRepository
    PromptService --> PromptRepository
```

### Middleware Chain

```mermaid
graph TB
    A[API Request] --> B[withAPI Wrapper]
    B --> C[Authentication]
    C -->|Fail| C1[401 Response]
    C -->|Pass| D[MFA Check if required]
    D -->|Fail| D1[403 MFA Required]
    D -->|Pass| E[RBAC Authorization]
    E -->|Fail| E1[403 Forbidden]
    E -->|Pass| F[Rate Limiting]
    F -->|Exceeded| F1[429 Rate Limit]
    F -->|OK| G[Input Validation]
    G -->|Invalid| G1[400 Validation Error]
    G -->|Valid| H[Cache Check GET]
    H -->|Hit| H1[Return Cached]
    H -->|Miss| I[Execute Handler]
    I --> J[Business Logic]
    J --> K[Cache Result if GET]
    K --> L[Audit Log]
    L --> M[Performance Track]
    M --> N[Success Response]
```

**Middleware Features:**
- Authentication check
- MFA verification (for admins)
- RBAC authorization
- Rate limiting with presets
- Zod schema validation
- Response caching (GET only)
- Audit logging
- Performance tracking
- Error handling

---

## AI Provider Integration

### AI Adapter Pattern

```mermaid
classDiagram
    class AIProvider {
        <<interface>>
        +name: string
        +execute(prompt, options): Promise~Response~
        +validateConfig(): boolean
        +getModels(): Model[]
        +estimateCost(tokens): number
    }

    class OpenAIAdapter {
        -client: OpenAI
        -apiKey: string
        +execute(prompt, options): Promise~Response~
        +getModels(): Model[]
        +estimateCost(tokens): number
    }

    class AnthropicAdapter {
        -client: Anthropic
        -apiKey: string
        +execute(prompt, options): Promise~Response~
        +getModels(): Model[]
        +estimateCost(tokens): number
    }

    class GoogleAdapter {
        -client: GenerativeAI
        -apiKey: string
        +execute(prompt, options): Promise~Response~
        +getModels(): Model[]
        +estimateCost(tokens): number
    }

    class GroqAdapter {
        -client: Groq
        -apiKey: string
        +execute(prompt, options): Promise~Response~
        +getModels(): Model[]
        +estimateCost(tokens): number
    }

    class AIModelRegistry {
        -providers: Map~string, AIProvider~
        +register(provider): void
        +getProvider(name): AIProvider
        +getAllProviders(): AIProvider[]
        +getModel(id): Model
        +selectBestModel(requirements): Model
    }

    AIProvider <|.. OpenAIAdapter
    AIProvider <|.. AnthropicAdapter
    AIProvider <|.. GoogleAdapter
    AIProvider <|.. GroqAdapter
    AIModelRegistry --> AIProvider
```

### AI Execution Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AIService
    participant Registry as AIModelRegistry
    participant Adapter as AI Adapter
    participant Provider as External AI
    participant Usage as Usage Tracker
    participant Audit as Audit Log

    Client->>API: Execute Prompt Request
    API->>AIService: execute(prompt, provider, options)
    AIService->>Registry: getProvider(provider)
    Registry-->>AIService: AIAdapter

    AIService->>Adapter: validate credentials
    Adapter-->>AIService: valid

    AIService->>Adapter: execute(prompt, options)
    Adapter->>Provider: API Call
    Provider-->>Adapter: AI Response
    Adapter-->>AIService: Formatted Response

    AIService->>Usage: trackUsage(execution)
    Usage-->>AIService: recorded

    AIService->>Audit: log execution
    Audit-->>AIService: logged

    AIService-->>API: Response
    API-->>Client: Return Result
```

### Supported AI Providers

| Provider | Models | Tier | Context Window | Cost/1M Tokens |
|----------|--------|------|----------------|----------------|
| OpenAI | GPT-4o Mini, GPT-3.5 Turbo | Affordable | 128K | $0.15-$0.60 |
| Anthropic | Claude 3 Haiku, 3.5 Sonnet | Affordable-Premium | 200K | $0.25-$15.00 |
| Google | Gemini 1.5 Flash, Pro | Free-Premium | 1M-2M | $0.075-$5.00 |
| Groq | Llama 3.1 8B, 70B | Free-Affordable | 131K | $0.05-$0.79 |
| Perplexity | Sonar Small | Affordable | 127K | $0.20 |
| Together AI | Mixtral 8x7B | Affordable | 32K | $0.60 |
| Mistral | Mistral Small | Affordable | 32K | $1.00-$3.00 |

---

## Database Architecture

### MongoDB Collections Schema

```mermaid
erDiagram
    users ||--o{ prompts : creates
    users ||--o{ api_keys : owns
    users ||--o{ sessions : has
    users }o--|| organizations : belongs_to
    organizations ||--o{ users : contains
    prompts ||--o{ favorites : has
    prompts ||--o{ ratings : has
    users ||--o{ favorites : creates
    users ||--o{ ratings : gives
    users ||--o{ audit_logs : generates

    users {
        ObjectId _id PK
        string email UK
        string name
        string role
        ObjectId organizationId FK
        date createdAt
        date updatedAt
        boolean emailVerified
        date lastLoginAt
        object mfaSettings
    }

    organizations {
        ObjectId _id PK
        string name
        string slug UK
        string plan
        object settings
        date createdAt
        date updatedAt
    }

    prompts {
        ObjectId _id PK
        string title
        string description
        string content
        string category
        string role
        array tags
        ObjectId authorId FK
        ObjectId organizationId FK
        number views
        number rating
        boolean featured
        date createdAt
        date updatedAt
    }

    api_keys {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string keyHash
        string keyPrefix
        array scopes
        date expiresAt
        boolean active
        date lastUsedAt
        number usageCount
        date createdAt
        ObjectId revokedBy FK
        date revokedAt
    }

    sessions {
        ObjectId _id PK
        ObjectId userId FK
        string token
        object data
        date expiresAt
        date createdAt
    }

    favorites {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId promptId FK
        date createdAt
    }

    ratings {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId promptId FK
        number rating
        string comment
        date createdAt
    }

    audit_logs {
        ObjectId _id PK
        string action
        ObjectId userId FK
        string resource
        object details
        string severity
        string ipAddress
        string userAgent
        date createdAt
    }
```

### Database Indexes

**Critical Indexes:**

```javascript
// users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ organizationId: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ createdAt: -1 })

// prompts
db.prompts.createIndex({ category: 1, role: 1 })
db.prompts.createIndex({ featured: 1, createdAt: -1 })
db.prompts.createIndex({ organizationId: 1 })
db.prompts.createIndex({ title: "text", description: "text", content: "text" })

// api_keys
db.api_keys.createIndex({ userId: 1 })
db.api_keys.createIndex({ keyHash: 1 }, { unique: true })
db.api_keys.createIndex({ expiresAt: 1 })
db.api_keys.createIndex({ active: 1, userId: 1 })

// audit_logs
db.audit_logs.createIndex({ userId: 1, createdAt: -1 })
db.audit_logs.createIndex({ action: 1, createdAt: -1 })
db.audit_logs.createIndex({ severity: 1, createdAt: -1 })
```

---

## API Architecture

### API Route Structure

```
src/app/api/
├── auth/              # Authentication endpoints
│   ├── signin/
│   ├── signup/
│   └── signout/
├── users/             # User management
│   ├── [id]/
│   └── me/
├── prompts/           # Prompt CRUD
│   ├── [id]/
│   ├── search/
│   └── featured/
├── admin/             # Admin operations
│   ├── users/
│   ├── content/
│   └── analytics/
├── v2/                # API v2
│   └── users/
│       └── api-keys/
├── ai/                # AI execution
│   └── execute/
├── analytics/         # Analytics endpoints
├── webhooks/          # Webhook handlers
└── health/            # Health checks
```

### API Middleware Usage Example

```typescript
// Before: 68 lines of boilerplate
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    if (!['admin', 'super_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateLimitResult = await checkRateLimit(userId, 'user-create');
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const validated = CreateUserSchema.parse(body);

    const user = await createUser(validated);

    await auditLog({
      action: 'user_created',
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.apiError('/api/users', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// After: 10 lines with withAPI (85% reduction)
export const POST = withAPI({
  auth: true,
  rbac: ['admin', 'super_admin'],
  rateLimit: 'user-create',
  validate: CreateUserSchema,
  audit: { action: 'user_created' },
}, async ({ validated, userId }) => {
  const userService = createUserService();
  const user = await userService.createUser(validated, userId);
  return { success: true, user };
});
```

### tRPC Integration

```typescript
// src/server/routers/_app.ts
export const appRouter = router({
  user: userRouter,
  prompt: promptRouter,
  // ... other routers
});

export type AppRouter = typeof appRouter;
```

---

## Security Architecture

### Security Layers

```mermaid
graph TB
    A[Request] --> B[Network Layer]
    B --> C[Vercel Edge]
    C --> D[Security Headers]
    D --> E[Rate Limiting]
    E --> F[Authentication]
    F --> G[Authorization RBAC]
    G --> H[Input Validation]
    H --> I[Business Logic]
    I --> J[Data Access]
    J --> K[Audit Logging]

    subgraph "Security Controls"
        D
        E
        F
        G
        H
        K
    end
```

### Security Features

1. **Network Security**
   - HTTPS enforced (HSTS)
   - CSP headers
   - CORS configuration
   - DDoS protection via Vercel

2. **Authentication**
   - NextAuth.js session management
   - Secure password hashing (bcrypt)
   - MFA support (Twilio)
   - Session timeout

3. **Authorization**
   - RBAC with 8 role types
   - 60+ permission types
   - Resource-based access control
   - Organization isolation

4. **Input Validation**
   - Zod schema validation
   - SQL injection prevention (MongoDB)
   - XSS prevention
   - CSRF protection

5. **Data Protection**
   - API key encryption (AES-256)
   - Sensitive data masking
   - Secure session storage
   - PII handling compliance

6. **Audit & Monitoring**
   - Comprehensive audit logging
   - Sentry error tracking
   - Performance monitoring
   - Security event alerts

---

## Scalability & Performance

### Caching Strategy

```mermaid
graph TB
    A[Request] --> B{Check L1 Cache}
    B -->|Hit| C[Return Cached]
    B -->|Miss| D{Check L2 Redis}
    D -->|Hit| E[Update L1, Return]
    D -->|Miss| F[Query MongoDB]
    F --> G[Update L2 Redis]
    G --> H[Update L1 Cache]
    H --> I[Return Data]

    subgraph "L1: Memory Cache"
        B
        C
    end

    subgraph "L2: Redis/Upstash"
        D
        E
        G
    end

    subgraph "L3: Database"
        F
    end
```

### Performance Optimizations

1. **Edge Caching**
   - Vercel Edge Network
   - ISR (Incremental Static Regeneration)
   - API response caching

2. **Database**
   - Connection pooling
   - Proper indexing
   - Query optimization
   - Aggregation pipelines

3. **API**
   - Rate limiting
   - Response compression
   - Pagination
   - Field selection

4. **Frontend**
   - React Server Components
   - Code splitting
   - Image optimization
   - Lazy loading

### Scalability Patterns

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        A[Load Balancer] --> B[Next.js Instance 1]
        A --> C[Next.js Instance 2]
        A --> D[Next.js Instance N]
    end

    subgraph "Data Layer Scaling"
        E[MongoDB Replica Set]
        F[Redis Cluster]
    end

    B --> E
    C --> E
    D --> E
    B --> F
    C --> F
    D --> F
```

**Scaling Capabilities:**
- Stateless application design
- Session storage externalized
- Database connection pooling
- Redis-based caching
- CDN for static assets
- Async job processing ready

---

## Appendix

### Environment Variables

See `.env.example` for comprehensive environment configuration.

**Critical Variables:**
- `MONGODB_URI`: Database connection
- `NEXTAUTH_SECRET`: Session encryption
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.: AI providers
- `REDIS_URL`: Caching layer
- `SENDGRID_API_KEY`: Email service

### Monitoring & Observability

- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics, Google Analytics
- **Logging**: Winston with structured logging
- **Performance**: Next.js built-in metrics
- **Uptime**: Vercel monitoring

### Disaster Recovery

- MongoDB Atlas automated backups (point-in-time recovery)
- Critical data export scripts
- Environment variable backup
- Deployment rollback capability
- Database restore procedures documented

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17
**Maintained By**: Engineering Team
