/**
 * Allergen Display Component
 * Displays an array of allergens as badges, with per-allergen source indicators
 * when the enriched allergen_source.perAllergen map is provided.
 */

import type { AllergenDetectionSource } from '@/lib/allergens/hybrid-allergen-detection';
import { AllergenBadge } from './AllergenBadge';

interface AllergenDisplayProps {
  allergens: string[];
  allergenSource?: {
    manual?: boolean;
    ai?: boolean;
    /** Per-allergen detection source map (v2+) */
    perAllergen?: Record<string, AllergenDetectionSource>;
  };
  showEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** When true, shows grouped sections by detection source with a legend */
  groupBySource?: boolean;
}

/** Derive the source for a single allergen code from the allergen_source record */
function resolveAllergenSource(
  allergenCode: string,
  allergenSource?: AllergenDisplayProps['allergenSource'],
): AllergenDetectionSource | undefined {
  if (!allergenSource) return undefined;
  // Prefer per-allergen granular data (v2)
  if (allergenSource.perAllergen?.[allergenCode]) {
    return allergenSource.perAllergen[allergenCode];
  }
  // Fall back to global flags
  if (allergenSource.manual) return 'manual';
  if (allergenSource.ai) return 'ai';
  return undefined;
}

export function AllergenDisplay({
  allergens,
  allergenSource,
  showEmpty = true,
  emptyMessage = 'No allergens',
  className = '',
  size = 'md',
  groupBySource = false,
}: AllergenDisplayProps) {
  if (!allergens || allergens.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className={`text-sm text-[var(--foreground-muted)] ${className}`}>
        <span className="italic">{emptyMessage}</span>
      </div>
    );
  }

  // Grouped view: separate sections per source with a small legend
  if (groupBySource && allergenSource) {
    const bySource: Record<AllergenDetectionSource, string[]> = {
      manual: [],
      keyword: [],
      ai: [],
    };

    allergens.forEach(code => {
      const src = resolveAllergenSource(code, allergenSource) ?? 'manual';
      bySource[src].push(code);
    });

    const hasMixed =
      (bySource.manual.length > 0 ? 1 : 0) +
        (bySource.keyword.length > 0 ? 1 : 0) +
        (bySource.ai.length > 0 ? 1 : 0) >
      1;

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {bySource.manual.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bySource.manual.map(code => (
              <AllergenBadge key={code} allergenCode={code} source="manual" size={size} />
            ))}
          </div>
        )}
        {bySource.keyword.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bySource.keyword.map(code => (
              <AllergenBadge key={code} allergenCode={code} source="keyword" size={size} />
            ))}
          </div>
        )}
        {bySource.ai.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bySource.ai.map(code => (
              <AllergenBadge key={code} allergenCode={code} source="ai" size={size} />
            ))}
          </div>
        )}
        {hasMixed && (
          <p className="text-xs text-gray-500">
            🔍 keyword match &nbsp;·&nbsp; ✨ AI analysis &nbsp;·&nbsp; no icon = manually confirmed
          </p>
        )}
      </div>
    );
  }

  // Default flat view — show each badge with its individual source
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {allergens.map(code => (
        <AllergenBadge
          key={code}
          allergenCode={code}
          source={resolveAllergenSource(code, allergenSource)}
          size={size}
        />
      ))}
    </div>
  );
}
