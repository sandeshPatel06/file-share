# ==============================================================================
# FileShare — Makefile (run `make help` to list all commands)
# NOTE for AI agents (see AGENTS.md): use `make verify` for checks.
# Do NOT run `make build` in agent loops — CI does the production build.
# ==============================================================================
.PHONY: help install ci dev build start check verify lint lint-fix typecheck clean storage deploy

help: ## Show this help (default)
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage: make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

install: ## Install dependencies (respects package-lock.json)
	npm ci --include=dev --no-audit --no-fund

ci: ## Clean install (nuclear: wipes node_modules first)
	rm -rf node_modules
	npm ci --include=dev --no-audit --no-fund

dev: ## Run dev server (LAN-accessible, HMR)
	npm run dev

build: ## Production build (humans/CI only — agents must NOT run this)
	npm run build

start: ## Serve production build (needs `make build` first)
	npm start

check: ## Mirror CI: typecheck + lint (no build)
check: typecheck lint

verify: ## Agent-safe verification: typecheck + lint (no build, no side effects)
verify: typecheck lint

lint: ## Lint everything
	npm run lint

lint-fix: ## Lint and auto-fix
	npm run lint:fix

typecheck: ## TypeScript check (no emit)
	npm run typecheck

clean: ## Remove build caches (.next, out) — never touches node_modules/uploads/data
	npm run clean

storage: ## Ensure local storage dirs exist (data/ + uploads/ for SQLite/local vault)
	mkdir -p data uploads

deploy: ## Full Render-style deploy: preflight + install + build + verify output
deploy: storage
	./deploy.sh
