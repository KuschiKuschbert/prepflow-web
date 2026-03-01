import {
  AUSTRALIAN_ALLERGENS,
  consolidateAllergens,
  containsAllergenKeywords,
  mapToConsolidatedCode,
} from '../australian-allergens';

interface StructuredAIResponse {
  composition?: string[];
  allergens?: string[];
}

/**
 * Map allergen display names returned by the AI to allergen codes.
 * Also handles legacy names for backward compatibility.
 */
const DISPLAY_NAME_TO_CODE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  AUSTRALIAN_ALLERGENS.forEach(a => {
    map[a.displayName.toLowerCase()] = a.code;
    map[a.code] = a.code;
  });
  // Legacy display names
  const legacyMappings: Record<string, string> = {
    crustacea: 'shellfish',
    crustacean: 'shellfish',
    molluscs: 'shellfish',
    mollusc: 'shellfish',
    mollusk: 'shellfish',
    peanuts: 'nuts',
    peanut: 'nuts',
    'tree nuts': 'nuts',
    'tree nut': 'nuts',
    wheat: 'gluten',
  };
  Object.assign(map, legacyMappings);
  return map;
})();

/**
 * Try to extract a JSON object from the AI response string.
 * The model may include surrounding text despite instructions.
 */
function extractJsonFromResponse(text: string): StructuredAIResponse | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as StructuredAIResponse;
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // not valid JSON
  }
  return null;
}

/**
 * Parse AI response to extract allergens and composition.
 * Tries structured JSON parsing first (high confidence), then falls back to
 * keyword scanning the raw text (medium confidence).
 *
 * @returns allergens, composition string, and whether JSON parsing succeeded
 */
export function parseAIResponse(aiResponse: string): {
  allergens: string[];
  composition?: string;
  parsedAsJson: boolean;
} {
  // --- Attempt 1: Parse structured JSON response ---
  const structured = extractJsonFromResponse(aiResponse);
  if (structured) {
    const allergenCodes: string[] = [];
    (structured.allergens ?? []).forEach(name => {
      const code = DISPLAY_NAME_TO_CODE[name.toLowerCase().trim()];
      if (code) {
        allergenCodes.push(mapToConsolidatedCode(code));
      }
    });

    const compositionArr = structured.composition ?? [];
    const isSingleIngredient =
      compositionArr.length === 0 ||
      (compositionArr.length === 1 && compositionArr[0] === 'single ingredient');
    const composition = isSingleIngredient ? undefined : compositionArr.join(', ');

    return {
      allergens: consolidateAllergens(allergenCodes),
      composition,
      parsedAsJson: true,
    };
  }

  // --- Attempt 2: Keyword scan on raw AI text (fallback) ---
  const detected: string[] = [];

  AUSTRALIAN_ALLERGENS.forEach(allergen => {
    if (containsAllergenKeywords(aiResponse, allergen.code)) {
      detected.push(allergen.code);
    }
  });

  // Also check legacy names
  Object.entries(DISPLAY_NAME_TO_CODE).forEach(([name, code]) => {
    const lowerResponse = aiResponse.toLowerCase();
    if (lowerResponse.includes(name) && !detected.includes(code)) {
      detected.push(code);
    }
  });

  // Extract composition via regex fallback
  let composition: string | undefined;
  const compositionMatch = aiResponse.match(/(?:composition|ingredients?):\s*(.+?)(?:\n|$)/i);
  if (compositionMatch) {
    composition = compositionMatch[1].trim();
  }

  return {
    allergens: consolidateAllergens(detected),
    composition,
    parsedAsJson: false,
  };
}
