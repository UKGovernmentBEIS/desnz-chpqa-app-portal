import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { PerfomanceSummaryListComponent } from '@shared/components/perfomance-summary-list/perfomance-summary-list.component';
import { AssessorReviewDecisionFormInfo, AssessorReviewDecisionFormSubmitData } from '@shared/models';
import { NavigationService } from '@shared/services/navigation.service';
import { selectIsSubmissionNonEditable, selectSelectedScheme, SharedFacade } from '@shared/store';
import { combineLatest, first, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { fetchHeatOutputs, setTotalHeatOutputBoilers, setTotalHeatOutputPrimeMovers } from 'src/app/tasks/form-submission/store';
import { isComplex, selectTotalHeatOutputBoilers, selectTotalHeatOutputPrimeMovers } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ReviewDecisionFormComponent } from '../../../../../../features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component';
import { GovukUnitInputComponent } from '../../../../../../shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { selectHeatOutputs, selectHeatOutputsStatus, selectTotalMetricsHeatOutputs, setHeatOutput, submitHeatOutputs } from '../../../store';
import { WEB_COPY_HEAT_OUTPUTS_FORM_CONTROLS } from '../config/heat-outputs.web-copy';
import { FormToReadonlyValuesComponent } from '@shared/components/form-to-readonly-values/form-to-readonly-values.component';

@Component({
  selector: 'app-provide-heat-outputs',
  standalone: true,
  imports: [
    CommonModule,
    DynamicFormErrorsSummaryComponent,
    FormToReadonlyValuesComponent,
    GovukUnitInputComponent,
    PerfomanceSummaryListComponent,
    ReactiveFormsModule,
    ReviewDecisionFormComponent,
    RouterModule,
  ],
  templateUrl: './provide-heat-outputs.component.html',
  styleUrl: './provide-heat-outputs.component.scss',
})
export class ProvideHeatOutputsComponent {
  backButton = `../${FormSubmissionPath.TASK_LIST}`;

  form: FormGroup;
  webCopyFormControls = WEB_COPY_HEAT_OUTPUTS_FORM_CONTROLS;
  formUpdated = false;
  validationMessages = {
    estimatedTotalHeatOutputUsedInthePrimeMovers: {
      required: 'Enter the estimated total heat output used in the prime movers',
      min: 'Value cannot be negative',
      max: 'Value cannot be greater than 100%',
    },
    estimatedTotalHeatOutputUsedIntheBoilers: {
      required: 'Enter the estimated total heat output used in the boilers',
      min: 'Value cannot be negative',
      max: 'Value cannot be greater than 100%',
    },
  };
  fieldOrder = [
    'estimatedTotalHeatOutputUsedInthePrimeMovers',
    'estimatedTotalHeatOutputUsedIntheBoilers'
  ]

  isSubmittedOrInReview: boolean;
  isComponentAlive = true;
  formHeader: string = '';

  areHeatOutputsCompleted$ = this.store.pipe(select(selectHeatOutputsStatus));
  isComplex$ = this.store.pipe(select(isComplex));
  totalMetricsHeatOutputs$ = this.store.select(selectTotalMetricsHeatOutputs);
  selectedScheme$: Observable<ReplyScheme> = this.store.select(selectSelectedScheme);
  heatOutputs$: Observable<void | any[]> = this.store.pipe(
    select(selectHeatOutputs),
    switchMap(heatOutputs => {
      if (!heatOutputs || heatOutputs.length === 0) {
        return of(this.store.dispatch(fetchHeatOutputs()));
      }
      return of(heatOutputs);
    })
  );

  isUserAnAssessor: boolean;
  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: unknown;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder,
    private readonly navigationService: NavigationService,
    private sharedFacade: SharedFacade,
    private cdRef: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      estimatedTotalHeatOutputUsedInthePrimeMovers: [null],
      estimatedTotalHeatOutputUsedIntheBoilers: [null],
    });
  }

  ngOnInit(): void {
    combineLatest([this.store.select(selectTotalHeatOutputPrimeMovers), this.store.select(selectTotalHeatOutputBoilers), this.sharedFacade.isUserAnAssessor()])
      .pipe(first())
      .subscribe(([totalHeatOutputPrimeMovers, totalHeatOutputBoilers, isUserAnAssessor]) => {
        this.form.patchValue({
          estimatedTotalHeatOutputUsedInthePrimeMovers: totalHeatOutputPrimeMovers,
          estimatedTotalHeatOutputUsedIntheBoilers: totalHeatOutputBoilers,
        });
        this.isUserAnAssessor = isUserAnAssessor;
      });

    this.form
      .get('estimatedTotalHeatOutputUsedInthePrimeMovers')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe(changes => {
        this.store.dispatch(
          setTotalHeatOutputPrimeMovers({
            estimatedTotalHeatOutputUsedInthePrimeMovers: changes,
          })
        );
      });

    this.form
      .get('estimatedTotalHeatOutputUsedIntheBoilers')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe(changes => {
        this.store.dispatch(
          setTotalHeatOutputBoilers({
            estimatedTotalHeatOutputUsedIntheBoilers: changes,
          })
        );
      });

    this.isComplex$
      .pipe(
        switchMap(isComplex => {
          const controls = [this.form.get('estimatedTotalHeatOutputUsedInthePrimeMovers'), this.form.get('estimatedTotalHeatOutputUsedIntheBoilers')];

          controls.forEach(control => {
            if (isComplex) {
              control.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
            } else {
              control.clearValidators();
            }
            control.updateValueAndValidity();
          });

          return [];
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();

    this.store
      .select(selectIsSubmissionNonEditable)
      .pipe(take(1))
      .subscribe(nonEditable => {
        this.isSubmittedOrInReview = nonEditable;
      });
    this.setFormHeader();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  handleChange(event: any): void {
    this.store.dispatch(setHeatOutput({ index: event.index, heatOutput: event.value }));
  }

  onSubmit(): void {
    if (this.isSubmittedOrInReview) {
      this.navigationService.navigateToTaskList();
    } else if (this.form.valid) {
      this.store.dispatch(submitHeatOutputs());
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  handleAssessorFormInfo(event: AssessorReviewDecisionFormInfo) {
    this.assessorForm = event?.assessorForm;
    this.assessorFormUpdated = event?.assessorFormUpdated;
    this.assessorFormValidationMessages = event?.assessorFormValidationMessages;

    this.cdRef.detectChanges();
  }

  handleAssessorFormSubmission(event: AssessorReviewDecisionFormSubmitData) {
    this.sharedFacade.handleAssessorFormSubmission(event);
  }

  private setFormHeader(): void {
    if (this.isUserAnAssessor) {
      this.formHeader = 'Review heat outputs';
    } else {
      this.formHeader = 'Provide your heat outputs';
    }
  }
}
