import { Request, Response } from 'express';
import { LLMService } from '../services/llm.service';
import { ConversationService } from '../services/conversation.service';
import { HallucinationDetectionService } from '../services/hallucination.service';
import { Message } from '../types';

export class ChatController {
  constructor(
    private llmService: LLMService,
    private conversationService: ConversationService,
    private hallucinationService: HallucinationDetectionService
  ) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, message } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Get or create conversation
      let conversation = conversationId
        ? this.conversationService.getConversation(conversationId)
        : null;

      if (!conversation) {
        conversation = this.conversationService.createConversation();
      }

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      this.conversationService.addMessage(conversation.id, userMessage);

      // Get conversation history (last 10 messages for context)
      const history = this.conversationService.getConversationHistory(
        conversation.id,
        10
      );

      // Process with LLM
      const { content, functionCalls } = await this.llmService.processMessage(history);

      // Detect potential hallucinations
      const hallucinationCheck = await this.hallucinationService.detectHallucination(
        content,
        functionCalls
      );

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
        timestamp: new Date()
      };

      this.conversationService.addMessage(conversation.id, assistantMessage);

      // Prepare response
      const response: any = {
        conversationId: conversation.id,
        message: content,
        timestamp: new Date().toISOString()
      };

      // Include hallucination warning if detected
      if (hallucinationCheck.isLikelyHallucination) {
        response.warning = {
          type: 'hallucination',
          confidence: hallucinationCheck.confidence,
          reasons: hallucinationCheck.reasons,
          message: 'This response may contain unverified information. Please verify important details.'
        };
      }

      // Include function calls for transparency
      if (functionCalls && functionCalls.length > 0) {
        response.dataSources = functionCalls.map(fc => ({
          type: fc.function,
          data: fc.result
        }));
      }

      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;

      const conversation = this.conversationService.getConversation(conversationId);

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.json({
        id: conversation.id,
        messages: conversation.messages,
        context: conversation.context
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  }

  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const conversation = this.conversationService.createConversation();
      res.json({
        conversationId: conversation.id,
        message: 'Conversation created successfully'
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }

  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      this.conversationService.clearConversation(conversationId);
      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }
}
