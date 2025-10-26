# Getting Started with Ski Vacation Planner

## Welcome! 🎿

This guide will help you get the Ski Vacation Planner up and running in just a few minutes.

## What You'll Need

### Required
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
  - Cost: ~$0.01-$0.05 per conversation with GPT-4

### Optional (but recommended)
- **OpenWeather API Key** - [Get one here](https://openweathermap.org/api)
  - Free tier: 60 calls/minute, sufficient for this project

## Installation Steps

### 1. Install Dependencies

From the project root, run:

```bash
npm run install:all
```

This single command installs all dependencies for:
- Root project
- Backend server
- Frontend application

**Expected time:** 2-3 minutes

### 2. Configure API Keys

Create the environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your favorite text editor and add:

```env
# REQUIRED
OPENAI_API_KEY=sk-proj-your-actual-key-here

# OPTIONAL (but recommended for full functionality)
OPENWEATHER_API_KEY=your-weather-key-here

# OPTIONAL (defaults to 3005)
PORT=3005
```

**Important:**
- Your OpenAI API key should start with `sk-`
- Don't share your `.env` file or commit it to git (it's already in .gitignore)

### 3. Verify Setup

Run the verification script to check everything is configured:

```bash
cd ..
./verify-setup.sh
```

This will check:
- ✓ Node.js and npm versions
- ✓ All dependencies installed
- ✓ Environment variables configured
- ✓ TypeScript compilation works

### 4. Start the Application

From the project root:

```bash
npm run dev
```

You should see colored output like:

```
[BACKEND] 🎿 Ski Vacation Planner API running on http://localhost:3005
[FRONTEND] ➜  Local:   http://localhost:3000/
```

### 5. Open Your Browser

Navigate to: **http://localhost:3000**

You should see the Ski Vacation Planner chat interface!

## First Steps

### Try These Example Queries

**Basic Question:**
```
What are the best ski resorts for beginners in Europe?
```

**Weather Query (uses OpenWeather API):**
```
What's the weather like in Aspen right now?
```

**Currency Query (uses Exchange Rate API):**
```
Convert 1000 USD to Swiss Francs
```

**Complex Planning:**
```
I'm an intermediate skier with a $3000 budget. Where should I go skiing in February?
```

**Follow-up Question (tests context awareness):**
```
What about the weather there?
```

## Available Commands

```bash
# Start both backend and frontend (with colored output)
npm run dev

# Start backend only (port 3005)
npm run dev:backend

# Start frontend only (port 3000)
npm run dev:frontend

# Build for production
npm run build

# Clean everything (node_modules, builds)
npm run clean

# Test backend health
npm run test:api

# Verify setup
./verify-setup.sh
```

## How It Works

### Architecture Overview

```
Your Browser (localhost:3000)
         ↓
   React Frontend
         ↓ (HTTP REST)
   Express Backend (localhost:3005)
         ↓
   ┌─────┴─────┐
   ↓           ↓
OpenAI      External APIs
GPT-4       (Weather, Currency)
```

### The Magic: Function Calling

The assistant uses **GPT-4's function calling** to automatically decide when to use external APIs:

1. You ask: "What's the weather in Aspen?"
2. GPT-4 thinks: "I need real-time weather data"
3. GPT-4 calls: `get_weather("Aspen")`
4. Backend executes the OpenWeather API call
5. GPT-4 receives data and formats a natural response
6. You see: "The weather in Aspen is currently -2°C with light snow..."

**No manual intent classification needed!** The LLM decides intelligently.

## Features to Explore

### 1. Real-time Data Integration
Look for the badges:
- 🌨️ **Live Weather** - Data from OpenWeather API
- 💰 **Currency Data** - Real exchange rates

### 2. Hallucination Detection
If the assistant might be making things up, you'll see:
- ⚠️ **Warning badge** with confidence score
- Recommendation to verify important details

### 3. Context Awareness
The assistant remembers:
- Your ski skill level
- Budget mentions
- Previously discussed resorts
- Travel dates

Try asking follow-up questions!

### 4. Chain-of-Thought Reasoning
For complex queries, the assistant shows its reasoning process.

## Troubleshooting

### Backend won't start

**Error:** "OPENAI_API_KEY is required"
- Check that `backend/.env` exists
- Verify the API key is correct and starts with `sk-`
- No spaces around the `=` sign

### Weather queries return errors

- Verify your OpenWeather API key
- Check if the key is activated (can take a few minutes after signup)
- The app works without weather API, but with limited functionality

### Port already in use

**Error:** "Port 3005 is already in use"

```bash
# On macOS/Linux
lsof -ti:3005 | xargs kill
lsof -ti:3000 | xargs kill
```

Or change the ports in configuration files.

### TypeScript errors

```bash
npm run build
```

Check the error messages. If it's dependency related:

```bash
npm run clean
npm run install:all
```

## Development Tips

### Hot Reloading
Both backend and frontend auto-reload on file changes:
- **Backend:** Uses `tsx watch` - save TypeScript files to restart
- **Frontend:** Uses Vite HMR - see changes instantly

### Viewing Logs
- **Backend logs:** Shown in terminal with blue `[BACKEND]` prefix
- **Frontend logs:** Shown in terminal with magenta `[FRONTEND]` prefix
- **Browser console:** F12 to see frontend errors/warnings

### Testing the API Directly

```bash
# Health check
curl http://localhost:3005/health

# Send a message
curl -X POST http://localhost:3005/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best ski resorts in the Alps?"}'
```

## What Makes This Special?

This isn't just a chatbot - it's a demonstration of:

✨ **Advanced Prompt Engineering**
- System prompts that guide LLM behavior
- Anti-hallucination directives
- Chain-of-thought reasoning

🎯 **Smart API Integration**
- LLM decides when to use APIs (function calling)
- Seamless data fusion
- Real-time external data

🛡️ **Hallucination Detection**
- 3-layer detection system
- Visual warnings for users
- Confidence scoring

🧠 **Context Management**
- Multi-turn conversations
- Preference tracking
- Natural follow-up questions

## Next Steps

1. **Explore the code:**
   - `backend/src/services/llm.service.ts` - Function calling logic
   - `backend/src/utils/prompts.ts` - Prompt engineering
   - `backend/src/services/hallucination.service.ts` - Detection logic

2. **Read the documentation:**
   - [README.md](README.md) - Complete documentation
   - [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Academic context
   - [docs/sample-conversations.md](docs/sample-conversations.md) - Examples

3. **Customize it:**
   - Modify prompts to change assistant behavior
   - Add new APIs (flights, hotels, etc.)
   - Adjust hallucination detection sensitivity

4. **Submit your assignment:**
   - Take screenshots of conversations
   - Document interesting findings
   - Highlight the hallucination detection in action

## Need Help?

- **Setup issues:** See [SETUP.md](SETUP.md) for detailed troubleshooting
- **Quick reference:** See [QUICK_START.md](QUICK_START.md)
- **Examples:** See [docs/sample-conversations.md](docs/sample-conversations.md)

## Have Fun! 🎿

Enjoy exploring the intersection of LLMs, prompt engineering, and real-world API integration!

---

**Built for AI & LLM Systems Course Assignment**
