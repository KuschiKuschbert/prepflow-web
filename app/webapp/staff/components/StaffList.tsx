'use client';

import { Icon } from '@/components/ui/Icon';
import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Employee, QualificationType } from '@/lib/types/roster';
import { UserPlus, Users } from 'lucide-react';
import { StaffCard } from './StaffCard';

interface StaffListProps {
  staff: Employee[];
  qualificationTypes: QualificationType[];
  onDelete: (id: string) => void;
  loading: boolean;
  totalCount?: number;
}

export function StaffList({
  staff,
  qualificationTypes,
  onDelete,
  loading,
  totalCount = 0,
}: StaffListProps) {
  if (loading) {
    return <PageSkeleton />;
  }

  if (staff.length === 0) {
    const isFilteredEmpty = totalCount > 0;
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10">
          <Icon
            icon={isFilteredEmpty ? Users : UserPlus}
            size="xl"
            className="text-[var(--primary)]"
            aria-hidden
          />
        </div>
        <h3 className="text-fluid-xl tablet:text-fluid-2xl mb-2 font-bold text-[var(--foreground)]">
          {isFilteredEmpty ? 'No Matches' : 'No Team Members Yet'}
        </h3>
        <p className="mx-auto max-w-xs text-[var(--foreground-muted)]">
          {isFilteredEmpty
            ? 'No team members match the selected filters. Try adjusting your status filter.'
            : 'Add your first team member to start building your roster and tracking qualifications.'}
        </p>
      </div>
    );
  }

  return (
    <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-6">
      {staff.map(member => (
        <StaffCard
          key={member.id}
          member={member}
          qualificationTypes={qualificationTypes}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
