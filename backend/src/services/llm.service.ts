import OpenAI from 'openai';
import { Message } from '../types';
import { SYSTEM_PROMPT } from '../utils/prompts';
import { WeatherService } from './weather.service';
import { CurrencyService } from './currency.service';

export class LLMService {
  private openai: OpenAI;
  private weatherService: WeatherService;
  private currencyService: CurrencyService;

  constructor(weatherService: WeatherService, currencyService: CurrencyService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({ apiKey });
    this.weatherService = weatherService;
    this.currencyService = currencyService;
  }

  private get tools(): OpenAI.Chat.ChatCompletionTool[] {
    return [
      {
        type: "function",
        function: {
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
                description: "Temperature units preference",
                default: "celsius"
              }
            },
            required: ["location"]
          }
        }
      },
      {
        type: "function",
        function: {
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
          }
        }
      }
    ];
  }

  async processMessage(messages: Message[]): Promise<{ content: string; functionCalls?: any[] }> {
    // Convert messages to OpenAI format
    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-5',
      messages: openAIMessages,
      tools: this.tools,
      tool_choice: 'auto',
      temperature: 0.7
    });

    const responseMessage = response.choices[0].message;
    const functionCalls: any[] = [];

    // Handle function calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // Add assistant's response with tool calls to messages
      openAIMessages.push(responseMessage);

      // Execute all function calls
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Executing function: ${functionName}`, functionArgs);

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

        // Add function response to messages
        openAIMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResponse)
        });
      }

      // Get final response with function results
      const finalResponse = await this.openai.chat.completions.create({
        model: 'gpt-5',
        messages: openAIMessages,
        temperature: 0.7
      });

      return {
        content: finalResponse.choices[0].message.content || 'I apologize, I could not generate a response.',
        functionCalls
      };
    }

    // No function calls needed
    return {
      content: responseMessage.content || 'I apologize, I could not generate a response.'
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

    const response = await this.openai.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content || '';
  }
}
