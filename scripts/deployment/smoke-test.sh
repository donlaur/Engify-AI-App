#!/bin/bash

# Smoke test script for Engify.ai deployment
# Tests AWS credentials, network connectivity, and basic service availability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Running Engify.ai smoke tests${NC}"

# Test AWS credentials
echo -e "${YELLOW}🔑 Testing AWS credentials...${NC}"
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AWS credentials valid${NC}"
    aws sts get-caller-identity --query 'Account' --output text
else
    echo -e "${RED}❌ AWS credentials invalid or missing${NC}"
    exit 1
fi

# Test AWS region and services
echo -e "${YELLOW}☁️ Testing AWS services...${NC}"

# Test Secrets Manager access
if aws secretsmanager list-secrets --max-items 1 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AWS Secrets Manager accessible${NC}"
else
    echo -e "${YELLOW}⚠️ AWS Secrets Manager not accessible (may be expected for new accounts)${NC}"
fi

# Test Lambda service
if aws lambda list-functions --max-items 1 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AWS Lambda accessible${NC}"
else
    echo -e "${YELLOW}⚠️ AWS Lambda not accessible (may be expected for new accounts)${NC}"
fi

# Test network connectivity to external services
echo -e "${YELLOW}🌐 Testing network connectivity...${NC}"

# Test MongoDB Atlas connectivity (if URI provided)
if [ -n "$MONGODB_URI" ]; then
    # Extract host from MongoDB URI
    MONGODB_HOST=$(echo $MONGODB_URI | sed -n 's/.*@\([^/?]*\).*/\1/p')
    if [ -n "$MONGODB_HOST" ]; then
        if nc -z -w5 $MONGODB_HOST 27017 2>/dev/null; then
            echo -e "${GREEN}✅ MongoDB Atlas reachable${NC}"
        else
            echo -e "${YELLOW}⚠️ MongoDB Atlas not reachable (may be behind firewall)${NC}"
        fi
    fi
fi

# Test OpenAI API (if key provided)
if [ -n "$OPENAI_API_KEY" ]; then
    if curl -s --max-time 10 -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models | grep -q '"object":"list"'; then
        echo -e "${GREEN}✅ OpenAI API accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ OpenAI API not accessible (check API key)${NC}"
    fi
fi

# Test SendGrid API (if key provided)
if [ -n "$SENDGRID_API_KEY" ]; then
    if curl -s --max-time 10 -H "Authorization: Bearer $SENDGRID_API_KEY" \
        https://api.sendgrid.com/v3/user/account | grep -q '"type"'; then
        echo -e "${GREEN}✅ SendGrid API accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ SendGrid API not accessible (check API key)${NC}"
    fi
fi

# Test Twilio API (if credentials provided)
if [ -n "$TWILIO_ACCOUNT_SID" ] && [ -n "$TWILIO_AUTH_TOKEN" ]; then
    if curl -s --max-time 10 -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
        https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json | grep -q '"status"'; then
        echo -e "${GREEN}✅ Twilio API accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ Twilio API not accessible (check credentials)${NC}"
    fi
fi

# Test Redis connectivity (if URL provided)
if [ -n "$UPSTASH_REDIS_REST_URL" ]; then
    if curl -s --max-time 10 "$UPSTASH_REDIS_REST_URL/ping" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis (Upstash) accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ Redis (Upstash) not accessible${NC}"
    fi
fi

# Test local development environment
echo -e "${YELLOW}🏠 Testing local development environment...${NC}"

# Check if Node.js is available
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js available: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
fi

# Check if pnpm is available
if command -v pnpm > /dev/null 2>&1; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✅ pnpm available: v$PNPM_VERSION${NC}"
else
    echo -e "${RED}❌ pnpm not found${NC}"
fi

# Test Python for RAG service
if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python available: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️ Python3 not found (optional for RAG service)${NC}"
fi

echo -e "${GREEN}🎉 Smoke tests completed!${NC}"
echo -e "${YELLOW}📋 Summary:${NC}"
echo "- AWS credentials: ✅"
echo "- Network connectivity: Tested"
echo "- Local environment: Checked"
echo ""
echo -e "${BLUE}Ready for deployment! 🚀${NC}"
