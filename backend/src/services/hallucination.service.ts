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
    console.log('🔍 Starting 3-layer hallucination detection...');

    // Layer 1: Quick heuristic checks first (faster than LLM call)
    console.log('  Layer 1: Running heuristic analysis...');
    const heuristicResult = this.heuristicCheck(response, functionCalls);
    console.log(`  Layer 1: Confidence=${heuristicResult.confidence.toFixed(2)}, Flagged=${heuristicResult.isLikelyHallucination}`);

    // Layer 2: Common sense check - ask LLM if response makes sense
    console.log('  Layer 2: Running common sense check (LLM)...');
    const commonSenseResult = await this.commonSenseCheck(response, functionCalls);
    console.log(`  Layer 2: Confidence=${commonSenseResult.confidence.toFixed(2)}, Flagged=${commonSenseResult.isLikelyHallucination}`);

    // Layer 3: For borderline cases, use LLM for deeper analysis
    let detailedAnalysis: HallucinationDetectionResult | null = null;

    if (heuristicResult.confidence > 0.3 || commonSenseResult.isLikelyHallucination) {
      console.log('  Layer 3: Running detailed LLM analysis (triggered)...');
      detailedAnalysis = await this.detailedLLMAnalysis(response, functionCalls);
      console.log(`  Layer 3: Confidence=${detailedAnalysis.confidence.toFixed(2)}, Flagged=${detailedAnalysis.isLikelyHallucination}`);
    } else {
      console.log('  Layer 3: Skipped (low suspicion from previous layers)');
    }

    // Combine all checks for final decision
    const result = this.combineResults(heuristicResult, commonSenseResult, detailedAnalysis);
    console.log(`✅ Final: Confidence=${result.confidence.toFixed(2)}, Hallucination=${result.isLikelyHallucination}, Action=${result.suggestedAction || 'none'}`);

    return result;
  }

  /**
   * Layer 2: Common Sense Check
   * Directly asks the LLM if the response makes logical sense
   */
  private async commonSenseCheck(
    response: string,
    functionCalls?: any[]
  ): Promise<HallucinationDetectionResult> {
    try {
      const functionContext = functionCalls && functionCalls.length > 0
        ? `\n\nAPI calls made: ${functionCalls.map(fc => `${fc.function}(${JSON.stringify(fc.args)})`).join(', ')}`
        : '\n\nNo API calls were made.';

      const prompt = `You are a fact-checker for a ski vacation planning assistant. Analyze this response for logical consistency and accuracy.

Response to check:
"${response}"

Context: ${functionContext}

Evaluate:
1. Does the response make logical sense?
2. Are there any contradictions or impossible claims?
3. If weather/currency data is mentioned, was the appropriate API called?
4. Are there vague statements passed off as facts?
5. Does anything seem fabricated or guessed?

Respond in JSON format:
{
  "makesLogicalSense": boolean,
  "hasContradictions": boolean,
  "seemsFabricated": boolean,
  "confidence": number (0-1, how confident you are in your assessment),
  "concerns": string[] (list specific concerns if any),
  "verdict": "trustworthy" | "questionable" | "likely_fabricated"
}`;

      const llmResponse = await this.openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(llmResponse.choices[0].message.content || '{}');

      const isLikelyHallucination =
        !analysis.makesLogicalSense ||
        analysis.hasContradictions ||
        analysis.seemsFabricated ||
        analysis.verdict === 'likely_fabricated';

      let suggestedAction: 'warn' | 'block' | 'verify' | undefined;
      if (analysis.verdict === 'likely_fabricated') {
        suggestedAction = 'block';
      } else if (analysis.verdict === 'questionable') {
        suggestedAction = 'warn';
      }

      return {
        isLikelyHallucination,
        confidence: analysis.confidence || 0,
        reasons: analysis.concerns || [],
        suggestedAction
      };
    } catch (error) {
      console.error('Common sense check error:', error);
      return {
        isLikelyHallucination: false,
        confidence: 0,
        reasons: [],
        suggestedAction: undefined
      };
    }
  }

  /**
   * Layer 3: Detailed LLM Analysis
   * Deep analysis using structured prompt
   */
  private async detailedLLMAnalysis(
    response: string,
    functionCalls?: any[]
  ): Promise<HallucinationDetectionResult> {
    try {
      const prompt = HALLUCINATION_DETECTION_PROMPT.replace('{response}', response);

      const llmResponse = await this.openai.chat.completions.create({
        model: 'gpt-5-mini',
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
      console.error('Detailed LLM analysis error:', error);
      return {
        isLikelyHallucination: false,
        confidence: 0,
        reasons: [],
        suggestedAction: undefined
      };
    }
  }

  /**
   * Combine results from all three layers
   */
  private combineResults(
    heuristic: HallucinationDetectionResult,
    commonSense: HallucinationDetectionResult,
    detailed: HallucinationDetectionResult | null
  ): HallucinationDetectionResult {
    // Aggregate confidence scores (weighted average)
    const weights = {
      heuristic: 0.3,
      commonSense: 0.5,
      detailed: 0.2
    };

    let totalConfidence =
      heuristic.confidence * weights.heuristic +
      commonSense.confidence * weights.commonSense;

    if (detailed) {
      totalConfidence += detailed.confidence * weights.detailed;
    } else {
      // Redistribute detailed weight if not used
      const redistribution = weights.detailed / 2;
      totalConfidence =
        heuristic.confidence * (weights.heuristic + redistribution) +
        commonSense.confidence * (weights.commonSense + redistribution);
    }

    // Aggregate reasons
    const allReasons = [
      ...heuristic.reasons.map(r => `[Heuristic] ${r}`),
      ...commonSense.reasons.map(r => `[Common Sense] ${r}`),
      ...(detailed?.reasons || []).map(r => `[Detailed] ${r}`)
    ];

    // Determine if it's likely a hallucination (if any layer flagged it)
    const isLikelyHallucination =
      heuristic.isLikelyHallucination ||
      commonSense.isLikelyHallucination ||
      (detailed?.isLikelyHallucination || false);

    // Choose the most severe suggested action
    const actions = [
      heuristic.suggestedAction,
      commonSense.suggestedAction,
      detailed?.suggestedAction
    ].filter(Boolean);

    let suggestedAction: 'warn' | 'block' | 'verify' | undefined;
    if (actions.includes('block')) {
      suggestedAction = 'block';
    } else if (actions.includes('warn')) {
      suggestedAction = 'warn';
    } else if (actions.includes('verify')) {
      suggestedAction = 'verify';
    }

    return {
      isLikelyHallucination,
      confidence: totalConfidence,
      reasons: allReasons,
      suggestedAction
    };
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
        model: 'gpt-5-mini',
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
