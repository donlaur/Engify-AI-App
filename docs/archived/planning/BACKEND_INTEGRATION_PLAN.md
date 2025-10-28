# Backend Integration Plan

**Date**: 2025-10-27 2:22 PM
**Current**: 207/250 (83%)
**Status**: Planning backend activation

---

## 🎯 **Current State**

### ✅ What We Have (Static)
- **Frontend**: Fully functional Next.js app
- **Content**: 67 prompts, 15 patterns, 2 pathways (TypeScript files)
- **UI**: All pages working, responsive, polished
- **Features**: Browse, search, filter, favorites (localStorage)

### ❌ What's NOT Working
- **MongoDB**: Not connected (schemas exist, no data)
- **Python Services**: Not running (code exists, not deployed)
- **AI Execution**: Mock only (no real API calls)
- **User Accounts**: No persistence (localStorage only)
- **Workbench Tools**: UI only, no backend

---

## 🔄 **Integration Strategy**

### Phase 1: Local Development (Next 10 commits)
**Goal**: Get MongoDB + Python working locally

#### MongoDB Setup
1. Install MongoDB locally (or use MongoDB Atlas free tier)
2. Create `.env.local` with connection string
3. Test connection with health check
4. Seed database with prompts
5. Switch from static files to database queries

#### Python Services
1. Set up Python virtual environment
2. Install dependencies (`requirements.txt`)
3. Run FastAPI server locally (port 8000)
4. Test embeddings endpoint
5. Test RAG endpoint

#### Integration Points
1. Connect Next.js to MongoDB
2. Connect Next.js to Python API
3. Test end-to-end flow
4. Error handling
5. Documentation

---

## 🛠️ **Workbench Tools Plan**

### Current Workbench (Mock)
- ✅ UI layout
- ✅ Prompt input
- ✅ Provider selection (mock)
- ✅ Execute button (mock)
- ❌ Real AI execution
- ❌ Real tools

### Workbench Tools to Add

#### 1. **Knowledge Navigator** (RAG)
**What**: Ask questions about uploaded documents
**Backend**: Python RAG API
**Features**:
- Upload text/PDF
- Embed content
- Ask questions
- Get answers with sources

**Implementation**:
```typescript
// Frontend: Upload document
POST /api/workbench/upload
- File upload
- Extract text
- Send to Python for embedding

// Frontend: Ask question
POST /api/workbench/query
- Question text
- Document ID
- Get RAG response
```

#### 2. **Prompt Optimizer**
**What**: Improve user prompts automatically
**Backend**: OpenAI/Anthropic API
**Features**:
- Input: User's rough prompt
- Output: Optimized prompt
- Show improvements
- Explain changes

**Implementation**:
```typescript
POST /api/workbench/optimize
- Original prompt
- Target pattern
- Get optimized version
- Show diff
```

#### 3. **Multi-Model Comparison**
**What**: Run same prompt on multiple AI models
**Backend**: Multi-provider Python API
**Features**:
- Select models (GPT-4, Claude, Gemini)
- Run in parallel
- Compare responses
- Show costs

**Implementation**:
```typescript
POST /api/workbench/compare
- Prompt text
- Model list
- Get all responses
- Show side-by-side
```

#### 4. **Prompt Tester**
**What**: Test prompts with multiple inputs
**Backend**: Batch execution + grading
**Features**:
- Define test cases
- Run batch
- Grade results (A-F)
- Show statistics

**Implementation**:
```typescript
POST /api/workbench/test
- Prompt template
- Test cases array
- Run all tests
- Return grades
```

#### 5. **Token Counter & Cost Estimator**
**What**: Calculate tokens and costs
**Backend**: tiktoken + pricing data
**Features**:
- Count tokens
- Estimate cost per model
- Compare pricing
- Optimize for cost

**Implementation**:
```typescript
POST /api/workbench/estimate
- Prompt text
- Model list
- Return token counts
- Return cost estimates
```

---

## 📊 **Implementation Phases**

### Phase 1: Local Backend (10 commits)
**Goal**: Get MongoDB + Python working locally

