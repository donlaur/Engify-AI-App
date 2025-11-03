# Local Python Setup Options for Lambda Multi-Agent Development

**Date:** November 3, 2025  
**Status:** Recommendation Guide

---

## Current Situation

- **Local Python:** 3.9.6 (system Python from Xcode)
- **Lambda Python:** 3.11 (from Dockerfile)
- **LangGraph Requirement:** Python >=3.10

---

## Option 1: Install Python 3.11/3.12 Locally (Recommended for Development)

**Pros:**
- ✅ Can test Lambda code locally before Docker build
- ✅ Faster iteration (no Docker build needed)
- ✅ Can run quick syntax/import checks
- ✅ Better development experience

**Cons:**
- ⚠️ Requires Homebrew installation
- ⚠️ Need to manage multiple Python versions

**Installation:**
```bash
# Install Python 3.12 via Homebrew
brew install python@3.12

# Create alias or use directly
python3.12 --version

# Install packages for local testing
python3.12 -m pip install -r lambda/requirements-multi-agent.txt
```

**Usage:**
```bash
# Test imports
python3.12 -c "from langgraph.graph import StateGraph; print('✅ LangGraph imports work')"

# Run quick syntax checks
python3.12 -m py_compile lambda/agents/scrum_meeting.py
```

---

## Option 2: Docker-Only Testing (No Local Python Update Needed)

**Pros:**
- ✅ No local Python installation needed
- ✅ Matches Lambda environment exactly
- ✅ No version conflicts

**Cons:**
- ⚠️ Slower iteration (Docker build each time)
- ⚠️ Can't run quick local checks

**Usage:**
```bash
# Build Docker image
docker build -f lambda/Dockerfile.multi-agent -t engify-multi-agent .

# Test imports in container
docker run --rm engify-multi-agent python3 -c "from langgraph.graph import StateGraph; print('✅ Works')"

# Run handler test
docker run --rm -e MONGODB_URI="..." -e OPENAI_API_KEY="..." engify-multi-agent
```

---

## Option 3: Lambda-Only Testing (Deployment Workflow)

**Pros:**
- ✅ No local setup needed
- ✅ Tests actual Lambda environment

**Cons:**
- ⚠️ Slowest iteration (deploy → test → debug)
- ⚠️ Requires AWS access
- ⚠️ Harder to debug

**Usage:**
```bash
# Deploy to Lambda
aws lambda update-function-code --function-name engify-ai-integration-workbench ...

# Test via API
curl -X POST https://your-api/api/agents/scrum-meeting ...
```

---

## Recommendation

**For Development:** Option 1 (Install Python 3.12 locally)
- Quick local testing before Docker builds
- Faster development cycle
- Can catch import errors immediately

**For Deployment:** Option 2 (Docker testing)
- Always test in Docker before deploying
- Matches Lambda environment exactly

**Workflow:**
1. **Local Development:** Use Python 3.12 for quick checks
2. **Pre-Deployment Testing:** Build Docker image and test
3. **Production:** Deploy to Lambda

---

## Quick Install (If Choosing Option 1)

```bash
# Install Python 3.12
brew install python@3.12

# Verify installation
python3.12 --version

# Install Lambda requirements (optional - for local testing only)
python3.12 -m pip install --user -r lambda/requirements-multi-agent.txt

# Test imports
python3.12 -c "from langgraph.graph import StateGraph, END; from langchain_openai import ChatOpenAI; print('✅ All imports work')"
```

---

## Note

**Lambda deployment will work regardless** - Dockerfile uses Python 3.11, so deployment is independent of local Python version.

**Local Python update is only needed if you want to:**
- Test Lambda code locally before Docker build
- Run quick syntax/import checks
- Develop faster (without Docker build overhead)

