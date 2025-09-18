#!/bin/bash

# Database Setup Script for Legal Document Management System
# This script helps set up the database with different options

set -e

echo "🏗️  Legal Document Management System - Database Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker Compose is available
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed or not available"
    exit 1
fi

# Function to wait for database to be ready
wait_for_db() {
    print_status "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec app-db pg_isready -U app -d app &> /dev/null; then
            print_success "Database is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - Database not ready yet, waiting..."
        sleep 2
        ((attempt++))
    done
    
    print_error "Database failed to become ready after $max_attempts attempts"
    return 1
}

# Function to check if database is empty
is_database_empty() {
    local table_count
    table_count=$(docker compose exec app-db psql -U app -d app -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n\r')
    
    if [ "$table_count" -eq 0 ]; then
        return 0  # Database is empty
    else
        return 1  # Database has tables
    fi
}

# Function to show setup options
show_options() {
    echo
    echo "Choose a database setup option:"
    echo "1) 🚀 Quick Setup (Recommended) - Full current database with all sample data"
    echo "2) 🏗️  Schema Only - Just the database structure, no data"
    echo "3) 📋 Original Setup - Original schema + basic seed data"
    echo "4) 🧹 Reset Database - Drop all tables and start fresh"
    echo "5) ❌ Cancel"
    echo
}

# Function to setup full database
setup_full_database() {
    print_status "Setting up complete database with current schema and data..."
    
    if docker compose exec -T app-db psql -U app -d app < scripts/sql/03_current_full_dump.sql; then
        print_success "Complete database setup successful!"
        return 0
    else
        print_error "Failed to setup complete database"
        return 1
    fi
}

# Function to setup schema only
setup_schema_only() {
    print_status "Setting up database schema only..."
    
    if docker compose exec -T app-db psql -U app -d app < scripts/sql/02_current_schema.sql; then
        print_success "Schema setup successful!"
        return 0
    else
        print_error "Failed to setup schema"
        return 1
    fi
}

# Function to setup original database
setup_original_database() {
    print_status "Setting up original database schema..."
    
    if docker compose exec -T app-db psql -U app -d app < scripts/sql/001_init.sql; then
        print_status "Adding original seed data..."
        if docker compose exec -T app-db psql -U app -d app < scripts/sql/002_seed_data.sql; then
            print_success "Original database setup successful!"
            return 0
        else
            print_error "Failed to add seed data"
            return 1
        fi
    else
        print_error "Failed to setup original schema"
        return 1
    fi
}

# Function to reset database
reset_database() {
    print_warning "This will delete ALL data in the database!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Dropping all tables..."
        docker compose exec app-db psql -U app -d app -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" &> /dev/null
        print_success "Database reset successful!"
        return 0
    else
        print_status "Database reset cancelled"
        return 1
    fi
}

# Main execution
main() {
    # Check if database container is running
    if ! docker compose ps app-db | grep -q "running"; then
        print_status "Starting database container..."
        docker compose up -d app-db
    fi
    
    # Wait for database to be ready
    if ! wait_for_db; then
        print_error "Cannot proceed - database is not responding"
        exit 1
    fi
    
    # Check if database already has data
    if ! is_database_empty; then
        print_warning "Database already contains tables and data"
        echo "Current tables:"
        docker compose exec app-db psql -U app -d app -c "\dt" 2>/dev/null || echo "Could not list tables"
        echo
    fi
    
    # Show options and get user choice
    show_options
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            echo
            print_status "Starting Quick Setup..."
            if ! is_database_empty; then
                reset_database
            fi
            setup_full_database
            ;;
        2)
            echo
            print_status "Starting Schema Only Setup..."
            if ! is_database_empty; then
                reset_database
            fi
            setup_schema_only
            ;;
        3)
            echo
            print_status "Starting Original Setup..."
            if ! is_database_empty; then
                reset_database
            fi
            setup_original_database
            ;;
        4)
            echo
            reset_database
            ;;
        5)
            print_status "Setup cancelled"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo
        print_success "Database setup completed successfully! 🎉"
        echo
        echo "Next steps:"
        echo "1. Start the application: docker compose up -d app frontend"
        echo "2. Access the application at: http://localhost"
        echo "3. Check the documentation in scripts/sql/README.md for more details"
    else
        print_error "Database setup failed"
        exit 1
    fi
}

# Run main function
main "$@"