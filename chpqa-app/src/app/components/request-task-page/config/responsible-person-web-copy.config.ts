import { DashboardWebCopy } from "@shared/components/dashboard/models/dashboard-webcopy.model";

export const responsiblePersonDashboardWebCopy: DashboardWebCopy = {
  heading: 'Scheme list',
  description: 'You can see all your active schemes here. Any that need your action are at the top of the list.',
  search: {
    label: 'Search for a scheme by name or reference',
    button: 'Search',
  },
  filtersToggle: {
    show: 'Show filters',
    hide: 'Hide filters',
  },
  filters: {
    header: 'Filter options',
    statusFilters: [
      'Approved',
      'Certified',
      'Draft',
      'Due for renewal',
      'Rejected',
      'Returned for changes',
      'Submitted',
      'Submitted for re-assessment',
    ],
    userFilterLabel: 'Responsible Person',
    userFilter: 'Select Responsible Person',
    submissionYearFilter: 'Select a submission year',
  },
  applyFiltersButton: 'Apply filters',
  clearFiltersButton: 'Clear Filters',
  filterSummary: {
    byStatus: 'Status:',
    byUser: 'Responsible Person:',
    byYear: 'Submission year:',
    byNameOrReference: 'Search by name or reference:',
  },
  schemeTable: {
    columns: ['Scheme', 'Scheme reference', 'Status'],
  },
  pagination: {
    label: 'Page navigation',
  },
};