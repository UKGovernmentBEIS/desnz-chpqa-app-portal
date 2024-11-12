import { Pipe, PipeTransform } from '@angular/core';
import { SubmissionGroupCategory } from '@shared/enums/form-submission.enum';

@Pipe({
  name: 'submissionGroupCategoryLabel',
  standalone: true
})
export class SubmissionGroupCategoryLabelPipe implements PipeTransform {

  transform(value: string): string {
    const category = Number(value);
    switch (category) {
      case SubmissionGroupCategory.SchemeDetails:
        return 'Scheme details';
      case SubmissionGroupCategory.SchemeCapacityDetails:
        return 'Scheme capacity details';
      case SubmissionGroupCategory.SchemePerformanceDetails:
        return 'Scheme performance details';
      case SubmissionGroupCategory.ThresholdDetails:
        return 'Threshold details';
      case SubmissionGroupCategory.CertificatesAndBenefitsDetails:
        return 'Certificates and benefits details';
      case SubmissionGroupCategory.SubmitToAssessor:
        return 'Submit to assessor';
      case SubmissionGroupCategory.CompleteAssessment:
        return 'Complete assessment';
      case SubmissionGroupCategory.AssessorComments:
        return 'Assessor Comments';
      case SubmissionGroupCategory.AssignSchemeAndSetPolicy:
        return 'Assign scheme and set policy';
      default:
        return null;
    }
  }

}
