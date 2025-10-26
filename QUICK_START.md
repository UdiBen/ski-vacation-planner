# Quick Start Guide

Get the Ski Vacation Planner running in 5 minutes!

## Prerequisites

✅ Node.js 18+ installed
✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 4 Simple Steps

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure API Keys
```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Start the Application
```bash
cd ..
npm run dev
```

### 4. Open Browser
Navigate to: http://localhost:3000

## First Query to Try

```
"What are the best ski resorts for beginners in the Alps?"
```

## Useful Commands

```bash
# Install everything
npm run install:all

# Start both backend and frontend (with colored labels!)
npm run dev

# Start backend only (port 3005)
npm run dev:backend

# Start frontend only (port 3000)
npm run dev:frontend

# Build for production
npm run build

# Clean all node_modules and build files
npm run clean

# Test API health
npm run test:api
```

## Troubleshooting

**"OPENAI_API_KEY is required"**
→ Make sure `backend/.env` exists with valid API key

**"Port already in use"**
→ Kill process: `lsof -ti:3005 | xargs kill`

**"Module not found"**
→ Reinstall: `rm -rf node_modules */node_modules && npm run install:all`

## What to Try

1. **Weather Query**: "What's the weather in Aspen?"
2. **Currency**: "Convert 1000 USD to Swiss Francs"
3. **Planning**: "Where should I go skiing in February?"
4. **Multi-turn**: Ask follow-up questions!

## Need More Help?

- Full docs: [README.md](README.md)
- Setup details: [SETUP.md](SETUP.md)
- Examples: [docs/sample-conversations.md](docs/sample-conversations.md)

---

Happy skiing! 🎿
