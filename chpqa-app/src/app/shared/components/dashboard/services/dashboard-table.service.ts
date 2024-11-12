import { Injectable } from '@angular/core';
import { Status, SubmissionStatus } from '@shared/enums/status.enum';
import { statusEnumToText } from '@shared/utils/submission-status-to-text-utils';
import { ReplyScheme, ReplySchemeForAssessor } from 'src/app/api-services/chpqa-api/generated';

@Injectable()
export class DashboardTableService {

  // Extract unique years
  extractYears(schemes: ReplyScheme[]): string[] {
    return [...new Set(schemes
      .filter(scheme => scheme.createdon)
      .map(scheme => new Date(scheme.createdon).getFullYear().toString())
    )];
  }

  // Extract unique statuses for filters
  extractFilters(schemes: ReplyScheme[]): { id: string; label: string; selected: boolean }[] {
    return [...new Set(schemes
      .filter(scheme => scheme.latestSubmissionStatus !== null && scheme.latestSubmissionStatus !== undefined)
      .map(scheme => SubmissionStatus[scheme.latestSubmissionStatus!])
    )]
    .map(status => ({
      id: status,
      label: status?.replace(/([a-z])([A-Z])/g, '$1 $2'),  // Add space between words
      selected: false,
    }));
  }
  
  // Apply all filters including search, checkboxes, and dropdowns
  applyFilters(
    isUserAnAssessor: boolean,
    schemes: ReplyScheme[] | ReplySchemeForAssessor[],
    searchTerm: string,
    filters: { id: string; label: string; selected: boolean }[],
    selectedUser: string,
    selectedYear: string
  ) {
    return schemes.filter((scheme: ReplyScheme | ReplySchemeForAssessor) => {
      const searchMatch =
        searchTerm === '' || 
        scheme.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        scheme.reference?.toLowerCase().includes(searchTerm.toLowerCase());
  
      const statusMatch =
        filters.every(filter => !filter.selected) || 
        filters.some(filter => filter.selected && SubmissionStatus[scheme.latestSubmissionStatus] === filter.id);
  
      let userMatch = true;
      if (isUserAnAssessor) {
        const typeCastedScheme = scheme as ReplySchemeForAssessor;
        userMatch =
          selectedUser === '' || 
          (`${typeCastedScheme.assessor?.firstName} ${typeCastedScheme.assessor?.lastName}` === selectedUser);
      } else {
        const typeCastedScheme = scheme as ReplyScheme;
        userMatch =
          selectedUser === '' || 
          (`${typeCastedScheme.responsiblePerson?.firstName} ${typeCastedScheme.responsiblePerson?.lastName}` === selectedUser);
      }
  
      const yearMatch = 
        selectedYear === '' || 
        new Date(scheme.createdon).getFullYear().toString() === selectedYear;
  
      return searchMatch && statusMatch && userMatch && yearMatch;
    });
  }

  // Sorting functionality
  sortSchemes(schemes: ReplyScheme[], field: string, sortOrder: string) {
    return schemes.sort((a, b) => {
      let compareA = a[field];
      let compareB = b[field];

      if (field === 'latestSubmissionStatus') {
        compareA = statusEnumToText(a[field]);
        compareB = statusEnumToText(b[field]);
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }

  // Paginate schemes
  paginateSchemes(filteredSchemes: ReplyScheme[], currentPage: number, itemsPerPage: number) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSchemes.slice(startIndex, startIndex + itemsPerPage);
  }
}
