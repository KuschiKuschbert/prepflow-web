'use client';

import type { AppFunction } from '@/app/api/functions/helpers/schemas';
import { getCachedData, cacheData } from '@/lib/cache/data-cache';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/hooks/useConfirm';
import { format, parseISO } from 'date-fns';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FunctionsWeatherAlerts } from '@/app/webapp/components/FunctionsWeatherAlerts';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { PageHeader } from '../components/static/PageHeader';
import type { CreateFunctionData } from './components/CreateFunctionForm';
import { CreateFunctionForm } from './components/CreateFunctionForm';
import { MiniCalendarPanel } from './components/MiniCalendarPanel';

type ExtendedFunction = AppFunction & {
  customers?: {
    first_name: string;
    last_name: string;
    company: string | null;
  } | null;
};

type CustomerOption = {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
};

function formatTimeStr(time: string | null | undefined): string {
  if (!time) return '';
  try {
    return format(new Date(`1970-01-01T${time}`), 'h:mm a');
  } catch {
    return time;
  }
}

function getDateDisplay(func: ExtendedFunction): { primary: string; secondary: string | null } {
  const startDate = format(parseISO(func.start_date), 'MMM do, yyyy');
  const startTime = formatTimeStr(func.start_time);

  if (func.same_day || !func.end_date || func.end_date === func.start_date) {
    const timePart =
      startTime && func.end_time
        ? `${startTime} — ${formatTimeStr(func.end_time)}`
        : startTime || null;
    return { primary: startDate, secondary: timePart };
  }

  const endDate = format(parseISO(func.end_date), 'MMM do, yyyy');
  return {
    primary: `${startDate} — ${endDate}`,
    secondary: startTime ? `${startTime} start` : null,
  };
}

function getDayCount(func: ExtendedFunction): number {
  if (!func.end_date || func.same_day) return 1;
  return Math.max(
    1,
    Math.round(
      (new Date(func.end_date).getTime() - new Date(func.start_date).getTime()) / 86400000,
    ) + 1,
  );
}

const CACHE_KEY_FUNCTIONS = 'functions_list';
const CACHE_KEY_CUSTOMERS = 'functions_customers';

