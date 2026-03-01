'use client';

import { Icon } from '@/components/ui/Icon';
import { Toggle } from '@/components/ui/Toggle';
import { useIsVisible } from '@/hooks/useIntersectionObserver';
import { useTheme } from '@/lib/theme/useTheme';
import { Moon, Sun } from 'lucide-react';
import React from 'react';

/**
 * Theme toggle panel component for settings page.
 * Allows users to switch between dark and light themes.
 *
 * @component
 * @returns {JSX.Element} Theme toggle panel
 */
export function ThemeTogglePanel() {
  const { theme: _theme, toggleTheme, isDark, isLight, isHydrated } = useTheme();
  const [ref, _isVisible] = useIsVisible<HTMLDivElement>({ threshold: 0.1 });
  const [isMounted, setIsMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use default values until hydrated to prevent mismatch
  const displayIsDark = isMounted && isHydrated ? isDark : true;
  const displayIsLight = isMounted && isHydrated ? isLight : false;

  return (
    <div
      ref={ref}
      className="mb-6 space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Theme</h2>
        <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
          Choose your preferred color theme. Light mode uses brighter colors while maintaining the
          Cyber Carrot design system.
        </p>
      </div>

      {/* Theme Toggle */}
      <div className="space-y-4 border-t border-[var(--border)] pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Icon
                icon={displayIsDark ? Moon : Sun}
                size="md"
                className="text-[var(--primary)]"
                aria-hidden={true}
              />
              <label
                className="text-sm font-medium text-[var(--foreground)]"
                suppressHydrationWarning
              >
                {displayIsDark ? 'Dark Mode' : 'Light Mode'}
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--foreground-subtle)]" suppressHydrationWarning>
              {displayIsDark
                ? 'Dark theme with Cyber Carrot accents'
                : 'Light theme with brighter colors and Cyber Carrot accents'}
            </p>
          </div>
          <Toggle
            checked={displayIsLight}
            onChange={toggleTheme}
            aria-label={displayIsDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={displayIsLight ? '' : '!bg-[var(--muted)]'}
          />
        </div>
      </div>
    </div>
  );
}
