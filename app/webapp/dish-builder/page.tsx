'use client';

import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DishBuilderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/webapp/recipes?builder=true#dishes');
  }, [router]);

  return <PageSkeleton />;
}
