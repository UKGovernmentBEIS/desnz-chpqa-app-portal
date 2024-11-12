import { Pipe, PipeTransform } from '@angular/core';
import { AssessorStatus, Status } from '@shared/enums/status.enum';

@Pipe({
  name: 'submissionStatusLabel',
  standalone: true,
})
export class SubmissionStatusLabelPipe implements PipeTransform {
  transform(value: number, isAssessor: boolean): string {
    if (isAssessor) {
      switch (value) {
        case AssessorStatus.NotStarted:
          return 'Not started';
        case AssessorStatus.Approved:
          return 'Approved';
        case AssessorStatus.NeedsChange:
          return 'Returned for changes';
        case AssessorStatus.Rejected:
          return 'Rejected';
        case AssessorStatus.CannotStartYet:
          return 'Cannot start yet';
        case AssessorStatus.NotApplicable:
          return 'Not Applicable';
        case AssessorStatus.Completed:
          return 'Completed';
      }
    }
    switch (value) {
      case Status.NotStarted:
        return 'Not started';
      case Status.InProgress:
        return 'In progress';
      case Status.Completed:
        return 'Completed';
      case Status.CannotStartYet:
        return 'Cannot start yet';
      case Status.NotApplicable:
        return 'Not applicable';
      default:
        return null;
    }
  }
}
