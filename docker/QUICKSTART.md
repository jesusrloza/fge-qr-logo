# Quick Start Guide

## Prerequisites

Ensure you have the following installed:

- Docker
- Docker Compose
- Make (optional, but recommended)

## Quick Start

1. **Start the application:**

   ```bash
   make start
   ```

2. **Access the application:**
   Open your browser and navigate to make

3. **Stop the application:**
   ```bash
   make stop
   ```

## Without Make

If you don't have Make installed, you can use Docker Compose directly:

```bash
# Start
docker-compose -f docker/docker-compose.yml up -d --build

# Stop
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```

## Troubleshooting

### Port 4173 already in use

If port 4173 is already in use, you can modify the port mapping in `docker/docker-compose.yml`:

```yaml
ports:
  - '4173:4173' # Change the first 4173 to another port, e.g., "8080:4173"
```

### Container won't start

Check the logs:

```bash
make logs
```

### Rebuild from scratch

```bash
make clean
make start
```
