#!/bin/bash
# Test Multi-Agent Workflow in Production

set -e

echo "🧪 Testing Multi-Agent Workflow in Production"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROD_URL="https://engify.ai"
API_ENDPOINT="${PROD_URL}/api/agents/scrum-meeting"

echo "1️⃣ Testing API endpoint..."
echo "   URL: ${API_ENDPOINT}"
echo ""

# Test payload
PAYLOAD='{
  "situation": "We need to integrate AI coding assistants into our SDLC. Our team uses React/TypeScript, we have 25 engineers, and we are concerned about code quality and developer experience.",
  "context": "We are evaluating GitHub Copilot vs Cursor, and we need to make a decision soon."
}'

echo "📤 Sending request..."
echo ""

RESPONSE=$(curl -X POST "${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -s)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "📥 Response Status: ${HTTP_STATUS}"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ API call successful!${NC}"
  echo ""
  echo "Response preview:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY" | head -20
  echo ""
  
  # Check for expected fields
  if echo "$BODY" | grep -q "session_id"; then
    echo -e "${GREEN}✅ session_id present${NC}"
  else
    echo -e "${YELLOW}⚠️  session_id missing${NC}"
  fi
  
  if echo "$BODY" | grep -q "summary"; then
    echo -e "${GREEN}✅ summary present${NC}"
  else
    echo -e "${YELLOW}⚠️  summary missing${NC}"
  fi
  
  if echo "$BODY" | grep -q "conversation"; then
    echo -e "${GREEN}✅ conversation present${NC}"
  else
    echo -e "${YELLOW}⚠️  conversation missing${NC}"
  fi
  
elif [ "$HTTP_STATUS" = "429" ]; then
  echo -e "${YELLOW}⚠️  Rate limit exceeded${NC}"
  echo "   This is expected if you've tested recently"
elif [ "$HTTP_STATUS" = "500" ]; then
  echo -e "${RED}❌ Server error${NC}"
  echo ""
  echo "Error details:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "Check:"
  echo "  1. AWS credentials set in Vercel?"
  echo "  2. Lambda function exists?"
  echo "  3. Lambda environment variables set?"
else
  echo -e "${RED}❌ Unexpected status: ${HTTP_STATUS}${NC}"
  echo ""
  echo "Response:"
  echo "$BODY"
fi

echo ""
echo "2️⃣ Testing frontend page..."
echo "   URL: ${PROD_URL}/workbench/multi-agent"
echo ""
echo "   📋 Manual check required:"
echo "   - Open URL in browser"
echo "   - Verify page loads"
echo "   - Fill form and submit"
echo "   - Verify results display"
echo ""

echo "✅ Test complete!"
