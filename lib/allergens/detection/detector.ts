import {
  generateTextWithHuggingFace,
  getHuggingFaceTextModel,
  isAIEnabled,
} from '@/lib/ai/huggingface-client';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { AUSTRALIAN_ALLERGENS } from '../australian-allergens';
import { cacheComposition, getCachedComposition } from './cache';
import { parseAIResponse } from './parser';
import type { AIAllergenDetectionResult } from './types';

/**
 * Detect allergens from ingredient using AI
 */
export async function detectAllergensFromIngredient(
  ingredientName: string,
  brand?: string,
): Promise<AIAllergenDetectionResult> {
  // Check cache first
  const cached = await getCachedComposition(ingredientName, brand);
  if (cached) {
    return cached;
  }

  // Check if AI is enabled
  if (!isAIEnabled()) {
    logger.dev('[AI Allergen Detection] AI not enabled, returning empty result');
    return {
      allergens: [],
      confidence: 'low',
      cached: false,
    };
  }

  try {
    // Build structured prompt requesting JSON output for reliable parsing
    const allergenNames = AUSTRALIAN_ALLERGENS.map(a => a.displayName).join(', ');
    const prompt = `Analyze this food ingredient for Australian FSANZ allergens and respond ONLY with valid JSON.

Ingredient: ${ingredientName}${brand ? ` (Brand: ${brand})` : ''}

Valid allergen names: ${allergenNames}

Respond ONLY with this exact JSON format (no other text):
{"composition":["ingredient1","ingredient2"],"allergens":["Nuts","Milk"]}

Rules:
- "composition" lists the ingredient's sub-components if it is a processed/mixed product, or ["single ingredient"] if it is a raw ingredient
- "allergens" lists ONLY names from the valid allergen names list above
- If no allergens are present, use: {"composition":["single ingredient"],"allergens":[]}
- Check for hidden allergens (e.g. soy lecithin, whey, barley malt)`;

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are a food safety expert analyzing ingredients for allergen content according to Australian FSANZ standards. Always respond with valid JSON only — no explanation, no preamble.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const result = await generateTextWithHuggingFace(messages, {
      model: getHuggingFaceTextModel(),
      temperature: 0.3, // Lower temperature for more consistent results
      maxTokens: 500,
    });

    if (!result || !result.content) {
      throw ApiErrorHandler.createError('No response from AI', 'DATABASE_ERROR', 500);
    }

    const content = result.content;
    const { allergens, composition, parsedAsJson } = parseAIResponse(content);

    // Cache the result
    await cacheComposition(ingredientName, brand || null, allergens, composition);

    // Confidence: high if JSON was parsed cleanly with allergens, medium otherwise
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (parsedAsJson && allergens.length > 0) {
      confidence = 'high';
    } else if (parsedAsJson || allergens.length > 0) {
      confidence = 'medium';
    }

    return {
      allergens,
      composition,
      confidence,
      cached: false,
    };
  } catch (err) {
    logger.error('[AI Allergen Detection] Error detecting allergens:', err);
    return {
      allergens: [],
      confidence: 'low',
      cached: false,
    };
  }
}
