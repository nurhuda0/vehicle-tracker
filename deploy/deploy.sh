#!/bin/bash

# Vehicle Tracker Deployment Script
# This script deploys the application to a Linux VPS

set -e

# Configuration
APP_NAME="vehicle-tracker"
APP_DIR="/opt/$APP_NAME"
SERVICE_NAME="vehicle-tracker.service"
DOMAIN="${DOMAIN:-your-domain.com}"
DOCKER_USERNAME="${DOCKER_USERNAME:-your-docker-username}"

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

# Update system packages
log "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install required packages
log "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    log "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
log "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository if not exists
if [ ! -d ".git" ]; then
    log "Cloning repository..."
    git clone https://github.com/$DOCKER_USERNAME/$APP_NAME.git .
else
    log "Updating repository..."
    git pull origin main
fi

# Create environment file if not exists
if [ ! -f ".env" ]; then
    log "Creating environment file..."
    cp env.example .env
    warn "Please edit .env file with your production values before continuing!"
    read -p "Press Enter to continue after editing .env file..."
fi

# Setup SSL with Let's Encrypt
if [ "$DOMAIN" != "your-domain.com" ]; then
    log "Setting up SSL with Let's Encrypt..."
    
    # Stop nginx if running
    systemctl stop nginx || true
    
    # Get SSL certificate
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Update nginx configuration with domain
    sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
    
    log "SSL certificate obtained successfully!"
else
    warn "Domain not configured. Please update DOMAIN environment variable and run this script again."
fi

# Copy systemd service file
log "Setting up systemd service..."
cp deploy/$SERVICE_NAME /etc/systemd/system/
systemctl daemon-reload
systemctl enable $SERVICE_NAME

# Create uploads directory
mkdir -p uploads

# Set proper permissions
chown -R www-data:www-data uploads
chmod -R 755 uploads

# Start the application
log "Starting the application..."
systemctl start $SERVICE_NAME

# Check service status
sleep 10
if systemctl is-active --quiet $SERVICE_NAME; then
    log "Application started successfully!"
    log "You can check the status with: systemctl status $SERVICE_NAME"
    log "You can view logs with: journalctl -u $SERVICE_NAME -f"
else
    error "Failed to start the application. Check logs with: journalctl -u $SERVICE_NAME"
fi

# Setup log rotation
log "Setting up log rotation..."
cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/$APP_NAME/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload $SERVICE_NAME
    endscript
}
EOF

log "Deployment completed successfully!"
log "Application is available at: https://$DOMAIN"
log "API documentation: https://$DOMAIN/api-docs"
