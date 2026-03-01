/**
 * Time & Attendance Page
 * Main page for clock-in/clock-out functionality.
 *
 * @module webapp/time-attendance/page
 */

'use client';

import { useEffect, useState } from 'react';
import { ClockIn } from './components/ClockIn';
import { PageHeader } from '@/app/webapp/components/static/PageHeader';
import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { Clock } from 'lucide-react';
import { logger } from '@/lib/logger';
import type { Employee, Shift } from '@/lib/types/roster';

export default function TimeAttendancePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // TODO: Get current employee from session/auth
        // For now, fetch first employee as example
        const employeesResponse = await fetch('/api/staff/employees?pageSize=1');
        const employeesData = await employeesResponse.json();
        if (employeesData.success && employeesData.employees.length > 0) {
          const emp = employeesData.employees[0];
          setEmployee(emp);

          // Get today's shift for this employee
          const today = new Date().toISOString().split('T')[0];
          const shiftsResponse = await fetch(
            `/api/roster/shifts?employee_id=${emp.id}&shift_date=${today}`,
          );
          const shiftsData = await shiftsResponse.json();
          if (shiftsData.success && shiftsData.shifts.length > 0) {
            setCurrentShift(shiftsData.shifts[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employee data');
        logger.error('Failed to load employee data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Time & Attendance" icon={Clock} />
        <PageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Time & Attendance" icon={Clock} />
        <div className="rounded-3xl border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 p-6">
          <p className="text-[var(--color-error)]">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Time & Attendance" icon={Clock} />
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-[var(--foreground-muted)]">
            No employee found. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time & Attendance"
        subtitle="Clock in and out with geofencing validation"
        icon={Clock}
      />
      {PAGE_TIPS_CONFIG['time-attendance'] && (
        <div className="mb-6">
          <PageTipsCard config={PAGE_TIPS_CONFIG['time-attendance']} />
        </div>
      )}
      <div className="mx-auto max-w-2xl">
        <ClockIn employee={employee} shift={currentShift || undefined} />
      </div>
    </div>
  );
}
