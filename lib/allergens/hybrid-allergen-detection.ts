/**
 * Hybrid Allergen Detection
 * Uses non-AI keyword matching first, falls back to AI for complex/processed ingredients
 */

import { logger } from '@/lib/logger';
import { trackAllergenDetection } from '@/lib/sentry-metrics';
import {
  detectAllergensFromTextWithSource,
  consolidateAllergens,
  mapToConsolidatedCode,
} from './australian-allergens';
import { detectAllergensFromIngredient, AIAllergenDetectionResult } from './ai-allergen-detection';

/** Per-allergen source: how each individual allergen was detected */
export type AllergenDetectionSource = 'manual' | 'ai' | 'keyword';

export interface HybridAllergenDetectionResult {
  allergens: string[];
  /** Maps each allergen code to how it was detected */
  perAllergen: Record<string, AllergenDetectionSource>;
  composition?: string;
  confidence: 'high' | 'medium' | 'low';
  method: 'non-ai' | 'ai' | 'hybrid';
  cached: boolean;
  reason?: string;
}

/**
 * Check if ingredient name suggests it's a processed/complex ingredient
 * that might benefit from AI detection
 */
function isProcessedIngredient(ingredientName: string, brand?: string): boolean {
  const lowerName = ingredientName.toLowerCase();
  const lowerBrand = brand?.toLowerCase() || '';

  // Indicators of processed ingredients
  const processedIndicators = [
    'mix',
    'blend',
    'sauce',
    'dressing',
    'marinade',
    'paste',
    'powder',
    'seasoning',
    'spice blend',
    'rub',
    'marinade',
    'glaze',
    'syrup',
    'concentrate',
    'extract',
    'essence',
    'flavor',
    'flavour',
    'stock',
    'broth',
    'bouillon',
    'base',
    'prepared',
    'ready-made',
    'ready made',
    'pre-mixed',
    'pre mixed',
  ];

  // Check if name contains processed indicators
  const hasProcessedIndicator = processedIndicators.some(
    indicator => lowerName.includes(indicator) || lowerBrand.includes(indicator),
  );

  // Check if it's a brand name (often processed)
  const hasBrand = brand && brand.trim().length > 0;

  // Check if name is very short (might be ambiguous)
  const isShort = ingredientName.trim().length < 3;

  // Check if name contains numbers or special characters (often processed products)
  const hasSpecialChars = /[0-9%()]/.test(ingredientName);

  return (
    hasProcessedIndicator || (hasBrand && !hasProcessedIndicator) || isShort || hasSpecialChars
  );
}

/**
 * Hybrid allergen detection: non-AI first, AI fallback
 */
export async function detectAllergensHybrid(
  ingredientName: string,
  brand?: string,
  forceAI: boolean = false,
): Promise<HybridAllergenDetectionResult> {
  const trimmedName = ingredientName.trim();
  const trimmedBrand = brand?.trim();

  // Step 1: Keyword-based detection with per-allergen source tracking
  const nameKeywords = detectAllergensFromTextWithSource(trimmedName);
  const brandKeywords = trimmedBrand ? detectAllergensFromTextWithSource(trimmedBrand) : {};
  // Merge name and brand keyword results — all tagged as 'keyword'
  const keywordPerAllergen: Record<string, AllergenDetectionSource> = {
    ...brandKeywords,
    ...nameKeywords,
  };
  const allNonAIAllergens = Object.keys(keywordPerAllergen);

  logger.dev(
    `[Hybrid Allergen Detection] Non-AI detection found ${allNonAIAllergens.length} allergens for: ${trimmedName}`,
  );

  // Step 2: Determine if we should use AI
  const shouldUseAI =
    forceAI ||
    (allNonAIAllergens.length === 0 && isProcessedIngredient(trimmedName, trimmedBrand)) ||
    (allNonAIAllergens.length === 0 && trimmedBrand && trimmedBrand.length > 0);

  if (!shouldUseAI) {
    trackAllergenDetection(allNonAIAllergens.length > 0 ? 'keyword' : 'none');
    return {
      allergens: allNonAIAllergens,
      perAllergen: keywordPerAllergen,
      confidence: allNonAIAllergens.length > 0 ? 'high' : 'medium',
      method: 'non-ai',
      cached: false,
      reason:
        allNonAIAllergens.length > 0
          ? 'Detected using keyword matching'
          : 'No allergens detected using keyword matching',
    };
  }

  // Step 3: Use AI detection as fallback or supplement
  logger.dev(`[Hybrid Allergen Detection] Using AI detection for: ${trimmedName}`);
  const aiResult: AIAllergenDetectionResult = await detectAllergensFromIngredient(
    trimmedName,
    trimmedBrand,
  );

  // Step 4: Merge keyword and AI results into a unified perAllergen map
  // Keyword results are tagged 'keyword'; AI-only results are tagged 'ai'
  const mergedPerAllergen: Record<string, AllergenDetectionSource> = { ...keywordPerAllergen };
  aiResult.allergens.forEach(code => {
    const consolidated = mapToConsolidatedCode(code);
    if (!mergedPerAllergen[consolidated]) {
      // AI found this allergen but keyword scan didn't — tag as 'ai'
      mergedPerAllergen[consolidated] = 'ai';
    }
    // If keyword already found it, keep 'keyword' (more deterministic)
  });

  const mergedAllergens = consolidateAllergens(Object.keys(mergedPerAllergen));

  // Determine confidence and method
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let method: 'non-ai' | 'ai' | 'hybrid' = 'hybrid';
  let reason: string | undefined;

  if (allNonAIAllergens.length > 0 && aiResult.allergens.length > 0) {
    method = 'hybrid';
    confidence = 'high';
    reason = `Detected using keyword matching and AI (${allNonAIAllergens.length} from keywords, ${aiResult.allergens.length} from AI)`;
  } else if (allNonAIAllergens.length > 0) {
    method = 'non-ai';
    confidence = 'high';
    reason = 'Detected using keyword matching';
  } else if (aiResult.allergens.length > 0) {
    method = 'ai';
    confidence = aiResult.confidence;
    reason = `Detected using AI (${aiResult.allergens.length} allergens found)`;
  } else {
    method = 'hybrid';
    confidence = 'medium';
    reason = 'No allergens detected using keyword matching or AI';
  }

  trackAllergenDetection(method === 'non-ai' ? 'keyword' : method);

  return {
    allergens: mergedAllergens,
    perAllergen: mergedPerAllergen,
    composition: aiResult.composition,
    confidence,
    method,
    cached: aiResult.cached,
    reason,
  };
}

