#!/bin/bash

echo "🧪 Testing v2 AI API Routes"
echo "================================"
echo ""

# Test 1: GET available providers
echo "📋 Test 1: GET /api/v2/ai/execute (list providers)"
curl -s http://localhost:3001/api/v2/ai/execute | jq '.'
echo ""
echo ""

# Test 2: POST with OpenAI
echo "🤖 Test 2: POST /api/v2/ai/execute (OpenAI)"
curl -s -X POST http://localhost:3001/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Say hello in one word",
    "provider": "openai",
    "maxTokens": 10
  }' | jq '.'
echo ""
echo ""

# Test 3: Invalid provider
echo "❌ Test 3: Invalid provider"
curl -s -X POST http://localhost:3001/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test",
    "provider": "invalid-provider"
  }' | jq '.'
echo ""
echo ""

# Test 4: Empty prompt (validation error)
echo "❌ Test 4: Empty prompt (should fail validation)"
curl -s -X POST http://localhost:3001/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "",
    "provider": "openai"
  }' | jq '.'
echo ""
echo ""

echo "✅ Tests complete!"
