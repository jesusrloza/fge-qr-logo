# Docker Configuration for fge-qr-logo

This directory contains all Docker-related configuration files for the fge-qr-logo project.

## Files

- **Dockerfile**: Multi-stage build configuration that builds the React app and serves it using Vite's preview server
- **docker-compose.yml**: Docker Compose configuration for easy container orchestration
- **.dockerignore**: Specifies files and directories to exclude from the Docker build context

## How it Works

The Dockerfile uses a multi-stage build:

1. **Builder Stage**:
   - Uses Node.js 20 Alpine image
   - Installs dependencies
   - Builds the production bundle using `npm run build`

2. **Runner Stage**:
   - Uses a lightweight Node.js 20 Alpine image
   - Copies only the built assets from the builder stage
   - Installs only Vite (needed for the preview server)
   - Serves the application on port 4173 using `vite preview`

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

The application will be available at http://localhost:4173

## Notes

- The container uses `vite preview` which is Vite's built-in static file server
- Port 4173 is exposed and mapped to the host
- The container runs with `restart: unless-stopped` policy
- Build artifacts are optimized for production
