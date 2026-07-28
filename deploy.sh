#!/usr/bin/env bash
# ==============================================================================
# Deploy Script for FileShare on Render.com
# ==============================================================================

set -e

echo "🚀 [Deploy] Starting FileShare deployment sequence on Render..."

# 1. Ensure required persistent data & uploads storage directories exist
echo "📁 [Deploy] Creating persistent storage directories..."
mkdir -p data uploads

# 2. Install dependencies cleanly
echo "📦 [Deploy] Installing dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci
else
  npm install
fi

# 3. Perform static code analysis and type checks
echo "🔍 [Deploy] Running TypeScript type check & ESLint..."
npx tsc --noEmit
npx eslint .

# 4. Build Next.js production application
echo "🏗️ [Deploy] Building Next.js application..."
npm run build

echo "✅ [Deploy] Build completed successfully!"
echo "ℹ️  [Deploy] Render Start Command: npm start"
