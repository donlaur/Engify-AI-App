<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Engify.ai - From AI Fear to AI Fluency

An AI-powered platform that helps engineering teams transition from AI fear to AI fluency through curated learning pathways, 100+ role-specific prompt templates, and an interactive AI workbench.

[![CI](https://github.com/donlaur/Engify-AI-App/actions/workflows/ci.yml/badge.svg)](https://github.com/donlaur/Engify-AI-App/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://engify.ai)

---

## 🚀 Features

### Core Features
- **Prompt Library**: 100+ curated, role-specific prompt templates
- **Learning Pathways**: Guided learning experiences for different roles
- **Interactive Workbench**: Practice prompt engineering with real-time feedback
- **Favorites & Ratings**: Save and rate prompts for easy access
- **Search & Filter**: Find prompts by category, role, and difficulty

### Technical Features
- **Mobile-First Design**: Optimized for mobile, tablet, and desktop
- **PWA Support**: Install as an app on iOS and Android
- **Type-Safe APIs**: End-to-end type safety with tRPC
- **Modern UI**: Beautiful components with Tailwind CSS + shadcn/ui
- **Offline Ready**: Works without internet (coming soon)

---

## 📚 Documentation

**New to the project?** Start here:

1. **[Executive Summary](./docs/strategy/EXECUTIVE_SUMMARY.md)** - Project overview and strategic decisions
2. **[Quick Start Guide](./docs/guides/QUICK_START.md)** - Get up and running in minutes
3. **[Implementation Plan](./docs/implementation/IMPLEMENTATION_PLAN.md)** - Day-by-day development guide

### Full Documentation

- **Strategy Documents** - [`/docs/strategy`](./docs/strategy)
  - [Executive Summary](./docs/strategy/EXECUTIVE_SUMMARY.md)
  - [Architecture Strategy](./docs/strategy/ARCHITECTURE_STRATEGY.md)
  - [Auth & Billing Strategy](./docs/strategy/AUTH_AND_BILLING_STRATEGY.md)
  - [SaaS Model Overview](./docs/strategy/SAAS_MODEL_OVERVIEW.md)
  - [Enterprise Strategy](./docs/strategy/ENTERPRISE_STRATEGY.md)

- **Implementation Guides** - [`/docs/implementation`](./docs/implementation)
  - [Implementation Plan](./docs/implementation/IMPLEMENTATION_PLAN.md)
  - [AWS Deployment Guide](./docs/implementation/AWS_DEPLOYMENT_GUIDE.md)

- **Getting Started** - [`/docs/guides`](./docs/guides)
  - [Quick Start Guide](./docs/guides/QUICK_START.md)

See the [Documentation Index](./docs/README.md) for complete navigation.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand
- **API**: tRPC (type-safe)

### Backend
- **API**: tRPC + Next.js API Routes
- **Database**: MongoDB Atlas
- **Auth**: NextAuth.js v5
- **Validation**: Zod

### Mobile
- **PWA**: Progressive Web App support
- **iOS**: Installable, optimized
- **Android**: Installable, optimized
- **Future**: React Native or Swift/Kotlin apps

### Deployment
- **Hosting**: AWS (Amplify or Lambda)
- **Database**: MongoDB Atlas
- **CDN**: CloudFront
- **Infrastructure**: SST (Serverless Stack)

---

## 🚦 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MongoDB Atlas account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to see the app.

**📱 Mobile**: Open on your phone and add to home screen for the full app experience!

For detailed setup instructions, see the [Quick Start Guide](./docs/guides/QUICK_START.md).

---

## 📅 Development Roadmap

- [x] **Week 1**: MVP with authentication and multi-provider AI
- [ ] **Week 2**: AWS migration and production deployment
- [ ] **Week 3**: RAG implementation with MongoDB Atlas Vector Search
- [ ] **Week 4**: Polish and public launch

See the [Implementation Plan](./docs/implementation/IMPLEMENTATION_PLAN.md) for details.

---

## 🤝 Development Workflow

### Git Workflow

**Commit often, push immediately**:
```bash
# Make changes
git add .
git commit -m "feat(scope): description"
git push origin main

# Repeat 5-20 times per day
```

**No deployment on push** - Commit freely without triggering builds.

See [GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md) for complete guide.

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI providers: [Google Gemini](https://ai.google.dev/), [OpenAI](https://openai.com/), [Anthropic](https://www.anthropic.com/)

---

## 📞 Contact

- **Project Link**: [https://github.com/yourusername/engify-ai](https://github.com/yourusername/engify-ai)
- **Documentation**: [./docs](./docs)

---

**Built with ❤️ for engineering leaders**
