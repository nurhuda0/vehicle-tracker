#!/bin/bash

# Vehicle Tracker Docker Management Scripts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Start all services
start_all() {
    print_header "Starting Vehicle Tracker with Docker"
    print_status "Building and starting all services..."
    docker-compose up --build -d
    print_status "Services started! Check status with: ./docker-scripts.sh status"
}

# Stop all services
stop_all() {
    print_header "Stopping Vehicle Tracker"
    print_status "Stopping all services..."
    docker-compose down
    print_status "All services stopped!"
}

# Restart all services
restart_all() {
    print_header "Restarting Vehicle Tracker"
    print_status "Restarting all services..."
    docker-compose restart
    print_status "Services restarted!"
}

# Show status
show_status() {
    print_header "Vehicle Tracker Status"
    docker-compose ps
    echo ""
    print_status "API Health Check:"
    curl -s http://localhost:3000/health | jq . || echo "API not responding"
    echo ""
    print_status "Database Connection:"
    docker-compose exec postgres pg_isready -U postgres -d vehicle_tracker || echo "Database not responding"
}

# Show logs
show_logs() {
    print_header "Vehicle Tracker Logs"
    docker-compose logs -f
}

# Show API logs only
show_api_logs() {
    print_header "API Logs"
    docker-compose logs -f api
}

# Show database logs only
show_db_logs() {
    print_header "Database Logs"
    docker-compose logs -f postgres
}

# Reset database
reset_database() {
    print_header "Resetting Database"
    print_warning "This will delete all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping services..."
        docker-compose down
        print_status "Removing database volume..."
        docker volume rm vehicle-tracker_postgres_data || true
        print_status "Starting services with fresh database..."
        docker-compose up -d
        print_status "Database reset complete!"
    else
        print_status "Database reset cancelled."
    fi
}

# Run database migration
run_migration() {
    print_header "Running Database Migration"
    print_status "Running Prisma migrations..."
    docker-compose exec api npx prisma migrate deploy
    print_status "Migration complete!"
}

# Seed database
seed_database() {
    print_header "Seeding Database"
    print_status "Seeding database with dummy data..."
    docker-compose exec api npx prisma db seed
    print_status "Database seeded!"
}

# Open pgAdmin
open_pgadmin() {
    print_header "Opening pgAdmin"
    print_status "pgAdmin is available at: http://localhost:5050"
    print_status "Email: admin@vehicletracker.com"
    print_status "Password: admin123"
    print_status "Database connection:"
    print_status "  Host: postgres"
    print_status "  Port: 5432"
    print_status "  Database: vehicle_tracker"
    print_status "  Username: postgres"
    print_status "  Password: password"
}

# Clean up everything
cleanup() {
    print_header "Cleaning Up"
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing containers..."
        docker-compose down -v
        print_status "Removing images..."
        docker-compose down --rmi all
        print_status "Cleanup complete!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Show help
show_help() {
    print_header "Vehicle Tracker Docker Scripts"
    echo "Usage: ./docker-scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  status      - Show status of all services"
    echo "  logs        - Show logs from all services"
    echo "  api-logs    - Show API logs only"
    echo "  db-logs     - Show database logs only"
    echo "  migrate     - Run database migrations"
    echo "  seed        - Seed database with dummy data"
    echo "  reset-db    - Reset database (WARNING: deletes all data)"
    echo "  pgadmin     - Show pgAdmin connection info"
    echo "  cleanup     - Remove all containers and volumes"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-scripts.sh start"
    echo "  ./docker-scripts.sh status"
    echo "  ./docker-scripts.sh api-logs"
}

# Main script logic
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    api-logs)
        show_api_logs
        ;;
    db-logs)
        show_db_logs
        ;;
    migrate)
        run_migration
        ;;
    seed)
        seed_database
        ;;
    reset-db)
        reset_database
        ;;
    pgadmin)
        open_pgadmin
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
