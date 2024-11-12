import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { PerfomanceSummaryListComponent } from '@shared/components/perfomance-summary-list/perfomance-summary-list.component';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { AssessorReviewDecisionFormInfo, AssessorReviewDecisionFormSubmitData } from '@shared/models';
import { DecimalFormatterPipe } from '@shared/pipes/decimal-formatter.pipe';
import { NavigationService } from '@shared/services/navigation.service';
import { selectIsSubmissionNonEditable, selectSelectedScheme, SharedFacade } from '@shared/store';
import { combineLatest, first, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { fetchEnergyInputs, setTotalFuelEnergyBoilers, setTotalFuelEnergyPrimeEngines } from 'src/app/tasks/form-submission/store';
import { isComplex, selectTotalFuelEnergyBoilers, selectTotalFuelEnergyPrimeEngines } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ReviewDecisionFormComponent } from '../../../../../../features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component';
import { GovukUnitInputComponent } from '../../../../../../shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { EnergyInput } from '../../../models/f4-form.model';
import { selectEnergyInputs, selectEnergyInputsStatus, selectTotalEnergyInputs, setEnergyInput, submitEnergyInputs } from '../../../store';
import { FormToReadonlyValuesComponent } from '@shared/components/form-to-readonly-values/form-to-readonly-values.component';
import { WEB_COPY_ENERGY_INPUTS_FORM_CONTROLS } from '../config/energy-inputs.web-copy';

@Component({
  selector: 'app-provide-energy-inputs',
  standalone: true,
  imports: [
    CommonModule,
    DecimalFormatterPipe,
    DynamicFormErrorsSummaryComponent,
    FormToReadonlyValuesComponent,
    GovukUnitInputComponent,
    PerfomanceSummaryListComponent,
    ReactiveFormsModule,
    ReviewAnswersComponent,
    ReviewDecisionFormComponent,
    RouterModule,
  ],
  templateUrl: './provide-energy-inputs.component.html',
  styleUrl: './provide-energy-inputs.component.scss',
})
export class ProvideEnergyInputsComponent {
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  form: FormGroup;
  isSubmittedOrInReview: boolean;
  isComponentAlive = true;

  areEnergyInputsCompleted$ = this.store.pipe(select(selectEnergyInputsStatus));
  isComplex$ = this.store.pipe(select(isComplex));

  webCopyFormControls = WEB_COPY_ENERGY_INPUTS_FORM_CONTROLS;
  formUpdated = false;
  validationMessages = {
    estimatedTotalFuelEnergyPrimeEngines: {
      required: 'Enter the estimated total fuel and energy inputs used in the prime movers',
      min: 'Enter a positive value',
      max: 'Value cannot be greater than 100%',
      percentageError: '',
    },
    estimatedTotalFuelEnergyBoilers: {
      required: 'Enter the estimated total fuel and energy inputs used in the boilers',
      min: 'Enter a positive value',
      max: 'Value cannot be greater than 100%',
      percentageError: '',
    },
  };
  fieldOrder = [
    'estimatedTotalFuelEnergyPrimeEngines',
    'estimatedTotalFuelEnergyBoilers'
  ];

  totalFuelInputs$ = this.store.pipe(select(selectTotalEnergyInputs));
  energyInputs$: Observable<void | EnergyInput[]> = this.store.pipe(
    select(selectEnergyInputs),
    switchMap(energyInputs => {
      if (!energyInputs || energyInputs.length === 0) {
        return of(this.store.dispatch(fetchEnergyInputs()));
      }
      return of(energyInputs);
    })
  );
  selectedScheme$: Observable<ReplyScheme> = this.store.select(selectSelectedScheme);

  isUserAnAssessor: boolean;
  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: unknown;

  formHeader: string = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly navigationService: NavigationService,
    private sharedFacade: SharedFacade,
    private cdRef: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      estimatedTotalFuelEnergyPrimeEngines: [null],
      estimatedTotalFuelEnergyBoilers: [null],
    });
  }

  ngOnInit(): void {
    combineLatest([this.store.select(selectTotalFuelEnergyBoilers), this.store.select(selectTotalFuelEnergyPrimeEngines), this.sharedFacade.isUserAnAssessor()])
      .pipe(first())
      .subscribe(([totalFuelEnergyBoilers, totalFuelEnergyPrimeEngines, isUserAnAssessor]) => {
        this.form.patchValue({
          estimatedTotalFuelEnergyBoilers: totalFuelEnergyBoilers,
          estimatedTotalFuelEnergyPrimeEngines: totalFuelEnergyPrimeEngines,
        });
        this.isUserAnAssessor = isUserAnAssessor;
      });

    this.form
      .get('estimatedTotalFuelEnergyBoilers')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe(changes => {
        this.store.dispatch(
          setTotalFuelEnergyBoilers({
            estimatedTotalFuelEnergyBoilers: changes,
          })
        );
      });

    this.form
      .get('estimatedTotalFuelEnergyPrimeEngines')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe(changes => {
        this.store.dispatch(
          setTotalFuelEnergyPrimeEngines({
            estimatedTotalFuelEnergyPrimeEngines: changes,
          })
        );
      });

    this.isComplex$
      .pipe(
        switchMap(isComplex => {
          const controls = [this.form.get('estimatedTotalFuelEnergyBoilers'), this.form.get('estimatedTotalFuelEnergyPrimeEngines')];

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
    this.store.dispatch(setEnergyInput({ index: event.index, energyInput: event.value }));
  }

  submit(): void {
    if (this.isSubmittedOrInReview) {
      this.navigationService.navigateToTaskList();
    } else if (this.form.valid) {
      this.store.dispatch(submitEnergyInputs());
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
      this.formHeader = 'Review energy inputs';
    } else {
      this.formHeader = 'Provide your energy inputs';
    }
  }
}
