/**
 * Main guide page.
 * Orchestrates guide selection, navigation, and viewing.
 */

'use client';

import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { PrintButton } from '@/components/ui/PrintButton';
import { ExportButton } from '@/components/ui/ExportButton';
import { GuideNavigation } from './components/GuideNavigation';
import { GuideViewer } from './components/GuideViewer';
import { RelatedGuides } from './components/RelatedGuides';
import { formatGuideForPrint } from './utils/formatGuideForPrint';
import { printWithTemplate } from '@/lib/exports/print-template';
import { exportHTMLReport } from '@/lib/exports/export-html';
import { getGuideById } from './data/guides';
import type { Guide } from './data/guide-types';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { useGuideAnalytics } from './hooks/useGuideAnalytics';
import { useGuideNavigation } from './hooks/useGuideNavigation';
import { useGuideProgress } from './hooks/useGuideProgress';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function GuidePageContent() {
  const searchParams = useSearchParams();
  const appliedRef = useRef<string | null>(null);
  const router = useRouter();
  const {
    currentGuide,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    setGuide,
    nextStep,
    prevStep,
    goToStep,
    reset,
  } = useGuideNavigation();

  const { getProgress, updateProgress, markStepComplete, markGuideComplete, isGuideComplete } =
    useGuideProgress();

  // Deep-link support: /webapp/guide?guide=getting-started&step=2
  // When URL has no step param, fall back to saved progress
  useEffect(() => {
    const guideId = searchParams.get('guide');
    const stepParam = searchParams.get('step');
    const key = `${guideId ?? ''}-${stepParam ?? ''}`;
    if (guideId && appliedRef.current !== key) {
      appliedRef.current = key;
      const guide = getGuideById(guideId);
      if (guide) {
        let stepIndex: number | undefined;
        if (stepParam !== null) {
          const parsed = parseInt(stepParam, 10);
          const validStep = !Number.isNaN(parsed) && parsed >= 0 && parsed < guide.steps.length;
          stepIndex = validStep ? parsed : undefined;
        }
        if (stepIndex === undefined && !isGuideComplete(guideId)) {
          const saved = getProgress(guideId);
          if (
            saved != null &&
            saved.currentStepIndex >= 0 &&
            saved.currentStepIndex < guide.steps.length
          ) {
            stepIndex = saved.currentStepIndex;
          }
        }
        setGuide(guide, stepIndex);
      }
    }
    if (!guideId) appliedRef.current = null;
  }, [searchParams, setGuide, getProgress, isGuideComplete]);

  // Analytics tracking
  const { onSelectGuide, onNextStep, onPrevStep, onComplete, onBackToList } = useGuideAnalytics({
    currentGuide,
    currentStepIndex,
    currentStep,
    progress,
    markStepComplete,
    markGuideComplete,
    updateProgress,
  });

  const syncGuideUrl = (guideId: string, stepIndex: number) => {
    router.replace(`/webapp/guide?guide=${guideId}&step=${stepIndex}`, { scroll: false });
  };

  const handleSelectGuide = (guide: Guide) => {
    let initialStep: number | undefined = undefined;
    if (!isGuideComplete(guide.id)) {
      const saved = getProgress(guide.id);
      if (
        saved != null &&
        saved.currentStepIndex >= 0 &&
        saved.currentStepIndex < guide.steps.length
      ) {
        initialStep = saved.currentStepIndex;
      }
    }
    const step = initialStep ?? 0;
    setGuide(guide, step);
    syncGuideUrl(guide.id, step);
    onSelectGuide(guide);
  };

  const handleNext = () => {
    if (currentGuide && currentStepIndex !== undefined) {
      markStepComplete(currentGuide.id, currentStepIndex);
      onNextStep();
    }
    nextStep();
    if (currentGuide && !isLastStep) {
      syncGuideUrl(currentGuide.id, currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    onPrevStep();
    prevStep();
    if (currentGuide && !isFirstStep) {
      syncGuideUrl(currentGuide.id, currentStepIndex - 1);
    }
  };

  const handleGoToStep = (index: number) => {
    if (currentGuide && index >= 0 && index < currentGuide.steps.length) {
      goToStep(index);
      syncGuideUrl(currentGuide.id, index);
    }
  };

  const handleReset = () => {
    reset();
    router.replace('/webapp/guide', { scroll: false });
  };

  const handleBackToList = () => {
    onBackToList(handleReset);
  };

  const handleComplete = () => {
    onComplete(handleReset, markGuideComplete);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="desktop:px-8 large-desktop:max-w-[1400px] mx-auto max-w-[1400px] px-4 py-8 xl:max-w-[1400px] 2xl:max-w-[1600px]">
        {!currentGuide ? (
          // Guide selection view
          <div className="space-y-8">
            {PAGE_TIPS_CONFIG.guide && (
              <div className="mb-6">
                <PageTipsCard config={PAGE_TIPS_CONFIG.guide} />
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-fluid-3xl font-bold text-[var(--foreground)]">PrepFlow Guides</h1>
              <p className="text-fluid-base text-[var(--foreground-muted)]">
                Learn how to use PrepFlow with step-by-step guides, interactive demos, and visual
                walkthroughs.
              </p>
            </div>
            <GuideNavigation onSelectGuide={handleSelectGuide} getProgress={getProgress} />
          </div>
        ) : (
          // Guide viewer with related guides sidebar
          <div className="desktop:grid desktop:grid-cols-[1fr_280px] desktop:gap-8 desktop:space-y-0 space-y-6">
            <div className="min-w-0 space-y-6">
              {/* Header with back button */}
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={handleBackToList}
                    className="mb-2 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--primary)]"
                    aria-label="Back to guide list"
                  >
                    ← Back to Guides
                  </button>
                  <h1 className="text-fluid-2xl font-bold text-[var(--foreground)]">
                    {currentGuide.title}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {currentGuide.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <PrintButton
                      onClick={() =>
                        printWithTemplate({
                          title: currentGuide.title,
                          subtitle: currentGuide.description,
                          content: formatGuideForPrint(currentGuide),
                          totalItems: currentGuide.steps.length,
                          variant: 'compact',
                        })
                      }
                      size="sm"
                      label="Print guide"
                    />
                    <ExportButton
                      onExport={format => {
                        if (format === 'html') {
                          exportHTMLReport({
                            title: currentGuide.title,
                            subtitle: currentGuide.description,
                            content: formatGuideForPrint(currentGuide),
                            filename: `prepflow-guide-${currentGuide.id}-${new Date().toISOString().split('T')[0]}.html`,
                            totalItems: currentGuide.steps.length,
                          });
                        }
                      }}
                      availableFormats={['html']}
                      size="sm"
                      label="Export guide"
                    />
                  </div>
                  <span className="text-sm text-[var(--foreground-subtle)]">
                    Step {currentStepIndex + 1} of {currentGuide.steps.length}
                  </span>
                </div>
              </div>
              {/* Step indicator dots - clickable to jump to step */}
              <div className="flex gap-2">
                {currentGuide.steps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleGoToStep(index)}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      index === currentStepIndex
                        ? 'bg-[var(--primary)]'
                        : index < currentStepIndex
                          ? 'bg-[var(--primary)]/50'
                          : 'bg-[var(--muted)]'
                    } hover:opacity-80 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none`}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                    aria-current={index === currentStepIndex ? 'step' : undefined}
                  />
                ))}
              </div>
              {/* Guide viewer */}
              {currentStep && (
                <GuideViewer
                  step={currentStep}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onComplete={handleComplete}
                  isFirstStep={isFirstStep}
                  isLastStep={isLastStep}
                  progress={progress}
                />
              )}
            </div>
            <aside className="min-w-0">
              <RelatedGuides currentGuideId={currentGuide.id} onSelectGuide={handleSelectGuide} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GuidePageContent />
    </Suspense>
  );
}
