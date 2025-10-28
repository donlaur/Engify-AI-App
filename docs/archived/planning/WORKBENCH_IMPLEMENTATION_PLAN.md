# Workbench Implementation Plan

**Date**: 2025-10-27
**Goal**: Implement all 5 workbench tools
**Strategy**: Easy to hard, frontend-first

---

## 🎯 **Priority Order (Easy → Hard)**

### ✅ **1. Token Counter** (COMPLETE)
**Complexity**: Easy
**Backend**: None
**Status**: ✅ Implemented
- Token estimation
- Cost calculation
- Model comparison
- Optimization tips

### 🔄 **2. Prompt Optimizer** (NEXT - Easy)
**Complexity**: Easy-Medium
**Backend**: Optional (can mock)
**Python Needed**: None (use OpenAI API directly)
**Implementation**:
```typescript
// Frontend only with mock
- Input: Original prompt
- Output: Optimized prompt with diff
- Mock: Apply pattern rules
- Real: Call OpenAI API
```

### 🔄 **3. Prompt Tester** (Medium)
**Complexity**: Medium
**Backend**: Optional (can mock)
**Python Needed**: None (use AI APIs directly)
**Implementation**:
```typescript
// Frontend with mock grading
- Input: Prompt template + test cases
- Output: Graded results (A-F)
- Mock: Simple string matching
- Real: Call AI APIs for grading
```

### 🔄 **4. Multi-Model Comparison** (Medium-Hard)
**Complexity**: Medium-Hard
**Backend**: Required (API keys)
**Python Needed**: None (use AI APIs directly)
**Implementation**:
```typescript
// Backend API routes
- Input: Prompt + selected models
- Output: Parallel responses
- Requires: API keys for each provider
```

### 🔄 **5. Knowledge Navigator (RAG)** (Hard)
**Complexity**: Hard
**Backend**: Required
**Python Needed**: YES (embeddings + vector search)
**Implementation**:
```python
# Python FastAPI required
- sentence-transformers for embeddings
- FAISS or ChromaDB for vector storage
- Document parsing (PyPDF2, etc.)
```

---

## 📋 **Implementation Strategy**

### Phase 1: Prompt Optimizer (Frontend Mock)
**Time**: 30 minutes
**Commits**: 3

1. Create PromptOptimizer component
2. Add pattern-based optimization rules
3. Show diff view with improvements

**No Backend Needed**: Use rule-based optimization

### Phase 2: Prompt Tester (Frontend Mock)
**Time**: 45 minutes
**Commits**: 4

1. Create PromptTester component
2. Add test case management
3. Implement mock grading
4. Show results table

**No Backend Needed**: Use simple matching/scoring

### Phase 3: Multi-Model Comparison (Backend)
**Time**: 1 hour
**Commits**: 5

1. Create API route `/api/workbench/compare`
2. Implement parallel AI calls
3. Create comparison UI
4. Handle errors gracefully

**Backend Needed**: API keys for OpenAI, Anthropic, Google

### Phase 4: Knowledge Navigator (Python)
**Time**: 2+ hours
**Commits**: 8+

1. Set up Python FastAPI
2. Implement document upload
3. Create embeddings
4. Vector search
5. RAG implementation
6. Frontend integration

**Python Required**: sentence-transformers, FAISS, PyPDF2

---

## 🎯 **Let's Start: Prompt Optimizer (Easy)**

### What It Does
Takes a rough prompt and improves it using:
1. Pattern application
2. Clarity improvements
3. Structure optimization
4. Example addition

### Mock Implementation (No Backend)
```typescript
function optimizePrompt(original: string): OptimizedResult {
  let optimized = original;
  const improvements: string[] = [];
  
  // Rule 1: Add role if missing
  if (!optimized.includes('You are')) {
    optimized = `You are an expert assistant.\n\n${optimized}`;
    improvements.push('Added role definition');
  }
  
  // Rule 2: Add structure
  if (!optimized.includes('###')) {
    optimized = `### Task\n${optimized}\n\n### Output Format\nProvide a clear, structured response.`;
    improvements.push('Added structure');
  }
  
  // Rule 3: Add constraints
  if (!optimized.includes('constraint') && !optimized.includes('limit')) {
    optimized += '\n\nConstraints:\n- Be concise\n- Use examples';
    improvements.push('Added constraints');
  }
  
  return { optimized, improvements, original };
}
```

### Real Implementation (With Backend)
```typescript
// Call OpenAI to optimize
POST /api/workbench/optimize
{
  prompt: "original prompt",
  pattern: "chain-of-thought" // optional
}

// Response
{
  optimized: "improved prompt",
  improvements: ["Added reasoning steps", "Improved clarity"],
  tokensAdded: 50,
  estimatedCost: 0.002
}
```

---

## 🚀 **Next Steps**

1. ✅ Implement Prompt Optimizer (mock version)
2. ✅ Implement Prompt Tester (mock version)
3. 🔄 Add backend API routes (when API keys available)
4. 🔄 Implement Knowledge Navigator (Python required)

---

**Decision**: Start with Prompt Optimizer (frontend mock, no backend needed)
