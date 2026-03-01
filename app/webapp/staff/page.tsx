'use client';

import { PageSkeleton } from '@/components/ui/LoadingSkeleton';
import { PageTipsCard } from '@/components/ui/PageTipsCard';
import { ResponsivePageContainer } from '@/components/ui/ResponsivePageContainer';
import { PAGE_TIPS_CONFIG } from '@/lib/page-help/page-tips-content';
import { Suspense, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { EmployeeForm } from './components/EmployeeForm';
import type { Employee } from '@/lib/types/roster';
import { StaffHeader } from './components/StaffHeader';
import { StaffList } from './components/StaffList';
import { useStaff } from './hooks/useStaff';

export default function StaffPage() {
  const {
    staff,
    qualificationTypes,
    loading,
    selectedStatus,
    setSelectedStatus,
    addStaffMember,
    deleteStaffMember,
  } = useStaff();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <ResponsivePageContainer>
      <div className="space-y-8">
        <StaffHeader
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onAddStaff={() => setIsAddModalOpen(true)}
        />

        {PAGE_TIPS_CONFIG.staff && (
          <div className="mb-6">
            <PageTipsCard config={PAGE_TIPS_CONFIG.staff} />
          </div>
        )}

        <Suspense fallback={<PageSkeleton />}>
          <StaffList
            staff={staff}
            qualificationTypes={qualificationTypes}
            onDelete={deleteStaffMember}
            loading={loading}
          />
        </Suspense>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Staff Member"
      >
        <div className="p-1">
          <EmployeeForm
            qualificationTypes={qualificationTypes}
            onSubmit={async data => {
              const success = await addStaffMember(data as Partial<Employee>);
              if (success) setIsAddModalOpen(false);
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </div>
      </Modal>
    </ResponsivePageContainer>
  );
}
