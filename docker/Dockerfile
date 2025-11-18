# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - serve with lightweight http server
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
## Include .env file inside final image for reference/runtime variable loading
COPY --from=builder /app/.env ./.env

# Install only vite for preview server
RUN npm install vite

# Expose port 4173
EXPOSE 4173

# Start the preview server
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