/**
 * Enrich ingredient with allergens using hybrid detection
 * Merges manual allergens with detected allergens
 */
/** The full allergen_source shape stored in the database */
export interface AllergenSourceRecord {
  manual?: boolean;
  ai?: boolean;
  non_ai?: boolean;
  hybrid?: boolean;
  ai_detected_at?: string;
  /** Per-allergen detection source map (added in v2) */
  perAllergen?: Record<string, AllergenDetectionSource>;
}

export async function enrichIngredientWithAllergensHybrid(ingredient: {
  ingredient_name: string;
  brand?: string;
  allergens?: string[];
  allergen_source?: AllergenSourceRecord;
  forceAI?: boolean;
}): Promise<{
  allergens: string[];
  allergen_source: AllergenSourceRecord;
  composition?: string;
  confidence?: 'high' | 'medium' | 'low';
  method?: 'non-ai' | 'ai' | 'hybrid';
}> {
  const existingAllergens = ingredient.allergens || [];
  const isManuallySet =
    ingredient.allergen_source &&
    typeof ingredient.allergen_source === 'object' &&
    ingredient.allergen_source.manual === true;

  // Manually set allergens are not re-detected — preserve them with their perAllergen map
  if (isManuallySet && existingAllergens.length > 0) {
    const existingPerAllergen = ingredient.allergen_source?.perAllergen ?? {};
    // Any allergen not yet in perAllergen is assumed 'manual'
    const perAllergen: Record<string, AllergenDetectionSource> = { ...existingPerAllergen };
    existingAllergens.forEach(code => {
      if (!perAllergen[code]) perAllergen[code] = 'manual';
    });
    return {
      allergens: existingAllergens,
      allergen_source: {
        manual: true,
        ai: ingredient.allergen_source?.ai || false,
        non_ai: false,
        hybrid: false,
        perAllergen,
      },
    };
  }

  const detectionResult = await detectAllergensHybrid(
    ingredient.ingredient_name,
    ingredient.brand,
    ingredient.forceAI || false,
  );

  const allAllergens = consolidateAllergens([...existingAllergens, ...detectionResult.allergens]);

  // Merge perAllergen maps — existing manual entries take precedence
  const existingPerAllergen = ingredient.allergen_source?.perAllergen ?? {};
  const mergedPerAllergen: Record<string, AllergenDetectionSource> = {
    ...detectionResult.perAllergen,
    ...existingPerAllergen, // existing (manual) entries override detected entries
  };

  return {
    allergens: allAllergens,
    allergen_source: {
      manual: isManuallySet ?? false,
      ai:
        detectionResult.method === 'ai' ||
        detectionResult.method === 'hybrid' ||
        ingredient.allergen_source?.ai ||
        false,
      non_ai: detectionResult.method === 'non-ai' || detectionResult.method === 'hybrid',
      hybrid: detectionResult.method === 'hybrid',
      perAllergen: mergedPerAllergen,
    },
    composition: detectionResult.composition,
    confidence: detectionResult.confidence,
    method: detectionResult.method,
  };
}
