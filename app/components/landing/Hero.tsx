'use client';

import { MagneticButton } from '@/components/ui/MagneticButton';
import { logger } from '@/lib/logger';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

interface HeroProps {
  onTourClick?: () => void;
  trackEngagement?: (event: string) => void;
}

export default function Hero({ onTourClick: _onTourClick, trackEngagement }: HeroProps) {
  const { user, isLoading: _isLoading } = useUser();
  const isAuthenticated = !!user;

  const handleSignIn = () => {
    if (trackEngagement) {
      trackEngagement('hero_sign_in_click');
    }
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('PF_AUTH_IN_PROGRESS', '1');
      }
    } catch (err) {
      // SessionStorage might fail in private mode - log but continue
      logger.dev('[Hero] Error accessing sessionStorage (non-blocking):', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    window.location.href = '/api/auth/login?returnTo=/webapp';
  };

  const handleRegister = () => {
    if (trackEngagement) {
      trackEngagement('hero_register_click');
    }
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('PF_AUTH_IN_PROGRESS', '1');
      }
    } catch (err) {
      // SessionStorage might fail in private mode - log but continue
      logger.dev('[Hero] Error accessing sessionStorage (non-blocking):', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    window.location.href = '/api/auth/login?returnTo=/webapp';
  };

  const handleGoToDashboard = () => {
    if (trackEngagement) {
      trackEngagement('hero_go_to_dashboard_click');
    }
    window.location.href = '/webapp';
  };

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-transparent">
      <div className="tablet:py-20 mx-auto w-full max-w-7xl px-6 py-16 text-center">
        {/* Headline - rendered immediately for fastest LCP */}
        <div className="mb-12">
          <h1 className="text-fluid-5xl tablet:text-fluid-6xl desktop:text-fluid-7xl large-desktop:text-fluid-7xl xl:text-fluid-8xl font-light tracking-tight text-white">
            PrepFlow
          </h1>
          <p className="text-fluid-xl tablet:text-fluid-2xl desktop:text-fluid-3xl mt-8 font-light text-gray-300">
            Know your costs. Price with confidence.
          </p>
        </div>

        {/* CTAs */}
        <div className="tablet:flex-row mt-16 flex flex-col items-center justify-center gap-4">
          {isAuthenticated ? (
            <MagneticButton
              onClick={handleGoToDashboard}
              className="text-fluid-lg rounded-full border border-white/20 bg-gradient-to-r from-[#29E7CD] via-[#FF6B00] to-[#D925C7] px-8 py-3 font-medium text-white transition-all hover:opacity-90 focus:ring-2 focus:ring-white/50 focus:outline-none"
              aria-label="Go to Dashboard"
              strength={0.4}
              maxDistance={15}
            >
              Go to Dashboard
            </MagneticButton>
          ) : (
            <>
              <MagneticButton
                onClick={handleRegister}
                className="text-fluid-base tablet:text-fluid-lg rounded-full border border-white/20 bg-gradient-to-r from-[#29E7CD] via-[#FF6B00] to-[#D925C7] px-10 py-4 font-normal text-white transition-all hover:opacity-90 focus:ring-2 focus:ring-white/50 focus:outline-none"
                aria-label="Register for PrepFlow"
                strength={0.4}
                maxDistance={15}
              >
                Get Started
              </MagneticButton>
              <MagneticButton
                onClick={handleSignIn}
                className="text-fluid-base tablet:text-fluid-lg rounded-full border border-white/20 bg-transparent px-10 py-4 font-normal text-white transition-all hover:bg-white/10 focus:ring-2 focus:ring-white/50 focus:outline-none"
                aria-label="Sign in to PrepFlow"
                strength={0.4}
                maxDistance={15}
              >
                Sign In
              </MagneticButton>
            </>
          )}
        </div>

        {/* Dashboard Screenshot - MacBook Pro Style */}
        {/* Dashboard Screenshot - MacBook Pro Style */}
        {/* LCP OPTIMIZATION: Removed ScrollReveal to prevent 0.4s delay. Image loads immediately. */}
        <div className="mt-24 flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <div className="bg-surface/30 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]">
              <Image
                src="/images/dashboard-screenshot.png"
                alt="PrepFlow Dashboard showing kitchen management overview"
                width={1920}
                height={1080}
                className="h-auto w-full"
                priority
                fetchPriority="high"
                quality={80} // Reduced from 90 for performance
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              />
            </div>
          </div>
        </div>

        {/* Smooth Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="h-6 w-6 text-white/60"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
