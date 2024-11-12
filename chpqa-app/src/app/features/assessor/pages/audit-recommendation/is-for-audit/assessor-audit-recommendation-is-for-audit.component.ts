import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { Subscription, combineLatest, filter, map, take, takeWhile } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormStateSyncDirective } from '@shared/directives/form-state-sync.directive';
import { selectFormState, selectSubmissionFormId } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';
import { isSuccess } from 'ngx-remotedata';
import { ReplyAuditRec } from 'src/app/api-services/chpqa-api/generated';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { AssessorAuditRecommendationFormState } from '../audit-recomendation.config';
import { selectIsSubmissionNonEditable } from '@shared/store';
import { ReviewDecisionFacade } from '../../../../../features/assessor/components/review-decision/store/review-decision.facade';

@Component({
  selector: 'app-assessor-audit-recommendation-is-for-audit',
  standalone: true,
  templateUrl: './assessor-audit-recommendation-is-for-audit.component.html',
  imports: [
    RouterModule,
    GovukRadioInputComponent,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    DynamicFormErrorsSummaryComponent,
    FormErrorDirective,
    FormStateSyncDirective,
  ],
  providers: [ReviewDecisionFacade]
})
export class AssessorAuditRecommendationIsForAuditComponent implements OnInit, OnDestroy {
  backButton$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`;
    })
  )
  formUpdated = false;
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  validationMessages = {
    isRecommended: {
      required: 'Select yes if you want to recommend this scheme for audit',
    },
  };
  reviewScreenName: string = '';

  private subscriptions = new Subscription();

  form: FormGroup = this.fb.group({
    isRecommended: [null, [Validators.required]],
  });

  isComponentAlive = true;
  isAssessorFormEditable = false;

  auditRecommendationsApiResponse$ = this.assessorFacade.auditRecommendationsFacade.stateObservables.auditRecommendationsApiResponse$;
  isSubmissionNonEditable$ = this.store.select(selectIsSubmissionNonEditable);
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private assessorFacade: AssessorFacade,
    private route: ActivatedRoute,
    private reviewDecisionFacade: ReviewDecisionFacade,
  ) {
    // this.assessorFacade.auditRecommendationsFacade.dispatchActions.loadAuditRecommendations();
  }

  ngOnInit() {
    this.reviewScreenName = AssessorAuditRecommendationFormState.AssessorIsRecommendedForm;

    this.subscriptions.add(
      combineLatest([
        this.auditRecommendationsApiResponse$
      ])
      .pipe(
        filter(([auditRecommendationsApiResponse]) => isSuccess(auditRecommendationsApiResponse))
      )
      .subscribe(([auditRecommendationsApiResponse]) => {
        this.store.select(selectFormState(this.reviewScreenName)).pipe(take(1)).subscribe(isRecommendedFormState => {
          this.patchFormWithStoredValues(
            (auditRecommendationsApiResponse as any)?.value,
            isRecommendedFormState?.isRecommended?.value
          );
        });
      })
    );

    this.reviewDecisionFacade.isAssessorFormEditable$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(isAssessorFormEditable => {
      this.isAssessorFormEditable = isAssessorFormEditable;
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const isRecommended = this.form.controls['isRecommended'].value.value;
      // this.auditRecommendationsApiResponse$.pipe(take(1)).subscribe(data => {

      //   if (isSuccess(data)) {
      //     const {auditRecId, comments, complianceConcerns, technicalPerformanceConcerns } = data.value;
      //     if (auditRecId && comments && complianceConcerns && technicalPerformanceConcerns) {

      //     }
      //   }
      // })

      const navigationUrl = isRecommended
      ? `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.reasonsForAudit}`
      : `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.confirmYourAnswers}`;


      this.store.dispatch(
        SharedActions.navigateTo({
          url: navigationUrl,
        })
      );
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  private patchFormWithStoredValues(auditRecommendationsApiResponse: ReplyAuditRec, isRecommended: boolean) {
    const isRecommendedValue = isRecommended !== null && isRecommended !== undefined ? isRecommended : auditRecommendationsApiResponse?.isRecommended;
    const selectedOption = this.options.find(option => option.value === isRecommendedValue);

    this.form.patchValue(
      {
        isRecommended: selectedOption,
      },
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.isComponentAlive = false;
  }
}
