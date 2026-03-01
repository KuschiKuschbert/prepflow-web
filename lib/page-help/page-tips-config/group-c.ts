import type { PageTipsConfig } from '../page-tips-types';

export const PAGE_TIPS_GROUP_C: Record<string, PageTipsConfig> = {
  functions: {
    pageKey: 'functions',
    tips: [
      'Add customers first so you can link functions to clients.',
      'Set event name, dates, type (wedding, corporate, etc.) and attendees.',
      'Use the calendar to filter by date or search by client name.',
      'Open a function to build your runsheet and track prep.',
    ],
  },
  customers: {
    pageKey: 'customers',
    guideId: 'functions-catering',
    tips: [
      'Add customers before creating functions—link events to the right client.',
      'Store contact details (email, phone) and company for quick reference.',
      'Search to find customers fast when planning events.',
      'Edit a customer anytime to keep details up to date.',
    ],
  },
  square: {
    pageKey: 'square',
    tips: [
      'Connect your Square POS to sync menu items and sales data.',
      'Map Square catalog items to PrepFlow dishes for accurate COGS.',
      'Sync runs on demand—trigger it after menu changes in Square.',
      'Check connection status anytime from this page.',
    ],
  },
  roster: {
    pageKey: 'roster',
    tips: [
      'Add staff first—you need team members before building a roster.',
      'Drag shifts onto the weekly grid to assign coverage.',
      'Save roster templates to reuse the same pattern each week.',
      'Use the calendar view to spot gaps in coverage.',
    ],
  },
  staff: {
    pageKey: 'staff',
    tips: [
      'Add team members with roles, contact info, and employment status.',
      'Track qualifications and certifications—set expiry reminders.',
      'Filter by status to see active, inactive, or terminated staff.',
      'Staff feed into rosters, time attendance, and cleaning assignments.',
    ],
  },
  'time-attendance': {
    pageKey: 'time-attendance',
    tips: [
      'Staff clock in and out from their device—geofence optional.',
      'View attendance records by date range or employee.',
      'Late arrivals and early departures are flagged automatically.',
      'Export records for payroll processing.',
    ],
  },
  guide: {
    pageKey: 'guide',
    tips: [
      'Follow the step-by-step guide to set up your kitchen in PrepFlow.',
      'Each step links to the relevant page—jump straight there.',
      'Come back anytime to pick up where you left off.',
      'Complete all steps for a fully configured kitchen.',
    ],
  },
};
