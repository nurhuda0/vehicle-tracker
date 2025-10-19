# Multi-stage Dockerfile for Vehicle Tracker Backend

# Stage 1: Build Stage
FROM node:18-bookworm-slim AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client with the correct binary target
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:18-bookworm-slim AS production

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]