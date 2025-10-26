# 🎿 Ski Vacation Planner - Intelligent AI Assistant

An advanced conversational AI assistant that helps users plan their perfect ski vacation using GPT-4, real-time weather data, and currency conversion APIs. Built for an academic assignment demonstrating prompt engineering, API integration, and hallucination management.

![Tech Stack](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![GPT-4](https://img.shields.io/badge/GPT--4-412991?style=flat&logo=openai&logoColor=white)

## 🌟 Features

### Core Functionality
- **Intelligent Conversational AI**: Multi-turn conversations with context awareness
- **Function Calling**: Automatic API routing based on user queries
- **Real-time Weather Data**: Live ski conditions from OpenWeather API
- **Currency Conversion**: Up-to-date exchange rates for travel planning
- **Hallucination Detection**: Multi-layered approach to detect and warn about unreliable information
- **Chain-of-Thought Reasoning**: Step-by-step analysis for complex queries

### Technical Highlights
- **Advanced Prompt Engineering**: Carefully crafted system prompts to guide LLM behavior
- **Context Management**: Tracks user preferences, locations, and conversation history
- **Beautiful Chat UI**: Modern React interface with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Robust error management and fallback mechanisms

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     React Frontend (Port 3000)      │
│  - Chat Interface                   │
│  - Message Display                  │
│  - Warning System                   │
└─────────────┬───────────────────────┘
              │ HTTP/REST
┌─────────────▼───────────────────────┐
│   Express Backend (Port 3001)       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Conversation Manager         │  │
│  │  - Context Tracking           │  │
│  │  - History Management         │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  LLM Service (Function Call)  │  │
│  │  - GPT-4 Integration          │  │
│  │  - Tool Routing               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Hallucination Detection      │  │
│  │  - Heuristic Analysis         │  │
│  │  - LLM Verification           │  │
│  └──────────────────────────────┘  │
│                                     │
└───┬─────────────────────────────┬───┘
    │                             │
┌───▼─────────┐         ┌─────────▼───┐
│ OpenWeather │         │  Exchange   │
│     API     │         │   Rate API  │
└─────────────┘         └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (required)
- OpenWeather API key (optional but recommended)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ski-vacation-planner
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=your_openai_key_here
# OPENWEATHER_API_KEY=your_openweather_key_here (optional)
cd ..
```

4. **Start the application**
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

### Getting API Keys

**OpenAI (Required):**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `backend/.env` as `OPENAI_API_KEY`

**OpenWeather (Optional but recommended):**
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key
4. Add to `backend/.env` as `OPENWEATHER_API_KEY`

## 📖 How It Works

### 1. Function Calling (API Integration Decision Logic)

The assistant uses OpenAI's function calling feature to automatically decide when to use external APIs:

```typescript
// The LLM is given tool definitions
const tools = [
  {
    name: "get_weather",
    description: "Get current weather and forecast for a ski resort",
    parameters: { location: string, units?: string }
  },
  {
    name: "convert_currency",
    description: "Convert currency for travel budgeting",
    parameters: { from: string, to: string, amount?: number }
  }
];

// User asks: "What's the weather in Aspen?"
// LLM decides: "I need to call get_weather with location='Aspen'"
// Backend executes actual API call
// LLM receives data and formats natural response
```

**Decision Logic Flow:**
1. User sends query
2. LLM analyzes query with available tools
3. If external data needed → LLM requests function call
4. Backend executes real API call
5. Data returned to LLM
6. LLM synthesizes natural language response with data

### 2. Advanced Prompt Engineering

**System Prompt Strategy:**
- Clear role definition
- Explicit instructions for when to use functions
- Anti-hallucination directives
- Chain-of-thought guidance
- Citation requirements

Key techniques:
- **Instruction Hierarchies**: Critical rules emphasized with IMPORTANT tags
- **Few-shot Examples**: Implicit learning through prompt structure
- **Constraint Setting**: Temperature tuning and explicit boundaries
- **Output Formatting**: Structured responses with markdown

### 3. Multi-Step Reasoning (Chain-of-Thought)

For complex queries, the assistant uses structured reasoning:

```
User: "Should I visit the Alps in March on a $2000 budget?"

Assistant's internal process:
1. Identify requirements: Budget, timing, location
2. Check weather conditions in Alps for March
3. Consider typical costs
4. Evaluate skill level (from context)
5. Synthesize recommendation
```

### 4. Hallucination Detection & Management

**Three-Layer Approach:**

**Layer 1: Heuristic Detection (Fast)**
- Checks for specific numbers without API calls
- Detects weather/currency data without source verification
- Identifies uncertain language patterns
- Flags overly precise data

**Layer 2: Function Call Verification**
- Compares response content with API call results
- Ensures cited data matches retrieved data
- Validates consistency

**Layer 3: LLM-based Analysis (Deep)**
- Uses GPT-3.5 to analyze borderline cases
- Structured JSON output with confidence scores
- Provides actionable suggestions (warn/block/verify)

**User Experience:**
- Yellow warning badges for suspected hallucinations
- Data source indicators (Weather/Currency badges)
- Confidence scores
- Explicit "verify important details" messaging

### 5. Context Management

The system tracks conversation context:
- User's ski skill level (beginner/intermediate/advanced)
- Budget mentions
- Travel dates
- Previously mentioned resorts and countries
- Conversation history (last 10 messages)

This enables natural follow-up questions:
```
User: "I'm a beginner looking for ski resorts"
Assistant: [recommends beginner-friendly resorts]
User: "What about the weather there?"
Assistant: [knows "there" refers to previously mentioned resort]
```

## 🎯 Three Query Types Demonstrated

1. **Weather Queries** → OpenWeather API
   - "What's the weather in Chamonix?"
   - "Show me the snow forecast for Aspen"

2. **Currency Queries** → Exchange Rate API
   - "Convert 1000 USD to Swiss Francs"
   - "How much is a 2000 Euro budget in dollars?"

3. **Planning Recommendations** → LLM + APIs Combined
   - "Best ski resorts for beginners in Europe?"
   - "Where should I ski in February with good snow?"

## 📁 Project Structure

```
ski-vacation-planner/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── chat.controller.ts      # API endpoints
│   │   ├── services/
│   │   │   ├── llm.service.ts          # GPT-4 integration
│   │   │   ├── weather.service.ts      # Weather API wrapper
│   │   │   ├── currency.service.ts     # Currency API wrapper
│   │   │   ├── conversation.service.ts # Context management
│   │   │   └── hallucination.service.ts# Detection logic
│   │   ├── models/
│   │   ├── utils/
│   │   │   └── prompts.ts              # Prompt templates
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   └── index.ts                    # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   ├── ChatContainer.tsx   # Main chat UI
│   │   │   │   ├── MessageList.tsx     # Message display
│   │   │   │   ├── Message.tsx         # Individual message
│   │   │   │   └── InputBox.tsx        # User input
│   │   │   └── UI/
│   │   │       └── Button.tsx          # Reusable button
│   │   ├── hooks/
│   │   │   └── useChat.ts              # Chat logic
│   │   ├── services/
│   │   │   └── api.ts                  # Backend API client
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── tsconfig.json
├── package.json                         # Root package with scripts
└── README.md
```

## 🧪 Testing Examples

Try these queries to see different features:

### Basic Queries
```
"What are the best ski resorts for beginners?"
"Tell me about Whistler Blackcomb"
"What's the difference between Aspen and Vail?"
```

### Weather API Integration
```
"What's the weather in Chamonix right now?"
"Show me the snow forecast for Zermatt"
"Is it snowing in Aspen?"
```

### Currency API Integration
```
"Convert 1000 USD to Swiss Francs"
"How much is 500 EUR in Canadian dollars?"
"What's the exchange rate between GBP and NOK?"
```

### Complex Multi-Step Queries
```
"I'm an intermediate skier with a $3000 budget. Where should I go in March?"
"Compare the weather in Aspen vs Vail for next week"
"What's the best value ski destination in Europe?"
```

### Context Follow-ups
```
User: "Tell me about Chamonix"
Assistant: [provides information]
User: "What about the weather there?"
Assistant: [understands "there" = Chamonix, calls weather API]
User: "How much would 1000 euros be in the local currency?"
Assistant: [knows context is France, converts EUR to EUR]
```

## 🎓 Assignment Requirements Coverage

### ✅ Conversation-Oriented Design
- Handles 3+ types of queries (weather, currency, planning)
- Multi-turn conversation with context tracking
- Natural, helpful interaction flow

### ✅ Advanced Prompt Engineering
- Thoughtful system prompts in `utils/prompts.ts`
- Chain-of-thought implementation for complex queries
- Control strategies to reduce hallucinations

### ✅ Technical Implementation
- TypeScript for type safety
- GPT-4 Turbo via OpenAI API
- React chat interface (better than CLI)
- Express backend

### ✅ External Data Integration
- OpenWeather API for weather data
- Exchange Rate API for currency
- Clear decision logic via function calling
- Data fusion in responses

### ✅ Hallucination Detection & Management
- Heuristic analysis
- LLM-based verification
- User warnings and data source indicators
- Confidence scoring

## 🛠️ Development Scripts

```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend concurrently
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```
OPENAI_API_KEY=sk-...          # Required
OPENWEATHER_API_KEY=...        # Optional
PORT=3001                      # Optional, defaults to 3001
```

### Customization

**Adjust LLM behavior** in `backend/src/services/llm.service.ts`:
- Model selection (gpt-4-turbo-preview, gpt-3.5-turbo, etc.)
- Temperature (0.7 default)
- Token limits

**Modify prompts** in `backend/src/utils/prompts.ts`:
- System prompt for different behavior
- Hallucination detection sensitivity

**Tweak hallucination detection** in `backend/src/services/hallucination.service.ts`:
- Heuristic thresholds
- Detection patterns

## 📊 Evaluation Criteria Demonstration

### 1. Conversation Quality
- Natural language understanding
- Context awareness across turns
- Helpful, accurate responses
- Engaging personality

### 2. Hallucination Handling
- Multi-layer detection system
- User warnings when confidence is low
- Data source transparency
- Graceful degradation

### 3. Context Management
- Tracks user preferences
- Remembers previous topics
- Handles follow-up questions
- Maintains conversation state

### 4. External Data Integration
- Seamless API integration
- Real-time data fusion
- Accurate attribution
- Error handling

## 🤝 Contributing

This is an academic project. Contributions welcome for educational purposes.

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- OpenWeather for weather data API
- Exchange Rate API for currency data
- Course instructors for the assignment specification

## 📸 Sample Conversation Transcripts

See `docs/sample-conversations.md` for example interactions demonstrating:
- Weather queries with API integration
- Currency conversions
- Multi-turn planning conversations
- Hallucination detection in action
- Context-aware follow-ups

---

**Built with ❤️ for AI & LLM Systems Course**

For questions or issues, please open a GitHub issue.
