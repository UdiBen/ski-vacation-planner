# 🎿 Ski Vacation Planner - Intelligent AI Assistant

An advanced conversational AI assistant that helps users plan their perfect ski vacation using GPT-5, real-time weather data, and currency conversion APIs. Built for an academic assignment demonstrating prompt engineering, API integration, and hallucination management.

![Tech Stack](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![GPT-5](https://img.shields.io/badge/GPT--4-412991?style=flat&logo=openai&logoColor=white)

## 🌟 Features

### Core Functionality

- **Intelligent Conversational AI**: Multi-turn conversations with OpenAI-managed state
- **Function Calling**: Automatic API routing based on user queries
- **Real-time Weather Data**: Live ski conditions from Open-Meteo API
- **Currency Conversion**: Up-to-date exchange rates for travel planning
- **Hallucination Detection**: 2-layer approach (heuristics + LLM judge)
- **Reasoning Extraction**: Model's thought process logged to console in real-time

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
│   Express Backend (Port 3005)       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  LLM Service (Responses API)  │  │
│  │  - GPT-5 Integration          │  │
│  │  - Function Calling           │  │
│  │  - Reasoning Extraction       │  │
│  │  (State managed by OpenAI)    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Hallucination Detection      │  │
│  │  - Heuristic Analysis (40%)   │  │
│  │  - LLM Judge (60%)            │  │
│  └──────────────────────────────┘  │
│                                     │
└───┬─────────────────────────────┬───┘
    │                             │
┌───▼─────────┐         ┌─────────▼───┐
│ Open-Meteo │         │  Exchange   │
│     API     │         │   Rate API  │
└─────────────┘         └─────────────┘
         │                      │
         └──────────┬───────────┘
                    │
            ┌───────▼────────┐
            │  OpenAI        │
            │  Responses API │
            │  (Manages      │
            │   conversation │
            │   state)       │
            └────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (required)

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
# Edit .env and add your API key:
# OPENAI_API_KEY=your_openai_key_here
cd ..
```

4. **Verify setup (optional but recommended)**

```bash
./verify-setup.sh
```

This script checks that all dependencies are installed and API keys are configured.

5. **Start the application**

```bash
npm run dev
```

This will start:

- Backend API on http://localhost:3005
- Frontend on http://localhost:3000

### Getting API Keys

**OpenAI (Required):**

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `backend/.env` as `OPENAI_API_KEY`

**Weather Data:**

- The app uses Open-Meteo API which is free and requires no API key
- Documentation: https://open-meteo.com/

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

**Two-Layer Approach:**

**Layer 1: Heuristic Detection (Fast, Rule-Based)**

- Checks for specific numbers without API calls
- Detects weather/currency data without source verification
- Identifies uncertain language patterns ("probably", "might be")
- Flags overly precise data without sources
- Provides 40% weight in final assessment

**Layer 2: LLM as Judge (Comprehensive Analysis)**

- Uses GPT-5-mini to evaluate responses for hallucinations
- Checks logical consistency and contradictions
- Validates that data sources match claimed information
- Detects fabricated vs. uncertain language
- Structured JSON output with confidence scores
- Provides 60% weight in final assessment
- Actionable suggestions (none/warn/block)

**Combined Decision:**

- Both layers run for every response
- Results weighted and combined (40% heuristic, 60% LLM judge)
- Takes most severe action recommended by either layer
- Real-time reasoning process logged to backend console

**User Experience:**

- Yellow warning badges for suspected hallucinations
- Data source indicators (Weather/Currency badges)
- Confidence scores
- Explicit "verify important details" messaging

### 5. Context Management (OpenAI Responses API)

The system uses OpenAI's Responses API for server-side conversation state management:

- Conversation history maintained by OpenAI via `previous_response_id`
- No need for local message storage
- Efficient state tracking across multiple turns
- Seamless context continuity

**How it works:**
```typescript
// First message
const response1 = await openai.responses.create({
  input: "I'm a beginner looking for ski resorts",
  store: true
});
// OpenAI stores: response1.id

// Follow-up message
const response2 = await openai.responses.create({
  input: "What about the weather there?",
  previous_response_id: response1.id  // OpenAI knows full context
});
// OpenAI automatically maintains conversation state
```

This enables natural follow-up questions:

```
User: "I'm a beginner looking for ski resorts"
Assistant: [recommends beginner-friendly resorts]
User: "What about the weather there?"
Assistant: [knows "there" refers to previously mentioned resort]
```

## 🎯 Three Query Types Demonstrated

1. **Weather Queries** → Open-Meteo API
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
│   │   │   ├── llm.service.ts          # GPT-5 Responses API integration
│   │   │   ├── weather.service.ts      # Weather API wrapper
│   │   │   ├── currency.service.ts     # Currency API wrapper
│   │   │   └── hallucination.service.ts# 2-layer detection logic
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
- GPT-5o via OpenAI API
- React chat interface (better than CLI)
- Express backend

### ✅ External Data Integration

- Open-Meteo API for weather data
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
PORT=3005                      # Optional, defaults to 3005
```

### Customization

**Adjust LLM behavior** in `backend/src/services/llm.service.ts`:

- Model selection (gpt-5, gpt-5-mini, etc.)
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

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT-5 API
- Open-Meteo for weather data API
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
