# API Testing Framework

**Date**: 2025-10-27
**Status**: ✅ Complete
**Coverage**: API endpoints, pages, E2E workflows, regression

---

## 🎯 **Overview**

Comprehensive testing framework for Engify.ai API and pages using curl-based tests.

---

## 📦 **Test Suites**

### 1. **Smoke Tests** (`smoke-tests.sh`)
Quick tests to verify all API endpoints are responding.

**Coverage**:
- Health check
- Prompts API (GET, filter, search, pagination)
- Stats API
- Test connection API
- Chat API
- Auth API

**Run**: `npm run test:smoke`

### 2. **Page Tests** (`page-tests.sh`)
Tests all pages are accessible and rendering.

**Coverage**:
- Public pages (/, /about, /library, /patterns, /learn, /workbench, /pricing, /contact, /privacy, /terms)
- Dynamic pages (/library/[id], /patterns/[id])
- Error pages (404)

**Run**: `npm run test:pages`

### 3. **E2E Tests** (`e2e-tests.sh`)
End-to-end workflow tests.

**Coverage**:
- Full prompt workflow (get, filter, search)
- Stats and analytics
- Chat workflow
- Error handling
- Performance checks

**Run**: `npm run test:e2e`

### 4. **Regression Tests** (`regression-tests.sh`)
Tests for backward compatibility.

**Coverage**:
- Response format consistency
- Backward compatibility
- Error message format
- Required fields
- Data type consistency

**Run**: `npm run test:regression`

---

## 🚀 **Quick Start**

### Run All Tests
```bash
npm run test:api
```

### Run Individual Suites
```bash
npm run test:smoke       # Smoke tests
npm run test:pages       # Page tests
npm run test:e2e         # E2E tests
npm run test:regression  # Regression tests
```

### Custom Base URL
```bash
BASE_URL=https://engify.ai npm run test:api
```

---

## 📊 **Test Output**

### Success
```
🧪 Running API Smoke Tests
Base URL: http://localhost:3005
==================================

Health Checks
Testing: Health check endpoint... ✓ PASS (HTTP 200)

Prompts API
Testing: Get all prompts... ✓ PASS (HTTP 200)
Testing: Get prompts by category... ✓ PASS (HTTP 200)

==================================
📊 Test Summary
==================================
Total Tests: 15
Passed: 15
Failed: 0

✅ All tests passed!
```

### Failure
```
Testing: Get prompts... ✗ FAIL (Expected: 200, Got: 500)
  Response: {"error":"Internal server error"}

❌ Some tests failed
```

---

## 🔧 **API Versioning**

### Version System
- **v1**: Current stable version
- **v2**: Next version (in development)

### Version Detection
```typescript
import { getApiVersion, isVersionSupported } from '@/lib/api/version';

const version = getApiVersion('/api/v1/prompts'); // 'v1'
const supported = isVersionSupported('v1'); // true
```

### Deprecation Headers
```typescript
import { getDeprecationHeaders } from '@/lib/api/version';

const headers = getDeprecationHeaders('v1');
// {
//   'X-API-Deprecated': 'true',
//   'X-API-Deprecation-Date': '2025-12-31',
//   'X-API-Sunset-Date': '2026-06-30',
//   'X-API-Current-Version': 'v2'
// }
```

---

## 📝 **Writing New Tests**

### Add to Smoke Tests
```bash
# In tests/api/smoke-tests.sh
test_endpoint "GET" "/api/new-endpoint" "200" "Test new endpoint"
```

### Add to E2E Tests
```bash
# In tests/api/e2e-tests.sh
echo "Test X: New Workflow"
response=$(curl -s "$BASE_URL/api/endpoint")
if echo "$response" | grep -q "expected"; then
  echo -e "${GREEN}✓${NC} Test passed"
  PASSED=$((PASSED + 1))
fi
```

### Add to Regression Tests
```bash
# In tests/api/regression-tests.sh
echo "Test: Response structure"
if echo "$response" | jq -e '.field' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Structure unchanged"
  PASSED=$((PASSED + 1))
fi
```

---

## 🎯 **CI/CD Integration**

### GitHub Actions
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Start server
        run: npm run dev &
      - name: Wait for server
        run: sleep 10
      - name: Run tests
        run: npm run test:api
```

### Pre-commit Hook
```bash
#!/bin/bash
npm run test:smoke || exit 1
```

---

## 📈 **Test Coverage**

### Current Coverage
- **API Endpoints**: 15/15 (100%)
- **Pages**: 12/12 (100%)
- **Workflows**: 5/5 (100%)
- **Regression**: 8/8 (100%)

### Total Tests
- Smoke: 15 tests
- Pages: 12 tests
- E2E: 10 tests
- Regression: 8 tests
- **Total**: 45 tests

---

## 🔍 **Debugging Failed Tests**

### Verbose Output
```bash
# Add -v flag to curl
curl -v "$BASE_URL/api/endpoint"
```

### Check Server Logs
```bash
# Terminal with dev server
npm run dev

# Watch for errors when tests run
```

### Test Individual Endpoint
```bash
curl -X GET "http://localhost:3005/api/prompts" \
  -H "Content-Type: application/json" | jq
```

---

## 🚨 **Common Issues**

### Server Not Running
```
✗ Server is not running on http://localhost:3005
Please start the server with: npm run dev
```
**Fix**: Start dev server in another terminal

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3005
```
**Fix**: Kill process on port 3005
```bash
lsof -ti:3005 | xargs kill -9
```

### jq Not Installed
```
bash: jq: command not found
```
**Fix**: Install jq
```bash
brew install jq  # macOS
```

---

## 📚 **Best Practices**

1. **Run tests before commits**
   ```bash
   npm run test:smoke
   ```

2. **Test new features immediately**
   - Add smoke test for new endpoint
   - Add E2E test for new workflow
   - Add regression test for response format

3. **Keep tests fast**
   - Smoke tests: < 10 seconds
   - E2E tests: < 30 seconds
   - All tests: < 1 minute

4. **Use descriptive test names**
   ```bash
   test_endpoint "GET" "/api/prompts" "200" "Get all prompts with pagination"
   ```

5. **Test error cases**
   ```bash
   test_endpoint "POST" "/api/chat" "400" "Chat without message (should fail)"
   ```

---

## 🎯 **Roadmap**

### Phase 1 (Complete)
- [x] Smoke tests
- [x] Page tests
- [x] E2E tests
- [x] Regression tests
- [x] API versioning

### Phase 2 (Future)
- [ ] Performance tests
- [ ] Load tests
- [ ] Security tests
- [ ] Integration with Playwright
- [ ] Visual regression tests

---

**Status**: ✅ Complete and ready for use!
