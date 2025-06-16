#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Initialize flag variable
CHECK_BRANCH=true

# Parse command line arguments
while getopts "cb" opt; do
  case $opt in
    c)
      CHECK_BRANCH=false
      ;;
    b)
      CHECK_BRANCH=false
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Starting development environment...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 GO MAKE A .env. NOWWWWW!!!${NC}"
    touch .env
    echo -e "${BLUE}📝 .env created. Please add your environment variables.${NC}"
    exit 1
fi

if [ ! -f .env.local ]; then
    echo -e "${BLUE}📝 GO MAKE A .env.local. NOWWWWW!!!${NC}"
    touch .env.local
    echo -e "${BLUE}📝 .env.local created. Please add your environment variables.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    bun install
fi

# git pull
echo -e "${BLUE}🔄 Pulling latest changes...${NC}"
git pull

# Get current branch
branch=$(git symbolic-ref --short HEAD)

# Only check branch if CHECK_BRANCH is true
if [ "$CHECK_BRANCH" = true ]; then
    echo -e "${BLUE}🔄 Please confirm you're on the right branch...${NC}"
    read -p "(Y/n) " answer
    answer=${answer:-Y}  # Set default to Y if empty

    if [ "$answer" != "Y" ] && [ "$answer" != "y" ]; then
        echo -e "${RED}❌ Error: GO TO RIGHT BRANCH${NC}"
        exit 1
    fi
fi

# if branch == main, then confirm with read -p "Are you sure you want to continue? (y/n)" answer
if [ "$branch" == "main" ]; then
    echo -e "${BLUE}🔄 Are you sure you want to edit main? (y/n)${NC}"
    read -p "(Y/n) " answer
    answer=${answer:-Y}  # Set default to Y if empty

    if [ "$answer" != "Y" ] && [ "$answer" != "y" ]; then
        echo -e "${RED}❌ Error: GO TO RIGHT BRANCH${NC}"
        exit 1
    fi
fi

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
if ! bunx prisma generate; then
    echo -e "${BLUE}🔄 Falling back to bun prisma generate...${NC}"
    bun prisma generate
fi

# Start the development server
echo -e "${GREEN}✨ Starting development server...${NC}"
bun run dev 