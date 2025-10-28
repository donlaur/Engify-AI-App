# Workbench Features - Detailed Spec

**Date**: 2025-10-27
**Status**: Planning
**Goal**: Transform workbench from mock to fully functional

---

## 🎯 **Vision**

Transform Engify.ai workbench into a **Swiss Army knife for prompt engineering** with 5 powerful tools.

---

## 🛠️ **Tool 1: Knowledge Navigator (RAG)**

### What It Does
Upload documents and ask questions. Get AI-powered answers with source citations.

### User Flow
1. Click "Knowledge Navigator" tab
2. Upload document (PDF, TXT, MD)
3. System extracts text and creates embeddings
4. Ask questions about the document
5. Get answers with source citations
6. Save conversation history

### Technical Implementation
```typescript
// Frontend Component
<KnowledgeNavigator>
  <FileUpload onUpload={handleUpload} />
  <DocumentList documents={userDocs} />
  <ChatInterface 
    onQuery={handleQuery}
    history={chatHistory}
  />
</KnowledgeNavigator>

// API Routes
POST /api/workbench/upload
- Accepts file
- Extracts text
- Sends to Python for embedding
- Returns document ID

POST /api/workbench/query
- Document ID
- Question
- Calls Python RAG API
- Returns answer + sources
```

### Backend (Python)
```python
@app.post("/embed")
async def embed_document(text: str):
    # Use sentence-transformers
    embeddings = model.encode(text)
    # Store in vector DB
    return {"doc_id": id, "chunks": count}

@app.post("/query")
async def query_document(doc_id: str, question: str):
    # Retrieve relevant chunks
    # Generate answer with LLM
    # Return with citations
    return {"answer": text, "sources": []}
```

### UI Features
- Drag & drop upload
- Document preview
- Chat-style Q&A
- Source highlighting
- Export conversation
- Delete documents

---

## 🛠️ **Tool 2: Prompt Optimizer**

### What It Does
Takes rough prompts and optimizes them using best practices and patterns.

### User Flow
1. Click "Prompt Optimizer" tab
2. Paste rough prompt
3. Select target pattern (optional)
4. Click "Optimize"
5. See improved prompt
6. View diff showing changes
7. Copy optimized version

### Technical Implementation
```typescript
// Frontend
<PromptOptimizer>
  <PromptInput 
    value={originalPrompt}
    onChange={setOriginalPrompt}
  />
  <PatternSelector 
    patterns={availablePatterns}
    selected={targetPattern}
  />
  <OptimizeButton onClick={handleOptimize} />
  <DiffView 
    original={originalPrompt}
    optimized={optimizedPrompt}
    changes={improvements}
  />
</PromptOptimizer>

// API
POST /api/workbench/optimize
{
  prompt: string,
  pattern?: string,
  model: 'gpt-4' | 'claude-3'
}
```

### Optimization Rules
1. **Clarity**: Remove ambiguity
2. **Context**: Add relevant background
3. **Structure**: Apply pattern
4. **Examples**: Add few-shot if needed
5. **Output Format**: Specify format
6. **Constraints**: Add guardrails

### UI Features
- Side-by-side comparison
- Highlighted improvements
- Explanation of changes
- Pattern suggestions
- Save optimized prompts
- Version history

---

## 🛠️ **Tool 3: Multi-Model Comparison**

### What It Does
Run the same prompt across multiple AI models and compare responses.

### User Flow
1. Click "Model Comparison" tab
2. Enter prompt
3. Select models (GPT-4, Claude, Gemini)
4. Click "Run All"
5. See responses side-by-side
6. Compare quality, speed, cost
7. Pick best response

### Technical Implementation
```typescript
// Frontend
<ModelComparison>
  <PromptInput value={prompt} />
  <ModelSelector 
    models={['gpt-4', 'claude-3', 'gemini-pro']}
    selected={selectedModels}
  />
  <RunButton onClick={handleRunAll} />
  <ComparisonGrid>
    {responses.map(r => (
      <ModelResponse 
        model={r.model}
        response={r.text}
        time={r.duration}
        cost={r.cost}
        tokens={r.tokens}
      />
    ))}
  </ComparisonGrid>
</ModelComparison>

// API
POST /api/workbench/compare
{
  prompt: string,
  models: string[],
  temperature?: number
}
```

### Comparison Metrics
- **Response Quality**: User rating
- **Speed**: Time to first token
- **Cost**: $ per request
- **Tokens**: Input + output
- **Length**: Response length
- **Tone**: Formal/casual

