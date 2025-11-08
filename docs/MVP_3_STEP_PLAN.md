# 3-Step MVP Plan: Engify Visual Bug Reporter

**Date:** November 8, 2025 (Updated)  
**Goal:** Working proof-of-concept this weekend  
**Philosophy:** Lean, focused, proof-of-concept first

---

## Overview

**What We're Building:**
Chrome Extension → Engify Dashboard → MCP Server → IDE

**What We Already Have:**
- ✅ Next.js app with auth (engify.ai)
- ✅ MongoDB setup
- ✅ Dashboard UI foundation
- ✅ MCP server skeleton
- ✅ Extension code (needs testing)

**What We Need to Build:**
- Step 1: Extension (fix bugs, add auth, test)
- Step 2: Dashboard API + page (receive & display)
- Step 3: MCP integration (query & deliver to IDE)

**Critical Additions (From Completeness Check):**
- ✅ Auth token management
- ✅ Error handling strategy
- ✅ Screenshot storage decision (base64 in MongoDB for MVP)

---

## Step 1: Chrome Extension (Capture & Send)

### **Core Features (Must Have)**
1. **Element Selection**
   - Click Engify icon → "Start Selection"
   - Click any element on page
   - Highlight selected element
   - Show confirmation

2. **Intent Selection**
   - "What are you doing?"
   - Options: 🐛 Bug | 💡 Learn | 📊 Debug | 🎨 Design
   - Each captures different data

3. **Data Capture (Intent-Based)**
   - **Bug Report:**
     - Element (selector, text, styles)
     - Screenshot (base64)
     - Console errors (last 10)
     - Network failures (404s, 500s)
     - Browser/OS/screen size
     - Page URL, timestamp
   
   - **Learn Code:**
     - Element (selector, HTML, CSS)
     - Parent/child structure
     - Event listeners (if detectable)
   
   - **Debug:**
     - All console logs
     - All network requests
     - Performance metrics
     - LocalStorage/SessionStorage
   
   - **Design Feedback:**
     - Element styles
     - Screenshot
     - Color palette
     - Typography info

4. **Description Input**
   - Text area: "Describe the issue"
   - Required field

5. **Mode Selection**
   - 📋 Copy to Clipboard (Free)
   - 🌐 Send to Dashboard
   - 🚀 Send to IDE (Pro)

6. **Send to Dashboard**
   - POST to `/api/bugs/report`
   - Show success/error message
   - Clear form on success

### **Technical Stack**
- Manifest V3
- Content script: `content-enhanced.js`
- Background script: `background-v2.js`
- Popup: `popup-enhanced.html` + `popup-enhanced.js`

### **Critical Implementation Details (Added)**

**1. Auth Token Management**
```javascript
// Extension gets token from user
// Option A: User enters API key in extension settings
// Option B: OAuth flow (redirect to engify.ai/auth)
// MVP: Use Option A (simpler)

// Store in chrome.storage.sync
chrome.storage.sync.set({ apiKey: 'user_api_key' });

// Include in API calls
fetch('https://engify.ai/api/bugs/report', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});
```

**2. Error Handling Strategy**
```javascript
// Try to send, show error if fails
try {
  const response = await fetch(API_URL, { ... });
  if (!response.ok) throw new Error('Upload failed');
  showSuccess('Bug report sent!');
} catch (error) {
  // Fallback: Copy to clipboard
  showError('Could not send to dashboard. Copied to clipboard instead.');
  copyToClipboard(bugReport);
}
```

**3. Screenshot Storage**
```
Decision: Store base64 in MongoDB for MVP
- Pro: Simple, no extra infrastructure
- Pro: Works immediately
- Con: Large documents (limit to 16MB)
- Con: Slower queries
- Phase 2: Move to S3/Cloudinary
```

**4. Console Log Filtering**
```javascript
// Only capture errors and warnings
const logs = [];
['error', 'warn'].forEach(level => {
  const original = console[level];
  console[level] = function(...args) {
    logs.push({ level, message: args, timestamp: Date.now() });
    original.apply(console, args);
  };
});
```

### **API Endpoint**
```
POST https://engify.ai/api/bugs/report
Headers: Authorization: Bearer {token}
Body: {
  intent: "bug" | "learn" | "debug" | "design",
  description: string,
  element: { selector, text, styles, ... },
  screenshot: string (base64),
  logs: string[],
  networkErrors: object[],
  environment: { browser, os, screen },
  url: string,
  timestamp: string
}
```

### **Success Criteria**
- ✅ Can click element and capture data
- ✅ Can select intent and mode
- ✅ Can send to dashboard successfully
- ✅ Can copy formatted report to clipboard

---

## Step 2: Engify Dashboard (Receive & Display)

### **Core Features (Must Have)**

