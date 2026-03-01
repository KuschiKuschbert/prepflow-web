/**
 * Recipe Card Compact View Component
 * Displays the compact card view in the grid
 */
'use client';

import { Icon } from '@/components/ui/Icon';
import { QrCode } from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => ({ default: m.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="h-16 w-16 animate-pulse rounded bg-[#2a2a2a]" />,
});

interface RecipeCardCompactProps {
  id: string;
  title: string;
  isSubRecipe: boolean;
  usedByMenuItems?: Array<{
    menuItemId: string;
    menuItemName: string;
    quantity: number;
  }>;
  recipeUrl: string | null;
  showQR: boolean;
  onToggleQR: () => void;
  onCardClick: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isExpanded: boolean;
}

export function RecipeCardCompact({
  id: _id,
  title,
  isSubRecipe,
  usedByMenuItems,
  recipeUrl,
  showQR,
  onToggleQR,
  onCardClick,
  onKeyDown,
  isExpanded,
}: RecipeCardCompactProps) {
  return (
    <div
      className={`relative rounded-2xl border shadow-lg transition-all duration-300 ease-in-out ${
        isSubRecipe
          ? 'cursor-pointer border-[var(--accent)]/30 bg-[var(--surface)] hover:border-[var(--accent)]/50'
          : 'cursor-pointer border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50'
      }`}
      onClick={onCardClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Expand recipe card for ${title}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-[var(--foreground)]">{title}</h3>
            {isSubRecipe && usedByMenuItems && usedByMenuItems.length > 0 && (
              <p className="mt-0.5 truncate text-xs text-[var(--foreground-subtle)]">
                Used by {usedByMenuItems.length} {usedByMenuItems.length === 1 ? 'dish' : 'dishes'}
              </p>
            )}
          </div>

          {/* QR Code Toggle Button */}
          {recipeUrl && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleQR();
              }}
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                showQR
                  ? 'bg-[var(--primary)] text-[var(--button-active-text)]'
                  : 'bg-[var(--muted)] text-[var(--foreground-muted)] hover:bg-[var(--surface-variant)] hover:text-[var(--foreground)]'
              }`}
              aria-label={showQR ? 'Hide QR code' : 'Show QR code'}
              data-prep-input
            >
              <Icon icon={QrCode} size="sm" />
            </button>
          )}
        </div>

        {/* Mini QR Code - Shows when toggled */}
        {showQR && recipeUrl && (
          <div
            className="mt-3 flex flex-col items-center rounded-lg bg-[var(--qr-background)] p-2"
            onClick={e => e.stopPropagation()}
            data-prep-input
          >
            <QRCodeSVG value={recipeUrl} size={80} level="M" bgColor="#FFFFFF" fgColor="#000000" />
            <p className="mt-1 text-[8px] text-[var(--foreground-subtle)]">Scan to view recipe</p>
          </div>
        )}
      </div>
    </div>
  );
}
