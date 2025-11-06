.PHONY: help start stop restart build logs clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make start     - Build and start the Docker container"
	@echo "  make stop      - Stop the Docker container"
	@echo "  make restart   - Restart the Docker container"
	@echo "  make build     - Build the Docker image"
	@echo "  make logs      - View container logs"
	@echo "  make clean     - Stop and remove container and image"

# Build and start the container
start:
	@echo "Building and starting the container..."
	docker-compose -f docker/docker-compose.yml up -d --build
	@echo "Container started! Application available at http://localhost:4173"

# Stop the container
stop:
	@echo "Stopping the container..."
	docker-compose -f docker/docker-compose.yml down
	@echo "Container stopped."

# Restart the container
restart: stop start

# Build the Docker image without starting
build:
	@echo "Building the Docker image..."
	docker-compose -f docker/docker-compose.yml build

# View container logs
logs:
	docker-compose -f docker/docker-compose.yml logs -f

# Clean up - stop container and remove images
clean:
	@echo "Cleaning up..."
	docker-compose -f docker/docker-compose.yml down --rmi all --volumes
	@echo "Cleanup complete."
