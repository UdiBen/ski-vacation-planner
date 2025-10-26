import OpenAI from "openai";
import { HallucinationDetectionResult } from "../types";
import { LLM_JUDGE_PROMPT } from "../utils/prompts";

export class HallucinationDetectionService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
    this.openai = new OpenAI({ apiKey });
  }

  async detectHallucination(
    response: string,
    functionCalls?: any[]
  ): Promise<HallucinationDetectionResult> {
    console.log("🔍 Starting 2-layer hallucination detection...");

    // Layer 1: Quick heuristic checks first (faster than LLM call)
    console.log("  Layer 1: Running heuristic analysis...");
    const heuristicResult = this.heuristicCheck(response, functionCalls);
    console.log(
      `  Layer 1: Confidence=${heuristicResult.confidence.toFixed(2)}, Flagged=${heuristicResult.isLikelyHallucination}`
    );

    // Layer 2: LLM as judge - comprehensive analysis
    console.log("  Layer 2: Running LLM judge analysis...");
    const llmJudgeResult = await this.llmJudgeAnalysis(response, functionCalls);
    console.log(
      `  Layer 2: Confidence=${llmJudgeResult.confidence.toFixed(2)}, Flagged=${llmJudgeResult.isLikelyHallucination}`
    );

    // Combine both checks for final decision
    const result = this.combineResults(heuristicResult, llmJudgeResult);
    console.log(
      `✅ Final: Confidence=${result.confidence.toFixed(2)}, Hallucination=${result.isLikelyHallucination}, Action=${result.suggestedAction || "none"}`
    );

    return result;
  }

  /**
   * Layer 2: LLM as Judge
   * Comprehensive analysis combining logical consistency and detailed verification
   */
  private async llmJudgeAnalysis(
    response: string,
    functionCalls?: any[]
  ): Promise<HallucinationDetectionResult> {
    try {
      const functionContext =
        functionCalls && functionCalls.length > 0
          ? `API calls made: ${functionCalls.map((fc) => `${fc.function}(${JSON.stringify(fc.args)})`).join(", ")}`
          : "No API calls were made.";

      // Use the prompt from prompts.ts and replace placeholders
      const prompt = LLM_JUDGE_PROMPT.replace("{response}", response).replace(
        "{functionContext}",
        functionContext
      );

      const resp = await this.openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });
      const llmResponse = {
        choices: [{ message: { content: resp.output_text } }],
      };

      const analysis = JSON.parse(
        llmResponse.choices[0].message.content || "{}"
      );

      return {
        isLikelyHallucination: analysis.isLikelyHallucination || false,
        confidence: analysis.confidence || 0,
        reasons: analysis.concerns || [],
        suggestedAction: analysis.suggestedAction || undefined,
      };
    } catch (error) {
      console.error("LLM judge analysis error:", error);
      return {
        isLikelyHallucination: false,
        confidence: 0,
        reasons: [],
        suggestedAction: undefined,
      };
    }
  }

  /**
   * Combine results from both layers
   */
  private combineResults(
    heuristic: HallucinationDetectionResult,
    llmJudge: HallucinationDetectionResult
  ): HallucinationDetectionResult {
    // Weighted average: 40% heuristic (fast pattern matching), 60% LLM judge (deep analysis)
    const weights = {
      heuristic: 0.4,
      llmJudge: 0.6,
    };

    const totalConfidence =
      heuristic.confidence * weights.heuristic +
      llmJudge.confidence * weights.llmJudge;

    // Aggregate reasons from both layers
    const allReasons = [
      ...heuristic.reasons.map((r) => `[Heuristic] ${r}`),
      ...llmJudge.reasons.map((r) => `[LLM Judge] ${r}`),
    ];

    // Determine if it's likely a hallucination (if either layer flagged it)
    const isLikelyHallucination =
      heuristic.isLikelyHallucination || llmJudge.isLikelyHallucination;

    // Choose the most severe suggested action
    const actions = [
      heuristic.suggestedAction,
      llmJudge.suggestedAction,
    ].filter(Boolean);

    let suggestedAction: "warn" | "block" | "verify" | undefined;
    if (actions.includes("block")) {
      suggestedAction = "block";
    } else if (actions.includes("warn")) {
      suggestedAction = "warn";
    } else if (actions.includes("verify")) {
      suggestedAction = "verify";
    }

    return {
      isLikelyHallucination,
      confidence: totalConfidence,
      reasons: allReasons,
      suggestedAction,
    };
  }

  private heuristicCheck(
    response: string,
    functionCalls?: any[]
  ): HallucinationDetectionResult {
    const reasons: string[] = [];
    let suspicionScore = 0;

    // Check 1: Specific numbers without function calls
    const hasSpecificNumbers =
      /\d+(\.\d+)?\s*(°C|°F|USD|EUR|GBP|CHF|cm|inches|km\/h|mph)/gi.test(
        response
      );
    const hasFunctionData = functionCalls && functionCalls.length > 0;

    if (hasSpecificNumbers && !hasFunctionData) {
      reasons.push(
        "Response contains specific numeric data but no API calls were made"
      );
      suspicionScore += 0.4;
    }

    // Check 2: Weather-specific terms without weather API call
    const weatherTerms =
      /temperature|snow|forecast|conditions|weather|precipitation/gi;
    const hasWeatherTerms = weatherTerms.test(response);
    const hasWeatherCall = functionCalls?.some(
      (fc) => fc.function === "get_weather"
    );

    if (hasWeatherTerms && hasSpecificNumbers && !hasWeatherCall) {
      reasons.push(
        "Response discusses weather conditions without calling weather API"
      );
      suspicionScore += 0.3;
    }

    // Check 3: Currency amounts without currency API call
    const currencyPattern = /\$\d+|\d+\s*(USD|EUR|GBP|CHF)/gi;
    const hasCurrencyAmounts = currencyPattern.test(response);
    const hasCurrencyCall = functionCalls?.some(
      (fc) => fc.function === "convert_currency"
    );

    if (hasCurrencyAmounts && !hasCurrencyCall) {
      reasons.push(
        "Response contains currency amounts without calling currency API"
      );
      suspicionScore += 0.3;
    }

    // Check 4: Uncertain language (only flag if no API data AND many hedges)
    const uncertainPhrases = [
      "probably",
      "might be",
      "could be",
      "I think",
      "I believe",
      "I guess",
    ];

    const uncertaintyCount = uncertainPhrases.filter((phrase) =>
      response.toLowerCase().includes(phrase)
    ).length;

    // Only flag if there's no function data AND multiple uncertain phrases
    if (uncertaintyCount > 2 && !hasFunctionData) {
      reasons.push("Response contains multiple uncertain phrases without using API data");
      suspicionScore += 0.3;
    }

    // Check 5: Very specific data that seems made up
    const verySpecificPattern = /\d+\.\d{2,}\s*(°C|°F|USD|EUR)/gi;
    if (verySpecificPattern.test(response) && !hasFunctionData) {
      reasons.push(
        "Response contains overly precise numbers without data source"
      );
      suspicionScore += 0.3;
    }

    const isLikelyHallucination = suspicionScore >= 0.5;
    let suggestedAction: "warn" | "block" | "verify" | undefined;

    if (suspicionScore >= 0.8) {
      suggestedAction = "block";
    } else if (suspicionScore >= 0.5) {
      suggestedAction = "warn";
    } else if (suspicionScore >= 0.3) {
      suggestedAction = "verify";
    }

    // Confidence represents how certain we are about our assessment
    // High suspicion = high confidence in hallucination detection
    // Low suspicion = high confidence it's trustworthy
    // We always have relatively high confidence since heuristics are rule-based
    const confidence =
      suspicionScore >= 0.3
        ? Math.min(suspicionScore, 1) // Confident about detected issues
        : 0.7; // Still confident when no issues found (heuristics are reliable)

    return {
      isLikelyHallucination,
      confidence,
      reasons,
      suggestedAction,
    };
  }
}
