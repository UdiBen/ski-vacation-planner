export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: FunctionCall;
  toolCalls?: ToolCall[];
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface Conversation {
  id: string;
  messages: Message[];
  context: ConversationContext;
}

export interface ConversationContext {
  userPreferences?: {
    skiLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    budget?: string;
    preferredRegions?: string[];
    travelDates?: string;
  };
  lastMentionedResort?: string;
  lastMentionedCountry?: string;
  currency?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  snowfall: number;
  windSpeed: number;
  forecast?: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  snowfall: number;
  condition: string;
}

export interface CurrencyData {
  from: string;
  to: string;
  rate: number;
  amount?: number;
  converted?: number;
}

export interface HallucinationDetectionResult {
  isLikelyHallucination: boolean;
  confidence: number;
  reasons: string[];
  suggestedAction?: 'warn' | 'block' | 'verify';
}
