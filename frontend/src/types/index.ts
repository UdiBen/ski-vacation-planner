export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  warning?: Warning;
  dataSources?: DataSource[];
}

export interface Warning {
  type: string;
  confidence: number;
  reasons: string[];
  message: string;
}

export interface DataSource {
  type: string;
  data: any;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  warning?: Warning;
  dataSources?: DataSource[];
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
}
