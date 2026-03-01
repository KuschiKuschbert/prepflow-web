'use client';

import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { ResponsivePageContainer } from '@/components/ui/ResponsivePageContainer';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { getUserFirstName } from '@/lib/user-name';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LayoutDashboard } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { PageHeader } from './components/static/PageHeader';

// Static imports - needed immediately
import { TargetProgressWidget } from './components/TargetProgressWidget';
import { WeatherOperationalTip } from './components/WeatherOperationalTip';

const QuickActions = dynamic(() => import('./components/QuickActions'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-3xl bg-[#1f1f1f]" />,
});

// Dynamic imports - lazy load heavy dashboard components
const DashboardStatsClient = dynamic(() => import('./components/DashboardStatsClient'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const KitchenOperations = dynamic(() => import('./components/KitchenOperations'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const MenuOverview = dynamic(() => import('./components/MenuOverview'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const KitchenAlerts = dynamic(() => import('./components/KitchenAlerts'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const TemperatureStatus = dynamic(() => import('./components/TemperatureStatus'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const ChefPerformanceInsights = dynamic(() => import('./components/ChefPerformanceInsights'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const UpcomingFunctionsWidget = dynamic(() => import('./components/UpcomingFunctionsWidget'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const RecentActivity = dynamic(() => import('./components/RecentActivity'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

const KitchenCharts = dynamic(() => import('./components/KitchenCharts'), {
  ssr: false,
  loading: () => null, // Charts are non-critical, no loading state
});

export default function WebAppDashboard() {
  // Staggered hydration state - mounting widgets in sequence to reduce TBT
  // OPTIMIZATION: Start at stage 1 to render stats immediately
  const [mountStage, setMountStage] = useState(1);

  useEffect(() => {
    // Stage 2: Operations & Menus (very short delay)
    const t1 = setTimeout(() => setMountStage(2), 50);

    // Stage 3: Alerts & Temp
    const t2 = setTimeout(() => setMountStage(3), 150);

    // Stage 4: Insights & Charts
    const t3 = setTimeout(() => setMountStage(4), 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Record today's weather into daily_weather_logs once per day (session throttle)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const key = `weather_recorded_${today}`;
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(key)) {
      fetch('/api/weather/record-daily', { method: 'POST' })
        .then(res => {
          if (res.ok) sessionStorage.setItem(key, '1');
        })
        .catch(() => {});
    }
  }, []);

  const { user } = useUser();
  const displayName = getUserFirstName({
    name: user?.name,
    email: user?.email,
  });
  const subtitle = displayName
    ? `Welcome back, ${displayName}! Here's your kitchen overview`
    : "Welcome back! Here's your kitchen overview";

  return (
    <ResponsivePageContainer fullWidth={true}>
      <div className="tablet:px-6 tablet:py-6 desktop:px-8 large-desktop:px-12 large-desktop:max-w-[1400px] mx-auto min-h-screen max-w-[1400px] overflow-x-hidden bg-transparent py-4 xl:max-w-[1400px] xl:px-16 2xl:max-w-[1600px] 2xl:px-20">
        {/* Static Header - Renders Instantly */}
        <PageHeader
          title="Kitchen Management Dashboard"
          subtitle={subtitle}
          icon={LayoutDashboard}
        />

        <WeatherOperationalTip />

        {PAGE_TIPS_CONFIG.dashboard && (
          <div className="mb-6">
            <PageTipsCard config={PAGE_TIPS_CONFIG.dashboard} />
          </div>
        )}

        {/* Static Quick Actions - Renders Instantly */}
        <QuickActions />

        {/* Unified Dashboard Grid */}
        <div className="tablet:gap-6 desktop:gap-8 tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-6 xl:grid-cols-4 xl:gap-8">
          {/* Row 1: Immediate Dashboard Status (Stats & Targets) */}
          <div className="desktop:col-span-2 xl:col-span-3">
            <Suspense fallback={<PageSkeleton />}>
              {mountStage >= 1 && <DashboardStatsClient />}
            </Suspense>
          </div>

          <div className="desktop:col-span-1 col-span-1 xl:col-span-1">
            <Suspense fallback={null}>{mountStage >= 1 && <TargetProgressWidget />}</Suspense>
          </div>

          {/* Row 2: Critical Operations & Alerts (Functions, Alerts, Temp) */}
          <div className="tablet:col-span-2 col-span-1 xl:col-span-2">
            <Suspense fallback={null}>{mountStage >= 2 && <UpcomingFunctionsWidget />}</Suspense>
          </div>

          <div className="tablet:col-span-1 col-span-1 xl:col-span-1">
            <Suspense fallback={null}>{mountStage >= 3 && <KitchenAlerts />}</Suspense>
          </div>

          <div className="tablet:col-span-1 col-span-1 xl:col-span-1">
            <Suspense fallback={null}>{mountStage >= 3 && <TemperatureStatus />}</Suspense>
          </div>

          {/* Row 3: Daily Task Management (Kitchen Ops & Menu Overview) */}
          <div className="tablet:col-span-2 col-span-1 xl:col-span-2">
            <Suspense fallback={null}>{mountStage >= 2 && <KitchenOperations />}</Suspense>
          </div>

          <div className="tablet:col-span-2 col-span-1 xl:col-span-2">
            <Suspense fallback={null}>{mountStage >= 2 && <MenuOverview />}</Suspense>
          </div>

          {/* Row 4: Performance & History (Recent Activity & Insights) */}
          <div className="tablet:col-span-2 col-span-1 xl:col-span-2">
            <Suspense fallback={null}>{mountStage >= 4 && <RecentActivity />}</Suspense>
          </div>

          <div className="tablet:col-span-2 col-span-1 xl:col-span-2">
            <Suspense fallback={null}>{mountStage >= 4 && <ChefPerformanceInsights />}</Suspense>
          </div>

          {/* Row 5: Data Visualization (Full width Charts) */}
          <div className="tablet:col-span-2 desktop:col-span-3 col-span-1 mt-4 xl:col-span-4">
            <Suspense fallback={null}>{mountStage >= 4 && <KitchenCharts />}</Suspense>
          </div>
        </div>
      </div>
    </ResponsivePageContainer>
  );
}
