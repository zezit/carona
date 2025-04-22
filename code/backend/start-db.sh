#!/bin/bash

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start all services by default
echo -e "${BLUE}Starting MySQL and RabbitMQ containers...${NC}"
docker compose up -d

echo -e "${BLUE}Waiting for MySQL to be ready...${NC}"
while ! docker exec "carpool-mysql" "mysqladmin" --user=root --password="${DB_PASSWORD:-carpool_password}" ping --silent &> /dev/null ; do
  echo -n "."
  sleep 1
done

echo -e "\n${GREEN}MySQL is ready!${NC}"
echo -e "${BLUE}Database is running at localhost:${DB_PORT:-3306}${NC}"
echo "  - Database name: ${DB_NAME:-carpool_db}"
echo "  - Username: root"
echo "  - Password: ${DB_PASSWORD:-carpool_password}"

echo -e "\n${BLUE}Checking RabbitMQ status...${NC}"
while ! docker exec "carpool-rabbitmq" "rabbitmq-diagnostics" -q ping &> /dev/null ; do
  echo -n "."
  sleep 1
done

echo -e "\n${GREEN}RabbitMQ is ready!${NC}"
echo -e "${BLUE}RabbitMQ is running at localhost:${RABBITMQ_PORT:-5672}${NC}"
echo -e "${BLUE}RabbitMQ Management UI is available at http://localhost:${RABBITMQ_MANAGEMENT_PORT:-15672}${NC}"
echo "  - Username: ${RABBITMQ_USER:-guest}"
echo "  - Password: ${RABBITMQ_PASSWORD:-guest}"
echo ""
echo -e "${BLUE}To stop all services, run:${NC} docker compose down"
echo -e "${BLUE}To stop a specific service, run:${NC} docker compose stop [mysql|rabbitmq]"