1. **New Dashboard Page: `/dashboard/bugs`**
   - Add to existing dashboard navigation
   - Use existing auth (already working)
   - Use existing MongoDB connection

2. **Bug Reports List View**
   ```
   ┌─────────────────────────────────────────────┐
   │ Bug Reports                    [+ New Report]│
   ├─────────────────────────────────────────────┤
   │ 🐛 Button not clickable                      │
   │ checkout.tsx • 2 min ago • John             │
   │ [View] [Add Notes] [Send to IDE]            │
   ├─────────────────────────────────────────────┤
   │ 💡 How does this dropdown work?             │
   │ navbar.tsx • 10 min ago • Sarah             │
   │ [View] [Add Notes]                          │
   ├─────────────────────────────────────────────┤
   │ 📊 Console errors on checkout               │
   │ api/payment • 1 hour ago • Mike             │
   │ [View] [Add Notes] [Send to IDE]            │
   └─────────────────────────────────────────────┘
   ```

3. **Bug Detail View (Modal or Page)**
   - Show all captured data
   - Display screenshot
   - Show element details
   - Show logs/errors
   - Show environment info

4. **Add Notes Feature**
   ```
   ┌─────────────────────────────────────────────┐
   │ Add Notes to Bug #123                       │
   ├─────────────────────────────────────────────┤
   │ Root Cause:                                 │
   │ [Text area]                                 │
   │                                             │
   │ Pattern Type:                               │
   │ [Dropdown: AI Slop, Test Data, etc.]       │
   │                                             │
   │ Prevention:                                 │
   │ [Text area]                                 │
   │                                             │
   │ Similar Bugs:                               │
   │ [Search and link to other bugs]            │
   │                                             │
   │ [Save Notes]                                │
   └─────────────────────────────────────────────┘
   ```

5. **Send to IDE Button**
   - Marks bug as "sent_to_ide"
   - Makes available via MCP
   - Shows confirmation

### **Database Schema (MongoDB)**
```javascript
// Collection: bug_reports
{
  _id: ObjectId,
  userId: ObjectId,          // From existing auth
  projectId: ObjectId,       // From existing projects
  intent: "bug" | "learn" | "debug" | "design",
  description: String,
  element: {
    selector: String,
    tagName: String,
    text: String,
    styles: Object,
    dimensions: Object
  },
  screenshot: String,        // base64 or S3 URL later
  logs: [String],
  networkErrors: [Object],
  environment: {
    browser: String,
    os: String,
    screenSize: String
  },
  url: String,
  timestamp: Date,
  
  // Human enhancement (Phase 2)
  notes: {
    rootCause: String,
    patternType: String,
    prevention: String,
    similarBugs: [ObjectId]
  },
  
  status: "open" | "sent_to_ide" | "fixed" | "pattern",
  createdAt: Date,
  updatedAt: Date
}
```

### **API Endpoints**
```
POST   /api/bugs/report       - Create new bug report
GET    /api/bugs              - List all bugs for user
GET    /api/bugs/:id          - Get single bug details
PATCH  /api/bugs/:id/notes    - Add/update notes
PATCH  /api/bugs/:id/status   - Update status
GET    /api/bugs/mcp          - Get bugs for MCP (filtered by status)
```

### **Success Criteria**
- ✅ Can receive bug reports from extension
- ✅ Can display list of bugs
- ✅ Can view bug details with screenshot
- ✅ Can add notes to bugs
- ✅ Can mark bugs for IDE

---

## Step 3: MCP Server (Query & Deliver to IDE)

### **Core Features (Must Have)**

1. **MCP Server Setup**
   - Node.js server (already exists)
   - Implements MCP protocol
   - Connects to MongoDB (same as dashboard)

2. **MCP Tools**
   ```typescript
   // Tool 1: Get all bugs
   async function getBugs(filters?: {
     status?: string,
     intent?: string,
     limit?: number
   }): Promise<Bug[]>
   
   // Tool 2: Get specific bug
   async function getBug(bugId: string): Promise<Bug>
   
   // Tool 3: Mark bug as fixed
   async function markFixed(bugId: string): Promise<void>
   ```

3. **Developer Workflow**
   ```
   Developer in VS Code:
   
   > @Engify get bugs
   
   AI Response:
   "You have 3 open bugs:
   1. Bug #123: Button not clickable (checkout.tsx)
   2. Bug #124: Console errors (api/payment)
   3. Bug #125: Dropdown not working (navbar.tsx)
   
   Which would you like to see?"
   
   > @Engify get bug 123
   
   AI Response:
   "Bug #123: Button not clickable
   
   Element: button.submit-btn in checkout.tsx
   Issue: onClick handler not firing
   
   Console Error:
   TypeError: Cannot read property 'submit' of null
   at checkout.tsx:47
   
   Environment: Chrome 120, macOS, 1920x1080
   
   Screenshot: [attached]
   
   Suggested fix: Check if form ref exists before calling submit()"
   ```

