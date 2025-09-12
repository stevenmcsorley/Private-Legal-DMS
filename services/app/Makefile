.PHONY: build seed seed-prod clean install

# Default target
all: build

# Build the application
build:
	npm run build

# Install dependencies
install:
	npm install

# Seed the database (development)
seed:
	npm run seed

# Seed the database (production - for built image)
seed-prod:
	npm run seed:prod

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/

# Help
help:
	@echo "Available targets:"
	@echo "  build      - Build the application"
	@echo "  install    - Install dependencies"
	@echo "  seed       - Seed database (development)"
	@echo "  seed-prod  - Seed database (production)"
	@echo "  clean      - Clean build artifacts"
	@echo "  help       - Show this help"