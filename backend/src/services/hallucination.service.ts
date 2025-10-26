import OpenAI from 'openai';
import { HallucinationDetectionResult } from '../types';
import { HALLUCINATION_DETECTION_PROMPT } from '../utils/prompts';

export class HallucinationDetectionService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async detectHallucination(
    response: string,
    functionCalls?: any[]
  ): Promise<HallucinationDetectionResult> {
    // Quick heuristic checks first (faster than LLM call)
    const heuristicResult = this.heuristicCheck(response, functionCalls);

    if (heuristicResult.confidence > 0.7) {
      return heuristicResult;
    }

    // For borderline cases, use LLM for deeper analysis
    try {
      const prompt = HALLUCINATION_DETECTION_PROMPT.replace('{response}', response);

      const llmResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(llmResponse.choices[0].message.content || '{}');

      return {
        isLikelyHallucination: analysis.isLikelyHallucination || false,
        confidence: analysis.confidence || 0,
        reasons: analysis.reasons || [],
        suggestedAction: analysis.suggestedAction || 'none'
      };
    } catch (error) {
      console.error('Hallucination detection error:', error);
      return heuristicResult;
    }
  }

  private heuristicCheck(
    response: string,
    functionCalls?: any[]
  ): HallucinationDetectionResult {
    const reasons: string[] = [];
    let suspicionScore = 0;

    // Check 1: Specific numbers without function calls
    const hasSpecificNumbers = /\d+(\.\d+)?\s*(°C|°F|USD|EUR|GBP|CHF|cm|inches|km\/h|mph)/gi.test(response);
    const hasFunctionData = functionCalls && functionCalls.length > 0;

    if (hasSpecificNumbers && !hasFunctionData) {
      reasons.push('Response contains specific numeric data but no API calls were made');
      suspicionScore += 0.4;
    }

    // Check 2: Weather-specific terms without weather API call
    const weatherTerms = /temperature|snow|forecast|conditions|weather|precipitation/gi;
    const hasWeatherTerms = weatherTerms.test(response);
    const hasWeatherCall = functionCalls?.some(fc => fc.function === 'get_weather');

    if (hasWeatherTerms && hasSpecificNumbers && !hasWeatherCall) {
      reasons.push('Response discusses weather conditions without calling weather API');
      suspicionScore += 0.3;
    }

    // Check 3: Currency amounts without currency API call
    const currencyPattern = /\$\d+|\d+\s*(USD|EUR|GBP|CHF)/gi;
    const hasCurrencyAmounts = currencyPattern.test(response);
    const hasCurrencyCall = functionCalls?.some(fc => fc.function === 'convert_currency');

    if (hasCurrencyAmounts && !hasCurrencyCall) {
      reasons.push('Response contains currency amounts without calling currency API');
      suspicionScore += 0.3;
    }

    // Check 4: Uncertain language
    const uncertainPhrases = [
      'probably', 'likely', 'might be', 'could be', 'around',
      'approximately', 'roughly', 'about', 'I think', 'I believe'
    ];

    const uncertaintyCount = uncertainPhrases.filter(phrase =>
      response.toLowerCase().includes(phrase)
    ).length;

    if (uncertaintyCount > 2) {
      reasons.push('Response contains multiple uncertain phrases');
      suspicionScore += 0.2;
    }

    // Check 5: Very specific data that seems made up
    const verySpecificPattern = /\d+\.\d{2,}\s*(°C|°F|USD|EUR)/gi;
    if (verySpecificPattern.test(response) && !hasFunctionData) {
      reasons.push('Response contains overly precise numbers without data source');
      suspicionScore += 0.3;
    }

    const isLikelyHallucination = suspicionScore >= 0.5;
    let suggestedAction: 'warn' | 'block' | 'verify' | undefined;

    if (suspicionScore >= 0.8) {
      suggestedAction = 'block';
    } else if (suspicionScore >= 0.5) {
      suggestedAction = 'warn';
    } else if (suspicionScore >= 0.3) {
      suggestedAction = 'verify';
    }

    return {
      isLikelyHallucination,
      confidence: Math.min(suspicionScore, 1),
      reasons,
      suggestedAction
    };
  }

  async verifyFactualClaim(claim: string, context: string): Promise<boolean> {
    // This could be enhanced with fact-checking APIs in production
    const prompt = `Given the following context from verified data sources:
${context}

Is this claim factually accurate: "${claim}"

Respond with only "true" or "false".`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 10
      });

      const answer = response.choices[0].message.content?.toLowerCase().trim();
      return answer === 'true';
    } catch (error) {
      console.error('Fact verification error:', error);
      return false;
    }
  }
}
