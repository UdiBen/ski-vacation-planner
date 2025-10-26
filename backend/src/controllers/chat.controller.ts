import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from '../services/llm.service';
import { HallucinationDetectionService } from '../services/hallucination.service';

export class ChatController {
  constructor(
    private llmService: LLMService,
    private hallucinationService: HallucinationDetectionService
  ) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, message } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Use conversationId from request or generate a new one
      // OpenAI manages conversation history via previous_response_id
      const currentConversationId = conversationId || uuidv4();

      // Process with LLM (OpenAI manages history server-side)
      const { content, functionCalls } = await this.llmService.processMessage(
        currentConversationId,
        message
      );

      // Detect potential hallucinations
      const hallucinationCheck = await this.hallucinationService.detectHallucination(
        content,
        functionCalls
      );

      // Prepare response
      const response: any = {
        conversationId: currentConversationId,
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

  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;

      // Clear LLM's response chain for this conversation
      this.llmService.clearConversation(conversationId);

      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }
}
