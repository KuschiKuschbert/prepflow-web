'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useErrorMessageSelector } from '@/components/ErrorGame/useErrorMessageSelector';
import { usePathname } from 'next/navigation';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const pathname = usePathname();
  const ErrorComponent = useErrorMessageSelector();

  // Report the error to Sentry once on mount
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  if (
    pathname &&
    (pathname.startsWith('/api/auth') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/auth'))
  ) {
    return (
      <html>
        <body />
      </html>
    );
  }

  return (
    <html>
      <body>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <ErrorComponent />
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              background: '#29E7CD',
              color: '#0a0a0a',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
