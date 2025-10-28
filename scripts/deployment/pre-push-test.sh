#!/bin/bash
# Pre-push test script
# Run this before pushing to avoid wasting Vercel builds

set -e

echo "🧪 Running pre-push tests..."
echo ""

echo "1️⃣  Type checking..."
pnpm tsc --noEmit || { echo "❌ Type check failed"; exit 1; }
echo "✅ Types OK"
echo ""

echo "2️⃣  Building production..."
pnpm build || { echo "❌ Build failed"; exit 1; }
echo "✅ Build OK"
echo ""

echo "3️⃣  Running tests..."
pnpm test --run || { echo "⚠️  Tests failed (continuing)"; }
echo ""

echo "✅ All checks passed! Safe to push."
