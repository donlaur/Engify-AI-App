#!/bin/bash
#
# Test Environment Setup Script
# Helps configure MongoDB credentials and API keys securely
#
# Usage:
#   ./scripts/content/setup-test-environment.sh

set -e

echo "🔧 Test Environment Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "✅ .env.local exists"
  
  # Validate MongoDB URI
  if grep -q "^MONGODB_URI=" .env.local; then
    echo "✅ MONGODB_URI is configured"
    
    # Check if it's still the placeholder
    if grep -q "mongodb+srv://username:password" .env.local; then
      echo "⚠️  MONGODB_URI contains placeholder values"
      echo ""
      echo "Please update .env.local with your actual MongoDB credentials:"
      echo "  1. Get credentials from MongoDB Atlas or your MongoDB provider"
      echo "  2. Replace the placeholder URI in .env.local"
      echo "  3. Format: mongodb+srv://user:pass@cluster.mongodb.net/dbname"
      echo ""
      exit 1
    fi
  else
    echo "❌ MONGODB_URI not found in .env.local"
    echo ""
    echo "Add your MongoDB connection string:"
    echo '  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/engify'
    echo ""
    exit 1
  fi
  
  # Check API keys
  echo ""
  echo "🔑 API Keys (optional for testing):"
  
  if grep -q "^OPENAI_API_KEY=" .env.local && ! grep -q "OPENAI_API_KEY=sk-your" .env.local; then
    echo "  ✅ OpenAI API key configured"
  else
    echo "  ⚠️  OpenAI API key not configured (optional)"
  fi
  
  if grep -q "^GOOGLE_API_KEY=" .env.local && ! grep -q "GOOGLE_API_KEY=your-google" .env.local; then
    echo "  ✅ Google AI API key configured"
  else
    echo "  ⚠️  Google AI API key not configured (optional)"
  fi
  
else
  echo "❌ .env.local not found"
  echo ""
  echo "Creating .env.local from template..."
  cp .env.example .env.local
  echo "✅ .env.local created"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env.local and add your credentials:"
  echo "  1. MONGODB_URI - Required for database operations"
  echo "  2. OPENAI_API_KEY - Optional, for GPT model testing"
  echo "  3. GOOGLE_API_KEY - Optional, for Gemini model testing"
  echo ""
  echo "After configuring, run this script again to validate."
  exit 1
fi

echo ""
echo "=========================="
echo "✅ Environment configured!"
echo ""
echo "Next steps:"
echo "  1. Validate environment:"
echo "     pnpm exec tsx scripts/content/validate-environment.ts"
echo ""
echo "  2. Run dry-run test (3 prompts):"
echo "     pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run"
echo ""
echo "  3. Run full test:"
echo "     pnpm exec tsx scripts/content/test-prompts-multi-model.ts --all"
echo ""

