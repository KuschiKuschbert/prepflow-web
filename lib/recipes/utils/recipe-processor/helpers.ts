/**
 * Recipe processor helpers. Extracted for filesize limit.
 */
import type { ScrapedRecipe } from '../../types';
import { scraperLogger } from '../logger';

const UNIT_CONVERSION_GUIDE = `## UNIT CONVERSION GUIDE (Reference - Follow Strictly)
**CRITICAL RULES:**
1. **NEVER show imperial units**
2. **Metric units only**
3. **Natural units in brackets**
4. **Solids vs Liquids**
**CONVERSION EXAMPLES:**
- "1 cup butter" → "225g butter"
- "1 bunch cilantro" → "15g (1 bunch) fresh cilantro"`;

export function buildFormattingPrompt(recipe: ScrapedRecipe): string {
  const ingredients = recipe.ingredients
    .map(ing =>
      typeof ing === 'string'
        ? ing
        : ing.original_text || `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim(),
    )
    .join('\n');
  const instructions = recipe.instructions.join('\n');
  return `${UNIT_CONVERSION_GUIDE}\n\n---\n\n## RECIPE FORMATTING TASK\n\nRecipe Name: ${recipe.recipe_name}\nIngredients:\n${ingredients}\n\nInstructions:\n${instructions}\n\nReturn ONLY valid JSON.`;
}

export async function generateTextWithOllama(
  prompt: string,
  options: { model?: string; timeout?: number } = {},
): Promise<{ response: string }> {
  const model = options.model || 'llama3.2:3b';
  const timeout = options.timeout || 90000;
  const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
  const systemPrompt =
    'You are a precise recipe formatter. Always respond with valid JSON only, no markdown, no explanations. Follow all conversion rules strictly.\n\n';
  const enhancedPrompt = systemPrompt + prompt;

  scraperLogger.debug('[Ollama] Generating text', { model, timeout });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: enhancedPrompt,
      stream: false,
      options: { temperature: 0.3, num_predict: -1, top_p: 0.9, top_k: 40 },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return { response: result.response || '' };
}
