#!/usr/bin/env bash
# ==============================================================================
# Fast Deploy Script for FileShare on Render.com
# ==============================================================================

set -e

# Skip Next.js telemetry upload step during CI builds
export NEXT_TELEMETRY_DISABLED=1

fail() {
  echo "❌ [Deploy] $1" >&2
  exit 1
}

DEPLOY_START=$(date +%s)
DEPLOY_START_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🚀 [Deploy] Starting fast deployment sequence on Render..."
echo "🕒 [Deploy] Start: ${DEPLOY_START_ISO}"

# 0. Preflight: fail fast on wrong cwd or unsupported toolchain
echo "🔍 [Deploy] Preflight checks..."
[ -f "package.json" ] || fail "package.json not found (wrong working directory?)."
command -v node >/dev/null 2>&1 || fail "node not found in PATH."
command -v npm >/dev/null 2>&1 || fail "npm not found in PATH."
echo "[Deploy] node $(node --version) / npm $(npm --version)"
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if ! [ "$NODE_MAJOR" -ge 20 ] 2>/dev/null; then
  fail "Node >=20 required (found $(node --version)). Check render.yaml env / package.json engines."
fi

# 1. Ensure storage directories exist and are writable
echo "💾 [Deploy] Ensuring data/ + uploads/ exist and are writable..."
mkdir -p data uploads
for dir in data uploads; do
  touch "$dir/.deploy_write_test" || fail "Directory $dir is not writable."
  rm -f "$dir/.deploy_write_test"
done
echo "💾 [Deploy] Storage directories ready."

# 2. Ensure all dependencies are present and synced with package-lock.json
# (--no-audit/--no-fund skip registry metadata round-trips; --prefer-offline
#  reuses Render's npm cache for unchanged packages)
# NOTE: keep devDependencies installed (--include=dev) and do NOT prune:
# better-sqlite3's native prebuild must survive, and `next start` may need
# packages hoisted alongside devDeps at runtime.
DEPS_START=$(date +%s)
echo "📦 [Deploy] Verifying & installing dependencies..."
if [ -f "package-lock.json" ]; then
  if ! npm ci --include=dev --prefer-offline --no-audit --no-fund; then
    echo "⚠️ [Deploy] npm ci failed, retrying once in 10s (transient network?)..."
    sleep 10
    npm ci --include=dev --prefer-offline --no-audit --no-fund || fail "npm ci failed twice — aborting deploy."
  fi
else
  echo "⚠️ [Deploy] package-lock.json absent, falling back to npm install..."
  if ! npm install --include=dev --prefer-offline --no-audit --no-fund; then
    echo "⚠️ [Deploy] npm install failed, retrying once in 10s (transient network?)..."
    sleep 10
    npm install --include=dev --prefer-offline --no-audit --no-fund || fail "npm install failed twice — aborting deploy."
  fi
fi
DEPS_END=$(date +%s)
DEPS_SECS=$((DEPS_END - DEPS_START))
echo "📦 [Deploy] Dependencies ready in ${DEPS_SECS}s."

# 3. Build Next.js production application (Turbopack — see package.json)
BUILD_START=$(date +%s)
echo "🏗️ [Deploy] Building Next.js application..."
npm run build
BUILD_END=$(date +%s)
BUILD_SECS=$((BUILD_END - BUILD_START))
echo "🏗️ [Deploy] Build finished in ${BUILD_SECS}s."

# 4. Post-build verification: fail loudly if the build produced nothing
echo "🔍 [Deploy] Verifying build output..."
[ -d ".next" ] || fail ".next/ directory missing after build — aborting."
[ -f ".next/BUILD_ID" ] || fail ".next/BUILD_ID missing after build — aborting."
BUILD_ID=$(cat .next/BUILD_ID)
NEXT_SIZE=$(du -sh .next | awk '{print $1}')
echo "📁 [Deploy] Build output verified (.next, id ${BUILD_ID})."
du -sh .next

DEPLOY_END=$(date +%s)
TOTAL_SECS=$((DEPLOY_END - DEPLOY_START))
DEPLOY_END_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "✅ [Deploy] Fast build completed successfully!"
echo "==================== [Deploy] Summary ===================="
echo "[Deploy] Start:       ${DEPLOY_START_ISO}"
echo "[Deploy] End:         ${DEPLOY_END_ISO}"
echo "[Deploy] Node:        $(node --version) (npm $(npm --version))"
echo "[Deploy] Deps stage:  ${DEPS_SECS}s"
echo "[Deploy] Build stage: ${BUILD_SECS}s"
echo "[Deploy] Total:       ${TOTAL_SECS}s"
echo "[Deploy] Build ID:    ${BUILD_ID}"
echo "[Deploy] .next size:  ${NEXT_SIZE}"
echo "=========================================================="

