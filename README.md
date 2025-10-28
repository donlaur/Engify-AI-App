# Engify.ai - AI Engineering Education Platform

**From Prompt Engineering to Production AI Systems**

<div align="center">

[![Live Site](https://img.shields.io/badge/🚀_Live-engify.ai-blue?style=for-the-badge)](https://engify.ai)
[![Commits](https://img.shields.io/badge/Commits-520-green?style=for-the-badge)](https://github.com/donlaur/Engify-AI-App/commits/main)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Production-ready AI education platform. 107 free resources. 23 patterns. 4 AI providers.**

[View Live Site](https://engify.ai) • [Learning Resources](https://engify.ai/learn) • [Documentation](docs/)

</div>

---

## 🎯 What We've Built (520 Commits in One Day)

AI engineering education platform built from concept to production in 24 hours. Full-stack Next.js application with MongoDB, multi-provider AI integration, and enterprise-grade architecture.

**Technical Achievement:**
- 520 commits in one day (all functional, deployable)
- Full authentication, authorization, and security
- Multi-provider AI integration (OpenAI, Claude, Gemini, Groq)
- 120+ learning resources, 23 prompt patterns
- TypeScript strict mode, comprehensive testing, CI/CD
- Production-ready with SOC 2 roadmap

**What It Does:**
Progressive learning platform teaching prompt engineering, RAG systems, multi-agent architectures, and production AI best practices. Role-based content for C-Level through individual contributors.

---

## ✨ Key Features

### For Your Team

- **Role-Based Content** - Prompts tailored to C-Level, Managers, Engineers, PMs, Designers, QA
- **Pattern Library** - 15 documented patterns (Persona, Few-Shot, Chain-of-Thought, etc.)
- **Interactive Workbench** - Test prompts with real AI (OpenAI, Anthropic, Google)
- **Learning Pathways** - Guided progression from beginner to expert
- **Copy & Optimize** - One-click copy with automatic improvements

### For Engineering Leaders

- **Team Analytics** - Track adoption, measure impact
- **Custom Prompts** - Build your own library
- **SSO Integration** - Enterprise-ready auth
- **API Access** - Integrate into your tools
- **Audit Logs** - Track usage, ensure compliance

---

## 🏗️ Technical Highlights

### Architecture
- **Next.js 15.5.4** (App Router, Server Components, RSC)
- **TypeScript** (Strict mode, zero `any` types)
- **MongoDB Atlas** (Vector Search ready for RAG)
- **NextAuth.js v5** (Session management, OAuth)
- **Multi-Provider AI** (Abstraction layer, automatic fallback)

### Development Approach
- **AI-Augmented**: Built with Windsurf + Claude Sonnet 3.5
- **Quality-First**: TypeScript strict, ESLint, Prettier, pre-commit hooks
- **Red Hat Thinking**: Stable versions (Next.js 15.5.4, not 16.0 RC)
- **Small Commits**: 520 commits = easy to review, revert, understand
- **Built in Public**: All commits on GitHub, fully documented

### Production Ready
- **Security**: CSP headers, rate limiting, input validation, SOC 2 roadmap
- **Testing**: Visual regression, E2E tests, API tests, smoke tests
- **Monitoring**: Sentry error tracking, performance monitoring
- **CI/CD**: GitHub Actions, automated deployments, quality gates
- **Documentation**: Comprehensive architecture, API, and deployment docs

---

## 📊 The Numbers

| Metric                | Value                         |
| --------------------- | ----------------------------- |
| **Prompts**           | 66+ expert-curated            |
| **Patterns**          | 15 documented frameworks      |
| **Roles**             | 10 (C-Level to QA)            |
| **Experience Levels** | 7 (Junior to VP)              |
| **AI Providers**      | 3 (OpenAI, Anthropic, Google) |
| **Commits**           | 470+ (one day)                |
| **Lines of Code**     | ~5,000 TypeScript             |
| **Build Time**        | <6 seconds                    |
| **Lighthouse Score**  | 95+                           |

---

## 🛠️ Technology Deep Dive

### **Architecture**

**Framework**: Next.js 15.5.4 (App Router)

- Server Components for performance
- Client Components for interactivity
- Streaming SSR for instant page loads
- Route handlers for API endpoints

**Why Next.js 15.5.4 (not 16.0.0)?**

- Stability over bleeding edge (Red Hat thinking)
- Full Sentry compatibility
- Proven in production
- Enterprise support from Vercel

### **Frontend Stack**

**UI Framework**: React 18.3.1

- Functional components + hooks
- TypeScript strict mode (zero `any` types)
- Composition over inheritance
- Custom hooks for reusable logic

**Styling**: Tailwind CSS + shadcn/ui

- Utility-first CSS
- Component library (shadcn/ui)
- Dark mode support
- Responsive by default
- Custom design system

**State Management**:

- React Context for global state
- URL state for filters/search
- Local storage for preferences
- No Redux (YAGNI principle)

### **Backend Stack**

**Database**: MongoDB Atlas

- Document-based (flexible schema)
- Indexes on: id, role, category, tags
- Connection pooling (10 max, 5 min)
- Automatic failover
- Backup every 6 hours

**Authentication**: NextAuth v5

- Credentials provider (email/password)
- Session-based auth
- Secure cookies (httpOnly, sameSite)
- CSRF protection
- Rate limiting on auth endpoints

**AI Integration**:

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3.5 Sonnet
- **Google**: Gemini Pro
- Automatic model selection based on task
- Streaming responses for UX
- Error handling & fallbacks

### **Infrastructure**

**Hosting**: Vercel

- Edge network (global CDN)
- Automatic SSL
- Preview deployments
- Analytics built-in
- 99.99% uptime SLA

**Monitoring**: Sentry

- Error tracking
- Performance monitoring
- Source maps for debugging
- Real-time alerts
- User context capture

**CI/CD**: GitHub Actions

- Lint on every PR
- Type-check on every commit
- Build verification
- Security scanning (Dependabot)
- Automatic deployments

### **Data Flow**

```
User Request
    ↓
Next.js Middleware (auth check)
    ↓
Server Component (fetch data)
    ↓
MongoDB (query prompts)
    ↓
Client Component (render UI)
    ↓
User Interaction (copy prompt)
    ↓
API Route (execute with AI)
    ↓
OpenAI/Anthropic/Google
    ↓
Stream Response
    ↓
Display Result
```

### **Security**

**Authentication**:

- Bcrypt password hashing (10 rounds)
- Session tokens (JWT)
- CSRF tokens on all forms
- Rate limiting (10 req/min per IP)

**Data Protection**:

- Environment variables for secrets
- No API keys in client code
- Secure headers (CSP, HSTS, X-Frame-Options)
- Input sanitization
- SQL injection prevention (MongoDB)

**Monitoring**:

- Sentry error tracking
- Failed login alerts
- Unusual activity detection
- Audit logs for sensitive actions

### **Performance Optimizations**

**Code Splitting**:

- Route-based splitting (automatic)
- Dynamic imports for heavy components
- Lazy loading for images
- Prefetching for navigation

**Caching**:

- Static page generation (SSG)
- Incremental Static Regeneration (ISR)
- API response caching (60s TTL)
- CDN edge caching

**Database**:

- Indexes on frequently queried fields
- Connection pooling
- Query optimization
- Pagination (50 items/page)

**Bundle Size**:

- Tree shaking (remove unused code)
- Minification (Terser)
- Compression (gzip + Brotli)
- Total JS: ~150KB (gzipped)

---

## 📁 Project Structure

```
engify-ai-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── api/               # API routes
│   │   ├── library/           # Prompt library
│   │   ├── patterns/          # Pattern documentation
│   │   ├── learn/             # Learning pathways
│   │   └── for-*/             # Role-specific pages
│   ├── components/
│   │   ├── features/          # Feature components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   ├── data/
│   │   ├── playbooks.ts       # 66+ prompts (source of truth)
│   │   ├── pattern-details.ts # Pattern explanations
│   │   └── learning-pathways.ts
│   ├── lib/
│   │   ├── ai/                # AI client wrappers
│   │   ├── auth/              # NextAuth config
│   │   ├── db/                # MongoDB client
│   │   └── schemas/           # Zod schemas (validation)
│   └── styles/                # Global CSS
├── scripts/
│   ├── seed-prompts-to-db.ts  # Seed MongoDB
│   └── check-links.ts         # Link validation
├── .github/
│   └── workflows/             # CI/CD pipelines
├── docs/                      # 📚 Documentation
│   ├── planning/              # Roadmaps & strategy
│   ├── development/           # Architecture & code quality
│   ├── content/               # Content strategy
│   └── archived/              # Completed milestones
└── tests/                     # Test suites
```

---

## 🚦 Quality Gates

**Every commit must pass**:

- ✅ TypeScript type-check (zero errors)
- ✅ ESLint (zero warnings)
- ✅ Prettier (consistent formatting)
- ✅ Build succeeds
- ✅ No security vulnerabilities
- ✅ No secrets in code

**Pre-commit hooks** (Husky):

- Lint staged files
- Type-check
- Format code
- Security scan

**CI/CD** (GitHub Actions):

- Run on every PR
- Block merge if failing
- Automatic deployments to Vercel

[View Quality Standards →](.github/QUALITY_GATES.md)

---

## 🎓 Development Philosophy

### **Red Hat Thinking**

Stability over bleeding edge. Production-ready over cutting-edge.

**Example**: Next.js 15.5.4 (stable) not 16.0.0 (RC)

- Lower risk of bugs
- Full ecosystem compatibility
- Enterprise support
- Proven in production

### **Progressive Enhancement**

Start simple, add complexity when validated.

**Example**: TypeScript files → MongoDB

- Day 1: Static prompts in `.ts` files (5 min to add 10 prompts)
- Day 2: MongoDB when persistence validated
- Result: Shipped fast, validated UX, then scaled

### **Small Commits = Big Wins**

520 commits in one day because:

- Each commit is functional and deployable
- Easy to revert if wrong
- Shows thinking process
- Never lose work

### **Transparency Over Perfection**

Built in public. Learn in public. Ship in public.

---

## 🏃 Quick Start

```bash
# Clone
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App

# Install
pnpm install

# Environment
cp .env.example .env.local
# Add your MongoDB URI, API keys

# Seed database
npm run seed:prompts

# Run
npm run dev
```

Visit `http://localhost:3005`

**Full setup guide**: [SETUP_AUTH.md](SETUP_AUTH.md)

---

## 📈 Roadmap

### ✅ Completed (Day 1)

- Production auth (MongoDB + NextAuth)
- AI integration (OpenAI, Anthropic, Google)
- 66+ prompts, 15 patterns
- Role-based content
- Sentry monitoring
- CI/CD pipeline

### 🚀 Next (Sprint to 500 commits)

- [ ] MCP content section
- [ ] AI-assisted coding tips page
- [ ] Wire Pattern Detail Drawer
- [ ] Visual bug sweep
- [ ] RAG chatbot (Phase 2)

**Full roadmap**: [NEXT_STEPS.md](NEXT_STEPS.md)

---

## 👨‍💼 About the Developer

**Donnie Laur** - Engineering Manager who codes.

I built this in one day to demonstrate:

- ✅ AI-augmented development workflows
- ✅ Rapid iteration without sacrificing quality
- ✅ Modern engineering leadership
- ✅ Built in public philosophy

**Why this matters**: Most leaders talk about AI adoption. I'm showing how it's done.

📄 [Read My Philosophy →](docs/INTERVIEW_INSIGHTS.md)  
🚀 [See the Journey →](https://engify.ai/built-in-public)

---

## 📞 Contact

**Donnie Laur**  
Engineering Manager | AI-Augmented Development

- 🌐 **Portfolio**: [engify.ai](https://engify.ai)
- 💼 **LinkedIn**: [linkedin.com/in/donlaur](https://linkedin.com/in/donlaur)
- 🐙 **GitHub**: [@donlaur](https://github.com/donlaur)
- 📧 **Email**: donlaur@gmail.com

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

<div align="center">

**Built in public. Learn in public. Ship in public.**

_This is a portfolio piece demonstrating modern engineering practices._

[⭐ Star this repo](https://github.com/donlaur/Engify-AI-App) • [🐛 Report Bug](https://github.com/donlaur/Engify-AI-App/issues) • [💡 Request Feature](https://github.com/donlaur/Engify-AI-App/issues)

</div>
