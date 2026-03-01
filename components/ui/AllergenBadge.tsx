/**
 * Allergen Badge Component
 * Displays a single allergen with icon and detection-source indicator.
 *
 * Sources:
 *  - 'manual'  → no indicator (user confirmed)
 *  - 'keyword' → subtle Search icon (keyword match)
 *  - 'ai'      → Sparkles icon (AI analysis)
 */

import { getAllergenDisplayName, getAllergen } from '@/lib/allergens/australian-allergens';
import type { AllergenDetectionSource } from '@/lib/allergens/hybrid-allergen-detection';
import { Icon } from './Icon';
import {
  Sparkles,
  Search,
  Nut,
  Milk,
  Egg,
  Bean,
  Wheat,
  Fish,
  CircleDot,
  Flower,
  AlertTriangle,
  Circle,
  LucideIcon,
} from 'lucide-react';

const ALLERGEN_ICONS: Record<string, LucideIcon> = {
  nuts: Nut,
  milk: Milk,
  eggs: Egg,
  soy: Bean,
  gluten: Wheat,
  fish: Fish,
  shellfish: Fish,
  sesame: CircleDot,
  lupin: Flower,
  sulphites: AlertTriangle,
  mustard: Circle,
};

const SOURCE_TOOLTIP: Record<AllergenDetectionSource, string> = {
  manual: 'Manually confirmed',
  keyword: 'Detected by keyword match',
  ai: 'Detected by AI analysis',
};

interface AllergenBadgeProps {
  allergenCode: string;
  source?: AllergenDetectionSource;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AllergenBadge({
  allergenCode,
  source,
  className = '',
  size = 'md',
}: AllergenBadgeProps) {
  const allergen = getAllergen(allergenCode);
  const displayName = allergen?.displayName || getAllergenDisplayName(allergenCode);
  const IconComponent = ALLERGEN_ICONS[allergenCode] ?? undefined;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  const baseDescription = allergen?.description || displayName;
  const tooltipText = source ? `${baseDescription} · ${SOURCE_TOOLTIP[source]}` : baseDescription;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)] ${sizeClasses[size]} ${className}`}
      title={tooltipText}
    >
      {IconComponent && (
        <Icon
          icon={IconComponent}
          size={iconSizes[size]}
          className="text-[var(--primary)]"
          aria-hidden={true}
        />
      )}
      <span>{displayName}</span>
      {source === 'ai' && (
        <Icon
          icon={Sparkles}
          size="xs"
          className="text-[var(--primary)] opacity-70"
          aria-label="AI detected"
        />
      )}
      {source === 'keyword' && (
        <Icon
          icon={Search}
          size="xs"
          className="text-[var(--primary)] opacity-50"
          aria-label="Keyword detected"
        />
      )}
    </span>
  );
}
