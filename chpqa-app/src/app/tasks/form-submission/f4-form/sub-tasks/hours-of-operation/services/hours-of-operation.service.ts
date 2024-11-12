import { Injectable } from '@angular/core';
import { UpdateHoursOfOp } from 'src/app/api-services/chpqa-api/generated/model/updateHoursOfOp';
import { ActivatedRoute } from '@angular/router';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable({
  providedIn: 'root',
})
export class HoursOfOperationService {
  constructor(
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute
  ) {}

  generateHoursOfOperationFieldConfigs(selectHoursOfOperation: any, formInputs: any, sectionStatus: any, submissionFormType: SubmissionFormType): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId']; // Assuming 'submissionFormId' is another route param

    const inputLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION}`;

    const reviewScreenValues: ReviewFieldConfig[] = [
      {
        name: 'hoursOfOperation',
        label: 'Total hours of operation',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.hoursOfOperation ?? selectHoursOfOperation?.hoursOfOperation ?? '',
        ariaLabel: ChangeLinkAriaLabel.TOTAL_HOURS_OF_OPERATION
      }
    ];
    if (submissionFormType === SubmissionFormType.F4) {
      reviewScreenValues.push({
        name: 'months',
        label: 'How many months does this period cover?',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.months ?? selectHoursOfOperation?.months ?? '',
        ariaLabel: ChangeLinkAriaLabel.MONTHS_PERIOD_COVERS
      })
    }
    return reviewScreenValues;
  }

  onSubmit(hoursOfOperationRequest: UpdateHoursOfOp) {
    return this.chqpaApiServiceWrapper.updateSubmissionHoursOfOpService.apiSecureUpdateSubmissionHoursOfOpPost(hoursOfOperationRequest).pipe();
  }
}
