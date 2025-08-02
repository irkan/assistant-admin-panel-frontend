#!/bin/bash

# Frontend Production Deployment Script
set -e

echo "🚀 Starting frontend production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists (optional for frontend)
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production file not found${NC}"
    echo "Creating default environment file..."
    cat > .env.production << EOF
# Frontend Environment Variables
NODE_ENV=production
VITE_API_URL=http://localhost:3004
EOF
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production build

# Start the application
echo -e "${YELLOW}🚀 Starting application...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check if services are running
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Test health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
sleep 3
if curl -f http://localhost:3004/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running successfully!${NC}"
    echo -e "${GREEN}🌐 Access your frontend at: http://localhost:3004${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production logs frontend
    exit 1
fi

echo -e "${GREEN}🎉 Frontend deployment completed successfully!${NC}" 