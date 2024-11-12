import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { Subscription, map } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormStateSyncDirective } from '@shared/directives/form-state-sync.directive';
import { selectSubmissionFormId } from '@shared/store';
import { AssessorActions } from '../../../store/assessor.actions';
import { AssessorProvideAssessmentDecisionFormState, ProvideAssessmentDecisionFormState } from '../provide-assessment-decision.config';
import { provideAssessmentDecisionReadyForCertificationWebCopy } from '../../../config/assessor-web-copy.config';

@Component({
  selector: 'app-assessor-provide-assessment-decision-ready-for-certification',
  standalone: true,
  templateUrl: './assessor-provide-assessment-decision-ready-for-certification.component.html',
  imports: [
    RouterModule,
    GovukRadioInputComponent,
    GovukTextareaInputComponent,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    DynamicFormErrorsSummaryComponent,

    FormErrorDirective,
    FormStateSyncDirective,
  ],
})
export class AssessorProvideAssessmentDecisionReadyForCertificationComponent implements OnInit, OnDestroy {
  backButton$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`;
    })
  );
  formUpdated = false;

  options = [
    {
      label: 'Yes - certify this scheme',
      value: true,
      inputConfig: {
        type: 'date',
        controlName: 'dateOfCertification',
        label: 'What is the date of certification?',
        currentDate: true,
        validationMessages: {
          required: 'Date of certification cannot be null',
          // invalidDate: 'Date is invalid'
        },
      },
    },
    {
      label: 'No - return to first assessor',
      value: false,
      inputConfig: {
        type: 'textarea',
        controlName: 'commentsForFirstAssessor',
        label: 'Your comments to the first assessor',
        description: 'The Responsible Person will not be able to see this',
        maxChars: 2000,
        validationMessages: {
          required: 'Comments cannot be empty',
        },
      },
    },
  ];

  validationMessages = {
    isReadyForCertification: {
      required: 'Select if the scheme is ready for certification',
    },
    dateOfCertification: {
      required: 'Date of certification cannot be empty',
      invalidDate: 'Date is invalid'
    },
    commentsForFirstAssessor: {
      required: 'Comments cannot be empty',
    },
  };

  reviewScreenName: string = '';

  copy = provideAssessmentDecisionReadyForCertificationWebCopy;

  private subscriptions = new Subscription();

  form: FormGroup = this.fb.group({
    isReadyForCertification: [null, [Validators.required]],
    dateOfCertification: [null, []],
    commentsForFirstAssessor: [null, []],
  });

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  ngOnInit() {
    this.monitorInnerTextInputValidation();
    this.reviewScreenName = AssessorProvideAssessmentDecisionFormState.AssessorProvideAssessmentDecisionForm;
  }

  onSubmit() {
    if (this.form.valid) {
      const payload: ProvideAssessmentDecisionFormState = {
        dateOfCertification: this.form.controls.dateOfCertification.value,
        commentsForFirstAssessor: this.form.controls.commentsForFirstAssessor.value,
      };
      this.store.dispatch(AssessorActions.AssessorProvideAssessmentDecisionActions.submitProvideAssessmentDecision({ payload }));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  private monitorInnerTextInputValidation() {
    this.subscriptions.add(
      this.form.get('isReadyForCertification')?.valueChanges.subscribe(isReadyForCertification => {
        const commentsForFirstAssessor = this.form.get('commentsForFirstAssessor');
        const dateOfCertification = this.form.get('dateOfCertification');

        if (isReadyForCertification.value === true) {
          commentsForFirstAssessor?.setValue(null);
          commentsForFirstAssessor?.clearValidators();
        } else {
          commentsForFirstAssessor?.setValidators([Validators.required]);

          dateOfCertification?.setValue(null);
          dateOfCertification?.clearValidators();
        }
        commentsForFirstAssessor?.updateValueAndValidity();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}
