import { Injectable } from '@angular/core';
import { AssessorStatus, Status, SubmissionStatus } from '@shared/enums/status.enum';
import { UserType } from '@shared/enums/user-type.enum';
import { ReplySchemeForAssessor } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class AssessorDashboardService {
  // Extract unique assessors
  extractAssessors(schemes: ReplySchemeForAssessor[]): string[] {
    return [...new Set(schemes
      .filter(scheme => scheme?.assessor?.firstName && scheme?.assessor?.lastName)
      .map(scheme => `${scheme.assessor.firstName} ${scheme.assessor.lastName}`)
    )];
  }

  // Extract unique years
  extractYears(schemes: ReplySchemeForAssessor[]): string[] {
    return [...new Set(schemes
      .filter(scheme => scheme.createdon)
      .map(scheme => new Date(scheme.createdon).getFullYear().toString())
    )];
  }

  // Extract unique statuses for filters
  // Original before Orfeas hack
  // extractFilters(schemes: ReplySchemeForAssessor[]): { id: string; label: string; selected: boolean }[] {
  //   return [...new Set(schemes
  //     .filter(scheme => scheme.latestSubmissionStatus !== null && scheme.latestSubmissionStatus !== undefined)
  //     .map((scheme: unknown) => SubmissionStatus[(scheme as any).latestSubmissionStatusText as any])
  //   )]
  //   .map(status => ({
  //     id: status,
  //     label: status?.replace(/([a-z])([A-Z])/g, '$1 $2'),  // Add space between words
  //     selected: false,
  //   }));
  // }

  extractFilters(schemes: ReplySchemeForAssessor[]): { id: string; label: string; selected: boolean }[] {
    return Array.from(new Set(
      schemes
        .filter(scheme => scheme.latestSubmissionStatus !== null && scheme.latestSubmissionStatus !== undefined)
        .map((scheme: any) => scheme.latestSubmissionStatusText)
    )).map(statusText => ({
      id: statusText as string,
      label: statusText as string,
      selected: false,
    }));
  }

  // Apply all filters including search, checkboxes, and dropdowns
  applyFilters(
    schemes: ReplySchemeForAssessor[],
    searchTerm: string,
    filters: { id: string; label: string; selected: boolean }[],
    selectedAssessor: string,
    selectedYear: string
  ): ReplySchemeForAssessor[] {
    return schemes.filter(scheme => {
      const searchMatch =
        searchTerm === '' ||
        scheme.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.reference?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        filters.every(filter => !filter.selected) ||
        filters.some(filter => filter.selected && (scheme as any).latestSubmissionStatusText === filter.id);
      
        const assessorMatch =
        selectedAssessor === '' ||
        (`${scheme.assessor?.firstName} ${scheme.assessor?.lastName}` === selectedAssessor);

      const yearMatch =
        selectedYear === '' ||
        new Date(scheme.createdon).getFullYear().toString() === selectedYear;

      return searchMatch && statusMatch && assessorMatch && yearMatch;
    });
  }

  // Custom sorting functionality for Assessor Admin
  sortForAssessorAdmin(schemes: ReplySchemeForAssessor[]): ReplySchemeForAssessor[] {
    return schemes.sort((a, b) => {
      const isASubmitted = a.latestSubmissionStatus === SubmissionStatus.Submitted;
      const isBSubmitted = b.latestSubmissionStatus === SubmissionStatus.Submitted;

      // Return -1 if 'a' is Submitted and 'b' is not, +1 if 'b' is Submitted and 'a' is not
      // Otherwise, maintain the current order
      return (isASubmitted === isBSubmitted) ? 0 : isASubmitted ? -1 : 1;
    });
  }

  // Sorting functionality
  sortSchemes(schemes: ReplySchemeForAssessor[], field: string, sortOrder: string): ReplySchemeForAssessor[] {
    return schemes.sort((a, b) => {
      const compareA = a[field];
      const compareB = b[field];

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }

  // Paginate schemes
  paginateSchemes(filteredSchemes: ReplySchemeForAssessor[], currentPage: number, itemsPerPage: number): ReplySchemeForAssessor[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSchemes.slice(startIndex, startIndex + itemsPerPage);
  }

   // As per Orfeas request we are now mapping user role and status to... new status?
   // I dont know why backend cant just return the right status for the user type that logged in...
   // I dont think I even wanna know...
   // God save the backend/frontend and this project
  public mapUserRoleAndSchemeStatusToProperSubmissionStatusForScheme(userRole: UserType, status: SubmissionStatus): string {
    switch (userRole) {
      case UserType.ResponsiblePerson:
        switch (status) {
          case SubmissionStatus.NotStarted:
          case SubmissionStatus.InProgress:
            return 'Draft';
          case SubmissionStatus.Unassinged:
          case SubmissionStatus.Submitted:
            return 'Submitted';
          case SubmissionStatus.ReturnToRPFromAA:
          case SubmissionStatus.ReturnedForChanges:
            return 'Returned';
          case SubmissionStatus.Approved:
          case SubmissionStatus.Rejected:
            return 'Approved';
          case SubmissionStatus.Certified:
            return 'Approved';
          default:
            return SubmissionStatus[status].replace(/([a-z])([A-Z])/g, '$1 $2');
        }
      case UserType.AssessorAdmin:
        switch (status) {
          case SubmissionStatus.InProgress:
          case SubmissionStatus.Submitted:
            return 'In Progress';
          case SubmissionStatus.ReturnToRPFromAA:
          case SubmissionStatus.ReturnedForChanges:
            return 'Returned';
          case SubmissionStatus.Approved:
            return 'Second Assessment';
          case SubmissionStatus.Certified:
            return 'Approved';
          default:
            return SubmissionStatus[status].replace(/([a-z])([A-Z])/g, '$1 $2');
        }
      case UserType.TechnicalAssessor:
      case UserType.TechnicalAssessor2:
        switch (status) {
          case SubmissionStatus.InProgress:
          case SubmissionStatus.Submitted:
            return 'In Progress';
          case SubmissionStatus.ReturnToRPFromAA:
          case SubmissionStatus.ReturnedForChanges:
            return 'Returned';
          case SubmissionStatus.Approved:
            return 'Second assessment';
          case SubmissionStatus.Certified:
            return 'Approved';
          default:
            return SubmissionStatus[status].replace(/([a-z])([A-Z])/g, '$1 $2');
        }
      default:
        return SubmissionStatus[status].replace(/([a-z])([A-Z])/g, '$1 $2');
    }
  }
}
