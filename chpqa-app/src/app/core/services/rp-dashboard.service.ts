import { Injectable } from '@angular/core';
import { SubmissionStatus } from '@shared/enums/status.enum';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class RpDashboardService {
  // Extract unique years
  extractYears(schemes: ReplyScheme[]): string[] {
    return [...new Set(schemes.filter(scheme => scheme.createdon).map(scheme => new Date(scheme.createdon).getFullYear().toString()))];
  }

  // Extract unique statuses for filters
  extractFilters(schemes: ReplyScheme[]): { id: string; label: string; selected: boolean }[] {
    return [
      ...new Set(
        schemes
          .filter(scheme => scheme.latestSubmissionStatus !== null && scheme.latestSubmissionStatus !== undefined)
          .map(scheme => SubmissionStatus[scheme.latestSubmissionStatus!])
      ),
    ].map(status => ({
      id: status,
      label: status?.replace(/([a-z])([A-Z])/g, '$1 $2'), // Add space between words
      selected: false,
    }));
  }

  // Apply all filters including search, checkboxes, and dropdowns
  applyFilters(schemes: ReplyScheme[], searchTerm: string, filters: { id: string; label: string; selected: boolean }[], selectedYear: string): ReplyScheme[] {
    return schemes.filter(scheme => {
      const searchMatch =
        searchTerm === '' ||
        scheme.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.reference?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        filters.every(filter => !filter.selected) || filters.some(filter => filter.selected && SubmissionStatus[scheme.latestSubmissionStatus] === filter.id);

      const yearMatch = selectedYear === '' || new Date(scheme.createdon).getFullYear().toString() === selectedYear;
      return searchMatch && statusMatch && yearMatch;
    });
  }

  // Paginate schemes
  paginateSchemes(filteredSchemes: ReplyScheme[], currentPage: number, itemsPerPage: number): ReplyScheme[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSchemes.slice(startIndex, startIndex + itemsPerPage);
  }
}
