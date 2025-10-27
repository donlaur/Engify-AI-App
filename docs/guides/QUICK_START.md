# Engify.ai - Quick Start Guide

**Goal**: Get from zero to working MVP in 7 days.

---

## 📋 Pre-Flight Checklist

### Accounts to Create
- [ ] MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
- [ ] AWS Account (https://aws.amazon.com) - Optional for Week 1
- [ ] Vercel Account (https://vercel.com) - For initial deployment
- [ ] GitHub Account (for version control)

### Local Setup
```bash
# Install Node.js 18+ (if not already)
brew install node@18

# Install pnpm (faster than npm)
npm install -g pnpm

# Install AWS CLI (for later)
brew install awscli

# Install Git (if not already)
brew install git
```

---

## 🚀 Day 1: Project Setup (4-6 hours)

### Step 1: Create New Next.js Project
```bash
# Navigate to your dev folder
cd ~/dev

# Create new Next.js 14 app
npx create-next-app@latest engify-ai-next \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd engify-ai-next
```

### Step 2: Install Core Dependencies
```bash
# AI Providers
pnpm add @google/generative-ai openai @anthropic-ai/sdk

# Database
pnpm add mongodb

# Authentication
pnpm add next-auth @auth/mongodb-adapter bcryptjs
pnpm add -D @types/bcryptjs

# State Management
pnpm add zustand @tanstack/react-query

# Validation
pnpm add zod

# UI Components (shadcn/ui)
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Dev Dependencies
pnpm add -D @types/node prettier eslint-config-prettier
```

### Step 3: Set Up MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a new project: "Engify AI"
4. Create a free cluster (M0):
   - Cloud Provider: AWS
   - Region: us-east-1
   - Cluster Name: engify-dev
5. Create database user:
   - Username: `engify_user`
   - Password: [generate strong password]
   - Role: Read and write to any database
6. Network Access:
   - Add IP: `0.0.0.0/0` (allow from anywhere - for development)
7. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password

### Step 4: Environment Variables
```bash
# Create .env.local file
cat > .env.local << 'EOF'
# Database
MONGODB_URI=mongodb+srv://engify_user:YOUR_PASSWORD@engify-dev.xxxxx.mongodb.net/engify_ai?retryWrites=true&w=majority
DATABASE_NAME=engify_ai

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-with-openssl-rand-base64-32

# AI Providers (Optional - users will add their own)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Development
NODE_ENV=development
EOF

# Generate NextAuth secret
openssl rand -base64 32
# Copy the output and replace the NEXTAUTH_SECRET value
```

### Step 5: Create Project Structure
```bash
# Create directory structure
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/signup
mkdir -p src/app/\(dashboard\)/onboarding
mkdir -p src/app/\(dashboard\)/pathways
mkdir -p src/app/\(dashboard\)/learning-hub
mkdir -p src/app/\(dashboard\)/playbooks
mkdir -p src/app/\(dashboard\)/workbench
mkdir -p src/app/\(dashboard\)/settings
mkdir -p src/app/api/auth/\[...nextauth\]
mkdir -p src/app/api/ai
mkdir -p src/components/ui
mkdir -p src/components/features
mkdir -p src/components/shared
mkdir -p src/lib/ai/providers
mkdir -p src/lib/db
mkdir -p src/lib/auth
mkdir -p src/lib/utils
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/config
mkdir -p python/services
mkdir -p tests/unit
mkdir -p tests/e2e
mkdir -p docs
```

### Step 6: Test MongoDB Connection
```typescript
// src/lib/db/test-connection.ts
import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db(process.env.DATABASE_NAME);
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
```

```bash
# Run the test
pnpm tsx src/lib/db/test-connection.ts
```

---

## 📅 Daily Progress Tracker

### Day 1: ✅ Setup Complete
- [x] Next.js project created
- [x] Dependencies installed
- [x] MongoDB Atlas configured
- [x] Environment variables set
- [x] Project structure created
- [x] MongoDB connection tested

### Day 2: Authentication
- [ ] NextAuth.js configured
- [ ] Login page created
- [ ] Signup page created
- [ ] Protected routes set up
- [ ] User model created

### Day 3: AI Provider Abstraction
- [ ] AI provider interface defined
- [ ] Gemini provider implemented
- [ ] OpenAI provider implemented
- [ ] Anthropic provider implemented
- [ ] AI orchestrator created

### Day 4: API Routes
- [ ] Chat API route
- [ ] Streaming API route
- [ ] Prompt templates API
- [ ] User settings API
- [ ] Analytics API

### Day 5: Frontend Integration
- [ ] React Query setup
- [ ] Custom hooks created
- [ ] Workbench component
- [ ] Playbooks component
- [ ] Settings component

### Day 6: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Dark mode
- [ ] Responsive design
- [ ] Performance optimization

### Day 7: Testing & Deployment
- [ ] Unit tests
- [ ] E2E tests
- [ ] Documentation
- [ ] Vercel deployment
- [ ] Production testing

---

## 🎯 Key Commands

### Development
```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run tests
pnpm test

# Type check
pnpm type-check
```

### Database
```bash
# MongoDB shell (local)
mongosh "mongodb+srv://..."

# Export data
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json

# Import data
mongoimport --uri="mongodb+srv://..." --collection=users --file=users.json
```

### Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Timeout
**Solution**: Check network access in MongoDB Atlas. Make sure `0.0.0.0/0` is whitelisted.

### Issue: NextAuth Session Not Persisting
**Solution**: Make sure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your domain.

### Issue: AI Provider API Key Invalid
**Solution**: Double-check API key format. Gemini keys start with `AIza...`, OpenAI with `sk-...`.

### Issue: Build Fails with Type Errors
**Solution**: Run `pnpm type-check` to see all errors. Fix one at a time.

### Issue: Vercel Deployment Fails
**Solution**: Check environment variables are set in Vercel dashboard.

---

## 📚 Documentation Reference

1. **EXECUTIVE_SUMMARY.md** - Strategic overview and business case
2. **ARCHITECTURE_STRATEGY.md** - Technology decisions and architecture
3. **IMPLEMENTATION_PLAN.md** - Detailed day-by-day implementation guide
4. **AWS_DEPLOYMENT_GUIDE.md** - AWS deployment (Week 2+)
5. **QUICK_START.md** - This document (getting started)

---

## 🆘 Getting Help

### Resources
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **NextAuth.js Docs**: https://next-auth.js.org
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Community
- **Next.js Discord**: https://discord.gg/nextjs
- **MongoDB Community**: https://community.mongodb.com
- **Stack Overflow**: Tag questions with `next.js`, `mongodb`, `typescript`

---

## ✅ Success Criteria for Week 1

By the end of Week 1, you should have:
- ✅ Working authentication (login/signup)
- ✅ User can add API keys in settings
- ✅ User can execute prompts in workbench
- ✅ Conversation history is saved
- ✅ Multi-provider AI support (Gemini, OpenAI, Anthropic)
- ✅ Responsive UI that works on mobile
- ✅ Deployed to Vercel
- ✅ Basic documentation

---

## 🎉 You're Ready!

Start with Day 1 of the IMPLEMENTATION_PLAN.md and follow along. Each day builds on the previous day's work.

**Remember**: 
- Don't try to be perfect - focus on getting it working
- Test frequently (after each major change)
- Commit to Git regularly
- Ask for help when stuck

**Let's build something amazing! 🚀**

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-27  
**Status**: Ready to Use
