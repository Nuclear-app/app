#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Starting production build...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${BLUE}📝 Please create a .env file with your production environment variables${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
bun install --production

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
bunx prisma generate

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
bun run build

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${BLUE}To start the production server, run:${NC}"
echo -e "${GREEN}./scripts/start.sh${NC}" 