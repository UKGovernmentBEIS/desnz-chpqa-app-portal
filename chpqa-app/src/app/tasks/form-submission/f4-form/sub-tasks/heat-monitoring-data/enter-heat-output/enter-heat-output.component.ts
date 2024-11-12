import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectHeatOutput, updateHeatOutputs } from '../../../store';
import { combineLatest, first, map, take, tap } from 'rxjs';
import { resetHeats } from 'src/app/tasks/form-submission/store';
import { Months } from '@shared/enums/months.enum';
import { GovukMonthlyInputComponent } from '../../../../../../shared/components/form-controls/govuk-monthly-input/govuk-monthly-input.component';
import { isComplex } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReviewPerfomanceSummaryComponent } from '@shared/components/review-perfomance-summary/review-perfomance-summary.component';
import { PerformanceSummary } from '@shared/models/summary-lists';
import { selectIsSubmissionNonEditable } from '@shared/store';
import { mapPerformanceSummary } from '../../../utils/f4-form.utils';

@Component({
  selector: 'app-enter-heat-output',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukUnitInputComponent,
    GovukRadioInputComponent,
    GovukMonthlyInputComponent,
    DynamicFormErrorsSummaryComponent,
    ReviewPerfomanceSummaryComponent,
  ],
  templateUrl: './enter-heat-output.component.html',
  styleUrl: './enter-heat-output.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterHeatOutputComponent {
  backButton = '../../' + FormSubmissionPath.PROVIDE_HEAT_OUTPUTS;
  id: number;
  isComplex$ = this.store.pipe(select(isComplex));
  heatOutputTag$ = this.store.select(selectHeatOutput).pipe(map(res => res.tag));
  form: FormGroup;
  heatTypes: any[] = [
    { id: '0', name: 'Supplied to site' },
    { id: '1', name: 'Exported' },
  ];
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];
  heatOutputMonths: { [key in Months]?: number } = {};

  formUpdated = false;
  validationMessages = {
    type: {
      required: 'Select heat type',
    },
    includeInCalculations: {
      required: 'Select yes if the meter will be included in CHPQA calculations',
    },
    annualTotal: {
      required: 'Enter annual total of heat outputs',
      min: 'Enter a positive value',
    },
    months: {
      month: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      january: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      february: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      march: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      april: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      may: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      june: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      july: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      august: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      september: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      october: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      november: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
      december: {
        required: 'Enter heat outputs for the month',
        min: 'Enter a positive value',
      },
    },
  };

  isSubmittedOrInReview: boolean;
  isComponentAlive = true;
  perfomanceSummary: PerformanceSummary;

  heatOutputData$ = combineLatest([this.store.select(selectHeatOutput), this.isComplex$]);

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null, [Validators.required]],
      type: [null, [Validators.required]],
      includeInCalculations: [null, [Validators.required]],
      annualTotal: [null],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(resetHeats());
    this.store
      .select(selectIsSubmissionNonEditable)
      .pipe(take(1))
      .subscribe(nonEditable => {
        this.isSubmittedOrInReview = nonEditable;
      });

    this.heatOutputData$.pipe(first()).subscribe(([heatOutput, isComplex]) => {
      if (isComplex) {
        this.heatOutputMonths = heatOutput.months;
      }

      const selectedOption = this.options.find(option => option.value === heatOutput.includeInCalculations.value);
      this.form.patchValue({
        id: heatOutput.id,
        type: heatOutput.type,
        includeInCalculations: selectedOption,
        annualTotal: heatOutput.annualTotal,
      });
      if (this.isSubmittedOrInReview) {
        this.perfomanceSummary = mapPerformanceSummary(
          heatOutput.tag,
          heatOutput.serialNumber,
          heatOutput.category.name,
          heatOutput.type.name,
          heatOutput.includeInCalculations.value as boolean,
          heatOutput.annualTotal,
          this.backButton
        );
      }
    });

    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
    });

    this.isComplex$.pipe(tap(isComplex => this.updateAnnualTotalValidators(isComplex))).subscribe();
  }

  navigateBack() {
    this.router.navigate([this.backButton], {
      relativeTo: this.route,
    });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        updateHeatOutputs({
          payload: { index: this.id, heatOutput: this.form.getRawValue() },
        })
      );
      this.navigateBack();
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  private updateAnnualTotalValidators(isComplex: boolean): void {
    if (isComplex) {
      this.form.controls.annualTotal.clearValidators();
    } else {
      this.form.controls.annualTotal.setValidators([Validators.required, Validators.min(0)]);
    }
    this.form.controls.annualTotal.updateValueAndValidity();
  }
}