export default function FunctionsPage() {
  // Cache-first: initialize from cache for instant display on repeat visits
  const [functions, setFunctions] = useState<ExtendedFunction[]>(
    () => getCachedData<ExtendedFunction[]>(CACHE_KEY_FUNCTIONS) ?? [],
  );
  const [isLoading, setIsLoading] = useState(() => !getCachedData(CACHE_KEY_FUNCTIONS));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>(
    () => getCachedData<CustomerOption[]>(CACHE_KEY_CUSTOMERS) ?? [],
  );
  const { showConfirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchFunctions();
    fetchCustomers();
  }, []);

  const fetchFunctions = async () => {
    if (!getCachedData(CACHE_KEY_FUNCTIONS)) setIsLoading(true);
    try {
      const response = await fetch('/api/functions', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setFunctions(list);
        cacheData(CACHE_KEY_FUNCTIONS, list);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setCustomerOptions(list);
        cacheData(CACHE_KEY_CUSTOMERS, list);
      }
    } catch {
      // Non-critical
    }
  };

  const handleCreateFunction = async (data: CreateFunctionData) => {
    const response = await fetch('/api/functions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setIsCreateModalOpen(false);
      await fetchFunctions();
    }
  };

  const handleDeleteFunction = useCallback(
    async (func: ExtendedFunction) => {
      const confirmed = await showConfirm({
        title: `Delete ${func.name}?`,
        message:
          "This will permanently remove the event and its entire runsheet. Can't undo this one, chef.",
        variant: 'danger',
        confirmLabel: 'Delete',
        cancelLabel: 'Keep it',
      });
      if (!confirmed) return;

      const original = [...functions];
      setFunctions(prev => prev.filter(f => f.id !== func.id));
      const res = await fetch(`/api/functions/${func.id}`, { method: 'DELETE' });
      if (!res.ok) setFunctions(original);
    },
    [functions, showConfirm],
  );

  const now = useMemo(() => new Date(), []);

  const filteredFunctions = useMemo(() => {
    return functions
      .filter(e => {
        if (selectedDate) {
          try {
            const startStr = e.start_date.slice(0, 10);
            const endStr = e.end_date ? e.end_date.slice(0, 10) : startStr;
            const dayStr = format(selectedDate, 'yyyy-MM-dd');
            return dayStr >= startStr && dayStr <= endStr;
          } catch {
            return false;
          }
        }
        return true;
      })
      .filter(
        e =>
          !searchQuery ||
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.customers?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.customers?.last_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        const aDate = new Date(a.start_date).getTime();
        const bDate = new Date(b.start_date).getTime();
        const nowMs = now.getTime();
        const aUpcoming = aDate >= nowMs;
        const bUpcoming = bDate >= nowMs;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        if (aUpcoming) return aDate - bDate;
        return bDate - aDate;
      });
  }, [functions, selectedDate, searchQuery, now]);

  return (
    <>
      <ConfirmDialog />

      <div className="desktop:p-6 flex gap-0 p-4">
        {/* Desktop: Sticky calendar column */}
        <div className="desktop:block desktop:w-[240px] desktop:flex-shrink-0 desktop:pr-5 hidden">
          <div
            className="sticky overflow-y-auto"
            style={{
              top: 'calc(var(--header-height-desktop, 64px) + var(--safe-area-inset-top, 0px) + 1.5rem)',
              maxHeight:
                'calc(100vh - var(--header-height-desktop, 64px) - var(--safe-area-inset-top, 0px) - 3rem)',
            }}
          >
            <MiniCalendarPanel
              events={functions}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={calendarMonth}
              onMonthChange={setCalendarMonth}
              embedded
            />
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          <PageHeader
            title="Functions & Events"
            subtitle="Plan and manage catering functions, weddings, and special events."
            icon={CalendarDays}
            actions={
              <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Icon icon={Plus} size="sm" className="mr-2" />
                New Function
              </Button>
            }
          />

          <PageTipsCard config={PAGE_TIPS_CONFIG.functions} className="mb-6" />

          <FunctionsWeatherAlerts />

          {/* Search + mobile calendar toggle */}
          <div className="flex items-center gap-2">
            <div className="desktop:max-w-xs relative min-w-[200px] flex-1">
              <Icon
                icon={Search}
                size="sm"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--foreground-muted)]"
              />
              <input
                type="text"
                placeholder="Search events or clients..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] py-2 pr-3 pl-9 text-sm text-[var(--foreground)] transition-colors placeholder:text-[var(--foreground-muted)] focus:border-transparent focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowMobileCalendar(!showMobileCalendar)}
              className="desktop:hidden flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-secondary)] transition-all hover:bg-[var(--muted)]"
            >
              <Icon icon={CalendarIcon} size="xs" />
              Calendar
              <Icon
                icon={ChevronDown}
                size="xs"
                className={showMobileCalendar ? 'rotate-180' : ''}
              />
            </button>
          </div>

          {/* Mobile calendar (collapsible) */}
          {showMobileCalendar && (
            <div className="desktop:hidden">
              <MiniCalendarPanel
                events={functions}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                currentMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
              />
            </div>
          )}

          {/* Functions table */}
          {isLoading ? (
            <LoadingSkeleton variant="table" />
          ) : filteredFunctions.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Icon
                  icon={CalendarIcon}
                  size="xl"
                  className="mb-3 text-[var(--foreground-muted)]"
                  aria-hidden
                />
                <p className="text-sm font-medium text-[var(--foreground)]">No events found</p>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                  {searchQuery || selectedDate
                    ? 'Try adjusting your filters.'
                    : "You haven't created any functions yet."}
                </p>
                {!searchQuery && !selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Icon icon={Plus} size="sm" className="mr-2" /> Create your first event
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                      <th className="desktop:px-5 px-4 py-3 text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                        Event
                      </th>
                      <th className="desktop:table-cell desktop:px-5 hidden px-4 py-3 text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                        Date & Time
                      </th>
                      <th className="desktop:table-cell desktop:px-5 hidden px-4 py-3 text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                        Details
                      </th>
                      <th className="desktop:px-5 px-4 py-3 text-right text-xs font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFunctions.map(func => {
                      const dateDisplay = getDateDisplay(func);
                      const dayCount = getDayCount(func);
                      const isMultiDay = dayCount > 1;

                      return (
                        <tr
                          key={func.id}
                          className="group cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]/50"
                          onClick={() => {
                            window.location.href = `/webapp/functions/${func.id}`;
                          }}
                        >
                          <td className="desktop:px-5 px-4 py-3.5 align-top">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                                {func.name}
                              </span>
                              <span className="text-xs text-[var(--foreground-muted)]">
                                {func.type}
                              </span>
                              <span className="desktop:hidden mt-1 text-xs text-[var(--foreground-muted)]">
                                {dateDisplay.primary}
                                {isMultiDay && (
                                  <span className="ml-1.5 inline-flex rounded-full bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                                    {dayCount}d
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="desktop:table-cell desktop:px-5 hidden px-4 py-3.5 align-top">
                            <div className="flex flex-col text-sm text-[var(--foreground-secondary)]">
                              <span className="font-medium">{dateDisplay.primary}</span>
                              {dateDisplay.secondary && (
                                <span className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                                  {dateDisplay.secondary}
                                </span>
                              )}
                              {isMultiDay && (
                                <span className="mt-1 inline-flex w-fit items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                                  {dayCount} days
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="desktop:table-cell desktop:px-5 hidden px-4 py-3.5 align-top">
                            <div className="flex flex-col gap-1 text-xs text-[var(--foreground-secondary)]">
                              {func.customers ? (
                                <span className="font-medium text-[var(--foreground)]">
                                  {func.customers.first_name} {func.customers.last_name}
                                </span>
                              ) : (
                                <span className="text-[var(--foreground-muted)] italic">
                                  No client
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Icon icon={Users} size="xs" className="opacity-70" aria-hidden />
                                {func.attendees} PAX
                              </span>
                            </div>
                          </td>

                          <td className="desktop:px-5 px-4 py-3.5 text-right align-top">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteFunction(func);
                              }}
                              className="rounded-lg p-1.5 text-[var(--foreground-muted)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                              aria-label={`Delete ${func.name}`}
                            >
                              <Icon icon={Trash2} size="sm" aria-hidden />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Function"
        maxWidth="2xl"
      >
        <CreateFunctionForm
          onSubmit={handleCreateFunction}
          onCancel={() => setIsCreateModalOpen(false)}
          customerOptions={customerOptions}
        />
      </Modal>
    </>
  );
}
