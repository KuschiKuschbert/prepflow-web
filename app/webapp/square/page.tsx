/**
 * Square POS Integration Page
 *
 * 📚 Complete Reference: See `docs/SQUARE_API_REFERENCE.md` for comprehensive Square API
 * configuration, setup, testing, and troubleshooting guide.
 *
 * Route: `/webapp/square`
 * Feature Flag: `square_pos_integration` (must be enabled in Settings → Feature Flags)
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ResponsivePageContainer } from '@/components/ui/ResponsivePageContainer';
import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { SquareNavigation } from './components/SquareNavigation';
import { OverviewSection } from './components/sections/OverviewSection';
import { ConfigurationSection } from './components/sections/ConfigurationSection';
import { SyncSection } from './components/sections/SyncSection';
import { MappingsSection } from './components/sections/MappingsSection';
import { HistorySection } from './components/sections/HistorySection';
import { WebhooksSection } from './components/sections/WebhooksSection';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { PageHeader } from '../components/static/PageHeader';

type SquareSection = 'overview' | 'configuration' | 'sync' | 'mappings' | 'history' | 'webhooks';

export default function SquarePage() {
  const { user: _user } = useUser();
  const squareEnabled = useFeatureFlag('square_pos_integration');
  const [activeSection, setActiveSection] = useState<SquareSection>('overview');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateSectionFromHash = () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash.slice(1);
      const validSections: SquareSection[] = [
        'overview',
        'configuration',
        'sync',
        'mappings',
        'history',
        'webhooks',
      ];

      if (validSections.includes(hash as SquareSection)) {
        // Update section immediately (no delay)
        setActiveSection(hash as SquareSection);

        // Scroll after a brief delay to allow render
        requestAnimationFrame(() => {
          const element = document.querySelector(`#${hash}`);
          if (element) {
            const headerHeight = window.innerWidth >= 1025 ? 64 : 56;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight - 20;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }
        });
      } else if (!hash) {
        setActiveSection('overview');
        if (typeof window !== 'undefined') {
          window.location.hash = '#overview';
        }
      }
    };

    updateSectionFromHash();

    const handleHashChange = () => {
      updateSectionFromHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isMounted) {
    return (
      <ResponsivePageContainer>
        <PageSkeleton />
      </ResponsivePageContainer>
    );
  }

  if (!squareEnabled) {
    return (
      <ResponsivePageContainer>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Square POS Integration</h2>
          <p className="mt-4 text-[var(--foreground-muted)]">
            This feature is currently disabled. Please contact an administrator to enable it.
          </p>
        </div>
      </ResponsivePageContainer>
    );
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'configuration':
        return <ConfigurationSection />;
      case 'sync':
        return <SyncSection />;
      case 'mappings':
        return <MappingsSection />;
      case 'history':
        return <HistorySection />;
      case 'webhooks':
        return <WebhooksSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <ResponsivePageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Square POS Integration"
          subtitle="Connect your Square POS system to sync menu items, staff, sales data, and food costs"
        />

        {PAGE_TIPS_CONFIG.square && (
          <div className="mb-6">
            <PageTipsCard config={PAGE_TIPS_CONFIG.square} />
          </div>
        )}

        <div className="desktop:flex-row desktop:gap-8 flex flex-col">
          {/* Navigation Sidebar */}
          <div className="desktop:w-64 desktop:flex-shrink-0">
            <SquareNavigation activeSection={activeSection} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {isMounted && (
              <div className="space-y-6">
                {/* Only render the active section to improve performance */}
                <div id={activeSection}>{renderSectionContent()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsivePageContainer>
  );
}
