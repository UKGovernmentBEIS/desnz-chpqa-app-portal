import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormStateSyncDirective } from '@shared/directives/form-state-sync.directive';
import { AssessorReviewDecisionForm, AssessorReviewDecisionFormInfo, AssessorReviewDecisionFormSubmitData } from '@shared/models';
import { combineLatest, map, Subscription, switchMap, take, takeWhile } from 'rxjs';
import { ReviewDecisionFormWebCopy } from '../../config/review-decision-form-web-copy.config';
import { ReviewDecisionFacade } from '../../store/review-decision.facade';
import { isSuccess } from 'ngx-remotedata';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReviewDecisionService } from '../../services/review-decision.service';
import { FormBuilderFactory } from '../../models/form-builder-factory.model';
import { ReviewDecisionFormType } from '../../enums/review-decision-form-type.enum';
import { select, Store } from '@ngrx/store';
import { UserType } from '@shared/enums/user-type.enum';
import { selectUser } from 'src/app/auth/auth.selector';
import { AssessorDashboardSelectors } from 'src/app/features/assessor/store/assessor.selectors';

@Component({
  selector: 'app-review-decision-form',
  standalone: true,
  imports: [
    FormErrorDirective,
    FormStateSyncDirective,
    GovukRadioInputComponent,
    GovukTextareaInputComponent,
    DynamicFormErrorsSummaryComponent,
    ReactiveFormsModule,
  ],
  providers: [ReviewDecisionService, ReviewDecisionFacade],
  templateUrl: './review-decision-form.component.html',
  styleUrls: ['./review-decision-form.component.scss'],
})
export class ReviewDecisionFormComponent implements OnInit, OnDestroy {
  @Output() formInfo = new EventEmitter<AssessorReviewDecisionFormInfo>();
  @Output() formSubmitted = new EventEmitter<AssessorReviewDecisionFormSubmitData>();

  reviewDecisionFormWebCopy = ReviewDecisionFormWebCopy;
  LIGHTWEIGHT_FORM = ReviewDecisionFormType.Lightweight;
  NORMAL_FORM = ReviewDecisionFormType.Normal;

  form!: FormGroup;
  formType: ReviewDecisionFormType;
  formUpdated = false;
  isDisabledForAssessorAdmin = true;

  options = [
    { label: 'Approved', value: 0 },
    {
      label: 'Return for changes or raise query',
      value: 1,
      inputConfig: {
        type: 'textarea',
        controlName: 'changeNeededComment',
        label: 'Your requested changes or questions',
        description: 'This will be communicated to the Responsible Person',
        maxChars: 200,
        validationMessages: {
          required: 'Enter your changes or questions about the RP or site contact',
        },
      },
    },
    { label: 'Rejected', value: 2 },
  ];

  validationMessages = {
    assessmentOutcome: {
      required: 'Select approved if the form meets your requirements', //TODO Maybe this text needs to change here
    },
    changeNeededComment: {
      required: 'Enter your changes or questions about the RP or site contact',
    },
  };

  reviewScreenName: string = '';
  canLoadPage: boolean = false;

  isAssessorFormEditable = false;

  private isComponentAlive = true;
  private subscriptions = new Subscription();

  private reviewDecisionApiResponse$ = this.reviewDecisionFacade.apiGetAssessorsAssessmentGet$;

  constructor(
    private reviewDecisionService: ReviewDecisionService,
    private reviewDecisionFacade: ReviewDecisionFacade,
    private route: ActivatedRoute,
    private store: Store
  ) {
    this.reviewDecisionFacade.loadReviewDecision();
  }

  ngOnInit() {
    this.route.url.pipe(
      takeWhile(() => this.isComponentAlive),
      switchMap(urlSegments => {
        this.reviewScreenName = urlSegments[urlSegments.length - 1]?.path;

        return combineLatest([
          this.reviewDecisionFacade.loadSelectedSubmissionGroup(),
          this.reviewDecisionApiResponse$,
          this.reviewDecisionFacade.loadReviewDecisionFormInputsFor(this.reviewScreenName).pipe(take(1))
        ])
      })
    ).subscribe(([submissionGroup, reviewDecisionApiResponse, reviewDecisionFormInputs]) => {
      this.formType = this.reviewDecisionService.getFormType(submissionGroup);
      const formBuilder = this.reviewDecisionService.getFormBuilder(this.formType);
      this.buildForm(formBuilder);

      if (isSuccess(reviewDecisionApiResponse)) {
        formBuilder.prefillFormWithStoredValues(
          this.form, this.options, reviewDecisionApiResponse, reviewDecisionFormInputs
        );

        this.canLoadPage = true;
      }
    });

    this.reviewDecisionFacade.isAssessorFormEditable$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(isAssessorFormEditable => {
      this.isAssessorFormEditable = isAssessorFormEditable;
    });

    combineLatest([
      this.store.pipe(select(AssessorDashboardSelectors.selectAssessorSelectedScheme)),
      this.store.pipe(select(selectUser))
    ]).pipe(
      takeWhile(() => this.isComponentAlive)
    ).subscribe(([selectedScheme, user]) => {
      const isCurrentUserAnActiveAssessor = selectedScheme?.secondAssessor.firstName === user.firstName && selectedScheme?.secondAssessor.lastName === user.lastName;
      if (user?.userType === UserType.AssessorAdmin && isCurrentUserAnActiveAssessor) {
        this.isDisabledForAssessorAdmin = false;
      } else {
        this.isDisabledForAssessorAdmin = true;
      }
    })
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmitted.emit({
        formValue: this.form.value as AssessorReviewDecisionForm,
        reviewScreenName: this.reviewScreenName,
      });
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;

      this.formInfo.emit({
        assessorForm: this.form,
        assessorFormUpdated: this.formUpdated,
        assessorFormValidationMessages: this.validationMessages,
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.isComponentAlive = false;
  }

  private buildForm(formBuilder: FormBuilderFactory) {
    this.form = formBuilder.buildReviewDecisionForm();
    this.options = formBuilder.buildRadioButtonOptions();
    this.validationMessages = formBuilder.buildFormValidationMessages();

    if (this.formType === ReviewDecisionFormType.Normal) {
      this.monitorInnerTextInputValidation();
    }

    this.formInfo.emit({
      assessorForm: this.form,
      assessorFormUpdated: this.formUpdated,
      assessorFormValidationMessages: this.validationMessages,
    });
  }

  private monitorInnerTextInputValidation() {
    this.subscriptions.add(
      this.form.get('assessmentOutcome')?.valueChanges.subscribe(assessmentOutcome => {
        const additionalCommentsControl = this.form.get('changeNeededComment');

        if (assessmentOutcome?.value === 1) {  //option with additional comments
          additionalCommentsControl?.setValidators([Validators.required]);
        } else {
          additionalCommentsControl?.setValue(null);
          additionalCommentsControl?.clearValidators();
        }

        additionalCommentsControl?.updateValueAndValidity();
      })
    );
  }
}
