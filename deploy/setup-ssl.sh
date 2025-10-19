#!/bin/bash

# SSL Setup Script for Vehicle Tracker
# This script sets up SSL with Let's Encrypt

set -e

# Configuration
DOMAIN="${DOMAIN:-your-domain.com}"
EMAIL="${EMAIL:-admin@$DOMAIN}"

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    log "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
log "Stopping nginx temporarily..."
systemctl stop nginx || true

# Obtain SSL certificate
log "Obtaining SSL certificate for $DOMAIN..."
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Update nginx configuration with domain
log "Updating nginx configuration..."
if [ -f "/opt/vehicle-tracker/nginx/nginx.conf" ]; then
    sed -i "s/your-domain.com/$DOMAIN/g" /opt/vehicle-tracker/nginx/nginx.conf
    log "Nginx configuration updated successfully!"
else
    warn "Nginx configuration file not found at /opt/vehicle-tracker/nginx/nginx.conf"
fi

# Setup automatic renewal
log "Setting up automatic certificate renewal..."
cat > /etc/cron.d/certbot-renew << EOF
0 12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# Start nginx
log "Starting nginx..."
systemctl start nginx

log "SSL setup completed successfully!"
log "Certificate will be automatically renewed via cron job"