4. **Data Format for AI**
   ```typescript
   // Optimized for AI consumption
   interface BugContextForAI {
     id: string;
     summary: string;           // One-line description
     intent: string;
     element: {
       selector: string;
       file: string;            // Inferred from selector
       line: number;            // Estimated
     };
     error: string;             // Primary error message
     stackTrace?: string;
     environment: string;       // Condensed
     screenshot_url?: string;   // Reference, not inline
     notes?: {
       rootCause: string;
       prevention: string;
     };
   }
   ```

5. **MCP Configuration**
   ```json
   // ~/.config/Code/User/globalStorage/mcp-servers.json
   {
     "engify": {
       "command": "node",
       "args": ["/path/to/engify-mcp-server/index.js"],
       "env": {
         "MONGODB_URI": "mongodb://localhost:27017/engify",
         "API_URL": "https://engify.ai"
       }
     }
   }
   ```

### **Technical Stack**
- Node.js with MCP SDK
- MongoDB client (same connection as dashboard)
- Express for health check endpoint

### **Success Criteria**
- ✅ MCP server can query MongoDB
- ✅ Can list bugs via `@Engify get bugs`
- ✅ Can get bug details via `@Engify get bug {id}`
- ✅ AI receives structured, token-efficient data
- ✅ Developer can work without leaving IDE

---

## Lean Canvas Feature Set

### **Problem**
- Developers waste 20-30 min per bug on context switching
- Bug reports lack technical context
- No way to learn from past bugs

### **Solution**
- Click element → Capture context → Send to IDE
- Human-enhanced bug reports
- Pattern learning (Phase 2)

### **Unique Value Proposition**
"Visual bug reporting that delivers context directly to your IDE, so you never waste time hunting for files or asking 'which browser was this?'"

### **Unfair Advantage**
- Learning loop (bugs → patterns → prevention)
- MCP integration (no competitor has this)
- Human-in-the-loop training data

### **Customer Segments**
1. Solo developers (free tier)
2. Small teams (freemium dashboard)
3. Enterprise (pro with MCP)

### **Key Metrics**
- Time saved per bug (target: 80% reduction)
- Bugs reported per week
- MCP queries per developer
- Pattern detection rate (Phase 2)

### **Channels**
- Product Hunt launch
- Dev.to / Hacker News
- GitHub README
- Word of mouth

### **Cost Structure**
- Hosting: $20/month (Vercel + MongoDB Atlas)
- AI tokens: ~$10/month (low volume MVP)
- Domain: $12/year

### **Revenue Streams**
- Free: Clipboard mode
- Pro: $29/month (dashboard + MCP)
- Team: $99/month (shared patterns)
- Enterprise: Custom pricing

---

## Implementation Timeline (Updated)

### **Day 1 (Today - Friday Evening) - 4-5 hours**

**Priority 1: Get Extension Working (2 hours)**
- [ ] Fix storage errors in content script
- [ ] Test element selection on test-enhanced.html
- [ ] Test data capture (console logs, screenshot)
- [ ] Add console log filtering (errors/warnings only)
- [ ] Test clipboard copy mode

**Priority 2: Add Auth & Error Handling (1 hour)**
- [ ] Add API key input to popup settings
- [ ] Store API key in chrome.storage.sync
- [ ] Add error handling with clipboard fallback
- [ ] Test error scenarios

**Priority 3: Create Dashboard API (1-2 hours)**
- [ ] Create `/api/bugs/report` endpoint in Next.js
- [ ] Validate auth token
- [ ] Store bug report in MongoDB
- [ ] Return success/error response
- [ ] Test with Postman/curl

**Goal:** Extension can send, dashboard can receive

**End of Day Checkpoint:**
- ✅ Extension captures and sends data
- ✅ API receives and stores data
- ✅ Error handling works
- ✅ Auth token flow works

---

### **Day 2 (Saturday) - 6-8 hours**

**Priority 1: Dashboard List View (3 hours)**
- [ ] Create `/app/dashboard/bugs/page.tsx`
- [ ] Add to dashboard navigation
- [ ] Fetch bugs from MongoDB
- [ ] Display list with intent icons
- [ ] Add basic filtering (by intent, status)
- [ ] Style with existing components

**Priority 2: Dashboard Detail View (2 hours)**
- [ ] Create `/app/dashboard/bugs/[id]/page.tsx`
- [ ] Display all bug data
- [ ] Show screenshot (base64 → img tag)
- [ ] Show element details, logs, environment
- [ ] Add "Copy to Clipboard" button

