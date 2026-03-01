'use client';

import type { Customer } from '@/app/api/customers/helpers/schemas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Modal } from '@/components/ui/Modal';
import { ResponsivePageContainer } from '@/components/ui/ResponsivePageContainer';
import { useNotification } from '@/contexts/NotificationContext';
import { logger } from '@/lib/logger';
import { Building, Mail, Phone, Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { PageHeader } from '../components/static/PageHeader';
import type { CreateCustomerData } from './components/CreateCustomerForm';
import { CreateCustomerForm } from './components/CreateCustomerForm';

export default function CustomersPage() {
  const { showSuccess, showError } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search = '') => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/customers${query}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (err) {
      logger.error('Failed to fetch customers', { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  const handleCreateCustomer = async (data: CreateCustomerData) => {
    const tempId = `temp-${Date.now()}`;
    const tempCustomer: Customer = {
      id: tempId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone ?? null,
      company: data.company ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
    };
    const original = [...customers];
    setCustomers(prev => [...prev, tempCustomer]);
    setIsCreateModalOpen(false);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create customer');
      }

      const created = await response.json();
      setCustomers(prev => prev.map(c => (c.id === tempId ? created : c)));
      showSuccess('Customer added successfully');
    } catch (err) {
      setCustomers(original);
      setIsCreateModalOpen(true);
      showError(err instanceof Error ? err.message : 'Failed to create customer');
      throw err;
    }
  };

  return (
    <ResponsivePageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Customers CRM"
          subtitle="Manage your recurring clients and function organizers."
          icon={Users}
          actions={
            <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Icon icon={Plus} size="sm" className="mr-2" />
              Add Customer
            </Button>
          }
        />

        <PageTipsCard config={PAGE_TIPS_CONFIG.customers} className="mb-6" />

        {/* Search bar */}
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
            <Icon
              icon={Search}
              size="sm"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--foreground-muted)]"
            />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] py-2.5 pr-3 pl-9 text-sm text-[var(--foreground)] transition-colors placeholder:text-[var(--foreground-muted)] focus:border-transparent focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Data table */}
        <Card>
          <div className="overflow-hidden rounded-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <LoadingSkeleton variant="table" />
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-48 px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Icon
                          icon={Users}
                          size="lg"
                          className="text-[var(--foreground-muted)]"
                          aria-hidden
                        />
                        <p className="text-[var(--foreground-muted)]">No customers found.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateModalOpen(true)}
                        >
                          <Icon icon={Plus} size="sm" className="mr-2" /> Add your first customer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr
                      key={customer.id}
                      className="border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]/50"
                    >
                      <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                        {customer.first_name} {customer.last_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1 text-sm text-[var(--foreground-secondary)]">
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Icon icon={Mail} size="xs" /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Icon icon={Phone} size="xs" /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.company ? (
                          <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                            <Icon icon={Building} size="xs" /> {customer.company}
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--foreground-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/webapp/customers/${customer.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Customer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Customer"
        maxWidth="xl"
      >
        <CreateCustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </ResponsivePageContainer>
  );
}
