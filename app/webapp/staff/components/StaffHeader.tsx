'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Plus, Users } from 'lucide-react';

interface StaffHeaderProps {
  selectedStatus: 'all' | 'active' | 'inactive' | 'terminated';
  onStatusChange: (status: 'all' | 'active' | 'inactive' | 'terminated') => void;
  onAddStaff: () => void;
}

export function StaffHeader({ selectedStatus, onStatusChange, onAddStaff }: StaffHeaderProps) {
  return (
    <>
      <div className="tablet:mb-6 desktop:mb-8 mb-4">
        <h1 className="text-fluid-xl tablet:text-fluid-2xl mb-2 flex items-center gap-2 font-bold text-[var(--foreground)]">
          <Icon icon={Users} size="lg" aria-hidden={true} />
          Staff Management
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Manage your team members, track certifications, and handle onboarding.
        </p>
      </div>

      <div className="tablet:flex-row tablet:items-center mb-6 flex flex-col items-start justify-between gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground-secondary)]">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={e =>
              onStatusChange(e.target.value as 'all' | 'active' | 'inactive' | 'terminated')
            }
            className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[var(--foreground)] focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <Button
          onClick={onAddStaff}
          variant="primary"
          size="sm"
          className="shadow-lg hover:shadow-xl"
        >
          <Icon icon={Plus} size="sm" aria-hidden /> Add Staff Member
        </Button>
      </div>
    </>
  );
}