**Priority 3: Add Notes Feature (2 hours)**
- [ ] Create `/api/bugs/[id]/notes` endpoint
- [ ] Add notes form to detail view
- [ ] Fields: root cause, pattern type, prevention
- [ ] Save notes to MongoDB
- [ ] Display notes in detail view

**Priority 4: Send to IDE Button (1 hour)**
- [ ] Add "Send to IDE" button
- [ ] Update status to "sent_to_ide"
- [ ] Show confirmation

**Goal:** Full dashboard workflow working

**End of Day Checkpoint:**
- ✅ Can view list of bugs
- ✅ Can see bug details with screenshot
- ✅ Can add notes to bugs
- ✅ Can mark for IDE

---

### **Day 3 (Sunday) - 6-8 hours**

**Priority 1: MCP Server Tools (3 hours)**
- [ ] Update `/mcp-server/index.js`
- [ ] Implement `getBugs()` tool
- [ ] Implement `getBug(id)` tool
- [ ] Implement `markFixed(id)` tool
- [ ] Connect to MongoDB (same connection)
- [ ] Test tools with MCP inspector

**Priority 2: MCP Configuration (1 hour)**
- [ ] Create MCP config for VS Code/Cursor
- [ ] Test connection to MCP server
- [ ] Verify tools are discoverable

**Priority 3: IDE Integration Test (2 hours)**
- [ ] Test `@Engify get bugs` in IDE
- [ ] Test `@Engify get bug {id}` in IDE
- [ ] Verify AI receives structured data
- [ ] Test marking bug as fixed

**Priority 4: Polish & Documentation (2 hours)**
- [ ] Add loading states to dashboard
- [ ] Add success/error toasts
- [ ] Write README for extension setup
- [ ] Write README for MCP setup
- [ ] Record demo video (3-5 min)

**Goal:** Full end-to-end flow working

**End of Day Checkpoint:**
- ✅ Extension → Dashboard → MCP → IDE works
- ✅ Can query bugs from IDE
- ✅ AI gets proper context
- ✅ Demo-ready

---

### **Day 4 (Monday - Optional Polish) - 2-4 hours**

**If Time Allows:**
- [ ] Test with 3-5 real bugs
- [ ] Fix any critical issues
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Improve dashboard UI
- [ ] Write setup documentation
- [ ] Create troubleshooting guide

**Goal:** Production-ready MVP

---

## What We're NOT Building (Yet)

### **Phase 2 Features (Later)**
- ❌ Pattern learning (manual for now)
- ❌ AI-powered dashboard suggestions
- ❌ Automatic grouping of similar bugs
- ❌ Proactive warnings in IDE
- ❌ Team collaboration features
- ❌ Advanced filtering/search
- ❌ Jira/Slack integration
- ❌ Video recording
- ❌ Performance monitoring
- ❌ Accessibility scanning

### **Why Not Now?**
- Need to validate core workflow first
- Can add incrementally after MVP works
- Don't want to over-engineer before usage

---

## Success Criteria for MVP

### **Must Work:**
1. ✅ Extension captures bug with screenshot
2. ✅ Dashboard receives and displays bug
3. ✅ MCP server can query bugs
4. ✅ Developer can see bug in IDE via AI
5. ✅ End-to-end flow takes <30 seconds

### **Must Prove:**
1. ✅ Concept is valuable (saves time)
2. ✅ Technical approach works (MCP integration)
3. ✅ People will use it (test with 5 users)

### **Can Be Rough:**
- UI doesn't need to be perfect
- Can have bugs (it's a bug reporter!)
- Documentation can be minimal
- Only needs to work on Chrome + VS Code/Cursor

---

## File Structure

```
/engify-extension/
  manifest.json
  popup-enhanced.html
  popup-enhanced.js
  content-enhanced.js
  background-v2.js

/app/
  dashboard/
    bugs/
      page.tsx              # New: Bug list page
      [id]/
        page.tsx            # New: Bug detail page
  api/
    bugs/
      report/
        route.ts            # New: Receive bug reports
      route.ts              # New: List bugs
      [id]/
        route.ts            # New: Get/update bug
        notes/
          route.ts          # New: Add notes
      mcp/
        route.ts            # New: MCP query endpoint

/mcp-server/
  index.js                  # Update: Add MCP tools
  tools/
    getBugs.js              # New: List bugs tool
    getBug.js               # New: Get bug tool
```

---

## Next Steps (Right Now)

1. **Test Current Extension**
   - Reload extension
   - Test on test-enhanced.html
   - Fix any errors

2. **Create Dashboard API**
   - `/api/bugs/report` endpoint
   - Test with Postman/curl

3. **Create Dashboard Page**
   - Basic list view
   - Test receiving data

**Let's start with Step 1: Test the extension.**

Ready to test?
