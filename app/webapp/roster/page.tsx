/**
 * Roster Page
 * Main page for roster management.
 *
 * @module webapp/roster/page
 */

'use client';

import { useEffect, useState } from 'react';
import { RosterBuilder } from './components/RosterBuilder';
import { PageHeader } from '@/app/webapp/components/static/PageHeader';
import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { logger } from '@/lib/logger';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { Calendar } from 'lucide-react';
import type { Shift, Employee } from '@/lib/types/roster';

export default function RosterPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch employees
        const employeesResponse = await fetch('/api/staff/employees');
        const employeesData = await employeesResponse.json();
        if (employeesData.success) {
          setEmployees(employeesData.employees || []);
        }

        // Fetch shifts for current week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const shiftsResponse = await fetch(
          `/api/roster/shifts?start_date=${weekStart.toISOString().split('T')[0]}&end_date=${weekEnd.toISOString().split('T')[0]}&status=all`,
        );
        const shiftsData = await shiftsResponse.json();
        if (shiftsData.success) {
          setShifts(shiftsData.shifts || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roster data');
        logger.error('Failed to load roster data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Roster" icon={Calendar} />
        <PageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Roster" icon={Calendar} />
        <div className="rounded-3xl border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 p-6">
          <p className="text-[var(--color-error)]">Error loading roster: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roster Builder"
        subtitle="Drag and drop shifts to build your weekly roster"
        icon={Calendar}
      />
      {PAGE_TIPS_CONFIG.roster && (
        <div className="mb-6">
          <PageTipsCard config={PAGE_TIPS_CONFIG.roster} />
        </div>
      )}
      <RosterBuilder employees={employees} shifts={shifts} />
    </div>
  );
}
