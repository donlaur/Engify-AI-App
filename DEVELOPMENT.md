# Development Guide

**Quick start guide for developers and contributors**

## Prerequisites

- **Node.js** 18.17+ ([Download](https://nodejs.org/))
- **pnpm** 8.0+ (`npm install -g pnpm`)
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/atlas))
- **AI Provider API Keys** (OpenAI, Anthropic, Google)

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App
pnpm install

# 2. Environment setup
cp .env.example .env.local
# Edit .env.local with your configuration

# 3. Start development
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Setup

Create `.env.local` in the root directory:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Providers (at least one required)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_API_KEY=your-google-api-key
GROQ_API_KEY=gsk_your-groq-key

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:ui          # Run UI tests
pnpm test:coverage    # Generate coverage report

# Database
pnpm seed             # Seed database with sample data
pnpm db:reset         # Reset database

# Utilities
pnpm audit:icons      # Audit icon usage
pnpm analyze:tests    # Analyze test results
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── api/            # API routes
│   ├── learn/          # Learning resources
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── lib/                # Utilities and configurations
│   ├── auth/           # Authentication logic
│   ├── db/             # Database connections
│   ├── ai/             # AI provider integrations
│   └── utils/          # Utility functions
└── types/              # TypeScript type definitions

docs/                   # Documentation
├── architecture/       # Architecture decisions
├── development/        # Development guides
├── api/               # API documentation
└── deployment/        # Deployment guides

scripts/                # Development scripts
├── development/       # Development utilities
├── testing/           # Test automation
├── deployment/        # Deployment scripts
└── maintenance/        # Maintenance tasks

python/                 # Python AI workbench
├── api/               # AI execution scripts
├── requirements.txt   # Python dependencies
└── README.md          # Python setup guide
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes with tests
# Write tests first (TDD approach)
pnpm test

# Commit with conventional format
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Code Quality Standards

**TypeScript**
- Strict mode enabled
- No `any` types allowed
- Comprehensive type definitions
- JSDoc for public APIs

**Testing**
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for user flows
- Visual regression tests

**Code Style**
- ESLint with TypeScript rules
- Prettier for formatting
- Pre-commit hooks enabled
- Conventional commits

### 3. Pull Request Process

1. **Create PR** with descriptive title and description
2. **Run Tests** - All tests must pass
3. **Code Review** - Address feedback
4. **Quality Checks** - Linting, type checking
5. **Merge** - Squash and merge to main

## Common Tasks

### Adding New AI Provider

1. Create provider class in `src/lib/ai/providers/`
2. Implement `AIProvider` interface
3. Add to provider registry
4. Update environment variables
5. Add tests

### Creating New API Route

1. Create route file in `src/app/api/`
2. Add input validation with Zod
3. Implement error handling
4. Add authentication if needed
5. Write integration tests

### Adding New Component

1. Create component in `src/components/`
2. Add TypeScript interfaces
3. Implement responsive design
4. Add Storybook stories
5. Write unit tests

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear caches
rm -rf .next node_modules/.cache
pnpm install
pnpm build
```

**TypeScript Errors**
```bash
# Check types
pnpm type-check
# Fix with strict mode compliance
```

**Database Connection**
```bash
# Verify MongoDB URI
echo $MONGODB_URI
# Test connection
pnpm db:test
```

**AI Provider Issues**
```bash
# Test API keys
pnpm test:ai-keys
# Check rate limits
```

### Performance Issues

**Slow Builds**
- Check for circular dependencies
- Optimize imports
- Use dynamic imports for heavy components

**Runtime Performance**
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Optimize database queries

## Getting Help

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/donlaur/Engify-AI-App/issues)
- **Discussions**: [GitHub Discussions](https://github.com/donlaur/Engify-AI-App/discussions)
- **Live Site**: [engify.ai](https://engify.ai)

---

**This development guide demonstrates professional development practices and enterprise-grade workflows suitable for production environments.**
