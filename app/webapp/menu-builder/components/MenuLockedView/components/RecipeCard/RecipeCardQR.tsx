/**
 * Recipe Card QR Code Section Component
 */
'use client';

import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => ({ default: m.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="h-12 w-12 animate-pulse rounded bg-[#2a2a2a]" />,
});

interface RecipeCardQRProps {
  recipeUrl: string;
}

export function RecipeCardQR({ recipeUrl }: RecipeCardQRProps) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[var(--qr-background)] p-2">
          <QRCodeSVG value={recipeUrl} size={64} level="M" bgColor="#FFFFFF" fgColor="#000000" />
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--foreground)]">📱 Scan for Instructions</p>
          <p className="text-[10px] text-[var(--foreground-subtle)]">
            Access this recipe on any device
          </p>
        </div>
      </div>
      <a
        href={recipeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-[var(--primary)]/20 px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/30"
        onClick={e => e.stopPropagation()}
      >
        Open Recipe
      </a>
    </div>
  );
}
