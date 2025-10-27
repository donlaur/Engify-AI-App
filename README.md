<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Engify.ai - From AI Fear to AI Fluency

An AI-powered platform that helps engineering teams transition from AI fear to AI fluency through curated learning pathways, 100+ role-specific prompt templates, and an interactive AI workbench.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

---

## 🚀 Features

- **Onboarding Journey**: Guided introduction to AI tools and best practices
- **Learning Pathways**: Curated learning experiences for different roles
- **Learning Hub**: AI-powered article analysis and insights
- **Prompt Playbooks**: 100+ role-specific prompt templates
- **AI Workbench**: Interactive tools for engineering leaders (OKRs, retrospectives, tech debt analysis)
- **Multi-Provider AI**: Support for Gemini, OpenAI, Anthropic, and AWS Bedrock
- **BYOK Model**: Bring Your Own Keys - use your own AI API keys

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

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes + Python Lambda Functions
- **Database**: MongoDB Atlas (with Vector Search for RAG)
- **AI Providers**: Google Gemini, OpenAI, Anthropic, AWS Bedrock
- **Hosting**: AWS (Lambda, API Gateway, CloudFront, S3)
- **Deployment**: SST (Serverless Stack)

---

## 🚦 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- AI API keys (Gemini, OpenAI, or Anthropic)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/engify-ai.git
cd engify-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

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
