#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Aistos Debt Payment - Startup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
        echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi

    echo -e "${GREEN}✓ Docker is running${NC}"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start PostgreSQL database
start_database() {
    echo ""
    echo -e "${BLUE}📦 Starting PostgreSQL database...${NC}"
    
    # Check if container already exists and is running
    if docker ps | grep -q "aistos-postgres"; then
        echo -e "${YELLOW}⚠ Database container is already running${NC}"
        return 0
    fi

    # Check if port 5432 is in use by another container
    if check_port 5432; then
        echo -e "${YELLOW}⚠ Port 5432 is already in use${NC}"
        echo "Checking if it's our container..."
        if docker ps -a | grep -q "aistos-postgres"; then
            echo -e "${BLUE}Starting existing container...${NC}"
            docker start aistos-postgres
        else
            echo -e "${RED}❌ Port 5432 is in use by another service${NC}"
            echo "Please stop the service using port 5432 or modify docker-compose.yml"
            exit 1
        fi
    else
        # Start database with docker-compose
        docker-compose up -d postgres
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to start database${NC}"
            exit 1
        fi
    fi

    echo -e "${GREEN}✓ Database container started${NC}"
    
    # Wait for database to be ready
    echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec aistos-postgres pg_isready -U aistos_user -d aistos_debt >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Database is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    echo ""
    echo -e "${RED}❌ Database failed to become ready after ${max_attempts} seconds${NC}"
    echo "Check database logs with: docker-compose logs postgres"
    exit 1
}

# Function to setup Prisma
setup_prisma() {
    echo ""
    echo -e "${BLUE}🔧 Setting up Prisma...${NC}"
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠ .env file not found${NC}"
        if [ -f .env.example ]; then
            echo "Copying .env.example to .env..."
            cp .env.example .env
            echo -e "${YELLOW}⚠ Please update .env with your configuration${NC}"
        else
            echo -e "${RED}❌ .env.example not found. Please create .env file${NC}"
            exit 1
        fi
    fi
    
    # Generate Prisma client
    echo -e "${BLUE}Generating Prisma client...${NC}"
    if command_exists bun; then
        bun run prisma:generate
    elif command_exists npx; then
        export DATABASE_URL="postgresql://aistos_user:aistos_password@localhost:5432/aistos_debt?schema=public"
        npx prisma generate
    else
        echo -e "${RED}❌ Neither bun nor npx found. Please install Node.js${NC}"
        exit 1
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠ Prisma client generation had issues, but continuing...${NC}"
    else
        echo -e "${GREEN}✓ Prisma client generated${NC}"
    fi
    
    # Run migrations
    echo -e "${BLUE}Running database migrations...${NC}"
    if command_exists bun; then
        bun run prisma:migrate
    elif command_exists npx; then
        export DATABASE_URL="postgresql://aistos_user:aistos_password@localhost:5432/aistos_debt?schema=public"
        npx prisma migrate deploy
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database migrations completed${NC}"
    else
        echo -e "${YELLOW}⚠ Migration had issues, but continuing...${NC}"
    fi
}

# Function to start the application
start_application() {
    echo ""
    echo -e "${BLUE}🚀 Starting Next.js application...${NC}"
    
    # Check if port 3000 is in use
    if check_port 3000; then
        echo -e "${YELLOW}⚠ Port 3000 is already in use${NC}"
        read -p "Do you want to kill the process using port 3000? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:3000 | xargs kill -9 2>/dev/null
            echo -e "${GREEN}✓ Killed process on port 3000${NC}"
            sleep 2
        else
            echo -e "${YELLOW}⚠ Continuing with existing process on port 3000${NC}"
            return 0
        fi
    fi
    
    # Start the application
    if command_exists bun; then
        echo -e "${GREEN}Starting with Bun...${NC}"
        bun run dev
    elif command_exists npm; then
        echo -e "${GREEN}Starting with npm...${NC}"
        npm run dev
    else
        echo -e "${RED}❌ Neither bun nor npm found. Please install Node.js${NC}"
        exit 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    # Don't stop database by default, just the app
    echo -e "${BLUE}Database will continue running. Stop it with: docker-compose down${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Main execution
main() {
    # Check Docker
    check_docker
    
    # Start database
    start_database
    
    # Setup Prisma
    setup_prisma
    
    # Start application
    start_application
}

# Run main function
main