1. MongoDB local setup
2. Connection testing
3. Seed database
4. Python environment setup
5. FastAPI server running
6. Test embeddings API
7. Test RAG API
8. Connect Next.js to MongoDB
9. Connect Next.js to Python
10. End-to-end testing

**Time**: 2-3 hours
**Complexity**: Medium

### Phase 2: Workbench Tools (15 commits)
**Goal**: Add real AI execution to workbench

1. Knowledge Navigator UI
2. Knowledge Navigator backend
3. Upload document flow
4. RAG query flow
5. Prompt Optimizer UI
6. Prompt Optimizer backend
7. Multi-Model Comparison UI
8. Multi-Model Comparison backend
9. Prompt Tester UI
10. Prompt Tester backend
11. Token Counter UI
12. Cost Estimator
13. Error handling
14. Loading states
15. Documentation

**Time**: 4-5 hours
**Complexity**: High

### Phase 3: User Accounts (10 commits)
**Goal**: Persist user data

1. Enable NextAuth
2. Login/signup UI
3. Session management
4. Save favorites to DB
5. Save ratings to DB
6. User dashboard (real data)
7. Usage tracking
8. Rate limiting
9. Billing integration (future)
10. Testing

**Time**: 2-3 hours
**Complexity**: Medium

---

## 🎯 **Decision Points**

### Option 1: Backend Now (25 commits)
**Pros**:
- Full-featured app
- Real AI execution
- Portfolio-worthy backend
- MongoDB + Python experience

**Cons**:
- Takes time (6-8 hours)
- Complexity increases
- Need API keys
- Local setup required

### Option 2: Backend Later (Post-250)
**Pros**:
- Hit 250 commits faster
- Focus on polish
- Static site works great
- Can add backend anytime

**Cons**:
- No real AI execution
- No user persistence
- Limited workbench
- Less impressive demo

### Option 3: Hybrid (10 commits now, rest later)
**Pros**:
- Get MongoDB working
- Show backend capability
- Keep momentum
- Finish strong

**Cons**:
- Partial implementation
- May feel incomplete

---

## 🚀 **Recommendation**

### **Option 3: Hybrid Approach**

**Now (10 commits to 217/250)**:
1. MongoDB local setup
2. Connection working
3. Seed database
4. Basic queries working
5. Show it's connected
6. Documentation

**After 250 (Phase 10)**:
7. Python services
8. Workbench tools
9. User accounts
10. Full integration

**Why**:
- Shows backend capability
- Keeps momentum to 250
- Proves technical depth
- Can demo "coming soon" features

---

## 📋 **Quick Start Guide**

### MongoDB Setup (Local)
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Create database
mongosh
> use engify
> db.prompts.insertOne({test: true})
```

### MongoDB Atlas (Cloud - Free)
```bash
# 1. Go to mongodb.com/cloud/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Add to .env.local
MONGODB_URI=mongodb+srv://...
```

### Python Setup
```bash
# Create virtual environment
cd python
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI
uvicorn main:app --reload --port 8000

# Test
curl http://localhost:8000/health
```

---

## 🎯 **Next Steps**

### Immediate (If we do backend now)
1. Choose MongoDB (local vs Atlas)
2. Set up connection
3. Test health check
4. Seed prompts
5. Update queries

### Alternative (Sprint to 250 first)
1. Continue mobile/PWA
2. Add more features
3. Polish existing
4. Hit 250 commits
5. Backend in Phase 10

---

## 💡 **Feature Flags**

We can use feature flags to show "coming soon":

```typescript
// In workbench
{isFeatureEnabled('ai-execution') ? (
  <RealAIExecution />
) : (
  <ComingSoonBanner>
    Real AI execution coming soon!
    MongoDB + Python integration in progress.
  </ComingSoonBanner>
)}
```

---

**Decision Needed**: 
- Backend now (25 commits)?
- Backend later (post-250)?
- Hybrid (10 commits now)?

**Current**: 207/250 (83%), 43 commits to go
