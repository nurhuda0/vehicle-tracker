#!/bin/bash

# Database Backup Script for Vehicle Tracker
# This script creates database backups with compression and rotation

set -e

# Configuration
APP_NAME="vehicle-tracker"
BACKUP_DIR="/opt/${APP_NAME}/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/vehicle_tracker_${DATE}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to check if running in Docker
is_docker_env() {
    [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]
}

# Function to get database connection info
get_db_info() {
    if is_docker_env; then
        # Running in Docker environment
        DB_HOST="postgres"
        DB_NAME="vehicle_tracker"
        DB_USER="postgres"
        DB_PASS="password"
    else
        # Running on host
        if [ -f ".env" ]; then
            source .env
            DB_HOST="${POSTGRES_HOST:-localhost}"
            DB_NAME="${POSTGRES_DB:-vehicle_tracker}"
            DB_USER="${POSTGRES_USER:-postgres}"
            DB_PASS="${POSTGRES_PASSWORD:-password}"
        else
            error ".env file not found"
        fi
    fi
}

# Function to create database backup
create_backup() {
    log "Creating database backup..."
    
    get_db_info
    
    # Create backup using pg_dump
    if is_docker_env; then
        # Running inside Docker container
        log "Creating backup from Docker container..."
        docker exec vehicle-tracker-db pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" > "$BACKUP_FILE"
    else
        # Running on host
        log "Creating backup from host..."
        PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    fi
    
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        log "Database backup created successfully: $BACKUP_FILE"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        log "Backup compressed: $COMPRESSED_FILE"
        
        # Show backup size
        local size=$(du -h "$COMPRESSED_FILE" | cut -f1)
        log "Backup size: $size"
        
        return 0
    else
        error "Failed to create database backup"
        return 1
    fi
}

# Function to restore database from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file not specified"
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
    fi
    
    log "Restoring database from backup: $backup_file"
    
    get_db_info
    
    # Confirm restoration
    warn "This will replace all data in the database. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Restoration cancelled"
        return 0
    fi
    
    # Restore database
    if is_docker_env; then
        # Running inside Docker container
        if [[ "$backup_file" == *.gz ]]; then
            gunzip -c "$backup_file" | docker exec -i vehicle-tracker-db psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME"
        else
            docker exec -i vehicle-tracker-db psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" < "$backup_file"
        fi
    else
        # Running on host
        if [[ "$backup_file" == *.gz ]]; then
            gunzip -c "$backup_file" | PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME"
        else
            PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" < "$backup_file"
        fi
    fi
    
    log "Database restored successfully from: $backup_file"
}

# Function to list available backups
list_backups() {
    log "Available backups:"
    echo "=================="
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -lah "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print $5, $6, $7, $8, $9}' | column -t
    else
        warn "No backups found in $BACKUP_DIR"
    fi
}

# Function to clean old backups
cleanup_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    if [ -d "$BACKUP_DIR" ]; then
        local deleted_count=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
        if [ "$deleted_count" -gt 0 ]; then
            log "Deleted $deleted_count old backup(s)"
        else
            log "No old backups to delete"
        fi
    else
        warn "Backup directory not found: $BACKUP_DIR"
    fi
}

# Function to verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file not specified"
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
    fi
    
    log "Verifying backup integrity: $backup_file"
    
    # Check if file is compressed
    if [[ "$backup_file" == *.gz ]]; then
        if gzip -t "$backup_file" 2>/dev/null; then
            log "Backup file is valid (compressed)"
        else
            error "Backup file is corrupted (compressed)"
        fi
    else
        # Check SQL file syntax
        if head -1 "$backup_file" | grep -q "PostgreSQL database dump"; then
            log "Backup file appears to be a valid PostgreSQL dump"
        else
            warn "Backup file may not be a valid PostgreSQL dump"
        fi
    fi
}

# Function to schedule automatic backups
setup_cron_backup() {
    log "Setting up automatic backup schedule..."
    
    # Create cron job for daily backup at 2 AM
    local cron_job="0 2 * * * /opt/$APP_NAME/deploy/backup.sh backup >/dev/null 2>&1"
    
    # Add to crontab if not already present
    if ! crontab -l 2>/dev/null | grep -q "backup.sh backup"; then
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        log "Automatic backup scheduled for daily at 2:00 AM"
    else
        warn "Automatic backup already scheduled"
    fi
}

# Function to show backup statistics
show_backup_stats() {
    info "Backup Statistics:"
    echo "=================="
    
    if [ -d "$BACKUP_DIR" ]; then
        local total_backups=$(ls "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
        local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
        local oldest_backup=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -1)
        local newest_backup=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
        
        echo "Total backups: $total_backups"
        echo "Total size: $total_size"
        
        if [ -n "$oldest_backup" ]; then
            echo "Oldest backup: $(basename "$oldest_backup")"
        fi
        
        if [ -n "$newest_backup" ]; then
            echo "Newest backup: $(basename "$newest_backup")"
        fi
    else
        warn "No backup directory found"
    fi
}

# Main execution
main() {
    case "${1:-backup}" in
        "backup")
            create_backup
            cleanup_backups
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "list")
            list_backups
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "cleanup")
            cleanup_backups
            ;;
        "schedule")
            setup_cron_backup
            ;;
        "stats")
            show_backup_stats
            ;;
        "full")
            create_backup
            verify_backup "$COMPRESSED_FILE"
            cleanup_backups
            show_backup_stats
            ;;
        *)
            echo "Usage: $0 {backup|restore|list|verify|cleanup|schedule|stats|full}"
            echo ""
            echo "Commands:"
            echo "  backup [file]     - Create database backup"
            echo "  restore <file>    - Restore database from backup"
            echo "  list              - List available backups"
            echo "  verify <file>     - Verify backup integrity"
            echo "  cleanup           - Remove old backups"
            echo "  schedule          - Setup automatic backup schedule"
            echo "  stats             - Show backup statistics"
            echo "  full              - Create backup, verify, cleanup, and show stats"
            echo ""
            echo "Examples:"
            echo "  $0 backup                                    # Create backup"
            echo "  $0 restore /path/to/backup.sql.gz           # Restore from backup"
            echo "  $0 verify /path/to/backup.sql.gz            # Verify backup"
            echo "  $0 schedule                                  # Setup cron job"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
