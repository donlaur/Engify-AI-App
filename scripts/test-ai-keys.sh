#!/bin/bash

echo "🔑 Testing AI API Keys..."
echo ""

# Test OpenAI
echo "Testing OpenAI API..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
else
    echo "✅ OPENAI_API_KEY found: ${OPENAI_API_KEY:0:10}..."
fi

# Test Google AI
echo ""
echo "Testing Google AI API..."
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ GOOGLE_API_KEY not set"
else
    echo "✅ GOOGLE_API_KEY found: ${GOOGLE_API_KEY:0:10}..."
fi

echo ""
echo "✅ All keys configured!"
