#!/bin/bash

# Database Migration Script for Vehicle Tracker
# This script handles database migrations and seeding

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running in Docker or locally
if [ -f /.dockerenv ]; then
    log "Running inside Docker container"
    APP_DIR="/app"
else
    log "Running locally"
    APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

cd $APP_DIR

# Check if .env file exists
if [ ! -f ".env" ]; then
    error ".env file not found. Please create it from env.example"
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not set in .env file"
fi

# Function to wait for database
wait_for_database() {
    log "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
            log "Database is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Database not ready, waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Database connection timeout after $max_attempts attempts"
}

# Function to run migrations
run_migrations() {
    log "Running database migrations..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    if [ "$NODE_ENV" = "production" ]; then
        npx prisma migrate deploy
        log "Production migrations deployed successfully"
    else
        npx prisma migrate dev
        log "Development migrations completed successfully"
    fi
}

# Function to seed database
seed_database() {
    log "Seeding database..."
    
    # Check if seeding is needed
    local user_count=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | grep -o '[0-9]*' | head -1)
    
    if [ "$user_count" -gt 0 ]; then
        warn "Database already contains data. Skipping seed."
        return 0
    fi
    
    # Run seed script
    npm run seed
    log "Database seeded successfully"
}

# Function to show database status
show_status() {
    log "Database Status:"
    echo "=================="
    
    # Show migration status
    npx prisma migrate status
    
    echo ""
    log "Database Tables:"
    npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
    
    echo ""
    log "User Count:"
    npx prisma db execute --stdin <<< "SELECT COUNT(*) as user_count FROM \"User\";"
    
    echo ""
    log "Vehicle Count:"
    npx prisma db execute --stdin <<< "SELECT COUNT(*) as vehicle_count FROM \"Vehicle\";"
}

# Main execution
main() {
    case "${1:-migrate}" in
        "migrate")
            wait_for_database
            run_migrations
            log "Migration completed successfully!"
            ;;
        "seed")
            wait_for_database
            seed_database
            log "Seeding completed successfully!"
            ;;
        "reset")
            warn "This will reset the entire database. Are you sure? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                wait_for_database
                log "Resetting database..."
                npx prisma migrate reset --force
                run_migrations
                seed_database
                log "Database reset completed successfully!"
            else
                log "Database reset cancelled."
            fi
            ;;
        "status")
            wait_for_database
            show_status
            ;;
        "full-setup")
            wait_for_database
            run_migrations
            seed_database
            show_status
            log "Full setup completed successfully!"
            ;;
        *)
            echo "Usage: $0 {migrate|seed|reset|status|full-setup}"
            echo ""
            echo "Commands:"
            echo "  migrate     - Run database migrations only"
            echo "  seed        - Seed database with initial data"
            echo "  reset       - Reset database and run full setup"
            echo "  status      - Show database status"
            echo "  full-setup  - Run migrations and seed database"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
