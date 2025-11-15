#!/bin/bash
# Review production prompt library via API

echo "📊 Prompt Library Quality Review (Production Data)"
echo ""

# Fetch prompts
RESPONSE=$(curl -s "https://engify.ai/api/prompts?limit=200")

# Save to temp file for analysis
echo "$RESPONSE" > /tmp/prompts-review.json

# Basic stats
TOTAL=$(echo "$RESPONSE" | jq -r '.total // 0')
SOURCE=$(echo "$RESPONSE" | jq -r '.source // "unknown"')

echo "Data source: $SOURCE"
echo "Total prompts: $TOTAL"
echo ""

# Check for issues
echo "🔍 Analyzing prompt quality..."
echo ""

# Missing descriptions
MISSING_DESC=$(echo "$RESPONSE" | jq '[.prompts[] | select(.description == null or .description == "")] | length')
echo "Missing descriptions: $MISSING_DESC"

# Short descriptions (<50 chars)
SHORT_DESC=$(echo "$RESPONSE" | jq '[.prompts[] | select(.description != null and (.description | length) < 50)] | length')
echo "Short descriptions (<50 chars): $SHORT_DESC"

# Missing content
MISSING_CONTENT=$(echo "$RESPONSE" | jq '[.prompts[] | select(.content == null or .content == "")] | length')
echo "Missing content: $MISSING_CONTENT"

# Short content (<100 chars)
SHORT_CONTENT=$(echo "$RESPONSE" | jq '[.prompts[] | select(.content != null and (.content | length) < 100)] | length')
echo "Short content (<100 chars): $SHORT_CONTENT"

# Missing category
MISSING_CAT=$(echo "$RESPONSE" | jq '[.prompts[] | select(.category == null or .category == "")] | length')
echo "Missing category: $MISSING_CAT"

# Missing role
MISSING_ROLE=$(echo "$RESPONSE" | jq '[.prompts[] | select(.role == null or .role == "")] | length')
echo "Missing role: $MISSING_ROLE"

echo ""
echo "📊 Category breakdown:"
echo "$RESPONSE" | jq -r '.prompts | group_by(.category) | map({category: .[0].category, count: length}) | sort_by(.count) | reverse | .[] | "  \(.category // "Uncategorized"): \(.count)"'

echo ""
echo "👥 Role breakdown:"
echo "$RESPONSE" | jq -r '.prompts | group_by(.role) | map({role: .[0].role, count: length}) | sort_by(.count) | reverse | .[] | "  \(.role // "Uncategorized"): \(.count)"'

# Quality score
ISSUES=$((MISSING_DESC + SHORT_DESC + MISSING_CONTENT + SHORT_CONTENT + MISSING_CAT + MISSING_ROLE))
QUALITY=$((100 - (ISSUES * 100 / (TOTAL * 6))))
echo ""
echo "📈 Quality score: ${QUALITY}%"
echo ""

