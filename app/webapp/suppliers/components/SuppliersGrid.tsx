'use client';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/lib/useTranslation';
import { Edit, FileText, Globe, Mail, Phone, Truck, User } from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersGridProps {
  suppliers: Supplier[];
}

export function SuppliersGrid({ suppliers }: SuppliersGridProps) {
  const { t } = useTranslation();

  if (suppliers.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10">
          <Icon icon={Truck} size="xl" className="text-[var(--primary)]" aria-hidden />
        </div>
        <h3 className="text-fluid-xl tablet:text-fluid-2xl mb-2 font-bold text-[var(--foreground)]">
          {t('suppliers.noSuppliers', 'No Suppliers Yet')}
        </h3>
        <p className="mx-auto max-w-xs text-[var(--foreground-muted)]">
          {t(
            'suppliers.addFirstSupplier',
            "Add your first supplier to start tracking where you buy ingredients. Hit the 'Add Supplier' button above to get started.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="adaptive-grid">
      {suppliers.map(supplier => (
        <div
          key={supplier.id}
          className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10">
              <Icon icon={Truck} size="lg" className="text-[var(--primary)]" aria-hidden={true} />
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                supplier.is_active
                  ? 'border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'border border-[var(--foreground-subtle)]/20 bg-[var(--foreground-subtle)]/10 text-[var(--foreground-muted)]'
              }`}
            >
              {supplier.is_active
                ? t('suppliers.active', 'Active')
                : t('suppliers.inactive', 'Inactive')}
            </span>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">{supplier.name}</h3>

          <div className="mb-4 space-y-2">
            {supplier.contact_person && (
              <div className="flex items-center space-x-2">
                <Icon
                  icon={User}
                  size="sm"
                  className="text-[var(--foreground-muted)]"
                  aria-hidden={true}
                />
                <span className="text-sm text-[var(--foreground-secondary)]">
                  {supplier.contact_person}
                </span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center space-x-2">
                <Icon
                  icon={Mail}
                  size="sm"
                  className="text-[var(--foreground-muted)]"
                  aria-hidden={true}
                />
                <a
                  href={`mailto:${supplier.email}`}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center space-x-2">
                <Icon
                  icon={Phone}
                  size="sm"
                  className="text-[var(--foreground-muted)]"
                  aria-hidden={true}
                />
                <a
                  href={`tel:${supplier.phone}`}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {supplier.phone}
                </a>
              </div>
            )}
            {supplier.website && (
              <div className="flex items-center space-x-2">
                <Icon
                  icon={Globe}
                  size="sm"
                  className="text-[var(--foreground-muted)]"
                  aria-hidden={true}
                />
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {supplier.website}
                </a>
              </div>
            )}
          </div>

          {supplier.payment_terms && (
            <div className="mb-2">
              <span className="text-sm text-[var(--foreground-muted)]">
                {t('suppliers.paymentTerms', 'Payment Terms')}:{' '}
              </span>
              <span className="text-sm text-[var(--foreground)]">{supplier.payment_terms}</span>
            </div>
          )}

          {supplier.delivery_schedule && (
            <div className="mb-2">
              <span className="text-sm text-[var(--foreground-muted)]">
                {t('suppliers.deliverySchedule', 'Delivery Schedule')}:{' '}
              </span>
              <span className="text-sm text-[var(--foreground)]">{supplier.delivery_schedule}</span>
            </div>
          )}

          {supplier.minimum_order_amount && (
            <div className="mb-2">
              <span className="text-sm text-[var(--foreground-muted)]">
                {t('suppliers.minimumOrder', 'Minimum Order')}:{' '}
              </span>
              <span className="text-sm text-[var(--foreground)]">
                ${supplier.minimum_order_amount}
              </span>
            </div>
          )}

          {supplier.notes && (
            <p className="mb-4 text-sm text-[var(--foreground-secondary)]">{supplier.notes}</p>
          )}

          <div className="flex space-x-4">
            <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-semibold text-[var(--button-active-text)] transition-all duration-200 hover:shadow-lg">
              <Icon
                icon={Edit}
                size="sm"
                className="text-[var(--button-active-text)]"
                aria-hidden={true}
              />
              {t('suppliers.edit', 'Edit')}
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[var(--muted)] px-4 py-2 font-semibold text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--surface-variant)]">
              <Icon
                icon={FileText}
                size="sm"
                className="text-[var(--foreground)]"
                aria-hidden={true}
              />
              {t('suppliers.addPriceList', 'Add Price List')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
