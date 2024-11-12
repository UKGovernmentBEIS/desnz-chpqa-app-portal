import { Pipe, PipeTransform } from '@angular/core';
import { AssessmentOutcome, AssessorStatus, Status } from '@shared/enums/status.enum';

@Pipe({
  name: 'assessmentOutcomeLabel',
  standalone: true,
})
export class AssessmentOutcomeLabelPipe implements PipeTransform {
  transform(value: AssessmentOutcome): string {
    switch (value) {
      case AssessmentOutcome.Approved:
        return 'Approved';
      case AssessmentOutcome.NeedsChange:
        return 'Needs change';
      case AssessmentOutcome.Rejected:
        return 'Rejected';
    }
  }
}
