#!/bin/sh
set -e

# Fix permissions for mounted volumes (they are created as root by Docker)
# This runs as root before dropping to nodejs user
chown -R nodejs:nodejs /app/data /app/logs 2>/dev/null || true

# Execute the main command as the nodejs user
exec su-exec nodejs "$@"
