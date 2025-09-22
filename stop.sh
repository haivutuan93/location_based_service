#!/bin/bash

set -e

echo "Stopping Docker containers..."
docker-compose down

echo "Services stopped."
echo "Note: Database data is preserved in a Docker volume. To remove all data, run 'docker-compose down -v'."
