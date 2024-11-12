import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AssessorStatus, Status } from '@shared/enums/status.enum';
import { SubmissionStatusLabelPipe } from '../../pipes/submission-status-label.pipe';
import { StatusToColorPipe } from '../../pipes/status-to-color.pipe';

@Component({
  selector: 'app-status',
  standalone: true,
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, SubmissionStatusLabelPipe, AsyncPipe, NgIf, StatusToColorPipe],
})
export class StatusComponent {
  @Input() status = 0;
  @Input() isUserAnAssessor = false;

  constructor() {}

  getStatusClass(): string {
    if (this.isUserAnAssessor) {
      // Λογική για AssessorStatus όταν ο χρήστης είναι Assessor
      switch (this.status) {
        case AssessorStatus.Approved:
          return 'govuk-tag--blue';
        case AssessorStatus.Rejected:
          return 'govuk-tag--red';
        case AssessorStatus.NeedsChange:
          return 'govuk-tag--blue';
        case AssessorStatus.NotStarted: 
          return 'govuk-tag--grey';
          case AssessorStatus.NotApplicable: 
          return 'govuk-tag--grey';
        case AssessorStatus.CannotStartYet:
          return 'govuk-tag--grey';
        default:
          return '';
      }
    } else {
      // Λογική για Status όταν ο χρήστης δεν είναι Assessor
      switch (this.status) {
        case Status.NotStarted:
          return 'govuk-tag--grey';
        case Status.InProgress:
          return 'govuk-tag--light-blue';
        case Status.Completed:
          return 'govuk-tag--blue';
        case Status.CannotStartYet:
          return 'govuk-tag--grey';
        case Status.NotApplicable:
          return 'govuk-tag--grey';
        default:
          return '';
      }
    }
  }
}
