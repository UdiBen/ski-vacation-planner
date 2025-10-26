# Hallucination Detection System

## Overview

This project implements a sophisticated **3-layer hallucination detection system** that validates AI responses for accuracy and truthfulness before presenting them to users.

## Why This Matters

Large Language Models (LLMs) can sometimes:
- Make up facts ("hallucinate")
- Provide incorrect numbers
- State guesses as facts
- Generate plausible but false information

Our system catches these issues before they reach the user.

## 3-Layer Architecture

### Layer 1: Heuristic Analysis (Fast)
**Speed:** Milliseconds
**Purpose:** Quick pattern-based detection

Checks for:
- ✅ Specific numbers without API data source
- ✅ Weather terms without weather API call
- ✅ Currency amounts without currency API call
- ✅ Uncertain language patterns ("probably", "might be", etc.)
- ✅ Overly precise data without source

**Example Detection:**
```
Response: "The temperature in Aspen is 15.47°C"
No weather API called → FLAGGED
Reason: Overly precise temperature without data source
```

### Layer 2: Common Sense Check (NEW!) 🎯
**Speed:** 1-2 seconds (LLM call)
**Purpose:** Direct LLM validation

Asks another LLM:
- Does this response make logical sense?
- Are there any contradictions?
- If weather/currency mentioned, was API called?
- Are vague statements passed as facts?
- Does anything seem fabricated?

**Example Check:**
```
Response: "Aspen has 500cm of snow in July"
LLM Analysis:
- makesLogicalSense: false
- hasContradictions: true
- verdict: "questionable"
Reason: July is summer, 500cm snow is impossible
```

This layer catches **logical inconsistencies** that heuristics miss!

### Layer 3: Detailed Analysis (Conditional)
**Speed:** 1-2 seconds (LLM call)
**Purpose:** Deep structured analysis
**Triggered:** When Layer 1 confidence > 0.3 OR Layer 2 flags issue

Uses a structured prompt to analyze:
- Specific weather/currency data validation
- Cross-referencing with function calls
- Detecting uncertain language
- Identifying contradictions

## How Layers Work Together

```
┌─────────────────────────────────────────────┐
│         User Query + AI Response            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Layer 1: Heuristic Check (always runs)     │
│  - Pattern matching                         │
│  - Numeric data validation                  │
│  - API call verification                    │
│  Result: confidence score + reasons         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Layer 2: Common Sense Check (always runs)  │
│  - LLM evaluates logical consistency        │
│  - Checks for contradictions                │
│  - Assesses if fabricated                   │
│  Result: verdict + concerns                 │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          │ Suspicious?     │
          └────┬──────────┬─┘
          Yes  │          │ No
               │          │
┌──────────────▼───┐      │
│  Layer 3:        │      │
│  Detailed        │      │
│  Analysis        │      │
└──────────────────┘      │
                          │
          ┌───────────────┴───────────────┐
          │                               │
┌─────────▼───────────────────────────────▼─┐
│  Combine Results (weighted average)       │
│  - Heuristic: 30%                         │
│  - Common Sense: 50%                      │
│  - Detailed: 20%                          │
└──────────────┬────────────────────────────┘
               │
┌──────────────▼────────────────────────────┐
│  Final Decision                           │
│  - isLikelyHallucination: boolean         │
│  - confidence: 0-1                        │
│  - reasons: string[]                      │
│  - suggestedAction: warn|block|verify     │
└───────────────────────────────────────────┘
```

## Weighted Scoring

Results are combined using weighted averages:
- **Common Sense (50%)**: Highest weight - LLM logical validation
- **Heuristic (30%)**: Fast pattern detection
- **Detailed (20%)**: Deep analysis when needed

This ensures the **common sense check** has the most influence on the final decision.

## Example Scenarios

### Scenario 1: Clean Response ✅
```
User: "What are good ski resorts for beginners?"
Response: "Great beginner resorts include Aspen Buttermilk..."

Layer 1: ✅ No suspicious patterns (confidence: 0.0)
Layer 2: ✅ Makes logical sense, no concerns
Layer 3: ⏭️  Skipped (low suspicion)

Final: Not a hallucination
```

### Scenario 2: Caught Hallucination ⚠️
```
User: "What's the weather in Chamonix?"
Response: "It's currently 12°C with light snow..."
[No weather API called!]

Layer 1: 🚨 Specific weather data without API (confidence: 0.7)
Layer 2: 🚨 Weather mentioned but no API call detected
Layer 3: 🚨 Triggered - confirms fabricated data

Final: Likely hallucination (confidence: 0.82)
Action: WARN user
```

