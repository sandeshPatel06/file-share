#!/usr/bin/env bash
# ==============================================================================
# Fast Deploy Script for FileShare on Render.com
# ==============================================================================

set -e

echo "🚀 [Deploy] Starting fast deployment sequence on Render..."

# 1. Ensure storage directories exist
mkdir -p data uploads

# 2. Ensure all dependencies are present and synced with package-lock.json
echo "📦 [Deploy] Verifying & installing dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci --prefer-offline
else
  npm install --prefer-offline
fi

# 3. Build Next.js production application
echo "🏗️ [Deploy] Building Next.js application..."
npm run build

echo "✅ [Deploy] Fast build completed successfully!"

