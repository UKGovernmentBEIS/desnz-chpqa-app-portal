import { Pipe, PipeTransform } from '@angular/core';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';

@Pipe({
  name: 'displaySchemeName',
  standalone: true,
})
export class DisplaySchemeNamePipe implements PipeTransform {
  transform(isUserAnAssessor: boolean, scheme: any): string {
    const { submittedName, name, groupType} = scheme;
    if((groupType === SubmissionGroupType.ProvideAuditRecommendation
      || groupType === SubmissionGroupType.ProvideAssessmentDecision
    ) && isUserAnAssessor) {
      return name;
    }
    return isUserAnAssessor ? submittedName : name;
  }
}