### UI Features
- Grid or list view
- Sort by metric
- Filter models
- Save comparisons
- Export results
- Cost calculator

---

## 🛠️ **Tool 4: Prompt Tester**

### What It Does
Test prompts with multiple inputs and grade results automatically.

### User Flow
1. Click "Prompt Tester" tab
2. Enter prompt template
3. Define test cases
4. Set grading criteria
5. Click "Run Tests"
6. See results (A-F grades)
7. View statistics

### Technical Implementation
```typescript
// Frontend
<PromptTester>
  <PromptTemplate 
    value={template}
    variables={extractedVars}
  />
  <TestCases 
    cases={testCases}
    onAdd={addTestCase}
  />
  <GradingCriteria 
    criteria={gradingRules}
  />
  <RunButton onClick={handleRunTests} />
  <ResultsTable 
    results={testResults}
    stats={statistics}
  />
</PromptTester>

// API
POST /api/workbench/test
{
  template: string,
  testCases: Array<{input: any, expected?: string}>,
  criteria: GradingCriteria
}
```

### Grading System
- **A (90-100%)**: Perfect match
- **B (80-89%)**: Minor issues
- **C (70-79%)**: Acceptable
- **D (60-69%)**: Needs work
- **F (<60%)**: Failed

### UI Features
- Bulk test case import (CSV)
- Visual grade distribution
- Failed test highlighting
- Improvement suggestions
- Export test report
- Save test suites

---

## 🛠️ **Tool 5: Token Counter & Cost Estimator**

### What It Does
Calculate tokens and estimate costs across different models.

### User Flow
1. Click "Cost Estimator" tab
2. Enter prompt
3. See token count
4. View cost per model
5. Compare pricing
6. Optimize for budget

### Technical Implementation
```typescript
// Frontend
<CostEstimator>
  <PromptInput value={prompt} />
  <TokenCount count={tokenCount} />
  <ModelPricing>
    {models.map(m => (
      <PriceCard
        model={m.name}
        inputCost={m.inputPrice}
        outputCost={m.outputPrice}
        totalCost={calculateCost(m)}
      />
    ))}
  </ModelPricing>
  <OptimizationTips tips={costSavingTips} />
</CostEstimator>

// API
POST /api/workbench/estimate
{
  prompt: string,
  expectedOutputTokens?: number
}
```

### Pricing Data (Current)
```typescript
const MODEL_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
  'gpt-3.5': { input: 0.0015, output: 0.002 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'gemini-pro': { input: 0.00025, output: 0.0005 },
};
```

### UI Features
- Real-time token counting
- Cost comparison table
- Budget calculator
- Savings recommendations
- Historical cost tracking
- Export cost report

---

## 📊 **Implementation Priority**

### Phase 1: Foundation (5 commits)
1. Workbench layout improvements
2. Tab navigation
3. Shared components
4. Error handling
5. Loading states

### Phase 2: Token Counter (3 commits)
**Why first**: No backend needed, pure frontend
1. Token counting logic
2. Pricing data
3. UI implementation

### Phase 3: Prompt Optimizer (5 commits)
**Why second**: Single API call, high value
1. Backend API route
2. OpenAI integration
3. Diff view
4. UI polish
5. Testing

### Phase 4: Multi-Model Comparison (5 commits)
**Why third**: Builds on optimizer
1. Multi-provider backend
2. Parallel execution
3. Comparison UI
4. Metrics display
5. Testing

### Phase 5: Knowledge Navigator (7 commits)
**Why fourth**: Most complex, needs RAG
1. File upload
2. Python RAG integration
3. Chat interface
4. Document management
5. Source citations
6. UI polish
7. Testing

### Phase 6: Prompt Tester (5 commits)
**Why last**: Builds on everything
1. Test case management
2. Batch execution
3. Grading system
4. Results visualization
5. Testing

**Total**: 30 commits for full workbench

---

## 🎯 **MVP vs Full Feature**

### MVP (10 commits)
- Token Counter (3)
- Prompt Optimizer (5)
- Basic UI (2)

### Full Feature (30 commits)
- All 5 tools
- Polish
- Testing
- Documentation

---

## 💡 **Feature Flags**

Show "Coming Soon" for unimplemented tools:

```typescript
const WORKBENCH_FEATURES = {
  tokenCounter: true,      // ✅ Available
  promptOptimizer: false,  // 🔄 Coming soon
  modelComparison: false,  // 🔄 Coming soon
  knowledgeNav: false,     // 🔄 Coming soon
  promptTester: false,     // 🔄 Coming soon
};
```

---

**Decision**: Start with Token Counter (no backend needed)?
