#!/usr/bin/env bash
# ==============================================================================
# Fast Deploy Script for FileShare on Render.com
# ==============================================================================

set -e

echo "🚀 [Deploy] Starting ultra-fast deployment sequence on Render..."

# 1. Ensure storage directories exist
mkdir -p data uploads

# 2. Install dependencies only if missing (Render caches node_modules)
if [ ! -d "node_modules" ]; then
  echo "📦 [Deploy] Installing dependencies..."
  npm ci --prefer-offline || npm install
else
  echo "⚡ [Deploy] node_modules cached, skipping re-installation!"
fi

# 3. Build Next.js production application
echo "🏗️ [Deploy] Building Next.js application..."
npm run build

echo "✅ [Deploy] Fast build completed successfully!"

