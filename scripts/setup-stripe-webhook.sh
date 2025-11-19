#!/bin/bash

# Script to set up Stripe webhook tunnel using Docker
# This script helps configure and start the Stripe webhook forwarding

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up Stripe Webhook Tunnel${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with your Stripe keys."
    exit 1
fi

# Load environment variables
source .env 2>/dev/null || true

# Check if STRIPE_SECRET_KEY is set
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}❌ Error: STRIPE_SECRET_KEY not found in .env${NC}"
    echo "Please add your Stripe secret key to .env file:"
    echo "STRIPE_SECRET_KEY=sk_test_..."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

# Check if Next.js app is running on port 3000
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Next.js app doesn't seem to be running on port 3000${NC}"
    echo "Please start the app with 'bun run dev' before starting the webhook tunnel."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo -e "${GREEN}✓ Stripe secret key found${NC}"
echo ""

# Stop existing stripe-cli container if running
if docker ps -a --format '{{.Names}}' | grep -q "^aistos-stripe-cli$"; then
    echo -e "${YELLOW}Stopping existing Stripe CLI container...${NC}"
    docker stop aistos-stripe-cli > /dev/null 2>&1 || true
    docker rm aistos-stripe-cli > /dev/null 2>&1 || true
fi

# Start the Stripe CLI container
echo -e "${BLUE}🚀 Starting Stripe webhook tunnel...${NC}"
docker-compose up -d stripe-cli

# Wait a moment for the container to start
sleep 2

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^aistos-stripe-cli$"; then
    echo -e "${GREEN}✓ Stripe webhook tunnel is running${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo ""
    echo "1. The webhook tunnel is now forwarding Stripe events to:"
    echo "   http://localhost:3000/api/webhooks/stripe"
    echo ""
    echo "2. Get your webhook signing secret from the logs:"
    echo -e "   ${YELLOW}docker logs aistos-stripe-cli${NC}"
    echo ""
    echo "3. Look for a line like:"
    echo "   > Ready! Your webhook signing secret is whsec_..."
    echo ""
    echo "4. Add the webhook secret to your .env file:"
    echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
    echo "5. Restart your Next.js app to load the new webhook secret"
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "To view webhook events in real-time:"
    echo -e "   ${YELLOW}docker logs -f aistos-stripe-cli${NC}"
else
    echo -e "${RED}❌ Error: Failed to start Stripe CLI container${NC}"
    echo "Check the logs with: docker logs aistos-stripe-cli"
    exit 1
fi

