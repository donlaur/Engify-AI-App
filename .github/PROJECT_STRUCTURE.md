# Engify.ai - Project Structure

This document provides an overview of the project's directory structure and organization.

---

## 📁 Root Directory

```
engify-ai/
├── .github/                    # GitHub configuration
│   └── PROJECT_STRUCTURE.md    # This file
├── api/                        # Legacy Python API stubs (to be replaced)
├── components/                 # React components (to be migrated to Next.js)
├── data/                       # Static data files (to be migrated to MongoDB)
├── docs/                       # 📚 Documentation (organized by type)
│   ├── strategy/              # Strategic planning documents
│   ├── implementation/        # Implementation guides
│   ├── guides/                # Getting started guides
│   └── README.md              # Documentation index
├── public/                     # Static assets
├── services/                   # Service layer (to be refactored)
├── App.tsx                     # Main React app (to be migrated)
├── index.tsx                   # Entry point (to be migrated)
├── package.json                # Node.js dependencies
├── requirements.txt            # Python dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration (current)
├── vercel.json                 # Vercel deployment config
└── README.md                   # Main project README
```

---

## 📚 Documentation Structure (`/docs`)

```
docs/
├── README.md                           # Documentation index and navigation
│
├── strategy/                           # 🎯 Strategic Planning
│   ├── EXECUTIVE_SUMMARY.md           # Project overview and business case
│   └── ARCHITECTURE_STRATEGY.md       # Technical architecture decisions
│
├── implementation/                     # 🔨 Implementation Guides
│   ├── IMPLEMENTATION_PLAN.md         # Day-by-day MVP implementation
│   └── AWS_DEPLOYMENT_GUIDE.md        # Production deployment on AWS
│
└── guides/                             # 📖 Getting Started
    └── QUICK_START.md                 # Quick start guide
```

### Document Purposes

#### Strategy Documents
- **EXECUTIVE_SUMMARY.md**: High-level overview for stakeholders and interviewers
- **ARCHITECTURE_STRATEGY.md**: Deep technical decisions with justifications

#### Implementation Guides
- **IMPLEMENTATION_PLAN.md**: Step-by-step guide for Week 1 MVP
- **AWS_DEPLOYMENT_GUIDE.md**: Production deployment strategy

#### Getting Started
- **QUICK_START.md**: Practical setup guide for new developers

---

## 🔄 Future Structure (After Migration)

After migrating to Next.js 14, the structure will look like:

```
engify-ai-next/
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD pipelines
│   └── PROJECT_STRUCTURE.md   # This file
│
├── docs/                       # 📚 Documentation
│   ├── strategy/              # Strategic planning
│   ├── implementation/        # Implementation guides
│   ├── guides/                # Getting started
│   └── README.md              # Documentation index
│
├── src/                        # Source code
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (auth)/           # Auth routes (login, signup)
│   │   ├── (dashboard)/      # Protected routes
│   │   │   ├── onboarding/
│   │   │   ├── pathways/
│   │   │   ├── learning-hub/
│   │   │   ├── playbooks/
│   │   │   ├── workbench/
│   │   │   └── settings/
│   │   ├── api/              # API routes
│   │   │   ├── auth/
│   │   │   ├── ai/
│   │   │   └── prompts/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── features/         # Feature-specific components
│   │   └── shared/           # Shared components
│   │
│   ├── lib/                   # Utilities and services
│   │   ├── ai/               # AI provider abstractions
│   │   │   ├── providers/
│   │   │   ├── orchestrator.ts
│   │   │   └── types.ts
│   │   ├── db/               # Database utilities
│   │   │   ├── mongodb.ts
│   │   │   └── schema.ts
│   │   ├── auth/             # Auth utilities
│   │   └── utils/            # General utilities
│   │
│   ├── types/                 # TypeScript types
│   ├── hooks/                 # Custom React hooks
│   └── config/                # Configuration files
│
├── python/                     # Python services (for AWS Lambda)
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── rag_service.py
│   │   └── embeddings.py
│   ├── utils/
│   └── requirements.txt
│
├── public/                     # Static assets
│   ├── images/
│   └── data/                  # Static data (temporary)
│
├── tests/                      # Test suites
│   ├── unit/                  # Unit tests
│   └── e2e/                   # End-to-end tests
│
├── .env.local                  # Environment variables (local)
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── package.json                # Node.js dependencies
├── pnpm-lock.yaml              # Lock file
└── README.md                   # Main project README
```

---

## 🗂️ File Organization Principles

### 1. Documentation (`/docs`)
- **Organized by type**: strategy, implementation, guides
- **Clear naming**: Descriptive filenames in SCREAMING_SNAKE_CASE
- **Index file**: README.md in each folder for navigation

### 2. Source Code (`/src`)
- **Feature-based**: Group by feature, not by file type
- **Colocation**: Keep related files together
- **Clear boundaries**: Separate concerns (UI, logic, data)

### 3. Tests (`/tests`)
- **Mirror source structure**: Same folder structure as `/src`
- **Test types**: Separate unit and E2E tests
- **Naming convention**: `*.test.ts` for unit, `*.spec.ts` for E2E

### 4. Configuration
- **Root level**: Keep config files at root for tool discovery
- **Environment**: Use `.env.local` for secrets, `.env.example` for template

---

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Documentation**: SCREAMING_SNAKE_CASE (e.g., `QUICK_START.md`)
- **Tests**: Match source file + `.test.ts` or `.spec.ts`

### Folders
- **Features**: kebab-case (e.g., `learning-hub/`)
- **Route groups**: Parentheses (e.g., `(auth)/`, `(dashboard)/`)
- **Documentation**: lowercase (e.g., `strategy/`, `guides/`)

---

## 🔍 Finding Things

### "Where do I find...?"

| What | Where |
|------|-------|
| Strategic decisions | `/docs/strategy/` |
| Implementation guides | `/docs/implementation/` |
| Getting started | `/docs/guides/QUICK_START.md` |
| React components | `/src/components/` (future) or `/components/` (current) |
| API routes | `/src/app/api/` (future) or `/api/` (current) |
| Database schema | `/src/lib/db/schema.ts` (future) |
| AI providers | `/src/lib/ai/providers/` (future) |
| Tests | `/tests/` |
| Static assets | `/public/` |
| Environment config | `.env.local` |

---

## 🚀 Next Steps

1. **Review documentation** in `/docs/`
2. **Follow implementation plan** in `/docs/implementation/IMPLEMENTATION_PLAN.md`
3. **Migrate to new structure** as outlined in this document
4. **Update this file** as the structure evolves

---

**Last Updated**: 2025-10-27  
**Status**: Current structure documented, migration planned
