import OpenAI from 'openai';
import { Message } from '../types';
import { SYSTEM_PROMPT } from '../utils/prompts';
import { WeatherService } from './weather.service';
import { CurrencyService } from './currency.service';

/**
 * LLM Service using OpenAI's Responses API (March 2025)
 *
 * The Responses API is OpenAI's modern API that combines the best of
 * Chat Completions and Assistants APIs with server-side conversation state management.
 */
export class LLMService {
  private openai: OpenAI;
  private weatherService: WeatherService;
  private currencyService: CurrencyService;
  private previousResponseId: string | null = null;

  constructor(weatherService: WeatherService, currencyService: CurrencyService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({ apiKey });
    this.weatherService = weatherService;
    this.currencyService = currencyService;
  }

  private get tools(): Array<OpenAI.Responses.FunctionTool> {
    return [
      {
        type: "function",
        name: "get_weather",
        description: "Get current weather conditions and 5-day forecast for a ski resort or location. Use this when users ask about weather, snow conditions, or current conditions at a resort.",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The ski resort name or city/location (e.g., 'Chamonix', 'Aspen', 'Zermatt')"
            },
            units: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "Temperature units preference"
            }
          },
          required: ["location"]
        },
        strict: null
      },
      {
        type: "function",
        name: "convert_currency",
        description: "Convert currency amounts for travel budgeting and cost comparisons. Use this when users ask about prices, costs, or budget conversions.",
        parameters: {
          type: "object",
          properties: {
            from: {
              type: "string",
              description: "Source currency code (e.g., 'USD', 'EUR', 'GBP')"
            },
            to: {
              type: "string",
              description: "Target currency code (e.g., 'EUR', 'CHF', 'CAD')"
            },
            amount: {
              type: "number",
              description: "Amount to convert (optional, if not provided, just return the exchange rate)"
            }
          },
          required: ["from", "to"]
        },
        strict: null
      }
    ];
  }

  async processMessage(messages: Message[]): Promise<{ content: string; functionCalls?: any[] }> {
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== 'user') {
      throw new Error('Latest message must be from user');
    }

    const functionCalls: any[] = [];

    // Use Responses API with conversation state management
    const response = await this.openai.responses.create({
      model: 'gpt-5',
      input: latestMessage.content,
      instructions: SYSTEM_PROMPT,
      tools: this.tools,
      tool_choice: 'auto',
      temperature: 0.7,
      store: true, // Store conversation state on OpenAI's servers
      previous_response_id: this.previousResponseId || undefined
    });

    // Store response ID for next message (conversation continuity)
    this.previousResponseId = response.id;

    // Check if model wants to call functions
    const functionToolCalls = response.output.filter(
      (item): item is OpenAI.Responses.ResponseFunctionToolCall =>
        item.type === 'function_call'
    );

    if (functionToolCalls.length > 0) {
      console.log(`📞 Model requesting ${functionToolCalls.length} function call(s)`);

      // Execute all function calls
      const functionOutputs: OpenAI.Responses.ResponseInputItem.FunctionCallOutput[] = [];

      for (const toolCall of functionToolCalls) {
        const functionName = toolCall.name;
        const functionArgs = JSON.parse(toolCall.arguments);

        console.log(`  Executing: ${functionName}(${JSON.stringify(functionArgs)})`);

        let functionResponse: any;

        try {
          switch (functionName) {
            case 'get_weather':
              functionResponse = await this.weatherService.getSkiConditions(
                functionArgs.location
              );
              functionCalls.push({
                function: 'get_weather',
                args: functionArgs,
                result: functionResponse
              });
              break;

            case 'convert_currency':
              functionResponse = await this.currencyService.convertCurrency(
                functionArgs.from,
                functionArgs.to,
                functionArgs.amount
              );
              functionCalls.push({
                function: 'convert_currency',
                args: functionArgs,
                result: functionResponse
              });
              break;

            default:
              functionResponse = { error: 'Unknown function' };
          }
        } catch (error) {
          functionResponse = {
            error: error instanceof Error ? error.message : 'Function execution failed'
          };
        }

        // Add function output to the list
        functionOutputs.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify(functionResponse)
        });
      }

      // Submit function outputs back to the model
      const finalResponse = await this.openai.responses.create({
        model: 'gpt-5',
        input: functionOutputs as any, // Array of function outputs
        instructions: SYSTEM_PROMPT,
        temperature: 0.7,
        store: true,
        previous_response_id: response.id // Continue from the previous response
      });

      // Update response ID
      this.previousResponseId = finalResponse.id;

      return {
        content: finalResponse.output_text || 'I apologize, I could not generate a response.',
        functionCalls
      };
    }

    // No function calls needed - return direct response
    return {
      content: response.output_text || 'I apologize, I could not generate a response.'
    };
  }

  async analyzeWithChainOfThought(query: string, context: string): Promise<string> {
    const prompt = `You are helping plan a ski vacation. Use chain-of-thought reasoning to analyze this query step by step.

Context: ${context}
Query: ${query}

Think through this step by step:
1. What is the user really asking?
2. What information do I need to answer this well?
3. What assumptions should I check?
4. What's the best recommendation given the constraints?

Provide your reasoning and then your final answer.`;

    const response = await this.openai.responses.create({
      model: 'gpt-5',
      input: prompt,
      temperature: 0.7
    });

    return response.output_text || '';
  }

  /**
   * Clear conversation state (start fresh conversation)
   */
  clearConversation() {
    this.previousResponseId = null;
    console.log('🔄 Conversation state cleared');
  }
}
