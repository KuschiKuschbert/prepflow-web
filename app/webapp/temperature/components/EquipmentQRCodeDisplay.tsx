'use client';

import dynamic from 'next/dynamic';
import { RefObject } from 'react';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-64 items-center justify-center">
      <div className="animate-pulse rounded-xl bg-[var(--muted)] p-8">
        <div className="h-64 w-64"></div>
      </div>
    </div>
  ),
});

interface EquipmentQRCodeDisplayProps {
  equipmentUrl: string;
  baseUrl: string;
  printRef: RefObject<HTMLDivElement | null>;
}

export function EquipmentQRCodeDisplay({
  equipmentUrl,
  baseUrl,
  printRef,
}: EquipmentQRCodeDisplayProps) {
  return (
    <div
      ref={printRef}
      className="relative z-10 mb-2 flex min-h-0 flex-1 flex-col items-center justify-center"
    >
      {baseUrl ? (
        <>
          {/* Modern QR Code Container */}
          <div className="relative mb-2">
            {/* Outer glow effect */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 opacity-50 blur-lg" />

            {/* Frame wrapper with gradient border */}
            <div className="relative rounded-xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/70 to-[var(--accent)] p-0.5 shadow-lg">
              {/* Inner frame border */}
              <div className="relative rounded-xl bg-gradient-to-br from-[var(--accent)]/50 to-[var(--primary)]/50 p-0.5">
                {/* QR Code container */}
                <div className="qr-code-svg relative rounded-xl bg-[var(--qr-background)] p-3 shadow-2xl">
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-xl border-t-2 border-l-2 border-[var(--primary)] opacity-50" />
                  <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-xl border-t-2 border-r-2 border-[var(--accent)] opacity-50" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-[var(--primary)] opacity-50" />
                  <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-xl border-r-2 border-b-2 border-[var(--accent)] opacity-50" />

                  {/* QR Code */}
                  <div className="relative z-10 flex items-center justify-center">
                    <QRCodeSVG
                      value={equipmentUrl}
                      size={180}
                      level="H"
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  {/* Inner shadow for depth */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="mt-2 max-w-xs text-center">
            <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
              Scan with your phone camera to log temperature readings
            </p>
            <p className="mt-1 text-xs text-[var(--foreground-subtle)] italic">
              No app needed — just point and shoot, chef!
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="animate-pulse rounded-xl bg-[var(--muted)] p-6 shadow-xl">
            <div className="h-40 w-40 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20"></div>
          </div>
          <p className="text-center text-xs font-medium text-[var(--foreground-muted)]">
            Generating QR code...
          </p>
        </div>
      )}
    </div>
  );
}
