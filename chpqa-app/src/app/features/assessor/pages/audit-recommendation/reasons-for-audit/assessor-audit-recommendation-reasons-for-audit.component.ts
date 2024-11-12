import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukCheckboxInputComponent } from '@shared/components/form-controls/govuk-checkbox-input/govuk-checkbox-input.component';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormStateSyncDirective } from '@shared/directives/form-state-sync.directive';
import { selectFormState } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';
import { isSuccess } from 'ngx-remotedata';
import { combineLatest, Subscription, switchMap, takeWhile } from 'rxjs';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { ReplyAuditRec } from 'src/app/api-services/chpqa-api/generated';
import { AssessorAuditRecommendationFormState, ReasonsForAuditFormState } from '../audit-recomendation.config';
import { ReviewDecisionFacade } from '../../../../../features/assessor/components/review-decision/store/review-decision.facade';

@Component({
  selector: 'app-assessor-audit-recommendation-reasons-for-audit',
  standalone: true,
  templateUrl: './assessor-audit-recommendation-reasons-for-audit.component.html',
  styleUrls: ['./assessor-audit-recommendation-reasons-for-audit.component.scss'],
  imports: [
    RouterModule,
    FormErrorDirective,
    FormStateSyncDirective,
    GovukRadioInputComponent,
    GovukTextareaInputComponent,
    DynamicFormErrorsSummaryComponent,
    ReactiveFormsModule,

    GovukCheckboxInputComponent,

    CommonModule,
  ],
  providers: [ReviewDecisionFacade]
})
export class AssessorAuditRecommendationReasonsForAuditComponent {
  @ViewChild(DynamicFormErrorsSummaryComponent) dynamicFormErrorsSummaryComponent: DynamicFormErrorsSummaryComponent;

  BACK = null;
  form: FormGroup = this.fb.group({
    technicalPerformanceConcerns: [null],
    complianceConcerns: [null],
    comments: new FormControl<string | null>(null),
  });

  formUpdated = false;

  options = [
    {
      label: 'Technical performance concerns',
      controlName: 'technicalPerformanceConcerns',
      validationMessages: {
        requireCheckboxToBeChecked: null,
      },
    },
    {
      label: 'Compliance concerns',
      controlName: 'complianceConcerns',
      validationMessages: {
        requireCheckboxToBeChecked: null,
      },
    },
  ];

  validationMessages = {
    technicalPerformanceConcerns: {
      requireCheckboxToBeChecked: 'Select at least one reason for recommending an audit',
    },
    complianceConcerns: {
      requireCheckboxToBeChecked: 'Select at least one reason for recommending an audit',
    },
  };

  reviewScreenName: string = '';
  isComponentAlive = true;
  isAssessorFormEditable = false;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private assessorFacade: AssessorFacade,
    private route: ActivatedRoute,
    private reviewDecisionFacade: ReviewDecisionFacade,
  ) {
    this.BACK = `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.isForAudit}`;
    // this.assessorFacade.auditRecommendationsFacade.dispatchActions.loadAuditRecommendations();
  }

  ngOnInit(): void {
    this.reviewScreenName = AssessorAuditRecommendationFormState.AssessorReasonsForAuditForm;

    this.subscriptions.add(
      combineLatest([
        this.assessorFacade.auditRecommendationsFacade.stateObservables.auditRecommendationsApiResponse$,
        this.store.select(selectFormState(this.reviewScreenName)),
      ]).subscribe(([auditRecommendationsApiResponse, reasonsForAuditFormState]) => {
        if (isSuccess(auditRecommendationsApiResponse) && !!reasonsForAuditFormState) {
          this.patchFormWithStoredValues(auditRecommendationsApiResponse?.value, reasonsForAuditFormState);
        }
      })
    );

    this.reviewDecisionFacade.isAssessorFormEditable$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(isAssessorFormEditable => {
      this.isAssessorFormEditable = isAssessorFormEditable;
    });
  }

  onSubmit(): void {
    const technicalPerformanceConcernsFormControl = this.form.controls.technicalPerformanceConcerns;
    const complianceConcernsFormControl = this.form.controls.complianceConcerns;
    if (!technicalPerformanceConcernsFormControl.value && !complianceConcernsFormControl.value) {
      // This updates the error at page-level
      // Only one checkbox control needs to have an error defined
      this.dynamicFormErrorsSummaryComponent.addControlError(
        'technicalPerformanceConcerns',
        'requireCheckboxToBeChecked',
        this.validationMessages.technicalPerformanceConcerns.requireCheckboxToBeChecked
      );
      this.form.markAllAsTouched();
      this.formUpdated = true;
      return;
    } else {
    }
    this.store.dispatch(
      SharedActions.navigateTo({
        url: `assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.confirmYourAnswers}`,
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.isComponentAlive = false;
  }

  private patchFormWithStoredValues(auditRecommendationsApiResponse: ReplyAuditRec, reasonsForAuditFormState: ReasonsForAuditFormState) {
    const technicalPerformanceConcernsFormControlValue = this.form.controls.technicalPerformanceConcerns?.value;
    const complianceConcernsFormControlValue = this.form.controls.complianceConcerns?.value;
    if (
      (technicalPerformanceConcernsFormControlValue !== null && technicalPerformanceConcernsFormControlValue !== undefined) ||
      (complianceConcernsFormControlValue !== null && complianceConcernsFormControlValue !== undefined)
    ) {
      const controls = [this.form.get('technicalPerformanceConcerns'), this.form.get('complianceConcerns')];
      controls.forEach(control => control.setErrors(null));
      this.form.setErrors(null);
    }
    const { technicalPerformanceConcerns, complianceConcerns } = reasonsForAuditFormState;
    this.form.patchValue(
      {
        technicalPerformanceConcerns:
          technicalPerformanceConcerns !== null && technicalPerformanceConcerns !== undefined
            ? technicalPerformanceConcerns
            : auditRecommendationsApiResponse?.technicalPerformanceConcerns,

        complianceConcerns:
          complianceConcerns !== null && complianceConcerns !== undefined ? complianceConcerns : auditRecommendationsApiResponse?.complianceConcerns,

        comments: reasonsForAuditFormState?.comments ? reasonsForAuditFormState.comments : auditRecommendationsApiResponse?.comments,
      },
      { emitEvent: false }
    );
  }
}
