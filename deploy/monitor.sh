#!/bin/bash

# Monitoring and Health Check Script for Vehicle Tracker
# This script provides monitoring capabilities for the application

set -e

# Configuration
APP_NAME="vehicle-tracker"
LOG_FILE="/var/log/${APP_NAME}/monitor.log"
HEALTH_CHECK_URL="http://localhost:3000/health"
API_DOCS_URL="http://localhost:3000/api-docs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to check service status
check_service_status() {
    local service_name="$1"
    
    if systemctl is-active --quiet "$service_name"; then
        log "Service $service_name is running"
        return 0
    else
        error "Service $service_name is not running"
        return 1
    fi
}

# Function to check Docker containers
check_docker_containers() {
    log "Checking Docker containers status..."
    
    local containers=("vehicle-tracker-api" "vehicle-tracker-frontend" "vehicle-tracker-db" "vehicle-tracker-nginx")
    local all_running=true
    
    for container in "${containers[@]}"; do
        if docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
            log "Container $container is running"
        else
            error "Container $container is not running"
            all_running=false
        fi
    done
    
    if [ "$all_running" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to check application health
check_application_health() {
    log "Checking application health..."
    
    # Check API health endpoint
    if curl -s -f "$HEALTH_CHECK_URL" > /dev/null; then
        log "API health check passed"
    else
        error "API health check failed"
        return 1
    fi
    
    # Check API documentation
    if curl -s -f "$API_DOCS_URL" > /dev/null; then
        log "API documentation is accessible"
    else
        warn "API documentation is not accessible"
    fi
    
    return 0
}

# Function to check database connectivity
check_database_health() {
    log "Checking database connectivity..."
    
    # Check if PostgreSQL container is running
    if docker ps --filter "name=vehicle-tracker-db" --filter "status=running" | grep -q "vehicle-tracker-db"; then
        log "PostgreSQL container is running"
        
        # Check database connection
        if docker exec vehicle-tracker-db pg_isready -U postgres -d vehicle_tracker > /dev/null 2>&1; then
            log "Database connection is healthy"
            return 0
        else
            error "Database connection failed"
            return 1
        fi
    else
        error "PostgreSQL container is not running"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    log "Checking disk space..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    local threshold=80
    
    if [ "$usage" -gt "$threshold" ]; then
        warn "Disk usage is high: ${usage}%"
        return 1
    else
        log "Disk usage is normal: ${usage}%"
        return 0
    fi
}

# Function to check memory usage
check_memory_usage() {
    log "Checking memory usage..."
    
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    local threshold=80
    
    if [ "$usage" -gt "$threshold" ]; then
        warn "Memory usage is high: ${usage}%"
        return 1
    else
        log "Memory usage is normal: ${usage}%"
        return 0
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    local domain="${1:-localhost}"
    
    log "Checking SSL certificate for $domain..."
    
    if command -v openssl > /dev/null; then
        local expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
        
        if [ -n "$expiry" ]; then
            local expiry_timestamp=$(date -d "$expiry" +%s)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ "$days_until_expiry" -lt 30 ]; then
                warn "SSL certificate expires in $days_until_expiry days"
                return 1
            else
                log "SSL certificate is valid for $days_until_expiry days"
                return 0
            fi
        else
            warn "Could not check SSL certificate"
            return 1
        fi
    else
        warn "OpenSSL not available for certificate check"
        return 1
    fi
}

# Function to show system resources
show_system_resources() {
    info "System Resources:"
    echo "=================="
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    echo "CPU Usage: ${cpu_usage}%"
    
    # Memory usage
    local mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    echo "Memory Usage: ${mem_usage}%"
    
    # Disk usage
    local disk_usage=$(df / | awk 'NR==2 {print $5}')
    echo "Disk Usage: ${disk_usage}"
    
    # Load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    echo "Load Average:${load_avg}"
    
    echo ""
}

# Function to show application metrics
show_application_metrics() {
    info "Application Metrics:"
    echo "===================="
    
    # Container resource usage
    echo "Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    echo ""
    
    # Database size
    echo "Database Size:"
    docker exec vehicle-tracker-db psql -U postgres -d vehicle_tracker -c "SELECT pg_size_pretty(pg_database_size('vehicle_tracker'));"
    
    echo ""
    
    # Application logs count
    echo "Recent Application Logs:"
    journalctl -u "$APP_NAME" --since "1 hour ago" --no-pager | tail -5
}

# Function to restart services
restart_services() {
    log "Restarting services..."
    
    systemctl restart "$APP_NAME"
    sleep 10
    
    if check_service_status "$APP_NAME"; then
        log "Services restarted successfully"
    else
        error "Failed to restart services"
        return 1
    fi
}

# Function to perform full health check
full_health_check() {
    log "Performing full health check..."
    echo "==============================="
    
    local overall_status=0
    
    # Check services
    if ! check_service_status "$APP_NAME"; then
        overall_status=1
    fi
    
    # Check Docker containers
    if ! check_docker_containers; then
        overall_status=1
    fi
    
    # Check application health
    if ! check_application_health; then
        overall_status=1
    fi
    
    # Check database health
    if ! check_database_health; then
        overall_status=1
    fi
    
    # Check system resources
    check_disk_space || overall_status=1
    check_memory_usage || overall_status=1
    
    # Show system resources
    show_system_resources
    
    if [ "$overall_status" -eq 0 ]; then
        log "All health checks passed!"
    else
        error "Some health checks failed!"
    fi
    
    return $overall_status
}

# Main execution
main() {
    case "${1:-status}" in
        "status")
            full_health_check
            ;;
        "health")
            check_application_health
            ;;
        "database")
            check_database_health
            ;;
        "containers")
            check_docker_containers
            ;;
        "resources")
            show_system_resources
            show_application_metrics
            ;;
        "ssl")
            check_ssl_certificate "${2:-localhost}"
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            journalctl -u "$APP_NAME" -f
            ;;
        *)
            echo "Usage: $0 {status|health|database|containers|resources|ssl|restart|logs}"
            echo ""
            echo "Commands:"
            echo "  status      - Perform full health check"
            echo "  health      - Check application health endpoints"
            echo "  database    - Check database connectivity"
            echo "  containers  - Check Docker containers status"
            echo "  resources   - Show system and application metrics"
            echo "  ssl [domain] - Check SSL certificate status"
            echo "  restart     - Restart application services"
            echo "  logs        - Show real-time application logs"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
