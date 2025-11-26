# Docker Configuration for fge-qr-logo

This directory contains all Docker-related configuration files for the fge-qr-logo project.

## Files

- **Dockerfile**: Multi-stage build configuration that builds the React frontend and Express server
- **docker-compose.yml**: Docker Compose configuration for easy container orchestration with persistent volumes
- **QUICKSTART.md**: Quick reference for common operations

## Architecture

The application consists of:

- **Frontend**: React + TypeScript built with Vite
- **Backend**: Express.js server for URL shortening, caching, and logging

## How it Works

The Dockerfile uses a multi-stage build:

1. **Builder Stage**:
   - Uses Node.js 20 Alpine image
   - Installs all dependencies
   - Builds the production frontend bundle (`npm run build`)
   - Builds the server bundle (`npm run build:server`)

2. **Runner Stage**:
   - Uses a lightweight Node.js 20 Alpine image
   - Runs as non-root user for security
   - Copies built frontend assets and server bundle
   - Installs only production dependencies
   - Uses dumb-init for proper signal handling
   - Serves the application on port 3000

## Usage

From the project root, use the Makefile commands:

```bash
# Start the container
make start

# Stop the container
make stop

# Restart the container
make restart

# View logs
make logs

# Clean up everything
make clean
```

The application will be available at http://localhost:3000

## Persistent Data

The container uses Docker volumes to persist data across restarts:

### URL Cache (`fge-qr-logo-cache`)

- Location in container: `/app/data`
- Contains: `url-cache.json` - cached shortened URLs to avoid duplicate API calls
- Cache entries expire after 30 days
- Maximum 500 entries with LRU eviction

### Logs (`fge-qr-logo-logs`)

- Location in container: `/app/logs`
- Contains: Quarterly log files (e.g., `2025-Q1.log`, `2025-Q2.log`)
- Automatic cleanup of logs older than 1 year
- Each log entry includes timestamp, level, context, and message

## Log File Format

Log files are stored in quarterly rotation format for easy auditing:

```
[2025-04-15T10:30:45.123Z] [INFO] [Server] Application started on port 3000
[2025-04-15T10:31:00.456Z] [INFO] [Auth] User verified: GARC850101HDFRRL09
[2025-04-15T10:31:05.789Z] [INFO] [Shortener] URL shortened: https://example.com -> https://tinyurl.com/abc123
```

### Searching Logs

To search logs from the host machine:

```bash
# Access logs volume
docker exec fge-qr-logo cat /app/logs/2025-Q2.log

# Search for specific CURP
docker exec fge-qr-logo grep "GARC850101" /app/logs/*.log

# Search for errors in current quarter
docker exec fge-qr-logo grep "ERROR" /app/logs/2025-Q2.log

# Search for all URL shortening events
docker exec fge-qr-logo grep "URL shortened" /app/logs/*.log

# Count events by user
docker exec fge-qr-logo grep -c "GARC850101" /app/logs/2025-Q2.log

# Get recent errors with context
docker exec fge-qr-logo grep -A 2 -B 2 "ERROR" /app/logs/2025-Q2.log
```

### Copying Logs to Host

```bash
# Copy all logs to current directory
docker cp fge-qr-logo:/app/logs ./logs-backup

# Copy specific quarter
docker cp fge-qr-logo:/app/logs/2025-Q1.log ./2025-Q1.log
```

## Environment Variables

Required environment variables (set in `.env` file):

| Variable     | Description                          | Example                        |
| ------------ | ------------------------------------ | ------------------------------ |
| `JWT_SECRET` | Secret key for JWT token signing     | `your-secret-key-min-32-chars` |
| `NODE_ENV`   | Environment mode                     | `production`                   |
| `PORT`       | Server port (optional, default 3000) | `3000`                         |

## Health Check

The container includes a health check endpoint:

```bash
# Check health status
curl http://localhost:3000/api/health
# Response: {"status":"ok","timestamp":"2025-04-15T10:30:45.123Z"}
```

Docker monitors this endpoint automatically and restarts the container if unhealthy.

## Security Notes

- Container runs as non-root user (`nodejs:1001`)
- JWT tokens are signed with a secret key (set `JWT_SECRET` in production!)
- CURP validation follows official format
- Dumb-init ensures proper signal handling for graceful shutdown

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs fge-qr-logo

# Verify .env file exists
cat .env
```

### Cache issues

```bash
# Clear cache (container must be stopped)
docker volume rm fge-qr-logo-cache

# Or clear inside running container
docker exec fge-qr-logo rm /app/data/url-cache.json
```

### Log volume full

```bash
# Check log size
docker exec fge-qr-logo du -sh /app/logs

# Manual cleanup (old logs are cleaned automatically)
docker exec fge-qr-logo rm /app/logs/2024-*.log
```
