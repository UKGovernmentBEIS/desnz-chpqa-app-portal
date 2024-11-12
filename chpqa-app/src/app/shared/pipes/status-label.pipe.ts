import { Pipe, PipeTransform } from '@angular/core';
import { SubmissionStatus } from '@shared/enums/status.enum';
import { statusEnumToText } from '@shared/utils/submission-status-to-text-utils';

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: number): string {
    return statusEnumToText(value);
  }
}
