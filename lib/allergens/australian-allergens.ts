/**
 * Australian FSANZ Allergen Standards
 * Defines the 14 major allergens required by Food Standards Australia New Zealand.
 *
 * Data lives in allergen-data.ts to keep this file under the 500-line utility limit.
 */

export interface Allergen {
  code: string;
  displayName: string;
  description: string;
  commonNames?: string[];
  icon?: string; // Lucide React icon name
}

export { ALLERGEN_EXCLUSIONS, OLD_CODE_TO_NEW_CODE, AUSTRALIAN_ALLERGENS } from './allergen-data';

import { ALLERGEN_EXCLUSIONS, OLD_CODE_TO_NEW_CODE, AUSTRALIAN_ALLERGENS } from './allergen-data';

/**
 * Map of allergen codes to allergen objects for quick lookup
 */
export const ALLERGEN_MAP: Record<string, Allergen> = AUSTRALIAN_ALLERGENS.reduce(
  (acc, allergen) => {
    acc[allergen.code] = allergen;
    return acc;
  },
  {} as Record<string, Allergen>,
);

/** Get allergen display name from code */
export function getAllergenDisplayName(code: string): string {
  return ALLERGEN_MAP[code]?.displayName || code;
}

/** Get allergen object from code */
export function getAllergen(code: string): Allergen | undefined {
  return ALLERGEN_MAP[code];
}

/** Get all allergen codes */
export function getAllAllergenCodes(): string[] {
  return AUSTRALIAN_ALLERGENS.map(a => a.code);
}

/**
 * Match a keyword against text using word-boundary regex.
 * Prevents false positives like "egg" matching "eggplant".
 */
function textContainsAllergenKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

/**
 * Check if the full text indicates an exclusion for a given allergen.
 * e.g. "egg-free" should not trigger egg detection.
 */
function isExcludedFromAllergen(text: string, allergenCode: string): boolean {
  const exclusions = ALLERGEN_EXCLUSIONS[allergenCode];
  if (!exclusions) return false;
  const lowerText = text.toLowerCase();
  return exclusions.some(exclusion => lowerText.includes(exclusion));
}

/**
 * Check if a string contains allergen keywords using word-boundary matching.
 */
export function containsAllergenKeywords(text: string, allergenCode: string): boolean {
  const allergen = ALLERGEN_MAP[allergenCode];
  if (!allergen) return false;
  if (isExcludedFromAllergen(text, allergenCode)) return false;
  const keywords = [
    allergen.code,
    allergen.displayName.toLowerCase(),
    ...(allergen.commonNames || []),
  ];
  return keywords.some(keyword => textContainsAllergenKeyword(text, keyword));
}

/** Map old allergen codes to new consolidated codes */
export function mapToConsolidatedCode(code: string): string {
  return OLD_CODE_TO_NEW_CODE[code] || code;
}

/** Consolidate allergen array by mapping old codes to new and deduplicating */
export function consolidateAllergens(allergens: string[]): string[] {
  const mapped = allergens.map(mapToConsolidatedCode);
  return [...new Set(mapped)];
}

/**
 * Detect allergens from text using word-boundary keyword matching.
 * Returns array of consolidated allergen codes found in text.
 */
export function detectAllergensFromText(text: string): string[] {
  return Object.keys(detectAllergensFromTextWithSource(text));
}

/**
 * Detect allergens from text with per-allergen source information.
 * Returns a map of allergen code → 'keyword' for each detected allergen.
 */
export function detectAllergensFromTextWithSource(text: string): Record<string, 'keyword'> {
  const detected: Record<string, 'keyword'> = {};

  AUSTRALIAN_ALLERGENS.forEach(allergen => {
    if (isExcludedFromAllergen(text, allergen.code)) return;
    const keywords = [
      allergen.code,
      allergen.displayName.toLowerCase(),
      ...(allergen.commonNames || []),
    ];
    if (keywords.some(keyword => textContainsAllergenKeyword(text, keyword))) {
      detected[mapToConsolidatedCode(allergen.code)] = 'keyword';
    }
  });

  return detected;
}
