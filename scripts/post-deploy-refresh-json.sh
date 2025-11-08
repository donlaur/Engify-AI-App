#!/bin/bash
# Post-deploy script to refresh JSON cache
# This runs after every successful deployment

echo "🔄 Refreshing JSON cache after deployment..."

# Generate prompts JSON
echo "📝 Generating prompts JSON..."
pnpm run content:generate-prompts

# Generate patterns JSON  
echo "🎯 Generating patterns JSON..."
pnpm run content:generate-patterns

echo "✅ JSON cache refreshed successfully"
