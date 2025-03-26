#!/bin/bash

echo "Starting MySQL database container..."
docker compose up -d mysql

echo "Waiting for MySQL to be ready..."
while ! docker exec carpool-mysql mysqladmin --user=root --password="${DB_PASSWORD:-carpool_password}" ping --silent &> /dev/null ; do
  echo -n "."
  sleep 1
done

echo -e "\nMySQL is ready!"
echo "Database is running at localhost:${DB_PORT:-3306}"
echo "  - Database name: ${DB_NAME:-carpool_db}"
echo "  - Username: root"
echo "  - Password: ${DB_PASSWORD:-carpool_password}"
echo ""
echo "To stop the database, run: docker compose down"
