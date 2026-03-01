/**
 * Hook for intersection observer to detect when elements enter viewport.
 * Useful for lazy loading components only when they become visible.
 *
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Threshold for intersection (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @returns {Object} Hook return value
 * @returns {React.RefObject<T>} returns.ref - Ref to attach to element
 * @returns {boolean} returns.isIntersecting - Whether element is intersecting viewport
 *
 * @example
 * ```typescript
 * const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
 * return <div ref={ref}>{isIntersecting && <HeavyComponent />}</div>;
 * ```
 */
'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '50px',
  enabled = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      },
    );

    const currentRef = ref.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, enabled]);

  return { ref, isIntersecting };
}

/**
 * Convenience wrapper returning a [ref, isVisible] tuple.
 * Drop-in replacement for the former standalone useIsVisible hook.
 */
export function useIsVisible<T extends HTMLElement = HTMLElement>(options?: {
  threshold?: number | number[];
  rootMargin?: string;
}): [React.RefObject<T | null>, boolean] {
  const threshold =
    typeof options?.threshold === 'number' ? options.threshold : (options?.threshold?.[0] ?? 0.1);
  const { ref, isIntersecting } = useIntersectionObserver<T>({
    threshold,
    rootMargin: options?.rootMargin ?? '0px',
  });
  return [ref, isIntersecting];
}
