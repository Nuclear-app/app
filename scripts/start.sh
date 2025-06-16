#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting production server...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${BLUE}📝 Please create a .env file with your production environment variables${NC}"
    exit 1
fi

# Check if build exists
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Error: Build not found${NC}"
    echo -e "${BLUE}📝 Please run the build script first:${NC}"
    echo -e "${GREEN}./scripts/build.sh${NC}"
    exit 1
fi

# Start the production server
echo -e "${GREEN}✨ Starting production server...${NC}"
bun run start 