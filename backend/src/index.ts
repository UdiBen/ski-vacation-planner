import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatController } from './controllers/chat.controller';
import { LLMService } from './services/llm.service';
import { WeatherService } from './services/weather.service';
import { CurrencyService } from './services/currency.service';
import { ConversationService } from './services/conversation.service';
import { HallucinationDetectionService } from './services/hallucination.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const weatherService = new WeatherService();
const currencyService = new CurrencyService();
const llmService = new LLMService(weatherService, currencyService);
const conversationService = new ConversationService();
const hallucinationService = new HallucinationDetectionService();

// Initialize controller
const chatController = new ChatController(
  llmService,
  conversationService,
  hallucinationService
);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/chat', (req, res) => chatController.sendMessage(req, res));
app.post('/api/conversations', (req, res) => chatController.createConversation(req, res));
app.get('/api/conversations/:conversationId', (req, res) => chatController.getConversation(req, res));
app.delete('/api/conversations/:conversationId', (req, res) => chatController.deleteConversation(req, res));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎿 Ski Vacation Planner API running on http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/chat - Send a message`);
  console.log(`   POST /api/conversations - Create new conversation`);
  console.log(`   GET  /api/conversations/:id - Get conversation history`);
  console.log(`\n⚙️  Configuration:`);
  console.log(`   OpenAI API: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Weather API: ✓ Open-Meteo (no API key required)`);
  console.log(`\n`);
});

export default app;
