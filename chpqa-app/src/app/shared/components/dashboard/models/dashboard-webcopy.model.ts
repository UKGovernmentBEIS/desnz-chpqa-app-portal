export type DashboardWebCopy = {
    heading: string;
    description: string;
    search: {
      label: string;
      button: string;
    },
    filtersToggle: {
      show: string;
      hide: string;
    },
    filters: {
      header: string;
      statusFilters: string[],
      userFilterLabel: string;
      userFilter: string;
      submissionYearFilter: string;
    },
    applyFiltersButton: string;
    clearFiltersButton: string;
    filterSummary: {
      byStatus: string;
      byUser: string;
      byYear: string;
      byNameOrReference: string;
    }
    schemeTable: {
      columns: string[],
    },
    pagination: {
      label: string;
    },
};