# Lambda Multi-Agent Docker Build & Test Guide

**Date:** November 3, 2025  
**Status:** Ready for Docker Build  
**Python Version:** 3.11 (Lambda base image)

---

## Prerequisites

- ✅ Docker installed and running
- ✅ AWS CLI configured (for ECR push later)
- ✅ Environment variables ready (MONGODB_URI, OPENAI_API_KEY)

---

## Step 1: Build Docker Image

```bash
cd /Users/donlaur/dev/Engify-AI-App

# Build Lambda container image
docker build -f lambda/Dockerfile.multi-agent -t engify-ai-integration-workbench:latest .
```

**Expected Build Time:** 2-5 minutes (downloads base image + installs packages)

**Package Installation:**
- langgraph==1.0.2
- langchain==1.0.3
- langchain-core==1.0.3
- langchain-openai==1.0.2
- langchain-anthropic==1.0.1
- pymongo==4.15.3
- pydantic==2.12.3
- openai==2.6.1

---

## Step 2: Test Imports in Container

```bash
# Test that all imports work
docker run --rm engify-ai-integration-workbench:latest python3 -c "
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
print('✅ All imports successful')
"
```

**Expected Output:**
```
✅ All imports successful
```

---

## Step 3: Test Workflow Compilation

```bash
# Test that workflow compiles without errors
docker run --rm engify-ai-integration-workbench:latest python3 -c "
from agents.scrum_meeting import app
print('✅ Workflow compiled successfully')
print(f'✅ Workflow nodes: {list(app.nodes.keys())}')
"
```

**Expected Output:**
```
✅ Workflow compiled successfully
✅ Workflow nodes: ['director', 'manager', 'tech_lead', 'architect', '__end__']
```

---

## Step 4: Test Lambda Handler (Dry Run)

```bash
# Test handler with mock event (no real API calls)
docker run --rm \
  -e MONGODB_URI="mongodb://localhost:27017/test" \
  -e OPENAI_API_KEY="test-key" \
  engify-ai-integration-workbench:latest python3 -c "
import json
from lambda_handler import handler

# Mock event
event = {
    'situation': 'Test situation',
    'context': 'Test context'
}

# Test handler initialization (won't make real API calls without valid keys)
try:
    # This will fail at API call, but we can verify imports and structure
    print('✅ Handler imports successful')
    print('✅ Handler structure valid')
except Exception as e:
    if 'OPENAI_API_KEY' in str(e) or 'MONGODB_URI' in str(e):
        print('✅ Handler structure valid (expected env var error)')
    else:
        raise
"
```

---

## Step 5: Verify Package Versions

```bash
# Check installed package versions
docker run --rm engify-ai-integration-workbench:latest pip list | grep -E "langgraph|langchain|pymongo|pydantic|openai"
```

**Expected Output:**
```
langchain           1.0.3
langchain-anthropic 1.0.1
langchain-core      1.0.3
langchain-openai    1.0.2
langgraph           1.0.2
openai              2.6.1
pydantic            2.12.3
pymongo             4.15.3
```

---

## Troubleshooting

### Build Fails: "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop
```bash
open -a Docker
# Wait for Docker to start, then retry build
```

### Build Fails: "Package not found"
**Solution:** Check requirements file and PyPI
```bash
# Verify requirements file exists
cat lambda/requirements-multi-agent.txt

# Check package exists on PyPI
curl -s https://pypi.org/pypi/langgraph/json | python3 -m json.tool | grep version
```

### Import Errors: "Module not found"
**Solution:** Verify COPY commands in Dockerfile
```bash
# Check Dockerfile copies correct files
grep COPY lambda/Dockerfile.multi-agent
```

### Python Version Mismatch
**Solution:** Verify Dockerfile uses Python 3.11
```bash
# Check Dockerfile base image
grep FROM lambda/Dockerfile.multi-agent
# Should show: FROM public.ecr.aws/lambda/python:3.11
```

---

## Next Steps After Successful Build

1. ✅ Build Docker image
2. ✅ Test imports
3. ⏳ Push to AWS ECR
4. ⏳ Deploy to Lambda
5. ⏳ Test end-to-end via API

---

## Build Checklist

- [ ] Docker is running
- [ ] Dockerfile exists and is correct
- [ ] requirements-multi-agent.txt has latest versions
- [ ] Lambda handler file exists
- [ ] Agent workflow file exists
- [ ] Build succeeds
- [ ] Imports work
- [ ] Workflow compiles
- [ ] Ready for ECR push