### Scenario 3: Logical Inconsistency ⚠️
```
User: "Best time to ski in the Alps?"
Response: "July is perfect - 2 meters of fresh powder..."

Layer 1: ✅ No API needed for general advice (confidence: 0.1)
Layer 2: 🚨 Logical contradiction - July is summer!
         Verdict: "likely_fabricated"
Layer 3: 🚨 Triggered - confirms seasonal impossibility

Final: Likely hallucination (confidence: 0.75)
Action: WARN user
```

## Suggested Actions

Based on confidence levels:

- **Block (0.8+)**: Response is very likely false
  - Don't show to user
  - Log for review

- **Warn (0.5-0.8)**: Response may be unreliable
  - Show with warning badge
  - Tell user to verify

- **Verify (0.3-0.5)**: Borderline suspicious
  - Show without badge
  - Log for monitoring

- **None (<0.3)**: Response seems trustworthy
  - Show normally
  - No warnings needed

## User Experience

When hallucination detected, users see:

```
┌─────────────────────────────────────────┐
│ [Assistant Message]                     │
│ "The temperature in Aspen is..."       │
│                                         │
│ ⚠️ Verification Recommended             │
│ This response may contain unverified   │
│ information. Please verify important   │
│ details.                                │
│                                         │
│ Confidence: 72%                         │
│ Reasons:                                │
│ • [Heuristic] Weather data without API │
│ • [Common Sense] No API call detected  │
└─────────────────────────────────────────┘
```

## Console Logging

Backend logs show the detection process:

```
🔍 Starting 3-layer hallucination detection...
  Layer 1: Running heuristic analysis...
  Layer 1: Confidence=0.70, Flagged=true
  Layer 2: Running common sense check (LLM)...
  Layer 2: Confidence=0.65, Flagged=true
  Layer 3: Running detailed LLM analysis (triggered)...
  Layer 3: Confidence=0.80, Flagged=true
✅ Final: Confidence=0.72, Hallucination=true, Action=warn
```

## Performance Considerations

**Layer 1** (Heuristic):
- Time: <10ms
- Cost: $0
- Always runs

**Layer 2** (Common Sense):
- Time: ~1-2 seconds
- Cost: ~$0.0001 per check (GPT-3.5)
- Always runs

**Layer 3** (Detailed):
- Time: ~1-2 seconds
- Cost: ~$0.0001 per check (GPT-3.5)
- Only runs when triggered (~30% of time)

**Total per message**: ~$0.0002 and 2-4 seconds

This is a reasonable tradeoff for accuracy in an academic project.

## Technical Implementation

### Code Location
```
backend/src/services/hallucination.service.ts
```

### Key Methods

```typescript
// Main entry point
async detectHallucination(
  response: string,
  functionCalls?: any[]
): Promise<HallucinationDetectionResult>

// Layer 1: Pattern matching
private heuristicCheck(
  response: string,
  functionCalls?: any[]
): HallucinationDetectionResult

// Layer 2: LLM common sense validation
private async commonSenseCheck(
  response: string,
  functionCalls?: any[]
): Promise<HallucinationDetectionResult>

// Layer 3: Deep analysis
private async detailedLLMAnalysis(
  response: string,
  functionCalls?: any[]
): Promise<HallucinationDetectionResult>

// Combine all layers
private combineResults(
  heuristic: HallucinationDetectionResult,
  commonSense: HallucinationDetectionResult,
  detailed: HallucinationDetectionResult | null
): HallucinationDetectionResult
```

## Advantages Over Single-Layer Detection

**Traditional approach:**
- Single heuristic check
- Fixed patterns
- Misses logical errors
- Many false positives/negatives

**Our 3-layer approach:**
- ✅ Fast heuristics catch obvious issues
- ✅ LLM catches logical inconsistencies
- ✅ Deep analysis for borderline cases
- ✅ Weighted combination reduces errors
- ✅ Multiple perspectives increase accuracy

## Future Enhancements

Possible improvements:
1. **Fact-checking APIs**: Cross-reference with external sources
2. **Historical data**: Learn from past hallucinations
3. **User feedback**: Let users report false positives/negatives
4. **A/B testing**: Experiment with different weights
5. **Confidence calibration**: Fine-tune thresholds based on data

## Academic Value

This system demonstrates:
1. **Multi-layer architecture**: Combining approaches for robustness
2. **LLM self-validation**: Using AI to check AI
3. **Weighted ensembles**: Combining multiple signals
4. **Practical trade-offs**: Balancing accuracy, speed, and cost
5. **User trust**: Building transparency into AI systems

## Testing

Try these queries to see detection in action:

**Should NOT trigger:**
```
"What are the best ski resorts in the Alps?"
"How do I prepare for my first ski trip?"
```

**Should trigger (if AI makes up data):**
```
"What's the weather in Aspen?" [without API call]
"Convert 1000 USD to EUR" [without API call]
"Is there snow in July in Switzerland?" [if yes]
```

---

**This 3-layer system is a key differentiator in building trustworthy AI assistants!** 🛡️
