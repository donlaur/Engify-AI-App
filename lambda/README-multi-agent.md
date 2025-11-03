# Lambda Multi-Agent Requirements - Python Version Requirements

**Date:** November 3, 2025  
**Status:** Updated for LangGraph 1.0.x

---

## Python Version Requirements

**Lambda Deployment:** ✅ Python 3.11 (from Dockerfile)  
**Local Testing:** ⚠️ Requires Python 3.10+ (local Python 3.9 cannot test)

**Why:** LangGraph 1.0.x requires Python >=3.10

---

## Package Versions (November 3, 2025)

| Package             | Version | Status    |
| ------------------- | ------- | --------- |
| langgraph           | 1.0.2   | ✅ Latest |
| langchain           | 1.0.3   | ✅ Latest |
| langchain-core      | 1.0.3   | ✅ Latest |
| langchain-openai    | 1.0.2   | ✅ Latest |
| langchain-anthropic | 1.0.1   | ✅ Latest |
| pymongo             | 4.15.3  | ✅ Latest |
| pydantic            | 2.12.3  | ✅ Latest |
| openai              | 2.6.1   | ✅ Latest |

---

## Testing Strategy

**Local Testing:**

- ❌ Cannot test with Python 3.9 (too old)
- ✅ Test in Docker container (Python 3.11)
- ✅ Test in Lambda environment (Python 3.11)

**Docker Testing:**

```bash
# Build and test locally
docker build -f lambda/Dockerfile.multi-agent -t engify-multi-agent .
docker run --rm engify-multi-agent
```

**Lambda Testing:**

- Deploy to Lambda and test via API
- CloudWatch logs for debugging

---

## Code Compatibility

**Current Imports (verified compatible):**

- ✅ `from langgraph.graph import StateGraph, END`
- ✅ `from langchain_openai import ChatOpenAI`
- ✅ `from langchain_core.messages import SystemMessage, HumanMessage`

**No breaking changes expected** - these are standard imports that remain stable in 1.0.x

---

## Next Steps

1. ✅ Update requirements file
2. ⏳ Commit changes
3. ⏳ Build Docker image to test
4. ⏳ Deploy to Lambda and test
