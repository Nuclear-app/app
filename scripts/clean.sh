#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleaning up project...${NC}"

# Remove build artifacts
echo -e "${BLUE}🗑️  Removing build artifacts...${NC}"
rm -rf .next
rm -rf out
rm -rf dist

# Remove dependencies
echo -e "${BLUE}🗑️  Removing dependencies...${NC}"
rm -rf node_modules

# Remove Prisma generated files
echo -e "${BLUE}🗑️  Removing Prisma generated files...${NC}"
rm -rf prisma/generated

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo -e "${BLUE}To reinstall dependencies and start development, run:${NC}"
echo -e "${GREEN}./scripts/dev.sh${NC}" 