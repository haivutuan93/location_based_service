#!/bin/bash

set -e

echo "Starting Docker containers..."
docker compose up -d --build

echo "Waiting for the backend service to be ready..."
while [[ "$(docker compose ps -q backend | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null)" != "running" ]]; do
    sleep 1
done

echo "Backend container is running. Waiting a few seconds for the app to initialize..."
sleep 5

# Run database migrations
echo "Running database migrations..."
docker compose exec backend npm run migration:run

echo "Startup complete. Your services are now running."
