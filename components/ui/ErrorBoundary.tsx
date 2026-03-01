'use client';
import { useErrorMessageSelector } from '@/components/ErrorGame/useErrorMessageSelector';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

import { logger } from '@/lib/logger';

// Wrapper component to use hook in class component context
const ErrorMessageDisplay: React.FC = () => {
  const ErrorComponent = useErrorMessageSelector();
  // eslint-disable-next-line react-hooks/static-components
  return <ErrorComponent />;
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report to Sentry with component stack context
    Sentry.withScope(scope => {
      scope.setContext('react', { componentStack: errorInfo.componentStack });
      scope.setTag('error_boundary', 'true');
      Sentry.captureException(error);
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to analytics if available
    const win = window as unknown as {
      gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
    };
    if (typeof window !== 'undefined' && win.gtag) {
      win.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      // Use provided fallback if any
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback, but suppress on auth routes or mobile devices
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const disableArcadeErrors = (() => {
        try {
          if (typeof window === 'undefined') return false;
          // Check explicit flag first
          if (localStorage.getItem('PF_DISABLE_ARCADE_ERRORS') === '1') return true;
          // Auto-disable on mobile/touch devices
          if (typeof navigator !== 'undefined') {
            const hasTouch =
              navigator.maxTouchPoints > 0 ||
              'ontouchstart' in window ||
              (window as unknown as { DocumentTouch: unknown }).DocumentTouch !== undefined;
            const forceEnable = localStorage.getItem('PF_ENABLE_ARCADE_MOBILE') === '1';
            if (hasTouch && !forceEnable) return true;
          }
          return false;
        } catch (_) {
          logger.error('[ErrorBoundary.tsx] Error in catch block:', {
            error: _ instanceof Error ? _.message : String(_),
            stack: _ instanceof Error ? _.stack : undefined,
          });

          return false;
        }
      })();
      if (
        disableArcadeErrors ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/callback') ||
        pathname.startsWith('/authorize')
      ) {
        return null;
      }

      return <ErrorMessageDisplay />;
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    logger.error('Error caught by useErrorHandler:', { error, errorInfo });

    Sentry.captureException(error);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }, []);

  return { handleError };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;
