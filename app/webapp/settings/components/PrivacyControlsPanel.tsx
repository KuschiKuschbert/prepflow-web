'use client';

import { Icon } from '@/components/ui/Icon';
import { useNotification } from '@/contexts/NotificationContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useIsVisible } from '@/hooks/useIntersectionObserver';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AccountActivitySection } from './PrivacyControlsPanel/components/AccountActivitySection';
import { DataUsageSection } from './PrivacyControlsPanel/components/DataUsageSection';
import { handleCancelDeletionHelper } from './PrivacyControlsPanel/helpers/handleCancelDeletion';
import { handleDeleteHelper } from './PrivacyControlsPanel/helpers/handleDelete';
import { handleExportHelper } from './PrivacyControlsPanel/helpers/handleExport';
import { loadPrivacyDataHelper } from './PrivacyControlsPanel/helpers/loadPrivacyData';

interface DataUsage {
  usage: {
    ingredients: { count: number; size_bytes: number };
    recipes: { count: number; size_bytes: number };
    dishes: { count: number; size_bytes: number };
    temperature_logs: { count: number; size_bytes: number };
    cleaning_tasks: { count: number; size_bytes: number };
    compliance_records: { count: number; size_bytes: number };
  };
  total_size_bytes: number;
}

interface AccountActivity {
  id: string;
  action_type: string;
  entity_type: string;
  created_at: string;
}

/**
 * Enhanced privacy controls panel component for settings page.
 * Displays account activity, data usage, and data export/deletion options.
 *
 * @component
 * @returns {JSX.Element} Privacy controls panel
 */
export function PrivacyControlsPanel() {
  const { showSuccess, showError } = useNotification();
  const { showConfirm, ConfirmDialog } = useConfirm();
  const [ref, isVisible] = useIsVisible<HTMLDivElement>({ threshold: 0.1 });
  const [loading, setLoading] = useState(true);
  const [dataUsage, setDataUsage] = useState<DataUsage | null>(null);
  const [recentActivity, setRecentActivity] = useState<AccountActivity[]>([]);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    loadPrivacyDataHelper(setDataUsage, setRecentActivity, setLoading);
  }, [isVisible]);

  const handleExport = () => handleExportHelper(showSuccess, showError, setExporting);
  const handleDelete = () =>
    handleDeleteHelper(showConfirm, setDeletionRequested, showSuccess, showError, setDeleting);
  const handleCancelDeletion = () =>
    handleCancelDeletionHelper(showConfirm, setDeletionRequested, showSuccess, showError);

  if (loading) {
    return (
      <div
        ref={ref}
        className="mb-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-6"
      >
        <div className="h-6 w-48 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div
        ref={ref}
        className="mb-6 space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-6"
      >
        <div>
          <h2 className="text-xl font-semibold">Privacy & Data</h2>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            Manage your data, view activity, and control your privacy settings.
          </p>
        </div>

        <AccountActivitySection recentActivity={recentActivity} />
        {dataUsage && <DataUsageSection dataUsage={dataUsage} />}

        {/* Data Export */}
        <div className="space-y-3 border-t border-[var(--border)] pt-4">
          <h3 className="text-lg font-medium">Export Your Data</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Download a copy of all your data in JSON format. This includes ingredients, recipes,
            dishes, and all other data associated with your account.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-2 text-sm text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--muted)]/60 disabled:opacity-50"
          >
            <Icon icon={Download} size="sm" aria-hidden={true} />
            {exporting ? 'Exporting...' : 'Export My Data'}
          </button>
        </div>

        {/* Account Deletion */}
        <div className="space-y-3 border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-2">
            <Icon
              icon={AlertTriangle}
              size="md"
              className="text-[var(--color-error)]"
              aria-hidden={true}
            />
            <h3 className="text-lg font-medium text-[var(--color-error)]">Delete Your Account</h3>
          </div>
          {deletionRequested ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
              <p className="text-sm text-[var(--color-warning)]">
                Account deletion requested. Your account will be permanently deleted after a 7-day
                grace period. You can cancel this request anytime before then.
              </p>
              <button
                onClick={handleCancelDeletion}
                className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-2 text-sm text-[var(--color-warning)] transition-colors hover:bg-[var(--color-warning)]/20"
              >
                Cancel Deletion Request
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--foreground-muted)]">
                Permanently delete your account and all associated data. This action can&apos;t be
                undone. You&apos;ll have a 7-day grace period to cancel the deletion request.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-2xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-2 text-sm text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/20 disabled:opacity-50"
              >
                <Icon icon={Trash2} size="sm" aria-hidden={true} />
                {deleting ? 'Requesting...' : 'Request Account Deletion'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
