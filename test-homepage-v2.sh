#!/bin/bash
# Quick script to test homepage V2 locally
# Usage: ./test-homepage-v2.sh [enable|disable]

if [ "$1" == "enable" ]; then
  echo "🔄 Enabling homepage V2..."
  mv src/app/page.tsx src/app/page-old.tsx
  mv src/app/page-v2.tsx src/app/page.tsx
  echo "✅ Homepage V2 enabled! Visit http://localhost:3000"
  echo "📝 Original homepage saved as page-old.tsx"
elif [ "$1" == "disable" ]; then
  echo "�� Disabling homepage V2 (restoring original)..."
  mv src/app/page.tsx src/app/page-v2.tsx
  mv src/app/page-old.tsx src/app/page.tsx
  echo "✅ Original homepage restored!"
else
  echo "Usage: ./test-homepage-v2.sh [enable|disable]"
  echo ""
  echo "To test V2: ./test-homepage-v2.sh enable"
  echo "To restore: ./test-homepage-v2.sh disable"
fi
