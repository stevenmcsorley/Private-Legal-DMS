.PHONY: help up down logs seed migrate test clean build

# Default target
help: ## Show this help message
	@echo "Legal DMS Development Commands"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
up: ## Start all services in development mode
	docker compose up -d --build
	@echo "🚀 Services starting up..."
	@echo "Frontend: http://localhost"
	@echo "API: http://localhost/api"
	@echo "Keycloak: http://localhost:8081 (admin/admin)"
	@echo "MinIO Console: http://localhost:9001 (minio/minio123)"
	@echo "Grafana: http://localhost:3001 (admin/admin)"
	@echo "Mailpit: http://localhost:8025"

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

# Logging & Monitoring
logs: ## View logs from all services
	docker compose logs -f

app-logs: ## View application logs only
	docker compose logs -f app

worker-logs: ## View worker logs only  
	docker compose logs -f worker

frontend-logs: ## View frontend logs only
	docker compose logs -f frontend

# Database Operations
migrate: ## Run database migrations
	docker compose exec app npm run migrate

seed: ## Seed development data
	docker compose exec app npm run seed

db-reset: ## Reset database (drop and recreate)
	docker compose exec app npm run db:reset
	$(MAKE) migrate
	$(MAKE) seed

db-shell: ## Connect to PostgreSQL shell
	docker compose exec app-db psql -U app -d app

# Schema Management
schema-export: ## Export current database schema
	@echo "📥 Exporting database schema..."
	docker exec dms-app-db-1 pg_dump -U app -d app --schema-only --no-owner --no-privileges > services/app/database/schema.sql
	@echo "✅ Schema exported to services/app/database/schema.sql"

schema-import: ## Import schema into fresh database
	@echo "📤 Importing database schema..."
	docker exec -i dms-app-db-1 psql -U app -d app < services/app/database/schema.sql
	@echo "✅ Schema imported successfully"

seed-fresh: ## Apply seed data to fresh database
	@echo "🌱 Applying seed data..."
	docker exec -i dms-app-db-1 psql -U app -d app < services/app/database/seeds.sql
	@echo "✅ Seed data applied successfully"

fresh-install: ## Complete fresh installation (schema + seeds)
	@echo "🔄 Performing fresh database installation..."
	$(MAKE) schema-import
	$(MAKE) seed-fresh
	@echo "✅ Fresh installation complete!"
	@echo "🏢 Default firm: Demo Law Firm"
	@echo "👤 Default admin: admin@demolawfirm.com"
	@echo "📋 Default retention classes and sample data created"

# Development Tools
shell: ## Open shell in app container
	docker compose exec app /bin/bash

worker-shell: ## Open shell in worker container
	docker compose exec worker /bin/bash

redis-cli: ## Connect to Redis CLI
	docker compose exec redis redis-cli

# Testing
test: ## Run all tests
	docker compose exec app npm test

test-watch: ## Run tests in watch mode
	docker compose exec app npm run test:watch

test-e2e: ## Run end-to-end tests
	docker compose exec frontend npm run test:e2e

# Code Quality
lint: ## Run linters
	docker compose exec app npm run lint
	docker compose exec frontend npm run lint

format: ## Format code
	docker compose exec app npm run format
	docker compose exec frontend npm run format

typecheck: ## Run TypeScript type checking
	docker compose exec app npm run typecheck
	docker compose exec frontend npm run typecheck

# Build & Deploy
build: ## Build production images
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Maintenance
clean: ## Clean up containers, volumes, and images
	docker compose down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean everything including images and volumes
	docker compose down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

# Backup & Restore
backup: ## Create backup of all data
	@echo "Creating backup..."
	mkdir -p backups/$(shell date +%Y%m%d_%H%M%S)
	docker compose exec app-db pg_dump -U app app > backups/$(shell date +%Y%m%d_%H%M%S)/app.sql
	docker compose exec keycloak-db pg_dump -U keycloak keycloak > backups/$(shell date +%Y%m%d_%H%M%S)/keycloak.sql
	docker run --rm -v dms_minio:/data -v $(PWD)/backups/$(shell date +%Y%m%d_%H%M%S):/backup alpine tar czf /backup/minio.tar.gz -C /data .
	@echo "✅ Backup created in backups/$(shell date +%Y%m%d_%H%M%S)/"

# Health Checks
health: ## Check health of all services
	@echo "Checking service health..."
	@docker compose ps
	@echo "\n🔍 Service URLs:"
	@echo "Frontend: http://localhost"
	@echo "API Health: http://localhost/api/health"
	@echo "Keycloak: http://localhost:8081"
	@echo "MinIO: http://localhost:9000/minio/health/live"
	@echo "OpenSearch: http://localhost:9200/_cluster/health"
	@echo "Prometheus: http://localhost:9090/-/healthy"
	@echo "Grafana: http://localhost:3001/api/health"

status: ## Show status of all services
	docker compose ps

# MinIO Operations
minio-setup: ## Initialize MinIO buckets and policies
	docker compose exec app npm run minio:setup

# Search Operations  
search-reindex: ## Reindex all documents in OpenSearch
	docker compose exec worker npm run search:reindex

# Security
security-scan: ## Run security scans
	docker compose exec app npm audit
	docker compose exec frontend npm audit

# Development data
demo-data: ## Load demo data for development
	$(MAKE) seed
	docker compose exec app npm run demo:load

reset-demo: ## Reset to fresh demo state
	$(MAKE) db-reset
	$(MAKE) demo-data
	$(MAKE) minio-setup

# Service-specific operations
keycloak-export: ## Export Keycloak realm configuration  
	docker compose exec keycloak /opt/keycloak/bin/kc.sh export --realm dms --file /tmp/realm-export.json
	docker compose cp keycloak:/tmp/realm-export.json ./infra/keycloak/realm-export/

opa-test: ## Test OPA policies
	docker compose exec opa opa test /policies

# Quick development reset
dev-reset: ## Quick reset for development (keeps volumes)
	$(MAKE) down
	$(MAKE) up
	@echo "⏳ Waiting for services to be ready..."
	sleep 30
	$(MAKE) migrate
	$(MAKE) seed
	@echo "✅ Development environment ready!"