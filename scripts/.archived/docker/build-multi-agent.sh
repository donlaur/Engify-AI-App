#!/bin/bash
# Docker Build Script for Lambda Multi-Agent Workflow
# Usage: ./scripts/docker/build-multi-agent.sh

set -e

echo "🔨 Building Lambda Multi-Agent Docker Image..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "   Run: open -a Docker"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build image (for Lambda x86_64 architecture)
echo "📦 Building Docker image..."
echo "   Platform: linux/amd64 (required for AWS Lambda)"
docker build --platform linux/amd64 -f lambda/Dockerfile.multi-agent -t engify-ai-integration-workbench:latest .

echo ""
echo "✅ Build complete!"
echo ""

# Test imports
echo "🧪 Testing imports..."
docker run --rm --entrypoint python3 engify-ai-integration-workbench:latest -c "
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
print('✅ All imports successful')
"

echo ""
echo "🧪 Testing workflow compilation..."
docker run --rm --entrypoint python3 engify-ai-integration-workbench:latest -c "
from agents.scrum_meeting import app
print('✅ Workflow compiled successfully')
print(f'✅ Workflow nodes: {list(app.nodes.keys())}')
"

echo ""
echo "📋 Checking package versions..."
docker run --rm --entrypoint pip engify-ai-integration-workbench:latest list | grep -E "langgraph|langchain|pymongo|pydantic|openai" || true

echo ""
echo "✅ All tests passed!"
echo ""
echo "📦 Image ready: engify-ai-integration-workbench:latest"
echo ""
echo "Next steps:"
echo "  1. Tag for ECR: docker tag engify-ai-integration-workbench:latest <ACCOUNT>.dkr.ecr.us-east-2.amazonaws.com/engify-ai-integration-workbench:latest"
echo "  2. Push to ECR: docker push --platform linux/amd64 <ACCOUNT>.dkr.ecr.us-east-2.amazonaws.com/engify-ai-integration-workbench:latest"
echo "  3. Deploy to Lambda using scripts/aws/deploy-multi-agent-lambda.sh"

