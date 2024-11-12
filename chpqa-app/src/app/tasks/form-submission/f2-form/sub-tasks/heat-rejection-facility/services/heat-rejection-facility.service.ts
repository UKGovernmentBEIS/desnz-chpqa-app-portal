import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubmissionFormStatus } from '@shared/enums/form-submission.enum';
import { selectFormState, selectSubmissionFormId } from '@shared/store';
import { combineLatest, first, map } from 'rxjs';
import { HeatRejectionFacility } from '../config/heat-rejection-facility.model';
import { selectHeatRejectionFacility, selectSubmissionGroupId } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { HeatRejectionFacilitySharedStateFormEnum } from '../config/heat-rejection-facility.config';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Injectable({
  providedIn: 'root',
})
export class HeatRejectionFacilityService {
  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private route: ActivatedRoute
  ) {}

  createHeatRejectionFacilityForm(): FormGroup {
    return this.fb.group({
      heatRejectionFacility: [null, [Validators.required]],
    });
  }

  createPayloadToSubmitHeatRejectionFacilityAsComplete() {
    return combineLatest([
      this.store.select(selectSubmissionFormId),
      this.store.select(selectSubmissionGroupId),
      this.store.select(selectHeatRejectionFacility),
      this.store.select(selectFormState(HeatRejectionFacilitySharedStateFormEnum.HeatRejectionFacilityFormInputs))
    ]).pipe(
      first(),
      map(([
        idSubmission,
        idGroup,
        heatRejectionFacility,
        heatRejectionFacilityFormInputs
      ]) => ({
        idSubmission,
        idGroup,
        status: SubmissionFormStatus.Completed,
        heatRejectionFacility: heatRejectionFacilityFormInputs?.heatRejectionFacility.value ?? heatRejectionFacility.heatRejectionFacility.value
      }))
    );
  }

  generateReviewYourAnswersFieldConfigs(selectHeatRejectionFacility: HeatRejectionFacility, formInputs: any): ReviewFieldConfig[] {
    const { heatRejectionFacility } = selectHeatRejectionFacility;
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const changeLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.HEAT_REJECTION_FACILITY}`;

    return [
      {
        name: 'heatRejectionFacility',
        label: 'Does the scheme have a heat rejection facility?',
        type: 'text',
        changeLink: changeLink,
        showChangeLink: true,
        value: formInputs?.heatRejectionFacility.label ?? heatRejectionFacility.label ?? '',
        ariaLabel: ChangeLinkAriaLabel.HEAT_REJECTION_FACILITY
      },
    ];
  }
}
