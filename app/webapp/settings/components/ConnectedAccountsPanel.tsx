'use client';

import { Icon } from '@/components/ui/Icon';
import { useNotification } from '@/contexts/NotificationContext';
import { useConfirm } from '@/hooks/useConfirm';
import { logger } from '@/lib/logger';
import { CheckCircle, Link as LinkIcon, Unlink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsVisible } from '@/hooks/useIntersectionObserver';

interface ConnectedAccount {
  provider: string;
  email: string;
  connected: boolean;
  connected_at: string | null;
}

/**
 * Connected accounts panel component for settings page.
 * Displays OAuth connections (Auth0, Google Drive, etc.)
 *
 * @component
 * @returns {JSX.Element} Connected accounts panel
 */
export function ConnectedAccountsPanel() {
  const { showSuccess: _showSuccess, showError } = useNotification();
  const { showConfirm, ConfirmDialog } = useConfirm();
  const [ref, isVisible] = useIsVisible<HTMLDivElement>({ threshold: 0.1 });
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    const loadAccounts = async () => {
      try {
        // Get current session to determine Auth0 connection
        const response = await fetch('/api/me');
        if (response.ok) {
          const data = await response.json();
          const userEmail = data.user?.email;

          // Build accounts list
          const connectedAccounts: ConnectedAccount[] = [
            {
              provider: 'Auth0',
              email: userEmail || 'Unknown',
              connected: true,
              connected_at: null, // Auth0 doesn't provide this
            },
            {
              provider: 'Google Drive',
              email: userEmail || 'Unknown',
              connected: false, // Check if backup feature uses Google Drive
              connected_at: null,
            },
          ];

          setAccounts(connectedAccounts);
        }
      } catch (error) {
        logger.error('Failed to load connected accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [isVisible]);

  const handleDisconnect = async (provider: string) => {
    const confirmed = await showConfirm({
      title: `Disconnect ${provider}?`,
      message: `Are you sure you want to disconnect ${provider}? You may lose access to some features.`,
      variant: 'warning',
      confirmLabel: 'Disconnect',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    try {
      // For Auth0, redirect to sign out
      if (provider === 'Auth0') {
        window.location.href = '/api/auth/signout';
        return;
      }

      // For other providers, implement disconnect logic
      showError(`Disconnecting ${provider} is not yet implemented`);
    } catch (error) {
      logger.error('Failed to disconnect account:', error);
      showError('Failed to disconnect account');
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      if (provider === 'Google Drive') {
        // Link to backup settings page
        window.location.href = '/webapp/settings/backup';
        return;
      }

      showError(`Connecting ${provider} is not yet implemented`);
    } catch (error) {
      logger.error('Failed to connect account:', error);
      showError('Failed to connect account');
    }
  };

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
        className="mb-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-6"
      >
        <div>
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            Manage your connected accounts and third-party integrations.
          </p>
        </div>

        <div className="space-y-3">
          {accounts.map(account => (
            <div
              key={account.provider}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
                  <Icon
                    icon={LinkIcon}
                    size="md"
                    className="text-[var(--primary)]"
                    aria-hidden={true}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--foreground)]">{account.provider}</p>
                    {account.connected && (
                      <Icon
                        icon={CheckCircle}
                        size="sm"
                        className="text-[var(--color-success)]"
                        aria-label="Connected"
                      />
                    )}
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">{account.email}</p>
                </div>
              </div>
              <div>
                {account.connected ? (
                  <button
                    onClick={() => handleDisconnect(account.provider)}
                    className="flex items-center gap-2 rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-3 py-1.5 text-sm text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/20"
                  >
                    <Icon icon={Unlink} size="sm" aria-hidden={true} />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(account.provider)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-1.5 text-sm text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--muted)]/60"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--foreground-subtle)]">
          Connected accounts allow you to access additional features and integrations. You can
          disconnect any account at any time.
        </p>
      </div>
    </>
  );
}
