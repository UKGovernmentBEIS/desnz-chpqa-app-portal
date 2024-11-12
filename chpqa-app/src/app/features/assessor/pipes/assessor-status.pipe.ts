import { Pipe, PipeTransform } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AssessorStatus, SubmissionStatus } from '@shared/enums/status.enum';
import { getUserRoleApiResponse } from '@shared/store/shared.selector';

@Pipe({
  name: 'assessorStatusPipe',
  standalone: true 
})
export class AssessorStatusPipe implements PipeTransform {
 
  transform(value: number): string {
    if (value === null || value === undefined) return '';
    const enumValue = SubmissionStatus[value];
    
    if (enumValue) {
      return enumValue.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    return '';
  }
}