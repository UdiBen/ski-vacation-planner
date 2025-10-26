import { Conversation, Message, ConversationContext } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ConversationService {
  private conversations: Map<string, Conversation> = new Map();

  createConversation(): Conversation {
    const conversation: Conversation = {
      id: uuidv4(),
      messages: [],
      context: {}
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  addMessage(conversationId: string, message: Message): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.messages.push(message);
    this.updateContext(conversation, message);
  }

  private updateContext(conversation: Conversation, message: Message): void {
    if (message.role !== 'user') return;

    const content = message.content.toLowerCase();

    // Extract skill level
    if (content.includes('beginner')) {
      conversation.context.userPreferences = {
        ...conversation.context.userPreferences,
        skiLevel: 'beginner'
      };
    } else if (content.includes('intermediate')) {
      conversation.context.userPreferences = {
        ...conversation.context.userPreferences,
        skiLevel: 'intermediate'
      };
    } else if (content.includes('advanced') || content.includes('expert')) {
      conversation.context.userPreferences = {
        ...conversation.context.userPreferences,
        skiLevel: 'advanced'
      };
    }

    // Extract budget mentions
    const budgetMatch = content.match(/budget.*?(\$\d+|\d+\s*(?:dollar|euro|pound))/i);
    if (budgetMatch) {
      conversation.context.userPreferences = {
        ...conversation.context.userPreferences,
        budget: budgetMatch[0]
      };
    }

    // Extract date mentions
    const datePatterns = [
      /in\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /next\s+(week|month|year)/i,
      /\d{1,2}\/\d{1,2}\/\d{2,4}/
    ];

    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match) {
        conversation.context.userPreferences = {
          ...conversation.context.userPreferences,
          travelDates: match[0]
        };
        break;
      }
    }

    // Extract resort mentions (common ski resorts)
    const resorts = [
      'aspen', 'vail', 'whistler', 'chamonix', 'zermatt', 'st. moritz',
      'cortina', 'kitzbuhel', 'verbier', 'courchevel', 'val d\'isere',
      'st. anton', 'davos', 'park city', 'breckenridge', 'niseko'
    ];

    for (const resort of resorts) {
      if (content.includes(resort)) {
        conversation.context.lastMentionedResort = resort;
        break;
      }
    }

    // Extract country mentions
    const countries = [
      'switzerland', 'france', 'austria', 'italy', 'usa', 'canada',
      'japan', 'norway', 'sweden'
    ];

    for (const country of countries) {
      if (content.includes(country)) {
        conversation.context.lastMentionedCountry = country;
        break;
      }
    }
  }

  getConversationHistory(conversationId: string, limit?: number): Message[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }

    const messages = conversation.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  getContext(conversationId: string): ConversationContext {
    const conversation = this.conversations.get(conversationId);
    return conversation?.context || {};
  }

  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }
}
