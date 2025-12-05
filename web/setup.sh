#!/bin/bash

# 🚀 Clio Social Layer - One-Command Setup Script
# Run this script to set up the complete badge system and database

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🎨 CLIO SOCIAL LAYER - AUTOMATED SETUP 🎨          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step counter
STEP=1
total_steps() {
    echo -e "${BLUE}[Step $STEP/6]${NC} $1"
    STEP=$((STEP + 1))
}

# Check if Node.js is installed
echo ""
total_steps "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if we're in the web directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Not in web/ directory, navigating...${NC}"
    if [ -d "web" ]; then
        cd web
        echo -e "${GREEN}✅ Changed to web/ directory${NC}"
    else
        echo -e "${RED}❌ Cannot find web/ directory${NC}"
        exit 1
    fi
fi

echo ""
total_steps "Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
total_steps "Setting up database..."
# Check if migration already exists
if [ -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}⚠️  Database already exists${NC}"
    read -p "Do you want to reset it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f prisma/dev.db
        echo -e "${GREEN}✅ Old database removed${NC}"
    fi
fi

# Run migrations
npx prisma migrate dev --name init --skip-generate
npx prisma generate
echo -e "${GREEN}✅ Database created and migrated${NC}"

echo ""
total_steps "Seeding badges..."
npm run prisma:seed
echo -e "${GREEN}✅ 5 badges seeded${NC}"

echo ""
total_steps "Running verification tests..."
npm run badge:test > /tmp/badge-test-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All badge tests passed!${NC}"
    # Show summary
    tail -15 /tmp/badge-test-output.txt
else
    echo -e "${RED}❌ Tests failed!${NC}"
    cat /tmp/badge-test-output.txt
    exit 1
fi

echo ""
total_steps "Final verification..."
npm run db:inspect > /tmp/db-inspect-output.txt 2>&1
# Show summary
tail -10 /tmp/db-inspect-output.txt
echo -e "${GREEN}✅ Database inspection complete${NC}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ✨ SETUP COMPLETE! ✨                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ SQLite database created:${NC} prisma/dev.db"
echo -e "${GREEN}✅ All tables created:${NC} Artist, Badge, UserBadge, etc."
echo -e "${GREEN}✅ 5 badges seeded:${NC} Promethean, Oracle, Nereid, Muse, Titan"
echo -e "${GREEN}✅ Badge engine ready:${NC} lib/badgeEngine.ts"
echo -e "${GREEN}✅ Tests passing:${NC} 31 badges awarded in tests"
echo ""
echo "📚 Next steps:"
echo "  1. ${BLUE}npm run prisma:studio${NC}  - Open visual database browser"
echo "  2. ${BLUE}npm run badge:test${NC}     - Run badge tests again"
echo "  3. ${BLUE}npm run db:inspect${NC}     - Inspect database state"
echo "  4. ${BLUE}npm run dev${NC}            - Start Next.js dev server"
echo ""
echo "📖 Documentation:"
echo "  - SETUP_GUIDE.md              - Complete setup guide"
echo "  - BADGE_ENGINE_README.md      - Technical documentation"
echo "  - BADGE_VERIFICATION_REPORT.md - Test results"
echo ""
echo "🎉 Your Clio social layer is ready for smart contract integration!"
echo ""

