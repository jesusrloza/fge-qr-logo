# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Build argument for base URL (for subpath deployments like /fge-qr-logo/)
ARG VITE_BASE_URL=/
ENV VITE_BASE_URL=${VITE_BASE_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend and server
RUN npm run build && npm run build:server

# Production stage - Express server with static assets
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling and su-exec for dropping privileges
RUN apk add --no-cache dumb-init su-exec

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/package*.json ./

# Copy .env.example as reference (actual .env should be mounted or env vars provided)
COPY --from=builder /app/.env.example ./.env.example

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create data and logs directories
# Note: These will be overwritten by volume mounts, but we need them for the entrypoint
RUN mkdir -p data logs

# Copy entrypoint script
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Change ownership of entire app directory
RUN chown -R nodejs:nodejs /app

# Expose port 3000
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use entrypoint to fix volume permissions before switching to non-root user
ENTRYPOINT ["./entrypoint.sh"]

# Start the Express server with dumb-init
CMD ["dumb-init", "node", "dist-server/prod.js"]
