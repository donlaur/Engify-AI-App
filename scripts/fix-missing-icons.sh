#!/bin/bash

# Fix Missing Icons Script
# Finds missing icon references and adds them to icons.ts

echo "🔧 Finding and fixing missing icons..."

# Find all icon references in the codebase
ICON_REFS=$(grep -roh "Icons\.\w\+" src/ --include="*.tsx" --include="*.ts" | \
  sed 's/Icons\.//' | sort -u)

# Read existing icons from icons.ts
EXISTING_ICONS=$(grep "^  \w\+:" src/lib/icons.ts | sed 's/:.*//' | sed 's/  //' || echo "")

echo "Found icon references:"
echo "$ICON_REFS" | head -20
echo ""

echo "Checking which icons are missing..."
MISSING=()

while IFS= read -r icon; do
  if ! echo "$EXISTING_ICONS" | grep -q "^$icon$"; then
    MISSING+=("$icon")
  fi
done <<< "$ICON_REFS"

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✅ All icons are already defined!"
  exit 0
fi

echo "Missing icons to add:"
printf '%s\n' "${MISSING[@]}"
echo ""

# Map common icon names to Lucide React icons
declare -A ICON_MAP=(
  ["lightbulb"]="Lightbulb"
  ["compass"]="Compass"
  ["mail"]="Mail"
  ["briefcase"]="Briefcase"
  ["x"]="X"
  ["github"]="Github"
  ["server"]="Server"
  ["key"]="Key"
  ["tool"]="Wrench"
  ["testTube"]="TestTube"
  ["fileSearch"]="FileSearch"
  ["gitCompare"]="GitCompare"
  ["trending"]="TrendingUp"
  ["barChart"]="BarChart3"
  ["layers"]="Layers"
  ["graduationCap"]="GraduationCap"
  ["palette"]="Palette"
  ["building"]="Building"
)

echo "Suggested additions to src/lib/icons.ts:"
echo ""
echo "// Add these imports:"
for icon in "${MISSING[@]}"; do
  lucide_name="${ICON_MAP[$icon]:-${icon^}}"
  echo "import { $lucide_name } from 'lucide-react';"
done

echo ""
echo "// Add these to Icons object:"
for icon in "${MISSING[@]}"; do
  lucide_name="${ICON_MAP[$icon]:-${icon^}}"
  echo "  $icon: $lucide_name,"
done

echo ""
echo "To apply automatically, edit src/lib/icons.ts manually or use the suggestions above."
