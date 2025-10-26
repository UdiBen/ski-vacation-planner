#!/bin/bash

# Ski Vacation Planner - Setup Verification Script
# This script verifies that the project is set up correctly

echo "🎿 Ski Vacation Planner - Setup Verification"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
echo -n "Checking npm version... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check for root node_modules
echo -n "Checking root dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo "  Run: npm install"
fi

# Check for backend node_modules
echo -n "Checking backend dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo "  Run: cd backend && npm install"
fi

# Check for frontend node_modules
echo -n "Checking frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo "  Run: cd frontend && npm install"
fi

# Check for backend .env file
echo -n "Checking backend .env file... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Exists"

    # Check for OPENAI_API_KEY
    echo -n "Checking OPENAI_API_KEY... "
    if grep -q "OPENAI_API_KEY=sk-" backend/.env; then
        echo -e "${GREEN}✓${NC} Configured"
    else
        echo -e "${RED}✗ Not configured${NC}"
        echo "  Add your OpenAI API key to backend/.env"
    fi
else
    echo -e "${RED}✗ Not found${NC}"
    echo "  Copy backend/.env.example to backend/.env and configure API key"
fi

# Try to compile TypeScript
echo ""
echo "Verifying TypeScript compilation..."
echo -n "Building backend... "
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Success"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  There may be TypeScript errors in the backend"
fi
cd ..

echo -n "Building frontend... "
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Success"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  There may be TypeScript errors in the frontend"
fi
cd ..

# Summary
echo ""
echo "=============================================="
echo "Summary:"
echo ""

ALL_DEPS_INSTALLED=true
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    ALL_DEPS_INSTALLED=false
fi

ENV_CONFIGURED=true
if [ ! -f "backend/.env" ] || ! grep -q "OPENAI_API_KEY=sk-" backend/.env; then
    ENV_CONFIGURED=false
fi

if [ "$ALL_DEPS_INSTALLED" = true ] && [ "$ENV_CONFIGURED" = true ]; then
    echo -e "${GREEN}✓ Project is ready!${NC}"
    echo ""
    echo "To start the application, run:"
    echo "  npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
else
    echo -e "${YELLOW}⚠ Setup incomplete${NC}"
    echo ""
    if [ "$ALL_DEPS_INSTALLED" = false ]; then
        echo "To install all dependencies, run:"
        echo "  npm run install:all"
        echo ""
    fi
    if [ "$ENV_CONFIGURED" = false ]; then
        echo "To configure API keys:"
        echo "  1. Copy backend/.env.example to backend/.env"
        echo "  2. Add your OPENAI_API_KEY (required)"
        echo ""
    fi
fi

echo "For detailed setup instructions, see SETUP.md"
echo "For quick start guide, see QUICK_START.md"
