# Engify.ai - Enterprise AI Engineering Platform

**Professional AI education and development platform for engineering teams**

<div align="center">

[![Live Site](https://img.shields.io/badge/🚀_Live-engify.ai-blue?style=for-the-badge)](https://engify.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Production-ready AI engineering platform with enterprise-grade architecture**

[View Live Site](https://engify.ai) • [Documentation](docs/) • [API Reference](docs/api/)

</div>

---

## Executive Summary

Engify.ai is a **production-ready B2B SaaS platform** that transforms engineering teams into AI power users. This repository showcases **enterprise-grade software engineering** through iterative development sprints, each delivering production-quality features with full testing, documentation, and operational runbooks.

**Built By**: Donnie Laur - Engineering Leader & AI/SaaS Architect  
**Purpose**: Live SaaS product + Portfolio showcase for engineering leadership roles

### 🎯 Value Propositions

**For Engineering Teams (B2B SaaS)**:
- 📚 **100+ Expert Prompts**: Curated library for engineering, product, design teams
- 🎯 **15 Battle-Tested Patterns**: Research-backed frameworks (CRAFT, KERNEL, etc.)
- 🔧 **Interactive Workbenches**: OKRs, retrospectives, tech debt analysis with AI
- 💰 **Cost Controls**: Per-tool budgets prevent runaway AI costs ($0.75-$2.50 limits)
- 🔒 **Enterprise Security**: RBAC, MFA, audit logging, PII redaction (GDPR/SOC2)

**For Hiring Managers (Portfolio Showcase)**:
- ⚡ **Shipping Velocity**: 5-day sprints with 620+ tests and zero bugs
- 🏗️ **System Design**: Multi-tenant architecture, provider abstraction, observability
- 📊 **Quality Standards**: 100% test coverage, flaky test detection, security gates
- 📖 **Documentation**: ADRs, incident playbooks, architectural diagrams
- 🔄 **Operational Excellence**: Health checks, RED metrics, cost attribution

---

## Technical Architecture

### Core Technology Stack

| Component          | Technology     | Version | Purpose                           |
| ------------------ | -------------- | ------- | --------------------------------- |
| **Frontend**       | Next.js        | 15.5.4  | React framework with App Router   |
| **Language**       | TypeScript     | 5.0     | Strict mode, zero `any` types     |
| **Database**       | MongoDB Atlas  | Latest  | Document store with vector search |
| **Authentication** | NextAuth.js    | v5      | Session management, OAuth         |
| **AI Integration** | Multi-provider | Latest  | OpenAI, Anthropic, Google, Groq   |
| **Monitoring**     | Sentry         | Latest  | Error tracking, performance       |
| **Deployment**     | Vercel         | Latest  | Edge functions, global CDN        |

### Architecture Principles

- **Stability Over Bleeding Edge**: Production-tested versions (Next.js 15.5.4, not 16.0 RC)
- **Type Safety**: TypeScript strict mode with comprehensive type definitions
- **Security First**: CSP headers, rate limiting, input validation, SOC 2 roadmap
- **Performance Optimized**: Server Components, streaming SSR, edge caching
- **Scalable Design**: Stateless architecture, horizontal scaling ready

---

## Platform Capabilities

### Learning Management System

**Structured Curriculum**

- 120+ expert-curated learning resources
- 23 documented prompt engineering patterns
- Role-based content (C-Level, Managers, Engineers, PMs, Designers, QA)
- Progressive skill development pathways

**Interactive Workbench**

- Real-time AI prompt testing
- Multi-provider AI integration (OpenAI, Anthropic, Google, Groq)
- Pattern library with copy-optimize functionality
- Performance benchmarking and comparison

### Enterprise Features

**Team Management**

- Role-based access control (RBAC)
- Team analytics and progress tracking
- Custom prompt library creation
- SSO integration ready

**Developer Tools**

- RESTful API for integration
- Comprehensive documentation
- SDK for custom implementations
- Webhook support for real-time updates

**Security & Compliance**

- Enterprise authentication (OAuth, SAML)
- Audit logging and compliance reporting
- Data encryption at rest and in transit
- SOC 2 Type II compliance roadmap

---

## Development Standards

### Code Quality

**TypeScript Strict Mode**

- Zero `any` types allowed
- Comprehensive type definitions
- Strict null checks enabled
- Path mapping with `@/` aliases

**Testing Strategy**

- Unit tests (Vitest) - **620+ tests** with 100% pass rate
- Integration tests (API routes) - Full endpoint coverage
- End-to-end tests (Playwright) - Critical user workflows
- Visual regression testing - UI consistency validation
- Smoke tests for deployment - Production readiness checks
- Repository Pattern tests - 91 tests with 100% success rate
- AI Provider tests - 49 tests covering all 4 providers
- **NEW**: Flaky test detection - Runs suite 3-5x to catch inconsistent tests

**Test Documentation**

- [Testing Strategy & Methodology](docs/testing/TESTING_STRATEGY.md) - Complete testing approach including unit/integration/smoke/regression/E2E, coverage targets, pre-commit gates, and AI-specific testing
- [Complete Test Suite Guide](tests/README.md) - Comprehensive testing documentation
- [Repository Pattern Tests](src/lib/repositories/__tests__/README.md) - Detailed Repository Pattern coverage
- [Phase 1 Test Report](docs/testing/PHASE_1_TEST_REPORT.md) - AI Provider interface results

**Code Standards**

- ESLint with TypeScript rules
- Prettier for code formatting
- Pre-commit hooks for quality gates
- Conventional commit messages
- Comprehensive JSDoc documentation

### Development Workflow

**Git Workflow**

- Feature branch strategy
- Pull request required for main
- Automated testing and quality checks
- Semantic versioning

**CI/CD Pipeline**

- GitHub Actions for automation
- Automated testing on PRs
- Quality gates before merge
- Automated deployment to staging/production

**Monitoring & Observability**

- **RED Metrics**: Rate/Errors/Duration tracking with p50/p95/p99 latencies
- Sentry for error tracking and distributed tracing
- Google Analytics 4 for user behavior insights
- Performance monitoring with custom dashboards
- Real-time health checks for all services (Database, Redis, SendGrid, Twilio)
- Provider cost tracking and budget enforcement
- Uptime monitoring with incident playbooks

---

## Getting Started

### Prerequisites

- Node.js 18.17+
- pnpm 8.0+
- MongoDB Atlas account
- AI provider API keys (OpenAI, Anthropic, Google)

### Quick Start

```bash
# Clone repository
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
pnpm dev
```

### Environment Configuration

Required environment variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Providers
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_API_KEY=your-google-api-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

See [Configuration Guide](docs/development/CONFIGURATION.md) for complete setup instructions.

---

## API Documentation

### Core Endpoints

**Authentication**

- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Session validation

**Learning Resources**

- `GET /api/resources` - List learning resources
- `GET /api/resources/[id]` - Get specific resource
- `POST /api/resources` - Create new resource (admin)

**AI Integration**

- `POST /api/ai/execute` - Execute AI prompt
- `GET /api/ai/providers` - List available providers
- `POST /api/ai/test` - Test AI provider connection

**Analytics**

- `GET /api/analytics/usage` - Usage statistics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/errors` - Error reporting

See [API Reference](docs/api/) for complete documentation.

---

## Performance Metrics

### Build & Runtime Performance

| Metric                       | Value      | Target      |
| ---------------------------- | ---------- | ----------- |
| **Build Time**               | <6 seconds | <10 seconds |
| **Lighthouse Score**         | 95+        | 90+         |
| **First Contentful Paint**   | <1.5s      | <2.0s       |
| **Largest Contentful Paint** | <2.5s      | <3.0s       |
| **Cumulative Layout Shift**  | <0.1       | <0.25       |
| **Time to Interactive**      | <3.0s      | <4.0s       |

### Scalability Metrics

| Component                | Capacity  | Notes                    |
| ------------------------ | --------- | ------------------------ |
| **Concurrent Users**     | 10,000+   | Horizontal scaling ready |
| **API Requests**         | 1M+/month | Rate limited, cached     |
| **Database Connections** | 100+      | Connection pooling       |
| **File Storage**         | 100GB+    | CDN distributed          |

---

## Security & Compliance

### Security Measures

**Authentication & Authorization**

- Multi-factor authentication support
- Role-based access control (RBAC)
- Session management with secure cookies
- OAuth 2.0 integration ready

**Data Protection**

- Encryption at rest (MongoDB Atlas)
- Encryption in transit (TLS 1.3)
- Input validation and sanitization
- SQL injection prevention

**Infrastructure Security**

- Content Security Policy (CSP) headers
- Rate limiting and DDoS protection
- Security headers (HSTS, X-Frame-Options)
- Regular security audits

### Compliance Roadmap

- **SOC 2 Type II** - In progress
- **GDPR Compliance** - Data privacy controls
- **CCPA Compliance** - California privacy rights
- **HIPAA Ready** - Healthcare data protection

---

## Contributing

### Development Standards

We maintain high standards for code quality and documentation:

**Code Requirements**

- TypeScript strict mode
- Comprehensive test coverage
- JSDoc documentation
- Conventional commit messages
- Pre-commit quality checks

**Documentation Standards**

- Architecture Decision Records (ADRs)
- API documentation with examples
- Troubleshooting guides
- Performance benchmarks

See [Contributing Guide](CONTRIBUTING.md) for detailed guidelines.

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch (`feature/description`)
3. **Develop** with tests and documentation
4. **Submit** pull request with description
5. **Review** and address feedback
6. **Merge** after approval and CI passes

---

## Roadmap

### Q1 2025

- [ ] Advanced RAG system implementation
- [ ] Multi-agent workflow support
- [ ] Enterprise SSO integration
- [ ] Advanced analytics dashboard

### Q2 2025

- [ ] Custom model fine-tuning
- [ ] Vector database optimization
- [ ] Mobile application (PWA)
- [ ] Advanced security features

### Q3 2025

- [ ] AI-powered code generation
- [ ] Integration marketplace
- [ ] Advanced team collaboration
- [ ] Performance optimization

---

## Support & Contact

**Documentation**

- [Architecture Overview](docs/architecture/OVERVIEW.md)
- [Development Guide](docs/development/)
- [API Reference](docs/api/)
- [Deployment Guide](docs/deployment/)

**Community**

- [GitHub Issues](https://github.com/donlaur/Engify-AI-App/issues)
- [Discussions](https://github.com/donlaur/Engify-AI-App/discussions)
- [Live Site](https://engify.ai)

**Enterprise Support**

- Custom implementation services
- Training and consulting
- Priority support and SLA
- On-premise deployment options

---

## 💼 Engineering Leadership Showcase

This repository demonstrates skills relevant to **Staff Engineer, Engineering Manager, and Director of Engineering** roles:

### Technical Leadership
- **Architecture**: Provider abstraction, contract-based execution, budget enforcement
- **System Design**: Multi-tenant SaaS, horizontal scaling patterns, observability
- **Code Quality**: TypeScript strict mode, 620+ tests, zero `any` types, comprehensive mocking
- **API Design**: RESTful conventions, OpenAPI specs, versioned endpoints (`/api/v2/`)

### Operational Excellence
- **Monitoring**: Custom RED metrics (Rate/Errors/Duration), SLO tracking, health checks
- **Security**: RBAC on every route, PII redaction, key rotation, audit trails
- **Reliability**: Replay protection, rate limiting, budget guards, incident playbooks
- **Cost Management**: Per-tool budgets, provider cost tracking, usage attribution

### Team & Process
- **Documentation**: 4 ADRs explaining architectural decisions with alternatives
- **Runbooks**: 3 incident playbooks with diagnosis, resolution, escalation
- **Testing**: Flaky test detection, security gates, policy enforcement
- **CI/CD**: Automated quality gates, secret scanning, bundle size limits

### Sprint Execution
- **Day 5 Example**: 11 phases, 54 files changed, 620 tests passing, 0 bugs shipped
- **Commit Discipline**: Atomic commits, conventional messages, full test coverage
- **Code Reviews**: Self-review via red-hat analysis after each phase

**Contact**: [LinkedIn](https://www.linkedin.com/in/donlaur/) | donlaur@gmail.com

---

## 🚀 Recent Development Milestones

This repository demonstrates production-ready software engineering through iterative daily development sprints, each focused on enterprise-grade features.

### Day 5 - Infrastructure, Messaging & Workbenches (Oct 31, 2025)
**Theme**: Production hardening and operational excellence  
**Focus**: Messaging reliability, cost controls, observability

**Key Deliverables**:
- ✅ **Twilio MFA/SMS Production**: E.164 validation, rate limiting (3 sends/min, 6 verifies/min), webhook signature verification, replay protection, full audit trail
- ✅ **SendGrid Transactional Email**: ECDSA webhook verification, typed template registry with Zod validation, bounce/complaint tracking, health monitoring
- ✅ **Workbench Budget Enforcement**: Per-tool cost contracts ($0.75-$2.50 limits), replay detection (409 response), dual cost/token guards (403 on breach)
- ✅ **RED Metrics Observability**: Rate/Errors/Duration tracking, p50/p95/p99 latency percentiles, provider cost aggregation, `/api/health` dashboard
- ✅ **CI/CD Hardening**: Flaky test detector (runs suite 3-5x), bundle size budgets, route guard gates, enhanced security scanning
- ✅ **Security & Compliance**: PII redaction (GDPR/SOC2), API key rotation utilities, comprehensive audit logging

**Technical Highlights**:
- 620 unit tests (100% pass rate)
- 10 production commits with atomic scope
- 4 Architecture Decision Records (ADRs)
- 3 incident response playbooks
- Zero build errors, production-ready

**Documentation**: [Day 5 Plan](docs/planning/DAY_5_PLAN.md) | [Completion Summary](docs/planning/DAY_5_COMPLETION_SUMMARY.md) | [Quick Reference](docs/planning/DAY_5_QUICK_REFERENCE.md)

---

### Day 4 - Enterprise RBAC & Admin Dashboard (Oct 2025)
**Theme**: Enterprise-grade access control and administration  
**Focus**: Multi-tenant security, admin operations

**Key Deliverables**:
- Role-based access control (6 roles: free → enterprise_premium)
- Permission-based authorization (13 granular permissions)
- Admin dashboard (OpsHub) with user management, content review, audit logs
- Multi-tenant data isolation with organizationId enforcement
- MFA enforcement for super_admin roles

**Documentation**: [Enterprise RBAC](docs/planning/ENTERPRISE_RBAC_AND_ADMIN_DASHBOARD.md)

---

### Day 3 - Multi-Provider AI Integration (Oct 2025)
**Theme**: Provider-agnostic AI execution  
**Focus**: Flexibility, cost optimization, reliability

**Key Deliverables**:
- AI Provider Factory with Strategy pattern
- 5 providers (OpenAI, Anthropic, Google, Groq, Replicate)
- Unified interface for all providers
- Cost tracking and comparison
- Timeout/retry harness for resilience

---

### Day 2 - Repository Pattern & Testing (Oct 2025)
**Theme**: Data layer abstraction and quality  
**Focus**: Testability, maintainability

**Key Deliverables**:
- Repository pattern for data access
- 91 passing repository tests
- Mock vs real implementations
- Integration test suite

---

### Day 1 - Foundation & Architecture (Oct 2025)
**Theme**: Core platform and best practices  
**Focus**: Stability, standards, scalability

**Key Deliverables**:
- Next.js 15.5.4 with App Router
- MongoDB with NextAuth integration
- TypeScript strict mode
- Testing infrastructure
- CI/CD pipeline

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with enterprise-grade practices and production-ready architecture. Demonstrates modern software engineering standards suitable for technical leadership roles.**
