# GitHub Secrets Configuration

This document explains the required secrets for the CI/CD pipeline to work properly.

## Required Secrets

Add the following secrets in your GitHub repository settings under `Settings > Secrets and variables > Actions`:

### Docker Hub Secrets
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token

### Server Deployment Secrets
- `SERVER_HOST`: Your VPS IP address or domain name
- `SERVER_USERNAME`: SSH username for your VPS (usually `root` or `ubuntu`)
- `SERVER_SSH_KEY`: Your private SSH key for accessing the VPS

## How to Setup Secrets

1. Go to your GitHub repository
2. Click on `Settings` tab
3. In the left sidebar, click on `Secrets and variables` > `Actions`
4. Click `New repository secret`
5. Add each secret with the exact name and value

## SSH Key Setup

To generate SSH keys for deployment:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub username@your-server-ip

# Copy private key content to GitHub secret
cat ~/.ssh/id_rsa
```

## Docker Hub Setup

1. Create account at [Docker Hub](https://hub.docker.com)
2. Create access token:
   - Go to Account Settings > Security
   - Click "New Access Token"
   - Give it a name and select permissions
3. Use the access token as `DOCKER_PASSWORD` secret

## Server Requirements

Your VPS should have:
- Ubuntu 20.04 or later
- Docker and Docker Compose installed
- SSH access configured
- Domain name pointing to the server (for SSL)

## Security Notes

- Never commit secrets to the repository
- Use strong passwords and access tokens
- Regularly rotate secrets
- Use least privilege principle for access tokens
- Consider using GitHub Environments for additional security
