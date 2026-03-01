'use client';

import { Icon } from '@/components/ui/Icon';
import { Toggle } from '@/components/ui/Toggle';
import { useNotification } from '@/contexts/NotificationContext';
import { useIsVisible } from '@/hooks/useIntersectionObserver';
import { logger } from '@/lib/logger';
import { Bell, Mail, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationPreferences {
  email: {
    weeklyReports: boolean;
    securityAlerts: boolean;
    featureUpdates: boolean;
    marketing: boolean;
  };
  inApp: {
    personalityToasts: boolean;
    arcadeSounds: boolean;
    emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
  };
}

/**
 * Notifications panel component for settings page.
 * Manages email and in-app notification preferences.
 *
 * @component
 * @returns {JSX.Element} Notifications panel
 */
export function NotificationsPanel() {
  const { showSuccess, showError } = useNotification();
  const [ref, isVisible] = useIsVisible<HTMLDivElement>({ threshold: 0.1 });
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      weeklyReports: true,
      securityAlerts: true,
      featureUpdates: true,
      marketing: false,
    },
    inApp: {
      personalityToasts: true,
      arcadeSounds: true,
      emailDigest: 'weekly',
    },
  });

  useEffect(() => {
    if (!isVisible) return;

    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/notifications');
        if (!response.ok) {
          throw new Error('Failed to load preferences');
        }

        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        logger.error('Failed to load notification preferences:', error);
        showError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [isVisible, showError]);

  const updatePreference = async (path: string, value: boolean | string) => {
    const [category, key] = path.split('.');
    const updates: Record<string, Record<string, boolean | string>> = {
      [category]: {
        [key]: value,
      },
    };

    // Store original preferences for rollback
    const originalPreferences = { ...preferences };

    // Optimistically update UI immediately
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof NotificationPreferences],
        [key]: value,
      },
    }));

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update preferences');
      }

      showSuccess('Preferences updated successfully');
    } catch (error) {
      // Error - revert optimistic update
      setPreferences(originalPreferences);
      logger.error('Failed to update preferences:', error);
      showError(
        error instanceof Error ? error.message : 'Failed to update preferences. Please try again.',
      );
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string | React.ReactNode;
  }) => (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
        {description && (
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {typeof description === 'string' ? description : description}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
    </div>
  );

  if (loading) {
    return (
      <div
        ref={ref}
        className="mb-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
      >
        <div className="h-6 w-48 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="mb-6 space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Notifications & Preferences
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          Control how and when you receive notifications from PrepFlow.
        </p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-2">
          <Icon icon={Mail} size="md" className="text-[var(--primary)]" aria-hidden={true} />
          <h3 className="text-lg font-medium text-[var(--foreground)]">Email Notifications</h3>
        </div>
        <div className="space-y-4">
          <ToggleSwitch
            checked={preferences.email.weeklyReports}
            onChange={checked => updatePreference('email.weeklyReports', checked)}
            label="Weekly Reports"
            description="Receive weekly summaries of your restaurant performance"
          />
          <ToggleSwitch
            checked={preferences.email.securityAlerts}
            onChange={checked => updatePreference('email.securityAlerts', checked)}
            label="Security Alerts"
            description="Get notified about important security events"
          />
          <ToggleSwitch
            checked={preferences.email.featureUpdates}
            onChange={checked => updatePreference('email.featureUpdates', checked)}
            label="Feature Updates"
            description="Stay informed about new features and improvements"
          />
          <ToggleSwitch
            checked={preferences.email.marketing}
            onChange={checked => updatePreference('email.marketing', checked)}
            label="Marketing Emails"
            description="Receive tips, best practices, and promotional content"
          />
        </div>
      </div>

      {/* In-App Preferences */}
      <div className="space-y-4 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-2">
          <Icon icon={Bell} size="md" className="text-[var(--primary)]" aria-hidden={true} />
          <h3 className="text-lg font-medium text-[var(--foreground)]">In-App Preferences</h3>
        </div>
        <div className="space-y-4">
          <ToggleSwitch
            checked={preferences.inApp.personalityToasts}
            onChange={checked => updatePreference('inApp.personalityToasts', checked)}
            label="Personality Toasts"
            description="Show PrepFlow personality messages and tips"
          />
          <ToggleSwitch
            checked={preferences.inApp.arcadeSounds}
            onChange={checked => updatePreference('inApp.arcadeSounds', checked)}
            label="Arcade Sounds"
            description={
              preferences.inApp.arcadeSounds ? (
                <span className="flex items-center gap-1">
                  <Icon icon={Volume2} size="xs" aria-hidden={true} />
                  Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Icon icon={VolumeX} size="xs" aria-hidden={true} />
                  Disabled
                </span>
              )
            }
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Email Digest
            </label>
            <select
              value={preferences.inApp.emailDigest}
              onChange={e =>
                updatePreference(
                  'inApp.emailDigest',
                  e.target.value as NotificationPreferences['inApp']['emailDigest'],
                )
              }
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[var(--foreground)] focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              How often to receive summary emails of your activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
