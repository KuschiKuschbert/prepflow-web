'use client';

import GlobalWarning from '@/components/GlobalWarning';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { SubscriptionStatusBanner } from '@/components/ui/SubscriptionStatusBanner';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { logger } from '@/lib/logger';
import { useTheme } from '@/lib/theme/useTheme';
import { useTranslation } from '@/lib/useTranslation';
import React, { useCallback, useEffect, useState } from 'react';
import { CountryProvider } from '../../contexts/CountryContext';
import { GlobalWarningProvider, useGlobalWarning } from '../../contexts/GlobalWarningContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import '../globals.css';
import ModernNavigation from './components/ModernNavigation';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';

import {
  AchievementToast,
  BackgroundLogo,
  CatchTheDocketOverlay,
  DemoWelcomeToast,
  DraftRecovery,
  MilestoneToast,
  PersonalityScheduler,
  SafeAnimatedBackground,
  SafeGradientOrbs,
  SessionTimeoutWarning,
  WebappBackground,
} from './components/webapp-dynamic-imports';

export default function WebAppLayout({
  children,
  params: _params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
}>) {
  // Navigation preconnect optimization
  useEffect(() => {
    // Preconnect to critical domains after initial hydration
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://dev-7myakdl4itf644km.us.auth0.com',
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }, []);

  const { t: _t } = useTranslation();
  // Initialize theme system - applies data-theme attribute to document root
  useTheme();
  // Initialize as disabled - will be updated in useEffect after mount to prevent hydration mismatch
  const [disableArcadeOverlay, setDisableArcadeOverlay] = useState(false);

  // Session timeout configuration
  // 4 hours timeout with 15-minute warning (kitchen-optimized)
  // Use consistent values during SSR to prevent hydration mismatch
  const timeoutMs = process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS
    ? Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS)
    : 4 * 60 * 60 * 1000; // 4 hours default

  const warningMs = process.env.NEXT_PUBLIC_SESSION_WARNING_MS
    ? Number(process.env.NEXT_PUBLIC_SESSION_WARNING_MS)
    : 15 * 60 * 1000; // 15 minutes default

  // Memoize onTimeout handler to prevent useSessionTimeout from resetting its internal effects
  const handleTimeout = useCallback(async () => {
    // Logout via Auth0 SDK - redirects to Auth0 logout then back to home
    const returnTo = `${window.location.origin}/`;
    window.location.href = `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
  }, []);

  const { isWarning, remainingMs, resetTimeout } = useSessionTimeout({
    timeoutMs,
    warningMs,
    onTimeout: handleTimeout,
    enabled: true,
  });

  // Disable arcade overlay only when coming from Auth0 or when auth error is present
  useEffect(() => {
    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const fromAuth =
        typeof window !== 'undefined' ? window.location.pathname.startsWith('/api/auth') : false;
      const hasAuthError = search.includes('auth_error=1');
      const authFlag =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('PF_AUTH_IN_PROGRESS') === '1'
          : false;

      if (fromAuth || hasAuthError || authFlag) {
        setDisableArcadeOverlay(true);
      }

      // Clear the flag after landing on webapp
      if (authFlag) {
        sessionStorage.removeItem('PF_AUTH_IN_PROGRESS');
      }
    } catch (err) {
      // SessionStorage might fail in private mode - log but continue
      logger.dev('[WebAppLayout] Error accessing sessionStorage (non-blocking):', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  return (
    <NotificationProvider>
      <CountryProvider>
        <GlobalWarningProvider>
          <WebAppLayoutContent
            disableArcadeOverlay={disableArcadeOverlay}
            isWarning={isWarning}
            remainingMs={remainingMs}
            resetTimeout={resetTimeout}
          >
            {children}
          </WebAppLayoutContent>
        </GlobalWarningProvider>
      </CountryProvider>
    </NotificationProvider>
  );
}

// Inner component that has access to GlobalWarningContext
function WebAppLayoutContent({
  children,
  disableArcadeOverlay,
  isWarning,
  remainingMs,
  resetTimeout,
}: Readonly<{
  children: React.ReactNode;
  disableArcadeOverlay: boolean;
  isWarning: boolean;
  remainingMs: number | null;
  resetTimeout: () => void;
}>) {
  const { warnings } = useGlobalWarning();
  const hasWarnings = warnings.length > 0;

  // Update CSS variable for warning height when GlobalWarning notifies us
  const handleWarningHeightChange = React.useCallback((height: number) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--warning-height', `${height}px`);
    }
  }, []);

  // Reset warning height when warnings are cleared
  useEffect(() => {
    if (!hasWarnings && typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--warning-height', '0px');
    }
  }, [hasWarnings]);

  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-transparent font-[family-name:var(--font-geist-sans)] text-[var(--foreground)]">
      {/* Base background - theme-aware (dark: #0a0a0a, light: #ffffff) */}
      <div className="fixed inset-0 -z-20 bg-[var(--background)]" aria-hidden={true} />

      {/* Pulsating Concentric Circles Background */}
      <SafeAnimatedBackground theme={theme} />

      {/* Webapp Background Effects (spotlight, grid, glows, watermarks, particles) */}
      <WebappBackground
        spotlight={true}
        grid={true}
        cornerGlows={true}
        watermarks={true}
        particles={true}
        spotlightIntensity={0.06}
      />

      {/* Supplemental background layers - match landing page */}
      <SafeGradientOrbs />
      <BackgroundLogo />

      {/* Modern Navigation */}
      <ErrorBoundary>
        <ModernNavigation />
      </ErrorBoundary>

      {/* Network Status Banner */}
      <NetworkStatusBanner />

      {/* Subscription Status Banner */}
      <SubscriptionStatusBanner />

      {/* Global Warning System */}
      <GlobalWarning onHeightChange={handleWarningHeightChange} />

      {/* Draft Recovery */}
      <DraftRecovery />

      {/* Personality System Scheduler */}
      <PersonalityScheduler />

      {/* Achievement Toast */}
      <AchievementToast />

      {/* Milestone Toast */}
      <MilestoneToast />

      {/* Demo Welcome Toast */}
      <DemoWelcomeToast />

      {/* Main Content - responsive padding handled by CSS in globals.css */}
      <main className="webapp-main-content bg-transparent">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Arcade Loading Overlay (disabled around auth flows) */}
      {!disableArcadeOverlay && (
        <ErrorBoundary>
          <CatchTheDocketOverlay />
        </ErrorBoundary>
      )}

      {/* Session Timeout Warning */}
      <SessionTimeoutWarning
        isVisible={isWarning}
        remainingMs={remainingMs}
        onStayActive={resetTimeout}
      />
    </div>
  );
}
