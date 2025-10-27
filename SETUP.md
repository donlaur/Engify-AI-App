# Engify.ai Setup Guide

## ✅ This is a Next.js Application

**NOT Vite!** This is a proper Next.js 14 App Router application.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI="mongodb://localhost:27017/engify-ai"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
engify-ai-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── lib/
│   │   ├── db/
│   │   │   └── schema.ts       # Database schemas (Zod)
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utility functions
│   │   └── middleware/         # API middleware
│   └── components/             # React components
├── docs/                       # Documentation
├── scripts/                    # Build/dev scripts
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
└── tsconfig.json               # TypeScript config
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript** (strict mode)
- **Tailwind CSS** + shadcn/ui
- **React Query** (data fetching)
- **Zustand** (state management)

### Backend
- **Next.js API Routes**
- **MongoDB** (Atlas)
- **NextAuth.js v5** (authentication)
- **Zod** (validation)

### Development
- **ESLint** (strict TypeScript rules)
- **Prettier** (code formatting)
- **Husky** (pre-commit hooks)
- **Vitest** (testing)

---

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Check TypeScript
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Testing
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
```

---

## 🔧 Configuration Files

### Next.js (`next.config.js`)
- Security headers configured
- Image optimization enabled
- MongoDB client-side fallbacks

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- Next.js plugin configured

### Tailwind CSS (`tailwind.config.ts`)
- shadcn/ui theme configured
- Dark mode support
- Custom color system

### ESLint (`.eslintrc.json`)
- No `any` types allowed
- Unused variables flagged
- TypeScript strict rules

---

## 🗄️ Database Setup

### Local MongoDB

```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connect
mongosh mongodb://localhost:27017/engify-ai
```

### MongoDB Atlas (Recommended)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Add to `.env.local`:

```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/engify-ai?retryWrites=true&w=majority"
```

---

## 🔐 Authentication Setup

### NextAuth.js Configuration

1. Generate secret:
```bash
openssl rand -base64 32
```

2. Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

3. OAuth providers (optional):
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## 🚨 Common Issues

### "Cannot find module 'next'"
**Solution**: Run `pnpm install`

### "MongoDB connection failed"
**Solution**: Check `MONGODB_URI` in `.env.local`

### "Port 3000 already in use"
**Solution**: Kill process or use different port:
```bash
lsof -ti:3000 | xargs kill
# or
PORT=3001 pnpm dev
```

### TypeScript errors
**Solution**: All errors will resolve after `pnpm install`

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[docs/](./docs/)** - Complete documentation
  - Strategy documents
  - Implementation guides
  - Code quality standards
  - Security guidelines

---

## 🎯 Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ✅ Set up environment variables
3. ✅ Start dev server: `pnpm dev`
4. 🔄 Build database connection
5. 🔄 Implement authentication
6. 🔄 Create prompt library
7. 🔄 Add user dashboard

---

## ✅ Verification

After setup, verify everything works:

```bash
# 1. Install dependencies
pnpm install

# 2. Check TypeScript
pnpm type-check

# 3. Check linting
pnpm lint

# 4. Run dev server
pnpm dev
```

Visit http://localhost:3000 - you should see the landing page!

---

**This is a production-ready Next.js application, NOT Vite!** 🎉

**Last Updated**: 2025-10-27  
**Status**: Ready for Development
