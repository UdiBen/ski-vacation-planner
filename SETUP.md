# 🚀 Setup Guide - Ski Vacation Planner

Quick setup guide to get the application running on your machine.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** version 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **OpenAI API Key** (Required - [Get one here](https://platform.openai.com/api-keys))
- **OpenWeather API Key** (Optional but recommended - [Get one here](https://openweathermap.org/api))

## Step-by-Step Setup

### 1. Install Dependencies

From the project root directory:

```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Backend server
- Frontend application

**Expected output:**
```
✓ Root dependencies installed
✓ Backend dependencies installed
✓ Frontend dependencies installed
```

### 2. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your API keys:

```env
# REQUIRED: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# OPTIONAL: Get from https://openweathermap.org/api
# Without this, weather features will be limited
OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# OPTIONAL: Server port (defaults to 3001)
PORT=3001
```

**Important Notes:**
- **OpenAI API Key is REQUIRED** - The application won't work without it
- OpenWeather API Key is optional but highly recommended for full functionality
- The free tier of OpenWeather API is sufficient for this project

### 3. Verify Configuration

Run a quick check to ensure everything is set up correctly:

```bash
# From the backend directory
cd backend
npm run build
```

This should compile TypeScript without errors.

### 4. Start the Application

From the **root directory**:

```bash
npm run dev
```

This single command starts both:
- **Backend API** on http://localhost:3001
- **Frontend** on http://localhost:3000

**You should see:**
```
🎿 Ski Vacation Planner API running on http://localhost:3001

📋 Available endpoints:
   GET  /health - Health check
   POST /api/chat - Send a message
   POST /api/conversations - Create new conversation
   GET  /api/conversations/:id - Get conversation history

⚙️  Configuration:
   OpenAI API: ✓ Configured
   Weather API: ✓ Configured

[Frontend]
  ➜  Local:   http://localhost:3000/
```

### 5. Test the Application

1. Open your browser to http://localhost:3000
2. You should see the Ski Vacation Planner chat interface
3. Try sending a message: "Hello!"

## Troubleshooting

### Issue: "OPENAI_API_KEY is required"

**Solution:**
- Verify your `.env` file exists in the `backend/` directory
- Check that `OPENAI_API_KEY` is spelled correctly
- Ensure there are no spaces around the `=` sign
- Make sure the API key starts with `sk-`

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

### Issue: Port already in use

**Solution:**
If port 3000 or 3001 is already in use:

**Option 1:** Kill the process using the port
```bash
# On macOS/Linux
lsof -ti:3001 | xargs kill
lsof -ti:3000 | xargs kill
```

**Option 2:** Change the ports
- Backend: Edit `backend/.env` and set `PORT=3002`
- Frontend: Edit `frontend/vite.config.ts` and change port to 3001

### Issue: Weather API not working

**Symptoms:**
- Weather queries return errors
- "Weather API error" messages

**Solution:**
- Verify your OpenWeather API key is correct
- Check if your API key is activated (can take a few minutes after signup)
- Free tier has a limit of 60 calls/minute - check if you've exceeded it
- The application will still work without weather API, but functionality is limited

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

Check the error messages and ensure all dependencies are installed.

### Issue: React app shows blank page

**Solution:**
1. Open browser console (F12) and check for errors
2. Verify backend is running on port 3001
3. Check CORS configuration if accessing from different origin
4. Clear browser cache and reload

## Running Individual Components

If you need to run backend and frontend separately:

### Backend Only
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

### Frontend Only
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

## Building for Production

### Build All
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

This will:
1. Compile TypeScript for backend
2. Build optimized React app
3. Start production server

## Testing the APIs Directly

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Send a Test Message
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best ski resorts in the Alps?"}'
```

## Development Tips

### Hot Reloading
Both backend and frontend support hot reloading:
- **Backend:** Uses `tsx watch` - saves to `.ts` files auto-restart
- **Frontend:** Uses Vite HMR - saves update instantly in browser

### Logging
Backend logs are printed to console:
- API calls
- Function executions
- Errors

### Browser DevTools
- Open React DevTools for component inspection
- Use Network tab to see API calls
- Console shows any frontend errors

## Next Steps

Once everything is running:

1. **Try the example queries** from README.md
2. **Test weather integration** with "What's the weather in Aspen?"
3. **Test currency conversion** with "Convert 1000 USD to EUR"
4. **Explore hallucination detection** by asking complex queries
5. **Test multi-turn conversations** with follow-up questions

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [sample-conversations.md](docs/sample-conversations.md) for examples
- Open an issue on GitHub if you encounter problems

---

**You're all set! Enjoy building with the Ski Vacation Planner! 🎿**
