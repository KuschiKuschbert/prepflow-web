'use client';

import { Icon } from '@/components/ui/Icon';
import { Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { QRCodeEntity } from '../types';

interface QRCodeCardProps {
  entity: QRCodeEntity;
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * QR code card component
 */
export function QRCodeCard({ entity, isSelected, onToggle }: QRCodeCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`relative cursor-pointer rounded-xl border p-2 select-none ${
        isSelected
          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)]'
      }`}
    >
      {/* Selection Checkbox */}
      <div
        className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full ${
          isSelected ? 'bg-[var(--primary)]' : 'border border-[var(--border)] bg-[var(--muted)]'
        }`}
      >
        {isSelected && <Icon icon={Check} size="xs" className="text-[var(--button-active-text)]" />}
      </div>

      {/* QR Code */}
      <div className="mb-1.5 flex justify-center rounded-lg bg-[var(--qr-background)] p-1.5">
        <QRCodeSVG
          value={entity.destinationUrl}
          size={48}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {/* Info */}
      <div className="text-center">
        <div
          className="truncate text-[10px] font-medium text-[var(--foreground)]"
          title={entity.name}
        >
          {entity.name}
        </div>
        {entity.subtitle && (
          <div className="truncate text-[8px] text-[var(--foreground-subtle)]">
            {entity.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
