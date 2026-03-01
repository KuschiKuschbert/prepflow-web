'use client';

import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function COGSPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/webapp/recipes#calculator');
  }, [router]);

  return <PageSkeleton />;
}
