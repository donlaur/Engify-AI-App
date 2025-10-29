#!/bin/bash

# Test script for Engify RAG Lambda service
# Replace API_URL with your actual API Gateway URL after deployment

API_URL="https://YOUR_API_ID.execute-api.us-east-2.amazonaws.com/prod/rag/search"

echo "🧪 Testing Engify RAG Lambda service..."
echo ""

# Test 1: Health check
echo "1️⃣ Testing health check..."
curl -s "$API_URL" -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query": "health"}' | jq '.' || echo "❌ Health check failed"

echo ""
echo "2️⃣ Testing Chain of Thought query..."
curl -s "$API_URL" -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query": "chain of thought", "top_k": 3}' | jq '.' || echo "❌ Chain of Thought test failed"

echo ""
echo "3️⃣ Testing OKR query..."
curl -s "$API_URL" -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query": "okr workbench", "top_k": 3}' | jq '.' || echo "❌ OKR test failed"

echo ""
echo "4️⃣ Testing empty query (should fail)..."
curl -s "$API_URL" -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query": "", "top_k": 3}' | jq '.' || echo "❌ Empty query test failed"

echo ""
echo "✅ Testing complete!"
echo ""
echo "📋 Expected Results:"
echo "   - Health check: Should return success"
echo "   - Chain of Thought: Should return prompt-001"
echo "   - OKR: Should return workbench-001"
echo "   - Empty query: Should return error"
